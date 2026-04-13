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

# --- THE SYNTHESIS ENGINE (WITH RETRY LOGIC) ---
def thicken_blueprint(row):
    niche = row.get('niche', 'Unknown Niche')
    city = row.get('city', 'Unknown City')
    region = row.get('region', '')
    
    print(f"🧬  Synthesizing Substance for: {niche} in {city}...")

    prompt = f"""
    Role: {CURRENT_YEAR} Brutal Business Validator.
    Context: {niche} in {city}, {region}.
    TASK: Reconstruct a hyper-local Validation Blueprint with Information Gain.
    """

    # --- RETRY BLOCK: Exponential Backoff ---
    max_retries = 5
    wait_time = 5 # Start with 5 seconds

    for attempt in range(max_retries):
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
            if "503" in str(e) or "overloaded" in str(e).lower():
                print(f"⚠️  Server Busy (Attempt {attempt+1}/{max_retries}). Retrying in {wait_time}s...")
                time.sleep(wait_time)
                wait_time *= 2 # Double the wait time for the next attempt
            else:
                print(f"❌ Gemini Error: {str(e)[:100]}")
                return None
    
    print(f"🛑 Giving up on {niche} after {max_retries} attempts.")
    return None

# --- THE MAIN SCANNER ---
def run_forensic_thickener(limit=50):
    print("\n" + "="*60)
    print("🕵️  ENGINE 1: SELF-HEALING THICKENER STARTING")
    print("="*60)
    
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # PHASE 1: TARGET GHOSTS (The 13 Pending Pages)
    ghosts = supabase.table("market_data")\
        .select("*")\
        .ilike("market_narrative", "%pending%")\
        .execute().data or []
    
    # PHASE 2: TARGET DRAFTS
    drafts = supabase.table("market_data")\
        .select("*")\
        .eq("status", "draft")\
        .limit(limit)\
        .execute().data or []

    queue = ghosts + drafts
    
    if not queue:
        print("📭 No targets found.")
        return

    updated_count = 0
    for row in queue:
        is_ghost = "pending" in str(row.get('market_narrative', "")).lower()
        prefix = "💉 [REPAIRING GHOST]" if is_ghost else "🏗️ [THICKENING DRAFT]"
        
        new_data = thicken_blueprint(row)
        
        if new_data:
            try:
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
                    "published_at": now_iso
                }).eq("id", row['id']).execute()
                
                print(f"{prefix} SUCCESS: {row['slug']}")
                updated_count += 1
                # Increase sleep between rows to reduce pressure on the API
                time.sleep(5) 
                
            except Exception as e:
                print(f"⚠️ Update failed for {row['slug']}: {e}")

    print(f"\n🏁 MISSION COMPLETE: {updated_count} Blueprints Hardened.")

if __name__ == "__main__":
    run_forensic_thickener(limit=100)