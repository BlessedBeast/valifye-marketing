import os
import sys
import time
import json
import re
from datetime import datetime, timezone

from google import genai
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# ─── WIRING CHECK ─────────────────────────────────────────────────────────────
url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

if not all([url, key, gemini_key]):
    print("❌ ERROR: Missing .env variables.")
    sys.exit(1)

supabase = create_client(url, key)
client = genai.Client(api_key=gemini_key)

# ─── GOVERNOR SETTINGS ────────────────────────────────────────────────────────
DAILY_LIMIT = 600
BATCH_LIMIT = 200

# ─── ACTIVE BATCH SETTINGS ────────────────────────────────────────────────────
CURRENT_REGION = "USA"
CITIES = [
    "New York City", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Seattle", "Denver", "Nashville", "Miami",
    "Atlanta", "Boston", "Portland", "Las Vegas", "Charlotte",
    "Minneapolis", "Tampa", "Orlando", "Raleigh", "Salt Lake City",
    "Sacramento", "Kansas City", "Pittsburgh", "Cincinnati", "Indianapolis",
    "Columbus", "Louisville", "Memphis", "Oklahoma City", "Albuquerque",
    "Tucson", "Fresno", "Richmond", "Omaha", "Buffalo",
    "Boise", "Spokane", "Des Moines", "Chattanooga", "Knoxville",
    "Greenville", "Madison", "Fort Collins", "Provo", "Huntsville",
]


def parse_tam_to_numeric(tam_str: str) -> int:
    """Converts 'USD 1.01 Billion' or 'INR 420 Million' to a full integer."""
    if not tam_str or not isinstance(tam_str, str):
        return 0
    try:
        match = re.search(r'([\d\.]+)\s*(Million|Billion|Trillion)', tam_str, re.I)
        if not match:
            return 0
        val = float(match.group(1))
        multiplier = match.group(2).lower()
        if 'billion' in multiplier:
            val *= 1_000_000_000
        elif 'million' in multiplier:
            val *= 1_000_000
        elif 'trillion' in multiplier:
            val *= 1_000_000_000_000
        return int(val)
    except Exception:
        return 0


def build_slug(niche: str, city: str) -> str:
    """
    Generate a URL-safe slug from niche + city.
    Rules:
    - lowercase
    - non-alphanumeric characters -> hyphens
    - collapse duplicate hyphens, trim edges
    """
    base = f"{niche} in {city}".lower()
    slug = ''.join(ch if ch.isalnum() else '-' for ch in base)
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug.strip('-')


def get_today_created_count() -> int:
    """Count how many market_data rows were created today (UTC)."""
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        resp = (
            supabase.table("market_data")
            .select("id", count="exact")
            .gte("created_at", today)
            .execute()
        )
        return resp.count or 0
    except Exception as e:
        print(f"⚠️ Could not read today's count: {e}", file=sys.stderr)
        return 0


