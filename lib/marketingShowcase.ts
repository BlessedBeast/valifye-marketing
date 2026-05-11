import { supabase } from '@/lib/supabase'

export type ShowcaseTemplate =
  | 'scout'
  | 'scout_pivot'
  | 'battlefield'
  | 'pivot'
  | 'arsenal'
  | 'risk'

export type ShowcaseMetric = {
  label: string
  value: string | number
  detail?: string
  source?: string
}

export type ShowcaseModule = {
  title: string
  summary?: string
  verdict?: string
  evidence?: string | string[]
  source?: string
  items?: ShowcaseMetric[]
  steps?: string[]
}

export type MarketingShowcaseReport = {
  id?: string
  slug: string
  title: string
  forensicVerdict: string
  template: ShowcaseTemplate
  score: number | null
  modules: ShowcaseModule[]
  sources: string[]
  rawData: Record<string, unknown>
  updatedAt?: string
}

type MarketingShowcaseRow = Record<string, unknown>

const TABLE_NAME = 'marketing_showcase'

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

function asRecord(value: unknown): Record<string, unknown> {
  return safeParseJSON<Record<string, unknown>>(value) ?? {}
}

function firstRecord(...values: unknown[]): Record<string, unknown> {
  for (const value of values) {
    const parsed = asRecord(value)
    if (Object.keys(parsed).length > 0) return parsed
  }

  return {}
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeTemplate(value: unknown): ShowcaseTemplate {
  const raw = String(value ?? '').toLowerCase()

  // Local Recovery / Scout Pivot must be matched before the bare "pivot" rule
  // because the value can legitimately contain both "scout" and "pivot".
  if (
    raw.includes('autopsy') ||
    (raw.includes('local') && raw.includes('recovery')) ||
    (raw.includes('scout') && (raw.includes('pivot') || raw.includes('recovery')))
  ) {
    return 'scout_pivot'
  }

  if (raw.includes('battlefield') || raw.includes('digital')) return 'battlefield'
  if (raw.includes('pivot')) return 'pivot'
  if (raw.includes('arsenal') || raw.includes('roadmap')) return 'arsenal'
  if (raw.includes('risk') || raw.includes('mitigation')) return 'risk'
  return 'scout'
}

function normalizeMetric(value: unknown): ShowcaseMetric | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const label = asString(row.label) ?? asString(row.name) ?? asString(row.metric)
  const metricValue =
    asString(row.value) ?? asString(row.score) ?? asString(row.amount) ?? asNumber(row.value)

  if (!label || metricValue == null) return null

  return {
    label,
    value: metricValue,
    detail: asString(row.detail) ?? asString(row.description) ?? undefined,
    source: asString(row.source) ?? undefined
  }
}

function normalizeModule(value: unknown, fallbackTitle?: string): ShowcaseModule | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const title =
    asString(row.title) ??
    asString(row.name) ??
    asString(row.module) ??
    fallbackTitle

  if (!title) return null

  const rawItems =
    Array.isArray(row.items) ? row.items :
    Array.isArray(row.metrics) ? row.metrics :
    Array.isArray(row.cards) ? row.cards :
    []

  const rawSteps =
    Array.isArray(row.steps) ? row.steps :
    Array.isArray(row.actions) ? row.actions :
    []

  return {
    title,
    summary:
      asString(row.summary) ??
      asString(row.description) ??
      asString(row.insight) ??
      undefined,
    verdict: asString(row.verdict) ?? asString(row.finding) ?? undefined,
    evidence:
      asString(row.evidence) ??
      asString(row.hard_evidence) ??
      (Array.isArray(row.evidence) ? row.evidence.filter((item): item is string => typeof item === 'string') : undefined),
    source: asString(row.source) ?? asString(row.citation) ?? undefined,
    items: rawItems.map(normalizeMetric).filter((item): item is ShowcaseMetric => Boolean(item)),
    steps: rawSteps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0)
  }
}

function normalizeModules(rawData: Record<string, unknown>): ShowcaseModule[] {
  const moduleSource =
    Array.isArray(rawData.modules) ? rawData.modules :
    Array.isArray(rawData.sections) ? rawData.sections :
    Array.isArray(rawData.report_modules) ? rawData.report_modules :
    null

  if (moduleSource) {
    return moduleSource
      .map((module) => normalizeModule(module))
      .filter((module): module is ShowcaseModule => Boolean(module))
  }

  return Object.entries(rawData)
    .map(([key, value]) => normalizeModule(value, key.replace(/_/g, ' ')))
    .filter((module): module is ShowcaseModule => Boolean(module))
}

