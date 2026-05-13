"""Shim: run `python scripts/verify_sitemap.py` (implementation in repo-root `verify_sitemap.py`)."""
import runpy
from pathlib import Path

if __name__ == "__main__":
    runpy.run_path(
        str(Path(__file__).resolve().parent.parent / "verify_sitemap.py"),
        run_name="__main__",
    )
