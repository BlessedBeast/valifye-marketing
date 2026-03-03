import os
import time
import json
from google import genai
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Wiring check
url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

if not all([url, key, gemini_key]):
    print("❌ ERROR: Missing .env variables.")
    exit()

supabase = create_client(url, key)
client = genai.Client(api_key=gemini_key)


def make_slug(niche: str, city: str) -> str:
    """
    Generate a URL-safe slug from niche + city.
    Rules:
    - lowercase
    - spaces and punctuation -> hyphens
    - no commas, slashes, or duplicate hyphens
    """
    base = f"{niche} in {city}".lower()
    # Replace non-alphanumeric characters with hyphen
    slug = ''.join(ch if ch.isalnum() else '-' for ch in base)
    # Collapse multiple hyphens and trim
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug.strip('-')

# 2026 GLOBAL ECONOMIC ANCHORS
GLOBAL_ANCHORS = {
    "USA": {
        "currency": "USD",
        "AI Automation Agency": "Avg retainer: $1,500/mo; 5% SMB penetration.",
        "MedSpa": "Avg spend: $450/visit; 1.5 visits/year for 15% of affluent pop.",
        "Vertical SaaS for HVAC": "Subscription: $150/mo; 10% of local HVAC businesses.",
        "Mobile EV Detailing": "Avg detail: $350; 2x/year for 5% of registered EVs.",
        "Solar Panel Installation": "Avg system: $25,000; 2% annual adoption rate."
    },
    "INDIA": {
        "currency": "INR",
        "AI Automation Agency": "Avg retainer: ₹40,000/mo; 3% SMB penetration.",
        "MedSpa": "Avg spend: ₹12,000/visit; 2 visits/year for 5% of high-income pop.",
        "Vertical SaaS for HVAC": "Subscription: ₹3,500/mo; 8% of local MEP contractors.",
        "Mobile EV Detailing": "Avg detail: ₹5,000; 2x/year for 2% of luxury EV owners.",
        "Solar Panel Installation": "Avg system: ₹2,50,000; 1% annual adoption rate."
    }
}

# --- ACTIVE BATCH (Stick to USA for now as requested) ---
CURRENT_REGION = "USA"
CITIES = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", 
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA", 
    "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Indianapolis, IN", 
    "Charlotte, NC", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Oklahoma City, OK", 
    "Nashville, TN", "El Paso, TX", "Washington, DC", "Las Vegas, NV", "Boston, MA", 
    "Portland, OR", "Louisville, KY", "Memphis, TN", "Detroit, MI", "Baltimore, MD", 
    "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA", "Sacramento, CA", 
    "Mesa, AZ", "Kansas City, MO", "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO", 
    "Raleigh, NC", "Long Beach, CA", "Virginia Beach, VA", "Miami, FL", "Oakland, CA", 
    "Minneapolis, MN", "Tulsa, OK", "Bakersfield, CA", "Wichita, KS", "Arlington, TX", 
    "Aurora, CO", "Tampa, FL", "New Orleans, LA", "Cleveland, OH", "Honolulu, HI", 
    "Anaheim, CA", "Lexington, KY", "Stockton, CA", "Corpus Christi, TX", "Henderson, NV", 
    "Riverside, CA", "Newark, NJ", "Saint Paul, MN", "Santa Ana, CA", "Cincinnati, OH", 
    "Irvine, CA", "Orlando, FL", "Pittsburgh, PA", "St. Louis, MO", "Greensboro, NC", 
    "Jersey City, NJ", "Anchorage, AK", "Lincoln, NE", "Plano, TX", "Durham, NC", 
    "Buffalo, NY", "Chandler, AZ", "Chula Vista, CA", "Toledo, OH", "Madison, WI", 
    "Gilbert, AZ", "Reno, NV", "Fort Wayne, IN", "North Las Vegas, NV", "St. Petersburg, FL", 
    "Lubbock, TX", "Irving, TX", "Laredo, TX", "Winston-Salem, NC", "Chesapeake, VA", 
    "Glendale, AZ", "Garland, TX", "Scottsdale, AZ", "Norfolk, VA", "Boise, ID", 
    "Fremont, CA", "Spokane, WA", "Santa Clarita, CA", "Baton Rouge, LA", "Richmond, VA"
]

