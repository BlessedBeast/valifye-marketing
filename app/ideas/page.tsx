import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600 // Refresh every hour

export const metadata: Metadata = {
  title: 'Startup Ideas by City & Niche | Valifye Market Intelligence',
  description:
    'Explore validated startup opportunities by industry and city. Real market size, competitor counts, and growth insights for 500+ niche/city combinations. Find your next idea.',
  openGraph: {
    title: 'Startup Ideas by City & Niche | Valifye',
    description:
      'Market analysis for 500+ startup ideas. Find where demand exists and competition is low.',
    type: 'website',
    url: 'https://valifye.com/ideas'
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://valifye.com/ideas' }
}

function getHeatConfig(heat: string) {
  switch (heat) {
    case 'Hot':
      return {
        badge: 'bg-red-500/10 text-red-400 border-red-500/20',
        dot: 'bg-red-500'
      }
    case 'Warm':
      return {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        dot: 'bg-orange-500'
      }
    default:
      return {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500'
      }
  }
}

interface MarketRow {
  slug: string
  niche: string
  city: string
  market_heat: string
  estimated_tam: string
  local_competitors: number
  market_narrative: string
  confidence: string
}

export default async function IdeasIndexPage({
  searchParams
}: {
  searchParams: { niche?: string; city?: string; heat?: string }
}) {
  let query = supabase
    .from('market_data')
    .select(
      'slug, niche, city, market_heat, estimated_tam, local_competitors, market_narrative, confidence'
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(120)

  if (searchParams.niche) {
    query = query.ilike('niche', `%${searchParams.niche}%`)
  }
  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`)
  }
  if (searchParams.heat) {
    query = query.eq('market_heat', searchParams.heat)
  }

  const { data: ideas } = await query
  const rows = (ideas || []) as MarketRow[]

  const { data: allPublished } = await supabase
    .from('market_data')
    .select('niche, city, market_heat')
    .eq('status', 'published')

  const allRows = allPublished || []
  const uniqueNiches = [...new Set(allRows.map((r) => r.niche))].sort().slice(0, 15)
  const uniqueCities = [...new Set(allRows.map((r) => r.city))].sort().slice(0, 15)
  const totalCount = allRows.length

  const activeFilter =
    searchParams.niche || searchParams.city || searchParams.heat

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        {/* Header */}
        <header className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            VALIFYE MARKET INTELLIGENCE
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Startup Ideas by City &amp; Niche
          </h1>
          <p className="text-lg text-muted-foreground">
            Real market data for {totalCount}+ startup opportunities. Find where
            customer demand is high and competition is low — before you build.
          </p>
          <p className="text-sm text-muted-foreground">
            Browse validated startup ideas by industry (SaaS, coffee shop, pet
            grooming, fitness) and city (Austin, New York, London, Bangalore).
            Each analysis includes estimated market size, local competitor
            count, and the top gaps in the market.
          </p>
        </header>

        {/* Stats Bar */}
        <section className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4">
          {[
            { value: `${totalCount}+`, label: 'Markets Analyzed' },
            { value: `${uniqueNiches.length}+`, label: 'Industries Covered' },
            { value: `${uniqueCities.length}+`, label: 'Cities Tracked' }
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Filter Pills */}
        <section className="space-y-3">
          {/* Heat Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Market Heat:
            </span>
            {['Hot', 'Warm', 'Cool'].map((heat) => {
              const config = getHeatConfig(heat)
              const isActive = searchParams.heat === heat
              return (
                <Link
                  key={heat}
                  href={isActive ? '/ideas' : `/ideas?heat=${heat}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? config.badge
                      : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                  {heat}
                </Link>
              )
            })}
          </div>

          {/* Niche Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              By Industry:
            </span>
            {uniqueNiches.map((niche) => {
              const isActive = searchParams.niche === niche
              return (
                <Link
                  key={niche}
                  href={
                    isActive
                      ? '/ideas'
                      : `/ideas?niche=${encodeURIComponent(niche)}`
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {niche}
                </Link>
              )
            })}
          </div>

          {/* City Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              By City:
            </span>
            {uniqueCities.map((city) => {
              const isActive = searchParams.city === city
              return (
                <Link
                  key={city}
                  href={
                    isActive
                      ? '/ideas'
                      : `/ideas?city=${encodeURIComponent(city)}`
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {city}
                </Link>
              )
            })}
          </div>

          {/* Clear Filter */}
          {activeFilter && (
            <Link
              href="/ideas"
              className="text-xs text-primary hover:underline"
            >
              ✕ Clear filters
            </Link>
          )}
        </section>

        {/* Ideas Grid */}
        {rows.length === 0 ? (
          <section className="space-y-2 rounded-xl border border-border bg-card p-12 text-center">
            <p className="font-medium text-foreground">No markets found</p>
            <p className="text-sm text-muted-foreground">
              Try a different filter or check back soon — we publish 100 new
              analyses daily.
            </p>
            <Link
              href="/ideas"
              className="text-sm text-primary hover:underline"
            >
              View all markets →
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((idea) => {
              const heat = getHeatConfig(idea.market_heat)
              return (
                <Link
                  key={idea.slug}
                  href={`/ideas/${idea.slug}`}
                  className="group flex flex-col space-y-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                        {idea.niche}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {idea.city}
                      </p>
                    </div>
                    <span
                      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${heat.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${heat.dot}`}
                      />
                      {idea.market_heat}
                    </span>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border bg-background p-2.5">
                      <div className="text-sm font-semibold text-foreground">
                        {idea.estimated_tam}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Market TAM
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-2.5">
                      <div className="text-sm font-semibold text-foreground">
                        {idea.local_competitors?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Competitors
                      </div>
                    </div>
                  </div>

                  {/* Narrative Snippet */}
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {idea.market_narrative}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between border-t border-border pt-1">
                    <span className="text-xs text-muted-foreground">
                      {idea.confidence === 'high'
                        ? '✓ Verified'
                        : idea.confidence === 'medium'
                        ? '~ Estimated'
                        : '⚠ Low confidence'}
                    </span>
                    <span className="text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5">
                      Analyze →
                    </span>
                  </div>
                </Link>
              )
            })}
          </section>
        )}

        {/* SEO Footer */}
        <footer className="space-y-4 border-t border-border pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: 'SaaS ideas in Austin',
                href: '/ideas?niche=B2B+SaaS&city=Austin'
              },
              { label: 'Coffee shop ideas', href: '/ideas?niche=Coffee+Shop' },
              { label: 'Hot markets', href: '/ideas?heat=Hot' },
              {
                label: 'Pet business ideas',
                href: '/ideas?niche=Pet+Grooming'
              },
              {
                label: 'London startup ideas',
                href: '/ideas?city=London'
              },
              {
                label: 'EV charging opportunities',
                href: '/ideas?niche=EV+Charging+Station'
              },
              {
                label: 'Fitness business ideas',
                href: '/ideas?niche=Online+Fitness+Coaching'
              },
              { label: 'NYC markets', href: '/ideas?city=New+York' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Valifye analyzes startup ideas across hundreds of cities and
            industries. Our market intelligence covers B2B SaaS, consumer apps,
            food and beverage, health and wellness, professional services, and
            more. Each analysis is based on real competitor data and customer
            review patterns.
          </p>

          <Link
            href="/waitlist"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Validate your own idea with Valifye →
          </Link>
        </footer>
      </div>
    </div>
  )
}

