'use client'

import { useMemo, useState } from 'react'
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
  city_name: string
  region: string | null
  report_count: number | null
  top_reports: TopReport[] | null
}

type Props = {
  initialHubs: LocalCityHubRow[]
}

function citySlug(city: string) {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CityDirectoryClient({ initialHubs }: Props) {
  const [query, setQuery] = useState('')

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
        {/* Top SEO CTA banner */}
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

        {/* Header */}
        <header className="flex flex-col gap-6 border border-border bg-card px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase tracking-[0.25em] text-foreground sm:text-3xl">
              Local Market Intelligence Hubs
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Browse cached pSEO hubs by city. Each hub aggregates programmatic SEO audits for one metro area so you can
              see where Valifye has already run forensic scans.
            </p>
          </div>

          {/* Search / filter */}
          <div className="w-full max-w-sm">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Filter by City
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Denver, Mumbai, London"
                className="h-10 w-full border border-border bg-background pl-9 pr-3 text-xs uppercase tracking-[0.15em] text-foreground outline-none transition-colors placeholder:text-[10px] placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </header>

        {/* Grid of city hubs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            <span>{filteredHubs.length} City Hubs</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <Activity className="h-3 w-3" />
              System Live
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredHubs.map((hub) => {
              const reports = Array.isArray(hub.top_reports) ? hub.top_reports : []
              const reportCount =
                typeof hub.report_count === 'number' && Number.isFinite(hub.report_count)
                  ? hub.report_count
                  : reports.length

              return (
                <article
                  key={hub.city_name}
                  className="flex flex-col justify-between border border-border bg-card p-5 text-xs shadow-[0_0_0_1px_hsl(var(--border))] transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {hub.city_name}
                          {hub.region ? `, ${hub.region}` : null}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        Audits{' '}
                        <span className="font-black text-foreground">
                          {reportCount}
                        </span>
                      </span>
                    </div>

                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                      Local pSEO hub for {hub.city_name}
                    </h2>

                    {reports.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-muted-foreground">
                        {reports.slice(0, 2).map((r) => (
                          <li key={r.slug} className="line-clamp-1">
                            {r.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                      Open City Hub
                    </span>
                    <Link
                      href={`/local-reports/city/${citySlug(hub.city_name)}`}
                      className="inline-flex items-center gap-1 border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      View Hub
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Bottom SEO CTA banner */}
        <section className="mt-4 border border-border bg-card px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground shadow-[4px_4px_0_0_hsl(var(--primary))]">
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
              Open Valifye Engine
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}

