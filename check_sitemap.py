import os
import re
from supabase import create_client
from dotenv import load_dotenv

# Initialize
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def run_sitemap_file_audit():
    print("\n" + "="*60)
    print("📡 VALIFYE SITEMAP FILE AUDITOR (V11.0)")
    print("="*60)

    # --- 1. LOAD SITEMAP FILE ---
    sitemap_path = "new sitemap.txt"
    if not os.path.exists(sitemap_path):
        print(f"❌ ERROR: '{sitemap_path}' not found. Please ensure the file exists.")
        return

    with open(sitemap_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all slugs from <loc> tags or raw URLs
    # This regex handles both https://valifye.com/ideas/slug and raw slugs
    found_urls = re.findall(r'https://valifye\.com/ideas/([a-zA-Z0-9\-_]+)', content)
    sitemap_slugs = set(found_urls)
    
    print(f"📂 Sitemap File Loaded: {len(sitemap_slugs)} unique URLs detected.")

    # --- 2. FETCH DATABASE TRUTH ---
    print("📡 Fetching Published Slugs from Supabase...")
    
    e1_db = {r['slug'] for r in supabase.table("market_data").select("slug").eq("status", "published").execute().data or []}
    e2_db = {r['slug'] for r in supabase.table("verdict_reports").select("slug").eq("is_published", True).execute().data or []}
    e3_db = {r['slug'] for r in supabase.table("public_seo_reports").select("slug").eq("is_published", True).execute().data or []}
    
    all_published_db = e1_db | e2_db | e3_db
    print(f"✅ DB Truth: {len(all_published_db)} total published records found.")

    # --- 3. CROSS-REFERENCE CALCULATIONS ---
    
    # Missing: In DB but NOT in Sitemap (Google won't find these)
    missing_from_sitemap = all_published_db - sitemap_slugs
    
    # Zombies: In Sitemap but NOT in DB (Google is crawling dead/deleted links)
    zombies_in_sitemap = sitemap_slugs - all_published_db
    
    # Sloppy Check: Are there any double-city slugs actually inside the live sitemap?
    double_city_ghosts = [s for s in sitemap_slugs if re.search(r'-in-([a-z-]+)-in-\1', s)]

    # --- 4. FINAL HEALTH DASHBOARD ---
    print("\n" + "="*60)
    print("📊 SITEMAP VS. DATABASE ALIGNMENT")
    print("="*60)
    
    print(f"\n🧱 [COVERAGE]")
    print(f"   • Database (Published) : {len(all_published_db)}")
    print(f"   • Sitemap (Live)      : {len(sitemap_slugs)}")
    
    sync_status = "✅ PERFECT SYNC" if len(missing_from_sitemap) == 0 and len(zombies_in_sitemap) == 0 else "⚠️ DISCREPANCIES FOUND"
    print(f"   • Sync Status         : {sync_status}")

    print(f"\n🚨 [CRITICAL LEAKS]")
    print(f"   • Missing from Sitemap: {len(missing_from_sitemap)} (Invisible to Google)")
    print(f"   • Zombie Links        : {len(zombies_in_sitemap)} (Dead URLs being crawled)")
    print(f"   • Double-City Errors  : {len(double_city_ghosts)} (Still in sitemap!)")

    if missing_from_sitemap:
        print("\n📍 MISSING SAMPLES (Add these to sitemap logic):")
        for s in list(missing_from_sitemap)[:3]:
            print(f"   -> {s}")

    if zombies_in_sitemap:
        print("\n📍 ZOMBIE SAMPLES (Remove these from sitemap file):")
        for z in list(zombies_in_sitemap)[:3]:
            print(f"   -> {z}")

    if double_city_ghosts:
        print("\n📍 DOUBLE-CITY SAMPLES (Urgent Fix Required):")
        for d in double_city_ghosts[:3]:
            print(f"   -> {d}")

    print("\n" + "="*60)
    print("🏁 Audit Complete. Use this to verify your XML generation logic.")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_sitemap_file_audit()