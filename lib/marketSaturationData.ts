import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'market_saturation_pages'

export type MarketSaturationPlayer = {
  name: string
  market_share: string
  weakness: string
}

export type MarketSaturationPage = {
  slug: string
  meta_title: string
  meta_description: string
  market_name: string
  saturation_verdict: string
  saturation_score: number
  competition_intensity: string
  num_competitors: number | null
  market_leader: string | null
  reasons_its_crowded: string[]
  where_opportunity_exists: string[]
  top_players: MarketSaturationPlayer[]
  whitespace_angle: string | null
  pricing_gap_exists: boolean
  pricing_gap_description: string | null
  recent_market_shifts: string | null
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
  date_published: string
  date_modified: string
}

type MarketSaturationRow = Record<string, unknown>

function safeParseJSON<T>(value: unknown): T | null {
  if (value == null) return null
  if (typeof value === 'object') return value as T
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    return lower === 'true' || lower === '1' || lower === 'yes'
  }
  return Boolean(value)
}

function asStringArray(value: unknown): string[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

function asFaqArray(value: unknown): FaqItem[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const question = asString(row.question ?? row.q)
      const answer = asString(row.answer ?? row.a)
      if (!question || !answer) return null
      return { question, answer }
    })
    .filter((item): item is FaqItem => item !== null)
}

function asTopPlayers(value: unknown): MarketSaturationPlayer[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      if (!name) return null
      return {
        name,
        market_share: asString(row.market_share) || '—',
        weakness: asString(row.weakness) || '—'
      }
    })
    .filter((item): item is MarketSaturationPlayer => item !== null)
}

function normalizeMarketSaturationRow(
  row: MarketSaturationRow
): MarketSaturationPage {
  const createdAt = asString(row.created_at)
  const updatedAt = asString(row.updated_at)
  const datePublished =
    asString(row.date_published) || createdAt || new Date().toISOString()
  const dateModified =
    asString(row.date_modified) || updatedAt || datePublished

  return {
    slug: asString(row.slug),
    meta_title: asString(row.meta_title),
    meta_description: asString(row.meta_description),
    market_name: asString(row.market_name),
    saturation_verdict: asString(row.saturation_verdict),
    saturation_score: asNumber(row.saturation_score),
    competition_intensity: asString(row.competition_intensity),
    num_competitors: asNullableNumber(row.num_competitors),
    market_leader: asString(row.market_leader) || null,
    reasons_its_crowded: asStringArray(row.reasons_its_crowded),
    where_opportunity_exists: asStringArray(row.where_opportunity_exists),
    top_players: asTopPlayers(row.top_players),
    whitespace_angle: asString(row.whitespace_angle) || null,
    pricing_gap_exists: asBoolean(row.pricing_gap_exists),
    pricing_gap_description: asString(row.pricing_gap_description) || null,
    recent_market_shifts: asString(row.recent_market_shifts) || null,
    faq: asFaqArray(row.faq),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs),
    date_published: datePublished,
    date_modified: dateModified
  }
}

export {
  marketSaturationHubPath,
  marketSaturationPath,
} from '@/lib/pseoPaths'

/**
 * Fetch a single published market_saturation_pages row by slug.
 */
export async function getMarketSaturationBySlug(
  slug: string
): Promise<MarketSaturationPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<MarketSaturationRow>()

  if (error) {
    console.error(
      '[market_saturation_pages] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return safeNormalizePseoRow(
    TABLE_NAME,
    cleanSlug,
    data,
    normalizeMarketSaturationRow
  )
}
