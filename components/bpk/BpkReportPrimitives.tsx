import {
  AlertTriangle,
  BarChart3,
  EyeOff,
  Fingerprint,
  ListChecks,
  ListOrdered,
  MessageSquare,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react'

import type {
  AeoScanPayload,
  BpkAnalystPayload,
  BpkScoreKey,
  VerdictBadgeValue
} from '@/lib/bpkReportParse'
import { SCORE_SCHEMA } from '@/lib/bpkReportParse'
import { cn } from '@/lib/utils'

export function BpkEdgeErrorBanner({ message }: { message: string }) {
  return (
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
          <p className="font-mono text-sm leading-relaxed text-rose-100">{message}</p>
        </div>
      </div>
    </div>
  )
}

export function BpkVerdictBadge({
  verdict,
  caption
}: {
  verdict: VerdictBadgeValue
  caption?: string
}) {
  const styles =
    verdict === 'BUILD' || verdict === 'OPTIMIZED'
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_60px_-12px_rgba(16,185,129,0.55)]'
      : verdict === 'PIVOT' || verdict === 'FRAGILE'
        ? 'border-orange-500/50 bg-orange-500/10 text-orange-200 shadow-[0_0_56px_-12px_rgba(249,115,22,0.45)]'
        : verdict === 'KILL' || verdict === 'INVISIBLE'
          ? 'border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_56px_-12px_rgba(244,63,94,0.45)]'
          : 'border-zinc-600/50 bg-zinc-900/40 text-zinc-200 shadow-[0_0_40px_-16px_rgba(255,255,255,0.06)]'

  const line = verdict === 'PENDING' ? 'PENDING' : verdict

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-zinc-500">
        {caption ?? 'Forensic verdict'}
      </p>
      <div
        className={cn(
          'inline-flex min-w-[min(100%,320px)] items-center justify-center border-2 px-8 py-5 font-mono text-2xl font-black uppercase tracking-[0.35em] md:text-3xl md:tracking-[0.42em]',
          styles
        )}
        role="status"
        aria-live="polite"
      >
        [ {line} ]
      </div>
    </div>
  )
}

/** 0–100 AEO visibility strip (forensic noir). */
export function BpkVisibilityMeter({
  score,
  label = 'AEO Visibility Index'
}: {
  score: number
  label?: string
}) {
  const pct = Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0))
  return (
    <section
      aria-label={label}
      className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-4 md:p-5"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          {label}
        </p>
        <p className="font-mono text-xl font-black tabular-nums text-emerald-200/95 md:text-2xl">
          {Math.round(pct)}
          <span className="text-sm font-semibold text-zinc-500">/100</span>
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-sm border border-zinc-800/90 bg-zinc-950">
        <div
          className="h-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-400 shadow-[0_0_24px_-4px_rgba(16,185,129,0.65)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  )
}

