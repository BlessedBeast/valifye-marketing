import os, json, time, sys
from dotenv import load_dotenv
from supabase import create_client
from google import genai

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"), http_options={'api_version': 'v1'})

def architect_niches(region="INDIA"):
    print(f"🧠 ARCHITECT: Generating 50 Strategic Niches for {region}...")
    
    prompt = f"""
    Task: Propose 50 unique high-ticket startup niches for {region} in 2026.
    
    Categorize them into two tiers:
    1. 'ELITE': High-capex Tech, SaaS, or Advanced Manufacturing (Best for Mumbai, Bangalore, Delhi).
    2. 'SMB': High-intent service/retail businesses (Best for Tier 2/3 cities like Kolhapur, Indore).
    
    Return ONLY JSON:
    {{
      "niches": [
        {{
          "niche": "Exact Name",
          "tier": "ELITE",
          "expert_guide_text": "500-word deep dive...",
          "anchor": {{ "unit_price": 500000, "startup_costs": 2000000, "tam_logic": "Assumes 0.5% penetration of 1M businesses" }},
          "shape": "SaaS"
        }}
      ]
    }}
    """
    
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    data = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
    
    for n in data['niches']:
        supabase.table("niche_metadata").upsert({
            "niche": n['niche'],
            "region": region,
            "target_tier": n['tier'],
            "expert_guide_text": n['expert_guide_text'],
            "global_anchor_json": n['anchor'],
            "business_shape": n['shape'] if n['shape'] in ['SaaS', 'Service', 'E-commerce', 'Info'] else 'Service'
        }, on_conflict="region,niche").execute()
    print(f"✅ Created 50 Pillar Niches.")

if __name__ == "__main__":
    architect_niches()