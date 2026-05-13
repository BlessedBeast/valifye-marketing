"""
Zero-shot synthetic engine: build `local_business_blueprints` for a fixed 50-page
US grid (TARGET_CITIES × TARGET_NICHES) using Gemini only — no `market_intelligence`
or `market_benchmarks` reads. Rows are upserted to Supabase.

Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY in .env
"""

from __future__ import annotations

import json
import os
import re
import time
from typing import Any

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODEL_NAME = "gemini-2.5-flash"

TARGET_CITIES = [
    "USA-TX-AUSTIN",
    "USA-FL-MIAMI",
    "USA-CO-DENVER",
    "USA-UT-PROVO",
    "USA-AZ-SCOTTSDALE",
    "USA-TN-NASHVILLE",
    "USA-NC-RALEIGH",
    "USA-GA-ATLANTA",
    "USA-NV-LAS-VEGAS",
    "USA-OH-COLUMBUS",
]

TARGET_NICHES = [
    {"sector": "health_wellness", "model": "longevity_center_biohacking_lab"},
    {"sector": "real_estate_services", "model": "modular_adu_builder_consultancy"},
    {"sector": "health_wellness", "model": "medical_weight_loss_aesthetic_spa"},
    {"sector": "home_services", "model": "commercial_hvac_refrigeration_dispatch"},
    {"sector": "services", "model": "automated_express_car_wash_hub"}
]


# --- Pydantic: matches JSONB shape on `local_business_blueprints` ------------


class ExecutiveVerdict(BaseModel):
    score: int = Field(..., ge=0, le=100)
    label: str
    narrative: str


class FinancialReality(BaseModel):
    capex_estimate: str
    breakeven_utilization: str
    narrative: str


class LocalFriction(BaseModel):
    labor_warning: str
    tax_advantage: str
    aggregator_threat: str


class RiskFactorItem(BaseModel):
    label: str
    description: str


class BlueprintSchema(BaseModel):
    """Exact JSONB bundle written to `local_business_blueprints` content columns."""

    executive_verdict: ExecutiveVerdict
    financial_reality: FinancialReality
    local_friction: LocalFriction
    survival_checklist: list[str]
    risk_factors: list[RiskFactorItem]
    aeo_summary: str = Field(
        ...,
        description="≤50 words, declarative, AEO/GEO/SearchGPT-quotable; no invented facts.",
    )


# --- Helpers -----------------------------------------------------------------


def slugify_part(value: str) -> str:
    s = (value or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "unknown"


def build_slug(region_key: str, sector: str, business_model: str) -> str:
    """Slug strategy: {region_key}-{sector}-{business_model} (normalized)."""
    return f"{slugify_part(region_key)}-{slugify_part(sector)}-{slugify_part(business_model)}"


def meta_from_blueprint(
    region_key: str,
    business_model: str,
    verdict: ExecutiveVerdict,
) -> tuple[str, str]:
    region_label = region_key.replace("-", ", ")
    title = f"{business_model} viability in {region_label} | Valifye"
    desc = (
        f"{verdict.label} ({verdict.score}/100): {verdict.narrative[:220]}"
        + ("…" if len(verdict.narrative) > 220 else "")
    )
    if len(desc) > 320:
        desc = desc[:317] + "…"
    return title, desc


# --- Gemini (zero-shot synthetic) --------------------------------------------


def synthesize_blueprint(
    region_key: str, sector: str, business_model: str
) -> BlueprintSchema | None:
    prompt = f"""You are the Lead Forensic Business Auditor for Valifye.

TARGET MARKET: {region_key}
BUSINESS MODEL: {business_model} (Sector: {sector})

Your task is to generate a 'Thick', highly realistic market blueprint ENTIRELY from your internal knowledge. You must act as if you have access to real-time unit economics and local regulatory intelligence.

RULES FOR SYNTHESIS:
1. **Financial Reality**: Estimate realistic Capex and Breakeven Utilization for this specific business model in the US. Do not use generic numbers; a Med Spa costs vastly more than a Coffee Roaster.
2. **Local Friction**: You MUST incorporate knowledge of the state/city in `{region_key}`. Mention actual state tax climates (e.g., Texas has no state income tax, but high property tax) and local labor market dynamics.
3. **No Hallucinated Names**: Do not invent fake competitor names. Instead, refer to "established local incumbents" or "franchise density."
4. **AEO Summary**: Exactly one paragraph (<50 words) starting with "The viability of a {business_model} in {region_key} is..." designed for SearchGPT.
5. **Tone**: Brutal, analytical, "Forensic Noir."

Return ONLY valid JSON matching the schema. No conversational text."""

    max_retries = 5
    wait_time = 5

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BlueprintSchema,
                    "temperature": 0.2,
                },
            )
            raw = response.text
            data = json.loads(raw)
            return BlueprintSchema.model_validate(data)

        except Exception as e:
            msg = str(e).lower()
            transient = "503" in str(e) or "overloaded" in msg or "429" in str(e)
            if transient and attempt < max_retries - 1:
                print(
                    f"⚠️  Gemini busy (attempt {attempt + 1}/{max_retries}); "
                    f"sleep {wait_time}s…"
                )
                time.sleep(wait_time)
                wait_time *= 2
            else:
                print(f"❌ Gemini error: {str(e)[:200]}")
                return None

    print("🛑 Exhausted retries for Gemini.")
    return None


# --- Upsert ------------------------------------------------------------------


def upsert_blueprint(
    region_key: str,
    sector: str,
    business_model: str,
    slug: str,
    meta_title: str,
    meta_description: str,
    blueprint: BlueprintSchema,
    *,
    status: str = "published",
) -> None:
    payload: dict[str, Any] = {
        "region_key": region_key,
        "sector": sector,
        "business_model": business_model,
        "slug": slug,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "status": status,
        "executive_verdict": blueprint.executive_verdict.model_dump(),
        "financial_reality": blueprint.financial_reality.model_dump(),
        "local_friction": blueprint.local_friction.model_dump(),
        "survival_checklist": blueprint.survival_checklist,
        "risk_factors": [rf.model_dump() for rf in blueprint.risk_factors],
        "aeo_summary": blueprint.aeo_summary,
    }

    supabase.table("local_business_blueprints").upsert(
        payload,
        on_conflict="region_key,sector,business_model",
    ).execute()


def run_matrix_pipeline(*, sleep_between: float = 3.0) -> None:
    print("=" * 60)
    print("🧭 Zero-Shot Synthetic Engine: Generating 50 Target Pages")
    print("=" * 60)

    ok = 0
    total = len(TARGET_CITIES) * len(TARGET_NICHES)

    for city in TARGET_CITIES:
        for niche in TARGET_NICHES:
            sector = niche["sector"]
            model = niche["model"]
            slug = build_slug(city, sector, model)

            print(f"\n--- Synthesizing: {slug} ---")

            bp = synthesize_blueprint(
                region_key=city, sector=sector, business_model=model
            )
            if not bp:
                continue

            meta_title, meta_description = meta_from_blueprint(
                city, model, bp.executive_verdict
            )

            try:
                upsert_blueprint(
                    region_key=city,
                    sector=sector,
                    business_model=model,
                    slug=slug,
                    meta_title=meta_title,
                    meta_description=meta_description,
                    blueprint=bp,
                )
                ok += 1
                print(f"✅ Upserted {slug}")
            except Exception as e:
                print(f"⚠️ Upsert failed for {slug}: {e}")

            time.sleep(sleep_between)

    print(f"\n🏁 Done. Successful upserts: {ok}/{total}")


if __name__ == "__main__":
    run_matrix_pipeline()
