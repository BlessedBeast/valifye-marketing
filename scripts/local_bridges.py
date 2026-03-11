import os
import json
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase Client
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def build_local_knowledge_bridges():
    print("🏗️  Building pSEO City Knowledge Bridges (V3.2)...")
    
    # 1. Get all generated local reports
    try:
        response = supabase.table("public_seo_reports")\
            .select("slug, idea_title, location_label, logic_score, report_data")\
            .execute()
        data = response.data
    except Exception as e:
        print(f"❌ Database Read Error: {e}")
        return

    if not data:
        print("📭 No pSEO reports found to cluster.")
        return

    # 2. Group reports by City and Region
    # We use a tuple (city, region) as the key to match DB constraints
    city_clusters = {}
    for row in data:
        # location_label is usually "City, Region" (e.g., "Austin, TX")
        label = row.get('location_label') or "Unknown, Unknown"
        parts = [p.strip() for p in label.split(',')]
        
        city = parts[0] if len(parts) > 0 else "Unknown"
        region = parts[1] if len(parts) > 1 else "Unknown"
        
        cluster_key = (city, region)
        
        if cluster_key not in city_clusters:
            city_clusters[cluster_key] = []
        city_clusters[cluster_key].append(row)

    success_count = 0

    # 3. Process each cluster
    for (city, region), reports in city_clusters.items():
        print(f"🔗 Linking {len(reports)} market audits in {city}, {region}...")
        
        # Sort by logic_score (descending) to find top opportunities
        sorted_reports = sorted(reports, key=lambda x: float(x.get('logic_score') or 0), reverse=True)
        
        # Build the top 5 summary list
        top_5_summary = []
        for r in sorted_reports[:5]:
            top_5_summary.append({
                "slug": r['slug'],
                "title": r['idea_title'],
                "score": r['logic_score']
            })

        # Prepare the payload to match local_city_hubs table
        hub_data = {
            "city_name": city,
            "region": region,
            "report_count": len(reports),
            # Explicitly stringify JSON for DB stability
            "top_reports": json.dumps(top_5_summary),
            "all_slugs": [r['slug'] for r in reports]
        }
        
        # 4. Upsert into local_city_hubs matching the composite unique constraint
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