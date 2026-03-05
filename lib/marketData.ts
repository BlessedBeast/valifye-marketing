import { supabase } from '@/lib/supabase'
import type { Idea } from '@/lib/ideaData'
import type { HeatType, ConfidenceType, TrendType, BusinessShape } from '@/lib/ideaData'

/**
 * 🛡️ Validator's Bulletproof JSON Parser
 * Prevents Next.js Server Components from crashing when Supabase 
 * returns stringified JSON instead of objects.
 */
function safeParseJSON(data: any) {
  if (!data) return null;
  if (typeof data === 'object' && !Array.isArray(data)) return data;
  if (Array.isArray(data)) return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("❌ JSON Parse Error on field:", data);
    return null;
  }
}

export interface MarketDataRow {
  slug: string
  region: string
  niche: string
  city: string
  market_heat: HeatType
  estimated_tam: string
  local_competitors: number
  market_narrative: string
  confidence: ConfidenceType
  top_complaints: any // Using any for safe parsing
  faq_outlook?: string | null
  opportunity_score: number
  difficulty_score: number
  trend: TrendType
  trend_pct: number
  revenue_potential: any
  avg_revenue_per_unit: number
  startup_cost_range: any
  breakeven_months: number
  business_shape: BusinessShape | null
  status: string
  data_source: string
  local_friction?: any
  gtm_playbook?: any
  failure_modes?: string
  unit_economics?: any
  global_anchor_json?: any // 2026 Forensic Field
}

export interface CountryMarketData {
  country: string
  total_niches: number
  average_opportunity_score: number
  top_industries: string[]
  city_list: string[]
}

const SELECT_COLS = `
  slug, region, niche, city, market_heat, estimated_tam, local_competitors,
  market_narrative, confidence, top_complaints, faq_outlook, opportunity_score, difficulty_score,
  trend, trend_pct, revenue_potential, avg_revenue_per_unit, startup_cost_range,
  breakeven_months, business_shape, status, data_source,
  local_friction, gtm_playbook, failure_modes, unit_economics, global_anchor_json
`

function mapRowToIdea(row: MarketDataRow): Idea {
  // Parse all potential JSON/Array fields
  const parsedFriction = safeParseJSON(row.local_friction);
  const parsedGtm = safeParseJSON(row.gtm_playbook);
  const parsedComplaints = safeParseJSON(row.top_complaints);
  const parsedUnitEcon = safeParseJSON(row.unit_economics);
  const parsedAnchorEcon = safeParseJSON(row.global_anchor_json);

  return {
    slug: row.slug,
    niche: row.niche,
    city: row.city,
    region: row.region, // Mapping region field
    market_heat: row.market_heat,
    estimated_tam: row.estimated_tam,
    local_competitors: row.local_competitors,
    market_narrative: row.market_narrative,
    confidence: row.confidence,
    top_complaints: Array.isArray(parsedComplaints) ? parsedComplaints : [],
    faq_outlook: row.faq_outlook ?? undefined,
    opportunity_score: Number(row.opportunity_score) || 0,
    difficulty_score: Number(row.difficulty_score) || 0,
    trend: row.trend,
    trend_pct: row.trend_pct,
    revenue_potential: safeParseJSON(row.revenue_potential) || { low: 0, mid: 0, high: 0 },
    avg_revenue_per_unit: Number(row.avg_revenue_per_unit) || 0,
    startup_cost_range: safeParseJSON(row.startup_cost_range) || { low: 0, high: 0 },
    breakeven_months: Number(row.breakeven_months) || 0,
    business_shape: row.business_shape ?? undefined,
    
    // 🏗️ Forensic Blueprint Fields
    local_friction: Array.isArray(parsedFriction) ? parsedFriction : [],
    gtm_playbook: Array.isArray(parsedGtm) ? parsedGtm : [],
    failure_modes: row.failure_modes || "Forensic failure audit pending.",
    
    // Prioritize the new Global Anchor JSON
    unit_economics: parsedAnchorEcon || parsedUnitEcon || {},
    global_anchor_json: parsedAnchorEcon || null
  } as any // Casting to any to bypass strict Idea type if it's lagging behind
}

/**
 * Fetch a single published idea by slug.
 */
export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('market_data')
    .select(SELECT_COLS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("❌ getIdeaBySlug Error:", error.message);
    return null;
  }
  return mapRowToIdea(data as MarketDataRow)
}

/**
 * Fetch first N published slugs for generateStaticParams.
 */
export async function getPublishedSlugs(limit: number): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('market_data')
    .select('slug')
    .eq('status', 'published')
    .limit(limit)

  if (error || !data) return []
  return data as { slug: string }[]
}

/**
 * Fetch other published ideas with the same niche.
 */
export async function getSameNicheIdeas(
  currentSlug: string,
  niche: string
): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('market_data')
    .select(SELECT_COLS)
    .eq('niche', niche)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .limit(10)

  if (error || !data) return []
  return (data as MarketDataRow[]).map(mapRowToIdea) as any
}

/**
 * Aggregate published market_data rows for a given country/region.
 */
export async function getCountryMarketData(country: string): Promise<CountryMarketData | null> {
  const region = country.trim()

  const { data, error } = await supabase
    .from('market_data')
    .select('region, city, opportunity_score, niche')
    .eq('status', 'published')
    .eq('region', region)

  if (error || !data || !data.length) return null

  const rows = data as any[]
  const total_niches = rows.length

  const scores = rows
    .map(r => Number(r.opportunity_score))
    .filter(s => !isNaN(s) && s > 0)
    
  const average_opportunity_score =
    scores.length > 0 ? scores.reduce((sum, v) => sum + v, 0) / scores.length : 0

  const citySet = new Set<string>()
  rows.forEach(r => { if (r.city) citySet.add(r.city) })
  
  return {
    country: region,
    total_niches,
    average_opportunity_score,
    top_industries: [], // Can be expanded with archetype logic
    city_list: Array.from(citySet).sort()
  }
}
/**
 * Slugify niche for URL segment (e.g. "EV Charging Station" → "ev-charging-station").
 */
export function slugifyNiche(niche: string): string {
  if (!niche) return '';
  return niche
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Fetch all unique niche categories from published market_data (for directory index).
 */
export async function getUniqueNiches(): Promise<{ niche: string; nicheSlug: string }[]> {
  const { data, error } = await supabase
    .from('market_data')
    .select('niche')
    .eq('status', 'published')

  if (error || !data) return []

  const seen = new Set<string>()
  const result: { niche: string; nicheSlug: string }[] = []
  
  for (const row of data as { niche: string }[]) {
    const niche = row.niche?.trim()
    if (niche && !seen.has(niche)) {
      seen.add(niche)
      result.push({ niche, nicheSlug: slugifyNiche(niche) })
    }
  }
  
  result.sort((a, b) => a.niche.localeCompare(b.niche))
  return result
}

/**
 * Fetch all published rows for a niche (by slugified niche), for directory [niche] page.
 */
export async function getPublishedByNicheSlug(
  nicheSlug: string
): Promise<{ slug: string; city: string; niche: string }[]> {
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, city, niche')
    .eq('status', 'published')

  if (error || !data) return []

  const rows = data as { slug: string; city: string; niche: string }[]
  return rows.filter((row) => slugifyNiche(row.niche) === nicheSlug)
}