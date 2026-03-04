import { supabase } from '@/lib/supabase'
import type { Idea } from '@/lib/ideaData'
import type { HeatType, ConfidenceType, TrendType, BusinessShape } from '@/lib/ideaData'

/**
 * Supabase market_data table row shape (snake_case columns).
 * Ensure this stays in sync with your Supabase table schema.
 */
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
  top_complaints: string[]
  faq_outlook?: string | null
  opportunity_score: number
  difficulty_score: number
  trend: TrendType
  trend_pct: number
  revenue_potential: { low: number; mid: number; high: number }
  avg_revenue_per_unit: number
  startup_cost_range: { low: number; high: number }
  breakeven_months: number
  business_shape: BusinessShape | null
  status: string
  data_source: string
  // Validation Blueprint fields
  local_friction?: string[]
  gtm_playbook?: string[]
  failure_modes?: string
  // Stored as JSON in Supabase
  unit_economics?: Record<string, unknown> | null
}

export interface CountryMarketData {
  country: string
  total_niches: number
  average_opportunity_score: number
  top_industries: string[]
  city_list: string[]
}

export interface NicheMetadataRow {
  id: number
  region: string
  niche: string
  expert_guide_text: string
  global_anchor: Record<string, unknown> | null
  business_shape: BusinessShape | null
}

const SELECT_COLS = `
  slug, region, niche, city, market_heat, estimated_tam, local_competitors,
  market_narrative, confidence, top_complaints, faq_outlook, opportunity_score, difficulty_score,
  trend, trend_pct, revenue_potential, avg_revenue_per_unit, startup_cost_range,
  breakeven_months, business_shape, status, data_source,
  local_friction, gtm_playbook, failure_modes, unit_economics
`

function mapRowToIdea(row: MarketDataRow) {
  return {
    slug: row.slug,
    niche: row.niche,
    city: row.city,
    market_heat: row.market_heat,
    estimated_tam: row.estimated_tam,
    local_competitors: row.local_competitors,
    market_narrative: row.market_narrative,
    confidence: row.confidence,
    top_complaints: Array.isArray(row.top_complaints) ? row.top_complaints : [],
    faq_outlook: row.faq_outlook ?? undefined,
    opportunity_score: row.opportunity_score,
    difficulty_score: row.difficulty_score,
    trend: row.trend,
    trend_pct: row.trend_pct,
    revenue_potential:
      typeof row.revenue_potential === 'object' && row.revenue_potential !== null
        ? {
            low: Number((row.revenue_potential as { low?: number }).low ?? 0),
            mid: Number((row.revenue_potential as { mid?: number }).mid ?? 0),
            high: Number((row.revenue_potential as { high?: number }).high ?? 0)
          }
        : { low: 0, mid: 0, high: 0 },
    avg_revenue_per_unit: Number(row.avg_revenue_per_unit) ?? 0,
    startup_cost_range:
      typeof row.startup_cost_range === 'object' && row.startup_cost_range !== null
        ? {
            low: Number((row.startup_cost_range as { low?: number }).low ?? 0),
            high: Number((row.startup_cost_range as { high?: number }).high ?? 0)
          }
        : { low: 0, high: 0 },
    breakeven_months: Number(row.breakeven_months) ?? 0,
    business_shape: row.business_shape ?? undefined,
    // Validation Blueprint fields (with safe defaults)
    local_friction: Array.isArray(row.local_friction) ? row.local_friction : [],
    gtm_playbook: Array.isArray(row.gtm_playbook) ? row.gtm_playbook : [],
    failure_modes: typeof row.failure_modes === 'string' ? row.failure_modes : '',
    unit_economics:
      row.unit_economics && typeof row.unit_economics === 'object'
        ? row.unit_economics
        : {}
  }
}

/**
 * Fetch a single published idea by slug. Returns null if not found or not published.
 */
export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('market_data')
    .select(SELECT_COLS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null
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
 * Fetch other published ideas with the same niche (for CityComparison).
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
  return (data as MarketDataRow[]).map(mapRowToIdea)
}

/**
 * Slugify niche for URL segment (e.g. "EV Charging Station" → "ev-charging-station").
 */
export function slugifyNiche(niche: string): string {
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
 * Returns slug, city, niche for each — used to list cities and link to idea pages.
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

/**
 * Fetch other published ideas in the same city (for Related Markets).
 */
export async function getSameCityIdeas(
  currentSlug: string,
  city: string
): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('market_data')
    .select(SELECT_COLS)
    .eq('city', city)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .limit(8)

  if (error || !data) return []
  return (data as MarketDataRow[]).map(mapRowToIdea)
}

/**
 * Aggregate published market_data rows for a given country/region into a national report.
 */
export async function getCountryMarketData(country: string): Promise<CountryMarketData | null> {
  const region = country.trim()

  const { data, error } = await supabase
    .from('market_data')
    .select('region, city, opportunity_score, archetype, niche')
    .eq('status', 'published')
    .eq('region', region)

  if (error || !data || !data.length) {
    return null
  }

  const rows = data as {
    region: string
    city: string
    opportunity_score: number | null
    archetype?: string | null
    niche: string
  }[]

  const total_niches = rows.length

  // Average opportunity score
  const scores: number[] = []
  for (const row of rows) {
    const v = Number(row.opportunity_score ?? 0)
    if (Number.isFinite(v) && v > 0) scores.push(v)
  }
  const average_opportunity_score =
    scores.length > 0 ? scores.reduce((sum, v) => sum + v, 0) / scores.length : 0

  // Top industries based on most frequent archetype (if stored)
  const archetypeCounts = new Map<string, number>()
  for (const row of rows) {
    const key = (row.archetype || '').trim()
    if (!key) continue
    archetypeCounts.set(key, (archetypeCounts.get(key) ?? 0) + 1)
  }
  const sortedArchetypes = Array.from(archetypeCounts.entries()).sort((a, b) => b[1] - a[1])
  const top_industries = sortedArchetypes.slice(0, 5).map(([name]) => name)

  // Unique city list
  const citySet = new Set<string>()
  for (const row of rows) {
    if (row.city) citySet.add(row.city)
  }
  const city_list = Array.from(citySet).sort((a, b) => a.localeCompare(b))

  return {
    country: region,
    total_niches,
    average_opportunity_score,
    top_industries,
    city_list
  }
}

/**
 * Fetch niche-level metadata (expert guide, anchor) for a given niche.
 */
export async function getNicheMetadataByNiche(
  niche: string
): Promise<NicheMetadataRow | null> {
  const { data, error } = await supabase
    .from('niche_metadata')
    .select('id, region, niche, expert_guide_text, global_anchor, business_shape')
    .eq('niche', niche)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as NicheMetadataRow
}
