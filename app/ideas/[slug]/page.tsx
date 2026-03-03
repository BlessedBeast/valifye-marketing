import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { BusinessDNA } from '@/components/pseo/BusinessDNA'
import { EmailGateForm } from './EmailGateForm'
import {
  HEAT_CONFIG,
  getSaturationScore,
  getOpportunityLabel,
  getDifficultyLabel
} from '@/lib/ideaData'
import {
  getIdeaBySlug,
  getPublishedSlugs,
  getSameNicheIdeas,
  getSameCityIdeas
} from '@/lib/marketData'
import { ScoreRing } from '@/components/market/ScoreRing'
import { TrendIndicator } from '@/components/market/TrendIndicator'
import { SaturationBar } from '@/components/market/SaturationBar'
import { CityComparison } from '@/components/market/CityComparison'
import { RevenueCalculator } from '@/components/market/RevenueCalculator'
import { MarketFAQ } from '@/components/market/MarketFAQ'
import type { Metadata } from 'next'

export const revalidate = 86400

const STATIC_PARAMS_LIMIT = 100

/**
 * Pre-render the first 100 published idea pages at build time.
 */
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs(STATIC_PARAMS_LIMIT)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)

  if (!idea) return {}

  return {
    title: `${idea.niche} in ${idea.city} — Market Analysis 2026 | Valifye`,
    description: `Should you start a ${idea.niche} in ${idea.city}? ${idea.market_narrative} TAM: ${idea.estimated_tam}. ${idea.local_competitors} competitors tracked.`,
    openGraph: {
      title: `${idea.niche} in ${idea.city}: ${idea.market_heat} Market — Worth Building?`,
      description: idea.market_narrative,
      type: 'article',
      url: `https://valifye.com/ideas/${slug}`
    },
    alternates: { canonical: `https://valifye.com/ideas/${slug}` }
  }
}

