import os
import time
import datetime
import json
from dotenv import load_dotenv
from supabase import create_client
from google import genai
from pydantic import BaseModel

# Load environment variables
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

current_year = datetime.datetime.now().year

# --- THE IRONCLAD SCHEMA ---
# This forces Gemini to return EXACTLY this structure. No missing keys, no arrays of objects instead of strings.
class UnitEconomics(BaseModel):
    unit_price: int
    margin_pct: int
    fixed_costs_monthly: int
    rent_impact: str
    logic: str

class BlueprintSchema(BaseModel):
    local_friction: list[str]
    gtm_playbook: list[str]
    failure_modes: str
    unit_economics: UnitEconomics
    market_narrative: str
    opportunity_score: int
    difficulty_score: int
    trend: str
    breakeven_months: int

def thicken_blueprint(row):
    """Takes a thin DB row and forces the AI to construct a flawless Blueprint."""
    niche = row['niche']
    city = row['city']
    
    print(f"💉 Injecting Forensic Blueprint Data for: {niche} in {city}...")

    prompt = f"""
    Role: {current_year} Brutal Business Validator.
    Context: {niche} in {city}, {row.get('region', '')}.

    TASK: This database row has missing or thin data. Reconstruct a hyper-local Validation Blueprint.
    You MUST provide "Information Gain": specific authorities, corridors, or infrastructure projects in {city}.

    REQUIREMENTS:
    1. local_friction: Provide exactly 3 specific local hurdles (Strings only).
    2. gtm_playbook: Provide exactly 3 hyper-local entry steps (Strings only).
    3. failure_modes: A brutal 2-sentence warning on HOW a founder will go bankrupt here.
    4. unit_economics: Strict financial estimates for {current_year}.
    5. market_narrative: A dense, 300-word authoritative summary of this market.
    """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            # FIXED: Using 2.0-flash and enforcing the response_schema
            response = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': BlueprintSchema,
                    'temperature': 0.1 # Low temp for data integrity
                }
            )
            
            # The SDK automatically parses the JSON when using response_schema
            # We just need to convert the Pydantic object back to a dict for Supabase
            return json.loads(response.text)
            
        except Exception as e:
            print(f"⚠️ API Overloaded (Attempt {attempt+1}/{max_retries}). Error: {str(e)[:50]}")
            time.sleep(5)
            
    return None

def run_blueprint_thickener(limit=50):
    print("🕵️ Scanning 'market_data' for thin Blueprints (Targeting Drafts & Thin Published Pages)...")
    
    # THE FORENSIC QUERY:
    # Target 1: Anything explicitly marked draft/pending
    # Target 2: Anything published but missing the 'local_friction' array
    # Target 3: Anything published but stuck on the default opportunity_score of 50
    response = supabase.table("market_data")\
        .select("*")\
        .or_("status.in.(draft,pending),local_friction.is.null,opportunity_score.eq.50")\
        .order("updated_at", desc=False)\
        .limit(limit)\
        .execute()
        
    rows = response.data or []

    if not rows:
        print("📭 No thin blueprints found. Your database is fully hardened.")
        return

    updated_count = 0

    for row in rows:
        # Check if the arrays are actually empty before spending credits
        friction = row.get('local_friction')
        gtm = row.get('gtm_playbook')
        
        # The Safety Net: If a row somehow sneaks through the query but is actually thick, skip it.
        if friction and len(friction) >= 2 and gtm and len(gtm) >= 2 and row.get('opportunity_score') != 50:
            print(f"⏩ {row['slug']} is already thick. Skipping.")
            # Ensure status is published so we don't catch it in a weird state again
            if row.get('status') != 'published':
                supabase.table("market_data").update({"status": "published"}).eq("id", row['id']).execute()
            continue

        # Trigger Thickening
        new_data = thicken_blueprint(row)
        
        if new_data:
            try:
                # Upsert the perfectly structured JSON directly into Supabase
                supabase.table("market_data").update({
                    "market_narrative": new_data['market_narrative'],
                    "local_friction": new_data['local_friction'],
                    "gtm_playbook": new_data['gtm_playbook'],
                    "failure_modes": new_data['failure_modes'],
                    "unit_economics": new_data['unit_economics'],
                    "opportunity_score": new_data['opportunity_score'],
                    "difficulty_score": new_data['difficulty_score'],
                    "trend": new_data['trend'],
                    "breakeven_months": new_data['breakeven_months'],
                    "status": "published", # Keep/Move to published
                    "updated_at": datetime.datetime.utcnow().isoformat() # Mark it as fresh
                }).eq("id", row['id']).execute()
                
                print(f"✅ Thickened & Upgraded: {row['slug']} | Score: {new_data['opportunity_score']}")
                updated_count += 1
                time.sleep(4) # Protect against quota limits (15 requests per minute)
                
            except Exception as e:
                print(f"⚠️ Supabase Update failed for {row['slug']}: {e}")

    print(f"\n🏁 Mission Complete. {updated_count} Blueprints were structurally upgraded.")

if __name__ == "__main__":
    run_blueprint_thickener(limit=500)