import os
import sys
import requests
import xml.etree.ElementTree as ET
from typing import Set, Dict, Any
from supabase import create_client, Client

SITEMAP_URL = "https://valifye.com/sitemap.xml"

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)

def fetch_db_stats(supabase: Client):
    """Fetch counts based on the new Forensic Queue logic."""
    # 1. Get all truly published slugs
    resp = supabase.table("market_data").select("slug").eq("status", "published").execute()
    published_slugs = {row['slug'] for row in resp.data if row.get('slug')}
    
    # 2. Get pending count for the Slack report
    pending_resp = supabase.table("market_data").select("id", count="exact").eq("google_index_status", "pending").execute()
    pending_count = pending_resp.count if pending_resp.count is not None else 0
    
    return published_slugs, pending_count

def fetch_sitemap_slugs() -> Set[str]:
    """Extract slugs from the live sitemap."""
    try:
        resp = requests.get(SITEMAP_URL, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except Exception as e:
        print(f"❌ Sitemap Fetch/Parse Error: {e}", file=sys.stderr)
        return set()

    ns = root.tag.split("}")[0] + "}" if "}" in root.tag else ""
    slugs = set()
    for loc_el in root.findall(f".//{ns}loc"):
        loc = (loc_el.text or "").strip()
        if "/ideas/" in loc:
            slugs.add(loc.split("/ideas/")[-1].strip("/"))
    return slugs

def run():
    supabase = get_supabase_client()
    db_slugs, pending_count = fetch_db_stats(supabase)
    sitemap_slugs = fetch_sitemap_slugs()
    
    # Orphans = Published in DB but missing from Sitemap
    orphan_slugs = db_slugs - sitemap_slugs
    
    summary = {
        "total_db": len(db_slugs),
        "total_sitemap": len(sitemap_slugs),
        "orphan_count": len(orphan_slugs),
        "pending_index": pending_count
    }

    # Output for GitHub Actions ENV
    print(f"TOTAL_DB={summary['total_db']}")
    print(f"TOTAL_SITEMAP={summary['total_sitemap']}")
    print(f"ORPHAN_COUNT={summary['orphan_count']}")
    print(f"PENDING_INDEX={summary['pending_index']}")
    
    return summary

if __name__ == "__main__":
    run()