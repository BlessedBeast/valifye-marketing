import os
from supabase import create_client
from dotenv import load_dotenv

# Initialize
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def audit_engine_3():
    print("\n" + "="*60)
    print("🔬 ENGINE 3 X-RAY: LOCAL SEO REPORTS & CITY HUBS")
    print("="*60)

    # 1. Fetch all Published SEO Reports
    print("📡 Fetching Local SEO Reports...")
    seo_resp = supabase.table("public_seo_reports").select("slug, location_label, is_published").eq("is_published", True).execute()
    reports = seo_resp.data or []
    report_slugs = {r['slug'] for r in reports}

    # 2. Fetch all Local City Hubs
    print("📡 Fetching Local City Hubs...")
    hubs_resp = supabase.table("local_city_hubs").select("city_name, all_slugs").execute()
    city_hubs = hubs_resp.data or []
    
    housed_slugs = set()
    hub_map = {}
    
    for h in city_hubs:
        slug_list = h.get('all_slugs') or []
        housed_slugs.update(slug_list)
        hub_map[h['city_name']] = len(slug_list)

    # 3. Calculations
    orphans = report_slugs - housed_slugs
    invaders = housed_slugs - report_slugs

    # --- RESULTS DASHBOARD ---
    print("\n" + "="*60)
    print("📊 ENGINE 3 HEALTH DASHBOARD")
    print("="*60)
    
    print(f"\n🏘️  [CITY HUB DISTRIBUTION: {len(city_hubs)} Hubs]")
    # Show top 5 cities by report count
    sorted_hubs = sorted(hub_map.items(), key=lambda x: x[1], reverse=True)
    for name, count in sorted_hubs[:10]:
        print(f"   • {name.ljust(25)} : {str(count).rjust(4)} reports")

    print(f"\n🏗️  [STRUCTURAL INTEGRITY]")
    print(f"   • Total Published SEO Reports : {len(reports)}")
    print(f"   • Properly Housed             : {len(report_slugs & housed_slugs)}")
    print(f"   • Orphaned (No Hub)           : {len(orphans)}")
    print(f"   • Invaders (Ghost Links)      : {len(invaders)}")

    if orphans:
        print("\n⚠️  ORPHAN SAMPLES (Local reports not in any city hub):")
        for o in list(orphans)[:5]:
            print(f"   -> {o}")

    if invaders:
        print("\n🚨 INVADER SAMPLES (Dead links in city hubs):")
        for i in list(invaders)[:5]:
            print(f"   -> {i}")

    print("\n" + "="*60)

if __name__ == "__main__":
    audit_engine_3()