import os
import json
import re
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_industry_category(title):
    """Forensic classification logic for grouping reports into sectors."""
    title = title.lower()
    if any(k in title for k in ['iot', 'sensor', 'tracking', 'hardware']): 
        return 'IoT & Hardware'
    if any(k in title for k in ['ai', 'bot', 'gpt', 'llm', 'prompt', 'agent']): 
        return 'Artificial Intelligence'
    if any(k in title for k in ['health', 'med', 'bio', 'clinic', 'wellness']): 
        return 'HealthTech & Bio'
    if any(k in title for k in ['tax', 'fin', 'saas', 'crm', 'pay', 'billing']): 
        return 'FinTech & B2B SaaS'
    if any(k in title for k in ['solar', 'green', 'eco', 'esg', 'energy']): 
        return 'Sustainability & Energy'
    return 'Emerging Tech'

def generate_sector_slug(name):
    """Generates a URL-safe slug that matches the DB constraint."""
    slug = name.lower()
    slug = slug.replace('&', 'and')
    # Replace anything not alphanumeric or space with empty
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug).strip('-')
    return slug

def build_verdict_knowledge_bridges():
    print("🏗️  Building Industry Knowledge Bridges (V5.0 - Slug Sync)...")
    
    # 1. Fetch all generated validation reports
    try:
        response = supabase.table("verdict_reports")\
            .select("slug, idea_title, overall_integrity_score")\
            .execute()
        data = response.data
    except Exception as e:
        print(f"❌ Database Read Error: {e}")
        return

    if not data:
        print("📭 No verdict reports found in 'verdict_reports' to cluster.")
        return

    # 2. Group reports by Industry
    industry_clusters = {}
    for row in data:
        industry = get_industry_category(row['idea_title'])
        if industry not in industry_clusters:
            industry_clusters[industry] = []
        industry_clusters[industry].append(row)

    success_count = 0

    # 3. Process and Upsert each Industry Cluster
    for industry, reports in industry_clusters.items():
        print(f"🔗 Linking {len(reports)} forensic audits in {industry}...")
        
        # Sort by integrity score to find the 'Highest Conviction' audits
        sorted_reports = sorted(reports, key=lambda x: float(x.get('overall_integrity_score') or 0), reverse=True)
        
        top_5_summary = []
        for r in sorted_reports[:5]:
            top_5_summary.append({
                "slug": r['slug'],
                "title": r['idea_title'],
                "score": r['overall_integrity_score']
            })

        # THE FIX: Generate the sector_slug to satisfy the unique constraint
        sector_slug = generate_sector_slug(industry)

        hub_data = {
            "industry_name": industry,
            "sector_slug": sector_slug,
            "report_count": len(reports),
            "top_verdicts": json.dumps(top_5_summary), # JSONB Safety
            "all_slugs": [r['slug'] for r in reports]   # text[] Safety
        }
        
        # 4. Upsert into verdict_industry_hubs
        try:
            # We use on_conflict='industry_name' as the primary key of our logical sync
            supabase.table("verdict_industry_hubs")\
                .upsert(hub_data, on_conflict="industry_name")\
                .execute()
            success_count += 1
            print(f"✅ Synced: {industry} -> /reports/industry/{sector_slug}")
        except Exception as e:
            print(f"⚠️ Failed to upsert {industry}: {e}")

    print(f"\n🏁 Finished. Industry Bridges operational for {success_count} sectors.")

if __name__ == "__main__":
    build_verdict_knowledge_bridges()