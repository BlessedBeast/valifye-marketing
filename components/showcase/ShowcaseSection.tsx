import type { ReactNode } from 'react'
import { ShowcaseCard } from '@/components/showcase/ShowcaseCard'
import { cn } from '@/lib/utils'
import type { MarketingShowcaseReport } from '@/lib/marketingShowcase'

type ShowcaseSectionProps = {
  title: string
  description?: string
  accentClassName?: string
  iconColorClassName?: string
  icon?: ReactNode
  reports: MarketingShowcaseReport[]
  emptyState?: string
}

export function ShowcaseSection({
  title,
  description,
  accentClassName,
  iconColorClassName,
  icon,
  reports,
  emptyState = 'No audits indexed yet for this category.'
}: ShowcaseSectionProps) {
  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="space-y-2">
          <div
            className={cn(
              'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em]',
              accentClassName ?? 'text-primary'
            )}
          >
            {icon && (
              <span className={cn('inline-flex', iconColorClassName)}>
                {icon}
              </span>
            )}
            {title}
          </div>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <span className="self-start text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 md:self-end">
          {reports.length}{' '}
          {reports.length === 1 ? 'forensic audit' : 'forensic audits'}
        </span>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-800 bg-slate-900/30 px-6 py-8 text-center text-sm text-zinc-500">
          {emptyState}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ShowcaseCard key={report.slug} report={report} />
          ))}
        </div>
      )}
    </section>
  )
}
