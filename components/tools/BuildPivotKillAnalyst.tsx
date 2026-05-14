'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import {
  ShieldAlert,
  Target,
  TrendingUp,
  Terminal,
  Crosshair,
  BarChart3,
  ListChecks,
  Sparkles,
  Scale
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Verdict = 'BUILD' | 'PIVOT' | 'KILL'

/** Matches `scores` object from `bpk-analyst` edge function (snake_case). */
export type BpkScoreKey =
  | 'market_need'
  | 'differentiation'
  | 'feasibility'
  | 'ease_of_distribution'
  | 'speed_to_first_revenue'

const SCORE_SCHEMA: { key: BpkScoreKey; label: string }[] = [
  { key: 'market_need', label: 'Market need' },
  { key: 'differentiation', label: 'Differentiation' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'ease_of_distribution', label: 'Ease of distribution' },
  { key: 'speed_to_first_revenue', label: 'Speed to first revenue' }
]

function toCamelCase(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}

/** Badge: strict verdict or fallback when the payload is incomplete. */
export type BpkVerdictDisplay = Verdict | 'PENDING'

export type BpkAnalystPayload = {
  /** Populated when the edge function returns an `error` field (HTTP 200 + error body). */
  edgeError: string | null
  verdict: BpkVerdictDisplay
  scores: Record<BpkScoreKey, number>
  demand_problem: string
  market_competitors: string
  /** Rendered from `key_assumptions` string[]. */
  key_assumptions: string
  /** Rendered from `fatal_risks` string[]. */
  fatal_risks: string
  monetization_reality: string
  verdict_reasoning: string
  if_this_works: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return ''
}

