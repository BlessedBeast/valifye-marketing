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

/** Coerce DB / CMS shapes into a list of row objects for `normalizeReportScreenshots`. */
function unwrapReportScreenshotList(value: unknown): unknown[] {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    const parsed = safeParseJSON<unknown>(trimmed)
    if (Array.isArray(parsed)) return parsed
    return []
  }
  if (isRecord(value)) {
    const inner =
      value.items ??
      value.shots ??
      value.slides ??
      value.captures ??
      value.data
    if (Array.isArray(inner)) return inner
    if (typeof inner === 'string') return unwrapReportScreenshotList(inner)
  }
  return []
}

const REPORT_SCREENSHOT_KEYS = [
  'report_screenshots',
  'reportScreenshots',
  'report_screenshot',
  'deliverable_gallery',
  'deliverableGallery',
  'report_captures',
  'reportCaptures',
  'slides',
  'gallery'
] as const

const EVIDENCE_NESTED_ROOT_KEYS = [
  'evidence',
  'evidence_images',
  'evidenceImages',
  'cms',
  'data',
  'payload',
  'content',
  'attributes'
] as const

type EvidenceShape =
  | { kind: 'rows'; roots: Record<string, unknown>[] }
  | { kind: 'array'; items: unknown[] }

/**
 * Classify `evidence_images` JSON: object (possibly with nested CMS wrappers) or
 * a legacy top-level array of slides.
 */
function classifyEvidencePayload(value: unknown): EvidenceShape {
  const parsed = safeParseJSON<unknown>(value)
  const primary = parsed ?? value

  if (Array.isArray(primary)) {
    return { kind: 'array', items: primary }
  }
  if (!isRecord(primary)) {
    return { kind: 'rows', roots: [{}] }
  }

  const roots: Record<string, unknown>[] = [primary]
  const seen = new Set<unknown>([primary])
  for (const key of EVIDENCE_NESTED_ROOT_KEYS) {
    const child = primary[key]
    if (!isRecord(child) || seen.has(child)) continue
    seen.add(child)
    roots.push(child)
  }
  return { kind: 'rows', roots }
}

/** First non-empty normalized gallery found across roots and common key names. */
function pickReportScreenshotsFromRoots(
  roots: Record<string, unknown>[]
): SolutionReportScreenshot[] {
  for (const root of roots) {
    for (const key of REPORT_SCREENSHOT_KEYS) {
      if (!(key in root)) continue
      const normalized = normalizeReportScreenshots(root[key])
      if (normalized.length > 0) return normalized
    }
  }
  return []
}

