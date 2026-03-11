import os
import sys
import requests
import xml.etree.ElementTree as ET
from typing import Set, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env for local testing
load_dotenv()

SITEMAP_URL = "https://valifye.com/sitemap.xml"


def slugify(value: str) -> str:
  return (
      value.lower()
      .strip()
      .replace(" ", "-")
  )


def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ Missing SUPABASE credentials", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)


def fetch_db_stats(supabase: Client):
    """Fetches stats for all Valifye engines and hubs."""

    # --- ENGINE 1: ORIGINAL BLUEPRINTS (market_data table) ---
    market_resp = supabase.table("market_data").select("slug").eq("status", "published").execute()
    market_slugs = {
        slugify(row["slug"])
        for row in (market_resp.data or [])
        if row.get("slug")
    }

    market_pending = (
        supabase.table("market_data")
        .select("id", count="exact")
        .eq("google_index_status", "pending")
        .execute()
        .count
        or 0
    )

    # --- ENGINE 2: VALIDATION REPORTS (verdict_reports table) ---
    val_resp = supabase.table("verdict_reports").select("slug").eq("is_published", True).execute()
    val_slugs = {
        slugify(row["slug"])
        for row in (val_resp.data or [])
        if row.get("slug")
    }

    val_pending = (
        supabase.table("verdict_reports")
        .select("id", count="exact")
        .eq("is_published", False)
        .execute()
        .count
        or 0
    )

    # --- ENGINE 3: LOCAL MARKET pSEO (public_seo_reports table) ---
    local_resp = supabase.table("public_seo_reports").select("slug").eq("is_published", True).execute()
    local_slugs = {
        slugify(row["slug"])
        for row in (local_resp.data or [])
        if row.get("slug")
    }

    local_pending = (
        supabase.table("public_seo_reports")
        .select("id", count="exact")
        .eq("is_published", False)
        .execute()
        .count
        or 0
    )

    # --- HUB 1: VERDICT INDUSTRY HUBS ---
    industry_resp = supabase.table("verdict_industry_hubs").select("industry_name").execute()
    industry_slugs = {
        slugify(row["industry_name"])
        for row in (industry_resp.data or [])
        if row.get("industry_name")
    }

    # --- HUB 2: LOCAL CITY HUBS ---
    city_resp = supabase.table("local_city_hubs").select("city_name").execute()
    city_slugs = {
        slugify(row["city_name"])
        for row in (city_resp.data or [])
        if row.get("city_name")
    }

    return {
        "market": {"slugs": market_slugs, "pending": market_pending},
        "validation": {"slugs": val_slugs, "pending": val_pending},
        "local_seo": {"slugs": local_slugs, "pending": local_pending},
        "industry_hubs": {"slugs": industry_slugs},
        "city_hubs": {"slugs": city_slugs},
    }


