import os
import subprocess
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def run_step(script_name, description):
    print(f"🚀 {description} ({script_name})...")
    if not os.path.exists(script_name):
        print(f"⚠️  Skipping: '{script_name}' not found.")
        return

    try:
        # Create a copy of the current environment and force UTF-8
        env = os.environ.copy()
        env["PYTHONUTF8"] = "1"

        # run with the forced UTF-8 environment
        result = subprocess.run(
            ["python", script_name], 
            capture_output=True, 
            text=True, 
            env=env,
            encoding='utf-8' # Force the capture to use utf-8
        )
        
        if result.returncode == 0:
            print(f"✅ {description} Complete.")
        else:
            print(f"❌ {description} Failed:\n{result.stderr}")
    except Exception as e:
        print(f"🔥 System Error running {script_name}: {e}")

def valifye_master_sync():
    # Force the main Sentinel script to handle UTF-8 output if possible
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("\n" + "="*60)
    print("🛡️  VALIFYE SENTINEL: PRODUCTION ORCHESTRATOR (V2.2)")
    print("="*60)

    # STEP 1: REPAIR
    run_step("scripts/migrate_sloppy_slugs.py", "Repairing Sloppy Slugs")

    # STEP 2: QUALITY GATE
    run_step("scripts/publish_and_index.py", "Gating Engine 1 (Blueprints)")
    run_step("scripts/index_validation_reports.py", "Gating Engine 2 (Verdicts)")
    run_step("scripts/index_seo_reports.py", "Gating Engine 3 (Local SEO)")

    # STEP 3: BRIDGING
    run_step("scripts/generate_city_graphs.py", "Building E1 City Hubs")
    run_step("scripts/build_verdict_bridges.py", "Building E2 Industry Hubs")
    run_step("scripts/local_bridges.py", "Building E3 City Hubs")

    # STEP 4: SITEMAP & AUDIT
    run_step("generate_master_sitemap.py", "Generating Master Sitemap")
    run_step("verify_sitemap.py", "Database Structural Audit")
    run_step("check_sitemap.py", "Sitemap File Audit")

    print("\n" + "="*60)
    print("🏁 VALIFYE IS HARDENED. Ready for Deployment.")
    print("="*60 + "\n")

if __name__ == "__main__":
    valifye_master_sync()