import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Crosshair, Crown } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import { MetricsBadge } from '@/components/ui/MetricsBadge'
import { SaturationScore } from '@/components/ui/SaturationScore'
import {
  getMarketSaturationBySlug,
  marketSaturationPath,
  type MarketSaturationPage,
  type MarketSaturationPlayer
} from '@/lib/marketSaturationData'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${marketSaturationPath(slug)}`
}

function formatSaturationScore(score: number): string {
  const clamped = Math.min(10, Math.max(0, Number.isFinite(score) ? score : 0))
  return (Math.round(clamped * 10) / 10).toFixed(1)
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(' ')}.`
}

function buildHeroIntro(row: MarketSaturationPage): string {
  const score = formatSaturationScore(row.saturation_score)
  const opening = `The ${row.market_name} market is ${row.saturation_verdict} with a saturation score of ${score}/10.`
  const followUp =
    row.meta_description.trim() ||
    `Founders entering this space face ${row.competition_intensity.toLowerCase()} competition intensity. Valifye maps where incumbents are vulnerable and where new entrants still have room to maneuver.`
  return truncateWords(`${opening} ${followUp}`, 55)
}

function intensityVariant(
  intensity: string
): 'positive' | 'neutral' | 'negative' {
  const lower = intensity.toLowerCase()
  if (/low|light|fragment|open|weak/.test(lower)) return 'positive'
  if (/high|intense|saturat|crowded|entrenched|dominant/.test(lower)) {
    return 'negative'
  }
  return 'neutral'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getMarketSaturationBySlug(slug)

  if (!row) {
    return {
      title: 'Market Saturation Analysis | Valifye',
      description: 'Forensic market saturation intelligence for founders.'
    }
  }

  const canonical = pageUrl(row.slug)

  return {
    title: row.meta_title,
    description: row.meta_description,
    alternates: { canonical },
    openGraph: {
      title: row.meta_title,
      description: row.meta_description,
      type: 'article',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: row.meta_title,
      description: row.meta_description
    }
  }
}

export default async function MarketSaturationPage({ params }: Props) {
  const { slug } = await params
  const row = await getMarketSaturationBySlug(slug)

  if (!row) notFound()

  const year = new Date().getFullYear()
  const url = pageUrl(row.slug)
  const heroIntro = buildHeroIntro(row)
  const faqAccordionItems = row.faq.map((item) => ({
    q: item.question,
    a: item.answer
  }))

  const faqSchema = row.faq.length > 0 ? generateFaqSchema(row.faq) : null
  const articleSchema = generateArticleSchema({
    title: row.meta_title,
    description: row.meta_description,
    url,
    datePublished: row.date_published,
    dateModified: row.date_modified
  })

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      <JsonLdSchema schema={articleSchema} />

      <article className="space-y-16">
        <HeroSection row={row} year={year} intro={heroIntro} />
        <SaturationDisplay row={row} />
        <CrowdedAndOpportunity row={row} />
        {row.top_players.length > 0 ? (
          <TopPlayers players={row.top_players} />
        ) : null}
        {row.whitespace_angle ? (
          <WhitespaceAngle text={row.whitespace_angle} />
        ) : null}
        {row.pricing_gap_exists && row.pricing_gap_description ? (
          <PricingGap description={row.pricing_gap_description} />
        ) : null}
        {row.recent_market_shifts ? (
          <RecentShifts text={row.recent_market_shifts} />
        ) : null}
        <CtaBlock marketName={row.market_name} />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="saturation"
          currentSlug={row.slug}
          cityOrNiche={row.market_name}
        />
        {row.faq.length > 0 ? (
          <FaqSection faqs={faqAccordionItems} />
        ) : null}
      </article>
    </MarketingShell>
  )
}

function HeroSection({
  row,
  year,
  intro
}: {
  row: MarketSaturationPage
  year: number
  intro: string
}) {
  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <Crosshair className="h-3.5 w-3.5" aria-hidden />
        Market Saturation Analysis · Valifye Forensic Scan
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Is the {row.market_name} Market Too Crowded?{' '}
        <span className="text-amber-400">({year})</span>
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {intro}
      </p>
    </header>
  )
}

