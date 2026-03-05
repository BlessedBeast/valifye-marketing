import os
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple
from dotenv import load_dotenv # 1. Add this import

load_dotenv()

from supabase import create_client, Client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# --- PRODUCTION CONFIGURATION 2026 ---
PUBLISH_LIMIT = 250    # Total niches to move from draft -> live on the site
INDEXING_LIMIT = 190   # Google daily limit is 200; we stay safe at 190
THROTTLE_DELAY = 1.5   # Seconds between Google API calls to avoid rate limits

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: Missing Supabase Env Vars.", file=sys.stderr)
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def fetch_draft_rows(supabase: Client) -> List[Dict[str, Any]]:
    """Select the most recent drafts."""
    resp = (
        supabase.table("market_data")
        .select("*")
        .eq("status", "draft")
        .order("created_at", desc=True)
        .limit(PUBLISH_LIMIT)
        .execute()
    )
    return resp.data or []

def passes_quality_gate(row: Dict[str, Any]) -> Tuple[bool, str]:
    """2026 Forensic Quality Filter."""
    slug = row.get("slug") or ""
    narrative = row.get("market_narrative") or ""
    
    if not slug: return False, "Missing slug"
    if "," in slug: return False, "Slug contains comma"
    if len(narrative.strip()) < 250: return False, "Narrative too thin (< 250 chars)"
    
    # Check if 'Thick Data' fields are populated
    if not row.get("local_friction") or len(row.get("local_friction", [])) == 0:
        return False, "Empty blueprint fields (friction)"
        
    return True, ""

def get_indexing_client():
    service_account_path = os.path.join(os.path.dirname(__file__), "service-account.json")
    if not os.path.exists(service_account_path):
        print(f"❌ Error: {service_account_path} not found.", file=sys.stderr)
        sys.exit(1)

    scopes = ["https://www.googleapis.com/auth/indexing"]
    creds = service_account.Credentials.from_service_account_file(service_account_path, scopes=scopes)
    return build("indexing", "v3", credentials=creds, cache_discovery=False)

def notify_google(indexing_client, url: str) -> bool:
    """Trigger Googlebot crawl."""
    try:
        request = indexing_client.urlNotifications().publish(
            body={"url": url, "type": "URL_UPDATED"}
        )
        request.execute()
        print(f"📡 Google Notified: {url}")
        return True
    except HttpError as e:
        print(f"⚠️ Indexing API error: {e.content}", file=sys.stderr)
        return False

def publish_row(supabase: Client, row_id: Any):
    """Make the page visible on the frontend."""
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("market_data").update({
        "status": "published",
        "published_at": now,
        "updated_at": now
    }).eq("id", row_id).execute()

def main():
    supabase = get_supabase_client()
    indexing_client = get_indexing_client()

    rows = fetch_draft_rows(supabase)
    if not rows:
        print("📭 No drafts found. Factory is idle.")
        return

    print(f"🏗️  Processing {len(rows)} drafts for Valifye.com...")

    published_count = 0
    indexed_count = 0

    for row in rows:
        slug = row.get("slug")
        row_id = row.get("id")

        # 1. Quality Gate
        ok, reason = passes_quality_gate(row)
        if not ok:
            print(f"⏩ Skipping {slug or 'unknown'}: {reason}")
            continue

        # 2. Publish (Website visibility)
        try:
            publish_row(supabase, row_id)
            published_count += 1
            print(f"🚀 Published: {slug}")
        except Exception as e:
            print(f"❌ Failed to publish {slug}: {e}")
            continue

        # 3. Index (Search visibility - Up to limit)
        if indexed_count < INDEXING_LIMIT:
            url = f"https://valifye.com/ideas/{slug}"
            if notify_google(indexing_client, url):
                # Optional: update a 'last_indexed_at' column if you have one
                supabase.table("market_data").update({
                    "indexed_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", row_id).execute()
                indexed_count += 1
                time.sleep(THROTTLE_DELAY) # Avoid hitting API too fast

    print("-" * 30)
    print(f"🏁 MISSION COMPLETE")
    print(f"✅ Published to Site: {published_count}")
    print(f"📡 Pinged to Google: {indexed_count}")
    if published_count > indexed_count:
        print(f"ℹ️  Note: {published_count - indexed_count} pages published via Sitemap only (Quota reached).")

if __name__ == "__main__":
    main()