function parseVerdict(raw: unknown): Verdict | null {
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

function unwrapFunctionBody(body: unknown): Record<string, unknown> {
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

/** Normalize any value to a list of lines (missing → [], string → one item, array → coerced items). */
function coerceToTextArray(value: unknown): string[] {
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

function normalizeScores(raw: unknown): Record<BpkScoreKey, number> {
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

/**
 * Maps `bpk-analyst` strict JSON to UI state. Unknown fields are ignored;
 * missing `scores` defaults to 0; `error` surfaces as `edgeError`.
 */
function parseBpkResponse(raw: unknown): BpkAnalystPayload {
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

function VerdictBadge({ verdict }: { verdict: BpkVerdictDisplay }) {
  const styles =
    verdict === 'BUILD'
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]'
      : verdict === 'PIVOT'
        ? 'border-orange-500/50 bg-orange-500/10 text-orange-200 shadow-[0_0_56px_-12px_rgba(249,115,22,0.45)]'
        : verdict === 'KILL'
          ? 'border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_56px_-12px_rgba(244,63,94,0.45)]'
          : 'border-zinc-600/50 bg-zinc-900/40 text-zinc-200 shadow-[0_0_40px_-16px_rgba(255,255,255,0.06)]'

  const label = verdict

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-zinc-500">
        Forensic verdict
      </p>
      <div
        className={cn(
          'inline-flex min-w-[min(100%,320px)] items-center justify-center border-2 px-8 py-5 font-mono text-2xl font-black uppercase tracking-[0.35em] md:text-3xl md:tracking-[0.42em]',
          styles
        )}
        role="status"
        aria-live="polite"
      >
        [ {label} ]
      </div>
    </div>
  )
}

function ScoreStrip({ scores }: { scores: Record<BpkScoreKey, number> }) {
  return (
    <section
      aria-label="Validation scores"
      className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-4 md:p-5"
    >
      <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
        Signal grid · /10
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-2">
        {SCORE_SCHEMA.map(({ key, label }) => {
          const v = scores[key]
          const display = Number.isFinite(v) ? v.toFixed(1) : '0.0'
          return (
            <div
              key={key}
              className="flex flex-col border border-zinc-800/80 bg-zinc-950/60 px-3 py-3 text-center md:px-2"
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                {label}
              </span>
              <span className="mt-1 font-mono text-xl font-bold tabular-nums text-zinc-100 md:text-2xl">
                {display}
                <span className="text-sm font-semibold text-zinc-500">/10</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DossierCard({
  title,
  body,
  icon: Icon,
  iconClass,
  className
}: {
  title: string
  body: string
  icon: typeof Target
  iconClass: string
  className?: string
}) {
  if (!body) return null
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 md:p-6',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-3">
        <Icon className={cn('h-4 w-4 shrink-0', iconClass)} aria-hidden />
        <h3 className="font-serif text-base font-bold tracking-tight text-zinc-100 md:text-lg">
          {title}
        </h3>
      </div>
      <div className="font-mono text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
        {body}
      </div>
    </section>
  )
}

export function BuildPivotKillAnalyst() {
  const [idea, setIdea] = useState('')
  const [audience, setAudience] = useState('')
  const [monetization, setMonetization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BpkAnalystPayload | null>(null)

  const canSubmit = useMemo(
    () => idea.trim().length >= 12 && !loading,
    [idea, loading]
  )

  const runAudit = useCallback(async () => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'bpk-analyst',
        {
          body: {
            startup_idea: idea.trim(),
            target_audience: audience.trim(),
            monetization_strategy: monetization.trim()
          }
        }
      )

      if (fnError) {
        setError(fnError.message || 'Edge function request failed.')
        return
      }

      const parsed = parseBpkResponse(data)
      setResult(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.')
    } finally {
      setLoading(false)
    }
  }, [idea, audience, monetization])

  return (
    <div className="space-y-12 md:space-y-16">
      <section aria-labelledby="bpk-tool-heading" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Crosshair className="h-5 w-5 text-emerald-400/90" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
            Tool · sealed channel
          </p>
        </div>
        <h1
          id="bpk-tool-heading"
          className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl lg:text-5xl"
        >
          Build, Pivot, or Kill
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Forensic startup idea validator — demand, saturation, and fatal risks in
          one pass. Inputs are analyzed against 2026 market repositories; output is
          structured for answer engines and human operators.
        </p>

        <div className="grid gap-4 md:grid-cols-1">
          <label className="space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              Startup idea
            </span>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              placeholder="One tight paragraph: what you ship, for whom, and why now."
              className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none ring-0 transition-colors focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              autoComplete="off"
            />
          </label>
          <label className="space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              Target audience
            </span>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. SMB ops leads in logistics, US, $5–50M revenue"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              autoComplete="off"
            />
          </label>
          <label className="space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              Monetization strategy
            </span>
            <input
              type="text"
              value={monetization}
              onChange={(e) => setMonetization(e.target.value)}
              placeholder="e.g. seat-based SaaS, usage billing, services attach"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={runAudit}
            className={cn(
              'border-2 border-emerald-500/45 bg-zinc-950 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-emerald-100',
              'shadow-[0_0_0_1px_rgba(16,185,129,0.12)] transition-all',
              'hover:border-emerald-400/70 hover:shadow-[0_0_40px_-6px_rgba(16,185,129,0.4)]',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none'
            )}
          >
            [ EXECUTE FORENSIC AUDIT ]
          </button>
          {!canSubmit && !loading ? (
            <p className="font-mono text-xs text-zinc-500">
              Minimum 12 characters in Startup idea to arm the model.
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            className="rounded-lg border border-rose-500/35 bg-rose-950/20 px-4 py-3 font-mono text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </section>

      {loading ? (
        <section
          aria-busy="true"
          aria-label="Analysis in progress"
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm text-emerald-200/90 md:p-8"
        >
          <div className="flex items-center gap-3 text-emerald-400/90">
            <Terminal className="h-5 w-5 shrink-0 animate-pulse" aria-hidden />
            <span className="uppercase tracking-[0.2em] text-[11px] md:text-xs">
              /// ACCESSING MARKET REPOSITORIES... ANALYZING 2026 BENCHMARKS...
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Do not close this channel. Latency depends on upstream intelligence
            mesh.
          </p>
        </section>
      ) : null}

      {result && !loading ? (
        <section
          aria-label="Forensic verdict and intelligence dossier"
          className="space-y-8 border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:space-y-10 md:p-8"
        >
          <header className="space-y-6 text-center">
            {result.edgeError ? (
              <div
                role="alert"
                className="rounded-lg border-2 border-rose-600/70 bg-rose-950/35 p-5 text-left shadow-[0_0_40px_-12px_rgba(244,63,94,0.35)] md:p-6"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    className="mt-0.5 h-6 w-6 shrink-0 text-rose-400"
                    aria-hidden
                  />
                  <div className="min-w-0 space-y-2">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-rose-300">
                      Red alert · analyst error
                    </p>
                    <p className="font-mono text-sm leading-relaxed text-rose-100">
                      {result.edgeError}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            <VerdictBadge verdict={result.verdict} />
            <ScoreStrip scores={result.scores} />
          </header>

          <section
            aria-label="Intelligence dossier"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
          >
            <DossierCard
              title="demand_problem"
              body={result.demand_problem}
              icon={Target}
              iconClass="text-emerald-400/90"
              className="md:col-span-2"
            />
            <DossierCard
              title="market_competitors"
              body={result.market_competitors}
              icon={BarChart3}
              iconClass="text-orange-400/90"
            />
            <DossierCard
              title="key_assumptions"
              body={result.key_assumptions}
              icon={ListChecks}
              iconClass="text-zinc-400"
            />
            <DossierCard
              title="fatal_risks"
              body={result.fatal_risks}
              icon={ShieldAlert}
              iconClass="text-rose-400/90"
              className="border-rose-500/20 bg-rose-950/10 md:col-span-2"
            />
            <DossierCard
              title="monetization_reality"
              body={result.monetization_reality}
              icon={TrendingUp}
              iconClass="text-emerald-400/90"
            />
            <DossierCard
              title="verdict_reasoning"
              body={result.verdict_reasoning}
              icon={Scale}
              iconClass="text-orange-300/90"
              className="md:col-span-2"
            />
            <DossierCard
              title="if_this_works"
              body={result.if_this_works}
              icon={Sparkles}
              iconClass="text-orange-300/90"
            />
          </section>
        </section>
      ) : null}

      <aside className="rounded-lg border border-dashed border-zinc-800/80 bg-zinc-900/30 p-5 md:p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          Operator note
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This tool issues a compressed intelligence packet, not legal or investment
          advice. For cited market maps, SERP clusters, and appendices, escalate to
          a full Valifye market intelligence report.
        </p>
      </aside>

      <section
        aria-labelledby="validation-standard-heading"
        className="space-y-8 border-t border-zinc-800/80 pt-12"
      >
        <h2
          id="validation-standard-heading"
          className="font-serif text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl"
        >
          The 2026 Validation Standard
        </h2>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 md:p-6">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400/85">
              The answer engine era
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Information-only SaaS is under displacement as generative answer surfaces
              collapse discovery into single-shot responses. When the buyer never
              visits ten blue links, thin wrappers on public data lose pricing power
              and retention. Operators must prove proprietary data, workflow depth, or
              distribution that answer engines cannot replicate overnight—or watch
              margin leak to models that ship the same insight for free inside the
              chat pane.
            </p>
          </section>
          <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 md:p-6">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-400/85">
              The distribution moat
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Classic SEO is no longer a primary moat when SERPs atomize into AI
              summaries and zero-click cards. Ranking for head terms without owning
              demand capture in feeds, communities, partnerships, and product-led
              loops leaves you renting traffic from platforms that can throttle you
              on a policy change. Validation in 2026 means stress-testing whether you
              can reach buyers when the page-one playbook stops working.
            </p>
          </section>
          <section className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 md:p-6">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-rose-400/85">
              Unit economic fragility
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Low-ACV products amplify CAC payback risk: small tickets stretch
              months to recover acquisition spend while churn erodes cohorts in
              silence. When expansion revenue is uncertain, every basis point of
              conversion and support load matters. Founders should model payback,
              gross margin after delivery cost, and concentration before scaling
              wedge spend—especially when monetization is usage-light or seat-thin.
            </p>
          </section>
        </div>
      </section>

      <section aria-label="Escalate to full report" className="pb-4">
        <Link
          href="/solutions"
          className={cn(
            'flex w-full items-center justify-center border-2 border-orange-500/40 bg-zinc-950 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-orange-100',
            'transition-all hover:border-orange-400/60 hover:shadow-[0_0_36px_-6px_rgba(249,115,22,0.35)] md:text-sm md:tracking-[0.22em]'
          )}
        >
          [ ESCALATE: REQUEST FULL MARKET INTELLIGENCE REPORT ]
        </Link>
      </section>
    </div>
  )
}
