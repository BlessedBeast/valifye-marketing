"""
publish_and_index.py

Connects Supabase market_data drafts to the Google Indexing API.

Requirements:
- supabase-py
- google-api-python-client
- google-auth

Environment:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Service account:
- service-account.json (Google Indexing API-enabled service account)
"""

import os
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

from supabase import create_client, Client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# Maximum number of URLs to send to Google per run
BATCH_LIMIT = int(os.environ.get("PUBLISH_BATCH_LIMIT", "25"))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.", file=sys.stderr)
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def fetch_draft_rows(supabase: Client) -> List[Dict[str, Any]]:
    """Select draft rows from market_data."""
    resp = (
        supabase.table("market_data")
        .select("*")
        .eq("status", "draft")
        .execute()
    )
    data = resp.data or []
    return data


def passes_quality_gate(row: Dict[str, Any]) -> Tuple[bool, str]:
    """
    2026 Quality Gate:
    - Reject slug containing comma
    - Reject market_narrative shorter than 200 chars
    """
    slug = row.get("slug") or ""
    narrative = row.get("market_narrative") or ""

    if "," in slug:
        return False, "slug contains comma"

    if len(narrative.strip()) < 200:
        return False, "market_narrative < 200 chars"

    return True, ""


def get_indexing_client():
    """Create Google Indexing API client from service-account.json."""
    service_account_path = os.path.join(os.path.dirname(__file__), "service-account.json")
    if not os.path.exists(service_account_path):
        print(f"service-account.json not found at {service_account_path}", file=sys.stderr)
        sys.exit(1)

    scopes = ["https://www.googleapis.com/auth/indexing"]
    creds = service_account.Credentials.from_service_account_file(
        service_account_path, scopes=scopes
    )
    return build("indexing", "v3", credentials=creds, cache_discovery=False)


def notify_google(indexing_client, url: str) -> bool:
    """Send URL_UPDATED notification to Google Indexing API. Returns True on success."""
    try:
        request = indexing_client.urlNotifications().publish(
            body={"url": url, "type": "URL_UPDATED"}
        )
        response = request.execute()
        # If execute() doesn't raise, treat as success
        status = response.get("urlNotificationMetadata", {}).get("latestUpdate", {}).get(
            "type", "URL_UPDATED"
        )
        print(f"✅ Indexed: {url} (status: {status})")
        return True
    except HttpError as e:
        print(f"❌ Google Indexing API error for {url}: {e}", file=sys.stderr)
        return False
    except Exception as e:  # pragma: no cover - defensive
        print(f"❌ Unexpected error for {url}: {e}", file=sys.stderr)
        return False


def mark_published(supabase: Client, row_id: Any) -> None:
    """Update a row to published with current timestamp."""
    now_iso = datetime.now(timezone.utc).isoformat()
    supabase.table("market_data").update(
        {
            "status": "published",
            "published_at": now_iso,
            "updated_at": now_iso,
        }
    ).eq("id", row_id).execute()


def main():
    supabase = get_supabase_client()
    indexing_client = get_indexing_client()

    rows = fetch_draft_rows(supabase)
    total_found = len(rows)
    indexed_count = 0
    failed_quality_count = 0

    if total_found == 0:
        print("No draft rows found in market_data.")
        print("Total Found: 0 | Indexed: 0 | Failed Quality: 0")
        return

    print(f"Found {total_found} draft rows. Applying 2026 Quality Gate and BATCH_LIMIT={BATCH_LIMIT}...")

    for row in rows:
        if indexed_count >= BATCH_LIMIT:
            print(f"Reached BATCH_LIMIT={BATCH_LIMIT}. Stopping further indexing attempts.")
            break

        slug = row.get("slug")
        row_id = row.get("id")
        if not slug or row_id is None:
            print("❌ FAILED QUALITY GATE: missing slug or id", row)
            failed_quality_count += 1
            continue

        ok, reason = passes_quality_gate(row)
        if not ok:
            print(f"❌ FAILED QUALITY GATE [{slug}]: {reason}")
            failed_quality_count += 1
            continue

        url = f"https://valifye.com/ideas/{slug}"

        success = notify_google(indexing_client, url)
        if success:
            mark_published(supabase, row_id)
            indexed_count += 1
        # Trust-Builder quota: always sleep between attempts (even on failure)
        time.sleep(2)

    print(
        f\"Total Found: {total_found} | Indexed: {indexed_count} | Failed Quality: {failed_quality_count}\"
    )


if __name__ == "__main__":
  main()

