import { supabase } from '@/lib/supabase'

const TABLE_NAME = 'solution_pillars'

export type SolutionHeroVibe = 'amber' | 'rose' | 'emerald'

export type SolutionPrimaryReportType =
  | 'Local Scout'
  | 'Digital Battlefield'
  | 'Pivot'

export type SolutionRiskFactor = {
  title: string
  description: string
}

export type SolutionProofPillar = {
  stat: string
  unit: string
  label: string
  context: string
}

export type SolutionFeatureModule = {
  module: string
  description: string
  outputs: string[]
}

export type SolutionFaqSchemaItem = {
  question: string
  answer: string
}

export type SolutionSeoBodyBlock = {
  h2: string
  copy: string
}

export type SolutionReportScreenshot = {
  id: string
  label: string
  caption: string
  path: string
  placeholder: string | null
}

/**
 * Thick `evidence_images` JSONB: legacy screenshot URLs plus enterprise audit
 * payloads (proof pillars, modules, SEO blocks, FAQs, report captures, JSON-LD).
 */
export type SolutionEvidenceImages = {
  competitorUrl: string | null
  valifyeUrl: string | null
  proofPillars: SolutionProofPillar[]
  featureModules: SolutionFeatureModule[]
  faqSchema: SolutionFaqSchemaItem[]
  seoBody: SolutionSeoBodyBlock[]
  reportScreenshots: SolutionReportScreenshot[]
  /** Raw JSON-LD object/array/string from CMS — injected client-safe via JSON.stringify */
  schemaJson: unknown | null
}

export type SolutionPillar = {
  id?: string
  slug: string
  title: string
  subtitle: string | null
  heroVibe: SolutionHeroVibe
  metaTitle: string
  metaDescription: string
  aeoAnswer: string
  riskFactors: SolutionRiskFactor[]
  evidenceImages: SolutionEvidenceImages
  ctaText: string | null
  primaryReportType: SolutionPrimaryReportType
  /** Pivot-path hero image (e.g. Digital Battlefield); column or nested in `evidence_images`. */
  pathBOutcomeUrl: string | null
  createdAt?: string
  updatedAt?: string
}

type SolutionRow = Record<string, unknown>

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

function asDisplayString(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return asString(value) ?? ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeHeroVibe(value: unknown): SolutionHeroVibe {
  const raw = asString(value)?.toLowerCase() ?? ''
  if (raw === 'rose') return 'rose'
  if (raw === 'emerald') return 'emerald'
  return 'amber'
}

function normalizePrimaryReportType(
  value: unknown
): SolutionPrimaryReportType {
  const raw = asString(value) ?? ''
  if (raw === 'Digital Battlefield' || raw.toLowerCase() === 'digital battlefield')
    return 'Digital Battlefield'
  if (raw === 'Pivot' || raw.toLowerCase() === 'pivot') return 'Pivot'
  if (
    raw === 'Local Scout' ||
    raw.toLowerCase() === 'local scout' ||
    raw.toLowerCase() === 'local_scout'
  ) {
    return 'Local Scout'
  }
  return 'Local Scout'
}

function normalizeRiskFactors(value: unknown): SolutionRiskFactor[] {
  const raw = safeParseJSON<unknown>(value)
  if (!Array.isArray(raw)) return []

  const out: SolutionRiskFactor[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) continue
    const title =
      asString(entry.title) ?? asString(entry.name) ?? asString(entry.headline)
    const description =
      asString(entry.description) ??
      asString(entry.body) ??
      asString(entry.detail) ??
      ''
    if (!title) continue
    out.push({ title, description })
  }
  return out
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    const s = asDisplayString(item)
    if (s.length > 0) out.push(s)
  }
  return out
}

function normalizeProofPillars(value: unknown): SolutionProofPillar[] {
  if (!Array.isArray(value)) return []
  const out: SolutionProofPillar[] = []
  for (const entry of value) {
    if (!isRecord(entry)) continue
    const stat = asDisplayString(entry.stat ?? entry.value ?? entry.figure)
    const label =
      asString(entry.label) ?? asString(entry.title) ?? asString(entry.name) ?? ''
    if (!stat && !label) continue
    out.push({
      stat: stat || '—',
      unit: asString(entry.unit) ?? asString(entry.units) ?? '',
      label: label || 'Signal',
      context:
        asString(entry.context) ??
        asString(entry.subtitle) ??
        asString(entry.note) ??
        ''
    })
  }
  return out
}