export function BpkScoreStrip({ scores }: { scores: Record<BpkScoreKey, number> }) {
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

export function BpkDossierCard({
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
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-5 md:p-6',
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-3">
        <Icon className={cn('h-4 w-4 shrink-0', iconClass)} aria-hidden />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          {title}
        </p>
      </div>
      <div className="font-mono text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">
        {body}
      </div>
    </div>
  )
}

/** Tool layout: grid of dossier cards (snake_case labels). */
function bulletBlock(lines: string[]): string {
  if (lines.length === 0) return ''
  return lines.map((l) => `• ${l}`).join('\n')
}

function numberedBlock(lines: string[]): string {
  if (lines.length === 0) return ''
  return lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
}

/** Tool / dossier layout for `aeo-scanner` payload keys. */
export function ShadowScanReportBody({ payload }: { payload: AeoScanPayload }) {
  const citations = bulletBlock(payload.citation_snippets)
  const gaps = bulletBlock(payload.missing_entities)
  const roadmap = numberedBlock(payload.improvement_roadmap)

  return (
    <section
      aria-label="Shadow scan dossier"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
    >
      <BpkDossierCard
        title="perceived_authority"
        body={payload.perceived_authority}
        icon={Fingerprint}
        iconClass="text-emerald-400/90"
        className="md:col-span-2"
      />
      <BpkDossierCard
        title="citation_snippets"
        body={citations}
        icon={Search}
        iconClass="text-zinc-300/90"
        className="md:col-span-2"
      />
      <BpkDossierCard
        title="missing_entities"
        body={gaps}
        icon={EyeOff}
        iconClass="text-orange-300/90"
        className="md:col-span-2"
      />
      <BpkDossierCard
        title="sentiment_analysis"
        body={payload.sentiment_analysis}
        icon={MessageSquare}
        iconClass="text-zinc-400"
      />
      <BpkDossierCard
        title="competitor_threat"
        body={payload.competitor_threat}
        icon={AlertTriangle}
        iconClass="text-rose-400/90"
      />
      <BpkDossierCard
        title="improvement_roadmap"
        body={roadmap}
        icon={ListOrdered}
        iconClass="text-emerald-400/80"
        className="md:col-span-2"
      />
    </section>
  )
}

/** Tool layout: grid of dossier cards (snake_case labels). */
export function BpkToolReportBody({ payload }: { payload: BpkAnalystPayload }) {
  return (
    <section
      aria-label="Intelligence dossier"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
    >
      <BpkDossierCard
        title="demand_problem"
        body={payload.demand_problem}
        icon={Target}
        iconClass="text-emerald-400/90"
        className="md:col-span-2"
      />
      <BpkDossierCard
        title="market_competitors"
        body={payload.market_competitors}
        icon={BarChart3}
        iconClass="text-orange-400/90"
      />
      <BpkDossierCard
        title="key_assumptions"
        body={payload.key_assumptions}
        icon={ListChecks}
        iconClass="text-zinc-400"
      />
      <BpkDossierCard
        title="fatal_risks"
        body={payload.fatal_risks}
        icon={ShieldAlert}
        iconClass="text-rose-400/90"
        className="border-rose-500/20 bg-rose-950/10 md:col-span-2"
      />
      <BpkDossierCard
        title="monetization_reality"
        body={payload.monetization_reality}
        icon={TrendingUp}
        iconClass="text-emerald-400/90"
      />
      <BpkDossierCard
        title="verdict_reasoning"
        body={payload.verdict_reasoning}
        icon={Scale}
        iconClass="text-orange-300/90"
        className="md:col-span-2"
      />
      <BpkDossierCard
        title="if_this_works"
        body={payload.if_this_works}
        icon={Sparkles}
        iconClass="text-orange-300/90"
      />
    </section>
  )
}

function ideaSnippet(idea: string, max = 72): string {
  const t = idea.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t || 'this startup concept'
  return `${t.slice(0, max - 1)}…`
}

/** pSEO / AEO: each block is a `<section>` with an explicit `<h2>` question. */
export function BpkBlueprintReportArticle({
  payload,
  ideaLabel,
  audienceLabel
}: {
  payload: BpkAnalystPayload
  ideaLabel: string
  audienceLabel: string
}) {
  const idea = ideaSnippet(ideaLabel)
  const audience =
    audienceLabel.replace(/\s+/g, ' ').trim() || 'founders in this market'

  return (
    <div className="space-y-10 md:space-y-12">
      {payload.demand_problem ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-demand-heading"
        >
          <h2
            id="bpk-demand-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            What is the core demand problem for {idea}?
          </h2>
          <BpkDossierCard
            title="demand_problem"
            body={payload.demand_problem}
            icon={Target}
            iconClass="text-emerald-400/90"
          />
        </section>
      ) : null}

      {payload.market_competitors ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-competitors-heading"
        >
          <h2
            id="bpk-competitors-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Who competes for {idea}, and how saturated is the field?
          </h2>
          <BpkDossierCard
            title="market_competitors"
            body={payload.market_competitors}
            icon={BarChart3}
            iconClass="text-orange-400/90"
          />
        </section>
      ) : null}

      {payload.key_assumptions ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-assumptions-heading"
        >
          <h2
            id="bpk-assumptions-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            What assumptions must hold true for {idea} to work?
          </h2>
          <BpkDossierCard
            title="key_assumptions"
            body={payload.key_assumptions}
            icon={ListChecks}
            iconClass="text-zinc-400"
          />
        </section>
      ) : null}

      {payload.fatal_risks ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-fatal-heading"
        >
          <h2
            id="bpk-fatal-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            What is the fatal risk for {idea}?
          </h2>
          <BpkDossierCard
            title="fatal_risks"
            body={payload.fatal_risks}
            icon={ShieldAlert}
            iconClass="text-rose-400/90"
            className="border-rose-500/20 bg-rose-950/10"
          />
        </section>
      ) : null}

      {payload.monetization_reality ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-monetization-heading"
        >
          <h2
            id="bpk-monetization-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Is monetization viable for {audience}?
          </h2>
          <BpkDossierCard
            title="monetization_reality"
            body={payload.monetization_reality}
            icon={TrendingUp}
            iconClass="text-emerald-400/90"
          />
        </section>
      ) : null}

      {payload.verdict_reasoning ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-reasoning-heading"
        >
          <h2
            id="bpk-reasoning-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Why did Valifye assign verdict {payload.verdict} for {idea}?
          </h2>
          <BpkDossierCard
            title="verdict_reasoning"
            body={payload.verdict_reasoning}
            icon={Scale}
            iconClass="text-orange-300/90"
          />
        </section>
      ) : null}

      {payload.if_this_works ? (
        <section
          className="space-y-4"
          aria-labelledby="bpk-path-heading"
        >
          <h2
            id="bpk-path-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            If {idea} works, what is the execution path?
          </h2>
          <BpkDossierCard
            title="if_this_works"
            body={payload.if_this_works}
            icon={Sparkles}
            iconClass="text-orange-300/90"
          />
        </section>
      ) : null}
    </div>
  )
}

