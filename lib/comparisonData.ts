import { supabase } from '@/lib/supabase'

const TABLE_NAME = 'comparison_vault'

export type FatalFlawSeverity = 'critical' | 'high' | 'medium' | 'low'

export type ComparisonTier = 'indie' | 'enterprise' | 'local' | 'other'

export type FatalFlaw = {
  title: string
  reason?: string
  description?: string
  severity?: FatalFlawSeverity
  evidence?: string
  source?: string
  citation?: string
}

export type FeatureMatrixCellValue = string | boolean | number | null

export type FeatureMatrixRow = {
  feature: string
  competitor: FeatureMatrixCellValue
  product: FeatureMatrixCellValue
  gap?: string
  note?: string
  competitor_note?: string
  product_note?: string
  category?: string
}

export type FeatureMatrix = {
  competitorLabel: string
  productLabel: string
  rows: FeatureMatrixRow[]
}

export type Faq = {
  question: string
  answer: string
}

export type ComparisonReport = {
  id?: string
  slug: string

  competitorName: string
  productName: string

  tier: ComparisonTier
  tierRaw: string | null

  metaTitle: string
  metaDescription: string

  aeoSnippet: string | null

  verdict: string
  verdictSummary: string
  oneLineVerdict: string | null

  fatalFlaws: FatalFlaw[]
  featureMatrix: FeatureMatrix
  faqs: Faq[]

  sources: string[]
  categories: string[]
  pricingSummary: string | null
  pricingGap: string | null

  competitorScreenshot: string | null
  valifyeScreenshot: string | null

  rawData: Record<string, unknown>

  createdAt?: string
  updatedAt?: string
}

type ComparisonRow = Record<string, unknown>

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

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    )
  }
  return []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeTier(value: unknown): ComparisonTier {
  if (typeof value !== 'string') return 'other'
  const raw = value.trim().toLowerCase()
  if (raw.length === 0) return 'other'

  if (raw.includes('enterprise') || raw.includes('large')) return 'enterprise'
  if (
    raw.includes('local') ||
    raw.includes('brick') ||
    raw.includes('mortar') ||
    raw.includes('physical')
  ) {
    return 'local'
  }
  if (
    raw.includes('indie') ||
    raw.includes('solo') ||
    raw.includes('startup') ||
    raw.includes('founder') ||
    raw.includes('saas')
  ) {
    return 'indie'
  }
  return 'other'
}

function coerceFatalFlawSeverity(value: unknown): FatalFlawSeverity | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim().toLowerCase()
  if (v === 'critical' || v === 'high' || v === 'medium' || v === 'low') {
    return v
  }
  return undefined
}

function normalizeFatalFlaws(value: unknown): FatalFlaw[] {
  const raw = safeParseJSON<unknown>(value)
  if (!Array.isArray(raw)) return []

  const flaws: FatalFlaw[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) continue
    const title =
      asString(entry.title) ??
      asString(entry.name) ??
      asString(entry.flaw) ??
      asString(entry.headline)
    if (!title) continue

    const description =
      asString(entry.description) ??
      asString(entry.summary) ??
      asString(entry.detail) ??
      undefined
    const reason =
      asString(entry.reason) ??
      asString(entry.rationale) ??
      asString(entry.explanation) ??
      description

    flaws.push({
      title,
      reason,
      description,
      severity: coerceFatalFlawSeverity(entry.severity),
      evidence:
        asString(entry.evidence) ??
        asString(entry.hard_evidence) ??
        undefined,
      source: asString(entry.source) ?? undefined,
      citation: asString(entry.citation) ?? undefined
    })
  }
  return flaws
}

function coerceCell(value: unknown): FeatureMatrixCellValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean' || typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

