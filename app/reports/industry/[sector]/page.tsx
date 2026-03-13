import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Zap, Activity } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getIndustryHubBySectorSlug, getReportsBySlugs } from '@/lib/reportData'
import type { ValidationReport } from '@/lib/reportData'
import { fetchReportsBySlugs } from './actions'
import { LoadMoreReports } from './LoadMoreReports'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const INITIAL_PAGE_SIZE = 50

type Props = { params: Promise<{ sector: string }> }

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

export default async function IndustryReportsPage({ params }: Props) {
  const { sector } = await params

  const hub = await getIndustryHubBySectorSlug(sector)
  if (!hub) notFound()

  const allSlugs = Array.isArray(hub.all_slugs) ? hub.all_slugs.filter((s) => s && typeof s === 'string') : []
  const initialSlugs = allSlugs.slice(0, INITIAL_PAGE_SIZE)
  const remainingSlugs = allSlugs.slice(INITIAL_PAGE_SIZE)

  const initialReports = initialSlugs.length > 0 ? await getReportsBySlugs(initialSlugs) : []
  const reportBySlug = new Map<string, ValidationReport>(initialReports.map((r) => [r.slug, r]))

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <ValifyeNavbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/reports" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
            <ArrowLeft className="h-3 w-3" />
            Global Forensic Directory
          </Link>
          <span className="inline-flex items-center gap-2 text-primary">
            <Activity className="h-3 w-3" />
            Sector Live Hub
          </span>
        </div>

        <header className="border border-zinc-800 bg-zinc-900/50 px-6 py-8 shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">
              Intelligence Sector
            </p>
            <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-zinc-50">
              {hub.industry_name}
            </h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="bg-zinc-800 px-3 py-1 text-[10px] font-bold text-emerald-400">
                {allSlugs.length} REPORTS INDEXED
              </span>
            </div>
          </div>
        </header>

        {allSlugs.length === 0 ? (
          <div className="border border-amber-500/50 bg-amber-950/20 p-8 text-center">
            <Zap className="mx-auto mb-3 h-6 w-6 text-amber-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
              No verified reports found in this sector yet.
            </p>
            <p className="mt-2 text-[10px] normal-case text-amber-500/70">
              The pSEO factory is currently processing new batches for {hub.industry_name}.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              All sector reports
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {initialSlugs.map((slug) => {
                const report = reportBySlug.get(slug) ?? null
                const title = report?.idea_title ?? slug
                return (
                  <Link
                    key={slug}
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
              })}
            </div>
            {remainingSlugs.length > 0 && (
              <div className="mt-6">
                <LoadMoreReports remainingSlugs={remainingSlugs} fetchReports={fetchReportsBySlugs} />
              </div>
            )}
          </section>
        )}
      </main>

      <ValifyeFooter />
    </div>
  )
}
