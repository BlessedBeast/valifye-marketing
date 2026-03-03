import os
import json
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Wiring
url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def parse_tam_to_numeric(tam_str):
    """Converts 'USD 1.01 Billion' or 'INR 420 Million' to a full integer."""
    if not tam_str or not isinstance(tam_str, str): return 0
    try:
        # Extract number and multiplier
        match = re.search(r'([\d\.]+)\s*(Million|Billion|Trillion)', tam_str, re.I)
        if not match: return 0
        val = float(match.group(1))
        multiplier = match.group(2).lower()
        if 'billion' in multiplier: val *= 1_000_000_000
        elif 'million' in multiplier: val *= 1_000_000
        elif 'trillion' in multiplier: val *= 1_000_000_000_000
        return int(val)
    except:
        return 0

def deduce_shape(niche):
    """Heuristic to fix the NULL business_shape values."""
    n = niche.lower()
    if any(x in n for x in ["saas", "software", "platform", "app"]): return "SaaS"
    if any(x in n for x in ["e-commerce", "warehouse", "automation"]): return "E-commerce"
    if any(x in n for x in ["info", "course", "newsletter"]): return "Info"
    return "Service"

def sanitize():
    print("🚑 Valifye Data Sanitizer: Starting Surgery...")
    
    # 1. Fetch all rows
    response = supabase.table("market_data").select("*").execute()
    rows = response.data
    print(f"🧐 Found {len(rows)} rows to analyze.")

    updates = 0
    for row in rows:
        needs_update = False
        
        # --- FIX 1: Business Shape (Backfill NULLs) ---
        if not row.get("business_shape"):
            row["business_shape"] = deduce_shape(row["niche"])
            needs_update = True

        # --- FIX 2: Revenue Normalization (USA & INDIA) ---
        rev = row.get("revenue_potential", {"low": 0, "mid": 0, "high": 0})
        tam_numeric = parse_tam_to_numeric(row.get("estimated_tam", ""))
        
        if tam_numeric > 0:
            # India Fix: If revenue looks like a 'short code' (e.g. 8400 for 420M TAM)
            # We assume it's in thousands and multiply by 1000
            if "INDIA" in str(row.get("data_source", "")) and rev.get("high", 0) < (tam_numeric / 1000):
                rev["low"] *= 1000
                rev["mid"] *= 1000
                rev["high"] *= 1000
                needs_update = True
            
            # USA Fix: Cap revenue at 5% of TAM (Prevents 230% market capture hallucinations)
            # 5% of TAM is an aggressive but 'realistic' high-tier target for a leader
            max_rev = tam_numeric * 0.05
            if rev.get("high", 0) > max_rev:
                rev["high"] = int(max_rev)
                rev["mid"] = int(max_rev * 0.5)
                rev["low"] = int(max_rev * 0.1)
                row["revenue_potential"] = rev
                needs_update = True

        if needs_update:
            supabase.table("market_data").update({
                "business_shape": row["business_shape"],
                "revenue_potential": row["revenue_potential"]
            }).eq("id", row["id"]).execute()
            updates += 1
            if updates % 50 == 0:
                print(f"✅ Cleaned {updates} rows...")

    print(f"🏁 Surgery Complete. Total rows updated: {updates}")

if __name__ == "__main__":
    sanitize()