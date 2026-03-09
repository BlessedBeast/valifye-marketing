import os
import json
import time
import re
from dotenv import load_dotenv
from supabase import create_client
from google import genai

# Load environment variables
load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def clean_json_string(raw_string):
    """
    Forensic JSON Cleaner: Strips markdown and fixes common AI formatting errors.
    """
    # Remove markdown code blocks if present
    clean = re.sub(r"```json|```", "", raw_string).strip()
    # Remove trailing commas before closing braces/brackets
    clean = re.sub(r",\s*([\]}])", r"\1", clean)
    return clean

def generate_robustly(prompt, retries=3):
    """THE BULLETPROOF ENGINE: Updated for 2026 Gemini 3 Flash standard."""
    for attempt in range(retries):
        try:
            # Using the 2026 stable production identifier
            response_stream = client.models.generate_content_stream(
                model="gemini-2.5-flash", 
                contents=prompt
            )
            full_text = "".join([chunk.text for chunk in response_stream if chunk.text])
            return full_text.strip()
        except Exception as e:
            print(f"   ⚠️ API Link Failure on attempt {attempt + 1}: {e}")
            if attempt == retries - 1:
                return None
            time.sleep(5) 
    return None

def generate_simulated_evidence(title, description, experiments):
    """Step 1: Generate Thick Data Evidence"""
    evidence_bundle = {}
    for exp in experiments:
        print(f"🔬 Simulating: {exp} for {title}...")
        prompt = f"Role: Forensic Analyst. Task: Simulate '{exp}' for '{title}' ({description}). Provide brutal details, failed dialogues, and math."
        evidence_bundle[exp] = generate_robustly(prompt)
        time.sleep(2) 
    return evidence_bundle

def analyze_with_valify_logic(title, description, raw_bundle):
    """Step 2: Apply the Neutral Judge Logic with JSON Cleaning"""
    print(f"⚖️ Analyzing Forensic Logic for: {title}...")
    analysis_prompt = f"Analyze this raw evidence for: {title}. Return ONLY valid JSON with 'patterns', 'brutal_rejections', 'adjusted_score', 'calculated_verdict', and 'verdict_reasoning'. Evidence: {json.dumps(raw_bundle)}"
    
    raw_json_text = generate_robustly(analysis_prompt)
    if not raw_json_text: return None
    
    cleaned_text = clean_json_string(raw_json_text)
    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Failure after cleaning: {e}")
        return None

def process_reports(limit=20):
    """MAIN BATCH PROCESSOR: Mapped to public.verdict_reports"""
    print(f"📡 Fetching next {limit} pending ideas...")
    response = supabase.table("verdict_input_queue").select("*").eq("status", "pending").limit(limit).execute()
    queue_data = response.data or []
    
    if not queue_data:
        print("📭 Queue is empty.")
        return

    total = len(queue_data)
    print(f"🏗️  Factory Online: Processing {total} ideas.")

    for index, item in enumerate(queue_data):
        current_num = index + 1
        try:
            slug = f"{item['idea_title'].lower().replace(' ', '-')}-forensic-report"
            
            # 🛡️ IDEMPOTENCY CHECK
            check_exists = supabase.table("verdict_reports").select("id").eq("slug", slug).execute()
            if check_exists.data:
                print(f"⏩ [{current_num}] SKIPPING: {item['idea_title']} (Already exists).")
                supabase.table("verdict_input_queue").update({"status": "completed"}).eq("id", item['id']).execute()
                continue
            
            print(f"\n--- [{current_num}/{total}] AUDITING: {item['idea_title']} ---")
            
            raw_evidence = generate_simulated_evidence(item['idea_title'], item['raw_description'], item['target_experiments'])
            analysis = analyze_with_valify_logic(item['idea_title'], item['raw_description'], raw_evidence)
            
            if not analysis:
                print(f"⚠️ Skipping {item['idea_title']} - Generation error.")
                continue

            # 🚀 Save to Supabase
            supabase.table("verdict_reports").insert({
                "queue_id": item['id'],
                "slug": slug,
                "idea_title": item['idea_title'],
                "final_verdict": analysis.get('calculated_verdict', 'ERROR'),
                "overall_integrity_score": analysis.get('adjusted_score', 0),
                "forensic_narrative": analysis.get('verdict_reasoning', 'Audit failed.'),
                "experiment_data": {"raw_notes": raw_evidence, "logic_audit": analysis},
                "is_published": False
            }).execute()
            
            supabase.table("verdict_input_queue").update({"status": "completed"}).eq("id", item['id']).execute()
            print(f"✅ FINISHED: {item['idea_title']} -> {analysis.get('calculated_verdict')}")
            
            if current_num < total:
                time.sleep(10) # API Throttling

        except Exception as e:
            print(f"❌ ERROR on {item['idea_title']}: {e}")
            continue 

    print("\n🏁 BATCH MISSION COMPLETE.")

if __name__ == "__main__":
    process_reports(limit=20)