function normalizeFeatureMatrix(
  value: unknown,
  competitorLabel: string,
  productLabel: string
): FeatureMatrix {
  const raw = safeParseJSON<unknown>(value)

  const fallback: FeatureMatrix = {
    competitorLabel,
    productLabel,
    rows: []
  }

  const buildRow = (entry: Record<string, unknown>): FeatureMatrixRow | null => {
    const feature =
      asString(entry.feature) ??
      asString(entry.name) ??
      asString(entry.label) ??
      asString(entry.title)
    if (!feature) return null

    return {
      feature,
      competitor: coerceCell(
        entry.competitor ??
          entry.them ??
          entry.competitor_value ??
          entry.competitor_has ??
          entry.left
      ),
      product: coerceCell(
        entry.product ??
          entry.us ??
          entry.product_value ??
          entry.product_has ??
          entry.right
      ),
      gap:
        asString(entry.gap) ??
        asString(entry.difference) ??
        asString(entry.note) ??
        asString(entry.description) ??
        undefined,
      note: asString(entry.note) ?? asString(entry.description) ?? undefined,
      competitor_note: asString(entry.competitor_note) ?? undefined,
      product_note: asString(entry.product_note) ?? undefined,
      category: asString(entry.category) ?? undefined
    }
  }

  if (Array.isArray(raw)) {
    return {
      ...fallback,
      rows: raw
        .filter(isRecord)
        .map(buildRow)
        .filter((row): row is FeatureMatrixRow => row !== null)
    }
  }

  if (isRecord(raw)) {
    const rowsSource = Array.isArray(raw.rows)
      ? raw.rows
      : Array.isArray(raw.features)
      ? raw.features
      : Array.isArray(raw.matrix)
      ? raw.matrix
      : []

    return {
      competitorLabel:
        asString(raw.competitorLabel) ??
        asString(raw.competitor_label) ??
        asString(raw.competitor) ??
        competitorLabel,
      productLabel:
        asString(raw.productLabel) ??
        asString(raw.product_label) ??
        asString(raw.product) ??
        productLabel,
      rows: rowsSource
        .filter(isRecord)
        .map(buildRow)
        .filter((row): row is FeatureMatrixRow => row !== null)
    }
  }

  return fallback
}

function normalizeFaqs(value: unknown): Faq[] {
  const raw = safeParseJSON<unknown>(value)
  if (!Array.isArray(raw)) return []

  const faqs: Faq[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) continue
    const question =
      asString(entry.question) ??
      asString(entry.q) ??
      asString(entry.prompt) ??
      asString(entry.title)
    const answer =
      asString(entry.answer) ??
      asString(entry.a) ??
      asString(entry.response) ??
      asString(entry.body)

    if (!question || !answer) continue
    faqs.push({ question, answer })
  }
  return faqs
}