def get_latest_niches_for_region(region: str) -> list[dict]:
    """
    Fetch the latest 5 niches from niche_metadata for the given region.
    Expects columns: niche, expert_guide_text, global_anchor.
    """
    try:
        resp = (
            supabase.table("niche_metadata")
            .select("niche, expert_guide_text, global_anchor")
            .eq("region", region)
            .order("id", desc=True)
            .limit(5)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        print(f"❌ Failed to fetch niches from niche_metadata: {e}", file=sys.stderr)
        return []


def get_market_data(
    niche: str,
    city: str,
    region: str,
    currency: str,
    expert_guide_text: str,
    global_anchor: dict,
) -> dict | None:
    anchor_json = json.dumps(global_anchor or {}, ensure_ascii=False)

    prompt = f"""
You are a 2026 market analyst for {region}.

EXPERT GUIDE CONTEXT (verbatim from niche_metadata.expert_guide_text):
{expert_guide_text}

GLOBAL ANCHOR JSON (unit price, startup costs, TAM logic):
{anchor_json}

TASK:
- Analyze the '{niche}' business opportunity in '{city}', {region} for 2026.
- Use the expert guide and global anchor to ground your numbers.

LOGIC PROTOCOL (STRICT — DO NOT GUESS BEYOND CONTEXT):
1. Use LOCAL CURRENCY {currency} consistently for reasoning (the output TAM string may include the currency code).
2. Estimate the 2026 TAM for this niche in {city} based on:
   - realistic addressable units in {city},
   - the global_anchor.unit_price,
   - a realistic penetration rate for a single strong operator.
3. Express estimated_tam as text like '{currency} 45.2 Million' or '{currency} 1.8 Billion'.
4. Set revenue_potential.low/mid/high as FULL INTEGERS (no currency symbols, no commas) that represent annual revenue in {currency}.
5. Enforce this hard cap: revenue_potential.high MUST NOT exceed 5% of numeric TAM.

Return ONLY valid JSON in this exact shape:
{{
  "estimated_tam": "{currency} X.X Million",
  "local_competitors": 10,
  "top_complaints": ["complaint 1", "complaint 2", "complaint 3"],
  "market_narrative": "2 sentences with city-specific context.",
  "market_heat": "Hot",
  "faq_outlook": "Expert verdict.",
  "opportunity_score": 80,
  "difficulty_score": 40,
  "trend": "growing",
  "trend_pct": 15,
  "revenue_potential": {{"low": 100000, "mid": 300000, "high": 500000}},
  "avg_revenue_per_unit": 150.0,
  "startup_cost_range": {{"low": 5000, "high": 50000}},
  "breakeven_months": 12,
  "business_shape": "Service"
}}
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            return json.loads(response.text)
        except Exception as e:
            err_msg = str(e).upper()
            if "429" in err_msg or "503" in err_msg or "UNAVAILABLE" in err_msg:
                wait = (attempt + 1) * 60
                print(f" 😴 API Busy/Unavailable. Cooling off for {wait}s...")
                time.sleep(wait)
            else:
                print(f" ⚠️ API error: {e}")
                time.sleep(5)
    return None


def main():
    today_count = get_today_created_count()
    if today_count >= DAILY_LIMIT:
        print(
            f"⏹ Daily governor: {today_count} rows already created today "
            f"(limit {DAILY_LIMIT}). Exiting."
        )
        return

    remaining_today = max(0, DAILY_LIMIT - today_count)
    effective_batch = min(BATCH_LIMIT, remaining_today)
    if effective_batch <= 0:
        print("⏹ No remaining capacity for today. Exiting.")
        return

    # For region-aware currency; extend as needed.
    region_currency = {
        "USA": "USD",
        "INDIA": "INR",
    }
    currency = region_currency.get(CURRENT_REGION, "USD")

    niche_rows = get_latest_niches_for_region(CURRENT_REGION)
    if not niche_rows:
        print(f"❌ No niche_metadata rows found for region {CURRENT_REGION}.")
        return

    total_saved = 0
    for niche_row in niche_rows:
        niche = str(niche_row.get("niche", "")).strip()
        if not niche:
            continue
        expert_text = str(niche_row.get("expert_guide_text", "")).strip()
        global_anchor = niche_row.get("global_anchor") or {}

        print(f"\n📦 Niche: {niche}")
        for city in CITIES:
            if total_saved >= effective_batch:
                break

            # Check for existing data using niche/city match
            existing = (
                supabase.table("market_data")
                .select("id")
                .match({"niche": niche, "city": city})
                .execute()
            )
            if existing.data:
                print(f" ⏩ Skip: {city} (already exists)")
                continue

            print(f" ⚡ Generating: {niche} in {city}...")
            data = get_market_data(niche, city, CURRENT_REGION, currency, expert_text, global_anchor)

            if data:
                try:
                    tam_str = str(data.get("estimated_tam", f"{currency} 0"))
                    tam_numeric = parse_tam_to_numeric(tam_str)
                    max_rev = int(tam_numeric * 0.05) if tam_numeric > 0 else 0

                    rev = data.get("revenue_potential", {}) or {}
                    low = int(rev.get("low", 0) or 0)
                    mid = int(rev.get("mid", 0) or 0)
                    high = int(rev.get("high", 0) or 0)

                    if max_rev > 0:
                        if high > max_rev:
                            high = max_rev
                        if mid > max_rev:
                            mid = max_rev // 2
                        if low > max_rev:
                            low = max_rev // 10

                    revenue_potential = {
                        "low": low,
                        "mid": mid,
                        "high": high,
                    }

                    slug = build_slug(niche, city)

                    row = {
                        "slug": slug,
                        "region": CURRENT_REGION,
                        "niche": niche,
                        "city": city,
                        "estimated_tam": tam_str,
                        "local_competitors": int(data.get("local_competitors", 0)),
                        "top_complaints": data.get("top_complaints", []),
                        "market_narrative": str(data.get("market_narrative", "")),
                        "market_heat": data.get("market_heat", "Warm"),
                        "confidence": "medium",
                        "faq_outlook": str(data.get("faq_outlook", "")),
                        "opportunity_score": int(data.get("opportunity_score", 70)),
                        "difficulty_score": int(data.get("difficulty_score", 50)),
                        "trend": data.get("trend", "stable"),
                        "trend_pct": int(data.get("trend_pct", 0)),
                        "revenue_potential": revenue_potential,
                        "avg_revenue_per_unit": float(data.get("avg_revenue_per_unit", 0)),
                        "startup_cost_range": data.get("startup_cost_range", {}),
                        "breakeven_months": int(data.get("breakeven_months", 12)),
                        "business_shape": data.get("business_shape", "Service"),
                        "status": "draft",
                        "data_source": f"Gemini-2026-Batch3-HighSearch-{CURRENT_REGION}",
                    }

                    supabase.table("market_data").upsert(row, on_conflict="niche,city").execute()
                    total_saved += 1
                    print(f" ✅ Saved ({total_saved}/{effective_batch}): {city}")
                except Exception as db_error:
                    print(f" ❌ DB error: {db_error}")

            time.sleep(1)  # Safety delay

        if total_saved >= effective_batch:
            break

if __name__ == "__main__":
    main()