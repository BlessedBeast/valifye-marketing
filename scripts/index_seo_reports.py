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
# Minimum human-readable text characters (ignoring JSON structure)
MIN_CLEAN_CHARS = 1800 

# Phrases that indicate the AI failed to find niche-specific evidence
TOXIC_PHRASES = [
    "it is not possible to analyze",
    "evidence is irrelevant",
    "consists solely of hotel reviews",
    "impossible to conduct",
    "insufficient evidence",
    "does not contain any information relevant",
    "based solely on the provided evidence",
    "based on the given data" # Combined with low char counts
]

def get_supabase_client() -> Client:
    return create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))

def get_indexing_client():
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "service-account.json")
    creds = service_account.Credentials.from_service_account_file(key_path, scopes=["https://www.googleapis.com/auth/indexing"])
    return build("indexing", "v3", credentials=creds, cache_discovery=False)

def check_depth(row: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Forensic Quality Gate:
    1. Measures clean text length (ignoring keys/braces).
    2. Scans for 'Ghost Phrases' (AI admits no data found).
    3. Verifies non-empty core modules.
    """
    data = row.get('report_data') or {}
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except:
            return False, "Malformed JSON"

    # 1. Clean Character Count (Text content only)
    def extract_text(obj):
        text = ""
        if isinstance(obj, str): text += obj
        elif isinstance(obj, list): text += " ".join([extract_text(i) for i in obj])
        elif isinstance(obj, dict): text += " ".join([extract_text(v) for v in obj.values()])
        return text

    clean_text = extract_text(data).lower()
    clean_len = len(clean_text)

    # 2. Toxic Phrase Scan (The 'No Data' detection)
    for phrase in TOXIC_PHRASES:
        if phrase in clean_text:
            return False, f"Ghost content detected ('{phrase[:25]}...')"

    # 3. Minimum Narrative Depth
    if clean_len < MIN_CLEAN_CHARS:
        return False, f"Thin content ({clean_len} clean chars)"

    # 4. Mandatory Module Check (Ensure they aren't just empty keys)
    # Checks for presence of either entry_playbook OR market_analysis with substance
    has_playbook = data.get('entry_playbook') or data.get('market_analysis')
    if not has_playbook or len(str(has_playbook)) < 100:
        return False, "Missing or empty strategic modules"

    return True, ""

def main():
    print("🚀 Starting Forensic pSEO Local Market Indexer...")
    supabase = get_supabase_client()
    
    # We only fetch indexing_client if we actually have work to do later
    indexing = None 

    # 1. Fetch unpublished reports
    resp = supabase.table("public_seo_reports").select("*").eq("is_published", False).limit(INDEXING_LIMIT).execute()
    rows = resp.data or []

    if not rows:
        print("📭 No new pSEO reports found to process.")
        return

    success_count = 0
    skip_count = 0

    for row in rows:
        slug = row.get("slug")
        
        # 2. Quality Gate
        ok, reason = check_depth(row)
        if not ok:
            print(f"⏩ SKIPPING {slug}: {reason}")
            # Optional: Mark as REJECTED in DB so it doesn't keep getting picked up
            # supabase.table("public_seo_reports").update({"is_published": False, "meta_description": f"REJECTED: {reason}"}).eq("id", row.get("id")).execute()
            skip_count += 1
            continue

        # 3. Google API Handshake (Only if content is thick)
        if indexing is None:
            indexing = get_indexing_client()

        url = f"https://valifye.com/local-reports/report/{slug}" # Namespaced URL
        try:
            indexing.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
            
            # 4. Mark as Published
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
    print(f"🏁 BATCH COMPLETE")
    print(f"💎 High Quality Published: {success_count}")
    print(f"👻 Thin Content Skipped: {skip_count}")

if __name__ == "__main__":
    main()