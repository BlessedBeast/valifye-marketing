import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# The "Anti-Venom" Dictionary
REPAIR_MAP = {
    "einurgh": "edinburgh",
    "birinham": "birmingham",
    "inapore": "singapore",
    "cinc": "clinic",
    "minenance": "maintenance",
    "sustinble": "sustainable",
    "recycin": "recycling",
    "trinng": "training",
    "inncial": "financial",
    "macin": "machine",
    "venin": "vending"
}

def repair_source_columns():
    print("🩹 Starting Engine 1 Source Repair...")
    
    # Fetch all rows
    rows = supabase.table("market_data").select("id, niche, city").execute().data or []
    repaired_count = 0

    for row in rows:
        original_niche = row['niche']
        original_city = row['city']
        
        new_niche = original_niche
        new_city = original_city

        # Check for mangled words in niche and city
        for mangled, clean in REPAIR_MAP.items():
            if mangled in new_niche.lower():
                new_niche = new_niche.lower().replace(mangled, clean)
            if mangled in new_city.lower():
                new_city = new_city.lower().replace(mangled, clean)

        if new_niche != original_niche or new_city != original_city:
            print(f"🔄 Repairing: {original_city} -> {new_city} | {original_niche} -> {new_niche}")
            supabase.table("market_data").update({
                "niche": new_niche,
                "city": new_city
            }).eq("id", row['id']).execute()
            repaired_count += 1

    print(f"🏁 Repair Complete. {repaired_count} rows restored. Slugs will auto-update in Supabase.")

if __name__ == "__main__":
    repair_source_columns()