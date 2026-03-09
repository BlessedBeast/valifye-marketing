import os
import time
import json
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# --- CONFIGURATION ---
MIN_CONTENT_LENGTH = 2000 
THROTTLE_DELAY = 2.0 

def get_supabase_client():
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def get_indexing_client():
    # 🔥 FIXED: Finds the JSON key relative to this script's location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    key_path = os.path.join(current_dir, "service-account.json")
    
    scopes = ["https://www.googleapis.com/auth/indexing"]
    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Missing {key_path}. Put your service-account.json in the scripts folder.")
        
    credentials = service_account.Credentials.from_service_account_file(
        key_path,
        scopes=scopes,
    )
    return build("indexing", "v3", credentials=credentials, cache_discovery=False)

def is_report_thick_enough(row):
    """Quality Gate: Measures Narrative + JSON Experiment data."""
    narrative = row.get('forensic_narrative') or ''
    # Measurement of the depth of the simulated data
    experiments = json.dumps(row.get('experiment_data') or {})
    
    total_length = len(narrative) + len(experiments)
    return total_length >= MIN_CONTENT_LENGTH, total_length

def index_validation_reports():
    print("🚀 Starting High-Authority Indexing Factory...")
    supabase = get_supabase_client()
    indexing = get_indexing_client()

    # 🔥 FIXED: Table name corrected to 'verdict_reports'
    response = (
        supabase.table("verdict_reports")
        .select("*")
        .eq("is_published", False)
        .limit(50) 
        .execute()
    )

    rows = response.data or []
    if not rows:
        print("📭 No new validation reports found to index.")
        return

    success_count = 0
    skip_count = 0

    for row in rows:
        slug = row.get("slug")
        if not slug: continue

        # 1. THE THICK DATA GATE
        is_thick, length = is_report_thick_enough(row)
        if not is_thick:
            print(f"⚠️  SKIPPING {slug}: Content too thin ({length} chars).")
            skip_count += 1
            continue

        # 2. THE PING
        url = f"https://valifye.com/reports/{slug}"
        body = {"url": url, "type": "URL_UPDATED"}

        try:
            print(f"📡 Notifying Google: {slug}...")
            result = indexing.urlNotifications().publish(body=body).execute()
            
            if result:
                # 3. THE STAMP
                (
                    # 🔥 FIXED: Table name corrected to 'verdict_reports'
                    supabase.table("verdict_reports")
                    .update({"is_published": True})
                    .eq("id", row.get("id"))
                    .execute()
                )
                print(f"✅ Indexed & Live: {slug}")
                success_count += 1
        
        except HttpError as e:
            print(f"❌ Google API Error for {slug}: {e.content}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

        time.sleep(THROTTLE_DELAY)

    print("-" * 30)
    print(f"🏁 BATCH COMPLETE | Success: {success_count} | Skipped: {skip_count}")

if __name__ == "__main__":
    index_validation_reports()