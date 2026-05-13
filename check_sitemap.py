import os
import re
import sys

from dotenv import load_dotenv
from supabase import create_client

# Initialize
load_dotenv()
supabase = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

BASE = "https://valifye.com"


def slugify_part(value: str) -> str:
    s = (value or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "unknown"


def markets_loc(region_key: str, sector: str, business_model: str) -> str:
    r = slugify_part(str(region_key))
    s = slugify_part(str(sector))
    m = slugify_part(str(business_model))
    return f"{BASE}/markets/{r}/{s}/{m}"


def db_expected_urls() -> dict[str, set[str]]:
    """Disjoint URL sets by engine (path prefix)."""
    e1 = supabase.table("market_data").select("slug").eq("status", "published").execute().data or []
    e2 = (
        supabase.table("verdict_reports")
        .select("slug")
        .eq("is_published", True)
        .execute()
        .data
        or []
    )
    e3 = (
        supabase.table("public_seo_reports")
        .select("slug")
        .eq("is_published", True)
        .execute()
        .data
        or []
    )
    e4 = (
        supabase.table("local_business_blueprints")
        .select("region_key, sector, business_model")
        .eq("status", "published")
        .execute()
        .data
        or []
    )
    e5 = supabase.table("solution_pillars").select("slug").execute().data or []
    e6 = supabase.table("marketing_showcase").select("slug").execute().data or []

    ideas: set[str] = set()
    for r in e1:
        slug = r.get("slug")
        if slug and "/" not in str(slug):
            ideas.add(f"{BASE}/ideas/{slug}")

    reports: set[str] = set()
    for r in e2:
        slug = r.get("slug")
        if slug and "/" not in str(slug) and "-market-audit" not in str(slug):
            reports.add(f"{BASE}/reports/{slug}")

    local_reports: set[str] = set()
    for r in e3:
        slug = r.get("slug")
        if slug and "/" not in str(slug):
            local_reports.add(f"{BASE}/local-reports/report/{slug}")

    markets: set[str] = set()
    for r in e4:
        rk, sec, bm = r.get("region_key"), r.get("sector"), r.get("business_model")
        if rk and sec and bm:
            markets.add(markets_loc(str(rk), str(sec), str(bm)))

    solutions: set[str] = set()
    for r in e5:
        slug = r.get("slug")
        if slug and "/" not in str(slug):
            solutions.add(f"{BASE}/solutions/{slug}")

    showcase: set[str] = set()
    for r in e6:
        slug = r.get("slug")
        if slug and "/" not in str(slug):
            showcase.add(f"{BASE}/showcase/{slug}")

    return {
        "ideas": ideas,
        "reports": reports,
        "local_reports": local_reports,
        "markets": markets,
        "solutions": solutions,
        "showcase": showcase,
    }


def parse_sitemap_locs(content: str) -> set[str]:
    found = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", content)
    return {u.strip() for u in found if u.strip()}


def run_sitemap_file_audit():
    # Fix for Windows Emoji rendering
    if sys.platform == "win32":
        import io

        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

    print("\n" + "=" * 60)
    print("📡 VALIFYE SITEMAP VALIDATOR (multi-namespace)")
    print("=" * 60)

    sitemap_path = os.path.join("public", "sitemap.xml")
    if not os.path.exists(sitemap_path):
        print(f"❌ ERROR: '{sitemap_path}' not found.")
        print("💡 Run `python scripts/generate_master_sitemap.py` first.")
        return

    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()

    sitemap_urls = parse_sitemap_locs(content)
    buckets = db_expected_urls()
    db_union = set().union(*buckets.values())

    print(f"📂 Parsed <loc> entries: {len(sitemap_urls)} unique")
    print("📡 DB expected counts by namespace:")
    for k, v in buckets.items():
        print(f"   • {k:14s} {len(v)}")
    print(f"   • {'TOTAL':14s} {len(db_union)}")

    missing = db_union - sitemap_urls
    zombies = sitemap_urls - db_union

    stuttering = [
        s
        for s in sitemap_urls
        if "/ideas/" in s and re.search(r"-in-([a-z-]+)-in-\1", s)
    ]

    print("\n" + "=" * 60)
    print("📊 LIVE SITEMAP INTEGRITY REPORT")
    print("=" * 60)

    print(f"\n🧱 [COVERAGE]")
    print(f"   • Database (union)              : {len(db_union)}")
    print(f"   • Sitemap <loc>                 : {len(sitemap_urls)}")

    if not missing and not zombies:
        print("   • Sync Status                   : ✅ PERFECT ALIGNMENT")
    else:
        print("   • Sync Status                   : ⚠️ MISMATCH DETECTED")

    print(f"\n🚨 [LEAKS]")
    print(f"   • Missing (not in sitemap)      : {len(missing)}")
    print(f"   • Zombies (not in DB union)     : {len(zombies)}")
    print(f"   • Double-city (/ideas/)         : {len(stuttering)}")

    if missing:
        print("\n📍 SAMPLE MISSING:")
        for s in list(missing)[:8]:
            print(f"   -> {s}")

    if zombies:
        print("\n📍 SAMPLE ZOMBIES:")
        for z in list(zombies)[:8]:
            print(f"   -> {z}")

    print("\n" + "=" * 60)
    print("🏁 Final Audit Complete.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_sitemap_file_audit()
