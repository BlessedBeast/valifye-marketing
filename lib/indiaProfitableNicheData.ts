import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { VerdictType } from '@/lib/reportData'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'india_profitable_niche_pages'

export type ProfitableNicheCompetitor = {
  name: string
  url: string
  pricing: string
}

export type ProfitableNichePage = {
  slug: string
  meta_title: string
  meta_description: string
  verdict: VerdictType
  niche_name: string
  whitespace_score: number
  demand_signal: string
  competition_level: string
  market_size: string
  avg_pricing_low: number
  avg_pricing_high: number
  entry_barrier: string
  why_attractive: string[]
  risks: string[]
  top_competitors: ProfitableNicheCompetitor[]
  opportunity_angle: string | null
  common_mistakes: string[]
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
  date_published: string
  date_modified: string
}

type ProfitableNicheRow = Record<string, unknown>

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

function asStringArray(value: unknown): string[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>
        return asString(
          row.text ??
            row.item ??
            row.label ??
            row.value ??
            row.point ??
            row.reason ??
            row.description
        )
      }
      return ''
    })
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

function asCompetitors(value: unknown): ProfitableNicheCompetitor[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      const url = asString(row.url)
      const pricing = asString(row.pricing)
      if (!name) return null
      return { name, url, pricing: pricing || '—' }
    })
    .filter((item): item is ProfitableNicheCompetitor => item !== null)
}

function coerceVerdict(raw: unknown): VerdictType {
  const upper = asString(raw).toUpperCase()
  if (upper.includes('BUILD')) return 'BUILD'
  if (
    upper.includes('KILL') ||
    upper.includes('FAIL') ||
    upper.includes('CATASTROPHIC')
  ) {
    return 'KILL'
  }
  return 'PIVOT'
}

function normalizeProfitableNicheRow(row: ProfitableNicheRow): ProfitableNichePage {
  try {
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
      verdict: coerceVerdict(row.verdict),
      niche_name: asString(row.niche_name),
      whitespace_score: asNumber(row.whitespace_score),
      demand_signal: asString(row.demand_signal),
      competition_level: asString(row.competition_level),
      market_size: asString(row.market_size),
      avg_pricing_low: asNumber(row.avg_pricing_low),
      avg_pricing_high: asNumber(row.avg_pricing_high),
      entry_barrier: asString(row.entry_barrier),
      why_attractive: asStringArray(row.why_attractive),
      risks: asStringArray(row.risks),
      top_competitors: asCompetitors(row.top_competitors),
      opportunity_angle: asString(row.opportunity_angle) || null,
      common_mistakes: asStringArray(row.common_mistakes),
      faq: asFaqArray(row.faq),
      related_idea_slugs: asStringArray(row.related_idea_slugs),
      related_tool_slugs: asStringArray(row.related_tool_slugs),
      date_published: datePublished,
      date_modified: dateModified
    }
  } catch (error) {
    console.error(
      '[india_profitable_niche_pages] Detail row normalization failed for slug "%s":',
      asString(row.slug),
      error
    )
    throw error
  }
}

export type IndiaProfitableNicheHubRow = {
  slug: string
  meta_title: string
  niche_name: string
  whitespace_score: number | null
  verdict: string
}

function normalizeIndiaProfitableNicheHubRow(
  row: ProfitableNicheRow
): IndiaProfitableNicheHubRow | null {
  try {
    const slug = asString(row.slug)
    if (!slug) return null

    const rawScore = row.whitespace_score
    const whitespace_score =
      rawScore == null || rawScore === ''
        ? null
        : asNumber(rawScore)

    return {
      slug,
      meta_title: asString(row.meta_title),
      niche_name: asString(row.niche_name),
      whitespace_score: Number.isFinite(whitespace_score) ? whitespace_score : null,
      verdict: asString(row.verdict)
    }
  } catch (error) {
    console.error(
      '[india_profitable_niche_pages] Hub row normalization failed for slug "%s":',
      asString(row.slug),
      error
    )
    return null
  }
}

export { indiaProfitableNicheHubPath, indiaProfitableNichePath } from '@/lib/pseoPaths'

/**
 * Fetch a single published india_profitable_niche_pages row by slug.
 */
export async function getIndiaProfitableNicheBySlug(
  slug: string
): Promise<ProfitableNichePage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<ProfitableNicheRow>()

  if (error) {
    console.error(
      '[india_profitable_niche_pages] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  try {
    return safeNormalizePseoRow(
      TABLE_NAME,
      cleanSlug,
      data,
      normalizeProfitableNicheRow
    )
  } catch (error) {
    console.error(
      '[india_profitable_niche_pages] Unexpected normalization error for slug "%s":',
      cleanSlug,
      error
    )
    return null
  }
}

/**
 * Published hub rows for /india/digital-battlefield/profitable-niches.
 */
export async function getIndiaProfitableNicheHubRows(): Promise<
  IndiaProfitableNicheHubRow[]
> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('slug, meta_title, niche_name, whitespace_score, verdict')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error(
      '[india_profitable_niche_pages] Hub fetch failed: %s',
      error.message
    )
    return []
  }

  const rows: IndiaProfitableNicheHubRow[] = []

  for (const raw of data ?? []) {
    try {
      const normalized = normalizeIndiaProfitableNicheHubRow(
        raw as ProfitableNicheRow
      )
      if (normalized) rows.push(normalized)
    } catch (error) {
      console.error(
        '[india_profitable_niche_pages] Hub row mapping failed:',
        error,
        raw
      )
    }
  }

  return rows
}

function asSlug(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function getAllIndiaProfitableNicheSlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('india_profitable_niche_pages')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error('[india_profitable_niche_pages] Build slug fetch failed: %s', error.message)
    return []
  }

  return (data ?? [])
    .map((row) => asSlug((row as { slug?: unknown }).slug))
    .filter((slug) => slug.length > 0)
}