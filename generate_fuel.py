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

# 2026 TOP NICHES WITH ANCHORS
NICHES = {
    "AI Automation Agency": "Avg retainer: $1,200/mo per SMB; 5% market penetration.",
    "MedSpa": "Avg spend: $450/visit; 1.5 visits/year for 15% of affluent pop.",
    "Vertical SaaS for HVAC": "Subscription: $150/mo; 10% of local HVAC businesses.",
    "Mobile EV Detailing": "Avg detail: $350; 2x/year for 5% of registered EVs.",
    "Short-Term Rental Mgmt": "20% fee on $4,500/mo avg revenue per unit."
}

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
    "Minneapolis, MN", "Tulsa, OK", "Bakersfield, CA", "Wichita, KS", "Arlington, TX"
] # Note: I have 50 here for your next run. Add 50 more to hit 100.

def get_market_data(niche, city, anchor):
    prompt = f"""
Analyze the '{niche}' market in '{city}' for 2026. 
ECONOMIC ANCHOR: {anchor}

INSTRUCTIONS:
- CALCULATE the estimated_tam by multiplying the Anchor values against the {city} population/SMB density. 
- REVENUE POTENTIAL: Provide 3 values (Low, Mid, High) in thousands (e.g., {{"low": 50, "mid": 120, "high": 250}}).
- COMPLAINTS: Must mention a specific {city} local problem (e.g., 'Traffic on I-35', 'Miami salt-air corrosion', 'Denver altitude battery drain').

Return EXACT JSON:
1. estimated_tam: (e.g., '$45.2 Million')
2. local_competitors: (Integer)
3. top_complaints: (Array of 3 specific strings)
4. market_narrative: (2 sentences mentioning a local 2026 landmark)
5. market_heat: (Hot, Warm, Cool)
6. faq_outlook: (Expert verdict)
7. opportunity_score: (Integer 0-100)
8. difficulty_score: (Integer 0-100)
9. revenue_potential: {{ "low": int, "mid": int, "high": int }}
"""
    
    # SWITCHED TO gemini-2.5-flash-lite for the 1,000 RPD free quota
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
                # 2026 Anti-Throttle: If blocked, wait longer
                wait_time = (attempt + 1) * 45 
                print(f"😴 Quota hit. Cool-off for {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"⚠️ API Error on {city}: {e}")
                return None
    return None

def main():
    print("🚀 Valifye Engine: Using 2026 'Flash-Lite' Stability Patch...")
    
    total_saved = 0
    for niche, anchor in NICHES.items():
        for city in CITIES:
            print(f"🔎 Analyzing: {niche} in {city}...")
            data = get_market_data(niche, city, anchor)
            
            if data:
                try:
                    raw_complaints = data.get('top_complaints')
                    top_complaints = [str(c) for c in raw_complaints] if isinstance(raw_complaints, list) else []

                    supabase.table("market_data").upsert({
                        "niche": niche,
                        "city": city,
                        "estimated_tam": str(data.get('estimated_tam')),
                        "local_competitors": int(data.get('local_competitors', 0)),
                        "top_complaints": top_complaints,
                        "market_narrative": data.get('market_narrative'),
                        "market_heat": data.get('market_heat'),
                        "confidence": data.get('confidence', 'medium'),
                        "faq_outlook": data.get('faq_outlook'),
                        "status": "draft",
                        "data_source": "Gemini-2.5-Flash-Lite-2026"
                    }, on_conflict="niche,city").execute()
                    
                    total_saved += 1
                    print(f"✅ Saved ({total_saved}/50): {niche} in {city}")
                except Exception as db_error:
                    print(f"❌ DB Error: {db_error}")
            
            # Increased to 8 seconds for new 2026 Free Tier safety
            time.sleep(8) 

if __name__ == "__main__":
    main()