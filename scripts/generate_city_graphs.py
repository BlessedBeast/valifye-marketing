import os
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def build_knowledge_bridges():
    print("🏗️  Building City Knowledge Bridges...")
    
    # 1. Get all published niches
    data = supabase.table("market_data")\
        .select("city, region, niche, slug, opportunity_score")\
        .eq("status", "published")\
        .execute().data

    if not data:
        print("⚠️ No published data found to cluster.")
        return

    # 2. Group niches by City
    city_clusters = {}
    for row in data:
        city = row['city']
        if city not in city_clusters:
            city_clusters[city] = []
        city_clusters[city].append(row)

    for city, niches in city_clusters.items():
        print(f"🔗 Connecting {len(niches)} niches in {city}...")
        
        # 3. Sort by opportunity score to find the 'Top 5'
        sorted_niches = sorted(niches, key=lambda x: int(x.get('opportunity_score') or 0), reverse=True)
        
        hub_data = {
            "city_name": city,
            "region": niches[0]['region'],
            "niche_count": len(niches),
            "top_niches": sorted_niches[:5], # The 'Elite' opportunities
            "all_slugs": [n['slug'] for n in niches], # Every niche in this city
        }
        
        # 4. Upsert into city_hubs
        supabase.table("city_hubs").upsert(hub_data, on_conflict="city_name").execute()

    print("✅ Knowledge Graph Updated. Your 'Islands' are now 'Bridges'.")

if __name__ == "__main__":
    build_knowledge_bridges()