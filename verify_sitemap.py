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

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ Missing SUPABASE credentials", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)

def fetch_db_stats(supabase: Client):
    """Fetches stats for all three Valifye engines."""
    
    # --- ENGINE 1: ORIGINAL BLUEPRINTS (market_data table) ---
    # Kept exactly as you requested
    market_resp = supabase.table("market_data").select("slug").eq("status", "published").execute()
    market_slugs = {row['slug'] for row in market_resp.data if row.get('slug')}
    
    market_pending = supabase.table("market_data")\
        .select("id", count="exact")\
        .eq("google_index_status", "pending")\
        .execute().count or 0

    # --- ENGINE 2: VALIDATION REPORTS (verdict_reports table) ---
    val_resp = supabase.table("verdict_reports").select("slug").execute()
    val_slugs = {row['slug'] for row in val_resp.data if row.get('slug')}
    
    val_pending = supabase.table("verdict_reports")\
        .select("id", count="exact")\
        .eq("is_published", False)\
        .execute().count or 0

    # --- ENGINE 3: LOCAL MARKET pSEO (public_seo_reports table) ---
    local_resp = supabase.table("public_seo_reports").select("slug").execute()
    local_slugs = {row['slug'] for row in local_resp.data if row.get('slug')}
    
    local_pending = supabase.table("public_seo_reports")\
        .select("id", count="exact")\
        .eq("is_published", False)\
        .execute().count or 0
    
    return {
        "market": {"slugs": market_slugs, "pending": market_pending},
        "validation": {"slugs": val_slugs, "pending": val_pending},
        "local": {"slugs": local_slugs, "pending": local_pending}
    }

def fetch_sitemap_data() -> Dict[str, Set[str]]:
    """Extracts and categorizes slugs from the live sitemap."""
    try:
        resp = requests.get(SITEMAP_URL, timeout=15)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except Exception as e:
        print(f"❌ Sitemap Fetch Error: {e}", file=sys.stderr)
        return {"market": set(), "validation": set(), "local": set()}

    ns = root.tag.split("}")[0] + "}" if "}" in root.tag else ""
    market_slugs = set()
    val_slugs = set()
    local_slugs = set()

    for loc_el in root.findall(f".//{ns}loc"):
        loc = (loc_el.text or "").strip()
        
        # 1. Detect Original Blueprints (/ideas/)
        if "/ideas/" in loc:
            market_slugs.add(loc.split("/ideas/")[-1].strip("/"))
        
        # 2. Detect Validation Reports (/reports/)
        if "/reports/" in loc:
            val_slugs.add(loc.split("/reports/")[-1].strip("/"))
        
        # 3. Detect Local Market Reports (/local-reports/)
        if "/local-reports/" in loc:
            local_slugs.add(loc.split("/local-reports/")[-1].strip("/"))
            
    return {
        "market": market_slugs, 
        "validation": val_slugs, 
        "local": local_slugs
    }

def run():
    print("🛡️  Starting Unified Valifye SEO Master Audit (V3.0)...")
    supabase = get_supabase_client()
    
    db_data = fetch_db_stats(supabase)
    sitemap_data = fetch_sitemap_data()
    
    # Calculate Orphans (Generated in DB but missing from Sitemap)
    market_orphans = db_data['market']['slugs'] - sitemap_data['market']
    val_orphans = db_data['validation']['slugs'] - sitemap_data['validation']
    local_orphans = db_data['local']['slugs'] - sitemap_data['local']
    
    print("\n--- 📊 ENGINE 1: MARKET BLUEPRINTS (/ideas/) ---")
    print(f"DB Total: {len(db_data['market']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['market'])}")
    print(f"Orphans:  {len(market_orphans)}")
    print(f"Pending:  {db_data['market']['pending']}")

    print("\n--- 📊 ENGINE 2: VALIDATION REPORTS (/reports/) ---")
    print(f"DB Total: {len(db_data['validation']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['validation'])}")
    print(f"Orphans:  {len(val_orphans)}")
    print(f"Pending:  {db_data['validation']['pending']}")

    print("\n--- 📊 ENGINE 3: LOCAL MARKET pSEO (/local-reports/) ---")
    print(f"DB Total: {len(db_data['local']['slugs'])}")
    print(f"Sitemap:  {len(sitemap_data['local'])}")
    print(f"Orphans:  {len(local_orphans)}")
    print(f"Pending:  {db_data['local']['pending']}")

    # Final Export
    total_orphans = len(market_orphans) + len(val_orphans) + len(local_orphans)
    total_pending = db_data['market']['pending'] + db_data['validation']['pending'] + db_data['local']['pending']
    
    print(f"\n--- 🏁 GLOBAL SEO HEALTH ---")
    print(f"TOTAL_ORPHANS={total_orphans}")
    print(f"TOTAL_PENDING_INDEX={total_pending}")

if __name__ == "__main__":
    run()