def get_market_data(niche, city, anchor, currency):
    prompt = f"""
    Analyze the '{niche}' market in '{city}' for 2026. 
    ECONOMIC ANCHOR: {anchor}
    LOCAL CURRENCY: {currency}

    LOGIC PROTOCOL (STRICT -- DO NOT GUESS):
    1. Identify the 2026 population of {city} and the realistic addressable segment.
    2. Use the LOCAL CURRENCY ({currency}) for all financial values. No USD if {currency} is different.
    3. CALCULATE estimated_tam by multiplying Target Units x Anchor Pricing x Penetration (show your reasoning internally before outputting JSON).
    4. Cross-check: Ensure the TAM for {city} is proportionally consistent with its size vs. other US cities. No trillion-dollar TAMs for local niches.

    Return EXACT JSON:
    1. estimated_tam: (e.g., '{currency} 45.2 Million')
    2. local_competitors: (Integer)
    3. top_complaints: (Array of 3 strings. Must mention a local problem like 'Traffic on I-35', 'Miami salt-air', etc.)
    4. market_narrative: (2 sentences. Must mention a specific 2026 local landmark.)
    5. market_heat: (Exactly: 'Hot', 'Warm', 'Cool')
    6. faq_outlook: (1-2 sentence expert verdict)
    7. opportunity_score: (Integer 0-100)
    8. difficulty_score: (Integer 0-100)
    9. revenue_potential: {{ "low": int, "mid": int, "high": int }}
    """
    
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite", 
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            return json.loads(response.text)
        except Exception as e:
            if "429" in str(e):
                wait_time = (attempt + 1) * 45 
                print(f"😴 Quota hit. Cool-off for {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"⚠️ API Error on {city}: {e}")
                return None
    return None

def main():
    anchors = GLOBAL_ANCHORS[CURRENT_REGION]
    currency = anchors["currency"]
    
    print(f"🚀 Valifye Engine: Starting 500-Page Batch for {CURRENT_REGION}...")

    total_saved = 0
    for niche, anchor_text in anchors.items():
        if niche == "currency": continue
        
        for city in CITIES:
            # SKIP CHECK: Don't waste money/quota on data you already have
            existing = supabase.table("market_data").select("id").match({"niche": niche, "city": city}).execute()
            if existing.data:
                print(f"⏩ Skipping {niche} in {city} (Already exists)")
                continue

            print(f"⚡ Analyzing: {niche} in {city}...")
            data = get_market_data(niche, city, anchor_text, currency)
            
            if data:
                try:
                    raw_complaints = data.get('top_complaints')
                    if isinstance(raw_complaints, list):
                        top_complaints = [str(c) for c in raw_complaints]
                    elif isinstance(raw_complaints, str):
                        top_complaints = [raw_complaints]
                    else:
                        top_complaints = []

                    slug = make_slug(niche, city)

                    supabase.table("market_data").upsert({
                        "slug": slug,
                        "niche": niche,
                        "city": city,
                        "estimated_tam": str(data.get('estimated_tam')),
                        "local_competitors": int(data.get('local_competitors', 0)),
                        "top_complaints": top_complaints,
                        "market_narrative": data.get('market_narrative'),
                        "market_heat": data.get('market_heat'),
                        "confidence": "medium",
                        "faq_outlook": data.get('faq_outlook'),
                        "opportunity_score": int(data.get('opportunity_score', 70)),
                        "difficulty_score": int(data.get('difficulty_score', 50)),
                        "revenue_potential": data.get('revenue_potential', {"low": 0, "mid": 0, "high": 0}),
                        "status": "draft",
                        "data_source": f"Gemini-2026-Industrial-{CURRENT_REGION}"
                    }, on_conflict="niche,city").execute()
                    
                    total_saved += 1
                    print(f"✅ SAVED ({total_saved}): {niche} in {city} | TAM: {data.get('estimated_tam')}")
                except Exception as db_error:
                    print(f"❌ DB Error: {db_error}")
            
            # Since you are on Paid Tier, 0.5s is safe, but let's use 1s for 'Thick Data' stability
            time.sleep(1)

if __name__ == "__main__":
    main()