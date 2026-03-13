export const revalidate = 86400

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValidationBlueprintDashboard } from '@/components/market/ValidationBlueprint'
import { BenchmarkingModule } from '@/components/market/BenchmarkingModule'
import { RelatedMarkets } from '@/components/market/RelatedMarkets'
import { CityHubSidebar } from '@/components/market/CityHubSidebar'
import { AppConversionBridge } from '@/components/market/AppConversionBridge'
import { getIdeaBySlug } from '@/lib/marketData'

type Props = { params: Promise<{ slug: string }> }

const LOCAL_INTELLIGENCE_CITIES = ['Austin', 'Miami', 'London', 'Denver', 'Seattle', 'Nashville'] as const

/** Generate local report slug: [niche-part]-[city-slug]-market-audit */
function localReportSlug(niche: string, cityName: string): string {
  const nichePart = (niche ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'market'
  const cityPart = (cityName ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'city'
  return `${nichePart}-${cityPart}-market-audit`
}

/** Deep-clone and filter array fields to only string elements to avoid dirty data crashes */
function sanitizeIdeaData(rawIdea: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rawIdea)) {
    if (Array.isArray(value)) {
      out[key] = value.filter((item): item is string => typeof item === 'string')
    } else if (value !== null && typeof value === 'object') {
      out[key] = sanitizeIdeaData(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out
}

export default async function IdeaDossierPage({ params }: Props) {
  const { slug } = await params
  const raw = await getIdeaBySlug(slug)

  if (!raw) {
    notFound()
  }

  const idea = sanitizeIdeaData(raw as unknown as Record<string, unknown>) as unknown as typeof raw
  const hasBlueprint = Array.isArray(idea.local_friction) && idea.local_friction.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* TOP BAR */}
      <header className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-[11px] hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to archive
        </Link>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-2">
            <span>Validation blueprint for</span>
            <span className="text-foreground">{idea.niche} in {idea.city}</span>
          </span>
          {idea.region && (
            <Link
              href={`/countries/${encodeURIComponent(idea.region.toLowerCase())}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:border-primary hover:text-primary"
            >
              <span>{idea.region}</span>
            </Link>
          )}
        </div>
      </header>

      {/* PRIMARY BLUEPRINT DASHBOARD / FALLBACK */}
      {hasBlueprint ? (
        <ValidationBlueprintDashboard idea={idea} />
      ) : (
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground">
            Deep Validation Pending
          </h1>
          <p className="text-sm text-muted-foreground">
            This market has a legacy narrative but has not yet been fully converted into a thick Validation Blueprint.
            The current summary below is based on earlier research and will be upgraded with forensic local friction,
            GTM, and economic gauges in a future run.
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {idea.market_narrative}
          </p>
        </section>
      )}

      {/* CITY KNOWLEDGE GRAPH: Benchmarking + Related Markets + City Hub */}
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            <BenchmarkingModule
              currentCityScore={idea.opportunity_score}
              niche={idea.niche}
              region={idea.region ?? ''}
            />
          </div>
          <RelatedMarkets
            currentNiche={idea.niche}
            currentCity={idea.city}
            currentRegion={idea.region ?? ''}
          />
        </div>

        <CityHubSidebar currentCity={idea.city} currentNiche={idea.niche} />
      </section>

        <AppConversionBridge niche={idea.niche} city={idea.city} />

        {/* Forensic Local Intelligence */}
        <section className="space-y-6 border-t border-border pt-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">
            Forensic Local Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Explore deep-dive market audits for this niche across major economic hubs.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOCAL_INTELLIGENCE_CITIES.map((cityName) => {
              const reportSlug = localReportSlug(
                typeof idea.niche === 'string' ? idea.niche : String(idea.niche ?? ''),
                cityName
              )
              return (
                <Link
                  key={cityName}
                  href={`/local-reports/report/${reportSlug}`}
                  className="flex flex-col gap-2 bg-zinc-900/50 border border-zinc-800 p-4 transition-all hover:border-primary"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-semibold uppercase tracking-wide">{cityName}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    View Forensic Audit ›
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <ValifyeFooter />
    </div>
  )
}

