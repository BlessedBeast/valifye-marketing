import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def build_knowledge_bridges():
    print("🏗️  Building City Knowledge Bridges...")
    
    # 1. Get all published niches and their cities
    data = supabase.table("market_data")\
        .select("city, region, niche, slug, opportunity_score")\
        .eq("status", "published")\
        .execute().data

    # 2. Group niches by City
    city_clusters = {}
    for row in data:
        city = row['city']
        if city not in city_clusters:
            city_clusters[city] = []
        city_clusters[city].append(row)

    for city, niches in city_clusters.items():
        print(f"🔗 Connecting {len(niches)} niches in {city}...")
        
        # 3. Create a 'City Hub' metadata entry
        # This can be used to power a "Other Opportunities in {City}" sidebar
        hub_data = {
            "city_name": city,
            "region": niches[0]['region'],
            "niche_count": len(niches),
            "top_niches": sorted(niches, key=lambda x: x['opportunity_score'] or 0, reverse=True)[:5],
            "all_slugs": [n['slug'] for n in niches]
        }
        
        # Upsert into a 'city_hubs' table (Ensure this table exists in Supabase)
        supabase.table("city_hubs").upsert(hub_data, on_conflict="city_name").execute()

if __name__ == "__main__":
    build_knowledge_bridges()