import os
import json
import time
import random
from typing import List, Dict

from dotenv import load_dotenv
from supabase import create_client
from google import genai
from google.genai.types import GenerateContentConfig, GoogleSearch, HttpOptions, Tool


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY):
  raise RuntimeError("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY in environment.")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

client = genai.Client(
  api_key=GEMINI_API_KEY,
  http_options=HttpOptions(api_version="v1"),
)

SEARCH_TOOL = Tool(google_search=GoogleSearch())

# Local currency mapping per region for forensic unit economics
CURRENCY_MAP: Dict[str, str] = {
  "India": "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  "Germany": "EUR",
  "Canada": "CAD",
  "United Arab Emirates": "AED",
  "Singapore": "SGD",
  "Japan": "JPY",
  "Australia": "AUD",
  "France": "EUR",
  "Netherlands": "EUR",
  "Ireland": "EUR",
  "Israel": "ILS",
  "South Korea": "KRW",
  "Mexico": "MXN",
  "Brazil": "BRL",
  "Saudi Arabia": "SAR",
  "Vietnam": "VND",
  "Poland": "PLN",
}


ARCHETYPES: List[str] = [
  "Logistics & Cold-Chain Efficiency (Hard Assets)",
  "Vertical SaaS for Local Industry (Software)",
  "Modernizing Heritage & Craft (E-commerce)",
  "Luxury Services & Concierge (High-Margin)",
  "Climate-Tech & Circular Economy (ESG)",
  "Bio-Tech & Health-SaaS (Regulated)",
  "Ed-Tech & Vocational Training (Labor)",
  "AI-Driven Fintech & Compliance (Financial)",
]

# Top 50 global mix
CITIES: List[Dict[str, str]] = [
  # India
  {"city": "Mumbai", "region": "India"},
  {"city": "Bangalore", "region": "India"},
  {"city": "Delhi", "region": "India"},
  {"city": "Hyderabad", "region": "India"},
  {"city": "Pune", "region": "India"},
  {"city": "Chennai", "region": "India"},
  {"city": "Ahmedabad", "region": "India"},
  {"city": "Kolkata", "region": "India"},
  {"city": "Jaipur", "region": "India"},
  {"city": "Surat", "region": "India"},
  # USA
  {"city": "New York", "region": "United States"},
  {"city": "San Francisco", "region": "United States"},
  {"city": "Austin", "region": "United States"},
  {"city": "Miami", "region": "United States"},
  {"city": "Chicago", "region": "United States"},
  {"city": "Seattle", "region": "United States"},
  {"city": "Nashville", "region": "United States"},
  {"city": "Denver", "region": "United States"},
  {"city": "Atlanta", "region": "United States"},
  {"city": "Boston", "region": "United States"},
  # UK
  {"city": "London", "region": "United Kingdom"},
  {"city": "Manchester", "region": "United Kingdom"},
  {"city": "Birmingham", "region": "United Kingdom"},
  {"city": "Edinburgh", "region": "United Kingdom"},
  {"city": "Glasgow", "region": "United Kingdom"},
  # Germany
  {"city": "Berlin", "region": "Germany"},
  {"city": "Munich", "region": "Germany"},
  {"city": "Hamburg", "region": "Germany"},
  {"city": "Frankfurt", "region": "Germany"},
  {"city": "Stuttgart", "region": "Germany"},
  # Canada
  {"city": "Toronto", "region": "Canada"},
  {"city": "Vancouver", "region": "Canada"},
  {"city": "Montreal", "region": "Canada"},
  {"city": "Calgary", "region": "Canada"},
  {"city": "Ottawa", "region": "Canada"},
  # Others
  {"city": "Dubai", "region": "United Arab Emirates"},
  {"city": "Singapore", "region": "Singapore"},
  {"city": "Tokyo", "region": "Japan"},
  {"city": "Sydney", "region": "Australia"},
  {"city": "Paris", "region": "France"},
  {"city": "Amsterdam", "region": "Netherlands"},
  {"city": "Dublin", "region": "Ireland"},
  {"city": "Tel Aviv", "region": "Israel"},
  {"city": "Seoul", "region": "South Korea"},
  {"city": "Mexico City", "region": "Mexico"},
  {"city": "São Paulo", "region": "Brazil"},
  {"city": "Riyadh", "region": "Saudi Arabia"},
  {"city": "Ho Chi Minh City", "region": "Vietnam"},
  {"city": "Warsaw", "region": "Poland"},
]