function normalizeFeatureModules(value: unknown): SolutionFeatureModule[] {
  if (!Array.isArray(value)) return []
  const out: SolutionFeatureModule[] = []
  for (const entry of value) {
    if (!isRecord(entry)) continue
    const moduleName =
      asString(entry.module) ??
      asString(entry.title) ??
      asString(entry.name) ??
      ''
    const description =
      asString(entry.description) ??
      asString(entry.body) ??
      asString(entry.summary) ??
      ''
    if (!moduleName) continue
    const outputsRaw = entry.outputs ?? entry.deliverables ?? entry.items
    const outputs = Array.isArray(outputsRaw)
      ? readStringArray(outputsRaw)
      : asString(outputsRaw)
      ? [asString(outputsRaw) as string]
      : []
    out.push({ module: moduleName, description, outputs })
  }
  return out
}

function normalizeFaqSchema(value: unknown): SolutionFaqSchemaItem[] {
  if (!Array.isArray(value)) return []
  const out: SolutionFaqSchemaItem[] = []
  for (const entry of value) {
    if (!isRecord(entry)) continue
    const question =
      asString(entry.question) ??
      asString(entry.q) ??
      asString(entry.title) ??
      ''
    const answer =
      asString(entry.answer) ??
      asString(entry.a) ??
      asString(entry.body) ??
      ''
    if (!question || !answer) continue
    out.push({ question, answer })
  }
  return out
}

function normalizeSeoBody(value: unknown): SolutionSeoBodyBlock[] {
  if (!Array.isArray(value)) return []
  const out: SolutionSeoBodyBlock[] = []
  for (const entry of value) {
    if (!isRecord(entry)) continue
    const h2 =
      asString(entry.h2) ??
      asString(entry.heading) ??
      asString(entry.title) ??
      ''
    const copy =
      asString(entry.copy) ??
      asString(entry.body) ??
      asString(entry.text) ??
      ''
    if (!h2 && !copy) continue
    out.push({ h2: h2 || 'Section', copy })
  }
  return out
}

/** Public bucket root for deliverable captures referenced as bare filenames (e.g. `cpc.png`). */
const COMPARISON_SCREENSHOT_PUBLIC_BASE =
  'https://ivjcwulrmxqexytudhtu.supabase.co/storage/v1/object/public/comparison%20screenshot/'

function resolveReportScreenshotPublicPath(path: string): string {
  const raw = path.trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  const segments = raw.split('/').filter(Boolean)
  if (segments.length === 0) return raw
  const encodedPath = segments.map((s) => encodeURIComponent(s)).join('/')
  return `${COMPARISON_SCREENSHOT_PUBLIC_BASE}${encodedPath}`
}

function normalizeReportScreenshots(value: unknown): SolutionReportScreenshot[] {
  if (!Array.isArray(value)) return []
  const out: SolutionReportScreenshot[] = []
  let i = 0
  for (const entry of value) {
    if (!isRecord(entry)) continue
    const id = asString(entry.id) ?? `shot-${i}`
    const label =
      asString(entry.label) ??
      asString(entry.title) ??
      asString(entry.module) ??
      'Capture'
    const caption =
      asString(entry.caption) ??
      asString(entry.description) ??
      asString(entry.body) ??
      asString(entry.summary) ??
      ''
    const rawPath =
      asString(entry.path) ??
      asString(entry.src) ??
      asString(entry.url) ??
      asString(entry.image) ??
      asString(entry.primary_visual) ??
      asString(entry.file) ??
      ''
    const path = rawPath ? resolveReportScreenshotPublicPath(rawPath) : ''
    const placeholder = asString(entry.placeholder) ?? null
    if (!path && !placeholder) continue
    out.push({ id, label, caption, path, placeholder })
    i += 1
  }
  return out
}

function normalizeSchemaJson(value: unknown): unknown | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const parsed = safeParseJSON<unknown>(value)
    return parsed ?? null
  }
  if (typeof value === 'object') return value
  return null
}

function pathBOutcomeUrlFromEvidencePayload(value: unknown): string | null {
  const parsed = safeParseJSON<unknown>(value)
  const obj = isRecord(parsed)
    ? parsed
    : isRecord(value)
      ? (value as Record<string, unknown>)
      : null
  if (!obj) return null
  return (
    asString(obj.path_b_outcome_url) ??
    asString(obj.pathBOutcomeUrl) ??
    null
  )
}

