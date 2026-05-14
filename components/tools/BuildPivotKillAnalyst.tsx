'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import {
  Crosshair,
  Terminal
} from 'lucide-react'

import {
  BpkEdgeErrorBanner,
  BpkScoreStrip,
  BpkToolReportBody,
  BpkVerdictBadge
} from '@/components/bpk/BpkReportPrimitives'
import { parseBpkFullReport, type BpkAnalystPayload } from '@/lib/bpkReportParse'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

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

      const parsed = parseBpkFullReport(data)
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
              <BpkEdgeErrorBanner message={result.edgeError} />
            ) : null}
            <BpkVerdictBadge verdict={result.verdict} />
            <BpkScoreStrip scores={result.scores} />
          </header>

          <BpkToolReportBody payload={result} />
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

export type {
  BpkAnalystPayload,
  BpkScoreKey,
  BpkVerdictDisplay
} from '@/lib/bpkReportParse'
export { parseBpkFullReport } from '@/lib/bpkReportParse'
