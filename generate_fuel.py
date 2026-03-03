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

# 2026 GLOBAL ECONOMIC ANCHORS - BATCH 2: HIGH-TICKET
GLOBAL_ANCHORS = {
    "USA": {
        "currency": "USD",
        "Commercial Roof Repair SaaS": "Avg contract: $15,000; 1% annual commercial building turnover.",
        "Legal AI for Personal Injury": "Avg case value: $30,000; 0.5% of pop involved in incidents/year.",
        "Luxury Short-Term Rental Mgmt": "25% mgmt fee on $12,000/mo avg revenue; 2% of local housing stock.",
        "Fractional CFO Services": "Avg retainer: $3,500/mo; 10% of businesses > $2M revenue.",
        "Custom Home EV Charger Installation": "Avg install: $2,800; 15% of homeowners with EVs."
    },
    "INDIA": {
        "currency": "INR",
        "Commercial Roof Repair SaaS": "Avg contract: ₹1,50,000; 0.5% turnover in industrial zones.",
        "Legal AI for Personal Injury": "Avg case value: ₹5,00,000; 0.2% of urban pop involved in claims/year.",
        "Luxury Short-Term Rental Mgmt": "20% fee on ₹1,50,000/mo revenue; 1% of luxury villas.",
        "Fractional CFO Services": "Avg retainer: ₹60,000/mo; 5% of startups/SMEs.",
        "Custom Home EV Charger Installation": "Avg install: ₹45,000; 5% of high-end apartment owners."
    }
}

# --- ACTIVE BATCH SETTINGS ---
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

    LOGIC PROTOCOL 2.0 (BRUTAL & REALISTIC):
    1. Identify {city} 2026 population and total business count.
    2. CALCULATE TAM: [Addressable Units] x [Anchor Pricing] x [Annual Frequency]. 
    3. CALCULATE STARTUP REVENUE: A single startup usually captures 0.1% to 1.5% of the TAM. 
    4. REVENUE POTENTIAL: "Low" should be a realistic Year 1 target (capturing 0.1% of TAM). "High" should be Year 3 at scale (capturing 2% of TAM).
    5. No trillion-dollar TAMs for local niches. Ensure the TAM for {city} is proportionally consistent with its size.

    Return EXACT JSON:
    1. estimated_tam: (e.g., '{currency} 150.4 Million')
    2. local_competitors: (Integer)
    3. top_complaints: (Array of 3 strings. Must mention a specific {city} local problem like 'Traffic on I-35', 'Miami salt-air', etc.)
    4. market_narrative: (2 sentences. Must mention a specific 2026 local landmark.)
    5. market_heat: (Exactly: 'Hot', 'Warm', 'Cool')
    6. faq_outlook: (1-2 sentence expert verdict)
    7. opportunity_score: (Integer 0-100)
    8. difficulty_score: (Integer 0-100)
    9. revenue_potential: {{ "low": int, "mid": int, "high": int }} (Individual startup targets in thousands, NOT TAM)
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
    
    print(f"🚀 Valifye Engine: Starting Batch 2 (High-Ticket) for {CURRENT_REGION}...")

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

                    # Note: We do NOT insert 'slug' here because your DB handles it via Generated Column logic
                    supabase.table("market_data").upsert({
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
                        "data_source": f"Gemini-2026-Industrial-Batch2-{CURRENT_REGION}"
                    }, on_conflict="niche,city").execute()
                    
                    total_saved += 1
                    print(f"✅ SAVED ({total_saved}): {niche} in {city} | Heat: {data.get('market_heat')}")
                except Exception as db_error:
                    print(f"❌ DB Error: {db_error}")
            
            time.sleep(1)

if __name__ == "__main__":
    main()