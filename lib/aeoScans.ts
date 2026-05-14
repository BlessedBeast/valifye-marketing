import { supabase } from '@/lib/supabase'

import { parseAeoScanPayload } from '@/lib/bpkReportParse'

export type AeoScanListRow = {
  slug: string
  target_url: string | null
  category: string | null
  created_at: string
  verdict_status: string | null
}

function asTrimmedString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function normalizeListRow(raw: Record<string, unknown>): AeoScanListRow | null {
  const slug = asTrimmedString(raw.slug)
  if (!slug) return null

  const urlRaw = raw.target_url ?? raw.targetUrl ?? raw.url ?? raw.scan_url ?? raw.scanUrl
  const target_url =
    typeof urlRaw === 'string' && urlRaw.trim().length > 0 ? urlRaw.trim() : null

  const catRaw = raw.category ?? raw.scan_category ?? raw.scanCategory
  const category =
    typeof catRaw === 'string' && catRaw.trim().length > 0 ? catRaw.trim() : null

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

  const parsed = parseAeoScanPayload(full_report ?? {})
  const verdict_status =
    parsed.aeo_verdict !== 'PENDING' ? parsed.aeo_verdict : null

  return { slug, target_url, category, created_at: created, verdict_status }
}

/**
 * Latest AEO shadow scans from `aeo_scans` (newest first).
 */
export async function getRecentAeoScans(limit = 50): Promise<AeoScanListRow[]> {
  const { data, error } = await supabase
    .from('aeo_scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[aeo_scans] list fetch:', error.message)
    return []
  }

  const rows = Array.isArray(data) ? data : []
  const out: AeoScanListRow[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const n = normalizeListRow(row as Record<string, unknown>)
    if (n) out.push(n)
  }
  return out
}

export type AeoScanDetail = {
  slug: string
  target_url: string | null
  category: string | null
  created_at: string
  full_report: unknown
}

function normalizeDetail(raw: Record<string, unknown>): AeoScanDetail | null {
  const slug = asTrimmedString(raw.slug)
  if (!slug) return null

  const urlRaw = raw.target_url ?? raw.targetUrl ?? raw.url ?? raw.scan_url ?? raw.scanUrl
  const target_url =
    typeof urlRaw === 'string' && urlRaw.trim().length > 0 ? urlRaw.trim() : null

  const catRaw = raw.category ?? raw.scan_category ?? raw.scanCategory
  const category =
    typeof catRaw === 'string' && catRaw.trim().length > 0 ? catRaw.trim() : null

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

  return { slug, target_url, category, created_at: created, full_report }
}

export async function getAeoScanBySlug(
  rawSlug: string
): Promise<AeoScanDetail | null> {
  const slug = decodeURIComponent(rawSlug).trim()
  if (!slug) return null

  const { data, error } = await supabase
    .from('aeo_scans')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[aeo_scans] by slug:', error.message)
    return null
  }

  if (!data || typeof data !== 'object') return null
  return normalizeDetail(data as Record<string, unknown>)
}
