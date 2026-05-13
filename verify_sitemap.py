import os
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

from dotenv import load_dotenv
from supabase import create_client

_NS = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# Initialize
load_dotenv()
supabase = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def calculate_aeo_score(report_data):
    """Calculates potential AEO score for audit report (Read-Only)."""
    score = 0
    if not report_data:
        return 0
    if "entry_playbook" in report_data:
        score += 30
    if "micro_tam" in report_data:
        score += 20
    if "market_gaps" in report_data:
        score += 20
    clean_text = str(report_data)
    if len(clean_text) > 2500:
        score += 30
    elif len(clean_text) > 1500:
        score += 15
    return min(100, score)


def _bucket_path(path: str) -> str | None:
    """Map URL path to engine key, or None if unmatched."""
    if not path:
        return None
    p = path if path.startswith("/") else f"/{path}"
    # Longer prefixes first (e.g. /markets/state/ before /markets/)
    if p.startswith("/local-reports/report/"):
        return "local_reports"
    if p.startswith("/markets/state/"):
        return "market_state_hubs"
    # Static / tools / compare (order avoids /compare/detail vs hub overlap)
    if p == "/local-market-scout" or p.startswith("/local-market-scout/"):
        return "static_and_tools"
    if p.rstrip("/") == "/tools" or p.startswith("/tools/"):
        return "static_and_tools"
    if p.startswith("/compare/"):
        return "comparisons"
    if p.rstrip("/") == "/compare":
        return "comparisons"
    if p.startswith("/ideas/"):
        return "ideas"
    if p.startswith("/reports/"):
        return "reports"
    if p.startswith("/markets/"):
        return "markets"
    if p.startswith("/solutions/") or p.rstrip("/") == "/solutions":
        return "solutions"
    if p.startswith("/showcase/") or p.rstrip("/") == "/showcase":
        return "showcase"
    return None


def verify_physical_sitemap() -> tuple[dict[str, int], int]:
    """
    Parse public/sitemap.xml and count <loc> entries per canonical engine prefix.

    Uses the sitemap 0.9 XML namespace so <loc> nodes are found reliably
    (default xmlns on <urlset> emits Clark notation tags in ElementTree).
    """
    keys = (
        "ideas",
        "reports",
        "local_reports",
        "market_state_hubs",
        "markets",
        "static_and_tools",
        "comparisons",
        "solutions",
        "showcase",
    )
    counts: dict[str, int] = {k: 0 for k in keys}

    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, "public", "sitemap.xml")

    if not os.path.isfile(path):
        return counts, 0

    try:
        tree = ET.parse(path)
        root = tree.getroot()
        loc_elems = root.findall(".//s:loc", _NS)
    except (ET.ParseError, OSError):
        return counts, 0

    total_locs = len(loc_elems)
    for elem in loc_elems:
        raw = (elem.text or "").strip()
        if not raw:
            continue
        parsed = urlparse(raw)
        path_only = parsed.path or ""
        bucket = _bucket_path(path_only)
        if bucket is not None:
            counts[bucket] += 1

    return counts, total_locs


