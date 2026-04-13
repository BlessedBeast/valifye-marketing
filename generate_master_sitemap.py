import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def generate_xml_sitemap():
    print("🏗️  Generating Master Sitemap from DB Truth...")

    # Fetch ALL Slugs from ALL 3 Engines
    e1 = supabase.table("market_data").select("slug").eq("status", "published").execute().data or []
    e2 = supabase.table("verdict_reports").select("slug").eq("is_published", True).execute().data or []
    e3 = supabase.table("public_seo_reports").select("slug").eq("is_published", True).execute().data or []

    all_slugs = [r['slug'] for r in e1 + e2 + e3]
    
    xml_header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    url_template = "  <url>\n    <loc>https://valifye.com/ideas/{slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n"

    # We write it to 'new sitemap.txt' as your check_sitemap.py expects
    with open("new sitemap.txt", "w", encoding="utf-8") as f:
        f.write(xml_header)
        for slug in all_slugs:
            # Clean slug to ensure no double-city bugs remained
            f.write(url_template.format(slug=slug))
        f.write('</urlset>')

    print(f"✅ Success! Generated 'new sitemap.txt' with {len(all_slugs)} URLs.")

if __name__ == "__main__":
    generate_xml_sitemap()