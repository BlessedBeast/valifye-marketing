"""
verify_sitemap.py

Checks that all published idea slugs in Supabase appear in the live sitemap.

Requirements:
- requests
- supabase-py

Environment:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
"""

import os
import sys
from typing import Set, Dict, Any

import requests
import xml.etree.ElementTree as ET
from supabase import create_client, Client


SITEMAP_URL = "https://valifye.com/sitemap.xml"


def get_supabase_client() -> Client:
  url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
  key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

  if not url or not key:
    print("❌ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in environment.", file=sys.stderr)
    sys.exit(1)

  return create_client(url, key)


def fetch_published_slugs(supabase: Client) -> Set[str]:
  """Return all slugs from market_data where status = 'published'."""
  resp = (
    supabase.table("market_data")
    .select("slug, status")
    .eq("status", "published")
    .execute()
  )
  data = resp.data or []
  slugs: Set[str] = set()
  for row in data:
    slug = row.get("slug")
    if isinstance(slug, str) and slug.strip():
      slugs.add(slug.strip())
  return slugs


def fetch_sitemap_slugs() -> Set[str]:
  """Fetch sitemap.xml and extract idea slugs from <loc> entries."""
  try:
    resp = requests.get(SITEMAP_URL, timeout=15)
    resp.raise_for_status()
  except Exception as e:
    print(f"❌ Failed to fetch sitemap from {SITEMAP_URL}: {e}", file=sys.stderr)
    sys.exit(1)

  try:
    root = ET.fromstring(resp.text)
  except Exception as e:
    print(f"❌ Failed to parse sitemap XML: {e}", file=sys.stderr)
    sys.exit(1)

  ns = ""
  if root.tag.startswith("{"):
    ns = root.tag.split("}")[0] + "}"

  slugs: Set[str] = set()
  for url_el in root.findall(f"{ns}url"):
    loc_el = url_el.find(f"{ns}loc")
    if loc_el is None or not loc_el.text:
      continue
    loc = loc_el.text.strip()
    prefix = "https://valifye.com/ideas/"
    if loc.startswith(prefix):
      slug = loc[len(prefix) :].strip("/")
      if slug:
        slugs.add(slug)

  return slugs


def run() -> Dict[str, Any]:
  """Run sitemap verification and return a summary dictionary."""
  supabase = get_supabase_client()

  db_slugs = fetch_published_slugs(supabase)
  sitemap_slugs = fetch_sitemap_slugs()
  orphan_slugs = sorted(db_slugs - sitemap_slugs)

  summary: Dict[str, Any] = {
    "total_published_db": len(db_slugs),
    "total_in_sitemap": len(sitemap_slugs),
    "orphan_count": len(orphan_slugs),
  }

  print("📊 Sitemap Verification Summary")
  print(f"Total Published in DB   : {summary['total_published_db']}")
  print(f"Total Found in Sitemap  : {summary['total_in_sitemap']}")
  print(f"Orphan Slugs (DB-only)  : {summary['orphan_count']}")

  return summary


if __name__ == "__main__":
  summary = run()
  # Simple key=value lines so GitHub Actions / shell can parse easily
  print(f"TOTAL_DB={summary['total_published_db']}")
  print(f"TOTAL_SITEMAP={summary['total_in_sitemap']}")
  print(f"ORPHAN_COUNT={summary['orphan_count']}")

