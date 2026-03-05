import os
import time
import datetime
import requests
from dotenv import load_dotenv
from supabase import create_client
from google.oauth2 import service_account
import google.auth.transport.requests

# 1. Load Credentials
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase Env Vars.")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Google Indexing API Configuration
SCOPES = ["https://www.googleapis.com/auth/indexing"]
ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

# Ensure your JSON key is in the correct path
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), "service-account.json")

# Your daily limit to stay under the 200 quota radar
DAILY_QUOTA = 190 
DOMAIN = "https://valifye.com/ideas"

def get_google_access_token():
    """Generates a fresh OAuth2 token for the Indexing API."""
    try:
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        request = google.auth.transport.requests.Request()
        creds.refresh(request)
        return creds.token
    except Exception as e:
        print(f"❌ Failed to load Google Credentials: {e}")
        exit(1)

def process_queue():
    print(f"🚨 Booting Indexing Queue Processor (Limit: {DAILY_QUOTA})...")
    
    # 1. Fetch pending URLs (Grabs BOTH the 60 leftovers AND new drafts)
    queue = supabase.table("market_data") \
        .select("id, slug, niche, city, status") \
        .eq("google_index_status", "pending") \
        .order("created_at", desc=False) \
        .limit(DAILY_QUOTA) \
        .execute().data

    if not queue:
        print("ℹ️ Queue is empty. Nothing to index today.")
        return

    print(f"📦 Found {len(queue)} pending blueprints. Engaging Google API...")
    
    access_token = get_google_access_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    success_count = 0
    
    for row in queue:
        slug = row['slug']
        niche = row['niche']
        city = row['city']
        target_url = f"{DOMAIN}/{slug}"
        
        payload = {
            "url": target_url,
            "type": "URL_UPDATED"
        }

        try:
            # 2. Ping Google
            response = requests.post(ENDPOINT, headers=headers, json=payload)
            
            if response.status_code == 200:
                print(f"✅ Indexed: {niche} in {city}")
                
                # 3. Update Supabase (Flip to published, mark as submitted, stamp time)
                supabase.table("market_data").update({
                    "status": "published",
                    "google_index_status": "submitted",
                    "indexed_at": datetime.datetime.utcnow().isoformat()
                }).eq("id", row['id']).execute()
                
                success_count += 1
            else:
                print(f"⚠️ Google API Error for {slug}: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"❌ Crash on {slug}: {e}")

        # Pause to prevent API rate limiting (Google prefers steady streams)
        time.sleep(1.5)

    print(f"🏁 Queue Processing Complete. Successfully indexed: {success_count}/{len(queue)}")

if __name__ == "__main__":
    process_queue()