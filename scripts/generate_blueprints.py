import os
import json
import time
import datetime
from dotenv import load_dotenv
from supabase import create_client
from google import genai

# Load environment variables
load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Initialize Gemini 2.5 Pro
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Dynamic data currency for prompts
current_year = datetime.datetime.now().year

def expand_to_blueprint(seed):
    """
    Takes a research seed and expands it into a 4-part 'Validation Blueprint'
    optimized for AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization).
    """
    niche = seed['niche']
    city = seed['city']
    
    print(f"🏗️  Building Blueprint & Calculating Scores for: {niche} in {city}...")

    prompt = f"""
    Role: {current_year} Brutal Business Validator.
    Context: {niche} in {city}, {seed['region']}.
    City Intelligence: {seed['city_intel']}
    Expert Strategy Seed: {seed['expert_guide_text']}

    TASK: Expand this data into a structured 'Validation Blueprint'.
    You are writing for the {current_year} to {current_year + 2} economic landscape.
    Do NOT hardcode the year "{current_year}" anywhere; always reason relative to the provided years.

    AEO/GEO Information Gain Requirement:
    - You MUST provide "Information Gain": specific, citable facts about {city} that go beyond generic training data.
    - Name concrete authorities, corridors, policies, infrastructure projects, or neighborhoods that real founders reference.

    1. LOCAL FRICTION: 3 specific local hurdles.
    2. GTM PLAYBOOK: 3 hyper-local steps to find the first 10 customers.
    3. THE PRE-MORTEM: A brutal 2-sentence warning on exactly HOW a founder will go bankrupt.
    
    4. LOCAL UNIT ECONOMICS (MANDATORY HARD METRICS): 
       Provide specific 2026 estimates for this niche in {city}.
       - unit_price: (Integer)
       - margin_pct: (Integer)
       - fixed_costs_monthly: (Integer)
       - rent_impact: "High", "Medium", or "Low"
       - logic: Dense 3-sentence breakdown.

    5. BRUTAL METRICS SCORING (CRITICAL):
       - opportunity_score (0-100)
       - difficulty_score (0-100)
       - saturation_score (0-100)
       - trend_impact: "up", "down", or "flat"
       - breakeven_months (Integer)

    Return ONLY raw JSON with keys: local_friction, gtm_playbook, failure_modes, unit_economics, market_narrative, opportunity_score, difficulty_score, saturation_score, trend_impact, breakeven_months.
    """

    # --- RESILIENCY BLOCK 1: Gemini API Retry ---
    max_retries = 3
    response = None
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro", 
                contents=prompt
            )
            break # Exit loop if successful
        except Exception as e:
            print(f"⚠️ Gemini API Overloaded (Attempt {attempt+1}/{max_retries}). Waiting 5 seconds... Error: {str(e)[:50]}")
            time.sleep(5)
            
    if not response:
        print(f"❌ Skipping {niche} in {city} due to persistent Gemini API failures.")
        return False
    # --------------------------------------------

    try:
        # Clean and parse JSON
        clean_json = response.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_json)

        # --- RESILIENCY BLOCK 2: Supabase Upsert ---
        supabase.table("market_data").upsert({
            "niche": niche,
            "city": city,
            "region": seed['region'],
            "market_narrative": data['market_narrative'],
            "local_friction": data['local_friction'],
            "gtm_playbook": data['gtm_playbook'],
            "failure_modes": data['failure_modes'],
            "unit_economics": data['unit_economics'], 
            "opportunity_score": data['opportunity_score'],
            "difficulty_score": data['difficulty_score'],
            "trend": data['trend_impact'],
            "breakeven_months": data['breakeven_months'],
            "business_shape": seed['business_shape'],
            "status": "draft",
            "data_source": "Valifye Blueprint 2.5"
        }, on_conflict="niche,city").execute()

        # Update the seed status
        supabase.table("content_plan").update({
            "is_generated": True
        }).eq("id", seed['id']).execute()

        print(f"✅ Blueprint Live: {niche} in {city} | Opp: {data['opportunity_score']}")
        return True

    except Exception as e:
        print(f"❌ JSON or Database Error for {niche} in {city}: {e}")
        return False

def run_factory(limit=5):
    print(f"🚀 Starting Validation Factory (Batch Limit: {limit})...")
    
    # --- RESILIENCY BLOCK 3: Supabase Fetch Retry ---
    max_retries = 3
    seeds = None
    
    for attempt in range(max_retries):
        try:
            seeds = supabase.table("content_plan")\
                .select("*")\
                .eq("is_generated", False)\
                .limit(limit)\
                .execute().data
            break
        except Exception as e:
            print(f"⚠️ Supabase connection dropped (Attempt {attempt + 1}/{max_retries}). Retrying in 2 seconds...")
            time.sleep(2)
            
    if seeds is None:
        print("❌ Critical Failure: Could not connect to Supabase after multiple attempts. Exiting.")
        return
    # ------------------------------------------------------------------

    if not seeds:
        print("ℹ️ No pending seeds in content_plan. Factory idle.")
        return

    for seed in seeds:
        success = expand_to_blueprint(seed)
        if success:
            time.sleep(3) # Safe buffer for Pro API limits

if __name__ == "__main__":
    run_factory(limit=100)