function normalizeSources(row: MarketingShowcaseRow, rawData: Record<string, unknown>): string[] {
  const sourceCandidates = [
    row.sources,
    row.data_sources,
    rawData.sources,
    rawData.data_sources
  ]

  for (const candidate of sourceCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((source): source is string => typeof source === 'string')
    }
  }

  const singleSource = asString(row.source) ?? asString(rawData.source)
  return singleSource ? [singleSource] : []
}

export function normalizeMarketingShowcaseRow(
  row: MarketingShowcaseRow
): MarketingShowcaseReport {
  const slug = asString(row.slug) ?? ''
  const rawData = firstRecord(row.report_data, row.data, row.payload)

  const title =
    asString(row.report_title) ??
    asString(row.title) ??
    asString(row.idea_title) ??
    asString(rawData.report_title) ??
    asString(rawData.title) ??
    titleCaseFromSlug(slug)

  const forensicVerdict =
    asString(row.forensic_verdict) ??
    asString(row.verdict) ??
    asString(row.final_verdict) ??
    asString(rawData.forensic_verdict) ??
    asString(rawData.verdict) ??
    'Forensic signal detected. Full audit required before operating decisions.'

  return {
    id: asString(row.id) ?? undefined,
    slug,
    title,
    forensicVerdict,
    template: normalizeTemplate(row.template ?? row.template_type ?? row.report_type ?? rawData.template),
    score:
      asNumber(row.score) ??
      asNumber(row.integrity_score) ??
      asNumber(row.logic_score) ??
      asNumber(rawData.score),
    modules: normalizeModules(rawData),
    sources: normalizeSources(row, rawData),
    rawData,
    updatedAt: asString(row.updated_at) ?? asString(row.published_at) ?? undefined
  }
}

export async function getMarketingShowcaseBySlug(
  slug: string
): Promise<MarketingShowcaseReport | null> {
  const cleanSlug = decodeURIComponent(slug)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .maybeSingle<MarketingShowcaseRow>()

  if (error || !data) {
    if (error) console.error('Supabase Fetch Error (marketing_showcase):', error)
    return null
  }

  return normalizeMarketingShowcaseRow(data)
}

/**
 * Fetch a list of marketing_showcase rows and return only those whose
 * (normalized) template matches the requested set.
 *
 * The fetch is intentionally unfiltered at the database level — Supabase's
 * `.in()` and `.or()` filters do exact, case-sensitive comparisons, so any DB
 * value like `'Local Market Scout'`, `'Scout '`, or `'battlefield-saas'`
 * silently fails to match `'scout'` / `'battlefield'`. We pull the (small,
 * curated) table once and run every row through `normalizeTemplate()` — the
 * same canonicalizer used by the rest of the codebase — to compare against the
 * caller's requested template set. That makes the helper agnostic to whatever
 * casing or column the row happens to use.
 */
export async function getShowcaseList(
  types: string[]
): Promise<MarketingShowcaseReport[]> {
  if (!Array.isArray(types) || types.length === 0) return []

  const cleanedTypes = types
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter((t) => t.length > 0)

  if (cleanedTypes.length === 0) return []

  const requested = new Set<ShowcaseTemplate>(
    cleanedTypes.map((t) => normalizeTemplate(t))
  )

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(
      '[marketing_showcase] Fetch failed:',
      error.message,
      error.details ?? '',
      error.hint ?? ''
    )
    return []
  }

  const rows = Array.isArray(data) ? (data as MarketingShowcaseRow[]) : []

  if (rows.length === 0) {
    console.warn(
      '[marketing_showcase] Query returned 0 rows. If you can see rows in the ' +
        'Supabase dashboard but this list is empty, the anon client is being ' +
        'blocked by Row Level Security. Add a public SELECT policy on ' +
        '`public.marketing_showcase` for the `anon` and `authenticated` roles.'
    )
    return []
  }

  const matched: MarketingShowcaseReport[] = []
  const seenSlugs = new Set<string>()

  for (const row of rows) {
    const normalized = normalizeMarketingShowcaseRow(row)
    if (!normalized.slug || seenSlugs.has(normalized.slug)) continue
    if (!requested.has(normalized.template)) continue
    seenSlugs.add(normalized.slug)
    matched.push(normalized)
  }

  if (matched.length === 0) {
    const distinctRawTypes = Array.from(
      new Set(
        rows
          .map((row) =>
            asString(row.report_type) ??
              asString(row.template) ??
              asString(row.template_type) ??
              ''
          )
          .filter((s) => s.length > 0)
      )
    )
    console.warn(
      '[marketing_showcase] Fetched %d rows but none normalized to %o. ' +
        'Raw report_type / template values found in DB: %o. ' +
        'Update the row values or extend `normalizeTemplate()` to recognize them.',
      rows.length,
      Array.from(requested),
      distinctRawTypes
    )
  }

  return matched
}
