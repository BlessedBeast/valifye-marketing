export const revalidate = 86400

import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValidationBlueprintDashboard } from '@/components/market/ValidationBlueprint'
import { BenchmarkingModule } from '@/components/market/BenchmarkingModule'
import { RelatedMarkets } from '@/components/market/RelatedMarkets'
import { CityHubSidebar } from '@/components/market/CityHubSidebar'
import { AppConversionBridge } from '@/components/market/AppConversionBridge'
import { CityIntelligenceBridge } from '@/components/CityIntelligenceBridge'
import { getIdeaBySlug } from '@/lib/marketData'
import { createClient } from '@/utils/supabase/server'

type Props = { params: Promise<{ slug: string }> }

const LOCAL_INTELLIGENCE_CITIES = ['Austin', 'Miami', 'London', 'Denver', 'Seattle', 'Nashville'] as const

/** Local audit slugs (public_seo_reports) must use this prefix. Never link them to /reports/. */
const LOCAL_REPORT_PATH_PREFIX = '/local-reports/report'

function fixSloppySlug(slug: string): string | null {
  const cleaned = slug.replace(/([a-z0-9])in([a-z0-9])/g, '$1-in-$2')
  return cleaned !== slug ? cleaned : null
}

/** Slugify a city name: 'New York' -> 'new-york' */
function slugifyCity(cityName: string): string {
  return (cityName ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'city'
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
    const corrected = fixSloppySlug(slug)
    if (corrected) {
      const alt = await getIdeaBySlug(corrected)
      if (alt) {
        permanentRedirect(`/ideas/${corrected}`)
      }
    }
    notFound()
  }

  const idea = sanitizeIdeaData(raw as unknown as Record<string, unknown>) as unknown as typeof raw
  const hasBlueprint = Array.isArray(idea.local_friction) && idea.local_friction.length > 0

  // --- Local Intelligence slug derivation ---
  // Start from the route slug and strip any trailing city indicator:
  // e.g. 'amazon-kdp-in-new-york' -> 'amazon-kdp'
  let baseNicheSlug = slug
  // Remove pattern '-in-{city-slug}' at the end if present
  baseNicheSlug = baseNicheSlug.replace(/-in-[a-z0-9-]+$/i, '')
  // Fallback: remove any trailing 'in{city-slug}' if it wasn't hyphenated
  baseNicheSlug = baseNicheSlug.replace(/in[a-z0-9-]+$/i, '')
  // Normalize any remaining dashes
  baseNicheSlug = baseNicheSlug.replace(/-+/g, '-').replace(/^-|-$/g, '') || slug

  // Optional safety: only show cities that actually have a public SEO report for this niche
  const candidates = LOCAL_INTELLIGENCE_CITIES.map((cityName) => {
    const citySlug = slugifyCity(cityName)
    const reportSlug = `${baseNicheSlug}-${citySlug}-market-audit`
    return { cityName, reportSlug }
  })

  const supabase = createClient()
  const { data: existingReports } = await supabase
    .from('public_seo_reports')
    .select('slug')
    .in(
      'slug',
      candidates.map((c) => c.reportSlug),
    )

  const existingSlugs = new Set(
    (existingReports ?? [])
      .map((row: any) => row?.slug)
      .filter((s: any) => typeof s === 'string'),
  )

  const filteredCandidates =
    candidates.filter((c) => existingSlugs.has(c.reportSlug)) || []

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

        {/* Forensic Local Intelligence — links are public_seo_reports only; use /local-reports/report/ never /reports/ */}
        {filteredCandidates.length > 0 && (
          <section className="space-y-6 border-t border-border pt-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6">
              Forensic Local Intelligence
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Explore deep-dive market audits for this niche across major economic hubs.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map(({ cityName, reportSlug }) => (
                <Link
                  key={cityName}
                  href={`${LOCAL_REPORT_PATH_PREFIX}/${reportSlug}`}
                  className="flex flex-col gap-2 border border-border bg-card p-4 transition-all hover:border-primary hover:bg-background/80"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-semibold uppercase tracking-wide">{cityName}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    View Forensic Audit ›
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-engine city intelligence bridge */}
        <CityIntelligenceBridge
          currentCity={idea.city}
          excludeSlug={slug}
          currentNiche={idea.niche}
        />
      </main>
      <ValifyeFooter />
    </div>
  )
}

