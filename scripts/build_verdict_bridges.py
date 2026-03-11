import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# Mapping logic to categorize global reports into Industries
def get_industry_category(title):
    title = title.lower()
    if any(k in title for k in ['iot', 'sensor', 'tracking', 'hardware']): return 'IoT & Hardware'
    if any(k in title for k in ['ai', 'bot', 'gpt', 'llm', 'prompt']): return 'Artificial Intelligence'
    if any(k in title for k in ['health', 'med', 'bio', 'clinic']): return 'HealthTech & Bio'
    if any(k in title for k in ['tax', 'fin', 'saas', 'crm', 'pay']): return 'FinTech & B2B SaaS'
    if any(k in title for k in ['solar', 'green', 'eco', 'esg']): return 'Sustainability & Energy'
    return 'Emerging Tech'

def build_verdict_knowledge_bridges():
    print("🏗️  Building Industry Knowledge Bridges for Verdict Reports...")
    
    # 1. Get all generated validation reports
    data = supabase.table("verdict_reports")\
        .select("slug, idea_title, overall_integrity_score")\
        .execute().data

    if not data:
        print("📭 No verdict reports found to cluster.")
        return

    # 2. Group reports by Industry
    industry_clusters = {}
    for row in data:
        industry = get_industry_category(row['idea_title'])
        if industry not in industry_clusters:
            industry_clusters[industry] = []
        industry_clusters[industry].append(row)

    for industry, reports in industry_clusters.items():
        print(f"🔗 Linking {len(reports)} forensic audits in {industry}...")
        
        # 3. Sort by integrity score to find the 'Highest Conviction' audits
        sorted_reports = sorted(reports, key=lambda x: int(x.get('overall_integrity_score') or 0), reverse=True)
        
        top_5_summary = []
        for r in sorted_reports[:5]:
            top_5_summary.append({
                "slug": r['slug'],
                "title": r['idea_title'],
                "score": r['overall_integrity_score']
            })

        hub_data = {
            "industry_name": industry,
            "report_count": len(reports),
            "top_verdicts": top_5_summary,
            "all_slugs": [r['slug'] for r in reports]
        }
        
        # 4. Upsert into verdict_industry_hubs
        supabase.table("verdict_industry_hubs").upsert(hub_data, on_conflict="industry_name").execute()

    print(f"✅ Industry Bridges built for {len(industry_clusters)} sectors.")

if __name__ == "__main__":
    build_verdict_knowledge_bridges()