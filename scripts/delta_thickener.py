import os
import json
import time
import datetime
from dotenv import load_dotenv
from supabase import create_client
from google import genai

# Load environment variables
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# PRODUCTION CONFIG
MODEL_NAME = "gemini-1.5-flash" # More stable than 2.0/2.5 for high-volume tasks
CURRENT_YEAR = datetime.datetime.now().year

def get_blueprint_data(niche, city, region):
    """
    Synthesizes the 4-part forensic depth required for Engine 1.
    """
    print(f"💉 Injecting forensic substance for: {niche} in {city}...")
    
    prompt = f"""
    Context: {niche} in {city}, {region} ({CURRENT_YEAR})
    Task: Generate a high-density Validation Blueprint for this local market.

    Return ONLY raw JSON for these keys:
    1. 'market_narrative': A 300-word authoritative overview of the local demand.
    2. 'local_friction': [List of 3 specific local hurdles]
    3. 'gtm_playbook': [3 hyper-local entry steps]
    4. 'failure_modes': 'A 2-sentence warning on how a founder goes bankrupt here.'
    5. 'unit_economics': {{ 'unit_price': int, 'margin_pct': int, 'rent_impact': 'High/Medium/Low' }}
    """
    
    # Simple Retry Loop for 503 Errors
    for attempt in range(3):
        try:
            res = client.models.generate_content(model=MODEL_NAME, contents=prompt)
            clean_text = res.text.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_text)
        except Exception as e:
            if "503" in str(e):
                print(f"⚠️ Server busy, retrying in 5s... (Attempt {attempt+1})")
                time.sleep(5)
                continue
            print(f"❌ Error: {e}")
            return None
    return None

def run_engine1_thickener():
    print("🕵️ Finding 'Pending' Ghosts and 'Draft' Blueprints...")
    
    # 1. Fetch Targets
    # Priority 1: Those with "pending" text
    # Priority 2: Those stuck in "draft"
    resp = supabase.table("market_data").select("*").or_("status.eq.draft,market_narrative.ilike.%pending%").limit(50).execute()
    rows = resp.data or []
    
    if not rows:
        print("📭 Database is clean. No blueprints need thickening.")
        return

    updated_count = 0
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for r in rows:
        # Determine if it's a ghost or draft for logging
        label = "REPAIRING" if "pending" in (r['market_narrative'] or "").lower() else "THICKENING"
        
        data = get_blueprint_data(r['niche'], r['city'], r['region'])
        
        if data:
            try:
                supabase.table("market_data").update({
                    "market_narrative": data.get("market_narrative"),
                    "local_friction": data.get("local_friction"),
                    "gtm_playbook": data.get("gtm_playbook"),
                    "failure_modes": data.get("failure_modes"),
                    "unit_economics": data.get("unit_economics"),
                    "status": "published",
                    "updated_at": now,
                    "published_at": now
                }).eq("id", r['id']).execute()
                
                print(f"✅ {label}: {r['slug']}")
                updated_count += 1
                time.sleep(3) # Safe buffer
            except Exception as e:
                print(f"⚠️ Database Update Failed: {e}")

    print(f"🏁 Mission Complete. {updated_count} Blueprints are now forensic-grade.")

if __name__ == "__main__":
    run_engine1_thickener()