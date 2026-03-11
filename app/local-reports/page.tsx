'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Activity, ArrowRight } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

type LocalReport = {
  slug: string
  niche: string
  city: string
  stateOrRegion: string
  logicScore: number
  verdict: 'BUILD' | 'PIVOT' | 'KILL'
}

const MOCK_LOCAL_REPORTS: LocalReport[] = [
  {
    slug: 'boutique-fitness-denver-co',
    niche: 'Boutique Fitness Studio',
    city: 'Denver',
    stateOrRegion: 'CO',
    logicScore: 82,
    verdict: 'BUILD',
  },
  {
    slug: 'cold-storage-logistics-mumbai',
    niche: 'Cold Storage Logistics Hub',
    city: 'Mumbai',
    stateOrRegion: 'India',
    logicScore: 41,
    verdict: 'PIVOT',
  },
  {
    slug: 'b2b-saas-legal-billing-berlin',
    niche: 'B2B Legal Billing SaaS',
    city: 'Berlin',
    stateOrRegion: 'Germany',
    logicScore: 26,
    verdict: 'KILL',
  },
  {
    slug: 'neighborhood-coffee-roastery-austin-tx',
    niche: 'Neighborhood Coffee Roastery',
    city: 'Austin',
    stateOrRegion: 'TX',
    logicScore: 68,
    verdict: 'PIVOT',
  },
  {
    slug: 'senior-care-marketplace-london',
    niche: 'Senior Care Home Marketplace',
    city: 'London',
    stateOrRegion: 'UK',
    logicScore: 79,
    verdict: 'BUILD',
  },
]

function verdictClasses(v: LocalReport['verdict']) {
  if (v === 'KILL') {
    return 'border-red-700 bg-red-950 text-red-200'
  }
  if (v === 'BUILD') {
    return 'border-emerald-600 bg-emerald-950 text-emerald-200'
  }
  return 'border-amber-600 bg-amber-950 text-amber-200'
}

export default function LocalReportsPage() {
  const [query, setQuery] = useState('')

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_LOCAL_REPORTS
    return MOCK_LOCAL_REPORTS.filter((r) => {
      const cityMatch = `${r.city} ${r.stateOrRegion}`.toLowerCase()
      const nicheMatch = r.niche.toLowerCase()
      return cityMatch.includes(q) || nicheMatch.includes(q)
    })
  }, [query])

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
              Local Market Intelligence Database
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
              Browse our repository of AI-generated local market audits. See exactly how Valifye dissects local competition and signal quality before anyone commits code or capital.
            </p>
          </div>

          {/* Search / filter */}
          <div className="w-full max-w-sm">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Filter by City or Niche
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Denver, Boutique Fitness, Mumbai"
                className="h-10 w-full border border-border bg-background pl-9 pr-3 text-xs uppercase tracking-[0.15em] text-foreground outline-none transition-colors placeholder:text-[10px] placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </header>

        {/* Grid of reports */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            <span>{filteredReports.length} Local Reports</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <Activity className="h-3 w-3" />
              System Live
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const verdictClass = verdictClasses(report.verdict)
              return (
                <article
                  key={report.slug}
                  className="flex flex-col justify-between border border-border bg-card p-5 text-xs shadow-[0_0_0_1px_hsl(var(--border))] transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
                >
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {report.city}, {report.stateOrRegion}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        Logic Score{' '}
                        <span className="font-black text-foreground">
                          {report.logicScore}
                          <span className="opacity-50">/100</span>
                        </span>
                      </span>
                    </div>

                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
                      {report.niche} in {report.city}, {report.stateOrRegion}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-2 border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${verdictClass}`}
                    >
                      {report.verdict}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                      Forensic Market Audit
                    </span>
                    <Link
                      href={`/local-reports/report/${report.city.toLowerCase()}`}
                      className="inline-flex items-center gap-1 border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      View Full Market Audit
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

