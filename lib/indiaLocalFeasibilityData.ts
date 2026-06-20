import type { FeasibilityZone } from '@/components/ui/FeasibilityZoneBadge'
import type { CrowdingIntensity } from '@/components/ui/CrowdingBadge'
import type { CategoryBenchmarks } from '@/components/ui/CategoryBenchmarkTable'
import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'local_feasibility_pages'
const INDIA_COUNTRY = 'India'

export type IndiaLockedModule = {
  module_number: number
  module_name: string
  teaser_line: string
  icon: string
}

export type IndiaLocalFeasibilityPage = {
  slug: string
  meta_title: string
  meta_description: string
  country: string
  business_type: string
  city_name: string
  state_or_region: string
  feasibility_zone: FeasibilityZone
  market_context: string
  benchmarks: CategoryBenchmarks
  crowding_intensity: CrowdingIntensity
  crowding_label: string
  regulatory_checklist: string[]
  locked_modules: IndiaLockedModule[]
  related_report_slugs: string[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
  report_price: number
  report_price_currency: string
  faq: FaqItem[]
  date_published: string
  date_modified: string
}

export type IndiaLocalFeasibilityHubRow = {
  slug: string
  business_type: string
  business_category: string
  city_name: string
  state_or_region: string
  feasibility_zone: FeasibilityZone
}

type LocalFeasibilityRow = Record<string, unknown>

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

function coerceFeasibilityZone(raw: unknown): FeasibilityZone {
  const value = asString(raw)
  if (
    value === 'Opportunity' ||
    value === 'Caution' ||
    value === 'Saturated' ||
    value === 'Avoid'
  ) {
    return value
  }

  const lower = value.toLowerCase()
  if (lower.includes('opportun')) return 'Opportunity'
  if (lower.includes('caution') || lower.includes('pivot')) return 'Caution'
  if (lower.includes('saturat') || lower.includes('crowded')) return 'Saturated'
  if (lower.includes('avoid') || lower.includes('kill')) return 'Avoid'
  return 'Caution'
}

function coerceCrowdingIntensity(raw: unknown): CrowdingIntensity {
  const value = asString(raw)
  if (
    value === 'Low' ||
    value === 'Medium' ||
    value === 'High' ||
    value === 'Extreme'
  ) {
    return value
  }

  const lower = value.toLowerCase()
  if (lower.includes('extreme')) return 'Extreme'
  if (lower.includes('high')) return 'High'
  if (lower.includes('medium') || lower.includes('moderate')) return 'Medium'
  return 'Low'
}

function asRegulatoryChecklist(value: unknown): string[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (!item || typeof item !== 'object') return ''
      const row = item as Record<string, unknown>
      return asString(
        row.requirement ?? row.item ?? row.label ?? row.title ?? row.name
      )
    })
    .filter((item) => item.length > 0)
}

function asLockedModules(value: unknown): IndiaLockedModule[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const moduleName = asString(row.module_name ?? row.moduleName ?? row.name)
      const teaserLine = asString(row.teaser_line ?? row.teaserLine ?? row.teaser)
      if (!moduleName || !teaserLine) return null

      return {
        module_number: asNumber(row.module_number ?? row.moduleNumber, index + 1),
        module_name: moduleName,
        teaser_line: teaserLine,
        icon: asString(row.icon, 'Lock')
      }
    })
    .filter((item): item is IndiaLockedModule => item !== null)
}

function normalizeBenchmarks(row: LocalFeasibilityRow): CategoryBenchmarks {
  return {
    cogs_low: asNumber(row.cogs_low),
    cogs_high: asNumber(row.cogs_high),
    labor_low: asNumber(row.labor_low),
    labor_high: asNumber(row.labor_high),
    rent_low: asNumber(row.rent_low),
    rent_high: asNumber(row.rent_high),
    op_margin_low: asNumber(row.op_margin_low),
    op_margin_high: asNumber(row.op_margin_high)
  }
}

