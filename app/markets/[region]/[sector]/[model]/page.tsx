import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Crosshair,
  Terminal
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import {
  dossierTextWrapClass,
  formatBusinessModelLabel,
  formatDossierTitle,
  formatSectorLabel,
  parseRegionKeyForHubBreadcrumb
} from '@/lib/marketsStateHub'
import { buildCanonical } from '@/lib/seo'
import { buildMarketPath } from '@/lib/slugify'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

type ExecutiveVerdict = {
  score: number
  label: string
  narrative: string
}

type FinancialReality = {
  capex_estimate: string
  breakeven_utilization: string
  narrative: string
}

type LocalFriction = {
  labor_warning: string
  tax_advantage: string
  aggregator_threat: string
}

type RiskFactor = {
  label: string
  description: string
}

export type LocalBusinessBlueprintRow = {
  slug: string
  region_key: string
  sector: string
  business_model: string
  meta_title: string
  meta_description: string | null
  status: string
  executive_verdict: ExecutiveVerdict | string | null
  financial_reality: FinancialReality | string | null
  local_friction: LocalFriction | string | null
  survival_checklist: string[] | string | null
  risk_factors: RiskFactor[] | string | null
  aeo_summary: string | null
}

type Props = {
  params: Promise<{ region: string; sector: string; model: string }>
}

function parseJsonField<T>(value: unknown): T | null {
  if (value == null) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === 'string')
  }
  const parsed = parseJsonField<unknown[]>(value)
  if (!Array.isArray(parsed)) return []
  return parsed.filter((x): x is string => typeof x === 'string')
}

function parseRiskFactors(value: unknown): RiskFactor[] {
  if (!Array.isArray(value)) {
    const inner = parseJsonField<unknown[]>(value)
    if (!Array.isArray(inner)) return []
    value = inner
  }
  const out: RiskFactor[] = []
  for (const item of value as unknown[]) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const o = item as Record<string, unknown>
    const label = typeof o.label === 'string' ? o.label : ''
    const description = typeof o.description === 'string' ? o.description : ''
    if (label) out.push({ label, description })
  }
  return out
}

function segmentDecode(s: string): string {
  return decodeURIComponent(s ?? '').trim()
}

async function fetchPublishedBlueprint(
  region: string,
  sector: string,
  model: string
): Promise<LocalBusinessBlueprintRow | null> {
  const supabase = await createClient()

  // Reconstruct the full dashed slug from the URL parameters
  // This matches the format stored in our 'slug' column
  const fullSlug = [region, sector, model]
    .map((seg) => segmentDecode(seg).toLowerCase())
    .join('-')

  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('*')
    .eq('slug', fullSlug)
    .eq('status', 'published')
    .maybeSingle<LocalBusinessBlueprintRow>()

  if (error || !data) return null
  return data
}

function scoreTone(score: number): {
  bar: string
  chip: string
  ring: string
} {
  if (score >= 70) {
    return {
      bar: 'from-emerald-500/80 to-emerald-400/20',
      chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
      ring: 'text-emerald-400'
    }
  }
  if (score >= 40) {
    return {
      bar: 'from-amber-500/80 to-amber-400/15',
      chip: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
      ring: 'text-amber-400'
    }
  }
  return {
    bar: 'from-rose-500/80 to-rose-500/15',
    chip: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
    ring: 'text-rose-400'
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, sector, model } = await params
  const row = await fetchPublishedBlueprint(region, sector, model)
  if (!row) {
    return { title: 'Market blueprint | Valifye' }
  }
  const canonical = buildCanonical(
    buildMarketPath(row.region_key, row.sector, row.business_model)
  )
  return {
    title: row.meta_title,
    description: row.meta_description ?? row.meta_title,
    alternates: { canonical },
    openGraph: {
      title: row.meta_title,
      description: row.meta_description ?? undefined,
      url: canonical
    }
  }
}

