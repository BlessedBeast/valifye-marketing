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

# 2026 SEO Gate: Anything under 1800 characters of clean text needs thickening
MIN_CLEAN_LENGTH = 1800 

def get_missing_pillars(title, location, current_data):
    """
    SYNTHESIS MODE: Reconstructs the report using City Intel if Google Maps was thin.
    """
    print(f"💉 Injecting Forensic Substance for: {title} in {location}...")
    
    prompt = f"""
    Context: {title}
    Location: {location}
    Existing Data: {json.dumps(current_data)}

    TASK: This local market audit is too 'Thin' or contains 'No Data' placeholders.
    Reconstruct it using your internal knowledge of {location}. 

    REQUIRED FORENSIC PILLARS:
    1. 'executive_summary': A 300-word authoritative narrative analyzing the {title} market in {location}.
    2. 'micro_tam': {{ 'realistic': '$ value', 'optimistic': '$ value', 'calculation_basis': 'detailed breakdown' }}
    3. 'entry_playbook': [ 5 tactical, localized steps for this city ]
    4. 'market_gaps': [ 3 specific underserved customer needs in {location} ]
    5. 'logic_score': int (0-100)
    6. 'verdict': (BUILD, PIVOT, or KILL)

    CRITICAL: Do NOT say "I cannot analyze". Use your knowledge of local demographics and commerce.
    Return ONLY pure JSON.
    """
    
    try:
        res = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config={'response_mime_type': 'application/json'}
        )
        return json.loads(res.text)
    except Exception as e:
        print(f"❌ Gemini Error for {title}: {e}")
        return None

def run_seo_thicken():
    print("🕵️ Scanning 'public_seo_reports' for thin assets...")
    
    # Fetch all unpublished reports
    reports = supabase.table("public_seo_reports").select("*").eq("is_published", False).execute().data
    
    if not reports:
        print("📭 No reports found to process.")
        return

    updated_count = 0

    for r in reports:
        report_data = r.get("report_data") or {}
        
        # Calculate human-readable length
        text_content = json.dumps(report_data)
        ghost_detected = "it is not possible" in text_content.lower() or "insufficient evidence" in text_content.lower()
        
        if len(text_content) >= MIN_CLEAN_LENGTH and not ghost_detected:
            print(f"⏩ {r['slug']} is already sufficient. Skipping.")
            continue

        # Trigger Thickening
        new_data = get_missing_pillars(r['idea_title'], r['location_label'], report_data)
        
        if new_data:
            # Update the row with the newly synthesized thick data
            try:
                supabase.table("public_seo_reports").update({
                    "report_data": new_data,
                    "logic_score": int(new_data.get('logic_score', 50)),
                    "verdict": str(new_data.get('verdict', 'PENDING')),
                    "meta_description": new_data.get('executive_summary', '')[:160] # Auto SEO meta
                }).eq("id", r['id']).execute()
                
                print(f"✅ Thickened & Hardened: {r['slug']}")
                updated_count += 1
                time.sleep(3) # Throttle for API stability
            except Exception as e:
                print(f"⚠️ Update failed for {r['slug']}: {e}")

    print(f"\n🏁 Mission Complete. {updated_count} local audits are now 'Forensic Grade'.")

if __name__ == "__main__":
    run_seo_thicken()