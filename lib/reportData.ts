import { supabase } from '@/lib/supabase'

export type VerdictType = 'BUILD' | 'PIVOT' | 'KILL'

export interface ReportPattern {
  pattern?: string
  evidence_count?: number
  implication?: string
}

export interface LogicAudit {
  patterns?: ReportPattern[]
  brutal_rejections?: string[]
  false_positives_detected?: number
  adjusted_score?: number
  calculated_verdict?: VerdictType
  verdict_reasoning?: string
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

function safeParseJSON<T>(data: unknown): T | null {
  if (data == null) return null
  if (typeof data === 'object') return data as T
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  }
  return null
}

// 🔥 SET THIS TO YOUR ACTUAL TABLE NAME
const TABLE_NAME = 'verdict_reports'; 

export async function getReportBySlug(slug: string): Promise<ValidationReport | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('🔍 Fetch Error (slug):', error.message)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    slug: data.slug,
    idea_title: data.idea_title ?? '',
    final_verdict: (data.final_verdict?.toUpperCase() as VerdictType) ?? 'PIVOT',
    overall_integrity_score: Number(data.overall_integrity_score) ?? 0,
    forensic_narrative: data.forensic_narrative ?? null,
    experiment_data: safeParseJSON<ExperimentData>(data.experiment_data),
    created_at: data.created_at
  }
}

export async function getReportsList(limit = 50): Promise<ValidationReport[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('slug, idea_title, final_verdict, overall_integrity_score, created_at, forensic_narrative, experiment_data')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('🔍 Fetch Error (list):', error.message)
    return []
  }

  if (!data || !Array.isArray(data)) return []

  // Ensure ALL properties of ValidationReport are satisfied
  return data.map((row) => ({
    slug: row.slug,
    idea_title: row.idea_title ?? 'Untitled Idea',
    final_verdict: (row.final_verdict?.toUpperCase() as VerdictType) ?? 'PIVOT',
    overall_integrity_score: Number(row.overall_integrity_score) ?? 0,
    forensic_narrative: row.forensic_narrative ?? null,
    experiment_data: safeParseJSON<ExperimentData>(row.experiment_data),
    created_at: row.created_at
  }))
}