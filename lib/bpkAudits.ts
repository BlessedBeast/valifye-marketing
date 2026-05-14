import { supabase } from '@/lib/supabase'

export type BpkAuditListRow = {
  slug: string
  idea_input: string | null
  verdict_status: string | null
  created_at: string
}

function asTrimmedString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function normalizeRow(raw: Record<string, unknown>): BpkAuditListRow | null {
  const slug = asTrimmedString(raw.slug)
  if (!slug) return null

  const rawIdea = raw.idea_input
  const idea_input =
    typeof rawIdea === 'string' && rawIdea.trim().length > 0
      ? rawIdea.trim()
      : null
  const verdictRaw = raw.verdict_status ?? raw.verdictStatus
  const verdict_status =
    typeof verdictRaw === 'string' && verdictRaw.trim()
      ? verdictRaw.trim()
      : null

  const created =
    raw.created_at != null
      ? String(raw.created_at)
      : raw.createdAt != null
        ? String(raw.createdAt)
        : ''

  return {
    slug,
    idea_input,
    verdict_status,
    created_at: created
  }
}

/**
 * Latest forensic audits from `bpk_audits` (newest first).
 */
export async function getRecentBpkAudits(
  limit = 50
): Promise<BpkAuditListRow[]> {
  const { data, error } = await supabase
    .from('bpk_audits')
    .select('slug, idea_input, verdict_status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[bpk_audits] list fetch:', error.message)
    return []
  }

  const rows = Array.isArray(data) ? data : []
  const out: BpkAuditListRow[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const n = normalizeRow(row as Record<string, unknown>)
    if (n) out.push(n)
  }
  return out
}

export type BpkAuditDetail = {
  slug: string
  idea_input: string | null
  target_audience: string | null
  created_at: string
  full_report: unknown
}

function normalizeDetail(raw: Record<string, unknown>): BpkAuditDetail | null {
  const slug = asTrimmedString(raw.slug)
  if (!slug) return null

  const rawIdea = raw.idea_input
  const idea_input =
    typeof rawIdea === 'string' && rawIdea.trim().length > 0
      ? rawIdea.trim()
      : null

  const rawAud = raw.target_audience ?? raw.targetAudience
  const target_audience =
    typeof rawAud === 'string' && rawAud.trim().length > 0
      ? rawAud.trim()
      : null

  const created =
    raw.created_at != null
      ? String(raw.created_at)
      : raw.createdAt != null
        ? String(raw.createdAt)
        : ''

  let full_report: unknown = raw.full_report ?? raw.fullReport ?? null
  if (typeof full_report === 'string') {
    const t = full_report.trim()
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        full_report = JSON.parse(t) as unknown
      } catch {
        full_report = {}
      }
    }
  }

  return { slug, idea_input, target_audience, created_at: created, full_report }
}

/**
 * Single published audit for blueprint pSEO pages.
 */
export async function getBpkAuditBySlug(
  rawSlug: string
): Promise<BpkAuditDetail | null> {
  const slug = decodeURIComponent(rawSlug).trim()
  if (!slug) return null

  const { data, error } = await supabase
    .from('bpk_audits')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[bpk_audits] by slug:', error.message)
    return null
  }

  if (!data || typeof data !== 'object') return null
  return normalizeDetail(data as Record<string, unknown>)
}
