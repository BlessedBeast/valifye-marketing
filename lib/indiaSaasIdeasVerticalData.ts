import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { VerdictType } from '@/lib/reportData'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'india_saas_ideas_vertical_pages'

export type SaasVerticalIdea = {
  title: string
  one_liner: string
  verdict: VerdictType
  score: number
  target_audience: string
  market_size: string
  competition: string
  why_now: string
  idea_slug: string | null
} & Record<string, unknown>

export type SaasIdeasVerticalPage = {
  slug: string
  meta_title: string
  meta_description: string
  vertical_name: string
  intro_text: string
  vertical_market_size: string
  top_pick_title: string
  top_pick_reason: string
  ideas: SaasVerticalIdea[]
  why_this_vertical: string
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
}

type SaasIdeasVerticalRow = Record<string, unknown>

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
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
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

function asIdeas(value: unknown): SaasVerticalIdea[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const title = asString(row.title)
      if (!title) return null

      const one_liner =
        asString(row.one_liner) || asString(row.problem) || asString(row.solution)
      const ideaSlug = asString(row.idea_slug)

      return {
        ...row,
        title,
        one_liner,
        verdict: coerceVerdict(row.verdict),
        score: asNumber(row.score ?? row.whitespace_score),
        target_audience: asString(row.target_audience),
        market_size: asString(row.market_size),
        competition: asString(row.competition),
        why_now: asString(row.why_now),
        idea_slug: ideaSlug || null
      }
    })
    .filter((item): item is SaasVerticalIdea => item !== null)
}

function normalizeSaasIdeasVerticalRow(
  row: SaasIdeasVerticalRow
): SaasIdeasVerticalPage {
  return {
    slug: asString(row.slug),
    meta_title: asString(row.meta_title),
    meta_description: asString(row.meta_description),
    vertical_name: asString(row.vertical_name),
    intro_text: asString(row.intro_text),
    vertical_market_size: asString(row.vertical_market_size),
    top_pick_title: asString(row.top_pick_title),
    top_pick_reason: asString(row.top_pick_reason),
    ideas: asIdeas(row.ideas),
    why_this_vertical: asString(row.why_this_vertical),
    faq: asFaqArray(row.faq),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs)
  }
}

export { indiaSaasIdeasVerticalHubPath, indiaSaasIdeasVerticalPath } from '@/lib/pseoPaths'

/**
 * Fetch a single published india_saas_ideas_vertical_pages row by slug.
 */
export async function getIndiaSaasIdeasVerticalBySlug(
  slug: string
): Promise<SaasIdeasVerticalPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<SaasIdeasVerticalRow>()

  if (error) {
    console.error(
      '[india_saas_ideas_vertical_pages] Fetch failed for slug "%s": %s',
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
    normalizeSaasIdeasVerticalRow
  )
}
function asSlug(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function getAllIndiaSaasIdeasVerticalSlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('india_saas_ideas_vertical_pages')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error('[india_saas_ideas_vertical_pages] Build slug fetch failed: %s', error.message)
    return []
  }

  return (data ?? [])
    .map((row) => asSlug((row as { slug?: unknown }).slug))
    .filter((slug) => slug.length > 0)
}