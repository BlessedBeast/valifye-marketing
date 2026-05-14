"""
Master sitemap generator (Supabase → public/sitemap.xml).

Sections are explicitly separated in the XML with comments so `/ideas/`, `/reports/`,
`/local-reports/report/`, `/markets/`, `/markets/state/`, `/compare/`, key static routes,
`/solutions/`, `/showcase/`, `/blueprints/`, and `/tools/` URLs are grouped.

Local report <loc> values always use /local-reports/report/{slug} (never the pre-redirect
/local-reports/{slug} shape). Market URLs match Next.js buildMarketPath + buildCanonical.
State hub URLs are `/markets/state/{state_code}` derived from USA-* region_key prefixes.
Comparison pages use `competitor_comparisons.slug` when the table exists, else a safe fallback.
"""
from __future__ import annotations

import os
import re

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

BASE_URL = "https://valifye.com"
SITE_URL = BASE_URL
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

FETCH_LIMIT = 5000


_USA_REGION_STATE = re.compile(r"^USA-([A-Za-z]{2})-", re.IGNORECASE)


def extract_usa_state_code(region_key: str) -> str | None:
    """Two-letter state code from keys like USA-TX-AUSTIN (aligned with TS extractUsaStateCode)."""
    m = _USA_REGION_STATE.match((region_key or "").strip())
    if not m:
        return None
    return m.group(1).upper()