export default async function IdeaSlugPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)

  if (!idea) notFound()

  const c = HEAT_CONFIG[idea.market_heat]

  const satScore = getSaturationScore(idea.local_competitors)
  const oppLabel = getOpportunityLabel(idea.opportunity_score)
  const diffLabel = getDifficultyLabel(idea.difficulty_score)

  const [sameNicheIdeas, sameCityIdeas] = await Promise.all([
    getSameNicheIdeas(slug, idea.niche),
    getSameCityIdeas(slug, idea.city)
  ])
  const relatedBySlug = new Map<string, typeof idea>()
  for (const i of [...sameNicheIdeas, ...sameCityIdeas]) {
    if (i.slug !== idea.slug) relatedBySlug.set(i.slug, i)
  }
  const related = Array.from(relatedBySlug.values()).slice(0, 12)

  const SCORE_STROKE: Record<string, string> = {
    'text-green-400': '#4ade80',
    'text-emerald-400': '#34d399',
    'text-yellow-400': '#facc15',
    'text-orange-400': '#fb923c',
    'text-red-400': '#f87171',
    'text-blue-400': '#60a5fa'
  }
  const heatStroke: Record<string, string> = {
    Hot: '#f87171',
    Warm: '#fb923c',
    Cool: '#60a5fa'
  }
  const heatTextColor: Record<string, string> = {
    Hot: 'text-red-400',
    Warm: 'text-orange-400',
    Cool: 'text-blue-400'
  }
  const heatValue: Record<string, number> = { Hot: 85, Warm: 55, Cool: 30 }

  const faqComplaints = Array.isArray(idea.top_complaints)
    ? idea.top_complaints
    : typeof (idea as any).top_complaints === 'string'
    ? [(idea as any).top_complaints as string]
    : []

  return (
    <div className="min-h-screen bg-background">
      <ValifyeNavbar />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 pt-24">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link
            href="/ideas"
            className="transition-colors hover:text-foreground"
          >
            Market Intelligence
          </Link>
          <span className="opacity-40">/</span>
          <span>{idea.niche}</span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground">{idea.city}</span>
        </nav>

        {/* HERO CARD */}
        <div
          className={`relative overflow-hidden rounded-2xl border bg-card ${c.borderClass}`}
        >
          <div className={`h-1 w-full ${c.barColor}`} />
          <div
            className={`pointer-events-none absolute right-0 top-0 h-72 w-72 bg-gradient-to-bl ${c.gradientClass} via-transparent to-transparent`}
          />

          <div className="relative space-y-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${c.badgeClass}`}
              >
                <span
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${c.dotClass}`}
                />
                {idea.market_heat}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <MapPin size={12} /> {idea.city}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold ${
                  idea.confidence === 'high'
                    ? 'text-green-400'
                    : idea.confidence === 'medium'
                    ? 'text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              >
                {idea.confidence === 'high'
                  ? '✓ Verified'
                  : idea.confidence === 'medium'
                  ? '~ Estimated'
                  : '⚠ Low confidence'}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
                {idea.niche} in {idea.city}
                <br />
                <span className="text-2xl font-normal text-muted-foreground sm:text-3xl">
                  Should you build it? Here&apos;s the data.
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                {idea.market_narrative}
              </p>
            </div>

            <TrendIndicator
              trend={idea.trend}
              pct={idea.trend_pct}
              niche={idea.niche}
              city={idea.city}
            />

            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">
                  {idea.local_competitors.toLocaleString()}
                </span>{' '}
                established competitors
              </span>
              <span>·</span>
              <span>
                <span className="font-medium text-foreground">
                  {idea.estimated_tam}
                </span>{' '}
                TAM
              </span>
              <span>·</span>
              <span>
                <span className="font-medium text-foreground">
                  {idea.top_complaints.length}
                </span>{' '}
                verified gaps
              </span>
              <span>·</span>
              <span>Updated Feb 2026</span>
            </div>
          </div>
        </div>

        {/* SCORE RINGS */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-3 gap-6 divide-x divide-border">
            <ScoreRing
              score={idea.opportunity_score}
              color={SCORE_STROKE[oppLabel.color] ?? '#4ade80'}
              textColor={oppLabel.color}
              label="Opportunity"
              sublabel={oppLabel.label}
            />
            <ScoreRing
              score={idea.difficulty_score}
              color={SCORE_STROKE[diffLabel.color] ?? '#fb923c'}
              textColor={diffLabel.color}
              label="Difficulty"
              sublabel={diffLabel.label}
            />
            <ScoreRing
              score={heatValue[idea.market_heat]}
              color={heatStroke[idea.market_heat]}
              textColor={heatTextColor[idea.market_heat]}
              label="Market Heat"
              sublabel={idea.market_heat}
            />
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              emoji: '💰',
              value: idea.estimated_tam,
              label: 'Market Size',
              sub: 'Total addressable'
            },
            {
              emoji: '🏢',
              value: idea.local_competitors.toLocaleString(),
              label: 'Competitors',
              sub: `In ${idea.city}`
            },
            {
              emoji: '📈',
              value: `${idea.trend_pct}%`,
              label: 'YoY Growth',
              sub:
                idea.trend === 'growing'
                  ? 'Accelerating'
                  : idea.trend === 'stable'
                  ? 'Stable'
                  : 'Declining'
            },
            {
              emoji: '⏱️',
              value: `~${idea.breakeven_months}mo`,
              label: 'Breakeven',
              sub: 'Estimated timeline'
            }
          ].map((s) => (
            <div
              key={s.label}
              className={`space-y-1 rounded-xl border border-border border-l-4 ${c.barColor} bg-card p-4`}
            >
              <span className="text-xl">{s.emoji}</span>
              <p className="text-2xl font-bold leading-tight text-foreground">
                {s.value}
              </p>
              <p className="text-xs font-semibold text-foreground">
                {s.label}
              </p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* SATURATION */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <p className="text-sm font-semibold text-foreground">
              Market Saturation Index
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How crowded is {idea.niche} in {idea.city} compared to other
              markets
            </p>
          </div>
          <div className="p-6">
            <SaturationBar
              score={satScore}
              niche={idea.niche}
              city={idea.city}
            />
          </div>
        </div>

        {idea.business_shape && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              Strategic Framework
            </h2>
            <BusinessDNA
              shape={idea.business_shape}
              niche={idea.niche}
              city={idea.city}
            />
          </div>
        )}

        {/* MARKET GAPS */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Market Gaps in {idea.city}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Why customers leave existing {idea.niche} businesses — each gap
                is an opportunity
              </p>
            </div>
            <span className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
              {idea.top_complaints.length} gaps found
            </span>
          </div>

          <div className="space-y-2">
            {idea.top_complaints.map((complaint, i) => (
              <div
                key={complaint}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-orange-500/40"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-xs font-bold text-orange-400">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {complaint}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Sourced from customer reviews · Confirmed gap
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-orange-400/60 transition-colors group-hover:text-orange-400">
                  Opportunity →
                </span>
              </div>
            ))}
          </div>
        </div>

        <RevenueCalculator idea={idea} />

        {sameNicheIdeas.length > 0 && (
          <CityComparison currentIdea={idea} comparisons={sameNicheIdeas} />
        )}

        <MarketFAQ idea={idea} />

        {related.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Related Markets
            </p>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ideas/${r.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
                >
                  {r.niche} in {r.city}
                  <ArrowUpRight
                    size={12}
                    className="text-muted-foreground transition-colors group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* EMAIL GATE CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative space-y-5 p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary">
                478 FOUNDERS VALIDATED WITH VALIFYE
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Should You Actually Build This?
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Get Valifye&apos;s{' '}
              <span className="font-semibold text-foreground">
                BUILD / PIVOT / KILL
              </span>{' '}
              verdict for{' '}
              <span className="font-semibold text-foreground">
                {idea.niche} in {idea.city}
              </span>{' '}
              — plus a 90-day execution roadmap if it&apos;s a BUILD.
            </p>

            <EmailGateForm niche={idea.niche} city={idea.city} />
          </div>
        </div>

        <div className="flex items-center justify-between pb-8 pt-2">
          <Link
            href="/ideas"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            All market analyses
          </Link>
          <span className="text-xs text-muted-foreground">
            Valifye Market Intelligence · {new Date().getFullYear()}
          </span>
        </div>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Dataset',
              name: `${idea.niche} in ${idea.city} — Market Dataset`,
              description: idea.market_narrative,
              url: `https://valifye.com/ideas/${slug}`,
              creator: {
                '@type': 'Organization',
                name: 'Valifye'
              },
              variableMeasured: [
                {
                  '@type': 'PropertyValue',
                  name: 'Estimated TAM',
                  value: idea.estimated_tam
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Local Competitors',
                  value: idea.local_competitors
                },
                {
                  '@type': 'PropertyValue',
                  name: 'Market Heat',
                  value: idea.market_heat
                }
              ]
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `Is ${idea.niche} in ${idea.city} a good idea?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: idea.market_narrative
                  }
                },
                {
                  '@type': 'Question',
                  name: 'How many competitors?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `There are ${idea.local_competitors.toLocaleString()} established competitors in ${idea.city} for ${idea.niche}.`
                  }
                },
                {
                  '@type': 'Question',
                  name: 'What are the complaints?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text:
                      faqComplaints.length > 0
                        ? `Top customer complaints: ${faqComplaints.join(', ')}.`
                        : 'No verified complaints are currently available for this market.'
                  }
                }
              ]
            }
          ])
        }}
      />

      <ValifyeFooter />
    </div>
  )
}