function normalizeReportScreenshots(value: unknown): SolutionReportScreenshot[] {
  const list = unwrapReportScreenshotList(value)
  const out: SolutionReportScreenshot[] = []
  let i = 0
  for (const entry of list) {
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
    const rawPathCandidate =
      entry.path ?? entry.src ?? entry.url ?? entry.image ?? entry.primary_visual ?? entry.file
    const rawPath =
      typeof rawPathCandidate === 'number' && Number.isFinite(rawPathCandidate)
        ? String(rawPathCandidate)
        : asString(rawPathCandidate) ?? ''
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

const PATH_B_URL_KEYS = [
  'path_b_outcome_url',
  'pathBOutcomeUrl',
  'path_b_outcome_image',
  'pathBOutcomeImage',
  'path_b_image',
  'pathBImage'
] as const

const PATH_B_NESTED_OBJECT_KEYS = [
  'deliverables',
  'outcome',
  'outcomes',
  'pivot',
  'dynamic_outcome',
  'dynamicOutcome',
  'two_paths',
  'twoPaths',
  'path_b',
  'pathB'
] as const

function readPathBUrlFromRecord(root: Record<string, unknown>): string | null {
  for (const key of PATH_B_URL_KEYS) {
    const hit = asString(root[key])
    if (hit) return hit
  }
  for (const nestKey of PATH_B_NESTED_OBJECT_KEYS) {
    const child = root[nestKey]
    if (!isRecord(child)) continue
    for (const key of PATH_B_URL_KEYS) {
      const hit = asString(child[key])
      if (hit) return hit
    }
    const deep = asString(child.url) ?? asString(child.src) ?? asString(child.image)
    if (deep) return deep
  }
  return null
}

function pathBOutcomeUrlFromEvidencePayload(value: unknown): string | null {
  const shape = classifyEvidencePayload(value)
  if (shape.kind === 'array') {
    return null
  }
  for (const root of shape.roots) {
    const hit = readPathBUrlFromRecord(root)
    if (hit) return hit
  }
  return null
}

function pickCompetitorUrlFromRoots(
  roots: Record<string, unknown>[]
): string | null {
  for (const obj of roots) {
    const block = isRecord(obj.screenshots) ? obj.screenshots : null
    const hit =
      asString(obj.competitor_url) ??
      asString(obj.competitorUrl) ??
      asString(obj.competitor_screenshot_url) ??
      asString(obj.competitorScreenshotUrl) ??
      asString(obj.incumbent_url) ??
      (block ? asString(block.competitor) ?? asString(block.left) : null) ??
      null
    if (hit) return hit
  }
  return null
}

function pickValifyeUrlFromRoots(
  roots: Record<string, unknown>[]
): string | null {
  for (const obj of roots) {
    const block = isRecord(obj.screenshots) ? obj.screenshots : null
    const hit =
      asString(obj.valifye_url) ??
      asString(obj.valifyeUrl) ??
      asString(obj.valifye_screenshot_url) ??
      asString(obj.valifyeScreenshotUrl) ??
      asString(obj.product_screenshot_url) ??
      asString(obj.product_url) ??
      (block ? asString(block.valifye) ?? asString(block.right) : null) ??
      null
    if (hit) return hit
  }
  return null
}

function readScalarFieldsFromRoots(
  roots: Record<string, unknown>[]
): Record<string, unknown> {
  for (const root of roots) {
    if (Object.keys(root).length > 0) return root
  }
  return {}
}

function normalizeEvidenceImages(
  value: unknown,
  reportScreenshotsColumn?: unknown
): SolutionEvidenceImages {
  const shape = classifyEvidencePayload(value)
  const columnShots = normalizeReportScreenshots(reportScreenshotsColumn)

  if (shape.kind === 'array') {
    const fromArray = normalizeReportScreenshots(shape.items)
    const reportScreenshots =
      columnShots.length > 0 ? columnShots : fromArray
    return {
      competitorUrl: null,
      valifyeUrl: null,
      proofPillars: [],
      featureModules: [],
      faqSchema: [],
      seoBody: [],
      reportScreenshots,
      schemaJson: null
    }
  }

  const roots = shape.roots
  const obj = readScalarFieldsFromRoots(roots)

  const competitorUrl = pickCompetitorUrlFromRoots(roots)

  const valifyeUrl = pickValifyeUrlFromRoots(roots)

  const proofPillars = mergeNormalizeAcrossRoots(roots, (r) =>
    normalizeProofPillars(r.proof_pillars ?? r.proofPillars)
  )
  const featureModules = mergeNormalizeAcrossRoots(roots, (r) =>
    normalizeFeatureModules(r.feature_modules ?? r.featureModules)
  )
  const faqSchema = mergeNormalizeAcrossRoots(roots, (r) =>
    normalizeFaqSchema(r.faq_schema ?? r.faqSchema)
  )
  const seoBody = mergeNormalizeAcrossRoots(roots, (r) =>
    normalizeSeoBody(r.seo_body ?? r.seoBody)
  )

  const embeddedShots = pickReportScreenshotsFromRoots(roots)
  const reportScreenshots =
    columnShots.length > 0 ? columnShots : embeddedShots

  const schemaJson =
    normalizeSchemaJson(obj.schema_json ?? obj.schemaJson ?? obj.jsonLd) ??
    pickFirstSchemaJsonFromRoots(roots)

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

/** Prefer first root that yields a non-empty array; else last normalization (usually []). */
function mergeNormalizeAcrossRoots<T>(
  roots: Record<string, unknown>[],
  normalize: (r: Record<string, unknown>) => T[]
): T[] {
  let last: T[] = []
  for (const root of roots) {
    const n = normalize(root)
    last = n
    if (n.length > 0) return n
  }
  return last
}

function pickFirstSchemaJsonFromRoots(
  roots: Record<string, unknown>[]
): unknown | null {
  for (const root of roots) {
    const j = normalizeSchemaJson(
      root.schema_json ?? root.schemaJson ?? root.jsonLd
    )
    if (j != null) return j
  }
  return null
}

export function normalizeSolutionRow(row: SolutionRow): SolutionPillar | null {
  try {
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
    const reportScreenshotsColumn =
      row.report_screenshots ?? row.reportScreenshots ?? undefined

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
      evidenceImages: normalizeEvidenceImages(
        evidenceRaw,
        reportScreenshotsColumn
      ),
      ctaText,
      primaryReportType: normalizePrimaryReportType(
        row.primary_report_type ?? row.primaryReportType
      ),
      pathBOutcomeUrl,
      createdAt: asString(row.created_at) ?? undefined,
      updatedAt: asString(row.updated_at) ?? undefined
    }
  } catch (error) {
    const slug = asString(row.slug) ?? '(unknown)'
    console.error('Normalization failed for slug:', slug, error)
    return null
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

  console.log('[solution_pillars] getSolutionBySlug', {
    slug: cleanSlug,
    error
  })

  if (error) {
    console.error(
      '[solution_pillars] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return normalizeSolutionRow(data) ?? null
}
