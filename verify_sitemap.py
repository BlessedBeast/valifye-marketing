import os
import json
from datetime import datetime, timezone
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
    all_slugs_data = [] # Store tuple of (slug, aeo_score)
    
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
        
        # Track for sitemap
        all_slugs_data.append({"slug": r['slug'], "score": aeo_score})

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

    # 4. Generate the Advanced Sitemap
    generate_advanced_xml(all_slugs_data)

def generate_advanced_xml(slug_data):
    print("🗺️  Publishing AEO-Hardened Sitemap...")
    now_iso = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    base = "https://valifye.com/local-reports/report/"
    
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # A. Static Core (Priority 1.0)
    for path in ['', 'reports', 'reports/industry', 'local-reports']:
        xml += f'  <url>\n    <loc>https://valifye.com/{path}</loc>\n    <lastmod>{now_iso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n'

    # B. pSEO Reports (AEO Variable Priority)
    for entry in slug_data:
        # Scale priority from 0.6 to 0.9 based on AEO score
        # (aeo_score 100 = 0.9 priority | aeo_score 0 = 0.6 priority)
        prio = round(0.6 + (entry['score'] / 100) * 0.3, 2)
        freq = "daily" if entry['score'] > 80 else "weekly"
        
        xml += f'  <url>\n    <loc>{base}{entry["slug"]}</loc>\n    <lastmod>{now_iso}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>\n'

    xml += '</urlset>'
    
    # Save to public folder
    with open("public/sitemap.xml", "w") as f:
        f.write(xml)
    print(f"✅ Sitemap fully symmetrized. AEO scores injected into {len(slug_data)} routes.")

if __name__ == "__main__":
    sync_and_tag_aeo()