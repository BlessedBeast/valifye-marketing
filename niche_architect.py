"""
niche_architect.py

Discovers new high-ticket startup niches for a given region (default: INDIA)
using Gemini 2.0 Flash and writes metadata into the Supabase niche_metadata table.

Requirements:
- supabase-py
- google-genai (google-genai / google-genai[vertex] depending on install)
- python-dotenv (for local .env loading)

Environment:
- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
"""

import os
import sys
import json
import time
from typing import List, Dict, Any

from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai


load_dotenv()


# ─── Wiring ─────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or not GEMINI_KEY:
    print("❌ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / GEMINI_API_KEY", file=sys.stderr)
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
client = genai.Client(api_key=GEMINI_KEY)


DEFAULT_REGION = "INDIA"


def get_existing_niches_for_region(region: str) -> List[str]:
    """
    Fetch distinct niches already used for this region.
    We infer region from the data_source column containing the region name
    (e.g., '...-INDIA' in data_source).
    """
    resp = (
        supabase.table("market_data")
        .select("niche, data_source")
        .ilike("data_source", f"%{region.upper()}%")
        .execute()
    )
    rows = resp.data or []
    niches: List[str] = []
    seen = set()
    for row in rows:
        niche = (row or {}).get("niche")
        if isinstance(niche, str):
            niche_clean = niche.strip()
            if niche_clean and niche_clean not in seen:
                seen.add(niche_clean)
                niches.append(niche_clean)
    return niches


def generate_new_niches(region: str, existing_niches: List[str]) -> List[Dict[str, Any]]:
    """
    Ask Gemini 2.0 Flash to propose 5 *new* high-ticket niches for this region.
    The model must return strict JSON with an array of 5 niche objects.
    """
    existing_block = ", ".join(sorted(existing_niches)) if existing_niches else "none yet"

    prompt = f"""
You are a 2026 startup economist for {region}.

TASK:
- Propose 5 new, high-ticket, high-intent startup niches that are NOT in this list of existing niches:
  {existing_block}
- These ideas will be validated as full market_data rows later, so they must be specific (e.g. 'Vertical SaaS for Logistics Brokers in Mumbai', not 'SaaS platform').

CONSTRAINTS:
- Region: {region}
- Year: 2026
- Use 2026-specific Indian macro context: manufacturing push, infrastructure (e.g. Gati Shakti, Dedicated Freight Corridors), ONDC, UPI penetration, and city-specific dynamics.
- Avoid any niche that is obviously a duplicate or trivial wording change of an existing niche.

For EACH of the 5 new niches, return a JSON object with:
- niche: string (the name of the startup niche, region-appropriate)
- expert_guide_text: string (~500 words) — an 'Expert Industry Guide' that covers:
  - Who the ideal founder is
  - Why 2026 is the right timing in {region}
  - GTM motion and buyer psychology
  - Key regulatory or infrastructure constraints specific to {region}
  - 2–3 concrete playbook moves for the first 90 days
- global_anchor: JSON object with:
  - unit_price: integer (typical high-ticket price in local currency)
  - startup_costs: integer (approximate upfront capital in local currency)
  - tam_logic: string explaining Target Units x Price x Penetration assumptions
- business_shape: string — exactly one of: "Service", "SaaS", "E-commerce", "Info"

Return ONLY valid JSON in the following shape:
{{
  "region": "{region}",
  "year": 2026,
  "niches": [
    {{
      "niche": "...",
      "expert_guide_text": "...",
      "global_anchor": {{
        "unit_price": 0,
        "startup_costs": 0,
        "tam_logic": "..."
      }},
      "business_shape": "Service"
    }},
    ...
  ]
}}
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            data = json.loads(response.text)
            niches = data.get("niches") or []
            if not isinstance(niches, list):
                raise ValueError("Response JSON missing 'niches' list")
            return niches
        except Exception as e:
            msg = str(e).upper()
            if "429" in msg or "UNAVAILABLE" in msg or "503" in msg:
                wait = (attempt + 1) * 60
                print(f"😴 Gemini busy, cooling off for {wait}s...", file=sys.stderr)
                time.sleep(wait)
            else:
                print(f"⚠️ Gemini error: {e}", file=sys.stderr)
                time.sleep(5)
    return []


def upsert_niche_metadata(region: str, niches: List[Dict[str, Any]]) -> None:
    """
    Upsert niche metadata into the niche_metadata table.
    Assumes schema like:
      - region (text)
      - niche (text)
      - expert_guide_text (text)
      - global_anchor (jsonb)
      - business_shape (text)
    and a unique constraint on (region, niche).
    """
    if not niches:
        print("⚠️ No niches to upsert; skipping niche_metadata write.")
        return

    for niche_obj in niches:
        niche_name = str(niche_obj.get("niche", "")).strip()
        if not niche_name:
            continue

        expert_text = str(niche_obj.get("expert_guide_text", "")).strip()
        global_anchor = niche_obj.get("global_anchor") or {}
        business_shape = str(niche_obj.get("business_shape", "Service")).strip() or "Service"

        row = {
            "region": region,
            "niche": niche_name,
            "expert_guide_text": expert_text,
            "global_anchor": global_anchor,
            "business_shape": business_shape,
        }

        try:
            supabase.table("niche_metadata").upsert(row, on_conflict="region,niche").execute()
            print(f"✅ Upserted niche metadata for: {region} · {niche_name}")
        except Exception as e:
            print(f"❌ Failed to upsert niche_metadata for {niche_name}: {e}", file=sys.stderr)
        time.sleep(0.5)


def main(region: str = DEFAULT_REGION) -> None:
    print(f"🚀 Niche Architect: Discovering high-ticket niches for {region} (2026)...")

    existing = get_existing_niches_for_region(region)
    print(f"   Found {len(existing)} existing niches for {region}. Ensuring 100% uniqueness.")

    niches = generate_new_niches(region, existing)
    if not niches:
        print("❌ No niches returned from Gemini. Aborting.")
        return

    print(f"   Gemini proposed {len(niches)} niches. Writing to niche_metadata...")
    upsert_niche_metadata(region, niches)
    print("🏁 Niche Architect run complete.")


if __name__ == "__main__":
    main()

