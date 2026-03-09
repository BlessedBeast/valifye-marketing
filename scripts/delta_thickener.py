import os
import json
import time
from dotenv import load_dotenv
from supabase import create_client
from google import genai

# Load environment variables
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 2026 SEO Gate
MIN_CONTENT_LENGTH = 2000 

def get_missing_data(title, current_narrative, current_exp_data):
    """
    INJECTION MODE: Adds the 'Missing Pillars' required for AEO Authority.
    """
    print(f"💉 Injecting forensic depth for: {title}...")
    
    prompt = f"""
    Context: {title}
    Current Narrative: {current_narrative}
    Existing Data: {json.dumps(current_exp_data)}

    TASK: This report is too 'Thin' for 2026 Search Standards. 
    Expand it by generating these specific forensic pillars:
    
    1. 'unit_economics': {{ 'cpa': float, 'ltv': float, 'payback_months': int, 'math_verdict': 'brutal summary' }}
    2. 'market_entities': [ 'Competitor Name', 'Niche Keyword', 'Legacy Workaround' ]
    3. 'aeo_summary': 'A 250-word authoritative 'Direct Answer' for AI Search Engines.'
    4. 'thick_case_study': 'A simulated 300-word failure or success story from a trial run.'

    Return ONLY the raw JSON for these keys.
    """
    
    try:
        # 🔥 UPDATED MODEL NAME
        res = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        # Clean markdown
        clean_text = res.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"❌ Gemini Error for {title}: {e}")
        return None

def run_delta_thicken():
    print("🕵️ Finding the 'Thin' 15 reports...")
    
    # 🎯 TARGETED FETCH: Only unpublished reports
    # Corrected table name to 'verdict_reports'
    reports = supabase.table("verdict_reports").select("*").eq("is_published", False).execute().data
    
    if not reports:
        print("📭 No thin reports found. Everything is already live or processed.")
        return

    updated_count = 0

    for r in reports:
        exp_data = r.get("experiment_data") or {}
        logic_audit = exp_data.get("logic_audit") or {}

        # Calculate current length to confirm it actually needs thickening
        current_len = len(r['forensic_narrative'] or '') + len(json.dumps(exp_data))
        
        if current_len >= MIN_CONTENT_LENGTH:
            print(f"⏩ {r['idea_title']} is already thick enough ({current_len} chars). Skipping.")
            continue

        delta = get_missing_data(r['idea_title'], r['forensic_narrative'], exp_data)
        
        if delta:
            # Merge the new pillars into the logic_audit
            updated_logic_audit = {**logic_audit, **delta}
            updated_exp_data = {**exp_data, "logic_audit": updated_logic_audit}
            
            # 🔥 Corrected Table Name
            supabase.table("verdict_reports").update({
                "experiment_data": updated_exp_data
            }).eq("id", r['id']).execute()
            
            print(f"✅ Thickened: {r['idea_title']}")
            updated_count += 1
            time.sleep(2) # Protect API limits

    print(f"🏁 Mission Complete. {updated_count} reports are now 'Thick'.")

if __name__ == "__main__":
    run_delta_thicken()