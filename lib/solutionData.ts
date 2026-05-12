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

export type SolutionEvidenceImages = {
  competitorUrl: string | null
  valifyeUrl: string | null
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

function normalizeEvidenceImages(value: unknown): SolutionEvidenceImages {
  const raw = safeParseJSON<unknown>(value)
  const obj = isRecord(raw) ? raw : {}

  const competitorUrl =
    asString(obj.competitor_url) ??
    asString(obj.competitorUrl) ??
    asString(obj.competitor) ??
    null
  const valifyeUrl =
    asString(obj.valifye_url) ??
    asString(obj.valifyeUrl) ??
    asString(obj.product_url) ??
    null

  return { competitorUrl, valifyeUrl }
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
      row.evidence_images ?? row.evidenceImages
    ),
    ctaText,
    primaryReportType: normalizePrimaryReportType(
      row.primary_report_type ?? row.primaryReportType
    ),
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
