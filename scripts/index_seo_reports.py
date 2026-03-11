import os
import sys
import time
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# --- PRODUCTION CONFIGURATION ---
INDEXING_LIMIT = 100 
THROTTLE_DELAY = 1.5 
MIN_TOTAL_CHARS = 2500

def get_supabase_client() -> Client:
    return create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))

def get_indexing_client():
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "service-account.json")
    scopes = ["https://www.googleapis.com/auth/indexing"]
    creds = service_account.Credentials.from_service_account_file(key_path, scopes=scopes)
    return build("indexing", "v3", credentials=creds, cache_discovery=False)

def check_depth(row: Dict[str, Any]) -> Tuple[bool, str]:
    data = row.get('report_data') or {}
    full_payload = json.dumps(data)
    
    if len(full_payload) < MIN_TOTAL_CHARS:
        return False, f"Thin content ({len(full_payload)} chars)"
    if 'entry_playbook' not in data or 'micro_tam' not in data:
        return False, "Missing core modules (Playbook/TAM)"
    return True, ""

def main():
    print("🚀 Starting pSEO Local Market Indexer...")
    supabase = get_supabase_client()
    indexing = get_indexing_client()

    resp = supabase.table("public_seo_reports").select("*").eq("is_published", False).limit(INDEXING_LIMIT).execute()
    rows = resp.data or []

    if not rows:
        print("📭 No new pSEO reports found.")
        return

    success_count = 0
    skip_count = 0

    for row in rows:
        slug = row.get("slug")
        
        # 1. Quality Gate
        ok, reason = check_depth(row)
        if not ok:
            print(f"⏩ Skipping {slug}: {reason}")
            skip_count += 1
            continue

        # 2. Ping Google
        url = f"https://valifye.com/local-reports/{slug}"
        try:
            indexing.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
            
            # 3. Mark as Published
            now = datetime.now(timezone.utc).isoformat()
            supabase.table("public_seo_reports").update({
                "is_published": True,
                "published_at": now
            }).eq("id", row.get("id")).execute()
            
            print(f"✅ Indexed & Live: {slug}")
            success_count += 1
            time.sleep(THROTTLE_DELAY)
        except Exception as e:
            print(f"❌ Error indexing {slug}: {e}")

    print("-" * 30)
    print(f"🏁 BATCH COMPLETE | Success: {success_count} | Skipped: {skip_count}")

if __name__ == "__main__":
    main()