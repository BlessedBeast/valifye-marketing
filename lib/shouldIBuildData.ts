import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import type { VerdictType } from '@/lib/reportData'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'should_i_build_pages'

export type BuildVerdict = 'Yes' | 'No' | 'Yes — If'

export type ExistingSolution = {
  name: string
  weakness: string
}

export type BuildStep = {
  name: string
  text: string
}

export type ShouldIBuildPage = {
  slug: string
  meta_title: string
  meta_description: string
  product_name: string
  verdict: BuildVerdict
  verdict_condition: string | null
  whitespace_score: number
  market_size: string
  target_audience: string
  estimated_time_to_mvp: string
  estimated_time_to_revenue: string
  problem_being_solved: string
  reasons_to_build: string[]
  reasons_not_to_build: string[]
  existing_solutions: ExistingSolution[]
  advantage_needed: string
  ideal_founder_profile: string
  first_three_steps: BuildStep[]
  key_risks: string[]
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
  date_published: string
  date_modified: string
}

type ShouldIBuildRow = Record<string, unknown>

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

function coerceBuildVerdict(raw: unknown): BuildVerdict {
  const value = asString(raw)
  const lower = value.toLowerCase()

  if (lower === 'no' || lower.startsWith('no ') || lower.includes('kill')) {
    return 'No'
  }
  if (
    lower.includes('if') ||
    lower.includes('only if') ||
    lower.includes('conditional')
  ) {
    return 'Yes — If'
  }
  return 'Yes'
}

export function buildVerdictToBadge(verdict: BuildVerdict): VerdictType {
  if (verdict === 'No') return 'KILL'
  if (verdict === 'Yes — If') return 'PIVOT'
  return 'BUILD'
}

function asExistingSolutions(value: unknown): ExistingSolution[] {
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
        weakness: asString(row.weakness) || '—'
      }
    })
    .filter((item): item is ExistingSolution => item !== null)
}

function asBuildSteps(value: unknown): BuildStep[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name ?? row.title ?? row.step)
      const text = asString(row.text ?? row.description ?? row.body)
      if (!name || !text) return null
      return { name, text }
    })
    .filter((item): item is BuildStep => item !== null)
}

function normalizeShouldIBuildRow(row: ShouldIBuildRow): ShouldIBuildPage {
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
    product_name: asString(row.product_name),
    verdict: coerceBuildVerdict(row.verdict),
    verdict_condition: asString(row.verdict_condition) || null,
    whitespace_score: asNumber(row.whitespace_score),
    market_size: asString(row.market_size),
    target_audience: asString(row.target_audience),
    estimated_time_to_mvp: asString(row.estimated_time_to_mvp),
    estimated_time_to_revenue: asString(row.estimated_time_to_revenue),
    problem_being_solved: asString(row.problem_being_solved),
    reasons_to_build: asStringArray(row.reasons_to_build),
    reasons_not_to_build: asStringArray(row.reasons_not_to_build),
    existing_solutions: asExistingSolutions(row.existing_solutions),
    advantage_needed: asString(row.advantage_needed),
    ideal_founder_profile: asString(row.ideal_founder_profile),
    first_three_steps: asBuildSteps(row.first_three_steps),
    key_risks: asStringArray(row.key_risks),
    faq: asFaqArray(row.faq),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs),
    date_published: datePublished,
    date_modified: dateModified
  }
}

export {
  shouldIBuildHubPath,
  shouldIBuildPath,
} from '@/lib/pseoPaths'

/**
 * Fetch a single published should_i_build_pages row by slug.
 */
export async function getShouldIBuildBySlug(
  slug: string
): Promise<ShouldIBuildPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<ShouldIBuildRow>()

  if (error) {
    console.error(
      '[should_i_build_pages] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return safeNormalizePseoRow(TABLE_NAME, cleanSlug, data, normalizeShouldIBuildRow)
}
