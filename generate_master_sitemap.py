"""Shim: run `python scripts/generate_master_sitemap.py` (canonical implementation)."""
import runpy
from pathlib import Path

if __name__ == "__main__":
    script = Path(__file__).resolve().parent / "scripts" / "generate_master_sitemap.py"
    runpy.run_path(str(script), run_name="__main__")
