import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def build_local_knowledge_bridges():
    print("🏗️  Building pSEO City Knowledge Bridges (V3.3)...")
    
    try:
        # Fetch data
        response = supabase.table("public_seo_reports")\
            .select("slug, idea_title, location_label, logic_score")\
            .eq("is_published", True)\
            .execute()
        data = response.data
    except Exception as e:
        print(f"❌ Database Read Error: {e}")
        return

    if not data:
        print("📭 No published pSEO reports found.")
        return

    # Grouping logic
    city_clusters = {}
    for row in data:
        label = row.get('location_label') or "Unknown, Unknown"
        parts = [p.strip() for p in label.split(',')]
        
        city = parts[0] if len(parts) > 0 else "Unknown"
        region = parts[1] if len(parts) > 1 else "Unknown"
        
        cluster_key = (city, region)
        if cluster_key not in city_clusters:
            city_clusters[cluster_key] = []
        city_clusters[cluster_key].append(row)

    success_count = 0

    for (city, region), reports in city_clusters.items():
        print(f"🔗 Linking {len(reports)} reports in {city}, {region}...")
        
        # Sort by logic_score
        sorted_reports = sorted(reports, key=lambda x: int(x.get('logic_score') or 0), reverse=True)
        
        # Build Top 5 (Pass as LIST, not stringified JSON)
        top_5_summary = [
            {
                "slug": r['slug'],
                "title": r['idea_title'],
                "score": r['logic_score']
            } for r in sorted_reports[:5]
        ]

        hub_data = {
            "city_name": city,
            "region": region,
            "report_count": len(reports),
            "top_reports": top_5_summary, # Supabase-py handles the serialization
            "all_slugs": [r['slug'] for r in reports]
        }
        
        try:
            supabase.table("local_city_hubs")\
                .upsert(hub_data, on_conflict="city_name, region")\
                .execute()
            success_count += 1
        except Exception as e:
            print(f"⚠️ Upsert Failed for {city}: {e}")

    print(f"✅ pSEO Bridges built successfully for {success_count} cities.")

if __name__ == "__main__":
    build_local_knowledge_bridges()