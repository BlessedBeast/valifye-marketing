import { supabase } from '@/lib/supabase'
import type { VerdictType } from '@/lib/reportData'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'local_opportunity_pages'

export type TopSector = {
  name: string
  opportunity_level: string
  reasoning: string
}

export type BestNiche = {
  name: string
  verdict: VerdictType
  whitespace_score: number
  reason: string
  idea_slug: string | null
}

export type SectorToAvoid = {
  sector: string
  reason: string
}

export type LocalOpportunityPage = {
  slug: string
  meta_title: string
  meta_description: string
  city_name: string
  state_or_country: string
  year: number
  intro_text: string
  overall_opportunity_score: number
  startup_ecosystem: string
  cost_of_living: string
  tech_talent_availability: string
  top_sectors: TopSector[]
  best_niches_to_build: BestNiche[]
  sectors_to_avoid: SectorToAvoid[]
  notable_companies: string[]
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
  date_published: string
  date_modified: string
}

type LocalOpportunityRow = Record<string, unknown>

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
        return asString(row.name ?? row.company ?? row.title)
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

function asTopSectors(value: unknown): TopSector[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name ?? row.sector)
      if (!name) return null
      return {
        name,
        opportunity_level: asString(row.opportunity_level) || 'Moderate',
        reasoning: asString(row.reasoning ?? row.reason)
      }
    })
    .filter((item): item is TopSector => item !== null)
}

function asBestNiches(value: unknown): BestNiche[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name ?? row.niche_name ?? row.niche)
      if (!name) return null
      const ideaSlug = asString(row.idea_slug)
      return {
        name,
        verdict: coerceVerdict(row.verdict),
        whitespace_score: asNumber(row.whitespace_score),
        reason: asString(row.reason ?? row.reasoning),
        idea_slug: ideaSlug || null
      }
    })
    .filter((item): item is BestNiche => item !== null)
}

function asSectorsToAvoid(value: unknown): SectorToAvoid[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (typeof item === 'string') {
        return { sector: item.trim(), reason: '' }
      }
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const sector = asString(row.sector ?? row.name)
      if (!sector) return null
      return {
        sector,
        reason: asString(row.reason)
      }
    })
    .filter((item): item is SectorToAvoid => item !== null)
}

function normalizeLocalOpportunityRow(
  row: LocalOpportunityRow
): LocalOpportunityPage {
  const createdAt = asString(row.created_at)
  const updatedAt = asString(row.updated_at)
  const datePublished =
    asString(row.date_published) || createdAt || new Date().toISOString()
  const dateModified =
    asString(row.date_modified) || updatedAt || datePublished
  const year = asNumber(row.year, new Date().getFullYear())

  return {
    slug: asString(row.slug),
    meta_title: asString(row.meta_title),
    meta_description: asString(row.meta_description),
    city_name: asString(row.city_name),
    state_or_country: asString(row.state_or_country),
    year,
    intro_text: asString(row.intro_text),
    overall_opportunity_score: asNumber(row.overall_opportunity_score),
    startup_ecosystem: asString(row.startup_ecosystem),
    cost_of_living: asString(row.cost_of_living),
    tech_talent_availability: asString(row.tech_talent_availability),
    top_sectors: asTopSectors(row.top_sectors),
    best_niches_to_build: asBestNiches(row.best_niches_to_build),
    sectors_to_avoid: asSectorsToAvoid(row.sectors_to_avoid),
    notable_companies: asStringArray(row.notable_companies),
    faq: asFaqArray(row.faq),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs),
    date_published: datePublished,
    date_modified: dateModified
  }
}

export function localOpportunityPath(slug: string): string {
  return `/startup-opportunities-${slug}`
}

/**
 * Fetch a single published local_opportunity_pages row by slug.
 */
export async function getLocalOpportunityBySlug(
  slug: string
): Promise<LocalOpportunityPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<LocalOpportunityRow>()

  if (error) {
    console.error(
      '[local_opportunity_pages] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return normalizeLocalOpportunityRow(data)
}
