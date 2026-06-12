import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Crosshair, ExternalLink } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { WhitespaceScore } from '@/components/ui/WhitespaceScore'
import {
  getProfitableNicheBySlug,
  profitableNichePath,
  type ProfitableNicheCompetitor,
  type ProfitableNichePage
} from '@/lib/profitableNicheData'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${profitableNichePath(slug)}`
}

function formatWhitespaceScore(score: number): string {
  const clamped = Math.min(10, Math.max(0, Number.isFinite(score) ? score : 0))
  return (Math.round(clamped * 10) / 10).toFixed(1)
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(' ')}.`
}

function buildHeroIntro(row: ProfitableNichePage): string {
  const score = formatWhitespaceScore(row.whitespace_score)
  const opening = `${row.verdict} — ${row.niche_name} has a whitespace score of ${score}/10 with ${row.demand_signal} demand and ${row.competition_level} competition.`
  const followUp =
    row.meta_description.trim() ||
    `Entry requires navigating ${row.entry_barrier.toLowerCase()} barriers while competing in a ${row.market_size.toLowerCase()} market.`
  return truncateWords(`${opening} ${followUp}`, 50)
}

function formatPricing(low: number, high: number): string {
  const lo = Number.isFinite(low) ? Math.round(low) : 0
  const hi = Number.isFinite(high) ? Math.round(high) : 0
  if (lo <= 0 && hi <= 0) return '—'
  if (lo === hi) return `$${lo}/mo`
  return `$${lo}–$${hi}/mo`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getProfitableNicheBySlug(slug)

  if (!row) {
    return {
      title: 'Profitable Niche Analysis | Valifye',
      description: 'Forensic profitability analysis for founders.'
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

export default async function ProfitableNichePage({ params }: Props) {
  const { slug } = await params
  const row = await getProfitableNicheBySlug(slug)

  if (!row) notFound()

  const year = new Date().getFullYear()
  const url = pageUrl(row.slug)
  const heroIntro = buildHeroIntro(row)
  const faqAccordionItems = row.faq.map((item) => ({
    q: item.question,
    a: item.answer
  }))

  const faqSchema =
    row.faq.length > 0 ? generateFaqSchema(row.faq) : null
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
        <MetricsTable row={row} />
        <AttractiveAndRisks row={row} />
        <CompetitorLandscape competitors={row.top_competitors} />
        {row.opportunity_angle ? (
          <OpportunityAngle text={row.opportunity_angle} />
        ) : null}
        <CommonMistakes items={row.common_mistakes} />
        <CtaBlock nicheName={row.niche_name} />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="profitable"
          currentSlug={row.slug}
          cityOrNiche={row.niche_name}
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
  row: ProfitableNichePage
  year: number
  intro: string
}) {
  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <Crosshair className="h-3.5 w-3.5" aria-hidden />
        Forensic Analysis · {row.verdict} Verdict
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Is {row.niche_name} Profitable?{' '}
        <span className="text-amber-400">({year} Analysis)</span>
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {intro}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            Valifye Verdict
          </p>
          <VerdictBadge verdict={row.verdict} size="lg" />
        </div>
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          <WhitespaceScore score={row.whitespace_score} size="lg" />
        </div>
      </div>
    </header>
  )
}

function MetricsTable({ row }: { row: ProfitableNichePage }) {
  const rows = [
    { label: 'Market Size', value: row.market_size },
    { label: 'Competition', value: row.competition_level },
    {
      label: 'Avg Pricing',
      value: formatPricing(row.avg_pricing_low, row.avg_pricing_high)
    },
    { label: 'Demand Signal', value: row.demand_signal },
    { label: 'Entry Barrier', value: row.entry_barrier },
    {
      label: 'Whitespace Score',
      value: `${formatWhitespaceScore(row.whitespace_score)}/10`
    }
  ] as const

  return (
    <section
      aria-labelledby="key-metrics-heading"
      className="space-y-4"
    >
      <h2
        id="key-metrics-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500"
      >
        Key Market Metrics
      </h2>
      <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
        <table className="w-full border-collapse text-left">
          <tbody>
            {rows.map((entry, index) => (
              <tr
                key={entry.label}
                className={cn(
                  index > 0 && 'border-t border-zinc-800/90'
                )}
              >
                <th
                  scope="row"
                  className="w-[42%] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 md:px-6 md:py-4"
                >
                  {entry.label}
                </th>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-zinc-100 md:px-6 md:py-4">
                  {entry.value}
                </td>
              </tr>
            ))}
            <tr className="border-t border-zinc-800/90">
              <th
                scope="row"
                className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 md:px-6 md:py-4"
              >
                Valifye Verdict
              </th>
              <td className="px-4 py-3 md:px-6 md:py-4">
                <VerdictBadge verdict={row.verdict} size="sm" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AttractiveAndRisks({ row }: { row: ProfitableNichePage }) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          Why This Niche Is Attractive
        </h2>
        {row.why_attractive.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.why_attractive.map((item) => (
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
          <p className="text-sm text-zinc-500">No attractiveness signals indexed.</p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          The Risks
        </h2>
        {row.risks.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.risks.map((item) => (
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
          <p className="text-sm text-zinc-500">No risk signals indexed.</p>
        )}
      </div>
    </section>
  )
}

function CompetitorLandscape({
  competitors
}: {
  competitors: ProfitableNicheCompetitor[]
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Who You&apos;re Competing Against
      </h2>
      {competitors.length === 0 ? (
        <p className="text-sm text-zinc-500">No competitor dossiers indexed.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {competitors.map((competitor) => (
            <article
              key={`${competitor.name}-${competitor.url}`}
              className="flex h-full flex-col gap-3 rounded-lg border border-zinc-800 bg-slate-900/40 p-6 transition-colors hover:border-zinc-700"
            >
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-zinc-100">
                {competitor.name}
              </h3>
              {competitor.url ? (
                <a
                  href={competitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-amber-400/90 transition-colors hover:text-amber-300"
                >
                  {competitor.url.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ) : null}
              <p className="mt-auto font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Pricing
              </p>
              <p className="font-mono text-sm font-semibold text-zinc-200">
                {competitor.pricing}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function OpportunityAngle({ text }: { text: string }) {
  return (
    <section
      aria-labelledby="opportunity-angle-heading"
      className="space-y-4 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 md:px-10 md:py-10"
    >
      <h2
        id="opportunity-angle-heading"
        className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
      >
        The Whitespace Angle
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {text}
      </p>
    </section>
  )
}

function CommonMistakes({ items }: { items: string[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Common Mistakes Entering This Market
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No common mistakes indexed.</p>
      ) : (
        <ol className="space-y-4 border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex gap-4 text-sm leading-relaxed text-zinc-400"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function CtaBlock({ nicheName }: { nicheName: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Run a Full Forensic Audit on This Niche
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        This page shows a standard market scan. The full audit includes competitor
        pricing architecture, demand curve analysis, local market friction, and a
        complete survival checklist.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Start Free Audit
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
        Target niche · {nicheName}
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
