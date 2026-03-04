'use client'

import { MapPin, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CountryCityStat {
  city: string
  nicheCount: number
}

export interface CountryArchetypeStat {
  name: string
  percentage: number
}

export interface CountryTopNiche {
  slug: string
  niche: string
  city: string
  opportunity_score: number
}

export interface CountryHubDashboardProps {
  country: string
  totalNiches: number
  averageOpportunityScore: number
  cities: CountryCityStat[]
  archetypeStats: CountryArchetypeStat[]
  topNiches: CountryTopNiche[]
}

export function CountryHubDashboard({
  country,
  totalNiches,
  averageOpportunityScore,
  cities,
  archetypeStats,
  topNiches
}: CountryHubDashboardProps) {
  const heroTitle = `The 2026 ${country} Opportunity Map`

  const collectionLd = {
    '@type': 'CollectionPage',
    name: heroTitle,
    description:
      `National command center for startup and small-business niches in ${country}, with city and archetype breakdowns.`,
    about: country,
    hasPart: cities.map((c) => ({
      '@type': 'CollectionPage',
      name: `Startup niches in ${c.city}, ${country}`,
      about: c.city
    }))
  }

  const datasetLd = {
    '@type': 'Dataset',
    name: `${country} startup opportunity dataset`,
    description:
      'Aggregated metrics across cities and industries, including opportunity scores and niche counts.',
    variableMeasured: ['total_niches', 'average_opportunity_score', 'city_niche_counts', 'archetype_share'],
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'total_niches',
        value: totalNiches
      },
      {
        '@type': 'PropertyValue',
        name: 'average_opportunity_score',
        value: averageOpportunityScore
      }
    ]
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [collectionLd, datasetLd]
  }

  const maxCityNiches = cities.reduce((max, c) => Math.max(max, c.nicheCount), 1)

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        {/* Hero */}
        <section className="space-y-3 rounded-xl border border-border bg-card px-6 py-6 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            National Command Center
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A forensic overview of where founders should be hunting in {country}: which cities are active, which
            archetypes are absorbing capital, and which niches show the highest opportunity scores.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {totalNiches} validated niches
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary" />
              Avg. opportunity score {averageOpportunityScore.toFixed(1)}/100
            </span>
          </div>
        </section>

        {/* City Grid */}
        <section className="space-y-3 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              City-level opportunity map
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Each chip represents a city with at least one validated niche.
            </p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-4">
            {cities.map((c) => (
              <div
                key={c.city}
                className="flex flex-col gap-1 rounded-xl border border-border bg-background/80 px-3 py-2"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{c.city}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.nicheCount} niches</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(10, Math.round((c.nicheCount / maxCityNiches) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Archetype Heatmap + Top 10 */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* National Archetype Heatmap */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">
              National archetype heatmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Share of validated niches that fall into each strategic pillar in {country}.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              {archetypeStats.length === 0 && (
                <p className="text-muted-foreground">
                  No archetype data available yet. Run the Thick Data engine to populate national stats.
                </p>
              )}
              {archetypeStats.map((a) => (
                <div key={a.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-foreground">
                      {a.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {a.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full bg-primary',
                        a.percentage > 60 && 'bg-emerald-500',
                        a.percentage < 25 && 'bg-orange-500'
                      )}
                      style={{ width: `${Math.min(100, Math.max(5, a.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 High-Score Opportunities */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">
              Top 10 high-score opportunities
            </h2>
            <p className="text-xs text-muted-foreground">
              Niches with the highest opportunity scores across all cities in {country}.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              {topNiches.length === 0 && (
                <p className="text-muted-foreground">
                  No high-score opportunities published yet for this country.
                </p>
              )}
              {topNiches.slice(0, 10).map((n, idx) => (
                <div
                  key={n.slug}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/80 px-3 py-2"
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      #{idx + 1} · {n.city}
                    </span>
                    <span className="line-clamp-2 text-[13px] font-medium text-foreground">
                      {n.niche}
                    </span>
                  </div>
                  <span className="ml-2 text-[11px] font-semibold text-primary">
                    {n.opportunity_score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

