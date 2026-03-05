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

# Initialize Gemini 2.5 Flash
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

    1. LOCAL FRICTION: 3 specific local hurdles (e.g. {city} traffic choke points, upcoming tax changes, land zoning rules, or labor union dynamics).
    2. GTM PLAYBOOK: 3 hyper-local steps to find the first 10 customers. Name specific neighborhoods, local associations, founder communities, or city-specific clusters.
    3. THE PRE-MORTEM: A brutal 2-sentence warning on exactly HOW a founder will go bankrupt with this idea in {city}.
    4. LOCAL UNIT ECONOMICS: Breakdown of margins vs. local {city} operational costs (Rent/Labor) grounded in realistic price levels for {current_year} to {current_year + 2}.
    
    5. BRUTAL METRICS SCORING (CRITICAL):
       - opportunity_score (0-100): Be ruthless. Most ideas are a 30-50. Only genuine market gaps with high margins get 70+.
       - difficulty_score (0-100): Factor in capital requirements, regulatory walls, and local monopolies. Higher score = harder to execute.
       - saturation_score (0-100): How crowded is {city} for this specific niche? 100 = Red Ocean.
       - trend_impact: Strictly choose one string: "up", "down", or "flat".
       - breakeven_months (Integer): Be realistic. Local operations take 12-24 months. Do not hallucinate a 3-month breakeven unless it's pure SaaS with zero CAC.

    The market_narrative MUST be a 250–300 word dense, critical essay that:
    - Acts as a "Forensic Executive Summary" for this niche in {city}.
    - Explicitly connects infrastructure realities (transport, power, zoning, digital infra) to the niche's viability.
    - Uses sharp, hook-heavy opening sentences that are suitable for Google Search snippets.
    - Stays specific to {city}, citing concrete street-level and policy-level details, not generic startup advice.

    Return ONLY raw JSON with these exact keys:
    {{
      "local_friction": ["...", "...", "..."],
      "gtm_playbook": ["...", "...", "..."],
      "failure_modes": "...",
      "unit_economics": {{
         "margin_pct": 0,
         "rent_impact": "High/Low/Medium",
         "logic": "Detailed breakdown of local cost impact..."
      }},
      "market_narrative": "A 250–300 word forensic, hook-heavy executive summary...",
      "opportunity_score": 45,
      "difficulty_score": 85,
      "saturation_score": 75,
      "trend_impact": "flat",
      "breakeven_months": 18
    }}
    """

    try:
        # Using Gemini 2.5 Flash for high-velocity structural reasoning
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        # Clean and parse JSON
        clean_json = response.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean_json)

        # UPSERT into market_data (Live Frontend Table)
        supabase.table("market_data").upsert({
            "niche": niche,
            "city": city,
            "region": seed['region'],
            "market_narrative": data['market_narrative'],
            "local_friction": data['local_friction'],
            "gtm_playbook": data['gtm_playbook'],
            "failure_modes": data['failure_modes'],
            
            # The new 'global_anchor_json' naming convention to match your frontend fix
            "global_anchor_json": data['unit_economics'], 
            
            # Injecting the dynamic brutal metrics
            "opportunity_score": data['opportunity_score'],
            "difficulty_score": data['difficulty_score'],
            "saturation_score": data['saturation_score'],
            "trend": data['trend_impact'], # Mapping to your DB's 'trend' column
            "breakeven_months": data['breakeven_months'],
            
            "business_shape": seed['business_shape'],
            "status": "draft", # Queue for Indexing API
            "data_source": "Valifye Blueprint 2.5"
        }, on_conflict="niche,city").execute()

        # Update the seed status so we don't re-generate
        supabase.table("content_plan").update({
            "is_generated": True
        }).eq("id", seed['id']).execute()

        print(f"✅ Blueprint Live: {niche} in {city} | Opp: {data['opportunity_score']} | Diff: {data['difficulty_score']}")
        return True

    except Exception as e:
        print(f"❌ Error for {niche} in {city}: {e}")
        return False

def run_factory(limit=5):
    """
    Fetches pending seeds and triggers the assembly line.
    """
    print(f"🚀 Starting Validation Factory (Batch Limit: {limit})...")
    
    # Fetch rows from the Seed Queue (content_plan)
    seeds = supabase.table("content_plan")\
        .select("*")\
        .eq("is_generated", False)\
        .limit(limit)\
        .execute().data

    if not seeds:
        print("ℹ️ No pending seeds in content_plan. Factory idle.")
        return

    for seed in seeds:
        success = expand_to_blueprint(seed)
        if success:
            time.sleep(1) # Safety gap to prevent rate limits

if __name__ == "__main__":
    run_factory(limit=100) # Set to 250 for your daily run