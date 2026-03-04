import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { getCountryMarketData } from '@/lib/marketData'

type Props = { params: Promise<{ country: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params
  const decoded = decodeURIComponent(country)

  return {
    title: `Startup Opportunities in ${decoded} 2026: Forensic Market Report`,
    description: `National-level breakdown of startup opportunities in ${decoded}, including average opportunity scores, top industries, and active cities.`,
    openGraph: {
      title: `Startup Opportunities in ${decoded} 2026: Forensic Market Report`,
      description: `Forensic market report for ${decoded} with aggregated opportunity scores and city-level coverage.`,
      type: 'website',
      url: `https://valifye.com/countries/${country}`
    },
    alternates: {
      canonical: `https://valifye.com/countries/${country}`
    }
  }
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params
  const decoded = decodeURIComponent(country)

  const data = await getCountryMarketData(decoded)
  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 pt-24 space-y-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">Countries</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">{decoded}</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Startup opportunities in {decoded}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Forensic national snapshot for {decoded}: niche count, average opportunity score, and active cities.
            </p>
          </div>
          <Link
            href="/ideas/directory"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to directory
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total Niches
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {data.total_niches}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Avg. Opportunity Score
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {data.average_opportunity_score.toFixed(1)}/100
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Active Cities
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {data.city_list.length}
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Top Industries
            </h2>
            <p className="text-xs text-muted-foreground">
              Strategic archetypes dominating this country&apos;s opportunity landscape.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {data.top_industries.length === 0 && (
                <li>No archetype data available yet.</li>
              )}
              {data.top_industries.map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              Cities with published analyses
            </h2>
            <p className="text-xs text-muted-foreground">
              Each city has at least one published Validation Blueprint or market analysis.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              {data.city_list.map((city) => (
                <div
                  key={city}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1"
                >
                  <MapPin size={11} className="text-muted-foreground" />
                  <span className="truncate">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

