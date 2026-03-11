import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Scale, Zap, Activity } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getIndustryHubBySectorSlug, getReportsBySlugs } from '@/lib/reportData'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Forced fresh for data-integrity

type Props = { params: Promise<{ sector: string }> }

export default async function IndustryReportsPage({ params }: Props) {
  const { sector } = await params
  
  // 1. Fetch Hub with the new .ilike and JSON-Parsing logic
  const hub = await getIndustryHubBySectorSlug(sector)

  if (!hub) {
    notFound()
  }

  // 2. Data Preparation - Ensure slugs are valid strings
  const topReportsList = Array.isArray(hub.top_verdicts) ? hub.top_verdicts : []
  const topSlugs = new Set(topReportsList.map((v) => v.slug))
  
  const allSlugsList = Array.isArray(hub.all_slugs) ? hub.all_slugs : []
  const otherSlugs = allSlugsList.filter((s) => s && !topSlugs.has(s))
  
  // 3. Parallel Fetch for indexed reports
  const otherReports = otherSlugs.length > 0 ? await getReportsBySlugs(otherSlugs) : []

  const verdictClass = (v: string) => {
    const upper = (v || '').toUpperCase()
    if (upper.includes('KILL')) return 'border-red-500/50 bg-red-950/50 text-red-200'
    if (upper.includes('BUILD')) return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
    return 'border-amber-500/50 bg-amber-950/30 text-amber-200'
  }

  const formatScore = (score: number | null | undefined) =>
    score != null && Number.isFinite(score) ? `${Math.round(score)}/100` : '—'

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <ValifyeNavbar />
      
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Global Forensic Directory
          </Link>
          <span className="inline-flex items-center gap-2 text-primary">
            <Activity className="h-3 w-3" />
            Sector Live Hub
          </span>
        </div>

        {/* Hero Section */}
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
                {hub.report_count || otherReports.length + topReportsList.length} REPORTS INDEXED
              </span>
            </div>
          </div>
        </header>

        {/* 1. High-Conviction "Top Verdicts" */}
        {topReportsList.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              High-Conviction Audits
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topReportsList.map((v) => (
                <Link
                  key={v.slug}
                  href={`/reports/${v.slug}`}
                  className="group flex flex-col justify-between border border-zinc-800 bg-zinc-950 p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-50 group-hover:text-primary">
                      {v.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                      <span>INTEGRITY SCORE</span>
                      <span className="text-zinc-100">{formatScore(v.score)}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-bold text-zinc-500">
                    <span className="group-hover:text-primary">OPEN AUDIT</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. The Full Sector Index */}
        {otherReports.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Secondary Intelligence Index
            </h2>
            <div className="border border-zinc-800 bg-zinc-900/30 divide-y divide-zinc-800">
              {otherReports.map((report) => (
                <Link
                  key={report.slug}
                  href={`/reports/${report.slug}`}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <span className={`inline-block border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${verdictClass(report.final_verdict)}`}>
                      {report.final_verdict}
                    </span>
                    <p className="text-xs font-bold text-zinc-200">{report.idea_title}</p>
                  </div>
                  <div className="flex items-center gap-6 text-[10px] font-bold">
                    <div className="flex flex-col items-end">
                      <span className="text-zinc-600 uppercase">Integrity</span>
                      <span className="text-zinc-200">{formatScore(report.overall_integrity_score)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-700" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Empty State Fallback */}
        {topReportsList.length === 0 && otherReports.length === 0 && (
          <div className="border border-amber-500/50 bg-amber-950/20 p-8 text-center">
            <Zap className="mx-auto mb-3 h-6 w-6 text-amber-500" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">
              No verified reports found in this sector yet.
            </p>
            <p className="mt-2 text-[10px] normal-case text-amber-500/70">
              The pSEO factory is currently processing new batches for {hub.industry_name}.
            </p>
          </div>
        )}
      </main>

      <ValifyeFooter />
    </div>
  )
}