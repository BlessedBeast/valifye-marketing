import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'local_feasibility_categories'

export type IndiaLocalFeasibilityCategoryHubRow = {
  slug: string
  business_category: string
  label: string
  short_description: string
  icon: string
  accent_color: string
  display_order: number
}

export type IndiaLocalFeasibilityCategoryPage = {
  slug: string
  business_category: string
  label: string
  short_description: string
  icon: string
  accent_color: string
  display_order: number
  meta_title: string
  meta_description: string
  intro_text: string
  category_context: string
  example_business_types: string[]
  faq: FaqItem[]
  date_published: string
  date_modified: string
}

type LocalFeasibilityCategoryRow = Record<string, unknown>

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

function normalizeIndiaLocalFeasibilityCategoryRow(
  row: LocalFeasibilityCategoryRow
): IndiaLocalFeasibilityCategoryPage {
  const createdAt = asString(row.created_at)
  const updatedAt = asString(row.updated_at)
  const datePublished = createdAt || new Date().toISOString()
  const dateModified = updatedAt || datePublished

  return {
    slug: asString(row.slug),
    business_category: asString(row.business_category),
    label: asString(row.label),
    short_description: asString(row.short_description),
    icon: asString(row.icon),
    accent_color: asString(row.accent_color),
    display_order: asNumber(row.display_order),
    meta_title: asString(row.meta_title),
    meta_description: asString(row.meta_description),
    intro_text: asString(row.intro_text),
    category_context: asString(row.category_context),
    example_business_types: asStringArray(row.example_business_types),
    faq: asFaqArray(row.faq),
    date_published: datePublished,
    date_modified: dateModified
  }
}

function normalizeIndiaLocalFeasibilityCategoryHubRow(
  row: LocalFeasibilityCategoryRow
): IndiaLocalFeasibilityCategoryHubRow | null {
  const slug = asString(row.slug)
  if (!slug) return null

  return {
    slug,
    business_category: asString(row.business_category),
    label: asString(row.label),
    short_description: asString(row.short_description),
    icon: asString(row.icon),
    accent_color: asString(row.accent_color),
    display_order: asNumber(row.display_order)
  }
}

/**
 * Published category rows for the India local market scout hub.
 */
export async function getAllIndiaLocalFeasibilityCategories(): Promise<
  IndiaLocalFeasibilityCategoryHubRow[]
> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      'slug, business_category, label, short_description, icon, accent_color, display_order'
    )
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error(
      '[local_feasibility_categories] Hub fetch failed: %s',
      error.message
    )
    return []
  }

  return (data ?? [])
    .map((row) =>
      normalizeIndiaLocalFeasibilityCategoryHubRow(row as LocalFeasibilityCategoryRow)
    )
    .filter((row): row is IndiaLocalFeasibilityCategoryHubRow => row !== null)
}

/**
 * Fetch a single published local_feasibility_categories row by slug.
 */
export async function getIndiaLocalFeasibilityCategoryBySlug(
  slug: string
): Promise<IndiaLocalFeasibilityCategoryPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<LocalFeasibilityCategoryRow>()

  if (error) {
    console.error(
      '[local_feasibility_categories] Fetch failed for slug "%s": %s',
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
    normalizeIndiaLocalFeasibilityCategoryRow
  )
}

/**
 * Build-time slug list for India local feasibility category landing pages.
 */
export async function getAllIndiaLocalFeasibilityCategorySlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error(
      '[local_feasibility_categories] Build slug fetch failed: %s',
      error.message
    )
    return []
  }

  return (data ?? [])
    .map((row) => asString((row as { slug?: unknown }).slug))
    .filter((slug) => slug.length > 0)
}

export {
  indiaLocalFeasibilityCategoryPath
} from '@/lib/pseoPaths'