/** pSEO / AEO: shadow scan blocks with AEO-native `<h2>` headings. */
export function AeoBlueprintReportArticle({
  payload,
  targetUrl
}: {
  payload: AeoScanPayload
  targetUrl: string
}) {
  const trimmed = targetUrl.replace(/\s+/g, ' ').trim()
  const targetLine =
    trimmed.length > 140 ? `${trimmed.slice(0, 139)}…` : trimmed

  const citations = bulletBlock(payload.citation_snippets)
  const gaps = bulletBlock(payload.missing_entities)
  const roadmap = numberedBlock(payload.improvement_roadmap)

  return (
    <div className="space-y-10 md:space-y-12">
      {targetLine ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Target · <span className="normal-case tracking-normal text-zinc-500">{targetLine}</span>
        </p>
      ) : null}
      {payload.perceived_authority ? (
        <section className="space-y-4" aria-labelledby="aeo-authority-heading">
          <h2
            id="aeo-authority-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Perceived AI Authority
          </h2>
          <BpkDossierCard
            title="perceived_authority"
            body={payload.perceived_authority}
            icon={Fingerprint}
            iconClass="text-emerald-400/90"
          />
        </section>
      ) : null}

      {citations ? (
        <section className="space-y-4" aria-labelledby="aeo-citation-heading">
          <h2
            id="aeo-citation-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Citation Potential
          </h2>
          <BpkDossierCard
            title="citation_snippets"
            body={citations}
            icon={Search}
            iconClass="text-zinc-300/90"
          />
        </section>
      ) : null}

      {gaps || payload.sentiment_analysis || payload.competitor_threat ? (
        <section className="space-y-4" aria-labelledby="aeo-gap-heading">
          <h2
            id="aeo-gap-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            AEO Gap Analysis
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {gaps ? (
              <BpkDossierCard
                title="missing_entities"
                body={gaps}
                icon={EyeOff}
                iconClass="text-orange-300/90"
                className="md:col-span-2"
              />
            ) : null}
            <BpkDossierCard
              title="sentiment_analysis"
              body={payload.sentiment_analysis}
              icon={MessageSquare}
              iconClass="text-zinc-400"
            />
            <BpkDossierCard
              title="competitor_threat"
              body={payload.competitor_threat}
              icon={AlertTriangle}
              iconClass="text-rose-400/90"
            />
          </div>
        </section>
      ) : null}

      {roadmap ? (
        <section className="space-y-4" aria-labelledby="aeo-roadmap-heading">
          <h2
            id="aeo-roadmap-heading"
            className="font-serif text-xl font-bold tracking-tight text-zinc-50 md:text-2xl"
          >
            Optimization Roadmap
          </h2>
          <BpkDossierCard
            title="improvement_roadmap"
            body={roadmap}
            icon={ListOrdered}
            iconClass="text-emerald-400/80"
          />
        </section>
      ) : null}
    </div>
  )
}