export default async function MarketBlueprintPage({ params }: Props) {
  const { region, sector, model } = await params
  const row = await fetchPublishedBlueprint(region, sector, model)

  if (!row || row.status !== 'published') {
    notFound()
  }

  const verdict = parseJsonField<ExecutiveVerdict>(row.executive_verdict)
  const financial = parseJsonField<FinancialReality>(row.financial_reality)
  const friction = parseJsonField<LocalFriction>(row.local_friction)
  const checklist = parseStringArray(row.survival_checklist)
  const risks = parseRiskFactors(row.risk_factors)
  const aeo = (row.aeo_summary ?? '').trim()

  if (!verdict || !financial || !friction) {
    notFound()
  }

  const score = Number.isFinite(verdict.score)
    ? Math.max(0, Math.min(100, Math.round(verdict.score)))
    : 0
  const tone = scoreTone(score)
  const regionCrumb = parseRegionKeyForHubBreadcrumb(row.region_key)

  return (
    <MarketingShell className="max-w-4xl gap-12 px-4 py-10 pb-28 md:px-8 md:py-14 md:pb-32">
      <article className="mx-auto w-full max-w-4xl space-y-12 rounded-xl border border-zinc-800/90 bg-[#09090b] p-6 shadow-[0_0_80px_-30px_rgba(245,158,11,0.12)] md:p-10">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500"
        >
          <Link href="/markets" className="text-zinc-400 hover:text-amber-500/90">
            Markets
          </Link>
          <span className="text-zinc-700">/</span>
          {regionCrumb ? (
            <>
              <Link
                href={`/markets/state/${regionCrumb.hubSlug}`}
                className="text-zinc-400 hover:text-amber-500/90"
              >
                {regionCrumb.hubDisplayName}
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400">{regionCrumb.cityLabel}</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300">{formatSectorLabel(row.sector)}</span>
            </>
          ) : (
            <>
              <span className="max-w-[14rem] truncate text-zinc-400" title={row.region_key}>
                {row.region_key}
              </span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300">{formatSectorLabel(row.sector)}</span>
            </>
          )}
        </nav>

        <header className="space-y-8 border-b border-zinc-800/80 pb-10">
          {/* Header section — title + verdict score */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="min-w-0 flex-1 space-y-4">
              <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
                <Crosshair className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
                Forensic market blueprint
              </p>
              <h1
                className={cn(
                  'hyphens-auto font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-4xl',
                  dossierTextWrapClass
                )}
              >
                {formatDossierTitle(row.meta_title)}
              </h1>
              {row.meta_description ? (
                <p className="max-w-2xl font-serif text-sm leading-relaxed text-zinc-500">
                  {row.meta_description}
                </p>
              ) : null}
              <p
                className={cn(
                  'font-mono text-[10px] uppercase tracking-widest text-zinc-600',
                  dossierTextWrapClass
                )}
              >
                {row.region_key} · {formatSectorLabel(row.sector)} ·{' '}
                {formatBusinessModelLabel(row.business_model)}
              </p>
            </div>

            <div className="w-full shrink-0 lg:w-[220px]">
              <div
                className={cn(
                  'flex shrink-0 flex-col items-center justify-center rounded-xl border px-6 py-5 md:min-w-[180px]',
                  tone.chip
                )}
                aria-label={`Executive verdict score ${score} of 100`}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
                    tone.ring
                  )}
                >
                  Verdict score
                </span>
                <span className="mt-2 font-mono text-5xl font-black tabular-nums tracking-tight text-zinc-50 md:text-6xl">
                  {score}
                </span>
                <span className="mt-2 text-center font-mono text-xs font-bold uppercase tracking-wide text-zinc-200">
                  {verdict.label}
                </span>
                <div
                  className={cn(
                    'mt-4 h-1.5 w-full max-w-[140px] rounded-full bg-gradient-to-r to-transparent',
                    tone.bar
                  )}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <p className="max-w-3xl font-serif text-lg leading-relaxed text-zinc-300 md:text-xl">
            {verdict.narrative}
          </p>
        </header>

        {aeo ? (
          <section aria-label="AEO summary" className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-500/90">
              <Terminal className="h-3.5 w-3.5" aria-hidden />
              AEO / search summary
            </div>
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-950/30 p-5 shadow-[0_0_40px_-12px_rgba(16,185,129,0.15)]">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-emerald-50">
                {aeo}
              </pre>
            </div>
          </section>
        ) : null}

        <section aria-label="Financial reality" className="space-y-4">
          <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
            Financial reality
          </h2>
          <div className="grid gap-4 rounded-xl border border-zinc-800/80 bg-black/20 p-4 md:grid-cols-2 md:p-5">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Capex estimate
              </p>
              <p className="mt-2 font-mono text-xl font-bold tabular-nums tracking-tight text-zinc-50 md:text-2xl">
                {financial.capex_estimate}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Breakeven utilization
              </p>
              <p className="mt-2 font-mono text-xl font-bold tabular-nums tracking-tight text-zinc-50 md:text-2xl">
                {financial.breakeven_utilization}
              </p>
            </div>
          </div>
          <p className="font-serif text-sm leading-relaxed text-zinc-400 md:text-[15px]">
            {financial.narrative}
          </p>
        </section>

        <section aria-label="Local friction" className="space-y-4">
          <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
            Local friction
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                ['Labor', friction.labor_warning],
                ['Tax & structure', friction.tax_advantage],
                ['Aggregators', friction.aggregator_threat]
              ] as const
            ).map(([title, body]) => (
              <div
                key={title}
                className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                  {title}
                </p>
                <p className="mt-2 font-serif text-sm leading-relaxed text-zinc-300">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {risks.length > 0 ? (
          <section aria-label="Risk factors" className="space-y-4">
            <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
              Risk factors
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {risks.map((r, idx) => (
                <div
                  key={`${r.label}-${idx}`}
                  className="flex gap-3 rounded-lg border border-rose-500/25 bg-rose-500/[0.06] p-4"
                >
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
                    aria-hidden
                  />
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-wide text-rose-200">
                      {r.label}
                    </p>
                    <p className="mt-1 font-serif text-sm leading-relaxed text-zinc-400">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {checklist.length > 0 ? (
          <section aria-label="Survival checklist" className="space-y-4">
            <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-100 md:text-2xl">
              Survival checklist
            </h2>
            <ul className="space-y-3">
              {checklist.map((item, idx) => (
                <li
                  key={`${idx}-${item.slice(0, 48)}`}
                  className="flex items-start gap-3 rounded-md border border-zinc-800/90 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden
                  />
                  <span className="font-serif leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 border-t border-emerald-500/35 bg-[#09090b]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#09090b]/85"
        role="region"
        aria-label="Call to action"
      >
        <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-8">
          <p className="hidden text-left font-serif text-sm leading-snug text-zinc-300 sm:block sm:max-w-md">
            Wire lease, corridor, and unit economics before you sign.
          </p>
          <Link
            href="/solutions/before-signing-lease"
            className={cn(
              'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold uppercase tracking-[0.14em]',
              'bg-emerald-500 text-zinc-950 shadow-[0_0_28px_-4px_rgba(16,185,129,0.55)] transition-colors hover:bg-emerald-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70'
            )}
          >
            Run a Full Forensic Audit — $49
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}
