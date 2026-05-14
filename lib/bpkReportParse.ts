/** Shared parser for `bpk-analyst` / `bpk_audits.full_report` JSON (strict schema). */

export type Verdict = 'BUILD' | 'PIVOT' | 'KILL'

export type BpkScoreKey =
  | 'market_need'
  | 'differentiation'
  | 'feasibility'
  | 'ease_of_distribution'
  | 'speed_to_first_revenue'

export const SCORE_SCHEMA: { key: BpkScoreKey; label: string }[] = [
  { key: 'market_need', label: 'Market need' },
  { key: 'differentiation', label: 'Differentiation' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'ease_of_distribution', label: 'Ease of distribution' },
  { key: 'speed_to_first_revenue', label: 'Speed to first revenue' }
]

export function toCamelCase(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

export type BpkVerdictDisplay = Verdict | 'PENDING'

export type BpkAnalystPayload = {
  edgeError: string | null
  verdict: BpkVerdictDisplay
  scores: Record<BpkScoreKey, number>
  demand_problem: string
  market_competitors: string
  key_assumptions: string
  fatal_risks: string
  monetization_reality: string
  verdict_reasoning: string
  if_this_works: string
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return ''
}

export function parseVerdict(raw: unknown): Verdict | null {
  const s = asString(raw).toUpperCase().replace(/\s+/g, '_')
  if (s.includes('BUILD')) return 'BUILD'
  if (s.includes('PIVOT')) return 'PIVOT'
  if (s.includes('KILL')) return 'KILL'
  if (s === 'B' || s === 'P' || s === 'K') {
    const map = { B: 'BUILD', P: 'PIVOT', K: 'KILL' } as const
    return map[s as 'B' | 'P' | 'K'] ?? null
  }
  return null
}

function pickScore(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'number' && Number.isFinite(v)) {
      return Math.min(10, Math.max(0, v))
    }
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/[^\d.-]/g, ''))
      if (!Number.isNaN(n)) return Math.min(10, Math.max(0, n))
    }
  }
  return null
}

export function unwrapFunctionBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    const t = body.trim()
    if (!t) return {}
    try {
      return unwrapFunctionBody(JSON.parse(t) as unknown)
    } catch {
      return {}
    }
  }
  if (!isRecord(body)) return {}
  const nested = body.data ?? body.result ?? body.payload ?? body.body
  if (isRecord(nested)) return nested
  return body
}

export function coerceToTextArray(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') {
    const t = value.trim()
    return t ? [t] : []
  }
  if (typeof value === 'number' && Number.isFinite(value)) return [String(value)]
  if (typeof value === 'boolean') return [value ? 'true' : 'false']
  if (Array.isArray(value)) {
    const out: string[] = []
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        out.push(item.trim())
        continue
      }
      if (typeof item === 'number' && Number.isFinite(item)) {
        out.push(String(item))
        continue
      }
      if (isRecord(item)) {
        const line = [
          asString(item.title),
          asString(item.headline),
          asString(item.name),
          asString(item.risk),
          asString(item.finding),
          asString(item.body),
          asString(item.description),
          asString(item.text),
          asString(item.summary)
        ]
          .filter(Boolean)
          .join(' — ')
        if (line) out.push(line)
        else {
          try {
            out.push(JSON.stringify(item))
          } catch {
            /* ignore */
          }
        }
        continue
      }
      if (item != null && typeof item !== 'object') out.push(String(item))
    }
    return out
  }
  if (isRecord(value)) {
    const line = [
      asString(value.text),
      asString(value.body),
      asString(value.summary),
      asString(value.content),
      asString(value.message)
    ]
      .filter(Boolean)
      .join('\n\n')
    if (line) return [line]
    try {
      return [JSON.stringify(value, null, 2)]
    } catch {
      return []
    }
  }
  return []
}

function fieldToDossierString(value: unknown): string {
  return coerceToTextArray(value).join('\n\n')
}

function formatNumberedList(lines: string[]): string {
  if (lines.length === 0) return ''
  return lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
}

function strictStringField(bag: Record<string, unknown>, snake: string): string {
  const camel = toCamelCase(snake)
  const raw = bag[snake] ?? bag[camel]
  const direct = asString(raw)
  if (direct) return direct
  return fieldToDossierString(raw)
}

function asEdgeErrorString(value: unknown): string | null {
  if (value == null || value === false) return null
  if (typeof value === 'string') {
    const t = value.trim()
    return t.length > 0 ? t : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (isRecord(value)) {
    const m =
      asString(value.message) ??
      asString(value.error) ??
      asString(value.detail) ??
      asString(value.description)
    if (m) return m
    try {
      return JSON.stringify(value)
    } catch {
      return 'Unspecified error'
    }
  }
  return null
}

export function normalizeScores(raw: unknown): Record<BpkScoreKey, number> {
  const zero: Record<BpkScoreKey, number> = {
    market_need: 0,
    differentiation: 0,
    feasibility: 0,
    ease_of_distribution: 0,
    speed_to_first_revenue: 0
  }
  if (!isRecord(raw)) return { ...zero }
  const out = { ...zero }
  for (const k of Object.keys(zero) as BpkScoreKey[]) {
    out[k] = pickScore(raw, [k, toCamelCase(k)]) ?? 0
  }
  return out
}

/** Parse edge-function or stored `full_report` JSON into a UI payload. */
export function parseBpkFullReport(raw: unknown): BpkAnalystPayload {
  const root = unwrapFunctionBody(raw)
  const bag: Record<string, unknown> = isRecord(root) ? root : {}

  const edgeError = asEdgeErrorString(bag.error)

  const verdictRaw = bag.verdict_status ?? bag.verdictStatus
  const verdict: BpkVerdictDisplay = parseVerdict(verdictRaw) ?? 'PENDING'

  const scores = normalizeScores(bag.scores)

  const demand_problem = strictStringField(bag, 'demand_problem')
  const market_competitors = strictStringField(bag, 'market_competitors')
  const key_assumptions = formatNumberedList(
    coerceToTextArray(bag.key_assumptions)
  )
  const fatal_risks = formatNumberedList(coerceToTextArray(bag.fatal_risks))
  const monetization_reality = strictStringField(bag, 'monetization_reality')
  const verdict_reasoning = strictStringField(bag, 'verdict_reasoning')
  const if_this_works = strictStringField(bag, 'if_this_works')

  return {
    edgeError,
    verdict,
    scores,
    demand_problem,
    market_competitors,
    key_assumptions,
    fatal_risks,
    monetization_reality,
    verdict_reasoning,
    if_this_works
  }
}
