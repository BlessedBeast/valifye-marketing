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
 * Fetch a list of marketing_showcase rows filtered by report_type and ordered
 * by created_at descending. Each `types` entry is matched against the legacy
 * `report_type` column AND the normalized template, so callers can pass either
 * raw DB values ("Local Market Scout") or normalized template names ("scout").
 */
export async function getShowcaseList(
  types: string[]
): Promise<MarketingShowcaseReport[]> {
  if (!Array.isArray(types) || types.length === 0) return []

  const cleanedTypes = types
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter((t) => t.length > 0)

  if (cleanedTypes.length === 0) return []

  const normalizedRequested = new Set<ShowcaseTemplate>(
    cleanedTypes.map((t) => normalizeTemplate(t))
  )

  // Primary path: filter directly on the `report_type` column.
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('report_type', cleanedTypes)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(
      'Supabase Fetch Error (marketing_showcase list by report_type):',
      error
    )
    return []
  }

  const rows = Array.isArray(data) ? (data as MarketingShowcaseRow[]) : []
  const matchedSlugs = new Set<string>()

  type SortEntry = { report: MarketingShowcaseReport; sortKey: number }
  const collected: SortEntry[] = []

  const pushRow = (row: MarketingShowcaseRow) => {
    const normalized = normalizeMarketingShowcaseRow(row)
    if (!normalized.slug || matchedSlugs.has(normalized.slug)) return
    if (!normalizedRequested.has(normalized.template)) return
    matchedSlugs.add(normalized.slug)
    const createdAt = asString(row.created_at) ?? normalized.updatedAt ?? null
    collected.push({
      report: normalized,
      sortKey: createdAt ? Date.parse(createdAt) : 0
    })
  }

  for (const row of rows) pushRow(row)

  // Secondary path: catch rows where the type is stored under `template` or
  // `template_type` (legacy / mixed schema). One additional read, deduped by
  // slug so it never doubles rows that came back from the primary filter.
  const { data: fallbackData, error: fallbackError } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .or(
      [
        `template.in.(${cleanedTypes.join(',')})`,
        `template_type.in.(${cleanedTypes.join(',')})`
      ].join(',')
    )
    .order('created_at', { ascending: false })

  if (fallbackError) {
    // Non-fatal: the legacy columns may not exist on every deployment.
    console.warn(
      'Supabase Fetch Warning (marketing_showcase fallback template columns):',
      fallbackError.message
    )
  } else if (Array.isArray(fallbackData)) {
    for (const row of fallbackData as MarketingShowcaseRow[]) {
      pushRow(row)
    }
  }

  collected.sort((a, b) => b.sortKey - a.sortKey)
  return collected.map((entry) => entry.report)
}
