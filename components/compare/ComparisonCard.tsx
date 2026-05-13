import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Camera,
  MapPin,
  Rocket,
  Scale,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ComparisonReport,
  ComparisonTier
} from '@/lib/comparisonData'

export type ComparisonCardProps = {
  report: ComparisonReport
  className?: string
}

type TierTheme = {
  label: string
  Icon: LucideIcon
  badge: string
  rule: string
  accent: string
}

export const TIER_META: Record<ComparisonTier, TierTheme> = {
  indie: {
    label: 'Indie Alternative',
    Icon: Rocket,
    badge: 'border-emerald-400/40 bg-emerald-500/[0.08] text-emerald-200',
    rule: 'border-emerald-500/40',
    accent: 'text-emerald-300'
  },
  enterprise: {
    label: 'Enterprise Alternative',
    Icon: Building2,
    badge: 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200',
    rule: 'border-cyan-500/40',
    accent: 'text-cyan-300'
  },
  local: {
    label: 'Local Alternative',
    Icon: MapPin,
    badge: 'border-amber-400/40 bg-amber-500/[0.08] text-amber-200',
    rule: 'border-amber-500/40',
    accent: 'text-amber-300'
  },
  other: {
    label: 'Alternative',
    Icon: Scale,
    badge: 'border-zinc-600/40 bg-zinc-800/60 text-zinc-300',
    rule: 'border-zinc-700/60',
    accent: 'text-zinc-300'
  }
}

export function ComparisonCard({ report, className }: ComparisonCardProps) {
  const tier = TIER_META[report.tier]
  const TierIcon = tier.Icon
  const hasEvidence = Boolean(report.competitorScreenshot)
  const alternativeTags = [tier.label, ...report.categories.slice(0, 2)]

  return (
    <Link
      href={`/compare/${report.slug}`}
      aria-label={`View the Valifye vs. ${report.competitorName} forensic takedown`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-slate-900/40 p-6 pt-7 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-zinc-700',
        'hover:shadow-[0_0_40px_-18px_rgba(16,185,129,0.45)]',
        className
      )}
    >
      <span
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-current opacity-[0.04] blur-3xl"
        aria-hidden
      />

      <header className="relative flex min-h-[6.5rem] flex-col justify-start gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Valifye vs.
          </span>
          <h3 className="font-serif text-2xl font-black leading-tight tracking-tight text-zinc-50 transition-colors group-hover:text-white">
            {report.competitorName}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {alternativeTags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]',
                idx === 0
                  ? 'border-emerald-500/40 bg-zinc-900 text-emerald-300'
                  : 'border-emerald-500/25 bg-zinc-900 text-zinc-300'
              )}
            >
              {idx === 0 ? <TierIcon className="h-3 w-3" /> : null}
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="relative mt-5 flex flex-1 flex-col">
        {report.verdictSummary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
            {report.verdictSummary}
          </p>
        )}

        {report.pricingGap && (
          <div
            className={cn(
              'mt-5 border-t pt-4',
              tier.rule
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/90">
              Pricing Gap
            </p>
            <p className="mt-1 font-serif text-2xl font-black uppercase tracking-tight text-amber-400 tabular-nums">
              <strong>{report.pricingGap}</strong>
            </p>
          </div>
        )}
      </div>

      <footer className="relative mt-6 flex items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
        {hasEvidence ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Evidence Indexed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <Camera className="h-3 w-3" />
            Audit Brief
          </span>
        )}

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300 transition-all',
            'group-hover:border-emerald-400/60 group-hover:bg-emerald-500/[0.12] group-hover:text-emerald-100'
          )}
        >
          View Full Takedown
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </Link>
  )
}
