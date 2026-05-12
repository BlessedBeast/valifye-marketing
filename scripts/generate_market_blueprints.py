"""
Matrix synthesis: build `local_business_blueprints` from the cross-product of
`market_intelligence` region_keys and `market_benchmarks` (sector, business_model)
pairs for a single country (default: USA).

Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY in .env

Intelligence resolution per matrix cell (region_key × sector from benchmarks):
  1) Row matching region_key + specific sector (exact).
  2) Else row matching region_key + sector '_default' only (no fuzzy match).
"""

from __future__ import annotations

import argparse
import datetime
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
CURRENT_YEAR = datetime.datetime.now().year

DEFAULT_SECTOR_FALLBACK = "_default"


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


# --- Grid fetch (Matrix inputs) ----------------------------------------------


def fetch_benchmark_sector_model_pairs(country_code: str) -> list[dict[str, str]]:
    """Unique (sector, business_model) from market_benchmarks for this country."""
    cc = (country_code or "").strip().upper()
    res = (
        supabase.table("market_benchmarks")
        .select("sector, business_model")
        .eq("country_code", cc)
        .execute()
    )
    rows = res.data or []
    seen: set[tuple[str, str]] = set()
    out: list[dict[str, str]] = []
    for r in rows:
        s = str(r.get("sector") or "").strip()
        m = str(r.get("business_model") or r.get("model") or "").strip()
        if not s or not m:
            continue
        key = (s, m)
        if key in seen:
            continue
        seen.add(key)
        out.append({"sector": s, "business_model": m})
    return out


def fetch_region_keys_for_country(country_code: str) -> list[str]:
    """Distinct region_key values from market_intelligence starting with 'USA-'."""
    prefix = f"{(country_code or '').strip().upper()}-"
    res = (
        supabase.table("market_intelligence")
        .select("region_key")
        .like("region_key", f"{prefix}%")
        .execute()
    )
    rows = res.data or []
    keys: set[str] = set()
    for r in rows:
        rk = r.get("region_key")
        if rk and str(rk).strip():
            keys.add(str(rk).strip())
    return sorted(keys)


