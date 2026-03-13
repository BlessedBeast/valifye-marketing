'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import type { ValidationReport } from '@/lib/reportData'

const BATCH_SIZE = 50

function verdictClass(v: string) {
  const upper = (v || '').toUpperCase()
  if (upper.includes('KILL')) return 'border-red-500/50 bg-red-950/50 text-red-200'
  if (upper.includes('BUILD')) return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
  return 'border-amber-500/50 bg-amber-950/30 text-amber-200'
}

function formatScore(score: number | null | undefined) {
  return score != null && Number.isFinite(score) ? `${Math.round(score)}/100` : '—'
}

function hasHighConfidence(report: ValidationReport | null): boolean {
  if (!report?.experiment_data || typeof report.experiment_data !== 'object') return false
  const aeo = (report.experiment_data as { aeo_meta?: { score?: number } })?.aeo_meta
  return typeof aeo?.score === 'number' && aeo.score > 75
}

function ReportCard({
  slug,
  report,
}: {
  slug: string
  report: ValidationReport | null
}) {
  const title = report?.idea_title ?? slug
  return (
    <Link
      href={`/reports/${slug}`}
      className="group flex flex-col justify-between border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))] sm:p-5"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {report && (
            <span
              className={`inline-block border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${verdictClass(report.final_verdict)}`}
            >
              {report.final_verdict}
            </span>
          )}
          {hasHighConfidence(report) && (
            <span className="inline-block border border-emerald-500/50 bg-emerald-950/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-200">
              High Confidence
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-50 line-clamp-2 group-hover:text-primary">
          {title}
        </h3>
        {report && (
          <div className="text-[10px] font-bold text-zinc-500">
            <span className="text-zinc-100">{formatScore(report.overall_integrity_score)}</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-bold text-zinc-500">
        <span className="group-hover:text-primary">OPEN AUDIT</span>
        <ArrowRight className="h-3 w-3 text-primary" />
      </div>
    </Link>
  )
}

type LoadMoreProps = {
  remainingSlugs: string[]
  fetchReports: (slugs: string[]) => Promise<ValidationReport[]>
}

export function LoadMoreReports({ remainingSlugs, fetchReports }: LoadMoreProps) {
  const [loadedCount, setLoadedCount] = useState(0)
  const [reportMap, setReportMap] = useState<Map<string, ValidationReport>>(new Map())
  const [loading, setLoading] = useState(false)

  const hasMore = loadedCount < remainingSlugs.length

  const loadNext = async () => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const nextBatch = remainingSlugs.slice(loadedCount, loadedCount + BATCH_SIZE)
      const reports = await fetchReports(nextBatch)
      setReportMap((prev) => {
        const next = new Map(prev)
        reports.forEach((r) => next.set(r.slug, r))
        return next
      })
      setLoadedCount((c) => c + nextBatch.length)
    } finally {
      setLoading(false)
    }
  }

  const visibleSlugs = remainingSlugs.slice(0, loadedCount)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSlugs.map((slug) => (
          <ReportCard key={slug} slug={slug} report={reportMap.get(slug) ?? null} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={loadNext}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-200 transition-colors hover:border-primary hover:bg-zinc-800 hover:text-primary disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>Load more ({remainingSlugs.length - loadedCount} remaining)</>
            )}
          </button>
        </div>
      )}
    </>
  )
}
