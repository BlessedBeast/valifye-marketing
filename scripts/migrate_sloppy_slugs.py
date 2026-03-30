import os
import re
import sys
from typing import Tuple

from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_client():
  if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


SLOPPY_PATTERN = re.compile(r"([a-z0-9])in([a-z0-9])")


def looks_sloppy(slug: str) -> bool:
  """Detect 'glued' in patterns like plannerinkansas or saasinahmedabad."""
  if not isinstance(slug, str):
    return False
  return bool(SLOPPY_PATTERN.search(slug))


def normalize_slug(slug: str) -> str:
    """
    Surgical slug cleaning using a safe lambda replacement
    to avoid literal backslash errors.
    """
    if not slug: return ""
    # 1. Lowercase and basic hyphenation
    value = slug.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    
    # 2. THE FIX: Use a lambda to ensure 'in' is correctly padded
    # This replaces 'wordinword' with 'word-in-word'
    value = re.sub(r"([a-z0-9])in([a-z0-9])", lambda m: f"{m.group(1)}-in-{m.group(2)}", value)
    
    # 3. Clean up double hyphens
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value


def migrate_table_slugs(table: str, dry_run: bool) -> Tuple[int, int]:
  client = get_client()
  print(f"🔍 Scanning table: {table}")

  resp = client.table(table).select("id, slug").limit(5000).execute()
  rows = resp.data or []
  changed = 0
  skipped = 0

  for row in rows:
    raw_slug = row.get("slug") or ""
    if not looks_sloppy(raw_slug):
      skipped += 1
      continue

    new_slug = normalize_slug(raw_slug)
    if new_slug == raw_slug:
      skipped += 1
      continue

    print(f"  • {table} :: {row['id']} :: {raw_slug}  ->  {new_slug}")
    changed += 1

    if dry_run:
      continue

    # Optional: simple collision check – skip updates if target exists
    check = client.table(table).select("id").eq("slug", new_slug).limit(1).execute()
    if check.data:
      print(f"    ⚠️ Skipping update for {raw_slug}: target slug {new_slug} already exists.")
      continue

    client.table(table).update({"slug": new_slug}).eq("id", row["id"]).execute()

  return changed, skipped


def main():
  dry_run = True
  if len(sys.argv) > 1 and sys.argv[1] in {"--apply", "--write"}:
    dry_run = False

  mode = "DRY RUN" if dry_run else "APPLY"
  print(f"🛠️  Sloppy Slug Migrator ({mode})")

  total_changed = 0
  total_skipped = 0

  for table in ["public_seo_reports", "market_data"]:
    try:
      changed, skipped = migrate_table_slugs(table, dry_run=dry_run)
      total_changed += changed
      total_skipped += skipped
    except Exception as e:
      print(f"❌ Error processing {table}: {e}")

  print("—— SUMMARY ——")
  print(f"  Changed: {total_changed}")
  print(f"  Unchanged / Skipped: {total_skipped}")
  if dry_run:
    print("Run again with `python scripts/migrate_sloppy_slugs.py --apply` to write changes.")


if __name__ == "__main__":
  main()