function normalizeEvidenceImages(value: unknown): SolutionEvidenceImages {
  const raw = safeParseJSON<unknown>(value)
  const obj = isRecord(raw) ? raw : {}

  const shots = isRecord(obj.screenshots) ? obj.screenshots : null

  const competitorUrl =
    asString(obj.competitor_url) ??
    asString(obj.competitorUrl) ??
    asString(obj.competitor_screenshot_url) ??
    asString(obj.competitorScreenshotUrl) ??
    asString(obj.incumbent_url) ??
    (shots ? asString(shots.competitor) ?? asString(shots.left) : null) ??
    null

  const valifyeUrl =
    asString(obj.valifye_url) ??
    asString(obj.valifyeUrl) ??
    asString(obj.valifye_screenshot_url) ??
    asString(obj.valifyeScreenshotUrl) ??
    asString(obj.product_screenshot_url) ??
    asString(obj.product_url) ??
    (shots ? asString(shots.valifye) ?? asString(shots.right) : null) ??
    null

  const proofPillars = normalizeProofPillars(
    obj.proof_pillars ?? obj.proofPillars
  )
  const featureModules = normalizeFeatureModules(
    obj.feature_modules ?? obj.featureModules
  )
  const faqSchema = normalizeFaqSchema(obj.faq_schema ?? obj.faqSchema)
  const seoBody = normalizeSeoBody(obj.seo_body ?? obj.seoBody)
  const reportScreenshots = normalizeReportScreenshots(
    obj.report_screenshots ?? obj.reportScreenshots
  )
  const schemaJson = normalizeSchemaJson(
    obj.schema_json ?? obj.schemaJson ?? obj.jsonLd
  )

  return {
    competitorUrl,
    valifyeUrl,
    proofPillars,
    featureModules,
    faqSchema,
    seoBody,
    reportScreenshots,
    schemaJson
  }
}

export function normalizeSolutionRow(row: SolutionRow): SolutionPillar {
  const slug = asString(row.slug) ?? ''

  const title = asString(row.title) ?? 'Solution'
  const subtitle = asString(row.subtitle) ?? null

  const metaTitle =
    asString(row.meta_title) ?? asString(row.metaTitle) ?? `${title} | Valifye`
  const metaDescription =
    asString(row.meta_description) ??
    asString(row.metaDescription) ??
    asString(row.description) ??
    ''

  const aeoAnswer =
    asString(row.aeo_answer) ??
    asString(row.aeoAnswer) ??
    asString(row.direct_answer) ??
    ''

  const ctaText =
    asString(row.cta_text) ?? asString(row.ctaText) ?? null

  const evidenceRaw = row.evidence_images ?? row.evidenceImages
  const rawPathBOutcome =
    asString(row.path_b_outcome_url) ??
    asString(row.pathBOutcomeUrl) ??
    pathBOutcomeUrlFromEvidencePayload(evidenceRaw)
  const pathBResolved = rawPathBOutcome
    ? resolveReportScreenshotPublicPath(rawPathBOutcome)
    : ''
  const pathBOutcomeUrl =
    pathBResolved.trim().length > 0 ? pathBResolved.trim() : null

  return {
    id: asString(row.id) ?? undefined,
    slug,
    title,
    subtitle,
    heroVibe: normalizeHeroVibe(row.hero_vibe ?? row.heroVibe),
    metaTitle,
    metaDescription,
    aeoAnswer,
    riskFactors: normalizeRiskFactors(row.risk_factors ?? row.riskFactors),
    evidenceImages: normalizeEvidenceImages(evidenceRaw),
    ctaText,
    primaryReportType: normalizePrimaryReportType(
      row.primary_report_type ?? row.primaryReportType
    ),
    pathBOutcomeUrl,
    createdAt: asString(row.created_at) ?? undefined,
    updatedAt: asString(row.updated_at) ?? undefined
  }
}

/**
 * Fetch a single `solution_pillars` row by slug and return a strongly-typed
 * `SolutionPillar` with JSONB columns parsed. Returns `null` when missing or
 * on fetch error.
 */
export async function getSolutionBySlug(
  slug: string
): Promise<SolutionPillar | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .maybeSingle<SolutionRow>()

  if (error) {
    console.error(
      '[solution_pillars] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return normalizeSolutionRow(data)
}
