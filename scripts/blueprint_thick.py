import os
import time
import datetime
import json
from dotenv import load_dotenv
from supabase import create_client
from google import genai
from pydantic import BaseModel

load_dotenv()

# Initialize Clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# PRODUCTION CONSTANTS
CURRENT_YEAR = datetime.datetime.now().year
MODEL_NAME = "gemini-2.5-flash" 

# --- THE IRONCLAD SCHEMA ---
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

# --- THE SYNTHESIS ENGINE ---
def thicken_blueprint(row):
    niche = row.get('niche', 'Unknown Niche')
    city = row.get('city', 'Unknown City')
    region = row.get('region', '')
    
    print(f"💉 Injecting Forensic Substance for: {niche} in {city}...")

    prompt = f"""
    Role: {CURRENT_YEAR} Brutal Business Validator.
    Context: {niche} in {city}, {region}.

    TASK: This database row has missing or thin data. Reconstruct a hyper-local Validation Blueprint.
    You MUST provide "Information Gain": specific authorities, corridors, or infrastructure projects in {city}.

    REQUIREMENTS:
    1. local_friction: Provide exactly 3 specific local hurdles.
    2. gtm_playbook: Provide exactly 3 hyper-local entry steps.
    3. failure_modes: A brutal 2-sentence warning on HOW a founder will go bankrupt here.
    4. unit_economics: Strict financial estimates for {CURRENT_YEAR}.
    5. market_narrative: A dense, 300-word authoritative summary of this market.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME, 
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': BlueprintSchema,
                'temperature': 0.2 
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Gemini Error: {str(e)[:50]}")
        return None

# --- THE MAIN SCANNER ---
def run_blueprint_thickener(limit=100):
    print("🕵️ Scanning 'market_data' for Ghost Content and Thin Blueprints...")
    
    # THE FORENSIC QUERY:
    # Matches the exact columns from your DDL (market_narrative, local_friction, status)
    try:
        response = supabase.table("market_data")\
            .select("*")\
            .or_(
                "status.eq.draft,"
                "market_narrative.ilike.%pending%," # TARGETS "Deep Validation Pending"
                "local_friction.is.null"
            )\
            .order("updated_at", desc=False)\
            .limit(limit)\
            .execute()
    except Exception as e:
        print(f"❌ Database Query Error: {e}")
        return
        
    rows = response.data or []
    if not rows:
        print("📭 No thin blueprints found. Factory idle.")
        return

    updated_count = 0
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for row in rows:
        # Final Safety Check: Don't overwrite if it actually looks good
        narrative = str(row.get('market_narrative') or "")
        if "pending" not in narrative.lower() and len(narrative) > 1000 and row.get('local_friction'):
            print(f"⏩ {row['slug']} looks thick enough. Marking 'published'.")
            supabase.table("market_data").update({"status": "published"}).eq("id", row['id']).execute()
            continue

        new_data = thicken_blueprint(row)
        
        if new_data:
            try:
                # Update matching your table schema exactly
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
                    "status": "published", 
                    "updated_at": now_iso,
                    "published_at": now_iso # Trigger freshness signal
                }).eq("id", row['id']).execute()
                
                print(f"✅ Structural Upgrade: {row['slug']} | Score: {new_data['opportunity_score']}")
                updated_count += 1
                time.sleep(4) 
                
            except Exception as e:
                print(f"⚠️ Update failed for {row['slug']}: {e}")

    print(f"\n🏁 Mission Complete. {updated_count} Blueprints transformed.")

if __name__ == "__main__":
    run_blueprint_thickener(limit=500)