def fetch_benchmark_row(
    country_code: str, sector: str, business_model: str
) -> dict[str, Any] | None:
    cc = (country_code or "").strip().upper()
    res = (
        supabase.table("market_benchmarks")
        .select("*")
        .eq("country_code", cc)
        .eq("sector", sector)
        .eq("business_model", business_model)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    return rows[0] if rows else None


def fetch_intelligence_row(
    region_key: str, grid_sector: str
) -> tuple[dict[str, Any] | None, str]:
    """
    Prefer region + specific sector; else region + '_default'.
    Returns (row or None, resolution_note).
    """
    rk = str(region_key).strip()

    r1 = (
        supabase.table("market_intelligence")
        .select("*")
        .eq("region_key", rk)
        .eq("sector", grid_sector)
        .limit(1)
        .execute()
    )
    d1 = r1.data or []
    if d1:
        return d1[0], "specific_sector"

    r2 = (
        supabase.table("market_intelligence")
        .select("*")
        .eq("region_key", rk)
        .eq("sector", DEFAULT_SECTOR_FALLBACK)
        .limit(1)
        .execute()
    )
    d2 = r2.data or []
    if d2:
        return d2[0], "sector_default"

    return None, "missing_intelligence"


# --- Gemini (Forensic & grounded) --------------------------------------------


def synthesize_blueprint(
    *,
    region_key: str,
    grid_sector: str,
    business_model: str,
    intelligence_row: dict[str, Any] | None,
    benchmark_row: dict[str, Any] | None,
    intel_source: str,
) -> BlueprintSchema | None:
    intel_payload: dict[str, Any] = {
        "resolution": intel_source,
        "region_key": region_key,
        "grid_sector": grid_sector,
        "business_model": business_model,
        "row": intelligence_row,
    }
    bench_payload: dict[str, Any] = {
        "country_code": str(benchmark_row.get("country_code", "")).strip().upper()
        if benchmark_row
        else None,
        "grid_sector": grid_sector,
        "business_model": business_model,
        "row": benchmark_row,
    }

    intel_json = json.dumps(intel_payload, indent=2, default=str)
    bench_json = json.dumps(bench_payload, indent=2, default=str)

    prompt = f"""You are a **Brutal Forensic Auditor** for {CURRENT_YEAR}. Your reputation is zero hallucinations.

## GROUNDING (NON-NEGOTIABLE)
1. Use **ONLY** facts explicitly present in INPUT A (benchmarks) and INPUT B (intelligence). Treat absent fields as unknown—not as permission to invent.
2. Never fabricate statistics, statutes, competitor names, tax rules, rent, foot traffic, or market sizes.
3. Whenever evidence is missing for a claim, replace fabrication with a **Forensic Research Directive** (e.g. "Verify local Nexus tax treatment for {{sector}} with a CPA licensed in this state" or "Pull county occupancy filings for the trade area before asserting demand").
4. If the benchmark row is null or empty, `financial_reality` and numeric claims must state DATA GAP and give directives—no plausible-sounding fake numbers.
5. `executive_verdict.score` (0–100) must be justified by cues in the JSON; if there is no defensible basis, use **50**, label **"Unverified / data gap"**, and explain in `narrative` with directives.

## AEO / GEO / SEO (Answer-engine optimized)
6. `aeo_summary`: **At most 50 words.** Declarative, third-person or imperative, zero hedging fluff. Written so SearchGPT / AI Overviews can quote it: lead with the verdict-like claim only if grounded; otherwise lead with the data gap + one directive. No markdown, no bullets inside this field.

## INPUT A — BENCHMARK JSON
{bench_json}

## INPUT B — INTELLIGENCE JSON (row may be null)
{intel_json}

## OUTPUT
Return ONLY valid JSON matching the response schema (no markdown, no code fences). Fill every required field."""

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
) -> None:
    payload: dict[str, Any] = {
        "region_key": region_key,
        "sector": sector,
        "business_model": business_model,
        "slug": slug,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "status": "published",
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


def run_matrix_pipeline(
    *,
    country_code: str = "USA",
    max_cells: int = 10,
    sleep_between: float = 2.0,
) -> None:
    cc = country_code.strip().upper()
    print("=" * 60)
    print(f"🧭 Matrix synthesis — country={cc}")
    print("=" * 60)

    pairs = fetch_benchmark_sector_model_pairs(cc)
    region_keys = fetch_region_keys_for_country(cc)

    if not pairs:
        print(f"📭 No (sector, business_model) pairs in market_benchmarks for {cc}.")
        return
    if not region_keys:
        print(f"📭 No market_intelligence rows with region_key like '{cc}-%'.")
        return

    total_cells = len(region_keys) * len(pairs)
    cap = max(1, max_cells)
    print(f"Grid: {len(region_keys)} regions × {len(pairs)} benchmark pairs = {total_cells} cells.")
    print(f"Run cap: {cap} matrix cells (override with --max-cells).")

    ok = 0
    n = 0
    for rk in region_keys:
        for pair in pairs:
            sector = pair["sector"]
            business_model = pair["business_model"]
            n += 1
            if n > cap:
                print(f"\n⏹ Stopped at max_cells={cap}")
                print(f"🏁 Upserts this run: {ok}")
                return

            slug = build_slug(rk, sector, business_model)
            bench = fetch_benchmark_row(cc, sector, business_model)
            intel, intel_src = fetch_intelligence_row(rk, sector)

            print(
                f"\n--- [{n}] {slug} | intel={intel_src} | bench={'yes' if bench else 'no'} ---"
            )

            bp = synthesize_blueprint(
                region_key=rk,
                grid_sector=sector,
                business_model=business_model,
                intelligence_row=intel,
                benchmark_row=bench,
                intel_source=intel_src,
            )
            if not bp:
                continue

            meta_title, meta_description = meta_from_blueprint(
                rk, business_model, bp.executive_verdict
            )

            try:
                upsert_blueprint(
                    region_key=rk,
                    sector=sector,
                    business_model=business_model,
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

    print(f"\n🏁 Done. Successful upserts: {ok}/{n}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Matrix-synthesis blueprints: regions × (sector, business_model) for one country.",
    )
    parser.add_argument(
        "--country",
        type=str,
        default="USA",
        help="Country code to filter benchmarks and region_key prefix (default USA).",
    )
    parser.add_argument(
        "--max-cells",
        type=int,
        default=10,
        help="Max matrix cells to process per run (default 10 for first-run safety).",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=2.0,
        help="Seconds between Gemini/upsert operations (default 2).",
    )
    args = parser.parse_args()
    run_matrix_pipeline(
        country_code=args.country,
        max_cells=args.max_cells,
        sleep_between=args.sleep,
    )
