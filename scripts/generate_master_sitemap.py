"""
Master sitemap generator (Supabase → new_sitemap.txt).

Sections are explicitly separated in the XML with comments so `/ideas/`, `/reports/`,
`/local-reports/report/`, and `/markets/` URLs never share the same path prefix.
"""
from __future__ import annotations

import os
import re
from urllib.parse import quote

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

BASE_URL = "https://valifye.com"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

FETCH_LIMIT = 5000


def slugify_part(value: str) -> str:
    """Matches `slugify_part` in `scripts/generate_market_blueprints.py` and TS link helpers."""
    s = (value or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "unknown"


def encode_market_path_segment(raw: str) -> str:
    """
    One dynamic `[segment]` for `/markets/[region]/[sector]/[model]`.

    Next decodes each param with `decodeURIComponent` then lowercases in `buildSlugFromParams`.
    We emit slugified ASCII-ish segments then percent-encode so reserved characters
    never leak raw into the path.
    """
    return quote(slugify_part(raw), safe="")


def markets_loc(region_key: str, sector: str, business_model: str) -> str:
    r = encode_market_path_segment(region_key)
    s = encode_market_path_segment(sector)
    m = encode_market_path_segment(business_model)
    return f"{BASE_URL}/markets/{r}/{s}/{m}"


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
    local_seo = (
        supabase.table("public_seo_reports")
        .select("slug")
        .eq("is_published", True)
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )
    market_blueprints = (
        supabase.table("local_business_blueprints")
        .select("slug, region_key, sector, business_model")
        .eq("status", "published")
        .limit(FETCH_LIMIT)
        .execute()
        .data
        or []
    )

    chunks: list[str] = []
    xml_header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        "<!-- === Valifye sitemap: namespaces are disjoint by path prefix === -->\n"
    )
    chunks.append(xml_header)

    # --- /ideas/ (market_data only) ---
    chunks.append("<!-- --- Engine 1: Idea blueprints → /ideas/{slug} --- -->\n")
    for row in ideas:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        chunks.append(url_entry(f"{BASE_URL}/ideas/{slug}"))

    # --- /reports/ (verdict_reports; align with build_static_sitemap.py) ---
    chunks.append("<!-- --- Engine 2: Forensic verdicts → /reports/{slug} --- -->\n")
    for row in verdicts:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        if "-market-audit" in str(slug):
            continue
        chunks.append(url_entry(f"{BASE_URL}/reports/{slug}"))

    # --- /local-reports/report/ (public_seo_reports) ---
    chunks.append(
        "<!-- --- Engine 3: Local SEO dossiers → /local-reports/report/{slug} --- -->\n"
    )
    for row in local_seo:
        slug = row.get("slug")
        if not slug or "/" in str(slug):
            continue
        chunks.append(
            url_entry(f"{BASE_URL}/local-reports/report/{slug}", priority="0.7")
        )

    # --- /markets/ (local_business_blueprints) ---
    chunks.append(
        "<!-- --- Engine 4: Market blueprints → /markets/{region}/{sector}/{model} --- -->\n"
    )
    for row in market_blueprints:
        rk = row.get("region_key")
        sec = row.get("sector")
        bm = row.get("business_model")
        if not rk or not sec or not bm:
            continue
        chunks.append(url_entry(markets_loc(str(rk), str(sec), str(bm)), priority="0.75"))

    chunks.append("</urlset>")

    out_path = os.path.join(os.path.dirname(__file__), "..", "new_sitemap.txt")
    out_path = os.path.normpath(out_path)

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
    n_local = sum(1 for r in local_seo if r.get("slug") and "/" not in str(r["slug"]))
    n_markets = sum(
        1
        for r in market_blueprints
        if r.get("region_key") and r.get("sector") and r.get("business_model")
    )

    print(f"✅ Wrote {out_path}")
    print(
        f"   ideas: {n_ideas} | reports: {n_verdicts} | local-reports: {n_local} | markets: {n_markets}"
    )
    print(f"   Total URL entries: {n_ideas + n_verdicts + n_local + n_markets}")


if __name__ == "__main__":
    generate_xml_sitemap()
