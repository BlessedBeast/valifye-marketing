import Link from 'next/link'
import { ArrowRight, Activity, Zap } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getIndustryHubs } from '@/lib/reportData'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sectorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

export default async function IndustryDirectoryPage() {
  const hubs = await getIndustryHubs()

  const hasHubs = Array.isArray(hubs) && hubs.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <ValifyeNavbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header / Breadcrumb */}
        <header className="flex flex-col gap-4 border border-zinc-800 bg-zinc-900/60 px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Industry Intelligence Map
            </p>
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-zinc-50 sm:text-3xl">
              Forensic Sector Hubs
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
              Browse validation activity by industry. Each card is a sector-level hub that aggregates published forensic
              verdicts and integrity scores.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>Global Directory · Industry Layer</span>
          </div>
        </header>

        {/* Directory Grid */}
        <section className="space-y-4">
          {!hasHubs ? (
            <div className="border border-emerald-500/60 bg-zinc-950 px-6 py-10 text-center text-xs uppercase tracking-[0.2em] text-zinc-100">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                <Zap className="h-6 w-6 text-emerald-400" />
                <span className="text-sm font-black tracking-[0.25em]">
                  Scanning Industries...
                </span>
                <p className="text-[11px] normal-case text-zinc-400">
                  The verdict_industry_hubs table is currently empty. Once the bridge jobs complete, this directory will
                  auto-populate with sector hubs.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                <span>{hubs.length} Industry Hubs</span>
                <span className="inline-flex items-center gap-2 text-emerald-400">
                  <Activity className="h-3 w-3" />
                  System Live
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hubs.map((hub) => {
                  const industry = hub.industry_name || 'Unlabeled'
                  const count = Number(hub.report_count) || 0
                  const slug = sectorSlug(industry)

                  return (
                    <article
                      key={industry}
                      className="flex flex-col justify-between border border-zinc-800 bg-zinc-900 px-5 py-4 text-xs shadow-[0_0_0_1px_hsl(var(--border))] transition-all hover:-translate-y-1 hover:border-emerald-500 hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                    >
                      <div className="mb-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                            {industry}
                          </span>
                          <span className="rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            {count} files
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                        <span>View Sector</span>
                        <Link
                          href={`/reports/industry/${slug}`}
                          className="inline-flex items-center gap-1 text-emerald-400 transition-colors hover:text-emerald-300"
                        >
                          Open Hub
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}