function SaturationDisplay({ row }: { row: MarketSaturationPage }) {
  return (
    <section
      aria-labelledby="saturation-score-heading"
      className="space-y-5 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8"
    >
      <h2 id="saturation-score-heading" className="sr-only">
        Saturation Score
      </h2>
      <SaturationScore score={row.saturation_score} size="lg" />

      {row.competition_intensity ? (
        <div className="flex flex-wrap items-center gap-2">
          <MetricsBadge
            label="Competition"
            value={row.competition_intensity}
            variant={intensityVariant(row.competition_intensity)}
          />
        </div>
      ) : null}

      {row.num_competitors != null && row.num_competitors > 0 ? (
        <p className="font-mono text-sm text-zinc-400">
          ~{row.num_competitors.toLocaleString()} active competitors
        </p>
      ) : null}

      {row.market_leader ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3">
          <Crown
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400/90">
              Market Leader
            </p>
            <p className="font-mono text-sm font-semibold text-zinc-100">
              {row.market_leader}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function CrowdedAndOpportunity({ row }: { row: MarketSaturationPage }) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          Why It&apos;s Crowded
        </h2>
        {row.reasons_its_crowded.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.reasons_its_crowded.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No crowding signals indexed.</p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          Where Opportunity Still Exists
        </h2>
        {row.where_opportunity_exists.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.where_opportunity_exists.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No opportunity signals indexed.</p>
        )}
      </div>
    </section>
  )
}

function TopPlayers({ players }: { players: MarketSaturationPlayer[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Who Dominates This Market
      </h2>
      <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800/90">
              <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 md:px-6">
                Player
              </th>
              <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 md:px-6">
                Market Share
              </th>
              <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90 md:px-6">
                Weakness · Opportunity Signal
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.name}
                className="border-t border-zinc-800/90 align-top"
              >
                <td className="px-4 py-4 font-mono text-sm font-semibold text-zinc-100 md:px-6">
                  {player.name}
                </td>
                <td className="px-4 py-4 font-mono text-sm text-zinc-300 md:px-6">
                  {player.market_share}
                </td>
                <td className="px-4 py-4 md:px-6">
                  <span className="inline-block rounded-md border border-emerald-500/40 bg-emerald-500/[0.08] px-3 py-2 font-mono text-sm text-emerald-200">
                    {player.weakness}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function WhitespaceAngle({ text }: { text: string }) {
  return (
    <section
      aria-labelledby="whitespace-angle-heading"
      className="space-y-4 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 md:px-10 md:py-10"
    >
      <h2
        id="whitespace-angle-heading"
        className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
      >
        The Gap Nobody Is Filling
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {text}
      </p>
    </section>
  )
}

function PricingGap({ description }: { description: string }) {
  return (
    <section
      aria-labelledby="pricing-gap-heading"
      className="space-y-4 border border-amber-500/25 bg-zinc-900/40 px-6 py-8 md:px-10 md:py-10"
    >
      <h2
        id="pricing-gap-heading"
        className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
      >
        The Pricing Gap
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {description}
      </p>
    </section>
  )
}

function RecentShifts({ text }: { text: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        What Changed Recently
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {text}
      </p>
    </section>
  )
}

function CtaBlock({ marketName }: { marketName: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Find the Whitespace in This Market
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        This page shows a standard saturation scan. The full forensic report maps
        competitor pricing architecture, demand curves, and the specific wedge
        where a new entrant can still win.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Get Forensic Report
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </a>
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-foreground transition hover:border-primary hover:text-primary"
        >
          Browse 500+ Pre-Analyzed Niches
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        Target market · {marketName}
      </p>
    </section>
  )
}

function FaqSection({
  faqs
}: {
  faqs: { q: string; a: string }[]
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Frequently Asked Questions
      </h2>
      <FaqAccordion faqs={faqs} />
    </section>
  )
}