def slugify_part(value: str) -> str:
    """Matches `lib/slugify.ts` slugifyPart and `scripts/generate_market_blueprints.py`."""
    s = (value or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "unknown"


def fetch_local_reports_urls() -> list[str]:
    """
    Published public_seo_reports: <loc> is always {SITE_URL}/local-reports/report/{slug}.
    """
    rows = (
        supabase.table("public_seo_reports")
        .select("slug")
        .eq("is_published", True)
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        urls.append(f"{SITE_URL}/local-reports/report/{slug}")
    return urls


def fetch_market_blueprint_urls() -> list[str]:
    """
    Published local_business_blueprints: path /markets/{slugify(region)}/{slugify(sector)}/{slugify(model)}.
    Uses DB columns only (no stored composite slug column).
    """
    rows = (
        supabase.table("local_business_blueprints")
        .select("region_key, sector, business_model")
        .eq("status", "published")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        rk = row.get("region_key")
        sec = row.get("sector")
        bm = row.get("business_model")
        if not rk or not sec or not bm:
            continue
        r = slugify_part(str(rk))
        s = slugify_part(str(sec))
        m = slugify_part(str(bm))
        urls.append(f"{SITE_URL}/markets/{r}/{s}/{m}")
    return urls


def fetch_market_state_hub_urls() -> list[str]:
    """
    Unique /markets/state/{xx} hubs from published local_business_blueprints.region_key (USA-xx-…).
    """
    rows = (
        supabase.table("local_business_blueprints")
        .select("region_key")
        .eq("status", "published")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    codes: set[str] = set()
    for row in rows:
        rk = row.get("region_key")
        code = extract_usa_state_code(str(rk) if rk else "")
        if code:
            codes.add(code)
    return [f"{SITE_URL}/markets/state/{c.lower()}" for c in sorted(codes)]


def fetch_solutions_urls() -> list[str]:
    """solution_pillars → /solutions/{slug}."""
    rows = (
        supabase.table("solution_pillars")
        .select("slug")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        urls.append(f"{SITE_URL}/solutions/{slug}")
    return urls


def fetch_showcase_urls() -> list[str]:
    """
    marketing_showcase → /showcase/{slug}.

    Any non-empty slug without path separators is emitted (length and substrings such as
    `market-audit` are not filtered; only `/` is rejected to avoid nested paths).
    """
    rows = (
        supabase.table("marketing_showcase")
        .select("slug")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        urls.append(f"{SITE_URL}/showcase/{slug}")
    return urls


def fetch_bpk_blueprint_urls() -> list[str]:
    """
    Public startup audits: /blueprints/{slug} (bpk_audits.is_public).
    """
    rows = (
        supabase.table("bpk_audits")
        .select("slug")
        .eq("is_public", True)
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        urls.append(f"{SITE_URL}/blueprints/{slug}")
    return urls


def fetch_aeo_blueprint_urls() -> list[str]:
    """
    Public AEO shadow scans: /blueprints/{slug} (aeo_scans.is_public).
    """
    rows = (
        supabase.table("aeo_scans")
        .select("slug")
        .eq("is_public", True)
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    urls: list[str] = []
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        urls.append(f"{SITE_URL}/blueprints/{slug}")
    return urls


def fetch_static_marketing_urls() -> list[tuple[str, str]]:
    """High-value static marketing routes (URL, priority)."""
    return [
        (f"{SITE_URL}/local-market-scout", "0.8"),
        (f"{SITE_URL}/compare", "0.7"),
    ]


def fetch_static_hub_urls() -> list[tuple[str, str, str]]:
    """Marketing index hubs (loc, priority, changefreq)."""
    return [
        (f"{SITE_URL}/solutions", "0.8", "weekly"),
        (f"{SITE_URL}/showcase", "0.8", "weekly"),
        (f"{SITE_URL}/tools", "0.7", "monthly"),
        (f"{SITE_URL}/blueprints", "0.9", "daily"),
    ]


def fetch_static_tool_urls() -> list[tuple[str, str, str]]:
    """Individual tool pages under /tools/* (loc, priority, changefreq)."""
    return [
        (f"{SITE_URL}/tools/delivery-calculator", "0.6", "monthly"),
        (f"{SITE_URL}/tools/sba-loan-scanner", "0.6", "monthly"),
        (f"{SITE_URL}/tools/franchise-profit-simulator", "0.6", "monthly"),
        (f"{SITE_URL}/tools/uk-vat-cliff-scanner", "0.6", "monthly"),
        (f"{SITE_URL}/tools/build-pivot-kill", "0.7", "monthly"),
        (f"{SITE_URL}/tools/aeo-scanner", "0.7", "monthly"),
    ]


def fetch_static_hub_and_tool_urls() -> list[tuple[str, str, str]]:
    """
    Index hubs plus tool routes (loc, priority, changefreq).
    /tools/* entries complement the /tools hub; avoid duplicating these in other static lists.
    """
    return fetch_static_hub_urls() + fetch_static_tool_urls()


def fetch_comparison_urls() -> list[str]:
    """
    competitor_comparisons.slug → /compare/{slug} (priority 0.8 in sitemap).

    If the table is missing, the query fails, or no valid slugs are returned, emits a single
    fallback URL for parity with production routing.
    """
    fallback = [f"{SITE_URL}/compare/valifye-vs-validatorai"]
    try:
        rows = (
            supabase.table("competitor_comparisons")
            .select("slug")
            .limit(FETCH_LIMIT)
            .execute()
            .data
            or []
        )
    except Exception:
        return fallback

    urls: list[str] = []
    seen: set[str] = set()
    for row in rows:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        loc = f"{SITE_URL}/compare/{slug}"
        if loc not in seen:
            seen.add(loc)
            urls.append(loc)

    return urls if urls else fallback


def url_entry(loc: str, changefreq: str = "weekly", priority: str = "0.8") -> str:
    return (
        "  <url>\n"
        f"    <loc>{loc}</loc>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>\n"
    )


def generate_xml_sitemap() -> None:
    print("🏗️  Generating Master Sitemap (Bypassing 1000-limit)...")

    ideas = (
        supabase.table("market_data")
        .select("slug")
        .eq("status", "published")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    verdicts = (
        supabase.table("verdict_reports")
        .select("slug")
        .eq("is_published", True)
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    local_urls = fetch_local_reports_urls()
    market_urls = fetch_market_blueprint_urls()
    market_state_hub_urls = fetch_market_state_hub_urls()

    solutions_urls = fetch_solutions_urls()
    showcase_urls = fetch_showcase_urls()
    static_pages = fetch_static_marketing_urls()
    static_hub_urls = fetch_static_hub_urls()
    static_tool_urls = fetch_static_tool_urls()
    comparison_urls = fetch_comparison_urls()
    bpk_blueprint_urls = fetch_bpk_blueprint_urls()
    aeo_blueprint_urls = fetch_aeo_blueprint_urls()

    # (absolute URL, priority) — appended before writing solutions/showcase XML
    all_urls: list[tuple[str, str]] = []
    all_urls.extend((loc, "0.9") for loc in solutions_urls)
    all_urls.extend((loc, "0.85") for loc in showcase_urls)

    chunks: list[str] = []
    xml_header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        "<!-- === Valifye sitemap: namespaces are disjoint by path prefix === -->\n"
    )
    chunks.append(xml_header)

    # --- /ideas/ (market_data only) ---
    chunks.append("<!-- Engine 1: Idea blueprints -> /ideas/{slug} -->\n")
    for row in ideas:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        chunks.append(url_entry(f"{SITE_URL}/ideas/{slug}"))

    # --- /reports/ (verdict_reports) ---
    chunks.append("<!-- Engine 2: Forensic verdicts -> /reports/{slug} -->\n")
    for row in verdicts:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        if "-market-audit" in str(slug):
            continue
        chunks.append(url_entry(f"{SITE_URL}/reports/{slug}"))

    # --- /local-reports/report/ (public_seo_reports) ---
    chunks.append(
        "<!-- Engine 3: Local SEO dossiers -> /local-reports/report/{slug} -->\n"
    )
    for loc in local_urls:
        chunks.append(url_entry(loc, priority="0.7"))

    # --- /markets/ (local_business_blueprints) ---
    chunks.append(
        "<!-- Engine 4: Market blueprints -> /markets/{region}/{sector}/{model} -->\n"
    )
    for loc in market_urls:
        chunks.append(url_entry(loc, priority="0.75"))

    # --- /markets/state/{code} (state intelligence hubs) ---
    chunks.append(
        "<!-- Engine 4b: Market state hubs -> /markets/state/{state_code} (priority 0.95) -->\n"
    )
    for loc in market_state_hub_urls:
        chunks.append(url_entry(loc, priority="0.95"))

    # --- Static marketing + comparison hub/detail ---
    chunks.append(
        "<!-- Engine 4c: Static marketing -> /local-market-scout, /compare -->\n"
    )
    for loc, priority in static_pages:
        chunks.append(url_entry(loc, priority=priority))

    chunks.append(
        "<!-- Engine 4c2: Hub indexes -> /solutions, /showcase, /tools, /blueprints -->\n"
    )
    for loc, priority, changefreq in static_hub_urls:
        chunks.append(url_entry(loc, changefreq=changefreq, priority=priority))

    chunks.append(
        "<!-- Engine 4c3: Tool routes -> /tools/{tool-slug} -->\n"
    )
    for loc, priority, changefreq in static_tool_urls:
        chunks.append(url_entry(loc, changefreq=changefreq, priority=priority))

    chunks.append("<!-- Engine 4d: Comparison engine -> /compare/{slug} (priority 0.8) -->\n")
    for loc in comparison_urls:
        chunks.append(url_entry(loc, priority="0.8"))

    # --- /solutions/ + /showcase/ (high-value; priorities from all_urls tuples) ---
    chunks.append(
        "<!-- Engine 5: Solution pillars -> /solutions/{slug} (priority 0.9) -->\n"
    )
    chunks.append(
        "<!-- Engine 6: Marketing showcase -> /showcase/{slug} (priority 0.85) -->\n"
    )
    for loc, priority in all_urls:
        chunks.append(url_entry(loc, priority=priority))

    chunks.append(
        "<!-- Engine 7: Forensic Blueprints (Startup + AEO) -> /blueprints/{slug} -->\n"
    )
    for loc in bpk_blueprint_urls:
        chunks.append(url_entry(loc, changefreq="weekly", priority="0.75"))
    for loc in aeo_blueprint_urls:
        chunks.append(url_entry(loc, changefreq="weekly", priority="0.75"))

    chunks.append("</urlset>")

    repo_root = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    public_dir = os.path.join(repo_root, "public")
    os.makedirs(public_dir, exist_ok=True)
    out_path = os.path.join(public_dir, "sitemap.xml")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("".join(chunks))

    n_ideas = sum(1 for r in ideas if r.get("slug") and "/" not in str(r["slug"]))
    n_verdicts = sum(
        1
        for r in verdicts
        if r.get("slug")
        and "/" not in str(r["slug"])
        and "-market-audit" not in str(r.get("slug", ""))
    )
    n_local = len(local_urls)
    n_markets = len(market_urls)
    n_market_state_hubs = len(market_state_hub_urls)
    n_solutions = len(solutions_urls)
    n_showcase = len(showcase_urls)
    n_static = len(static_pages)
    n_static_hubs = len(static_hub_urls)
    n_tool_routes = len(static_tool_urls)
    n_comparisons = len(comparison_urls)
    n_bpk_blueprints = len(bpk_blueprint_urls)
    n_aeo_blueprints = len(aeo_blueprint_urls)

    grand_total = (
        n_ideas
        + n_verdicts
        + n_local
        + n_markets
        + n_market_state_hubs
        + n_static
        + n_static_hubs
        + n_tool_routes
        + n_comparisons
        + n_solutions
        + n_showcase
        + n_bpk_blueprints
        + n_aeo_blueprints
    )

    print(f"✅ Wrote {out_path}")
    print("   Engines (URL counts):")
    print(f"      Ideas:               {n_ideas}")
    print(f"      Reports:             {n_verdicts}")
    print(f"      Local Reports:       {n_local}")
    print(f"      Markets:             {n_markets}")
    print(f"      Market State Hubs:   {n_market_state_hubs}")
    print(f"      Static Pages:        {n_static}")
    print(f"      Hub indexes:         {n_static_hubs}")
    print(f"      Tool routes:         {n_tool_routes}")
    print(f"      Comparisons:         {n_comparisons}")
    print(f"      Solutions:           {n_solutions}")
    print(f"      Showcase:            {n_showcase}")
    print(f"      Blueprints (BPK):    {n_bpk_blueprints}")
    print(f"      Blueprints (AEO):    {n_aeo_blueprints}")
    print(f"   Total URL entries: {grand_total}")


if __name__ == "__main__":
    generate_xml_sitemap()
