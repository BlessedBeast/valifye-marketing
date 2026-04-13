import xml.etree.ElementTree as ET
import re

def check_valifye_sitemap_v2(file_path):
    print(f"🔍 Forensic Scan V2: {file_path}")
    
    # Common words containing 'in' that are NOT errors
    false_positives = ['monitoring', 'viking', 'fintech', 'pricing', 'sentinel', 'origin', 'business', 'mapping', 'printing', 'shipping', 'main']
    
    with open(file_path, 'r', encoding='utf-8') as f:
        # Skip browser warning lines if they exist
        content = "".join([line for line in f if not line.strip().startswith('This XML file')])
        root = ET.fromstring(content)

    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [url.find('ns:loc', namespace).text for url in root.findall('ns:url', namespace)]
    
    seen = set()
    duplicates = []
    real_sloppy_slugs = []

    for url in urls:
        # 1. Check Duplicates
        if url in seen:
            duplicates.append(url)
        seen.add(url)

        # 2. Check for REAL Sloppy Slugs (Smarter Regex)
        # We look for [a-z]in[a-z] but EXCLUDE our false positive list
        if 'in' in url and '-in-' not in url:
            # Check if 'in' is glued to letters
            match = re.search(r'([a-z0-9]+)in([a-z0-9]+)', url)
            if match:
                full_word = match.group(0)
                # If the 'glued' word isn't in our safe list, it might be an error
                if not any(safe in full_word for safe in false_positives):
                    real_sloppy_slugs.append(url)

    print(f"📊 Total URLs: {len(urls)}")
    print(f"👯 Duplicates Found: {len(duplicates)}")
    for d in duplicates: print(f"   -> {d}")
    
    print(f"🚩 Potential Real Sloppy Slugs: {len(real_sloppy_slugs)}")
    for s in real_sloppy_slugs: print(f"   -> {s}")

if __name__ == "__main__":
    check_valifye_sitemap_v2("new sitemap.txt")