export function normalizeComparisonRow(row: ComparisonRow): ComparisonReport {
  const slug = asString(row.slug) ?? ''

  const competitorName =
    asString(row.competitor_name) ??
    asString(row.competitor) ??
    asString(row.target_competitor) ??
    'Competitor'

  const productName =
    asString(row.product_name) ??
    asString(row.product) ??
    asString(row.our_product) ??
    'Valifye'

  const tierRaw =
    asString(row.tier) ??
    asString(row.audience_tier) ??
    asString(row.segment) ??
    asString(row.competitor_tier) ??
    null
  const tier = normalizeTier(tierRaw)

  const metaTitle =
    asString(row.meta_title) ??
    asString(row.title) ??
    `${productName} vs ${competitorName}`

  const metaDescription =
    asString(row.meta_description) ??
    asString(row.description) ??
    asString(row.summary) ??
    `${productName} vs ${competitorName}: forensic comparison.`

  const verdict =
    asString(row.verdict) ??
    asString(row.final_verdict) ??
    asString(row.forensic_verdict) ??
    'Forensic comparison complete. Review the feature matrix and fatal flaws before deciding.'

  const verdictSummary =
    asString(row.verdict_summary) ?? asString(row.summary_verdict) ?? verdict

  const aeoSnippet =
    asString(row.aeo_snippet) ??
    asString(row.snippet) ??
    asString(row.tldr) ??
    null

  const oneLineVerdict =
    asString(row.one_line_verdict) ?? asString(row.headline_verdict) ?? null

  const fatalFlaws = normalizeFatalFlaws(row.fatal_flaws)
  const featureMatrix = normalizeFeatureMatrix(
    row.feature_matrix,
    competitorName,
    productName
  )
  const faqs = normalizeFaqs(row.faqs)

  const sources = asStringArray(safeParseJSON<unknown>(row.sources))
  const categories = asStringArray(safeParseJSON<unknown>(row.categories))
  const pricingSummary =
    asString(row.pricing_summary) ?? asString(row.pricing) ?? null
  const pricingGap =
    asString(row.pricing_gap) ??
    asString(row.price_gap) ??
    asString(row.pricing_delta) ??
    null

  const competitorScreenshot =
    asString(row.competitor_screenshot_url) ??
    asString(row.competitor_screenshot) ??
    asString(row.competitor_image_url) ??
    null
  const valifyeScreenshot =
    asString(row.valifye_screenshot_url) ??
    asString(row.valifye_screenshot) ??
    asString(row.product_screenshot_url) ??
    null

  const rawData = isRecord(safeParseJSON<unknown>(row.report_data))
    ? (safeParseJSON<Record<string, unknown>>(row.report_data) as Record<string, unknown>)
    : {}

  return {
    id: asString(row.id) ?? undefined,
    slug,

    competitorName,
    productName,

    tier,
    tierRaw,

    metaTitle,
    metaDescription,

    aeoSnippet,

    verdict,
    verdictSummary,
    oneLineVerdict,

    fatalFlaws,
    featureMatrix,
    faqs,

    sources,
    categories,
    pricingSummary,
    pricingGap,

    competitorScreenshot,
    valifyeScreenshot,

    rawData,

    createdAt: asString(row.created_at) ?? undefined,
    updatedAt: asString(row.updated_at) ?? asString(row.published_at) ?? undefined
  }
}

/**
 * Fetch a single comparison_vault row by slug and return a strongly-typed
 * ComparisonReport with JSONB columns (`fatal_flaws`, `feature_matrix`, `faqs`)
 * parsed and normalized. Returns `null` when the row does not exist or the
 * Supabase fetch fails.
 */
export async function getComparisonBySlug(
  slug: string
): Promise<ComparisonReport | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .maybeSingle<ComparisonRow>()

  if (error) {
    console.error(
      '[comparison_vault] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return normalizeComparisonRow(data)
}

/**
 * Fetch every row in `comparison_vault` (optionally capped) ordered by
 * `created_at` descending, normalized into strongly-typed `ComparisonReport`
 * objects.
 *
 * Returns an empty array on any error or empty table. Emits a server-side
 * diagnostic when the query succeeds but returns zero rows so RLS / publish
 * issues surface in logs instead of silently producing an empty hub.
 */
export async function getComparisonList(
  limit?: number
): Promise<ComparisonReport[]> {
  const query = supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false })

  const finalQuery =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? query.limit(Math.floor(limit))
      : query

  const { data, error } = await finalQuery

  if (error) {
    console.error(
      '[comparison_vault] List fetch failed:',
      error.message,
      error.details ?? '',
      error.hint ?? ''
    )
    return []
  }

  const rows = Array.isArray(data) ? (data as ComparisonRow[]) : []

  if (rows.length === 0) {
    console.warn(
      '[comparison_vault] List query returned 0 rows. If rows exist in the ' +
        'Supabase dashboard but this list is empty, check Row Level Security ' +
        'on `public.comparison_vault` — the anon role needs a SELECT policy.'
    )
    return []
  }

  const reports: ComparisonReport[] = []
  const seenSlugs = new Set<string>()
  for (const row of rows) {
    const normalized = normalizeComparisonRow(row)
    if (!normalized.slug || seenSlugs.has(normalized.slug)) continue
    seenSlugs.add(normalized.slug)
    reports.push(normalized)
  }

  return reports
}
