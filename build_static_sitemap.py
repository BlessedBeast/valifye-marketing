import os
import re
import unicodedata
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# 1. The Exact TypeScript Slugify Function (Translated to Python)
def slugify(value):
    value = str(value or '')
    # Normalize and remove accents
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = value.lower().strip()
    # Replace non-alphanumeric with dash
    value = re.sub(r'[^a-z0-9]+', '-', value)
    # Remove duplicate dashes
    value = re.sub(r'-+', '-', value)
    # Trim leading/trailing dashes
    return value.strip('-') or 'unknown'

def build_sitemap():
    print("\n" + "="*60)
    print("🏗️  VALIFYE STATIC SITEMAP BUILDER")
    print("="*60)

    BASE_URL = "https://valifye.com"
    today = datetime.utcnow().strftime('%Y-%m-%d')
    urls = []

    # 2. Add Static Routes
    urls.append(f"  <url>\n    <loc>{BASE_URL}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>")
    urls.append(f"  <url>\n    <loc>{BASE_URL}/ideas</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>")

    print("📡 Fetching from all 5 Supabase Tables (Bypassing Limits)...")

    # 3. Fetch All Data
    ideas = supabase.table('market_data').select('slug, updated_at').eq('status', 'published').limit(15000).execute().data or []
    verdicts = supabase.table('verdict_reports').select('slug, published_at').eq('is_published', True).limit(10000).execute().data or []
    industry_hubs = supabase.table('verdict_industry_hubs').select('industry_name').limit(5000).execute().data or []
    seo_reports = supabase.table('public_seo_reports').select('slug, published_at').eq('is_published', True).limit(15000).execute().data or []
    city_hubs = supabase.table('local_city_hubs').select('city_name').limit(5000).execute().data or []

    print(f"📊 Found: {len(ideas)} Blueprints | {len(verdicts)} Verdicts | {len(seo_reports)} Local SEO | {len(industry_hubs)} Ind Hubs | {len(city_hubs)} City Hubs")

    # 4. Map to XML
    # Engine 1: Blueprints
    for p in ideas:
        if p.get('slug'):
            urls.append(f"  <url>\n    <loc>{BASE_URL}/ideas/{p['slug']}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>")

    # Engine 2: Verdicts
    for p in verdicts:
        if p.get('slug') and '-market-audit' not in p['slug']:
            urls.append(f"  <url>\n    <loc>{BASE_URL}/reports/{p['slug']}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>")

    # Engine 3: Local SEO
    for p in seo_reports:
        if p.get('slug'):
            urls.append(f"  <url>\n    <loc>{BASE_URL}/local-reports/report/{p['slug']}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>")

    # Industry Hubs
    for h in industry_hubs:
        if h.get('industry_name'):
            urls.append(f"  <url>\n    <loc>{BASE_URL}/reports/industry/{slugify(h['industry_name'])}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>")

    # City Hubs
    for h in city_hubs:
        if h.get('city_name'):
            urls.append(f"  <url>\n    <loc>{BASE_URL}/local-reports/city/{slugify(h['city_name'])}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>")

    # 5. Deduplicate and Wrap in XML
    unique_urls = list(dict.fromkeys(urls)) # Safely remove duplicates while preserving order
    
    xml_output = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml_output += "\n".join(unique_urls)
    xml_output += '\n</urlset>'

    # 6. Write directly to the Next.js public folder
    output_path = os.path.join("public", "sitemap.xml")
    
    # Ensure public directory exists
    os.makedirs("public", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(xml_output)

    print(f"\n✅ SUCCESS! Generated '{output_path}' with {len(unique_urls)} total URLs.")
    print("="*60 + "\n")

if __name__ == "__main__":
    build_sitemap()