function normalizeIndiaLocalFeasibilityRow(
  row: LocalFeasibilityRow
): IndiaLocalFeasibilityPage {
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
    country: asString(row.country, INDIA_COUNTRY),
    business_type: asString(row.business_type),
    city_name: asString(row.city_name),
    state_or_region: asString(row.state_or_region),
    feasibility_zone: coerceFeasibilityZone(row.feasibility_zone),
    market_context: asString(row.market_context),
    benchmarks: normalizeBenchmarks(row),
    crowding_intensity: coerceCrowdingIntensity(row.crowding_intensity),
    crowding_label: asString(row.crowding_label),
    regulatory_checklist: asRegulatoryChecklist(row.regulatory_checklist),
    locked_modules: asLockedModules(row.locked_modules),
    related_report_slugs: asStringArray(
      row.related_report_slugs ?? row.related_feasibility_slugs
    ),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs),
    report_price: asNumber(row.report_price),
    report_price_currency: asString(row.report_price_currency, 'INR'),
    faq: asFaqArray(row.faq),
    date_published: datePublished,
    date_modified: dateModified
  }
}

function normalizeIndiaLocalFeasibilityHubRow(
  row: LocalFeasibilityRow
): IndiaLocalFeasibilityHubRow {
  return {
    slug: asString(row.slug),
    business_type: asString(row.business_type),
    business_category: asString(row.business_category),
    city_name: asString(row.city_name),
    state_or_region: asString(row.state_or_region),
    feasibility_zone: coerceFeasibilityZone(row.feasibility_zone)
  }
}

export {
  indiaLocalFeasibilityHubPath,
  indiaLocalFeasibilityPath
} from '@/lib/pseoPaths'

export function formatIndiaReportPrice(
  amount: number,
  currency: string
): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0)
  if (currency.toUpperCase() === 'INR') {
    return `₹${rounded.toLocaleString('en-IN')}`
  }
  return `$${rounded.toLocaleString('en-US')}`
}

/**
 * Fetch all published India local_feasibility_pages rows for the hub grid.
 */
export async function getIndiaLocalFeasibilityHubRows(options?: {
  category?: string
}): Promise<IndiaLocalFeasibilityHubRow[]> {
  let query = supabase
    .from(TABLE_NAME)
    .select(
      'slug, business_type, business_category, city_name, state_or_region, feasibility_zone'
    )
    .eq('country', INDIA_COUNTRY)
    .eq('is_published', true)

  const category = options?.category?.trim()
  if (category) {
    query = query.eq('business_category', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error(
      '[local_feasibility_pages] Hub fetch failed for India: %s',
      error.message
    )
    return []
  }

  return (data ?? [])
    .map((row) =>
      safeNormalizePseoRow(
        TABLE_NAME,
        asString((row as LocalFeasibilityRow).slug),
        row as LocalFeasibilityRow,
        normalizeIndiaLocalFeasibilityHubRow
      )
    )
    .filter((row): row is IndiaLocalFeasibilityHubRow => row !== null)
}

/**
 * Fetch a single published local_feasibility_pages row by slug (India only).
 */
export async function getIndiaLocalFeasibilityBySlug(
  slug: string
): Promise<IndiaLocalFeasibilityPage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('country', INDIA_COUNTRY)
    .eq('is_published', true)
    .maybeSingle<LocalFeasibilityRow>()

  if (error) {
    console.error(
      '[local_feasibility_pages] Fetch failed for slug "%s": %s',
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
    normalizeIndiaLocalFeasibilityRow
  )
}

/**
 * Build-time slug list for India local feasibility detail pages.
 */
export async function getAllIndiaLocalFeasibilitySlugs(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select('slug')
    .eq('country', INDIA_COUNTRY)
    .eq('is_published', true)

  if (error) {
    console.error(
      '[local_feasibility_pages] Build slug fetch failed for India: %s',
      error.message
    )
    return []
  }

  return (data ?? [])
    .map((row) => asString((row as { slug?: unknown }).slug))
    .filter((slug) => slug.length > 0)
}
