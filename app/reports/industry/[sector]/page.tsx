import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Scale, Zap } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getIndustryHubBySectorSlug, getReportsBySlugs } from '@/lib/reportData'

export const dynamic = 'force-dynamic'
export const revalidate = 600

type Props = { params: Promise<{ sector: string }> }

export default async function IndustryReportsPage({ params }: Props) {
  const { sector } = await params
  const hub = await getIndustryHubBySectorSlug(sector)

  if (!hub) {
    notFound()
  }

  const topSlugs = new Set(hub.top_verdicts.map((v) => v.slug))
  const otherSlugs = hub.all_slugs.filter((s) => !topSlugs.has(s))
  const otherReports = await getReportsBySlugs(otherSlugs)

  const verdictClass = (v: string) => {
    const upper = v.toUpperCase()
    if (upper.includes('KILL')) return 'border-red-500/50 bg-red-950/50 text-red-200'
    if (upper.includes('BUILD')) return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
    return 'border-amber-500/50 bg-amber-950/30 text-amber-200'
  }

  const formatScore = (score: number) =>
    Number.isFinite(score) ? `${score}/100` : '—'

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Backlink */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Return to Global Directory
          </Link>
          <span className="inline-flex items-center gap-1 text-primary">
            <Zap className="h-3 w-3" />
            Sector Hub
          </span>
        </div>

        {/* Hero */}
        <header className="border border-zinc-800 bg-zinc-950 px-6 py-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Industry Sector
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.3em] text-zinc-50 sm:text-3xl">
            {hub.industry_name}
          </h1>
          <p className="mt-3 text-xs text-zinc-400">
            {hub.report_count} forensic audits indexed in this sector.
          </p>
        </header>

        {/* High-Integrity Picks */}
        {hub.top_verdicts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span>High-Integrity Picks</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hub.top_verdicts.map((v) => (
                <Link
                  key={v.slug}
                  href={`/reports/${v.slug}`}
                  className="group flex flex-col justify-between border border-zinc-800 bg-zinc-950 px-5 py-4 text-left text-xs transition-all hover:-translate-y-1 hover:border-emerald-500 hover:bg-zinc-950/90"
                >
                  <div className="mb-4 space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-50 line-clamp-2 group-hover:text-emerald-400">
                      {v.title}
                    </h2>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        Integrity
                      </span>
                      <span className="text-zinc-100">
                        {v.score != null && Number.isFinite(v.score) ? `${v.score}/100` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    <span>Open Forensic Report</span>
                    <ArrowRight className="h-3 w-3 text-emerald-400" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Index of other reports */}
        {otherReports.length > 0 && (
          <section className="space-y-4 border border-zinc-800 bg-zinc-950 px-6 py-5">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              The Index
            </div>
            <div className="divide-y divide-zinc-800 text-xs">
              {otherReports.map((report) => (
                <Link
                  key={report.slug}
                  href={`/reports/${report.slug}`}
                  className="flex items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-black/40"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${verdictClass(
                          report.final_verdict
                        )}`}
                      >
                        <Scale className="h-3 w-3" />
                        {report.final_verdict}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-semibold text-zinc-100">
                      {report.idea_title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-[10px] text-zinc-400">
                    <span>Score</span>
                    <span className="font-bold text-zinc-100">
                      {formatScore(report.overall_integrity_score)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {hub.top_verdicts.length === 0 && otherReports.length === 0 && (
          <section className="border border-zinc-800 bg-zinc-950 px-6 py-6 text-center text-xs text-zinc-400">
            No published reports found for this sector yet.
          </section>
        )}
      </main>
      <ValifyeFooter />
    </div>
  )
}

