import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def calculate_aeo_score(report_data):
    """Assigns an AEO confidence score (0-100) based on data density."""
    score = 0
    if not report_data: return 0
    
    # 1. Pillar Weighting
    if 'entry_playbook' in report_data: score += 30
    if 'micro_tam' in report_data: score += 20
    if 'market_gaps' in report_data: score += 20
    
    # 2. Textual Density
    clean_text = str(report_data)
    if len(clean_text) > 2500: score += 30
    elif len(clean_text) > 1500: score += 15
    
    return min(100, score)

def sync_and_tag_aeo():
    print("🛡️  Starting Valifye AEO Master Controller (V6.0)...")
    
    # 1. Fetch all Published SEO Reports
    reports_resp = supabase.table("public_seo_reports").select("*").eq("is_published", True).execute()
    reports = reports_resp.data or []
    
    # 2. Fetch housed slugs from hubs to find orphans
    hubs = supabase.table("verdict_industry_hubs").select("all_slugs, industry_name").execute().data
    housed_slugs = set()
    for h in hubs:
        if h['all_slugs']: housed_slugs.update(h['all_slugs'])
    
    published_slugs_set = {r['slug'] for r in reports}
    orphans = published_slugs_set - housed_slugs
    print(f"🚩 Found {len(orphans)} Orphans. Healing site structure...")

    # 3. Heal Orphans & Tag AEO
    for r in reports:
        aeo_score = calculate_aeo_score(r['report_data'])
        aeo_tag = "high-confidence-audit" if aeo_score > 75 else "standard-market-snapshot"

        # Auto-link orphans to safety hub
        if r['slug'] in orphans:
            hub_resp = supabase.table("verdict_industry_hubs").select("all_slugs").eq("industry_name", "Emerging Tech").single().execute()
            hub = hub_resp.data
            if hub:
                new_slugs = list(set((hub.get('all_slugs') or []) + [r['slug']]))
                supabase.table("verdict_industry_hubs").update({"all_slugs": new_slugs}).eq("industry_name", "Emerging Tech").execute()

        # Update report with AEO metadata
        new_report_data = {**(r.get('report_data') or {}), "aeo_meta": {"score": aeo_score, "tag": aeo_tag}}
        supabase.table("public_seo_reports").update({"report_data": new_report_data}).eq("id", r['id']).execute()

if __name__ == "__main__":
    sync_and_tag_aeo()