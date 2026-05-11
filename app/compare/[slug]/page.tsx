import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  AlertOctagon,
  ArrowRight,
  Check,
  Crosshair,
  Minus,
  Quote,
  Skull,
  X
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { VisualEvidenceSplit } from '@/components/compare/VisualEvidenceSplit'
import { AeoSchema } from '@/components/seo/AeoSchema'
import {
  getComparisonBySlug,
  type ComparisonReport,
  type FatalFlaw,
  type FeatureMatrixCellValue,
  type FeatureMatrixRow
} from '@/lib/comparisonData'
import { cn } from '@/lib/utils'

const SITE_URL = 'https://valifye.com'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const report = await getComparisonBySlug(slug)

  if (!report) {
    return {
      title: 'Forensic Comparison | Valifye',
      description: 'Valifye forensic comparison.'
    }
  }

  const fallbackTitle = `Valifye vs. ${report.competitorName}: 2026 Forensic Comparison`
  const fallbackDescription =
    report.aeoSnippet ??
    report.verdictSummary ??
    `A forensic, evidence-backed comparison of Valifye and ${report.competitorName}.`

  const title = report.metaTitle?.trim().length
    ? report.metaTitle
    : fallbackTitle
  const description = report.metaDescription?.trim().length
    ? report.metaDescription
    : fallbackDescription

  const canonical = `${SITE_URL}/compare/${report.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical
    }
  }
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params
  const report = await getComparisonBySlug(slug)
  if (!report) notFound()

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      <article className="space-y-16">
        <Hero report={report} />
        <VisualEvidenceSplit
          competitorName={report.competitorName}
          competitorScreenshot={report.competitorScreenshot ?? undefined}
          valifyeScreenshot={report.valifyeScreenshot ?? undefined}
        />
        <Interrogation flaws={report.fatalFlaws} />
        <ForensicMatrix report={report} />
        <KillShot report={report} />
      </article>

      <AeoSchema
        competitorName={report.competitorName}
        faqs={report.faqs}
      />
    </MarketingShell>
  )
}

/* ────────────────────────────  Hero  ──────────────────────────── */

function Hero({ report }: { report: ComparisonReport }) {
  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <Crosshair className="h-3.5 w-3.5" />
        Forensic Comparison Engine · 2026
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Valifye vs.{' '}
        <span className="text-amber-400">{report.competitorName}</span>
      </h1>

      {report.aeoSnippet && (
        <div className="relative bg-zinc-900 border-l-4 border-amber-500 p-6 font-medium text-lg text-zinc-300">
          <Quote
            className="absolute -top-3 left-4 h-5 w-5 text-amber-500/80"
            aria-hidden
          />
          <p className="leading-relaxed">{report.aeoSnippet}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        <span className="rounded-full border border-rose-500/30 bg-rose-500/[0.06] px-3 py-1 text-rose-200">
          {report.fatalFlaws.length} Fatal Flaws Detected
        </span>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1 text-emerald-200">
          {report.featureMatrix.rows.length} Feature Gaps
        </span>
        {report.faqs.length > 0 && (
          <span className="rounded-full border border-zinc-700/60 bg-zinc-900/50 px-3 py-1">
            {report.faqs.length} Indexed Questions
          </span>
        )}
        {report.categories.slice(0, 2).map((category) => (
          <span
            key={category}
            className="rounded-full border border-zinc-700/60 bg-zinc-900/50 px-3 py-1"
          >
            {category}
          </span>
        ))}
      </div>
    </header>
  )
}

/* ──────────────────────  Fatal Flaws Interrogation  ────────────────────── */

function Interrogation({ flaws }: { flaws: FatalFlaw[] }) {
  if (flaws.length === 0) return null

  return (
    <section
      aria-label="Fatal flaws"
      className="space-y-6 border-y border-zinc-800/80 py-12"
    >
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-rose-400">
          <AlertOctagon className="h-3.5 w-3.5" />
          The Interrogation
        </p>
        <h2 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
          Fatal flaws Valifye uncovered.
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
          Each flaw is a single, citable reason the incumbent fails for the
          specific operator profile Valifye audits for.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flaws.map((flaw, index) => (
          <FatalFlawCard key={`${flaw.title}-${index}`} flaw={flaw} />
        ))}
      </div>
    </section>
  )
}

function severityRibbon(severity: FatalFlaw['severity']): {
  label: string
  className: string
} {
  switch (severity) {
    case 'critical':
      return {
        label: 'Critical',
        className: 'border-rose-400/40 bg-rose-500/[0.10] text-rose-200'
      }
    case 'high':
      return {
        label: 'High',
        className: 'border-rose-400/30 bg-rose-500/[0.06] text-rose-200'
      }
    case 'medium':
      return {
        label: 'Medium',
        className: 'border-amber-400/30 bg-amber-500/[0.06] text-amber-200'
      }
    case 'low':
      return {
        label: 'Low',
        className: 'border-zinc-600/40 bg-zinc-800/60 text-zinc-300'
      }
    default:
      return {
        label: 'Flaw',
        className: 'border-rose-400/30 bg-rose-500/[0.06] text-rose-200'
      }
  }
}

function FatalFlawCard({ flaw }: { flaw: FatalFlaw }) {
  const ribbon = severityRibbon(flaw.severity)

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-3 rounded-lg border border-zinc-800 bg-slate-900/50 p-6',
        'border-t-2 border-t-rose-500/70 transition-colors hover:border-zinc-700'
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/[0.08] text-rose-300">
          <Skull className="h-5 w-5" />
        </span>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]',
            ribbon.className
          )}
        >
          {ribbon.label}
        </span>
      </header>

      <h3 className="font-serif text-lg font-bold leading-snug text-zinc-50">
        <strong>{flaw.title}</strong>
      </h3>

      {flaw.reason && (
        <p className="text-sm leading-relaxed text-zinc-400">{flaw.reason}</p>
      )}

      {flaw.evidence && (
        <p className="mt-1 border-l-2 border-zinc-800 pl-3 text-xs leading-relaxed text-zinc-500">
          <strong className="text-zinc-300">Evidence:</strong> {flaw.evidence}
        </p>
      )}

      {(flaw.source || flaw.citation) && (
        <footer className="mt-auto pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          <cite className="not-italic">
            Source: {flaw.source ?? flaw.citation}
          </cite>
        </footer>
      )}
    </article>
  )
}

/* ──────────────────────  Forensic Matrix  ────────────────────── */

function ForensicMatrix({ report }: { report: ComparisonReport }) {
  const { rows, competitorLabel, productLabel } = report.featureMatrix
  if (rows.length === 0) return null

  return (
    <section aria-label="Forensic feature matrix" className="space-y-6">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
          <Crosshair className="h-3.5 w-3.5" />
          The Forensic Matrix
        </p>
        <h2 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
          Where the audit diverges.
        </h2>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                <th scope="col" className="w-2/5 px-5 py-4">
                  Feature
                </th>
                <th scope="col" className="w-[30%] px-5 py-4">
                  {competitorLabel || report.competitorName}
                </th>
                <th scope="col" className="w-[30%] px-5 py-4 text-emerald-300">
                  {productLabel || 'Valifye'}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <MatrixRow
                  key={`${row.feature}-${index}`}
                  row={row}
                  isFirst={index === 0}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function MatrixRow({
  row,
  isFirst
}: {
  row: FeatureMatrixRow
  isFirst: boolean
}) {
  return (
    <tr
      className={cn(
        'align-top transition-colors hover:bg-slate-900/60',
        !isFirst && 'border-t border-zinc-800/80'
      )}
    >
      <th
        scope="row"
        className="px-5 py-5 text-left align-top font-serif text-base font-bold leading-snug text-zinc-100"
      >
        <span className="block">{row.feature}</span>
        {row.gap && (
          <span className="mt-1 block text-xs font-normal italic leading-relaxed text-zinc-500">
            {row.gap}
          </span>
        )}
      </th>
      <td className="px-5 py-5 align-top">
        <CellValue
          value={row.competitor}
          tone="incumbent"
          note={row.competitor_note}
        />
      </td>
      <td className="px-5 py-5 align-top">
        <CellValue
          value={row.product}
          tone="valifye"
          note={row.product_note}
        />
      </td>
    </tr>
  )
}

function CellValue({
  value,
  tone,
  note
}: {
  value: FeatureMatrixCellValue
  tone: 'incumbent' | 'valifye'
  note?: string
}) {
  const isValifye = tone === 'valifye'

  let body: React.ReactNode
  if (value === true) {
    body = (
      <span
        className={cn(
          'inline-flex items-center gap-2 text-sm font-semibold',
          isValifye ? 'text-emerald-300' : 'text-zinc-300'
        )}
      >
        <Check
          className={cn('h-4 w-4', isValifye ? 'text-emerald-400' : 'text-zinc-400')}
        />
        Yes
      </span>
    )
  } else if (value === false) {
    body = (
      <span
        className={cn(
          'inline-flex items-center gap-2 text-sm font-semibold',
          isValifye ? 'text-emerald-300' : 'text-rose-400'
        )}
      >
        <X className="h-4 w-4" />
        No
      </span>
    )
  } else if (value === null || value === undefined || value === '') {
    body = (
      <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
        <Minus className="h-4 w-4" />
        Not stated
      </span>
    )
  } else {
    body = (
      <span
        className={cn(
          'text-sm leading-snug',
          isValifye ? 'font-semibold text-emerald-200' : 'text-zinc-300'
        )}
      >
        {String(value)}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {body}
      {note && <span className="text-xs leading-relaxed text-zinc-500">{note}</span>}
    </div>
  )
}

/* ──────────────────────  Kill Shot  ────────────────────── */

function KillShot({ report }: { report: ComparisonReport }) {
  const ctaRef = `compare_${report.slug}`

  return (
    <section
      aria-label="Verdict and call to action"
      className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-8 md:p-12"
    >
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-10">
        <header className="space-y-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
            <AlertOctagon className="h-3.5 w-3.5" />
            The Kill Shot
          </p>
          <h2 className="font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-5xl">
            {report.verdictSummary}
          </h2>
        </header>

        {(report.pricingGap || report.pricingSummary) && (
          <div className="grid gap-4 border-t border-emerald-500/20 pt-8 md:grid-cols-2">
            {report.pricingGap && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/90">
                  Pricing Gap
                </p>
                <p className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
                  <strong>{report.pricingGap}</strong>
                </p>
              </div>
            )}
            {report.pricingSummary && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Pricing Context
                </p>
                <p className="text-base leading-relaxed text-zinc-300">
                  {report.pricingSummary}
                </p>
              </div>
            )}
          </div>
        )}

        <form
          method="get"
          action="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-start gap-3 border-t border-emerald-500/20 pt-8 md:flex-row md:items-center md:justify-between"
        >
          <input type="hidden" name="ref" value={ctaRef} />
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
            Stop guessing. Run a Valifye forensic audit on your exact market in
            48 hours.
          </p>
          <button
            type="submit"
            className={cn(
              'inline-flex items-center gap-3 rounded-lg border border-emerald-400/50 bg-emerald-500 px-8 py-5 font-semibold uppercase tracking-[0.18em] text-slate-950 transition-all',
              'text-base md:text-lg',
              'shadow-[0_0_40px_-8px_rgba(16,185,129,0.6)] hover:bg-emerald-400 hover:shadow-[0_0_60px_-8px_rgba(16,185,129,0.85)]',
              'active:scale-[0.99]'
            )}
          >
            Run Forensic Audit for $49
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  )
}
