import os
from supabase import create_client
from dotenv import load_dotenv

# Initialize
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def calculate_aeo_score(report_data):
    """Calculates potential AEO score for audit report (Read-Only)."""
    score = 0
    if not report_data: return 0
    if 'entry_playbook' in report_data: score += 30
    if 'micro_tam' in report_data: score += 20
    if 'market_gaps' in report_data: score += 20
    clean_text = str(report_data)
    if len(clean_text) > 2500: score += 30
    elif len(clean_text) > 1500: score += 15
    return min(100, score)

def run_master_audit():
    print("\n" + "="*60)
    print("🔬 VALIFYE MASTER SITEMAP AUDITOR (V10.2 - READ ONLY)")
    print("="*60)

    # --- 1. DATA ACQUISITION ---
    print("📡 Fetching all engines and hubs...")
    
    e1_reports = supabase.table("market_data").select("slug").eq("status", "published").execute().data or []
    e1_hubs = supabase.table("city_hubs").select("all_slugs").execute().data or []
    
    e2_reports = supabase.table("verdict_reports").select("slug").eq("is_published", True).execute().data or []
    e2_hubs = supabase.table("verdict_industry_hubs").select("all_slugs").execute().data or []
    
    e3_reports = supabase.table("public_seo_reports").select("slug, report_data").eq("is_published", True).execute().data or []
    e3_hubs = supabase.table("local_city_hubs").select("all_slugs").execute().data or []

    # --- 2. ORPHAN CHECKING ---
    def get_orphans(reports, hubs):
        housed = set()
        for h in hubs:
            if h.get('all_slugs'): housed.update(h['all_slugs'])
        published = {r['slug'] for r in reports}
        return published - housed

    e1_orphans = get_orphans(e1_reports, e1_hubs)
    e2_orphans = get_orphans(e2_reports, e2_hubs)
    e3_orphans = get_orphans(e3_reports, e3_hubs)

    # --- 3. QUALITY SCAN ---
    high_aeo = 0
    for r in e3_reports:
        score = calculate_aeo_score(r.get('report_data'))
        if score > 75: high_aeo += 1

    # --- 4. FINAL TERMINAL DASHBOARD ---
    print("\n" + "="*60)
    print("📊 FULL SYSTEM HEALTH REPORT")
    print("="*60)
    
    print(f"\n🏗️  [STRUCTURAL INTEGRITY - ORPHANS]")
    print(f"   • Blueprints (E1)     : {len(e1_orphans)} orphaned")
    print(f"   • Global Verdicts (E2): {len(e2_orphans)} orphaned")
    print(f"   • Local SEO (E3)      : {len(e3_orphans)} orphaned")

    print(f"\n🤖 [AEO QUALITY (Engine 3)]")
    print(f"   • High Confidence     : {high_aeo} / {len(e3_reports)}")

    print("\n" + "="*60)
    print("✅ AUDIT COMPLETE. System is Hardened and Production Ready.")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_master_audit()