def run_master_audit():
    print("\n" + "=" * 60)
    print("🔬 VALIFYE MASTER SITEMAP AUDITOR (V10.2 - READ ONLY)")
    print("=" * 60)

    # --- 1. DATA ACQUISITION ---
    print("📡 Fetching all engines and hubs...")

    e1_reports = (
        supabase.table("market_data")
        .select("slug")
        .eq("status", "published")
        .execute()
        .data
        or []
    )
    e1_hubs = supabase.table("city_hubs").select("all_slugs").execute().data or []

    e2_reports = (
        supabase.table("verdict_reports")
        .select("slug")
        .eq("is_published", True)
        .execute()
        .data
        or []
    )
    e2_hubs = (
        supabase.table("verdict_industry_hubs").select("all_slugs").execute().data
        or []
    )

    e3_reports = (
        supabase.table("public_seo_reports")
        .select("slug, report_data")
        .eq("is_published", True)
        .execute()
        .data
        or []
    )
    e3_hubs = (
        supabase.table("local_city_hubs").select("all_slugs").execute().data or []
    )

    e4_blueprints = (
        supabase.table("local_business_blueprints")
        .select("slug")
        .eq("status", "published")
        .execute()
        .data
        or []
    )

    # --- 2. ORPHAN CHECKING ---
    def get_orphans(reports, hubs):
        housed = set()
        for h in hubs:
            if h.get("all_slugs"):
                housed.update(h["all_slugs"])
        published = {r["slug"] for r in reports}
        return published - housed

    e1_orphans = get_orphans(e1_reports, e1_hubs)
    e2_orphans = get_orphans(e2_reports, e2_hubs)
    e3_orphans = get_orphans(e3_reports, e3_hubs)

    # --- 3. QUALITY SCAN ---
    high_aeo = 0
    for r in e3_reports:
        score = calculate_aeo_score(r.get("report_data"))
        if score > 75:
            high_aeo += 1

    phy, phy_total_locs = verify_physical_sitemap()
    phy_bucket_total = sum(phy.values())

    # --- 4. FINAL TERMINAL DASHBOARD ---
    print("\n" + "=" * 60)
    print("📊 FULL SYSTEM HEALTH REPORT")
    print("=" * 60)

    print(f"\n🏗️  [STRUCTURAL INTEGRITY - ORPHANS]")
    print(f"   • Blueprints (E1)     : {len(e1_orphans)} orphaned")
    print(f"   • Global Verdicts (E2): {len(e2_orphans)} orphaned")
    print(f"   • Local SEO (E3)      : {len(e3_orphans)} orphaned")

    print(f"\n🤖 [AEO QUALITY (Engine 3)]")
    print(f"   • High Confidence     : {high_aeo} / {len(e3_reports)}")

    print(f"\n🗺️  [MARKET BLUEPRINTS (Engine 4)]")
    print(f"   • Published rows      : {len(e4_blueprints)}")

    print("\n" + "=" * 60)
    print("🗺️ [PHYSICAL SITEMAP.XML VERIFICATION]")
    print("=" * 60)

    xml_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "sitemap.xml")
    if not os.path.isfile(xml_path):
        print(f"\n   ⚠️  Missing file: {xml_path}")
        print("   Run: python scripts/generate_master_sitemap.py")
        phy_ok = False
    else:
        print("\n   Counts by path prefix (<loc>):")
        print(f"      Ideas:             {phy['ideas']}")
        print(f"      Reports:           {phy['reports']}")
        print(f"      Local Reports:     {phy['local_reports']}")
        print(f"      Market State Hubs: {phy['market_state_hubs']}")
        print(f"      Markets:           {phy['markets']}")
        print(f"      Static & Tools:    {phy['static_and_tools']}")
        print(f"      Comparisons:       {phy['comparisons']}")
        print(f"      Solutions:         {phy['solutions']}")
        print(f"      Showcase:          {phy['showcase']}")
        print(f"\n      Total <loc> in file: {phy_total_locs}")
        print(f"      Sum of buckets (9): {phy_bucket_total}")
        bucket_match = phy_total_locs == phy_bucket_total
        if not bucket_match:
            diff = phy_total_locs - phy_bucket_total
            print(
                f"      ⚠️  Bucket sum mismatches file: "
                f"{diff} <loc> node(s) are empty or use unknown path prefixes."
            )

        RED = "\033[91m"
        GREEN = "\033[92m"
        RESET = "\033[0m"

        if phy["solutions"] == 0 or phy["showcase"] == 0:
            print(
                f"\n   {RED}FAIL:{RESET} Physical sitemap has zero URLs for Solutions and/or Showcase."
            )
            print(
                "   Expected /solutions/ and /showcase/ entries from solution_pillars and marketing_showcase."
            )
            phy_ok = False
        elif not bucket_match:
            print(
                f"\n   {RED}FAIL:{RESET} Sum of buckets must equal Total <loc> in file "
                "(stray paths, blank <loc>, or auditor needs updating)."
            )
            phy_ok = False
        else:
            print(
                f"\n   {GREEN}PASS:{RESET} All nine path categories recognized; Solutions & Showcase non-zero; "
                "bucket sum equals <loc> count."
            )
            phy_ok = True

    print("\n" + "=" * 60)
    if phy_ok:
        print("✅ AUDIT COMPLETE. System is Hardened and Production Ready.")
    else:
        print("⚠️  AUDIT COMPLETE WITH WARNINGS — review physical sitemap section above.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_master_audit()
