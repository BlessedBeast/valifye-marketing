import { supabase } from '@/lib/supabase'

export type VerdictType = 'BUILD' | 'PIVOT' | 'KILL'

export interface ReportPattern {
  pattern?: string
  evidence_count?: number
  implication?: string
}

export interface UnitEconomics {
  cpa?: number
  ltv?: number
  payback_months?: number
  math_verdict?: string
}

export interface LogicAudit {
  patterns?: ReportPattern[]
  brutal_rejections?: string[]
  false_positives_detected?: number
  adjusted_score?: number
  calculated_verdict?: VerdictType
  verdict_reasoning?: string
  aeo_summary?: string
  unit_economics?: UnitEconomics
  market_entities?: string[]
  thick_case_study?: string
}

export interface ExperimentData {
  raw_notes?: Record<string, string>
  logic_audit?: LogicAudit
  [key: string]: unknown
}

export interface ValidationReport {
  id?: string
  slug: string
  idea_title: string
  final_verdict: VerdictType
  overall_integrity_score: number
  forensic_narrative: string | null
  experiment_data: ExperimentData | null
  created_at?: string
  is_published?: boolean
}

export interface VerdictIndustryHub {
  industry_name: string
  report_count: number
  top_verdicts: { slug: string; title: string; score?: number }[]
  all_slugs?: string[]
  sector_slug?: string
}

export interface VerdictIndustryHubDetail {
  industry_name: string
  report_count: number
  top_verdicts: { slug: string; title: string; score?: number }[]
  all_slugs: string[]
}

/**
 * Robust JSON Unpacking
 * Handles cases where Supabase returns JSONB as a string or a native object.
 */
function safeParseJSON<T>(data: unknown): T | null {
  if (data == null) return null
  if (typeof data === 'object' && !Array.isArray(data)) return data as T
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  }
  return data as T // Return as is if it's already an array or other object
}

/**
 * Sanitizes and normalizes verdicts for UI consistency.
 */
function normalizeVerdict(rawVerdict: string | null | undefined): VerdictType {
  if (!rawVerdict) return 'PIVOT'
  const upper = rawVerdict.toUpperCase()
  if (upper.includes('BUILD')) return 'BUILD'
  if (upper.includes('KILL') || upper.includes('FAILURE') || upper.includes('CATASTROPHIC') || upper.includes('ADVISED AGAINST')) {
    return 'KILL'
  }
  return 'PIVOT'
}

const TABLE_NAME = 'verdict_reports'

/**
 * Fetch a single report by its slug.
 */
export async function getReportBySlug(slug: string): Promise<ValidationReport | null> {
  const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('slug', slug).maybeSingle()
  if (error || !data) return null

  return {
    ...data,
    final_verdict: normalizeVerdict(data.final_verdict),
    overall_integrity_score: Number(data.overall_integrity_score) || 0,
    experiment_data: safeParseJSON<ExperimentData>(data.experiment_data),
  }
}

/**
 * Fetch a list of all published forensic reports.
 */
export async function getReportsList(limit = 50): Promise<ValidationReport[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !Array.isArray(data)) return []

  return data.map((row) => ({
    ...row,
    final_verdict: normalizeVerdict(row.final_verdict),
    overall_integrity_score: Number(row.overall_integrity_score) || 0,
    experiment_data: safeParseJSON<ExperimentData>(row.experiment_data),
  }))
}

/**
 * Fetch all high-level Industry Hubs for the directory view.
 */
export async function getIndustryHubs(): Promise<VerdictIndustryHub[]> {
  const { data, error } = await supabase
    .from('verdict_industry_hubs')
    .select('industry_name, report_count, top_verdicts, sector_slug')
    .order('report_count', { ascending: false })

  if (error || !Array.isArray(data)) {
    console.error('Industry hubs fetch error:', error)
    return []
  }

  return data.map((row) => {
    const rawTop = safeParseJSON<{ slug: string; title: string; score?: number }[]>(row.top_verdicts)
    const top = Array.isArray(rawTop) ? rawTop : []

    return {
      industry_name: row.industry_name ?? 'Unlabeled',
      report_count: Number(row.report_count) || 0,
      top_verdicts: top.filter(
        (v) => v && typeof v.slug === 'string' && typeof v.title === 'string'
      ),
      sector_slug: row.sector_slug ?? undefined,
    }
  })
}

/**
 * Fetch a specific Industry Hub detail by its URL slug.
 * Uses strict match on sector_slug (indexed).
 */
export async function getIndustryHubBySectorSlug(sectorSlug: string): Promise<VerdictIndustryHubDetail | null> {
  const { data, error } = await supabase
    .from('verdict_industry_hubs')
    .select('industry_name, report_count, top_verdicts, all_slugs')
    .eq('sector_slug', sectorSlug)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('Industry hub fetch error:', error)
    return null
  }

  // Handle top_verdicts (JSONB)
  const rawTop = safeParseJSON<{ slug: string; title: string; score?: number }[]>(data.top_verdicts)
  const top = Array.isArray(rawTop) ? rawTop : []

  // Handle all_slugs (text[] Postgres Array)
  let allSlugs: string[] = []
  if (Array.isArray(data.all_slugs)) {
    allSlugs = data.all_slugs
  } else {
    // Fallback if returned as stringified array
    allSlugs = safeParseJSON<string[]>(data.all_slugs) || []
  }

  return {
    industry_name: data.industry_name ?? sectorSlug,
    report_count: Number(data.report_count) || allSlugs.length,
    top_verdicts: top.filter((v) => v && typeof v.slug === 'string'),
    all_slugs: allSlugs.filter((s) => typeof s === 'string'),
  }
}

/**
 * Fetch multiple reports by an array of slugs.
 */
export async function getReportsBySlugs(slugs: string[]): Promise<ValidationReport[]> {
  if (!slugs || slugs.length === 0) return []

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('slug, idea_title, final_verdict, overall_integrity_score, forensic_narrative, experiment_data, is_published, created_at')
    .in('slug', slugs)
    .eq('is_published', true)

  if (error || !Array.isArray(data)) return []

  return data.map((row) => ({
    ...row,
    final_verdict: normalizeVerdict(row.final_verdict),
    overall_integrity_score: Number(row.overall_integrity_score) || 0,
    experiment_data: safeParseJSON<ExperimentData>(row.experiment_data),
  }))
}