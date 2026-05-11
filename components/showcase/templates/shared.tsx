import type { ReactNode } from 'react'
import { ArrowRight, LockKeyhole, Scale } from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import type {
  MarketingShowcaseReport,
  ShowcaseMetric,
  ShowcaseModule
} from '@/lib/marketingShowcase'
import { cn } from '@/lib/utils'

export type TemplateProps = {
  report: MarketingShowcaseReport
}

type ModuleRenderer = (module: ShowcaseModule, index: number) => ReactNode

export function getTemplateModules(
  report: MarketingShowcaseReport,
  fallback: ShowcaseModule[]
): ShowcaseModule[] {
  return report.modules.length > 0 ? report.modules : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Unwraps the structured report payload regardless of which JSON column the
 * `marketing_showcase` row stored it under. Returns the first record whose keys
 * look like module data (top-level `module_*` keys) or which lives under one of
 * the conventional nested keys (`payload`, `report_data`, `data`, etc.).
 */
export function extractPayload(
  report: MarketingShowcaseReport
): Record<string, unknown> {
  const raw = report.rawData
  if (!isRecord(raw)) return {}

  const looksLikePayload = Object.keys(raw).some((key) =>
    key.startsWith('module_')
  )
  if (looksLikePayload) return raw

  const nestedKeys = [
    'payload',
    'report_data',
    'data',
    'scout',
    'battlefield',
    'pivot',
    'arsenal',
    'risk',
    'modules'
  ]
  for (const key of nestedKeys) {
    const candidate = raw[key]
    if (isRecord(candidate)) return candidate
  }

  return raw
}

export function ShowcaseArticle({
  report,
  eyebrow,
  children,
  className
}: {
  report: MarketingShowcaseReport
  eyebrow: string
  children: ReactNode
  className?: string
}) {
  return (
    <article className={cn('space-y-8', className)}>
      <header className="border border-border bg-card p-8 shadow-[4px_4px_0_0_hsl(var(--primary))] md:p-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              <Scale className="h-4 w-4" />
              {eyebrow}
            </p>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground md:text-5xl">
              {report.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {report.forensicVerdict}
            </p>
          </div>
          {report.score !== null && (
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Integrity Score
              </span>
              <span className="text-5xl font-black tabular-nums text-foreground">
                {Math.round(report.score)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">/100</span>
            </div>
          )}
        </div>
      </header>
      {children}
    </article>
  )
}

export function EvidenceBlock({
  evidence,
  source
}: {
  evidence?: string | string[]
  source?: string
}) {
  if (!evidence && !source) return null

  const lines = Array.isArray(evidence) ? evidence : evidence ? [evidence] : []

  return (
    <div className="mt-4 border-l-4 border-primary bg-black/30 px-4 py-3 text-[11px] leading-relaxed text-zinc-300">
      {lines.length > 0 && (
        <p>
          <strong className="font-bold uppercase tracking-[0.18em] text-primary">
            Hard Evidence:
          </strong>{' '}
          {lines.join(' ')}
        </p>
      )}
      {source && (
        <cite className="mt-2 block text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Source: {source}
        </cite>
      )}
    </div>
  )
}

export function MetricGrid({
  items,
  columns = 'md:grid-cols-3'
}: {
  items?: ShowcaseMetric[]
  columns?: string
}) {
  if (!items || items.length === 0) return null

  return (
    <div className={cn('mt-5 grid gap-4', columns)}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs"
        >
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            {item.label}
          </span>
          <span className="text-2xl font-black tabular-nums text-zinc-100">
            {item.value}
          </span>
          {item.detail && (
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
              {item.detail}
            </p>
          )}
          {item.source && (
            <cite className="mt-3 text-[9px] uppercase tracking-[0.18em] text-zinc-600">
              Source: {item.source}
            </cite>
          )}
        </div>
      ))}
    </div>
  )
}

export function StepList({ steps }: { steps?: string[] }) {
  if (!steps || steps.length === 0) return null

  return (
    <ol className="mt-5 space-y-3">
      {steps.map((step, index) => (
        <li
          key={`${step}-${index}`}
          className="flex gap-3 border border-zinc-800 bg-black/60 px-4 py-3 text-[11px] leading-relaxed text-zinc-300"
        >
          <span className="shrink-0 font-bold text-primary">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function StandardModule({
  module,
  className,
  columns
}: {
  module: ShowcaseModule
  className?: string
  columns?: string
}) {
  return (
    <section className={cn('border border-zinc-800 bg-[#080808] px-6 py-5', className)}>
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
        {module.title}
      </h2>
      {module.summary && (
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{module.summary}</p>
      )}
      {module.verdict && (
        <p className="mt-4 border border-primary/40 bg-primary/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          {module.verdict}
        </p>
      )}
      <MetricGrid items={module.items} columns={columns} />
      <StepList steps={module.steps} />
      <EvidenceBlock evidence={module.evidence} source={module.source} />
    </section>
  )
}

export function RenderPreviewWithBlur({
  modules,
  renderModule,
  slug
}: {
  modules: ShowcaseModule[]
  renderModule: ModuleRenderer
  slug: string
}) {
  const visibleModules = modules.slice(0, 2)
  const lockedModules = modules.slice(2)

  return (
    <>
      {visibleModules.map((module, index) => renderModule(module, index))}
      <section className="conversion-blur relative overflow-hidden border border-zinc-800 bg-[#080808] px-6 py-8">
        <div className="pointer-events-none max-h-[420px] space-y-5 overflow-hidden blur-[2px]">
          {lockedModules.length > 0 ? (
            lockedModules.map((module, index) => renderModule(module, index + 2))
          ) : (
            <LockedTeaser />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center px-4">
          <form action="https://app.valifye.com" method="get" target="_blank">
            <input type="hidden" name="ref" value={`showcase_${slug}`} />
            <ValifyeButton
              type="submit"
              size="lg"
              className="rounded-none border-2 border-foreground bg-primary px-6 font-mono text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Get the Full Forensic Audit for $49 -&gt;
            </ValifyeButton>
          </form>
        </div>
      </section>
    </>
  )
}

function LockedTeaser() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {['Evidence Annex', 'Financial Sensitivity', 'Go/No-Go Memo', 'Execution Notes'].map(
        (label) => (
          <div key={label} className="border border-zinc-800 bg-black px-5 py-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              {label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Locked in the complete forensic audit.
            </p>
            <ArrowRight className="mt-5 h-4 w-4 text-primary" />
          </div>
        )
      )}
    </div>
  )
}
