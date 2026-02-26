import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – local client chart file is resolved by Next.js
import SaturationChart from './SaturationChart'

export const revalidate = 86400

interface Props {
  params: { slug: string }
}

function getSaturationScore(competitors: number): number {
  if (competitors > 500) return 90
  if (competitors > 200) return 70
  if (competitors > 100) return 50
  if (competitors > 50) return 30
  return 15
}

function getHeatConfig(heat: string) {
  switch (heat) {
    case 'Hot':
      return {
        dot: 'bg-red-500',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: 'Hot Market',
        border: 'border-l-red-500'
      }
    case 'Warm':
      return {
        dot: 'bg-orange-500',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        label: 'Warm Market',
        border: 'border-l-orange-500'
      }
    default:
      return {
        dot: 'bg-blue-500',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        label: 'Cool Market',
        border: 'border-l-blue-500'
      }
  }
}

export default async function IdeaPage({ params }: Props) {
  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  const heat = getHeatConfig(data.market_heat)
  const satScore = getSaturationScore(data.local_competitors)
  const complaints = Array.isArray(data.top_complaints) ? data.top_complaints : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/ideas"
            className="transition-colors hover:text-foreground"
          >
            Market Intelligence
          </Link>
          <span>/</span>
          <Link
            href={`/ideas?niche=${encodeURIComponent(data.niche)}`}
            className="transition-colors hover:text-foreground"
          >
            {data.niche}
          </Link>
          <span>/</span>
          <span className="text-foreground">{data.city}</span>
        </nav>

        {/* Hero */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${heat.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${heat.dot}`} />
              {heat.label}
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              {data.confidence === 'high'
                ? '✓ Verified Data'
                : data.confidence === 'medium'
                ? '~ Estimated Data'
                : '⚠ Low Confidence'}
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {data.niche} Business in {data.city}:
            <br />
            <span className="text-primary">Is It Worth Building?</span>
          </h1>

          <p className="text-lg leading-relaxed text-muted-foreground">
            {data.market_narrative}
          </p>

          {/* Quick stats inline — for Google crawlability */}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {data.local_competitors} competitors
            </span>
            {' · '}
            <span className="font-medium text-foreground">
              {data.estimated_tam} TAM
            </span>
            {' · '}
            <span className="font-medium text-foreground">
              {data.market_heat} demand
            </span>
            {' · '}
            <span>
              Updated{' '}
              {new Date(
                (data.updated_at as string | null) ?? (data.created_at as string)
              ).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total Addressable Market',
              value: data.estimated_tam,
              sub: 'Industry estimate',
              icon: '📊'
            },
            {
              label: 'Local Competitors',
              value: data.local_competitors?.toLocaleString(),
              sub: `In ${data.city}`,
              icon: '🏢'
            },
            {
              label: 'Market Heat',
              value: data.market_heat,
              sub: 'Demand signal',
              icon: '🌡️'
            }
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl border border-border bg-card p-5 border-l-4 ${heat.border}`}
            >
              <div className="mb-2 text-2xl">{stat.icon}</div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {stat.label}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {stat.sub}
              </div>
            </div>
          ))}
        </section>

        {/* Saturation Chart */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-base font-semibold text-foreground">
            Market Saturation Analysis
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            How crowded is the {data.niche} market in {data.city} compared to
            other markets?
          </p>
          <SaturationChart score={satScore} niche={data.niche} city={data.city} />
        </section>

        {/* Complaints */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              Why Customers Leave Existing {data.niche} Businesses in{' '}
              {data.city}
            </h2>
            <p className="text-sm text-muted-foreground">
              These are the real gaps in the market — each one is an
              opportunity for a new entrant.
            </p>
          </div>

          {complaints.length > 0 ? (
            complaints.map((complaint: string, i: number) => (
              <div
                key={`${complaint}-${i}`}
                className="flex items-start gap-4 rounded-xl border border-border border-l-4 border-l-orange-500 bg-card p-4"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-sm font-bold text-orange-400">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-foreground">{complaint}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Market gap · Sourced from customer reviews
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
              Complaint data not yet available for this market.
            </div>
          )}
        </section>

        {/* Related Markets */}
        {data.related_niches && data.related_niches.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Markets in {data.city}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(data.related_niches as string[]).map((niche: string) => {
                const relatedSlug = `${niche
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')}-in-${data.city
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')}`
                return (
                  <Link
                    key={niche}
                    href={`/ideas/${relatedSlug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    {niche}
                    <span className="text-muted-foreground">↗</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Email Gate CTA */}
        <section className="space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            JOIN 478 FOUNDERS
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Should You Actually Build This?
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Get Valifye&apos;s{' '}
            <span className="text-foreground">
              BUILD / PIVOT / KILL
            </span>{' '}
            verdict for {data.niche} in {data.city} — plus a 90-day execution
            roadmap if it&apos;s a BUILD.
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Verdict →
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Free. No credit card. Verdict delivered by email.
          </p>
        </section>

        {/* Back to Index — Internal Linking */}
        <section className="flex items-center justify-between border-t border-border pt-4">
          <Link
            href="/ideas"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Explore More Startup Ideas
          </Link>
          <span className="text-xs text-muted-foreground">
            Analyzed by Valifye Market Intelligence
          </span>
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { data } = await supabase
    .from('market_data')
    .select('niche, city, market_narrative, market_heat, estimated_tam')
    .eq('slug', params.slug)
    .single()

  if (!data) return {}

  const title = `${data.niche} Business in ${data.city} — Market Analysis 2024 | Valifye`
  const description = `Should you start a ${data.niche} in ${data.city}? ${data.market_narrative} See competitor data, market gaps, and get a BUILD/PIVOT/KILL verdict. TAM: ${data.estimated_tam}.`

  return {
    title,
    description,
    openGraph: {
      title: `${data.niche} in ${data.city}: ${data.market_heat} Market — Worth Building?`,
      description,
      type: 'article',
      url: `https://valifye.com/ideas/${params.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.niche} in ${data.city}: Is It Worth Building?`,
      description
    },
    alternates: {
      canonical: `https://valifye.com/ideas/${params.slug}`
    }
  }
}