def fetch_sitemap_data() -> Dict[str, Set[str]]:
    """Extracts and categorizes slugs from the live sitemap."""
    try:
        resp = requests.get(SITEMAP_URL, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except Exception as e:
        print(f"❌ Sitemap Fetch Error: {e}", file=sys.stderr)
        return {
            "market": set(),
            "validation": set(),
            "local_seo": set(),
            "industry_hubs": set(),
            "city_hubs": set(),
        }

    ns = root.tag.split("}")[0] + "}" if "}" in root.tag else ""
    market_slugs: Set[str] = set()
    validation_slugs: Set[str] = set()
    local_seo_slugs: Set[str] = set()
    industry_hub_slugs: Set[str] = set()
    city_hub_slugs: Set[str] = set()

    for loc_el in root.findall(f".//{ns}loc"):
        loc = (loc_el.text or "").strip()
        lower_loc = loc.lower()

        # 1. Original Blueprints (/ideas/)
        if "/ideas/" in lower_loc:
            segment = lower_loc.split("/ideas/")[-1].strip("/")
            if segment:
                market_slugs.add(segment)

        # 2. Industry Hubs (/reports/industry/)
        if "/reports/industry/" in lower_loc:
            segment = lower_loc.split("/reports/industry/")[-1].strip("/")
            if segment:
                industry_hub_slugs.add(segment)
            continue

        # 3. Validation Reports (/reports/...)
        if "/reports/" in lower_loc:
            segment = lower_loc.split("/reports/")[-1].strip("/")
            if segment:
                validation_slugs.add(segment)
            continue

        # 4. Local SEO report pages (/local-reports/report/)
        if "/local-reports/report/" in lower_loc:
            segment = lower_loc.split("/local-reports/report/")[-1].strip("/")
            if segment:
                local_seo_slugs.add(segment)
            continue

        # 5. Local city hubs (/local-reports/city/)
        if "/local-reports/city/" in lower_loc:
            segment = lower_loc.split("/local-reports/city/")[-1].strip("/")
            if segment:
                city_hub_slugs.add(segment)

    return {
        "market": market_slugs,
        "validation": validation_slugs,
        "local_seo": local_seo_slugs,
        "industry_hubs": industry_hub_slugs,
        "city_hubs": city_hub_slugs,
    }


def run():
    print("🛡️  Starting Unified Valifye SEO Master Audit (V4.0)...")
    supabase = get_supabase_client()

    db_data = fetch_db_stats(supabase)
    sitemap_data = fetch_sitemap_data()

    # Calculate Orphans (Generated in DB but missing from Sitemap) using normalized slugs
    market_orphans = db_data["market"]["slugs"] - sitemap_data["market"]
    validation_orphans = db_data["validation"]["slugs"] - sitemap_data["validation"]
    local_seo_orphans = db_data["local_seo"]["slugs"] - sitemap_data["local_seo"]
    industry_hub_orphans = db_data["industry_hubs"]["slugs"] - sitemap_data["industry_hubs"]
    city_hub_orphans = db_data["city_hubs"]["slugs"] - sitemap_data["city_hubs"]

    # Per-stream prints (keep pending for engines)
    print("\n--- 📊 ENGINE 1: MARKET BLUEPRINTS (/ideas/) ---")
    print(f"DB Total: {len(db_data['market']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['market'])}")
    print(f"Orphans:  {len(market_orphans)}")
    print(f"Pending:  {db_data['market']['pending']}")

    print("\n--- 📊 ENGINE 2: VALIDATION REPORTS (/reports/) ---")
    print(f"DB Total: {len(db_data['validation']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['validation'])}")
    print(f"Orphans:  {len(validation_orphans)}")
    print(f"Pending:  {db_data['validation']['pending']}")

    print("\n--- 📊 ENGINE 3: LOCAL MARKET pSEO (/local-reports/report/) ---")
    print(f"DB Total: {len(db_data['local_seo']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['local_seo'])}")
    print(f"Orphans:  {len(local_seo_orphans)}")
    print(f"Pending:  {db_data['local_seo']['pending']}")

    print("\n--- 📊 HUB 1: VERDICT INDUSTRY HUBS (/reports/industry/) ---")
    print(f"DB Total: {len(db_data['industry_hubs']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['industry_hubs'])}")
    print(f"Orphans:  {len(industry_hub_orphans)}")

    print("\n--- 📊 HUB 2: LOCAL CITY HUBS (/local-reports/city/) ---")
    print(f"DB Total: {len(db_data['city_hubs']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['city_hubs'])}")
    print(f"Orphans:  {len(city_hub_orphans)}")

    # 5-row summary table
    print("\n--- 📋 STREAM SUMMARY (DB vs Sitemap vs Orphans) ---")
    header = f"{'Stream':<24} {'DB':>8} {'Sitemap':>10} {'Orphans':>10}"
    print(header)
    print("-" * len(header))
    print(
        f"{'Ideas (/ideas/)':<24} "
        f"{len(db_data['market']['slugs']):>8} "
        f"{len(sitemap_data['market']):>10} "
        f"{len(market_orphans):>10}"
    )
    print(
        f"{'Verdict Reports (/reports/)':<24} "
        f"{len(db_data['validation']['slugs']):>8} "
        f"{len(sitemap_data['validation']):>10} "
        f"{len(validation_orphans):>10}"
    )
    print(
        f"{'Local SEO (/local-reports)':<24} "
        f"{len(db_data['local_seo']['slugs']):>8} "
        f"{len(sitemap_data['local_seo']):>10} "
        f"{len(local_seo_orphans):>10}"
    )
    print(
        f"{'Industry Hubs (/reports/)':<24} "
        f"{len(db_data['industry_hubs']['slugs']):>8} "
        f"{len(sitemap_data['industry_hubs']):>10} "
        f"{len(industry_hub_orphans):>10}"
    )
    print(
        f"{'City Hubs (/local-reports)':<24} "
        f"{len(db_data['city_hubs']['slugs']):>8} "
        f"{len(sitemap_data['city_hubs']):>10} "
        f"{len(city_hub_orphans):>10}"
    )

    # Final Export
    total_orphans = (
        len(market_orphans)
        + len(validation_orphans)
        + len(local_seo_orphans)
        + len(industry_hub_orphans)
        + len(city_hub_orphans)
    )
    total_pending = (
        db_data["market"]["pending"]
        + db_data["validation"]["pending"]
        + db_data["local_seo"]["pending"]
    )

    print(f"\n--- 🏁 GLOBAL SEO HEALTH ---")
    print(f"TOTAL_ORPHANS={total_orphans}")
    print(f"TOTAL_PENDING_INDEX={total_pending}")


if __name__ == "__main__":
    run()