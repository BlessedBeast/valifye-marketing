import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def build_local_knowledge_bridges():
    print("🏗️  Building pSEO City Knowledge Bridges...")
    
    # 1. Get all generated local reports
    # We fetch location_label to group by city
    data = supabase.table("public_seo_reports")\
        .select("slug, idea_title, location_label, logic_score, report_data")\
        .execute().data

    if not data:
        print("📭 No pSEO reports found to cluster.")
        return

    # 2. Group reports by City
    city_clusters = {}
    for row in data:
        # location_label is usually "City, Region" (e.g., "Austin, TX")
        city = row['location_label'].split(',')[0].strip()
        region = row['location_label'].split(',')[1].strip() if ',' in row['location_label'] else ""
        
        if city not in city_clusters:
            city_clusters[city] = {"region": region, "reports": []}
        city_clusters[city]["reports"].append(row)

    for city, cluster in city_clusters.items():
        reports = cluster["reports"]
        print(f"🔗 Linking {len(reports)} market audits in {city}...")
        
        # 3. Sort by logic_score to find the 'High Conviction' opportunities
        sorted_reports = sorted(reports, key=lambda x: int(x.get('logic_score') or 0), reverse=True)
        
        # Clean data for the top 5 list (don't store the whole report_data)
        top_5_summary = []
        for r in sorted_reports[:5]:
            top_5_summary.append({
                "slug": r['slug'],
                "title": r['idea_title'],
                "score": r['logic_score']
            })

        hub_data = {
            "city_name": city,
            "region": cluster["region"],
            "report_count": len(reports),
            "top_reports": top_5_summary,
            "all_slugs": [r['slug'] for r in reports]
        }
        
        # 4. Upsert into local_city_hubs
        supabase.table("local_city_hubs").upsert(hub_data, on_conflict="city_name").execute()

    print(f"✅ pSEO Bridges built for {len(city_clusters)} cities.")

if __name__ == "__main__":
    build_local_knowledge_bridges()