import os
import json
import time
import re
import googlemaps
import requests
from datetime import datetime, timezone
from typing import Any, Dict
from dotenv import load_dotenv
from supabase import create_client
from google import genai

load_dotenv()

# Initialize Clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_PLACES_API_KEY"))

# PRODUCTION CONSTANTS
MODEL_NAME = "gemini-2.5-flash" 
BATCH_LIMIT = 50 
THROTTLE_TIME = 8  # Balanced for speed and API safety

def forensic_slugify(text: str) -> str:
    """
    Forensic slug normalizer for niche and city labels.
    Ensures:
      - lowercase
      - non-alphanumerics collapsed into single hyphens
      - removes leading/trailing/double hyphens
    """
    if not isinstance(text, str):
        text = str(text or "")
    value = text.lower().strip()
    # Collapse any non-alphanumeric runs into hyphens
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    # Final cleanup
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value

# --- 1. HARVESTER: TEXT-SEARCH UPGRADE ---
def harvest_local_evidence(niche, city, region):
    """
    Forensic Harvester: Uses Text Search instead of Nearby Search.
    This provides 'thicker' competitor data and broader local SEO meat.
    """
    search_query = f"best {niche} in {city}, {region}"
    print(f"📡 Harvesting Forensic Evidence for: {search_query}")
    
    try:
        # A: Get broad search results
        places_res = gmaps.places(query=search_query)
        
        competitor_details = []
        # Limiting to top 5 for maximum quality/review density
        for p in places_res.get('results', [])[:5]:
            time.sleep(0.5) 
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
            "competitors": competitor_details,
            "total_found": len(places_res.get('results', []))
        }
    except Exception as e:
        print(f"⚠️ Maps API Failure: {e}")
        return None

# --- 2. THICK GENERATOR: NARRATIVE SYNTHESIS ---
def generate_thick_report(seed, harvested_data):
    niche = seed['niche']
    city = seed['city']
    region = seed['region']
    
    competitors = harvested_data.get('competitors', []) if harvested_data else []
    competitor_context = json.dumps(competitors, indent=2) if competitors else "NO_DIRECT_MAPS_DATA_FOUND"

    # THE FORENSIC PROMPT: Prevents 'Insufficient Evidence' errors.
    prompt = f"""
    You are the Lead Analyst at Valifye Forensic Intelligence. 
    Task: Draft a high-density, professional Market Audit for a '{niche}' in {city}, {region}.

    RAW COMPETITOR DATA:
    {competitor_context}

    THICKNESS REQUIREMENTS:
    1. If COMPETITOR DATA is missing, do NOT state "I cannot analyze". Instead, synthesize a report based on {city}'s known demographics, high-traffic corridors, and urban lifestyle trends.
    2. MINIMUM LENGTH: 2500 characters of clean text.
    3. MANDATORY JSON STRUCTURE:
       - 'verdict': (BUILD, PIVOT, or KILL)
       - 'logic_score': (0-100 based on market saturation vs demand)
       - 'executive_summary': (Deep narrative analysis, min 300 words)
       - 'micro_tam': {{ "realistic": "$", "optimistic": "$", "calculation_basis": "..." }}
       - 'entry_playbook': [5 specific, localized tactical steps]
       - 'market_gaps': [List of specific underserved needs in {city}]
       - 'review_sentiment_audit': {{ "top_praises": [], "top_complaints": [] }}
       - 'meta_description': (High-CTR SEO snippet)

    Style: Professional, Cold, Tactical. 
    Return ONLY raw valid JSON.
    """

    try:
        response = gemini_client.models.generate_content(
            model=MODEL_NAME, 
            contents=prompt,
            config={'response_mime_type': 'application/json', 'temperature': 0.4} 
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return None

# --- 3. MAIN FACTORY LOOP ---
def process_seo_factory():
    print(f"🏭 Factory Initializing. Syncing Local Intelligence...")
    
    # Get seeds from your content table
    response = supabase.table("local_reports_content").select("*").eq("is_generated", False).limit(BATCH_LIMIT).execute()
    seeds = response.data or []

    if not seeds:
        print("📭 Factory Idle. No new seeds.")
        return

    for index, seed in enumerate(seeds):
        try:
            print(f"\n--- [{index+1}/{len(seeds)}] ANALYZING: {seed['niche']} in {seed['city']} ---")
            
            # Step 1: Harvest
            evidence = harvest_local_evidence(seed['niche'], seed['city'], seed['region'])
            
            # Step 2: Generate
            report_json = generate_thick_report(seed, evidence)

            if report_json:
                niche_slug = forensic_slugify(seed.get("niche", ""))
                city_slug = forensic_slugify(seed.get("city", ""))
                slug = f"{niche_slug}-{city_slug}-market-audit"
                
                # Step 3: Upsert to public_seo_reports (Matching your table definition)
                supabase.table("public_seo_reports").upsert({
                    "slug": slug,
                    "idea_title": f"Market Audit: {seed['niche']} in {seed['city']}",
                    "business_type": seed.get('business_shape', 'Retail'),
                    "location_label": f"{seed['city']}, {seed['region']}",
                    "report_type": "forensic-audit",
                    "report_data": report_json,
                    "logic_score": int(report_json.get('logic_score', 0)),
                    "verdict": str(report_json.get('verdict', 'PENDING')),
                    "meta_description": report_json.get('meta_description', ''),
                    "is_published": False 
                }, on_conflict="slug").execute()

                # Step 4: Mark Seed as Generated
                supabase.table("local_reports_content").update({"is_generated": True}).eq("id", seed['id']).execute()
                print(f"✅ Forensic Report Symmetrized: {slug}")
                
            time.sleep(THROTTLE_TIME) 
                
        except Exception as e:
            print(f"❌ Factory Fault: {e}")
            continue

if __name__ == "__main__":
    process_seo_factory()