def build_prompt(city: str, region: str, archetype: str, currency: str) -> str:
  """
  Prompt for Gemini 2.5 Pro with Google Search grounding.
  Asks for 7 niches and forensic-quality local intel.
  """
  return f"""
Role: 2026 Brutal Niche Seed Generator.
Model: Gemini 1.5 Pro with Google Search grounding.

You are researching business niches for founders in {city}, {region}.
You MUST use live 2024–2026 economic data via Google Search tools:
  - recent tax policy
  - infrastructure projects
  - land / rent rates
  - sector-specific demand or saturation

ARCHETYPE FOCUS: "{archetype}"

Generate EXACTLY 7 unique, non-overlapping niches that fall under this archetype in {city}.
They should be commercially realistic for founders starting between 2024 and 2026, and dense with "Thick Data" instead of vague ideas.

For each niche, you MUST return:
  - niche: short, specific name (e.g., "Cold Chain Routing SaaS for APMC Yards")
  - archetype: repeat the archetype label "{archetype}"
  - city_intel: 3-sentence brutal summary with at least ONE specific {city} fact
    such as a land rate, tax rule, infra project, or ruling by a named regulatory body from 2024–2026.
    You MUST identify at least one specific regulatory or registration authority relevant to the niche and region:
      - For Germany, look for entities like "Handelsregister", "Finanzamt", or relevant Landesbehörde.
      - For the United States, look for entities like "SEC", "FDA", state-level "Secretary of State", or city-specific permitting offices.
      - For India, look for entities like "MCA", "GST Council", "FSSAI", or state/municipal development authorities.
      - For the UK, look for entities like "Companies House", "FCA", or sector regulators.
      - For other regions, cite the most relevant local trade registry, tax authority, or sector regulator by name.
  - expert_guide_text: ~100 words of critical strategy for winning this niche,
    and it MUST mention at least one concrete local entity, neighborhood, zone,
    market, or authority in {city} (e.g., "BKC", "Powai", "BBMP", "TxDOT", "Docklands").
  - global_anchor_json: realistic local unit economics for this niche in {city}, shaped as:
      {{
        "unit_price": 0,                 // MUST be in the local currency for {city}, specifically {currency}
        "monthly_volume": 0,
        "gross_margin_pct": 0,
        "fixed_costs_monthly": 0,        // Also expressed in the same local currency as unit_price ({currency})
        "notes": "1–2 sentence justification tied to local prices or policy, explicitly naming the currency code '{currency}'."
      }}

When estimating unit_price and fixed_costs_monthly you MUST:
- Use {currency} for all monetary values.
- Explicitly justify why these prices are realistic for {city} in {currency} by referencing local 2024–2026 commercial rent indices and labor costs discovered via Google Search tool grounding.

Return ONLY valid JSON (no markdown, no commentary) in this shape:
{{
  "seeds": [
    {{
      "niche": "Exact Name",
      "archetype": "{archetype}",
      "city_intel": "3 sentence brutal summary...",
      "expert_guide_text": "100-word critical strategy...",
      "global_anchor_json": {{
        "unit_price": 0,
        "monthly_volume": 0,
        "gross_margin_pct": 0,
        "fixed_costs_monthly": 0,
        "notes": "..."
      }}
    }}
  ]
}}
""".strip()


def call_gemini_with_search(prompt: str) -> Dict:
  """Call Gemini 2.5 Pro with Google Search tools enabled and parse JSON."""
  try:
    response = client.models.generate_content(
      model="gemini-2.5-pro",
      contents=prompt,
      config=GenerateContentConfig(
        tools=[SEARCH_TOOL],
        temperature=0.6,
      ),
    )
    raw = response.text.strip()
    cleaned = raw.replace("```json", "").replace("```", "")
    return json.loads(cleaned)
  except Exception as e:
    print(f"❌ Gemini error: {e}")
    return {}


def upsert_seed_row(city: str, region: str, seed: Dict) -> None:
  """
  Upsert one niche seed into the content_plan table.
  Assumes content_plan has columns:
    niche, city, region, archetype, city_intel,
    expert_guide_text, global_anchor_json, is_generated
  """
  try:
    supabase.table("content_plan").upsert(
      {
        "niche": seed.get("niche"),
        "city": city,
        "region": region,
        "archetype": seed.get("archetype"),
        "city_intel": seed.get("city_intel"),
        "expert_guide_text": seed.get("expert_guide_text"),
        "global_anchor_json": seed.get("global_anchor_json"),
        "is_generated": False,
      },
      on_conflict="city,niche",
    ).execute()
    print(f"✅ Seed upserted: {seed.get('niche')} in {city}")
  except Exception as e:
    print(f"❌ Supabase error for {city} / {seed.get('niche')}: {e}")


def generate_seeds_for_city(city: str, region: str) -> None:
  """Loop through archetypes for a single city and write seeds to Supabase."""
  print(f"🌍 SEEDS: {city}, {region}")

  # Determine currency with failsafe + logging
  if region in CURRENCY_MAP:
    currency = CURRENCY_MAP[region]
  else:
    currency = "USD"
    print(f"⚠️ No currency mapping found for region '{region}'. Defaulting to USD.")

  print(f"💰 Using Currency: {currency} for {region}")

  try:
    # Pick 2 random archetypes per city to ensure diversity
    chosen_archetypes = random.sample(ARCHETYPES, k=2)

    for archetype in chosen_archetypes:
      print(f"  🔎 Archetype: {archetype}")
      prompt = build_prompt(city, region, archetype, currency)
      data = call_gemini_with_search(prompt)

      seeds = data.get("seeds") or []
      if not seeds:
        print(f"  ⚠️ No seeds returned for {city} / {archetype}")
        continue

      for seed in seeds:
        upsert_seed_row(city, region, seed)

      # Small delay to avoid hammering the API (per archetype)
      time.sleep(5)
  except Exception as e:
    print(f"❌ Error while generating seeds for {city}, {region}: {e}")


def run_batch():
  """Main entrypoint: iterate cities x archetypes and generate seeds."""
  total = len(CITIES)
  for idx, c in enumerate(CITIES, start=1):
    city = c["city"]
    region = c["region"]
    print(f"\n=== City {idx}/{total}: {city}, {region} ===")
    generate_seeds_for_city(city, region)

    # Cool-down every 5 cities to reset Google Search grounding quotas
    if idx % 5 == 0 and idx < total:
      print("⏳ Cool-down: sleeping for 60 seconds to respect Search quota...")
      time.sleep(60)


if __name__ == "__main__":
  run_batch()

