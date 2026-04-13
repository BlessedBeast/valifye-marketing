import os
import re
import sys
from supabase import create_client
from dotenv import load_dotenv

# Initialize
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def run_sitemap_file_audit():
    # Fix for Windows Emoji rendering
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("\n" + "="*60)
    print("📡 VALIFYE SITEMAP VALIDATOR: MANUAL PASTE MODE")
    print("="*60)

    # --- 1. LOAD THE MANUALLY PASTED DATA ---
    sitemap_path = "new_sitemap.txt"
    if not os.path.exists(sitemap_path):
        print(f"❌ ERROR: '{sitemap_path}' not found.")
        print("💡 Create 'new_sitemap.txt' and paste your XML content there.")
        return

    with open(sitemap_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # This regex is robust: it handles <loc> tags or raw URLs
    # It captures the slug after /ideas/
    found_slugs = re.findall(r'/ideas/([a-zA-Z0-9\-_]+)', content)
    sitemap_slugs = set(found_slugs)
    
    print(f"📂 Sitemap Content Parsed: {len(sitemap_slugs)} unique URLs detected.")

    # --- 2. FETCH DATABASE TRUTH ---
    print("📡 Fetching Published Slugs from Supabase...")
    
    # Engine 1, 2, and 3
    e1 = {r['slug'] for r in supabase.table("market_data").select("slug").eq("status", "published").execute().data or []}
    e2 = {r['slug'] for r in supabase.table("verdict_reports").select("slug").eq("is_published", True).execute().data or []}
    e3 = {r['slug'] for r in supabase.table("public_seo_reports").select("slug").eq("is_published", True).execute().data or []}
    
    db_truth = e1 | e2 | e3
    print(f"✅ DB Truth: {len(db_truth)} total published records found.")

    # --- 3. THE FORENSIC COMPARISON ---
    missing_from_sitemap = db_truth - sitemap_slugs
    zombies_in_sitemap = sitemap_slugs - db_truth
    
    # Catching the 'Double-City' bug in the live file
    stuttering_slugs = [s for s in sitemap_slugs if re.search(r'-in-([a-z-]+)-in-\1', s)]

    # --- 4. FINAL HEALTH DASHBOARD ---
    print("\n" + "="*60)
    print("📊 LIVE SITEMAP INTEGRITY REPORT")
    print("="*60)
    
    print(f"\n🧱 [COVERAGE]")
    print(f"   • Database (What should be live) : {len(db_truth)}")
    print(f"   • Sitemap (What Google sees)     : {len(sitemap_slugs)}")
    
    if len(missing_from_sitemap) == 0 and len(zombies_in_sitemap) == 0:
        print(f"   • Sync Status                    : ✅ PERFECT ALIGNMENT")
    else:
        print(f"   • Sync Status                    : ⚠️ MISMATCH DETECTED")

    print(f"\n🚨 [CRITICAL LEAKS]")
    print(f"   • Missing Pages (Invisible)      : {len(missing_from_sitemap)}")
    print(f"   • Zombie Links (404 Risk)        : {len(zombies_in_sitemap)}")
    print(f"   • Double-City Errors             : {len(stuttering_slugs)}")

    if missing_from_sitemap:
        print("\n📍 TOP MISSING (Need to regenerate sitemap):")
        for s in list(missing_from_sitemap)[:5]:
            print(f"   -> {s}")

    if zombies_in_sitemap:
        print("\n📍 TOP ZOMBIES (Old URLs still live!):")
        for z in list(zombies_in_sitemap)[:5]:
            print(f"   -> {z}")

    print("\n" + "="*60)
    print("🏁 Final Audit Complete.")
    print("="*60 + "\n")

if __name__ == "__main__":
    run_sitemap_file_audit()