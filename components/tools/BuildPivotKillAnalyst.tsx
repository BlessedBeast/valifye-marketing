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
  Sparkles
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Verdict = 'BUILD' | 'PIVOT' | 'KILL'

type ScoreKey = 'need' | 'diff' | 'feasibility' | 'distribution' | 'speed'

const SCORE_LABELS: { key: ScoreKey; label: string }[] = [
  { key: 'need', label: 'Need' },
  { key: 'diff', label: 'Diff' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'distribution', label: 'Distribution' },
  { key: 'speed', label: 'Speed' }
]

const SCORE_ALIASES: Record<ScoreKey, string[]> = {
  need: ['need', 'problem_need', 'problemNeed', 'demand'],
  diff: ['diff', 'differentiation', 'differentiation_score', 'moat'],
  feasibility: ['feasibility', 'feasible', 'execution'],
  distribution: ['distribution', 'distribution_score', 'gtm', 'channels'],
  speed: ['speed', 'velocity', 'time_to_value', 'timeToValue']
}

export type BpkAnalystPayload = {
  verdict: Verdict
  scores: Partial<Record<ScoreKey, number | null>>
  demand_problem: string
  market_competitors: string
  key_assumptions: string
  fatal_risks: string
  monetization_reality: string
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
  if (!isRecord(body)) return {}
  const nested = body.data ?? body.result ?? body.payload
  if (isRecord(nested)) return nested
  return body
}

function parseBpkResponse(raw: unknown): BpkAnalystPayload | null {
  const root = unwrapFunctionBody(raw)
  if (!isRecord(root)) return null

  const verdict =
    parseVerdict(root.verdict ?? root.status ?? root.decision ?? root.call) ??
    parseVerdict(
      isRecord(root.summary) ? root.summary.headline : root.summary
    )

  const scoresBlock = isRecord(root.scores)
    ? root.scores
    : isRecord(root.scoring)
      ? root.scoring
      : root

  const scores: Partial<Record<ScoreKey, number | null>> = {}
  for (const { key } of SCORE_LABELS) {
    const aliases = SCORE_ALIASES[key]
    scores[key] = pickScore(scoresBlock as Record<string, unknown>, aliases)
  }

  const demand_problem = asString(
    root.demand_problem ?? root.demandProblem ?? root.problem_demand
  )
  const market_competitors = asString(
    root.market_competitors ?? root.marketCompetitors ?? root.competition
  )
  const key_assumptions = asString(
    root.key_assumptions ?? root.keyAssumptions ?? root.assumptions
  )
  const fatal_risks = asString(
    root.fatal_risks ?? root.fatalRisks ?? root.risks ?? root.risk_summary
  )
  const monetization_reality = asString(
    root.monetization_reality ??
      root.monetizationReality ??
      root.monetization
  )
  const if_this_works = asString(
    root.if_this_works ?? root.ifThisWorks ?? root.success_path ?? root.path_to_win
  )

  if (!verdict) return null

  return {
    verdict,
    scores,
    demand_problem,
    market_competitors,
    key_assumptions,
    fatal_risks,
    monetization_reality,
    if_this_works
  }
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const styles =
    verdict === 'BUILD'
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]'
      : verdict === 'PIVOT'
        ? 'border-orange-500/50 bg-orange-500/10 text-orange-200 shadow-[0_0_56px_-12px_rgba(249,115,22,0.45)]'
        : 'border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_56px_-12px_rgba(244,63,94,0.45)]'

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
        [ {verdict} ]
      </div>
    </div>
  )
}

function ScoreStrip({ scores }: { scores: Partial<Record<ScoreKey, number | null>> }) {
  return (
    <section
      aria-label="Validation scores"
      className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-4 md:p-5"
    >
      <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
        Signal grid · /10
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-2">
        {SCORE_LABELS.map(({ key, label }) => {
          const v = scores[key]
          const display =
            typeof v === 'number' && Number.isFinite(v) ? v.toFixed(1) : '—'
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
      if (!parsed) {
        setError(
          'Unexpected response shape from analyst. Check function payload (verdict + dossier fields).'
        )
        return
      }
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
            <VerdictBadge verdict={result.verdict} />
            <ScoreStrip scores={result.scores} />
          </header>

          <section
            aria-label="Intelligence dossier"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
          >
            <DossierCard
              title="Demand & problem"
              body={result.demand_problem}
              icon={Target}
              iconClass="text-emerald-400/90"
              className="md:col-span-2"
            />
            <DossierCard
              title="Market & competitors"
              body={result.market_competitors}
              icon={BarChart3}
              iconClass="text-orange-400/90"
            />
            <DossierCard
              title="Key assumptions"
              body={result.key_assumptions}
              icon={ListChecks}
              iconClass="text-zinc-400"
            />
            <DossierCard
              title="Fatal risks"
              body={result.fatal_risks}
              icon={ShieldAlert}
              iconClass="text-rose-400/90"
              className="border-rose-500/20 bg-rose-950/10 md:col-span-2"
            />
            <DossierCard
              title="Monetization reality"
              body={result.monetization_reality}
              icon={TrendingUp}
              iconClass="text-emerald-400/90"
            />
            <DossierCard
              title="If this works"
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
