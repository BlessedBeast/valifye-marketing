'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Activity, ArrowRight } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

type TopReport = {
  slug: string
  title: string
  score: number | null
}

export type LocalCityHubRow = {
  id: string
  city_name: string
  region: string | null
  report_count: number | null
  top_reports: any
}

type Props = {
  initialHubs: LocalCityHubRow[]
}

export function CityDirectoryClient({ initialHubs }: Props) {
  const [query, setQuery] = useState('')

  // Forensic Debugging: Check the terminal/console to see exactly what we got
  useEffect(() => {
    console.log('📡 Client Received Hubs:', initialHubs.length)
    if (initialHubs.length > 0) {
      console.log('📝 Sample Data Structure:', typeof initialHubs[0].top_reports)
    }
  }, [initialHubs])

  const filteredHubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return initialHubs
    return initialHubs.filter((hub) => {
      const label = `${hub.city_name} ${hub.region ?? ''}`.toLowerCase()
      return label.includes(q)
    })
  }, [initialHubs, query])

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Banner: Engine CTA */}
        <section className="border border-border bg-card px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <p className="max-w-2xl">
              Don&apos;t see your city? Run a live 800m forensic scan for your exact address right now.
            </p>
            <a
              href="https://app.valifye.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Launch Live Engine
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </section>

        {/* Header Section */}
        <header className="flex flex-col gap-6 border border-border bg-card px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase tracking-[0.25em] text-foreground sm:text-3xl">
              Local Market Intelligence
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Programmatic SEO hubs for metropolitan metro areas. Cross-referencing Google Maps evidence with forensic integrity scores.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Filter Metropolis
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Denver, Austin"
                className="h-10 w-full border border-border bg-background pl-9 pr-3 text-xs uppercase tracking-[0.15em] text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </header>

        {/* The Grid Logic */}
        <section className="space-y-4">
          {initialHubs.length === 0 ? (
            <div className="border border-emerald-500 bg-zinc-950 px-5 py-12 text-center text-xs uppercase tracking-[0.18em] text-white">
              <div className="flex flex-col items-center gap-4">
                <Activity className="h-8 w-8 animate-pulse text-emerald-500" />
                <span className="text-lg font-black tracking-widest">Intelligence Gathering in Progress</span>
                <p className="max-w-md normal-case text-zinc-400">
                  The <code className="text-emerald-400">local_city_hubs</code> table is currently empty. Run the bridge scripts to cluster your pSEO reports.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                <span>{filteredHubs.length} Active City Hubs</span>
                <span className="flex items-center gap-2 text-emerald-500">
                  <Activity className="h-3 w-3" /> System Live
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHubs.map((hub) => {
                  // SAFE PARSE: Handle string vs array from Supabase
                  let reports: TopReport[] = []
                  try {
                    reports = typeof hub.top_reports === 'string' 
                      ? JSON.parse(hub.top_reports) 
                      : (hub.top_reports || [])
                  } catch (e) {
                    console.error('JSON Parse Error for', hub.city_name)
                  }

                  const cityPath = hub.city_name.toLowerCase().replace(/\s+/g, '-')
                  const count = hub.report_count ?? reports.length

                  return (
                    <article
                      key={hub.id || hub.city_name}
                      className="flex flex-col justify-between border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {hub.city_name}{hub.region ? `, ${hub.region}` : ''}
                          </div>
                          <span className="bg-zinc-800 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            {count} AUDITS
                          </span>
                        </div>

                        <h2 className="text-sm font-black uppercase tracking-widest">
                          {hub.city_name} Market Hub
                        </h2>

                        {reports.length > 0 && (
                          <ul className="space-y-2 text-[11px] text-muted-foreground">
                            {reports.slice(0, 3).map((r: TopReport) => (
                              <li key={r.slug} className="flex items-center gap-2 line-clamp-1 border-l-2 border-zinc-800 pl-2">
                                <span className="text-emerald-500">›</span> {r.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-8">
                        <Link
                          href={`/local-reports/city/${cityPath}`}
                          className="group flex w-full items-center justify-between border border-border bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-primary hover:text-black"
                        >
                          Access Intelligence
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
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