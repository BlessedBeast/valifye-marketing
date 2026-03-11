import os
import json
import time
import re
import googlemaps
import requests
from dotenv import load_dotenv
from supabase import create_client
from google import genai

load_dotenv()

# DIAGNOSTIC: Ensure we are talking to the right server
try:
    current_ip = requests.get('https://api.ipify.org').text
    print(f"🖥️  System Online. IP: {current_ip}")
except:
    pass

# Initialize Clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_PLACES_API_KEY"))

# PRODUCTION CONSTANTS
MODEL_NAME = "gemini-2.5-flash"  # Use stable production string
BATCH_LIMIT = 50                 # Increased as requested
THROTTLE_TIME = 10               # Seconds to wait between reports


def forensic_slugify(text: str) -> str:
    """
    Normalizes arbitrary niche/city strings into URL-safe slugs.

    - Lowercases the text.
    - Replaces spaces, slashes, backslashes, ampersands, and underscores with hyphens.
    - Strips any character that isn't a letter, number, or hyphen.
    - Collapses multiple hyphens into a single hyphen.
    - Trims hyphens from the start and end of the string.
    """
    if not isinstance(text, str):
        text = str(text or "")

    # Lowercase and strip extra whitespace
    value = text.strip().lower()

    # Replace separators & unsafe punctuation with hyphens
    value = re.sub(r"[\\\/&_\s]+", "-", value)

    # Remove anything that's not a-z, 0-9, or hyphen
    value = re.sub(r"[^a-z0-9\-]", "", value)

    # Collapse multiple hyphens
    value = re.sub(r"-{2,}", "-", value)

    # Trim leading/trailing hyphens
    return value.strip("-")

# --- 1. BUSINESS TYPE MAPPING ---
def map_business_type(niche, business_type_input):
    combined = f"{niche} {business_type_input}".lower()
    mapping = {
        'cafe': ['cafe', 'coffee'],
        'bakery': ['bakery'],
        'bar': ['bar', 'pub'],
        'gym': ['gym', 'fitness'],
        'hair_salon': ['salon', 'beauty'],
        'pharmacy': ['pharmacy'],
        'laundry': ['laundry'],
        'spa': ['spa', 'wellness'],
        'restaurant': ['restaurant', 'food'],
    }
    for key, keywords in mapping.items():
        if any(kw in combined for kw in keywords):
            return key
    return 'establishment'

# --- 2. GOOGLE MAPS HARVESTER (Stable Buffers) ---
def harvest_local_evidence(niche, city, region, business_type):
    location_query = f"{city}, {region}"
    print(f"📡 Harvesting Real Evidence for {niche} in {location_query}...")
    
    try:
        # A: Geocode
        geo_res = gmaps.geocode(location_query)
        if not geo_res: return None
        latlng = geo_res[0]['geometry']['location']
        
        # B: Search Nearby
        g_type = map_business_type(niche, business_type)
        places_res = gmaps.places_nearby(
            location=latlng,
            radius=1500, 
            type=g_type
        )
        
        competitor_details = []
        # Limiting to top 5 for quality
        for p in places_res.get('results', [])[:5]:
            time.sleep(0.8) # 🟢 STABLE: Prevents Places API detail spikes
            details = gmaps.place(
                place_id=p['place_id'],
                fields=['name', 'rating', 'user_ratings_total', 'reviews', 'price_level']
            ).get('result', {})
            
            competitor_details.append({
                "name": details.get('name'),
                "rating": details.get('rating'),
                "reviews_count": details.get('user_ratings_total'),
                "price_level": details.get('price_level'),
                "sample_reviews": [r['text'][:300] for r in details.get('reviews', [])[:3]]
            })
            
        return {
            "latlng": latlng,
            "competitors": competitor_details,
            "total_found": len(places_res.get('results', []))
        }
    except Exception as e:
        print(f"⚠️ Maps API Failure: {e}")
        return None

# --- 3. JSON CLEANER ---
def clean_json_string(raw_string):
    clean = re.sub(r"```json|```", "", raw_string).strip()
    clean = re.sub(r",\s*([\]}])", r"\1", clean)
    return clean

# --- 4. THE THICK GENERATOR ---
def generate_thick_report(seed, harvested_data):
    niche = seed['niche']
    city = seed['city']
    competitor_context = json.dumps(harvested_data.get('competitors', []), indent=2) if harvested_data else "No live data."
    
    prompt = f"Analyze market for '{niche}' in {city}. EVIDENCE: {competitor_context}. Return valid JSON."

    try:
        response = gemini_client.models.generate_content(
            model=MODEL_NAME, 
            contents=prompt,
            config={'temperature': 0.3} 
        )
        return json.loads(clean_json_string(response.text))
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return None

# --- 5. MAIN PROCESSOR (The Loop) ---
def process_seo_factory():
    print(f"🏭 Factory Initializing. Target Batch: {BATCH_LIMIT} reports.")
    
    response = supabase.table("local_reports_content")\
        .select("*")\
        .eq("is_generated", False)\
        .limit(BATCH_LIMIT)\
        .execute()
    
    seeds = response.data or []
    if not seeds:
        print("📭 Nothing to process.")
        return

    total = len(seeds)
    for index, seed in enumerate(seeds):
        current_num = index + 1
        try:
            print(f"\n--- [{current_num}/{total}] PROCESSING: {seed['niche']} ---")
            
            # Step 1: Maps Data
            evidence = harvest_local_evidence(seed['niche'], seed['city'], seed['region'], seed.get('business_shape', 'store'))
            
            time.sleep(2) # 🟢 STABLE: Rest between APIs

            # Step 2: Gemini Generation
            report_json = generate_thick_report(seed, evidence)

            if report_json:
                niche_slug = forensic_slugify(seed.get("niche", ""))
                city_slug = forensic_slugify(seed.get("city", ""))
                slug = f"{niche_slug}-{city_slug}-market-audit"
                
                # Step 3: Save to DB
                supabase.table("public_seo_reports").upsert({
                    "slug": slug,
                    "idea_title": f"Market Audit: {seed['niche']} in {seed['city']}",
                    "business_type": seed.get('business_shape', 'Retail'),
                    "location_label": f"{seed['city']}, {seed['region']}",
                    "report_type": "forensic-audit",
                    "report_data": report_json,
                    "is_published": False 
                }, on_conflict="slug").execute()

                # Step 4: Finalize Seed
                supabase.table("local_reports_content").update({"is_generated": True}).eq("id", seed['id']).execute()
                print(f"✅ Generated: {slug}")
                
            # Step 5: Safety Cooling
            if current_num < total:
                print(f"💤 Cooling down ({THROTTLE_TIME}s) to maintain stability...")
                time.sleep(THROTTLE_TIME) 
                
        except Exception as e:
            print(f"❌ Seed {seed.get('id')} failed: {e}")
            continue

if __name__ == "__main__":
    process_seo_factory()