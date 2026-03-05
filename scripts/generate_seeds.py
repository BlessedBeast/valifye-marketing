import os
import json
import time
import random
from typing import List, Dict

from dotenv import load_dotenv
from supabase import create_client
from google import genai
from google.genai import types

load_dotenv()

# --- SETUP ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY):
    raise RuntimeError("Missing environment variables.")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Using the modern 2026 Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Correct 2026 Model Identifiers
# We use 'gemini-2.0-flash' as it is the current mass-production standard for seeds.
# If you insist on Pro, change to 'gemini-1.5-pro', but Flash is 10x faster for seeding.
MODEL_ID = "gemini-2.5-pro" 

# Search Tool Configuration
SEARCH_TOOL = types.Tool(google_search=types.GoogleSearch())

CURRENCY_MAP = {
    "India": "INR", "United States": "USD", "United Kingdom": "GBP",
    "Germany": "EUR", "Canada": "CAD", "France": "EUR"
}

ARCHETYPES = [
    "Logistics & Cold-Chain Efficiency (Hard Assets)",
    "Vertical SaaS for Local Industry (Software)",
    "Climate-Tech & Circular Economy (ESG)",
    "Bio-Tech & Health-SaaS (Regulated)"
]

CITIES = [
    {"city": "Mumbai", "region": "India"},
    {"city": "Bangalore", "region": "India"},
    {"city": "London", "region": "United Kingdom"}
]

def build_prompt(city: str, region: str, archetype: str, currency: str) -> str:
    return f"""
Generate a JSON object with 7 specific business niches for {city}, {region}.
Archetype: {archetype}
Use live 2025-2026 data (rent, local laws, infra). 

Format:
{{
  "seeds": [
    {{
      "niche": "Name",
      "archetype": "{archetype}",
      "city_intel": "3 sentences with one 2025 fact.",
      "expert_guide_text": "100-word strategy.",
      "global_anchor_json": {{
        "unit_price": 0, "monthly_volume": 0, "gross_margin_pct": 0, "fixed_costs_monthly": 0,
        "notes": "Cost in {currency}"
      }}
    }}
  ]
}}
"""

def call_gemini(prompt: str) -> Dict:
    try:
        # The new SDK handles versioning and 'tools' automatically
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[SEARCH_TOOL],
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        if not response.text: return {}
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ API Error: {e}")
        return {}

def run():
    for idx, c in enumerate(CITIES, start=1):
        city, region = c["city"], c["region"]
        currency = CURRENCY_MAP.get(region, "USD")
        print(f"\n--- {idx}. {city} ---")
        
        archetype = random.choice(ARCHETYPES)
        print(f"🔎 Seeding: {archetype}")
        
        data = call_gemini(build_prompt(city, region, archetype, currency))
        seeds = data.get("seeds", [])
        
        for s in seeds:
            try:
                supabase.table("content_plan").upsert({
                    "niche": s.get("niche"),
                    "city": city,
                    "region": region,
                    "archetype": s.get("archetype"),
                    "city_intel": s.get("city_intel"),
                    "expert_guide_text": s.get("expert_guide_text"),
                    "global_anchor_json": s.get("global_anchor_json"),
                    "is_generated": False
                }, on_conflict="city,niche").execute()
                print(f"✅ Upserted: {s.get('niche')}")
            except Exception as se:
                print(f"❌ Supabase Error: {se}")
        
        time.sleep(10) # Safety throttle

if __name__ == "__main__":
    run()