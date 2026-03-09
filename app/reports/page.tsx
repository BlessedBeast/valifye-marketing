import Link from 'next/link'
import { ArrowRight, FileText, Scale, Zap } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getReportsList } from '@/lib/reportData'

export const revalidate = 600

export default async function ReportsDirectoryPage() {
  const reports = await getReportsList(50)

  const formatScore = (score: number) =>
    Number.isFinite(score) ? `${score}/100` : '—'

  const verdictClass = (v: string) => {
    if (v === 'KILL') return 'border-red-500/50 bg-red-950/50 text-red-200'
    if (v === 'BUILD') return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
    return 'border-amber-500/50 bg-amber-950/30 text-amber-200'
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border border-border bg-card px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-foreground bg-background">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Validation Reports
              </p>
              <h1 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
                Forensic Verdicts
              </h1>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span>{reports.length} Reports Indexed</span>
            <span className="inline-flex items-center gap-2 text-primary">
              <Zap className="h-3 w-3" /> System Live
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {reports.length === 0 ? (
              <div className="col-span-full border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No validation reports yet. Run the verdict pipeline to generate forensic reports.
              </div>
            ) : (
              reports.map((report) => (
                <Link
                  key={report.slug}
                  href={`/reports/${report.slug}`}
                  className="group flex flex-col justify-between border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${verdictClass(
                          report.final_verdict
                        )}`}
                      >
                        <Scale className="h-3 w-3" />
                        {report.final_verdict}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        {formatScore(report.overall_integrity_score)}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold leading-snug tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {report.idea_title}
                    </h2>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Integrity Score</span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      Open Report
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
      <ValifyeFooter />
    </div>
  )
}
