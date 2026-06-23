import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import { MetricsBadge } from '@/components/ui/MetricsBadge'
import type { MetricsBadgeVariant } from '@/components/ui/MetricsBadge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { WhitespaceScore } from '@/components/ui/WhitespaceScore'
import {
  getAllIndiaLocalOpportunitySlugs,
  getIndiaLocalOpportunityBySlug,
  indiaLocalOpportunityPath,
  type BestNiche,
  type LocalOpportunityPage,
  type SectorToAvoid,
  type TopSector
} from '@/lib/indiaLocalOpportunityData'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { generateLocalPlaceSchema } from '@/lib/seo/generateLocalPlaceSchema'
import { SITE_URL } from '@/lib/seo'

export const dynamicParams = true

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await getAllIndiaLocalOpportunitySlugs()
  return slugs.map((s) => ({ slug: s }))
}

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${indiaLocalOpportunityPath(slug)}`
}

function formatScore(score: number): string {
  const clamped = Math.min(10, Math.max(0, Number.isFinite(score) ? score : 0))
  return (Math.round(clamped * 10) / 10).toFixed(1)
}

function opportunityLevelVariant(level: string): MetricsBadgeVariant {
  const lower = level.toLowerCase()
  if (
    /high|strong|open|hot|excellent|favorable|growth/.test(lower)
  ) {
    return 'positive'
  }
  if (/low|saturat|crowded|weak|poor|avoid|declin/.test(lower)) {
    return 'negative'
  }
  return 'neutral'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaLocalOpportunityBySlug(slug)

  if (!row) {
    return {
      title: 'Local Startup Opportunities | Valifye',
      description: 'Forensic local market opportunity intelligence for founders.'
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

export default async function LocalOpportunityPage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[PSEO DEBUG] table: india_local_opportunity_pages | raw params:`, resolvedParams)
  const { slug } = resolvedParams
  console.log(`[PSEO DEBUG] extracted slug: "${slug}"`)
  const cleanSlug = decodeURIComponent(slug).trim()
  const row = await getIndiaLocalOpportunityBySlug(slug)
  console.log(
    `[PSEO DEBUG] query slug: "${cleanSlug}" | result:`,
    row ? `FOUND (id: ${String((row as Record<string, unknown>).id ?? row.slug)})` : 'NULL — will 404'
  )

  if (!row) notFound()

  const url = pageUrl(row.slug)
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
  const placeSchema = generateLocalPlaceSchema({
    cityName: row.city_name,
    stateOrCountry: row.state_or_country,
    description: row.meta_description || row.intro_text,
    url
  })

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      <JsonLdSchema schema={articleSchema} />
      <JsonLdSchema schema={placeSchema} />

      <article className="space-y-16">
        <HeroSection row={row} />
        <CitySnapshot row={row} />
        <TopSectors sectors={row.top_sectors} />
        <BestNiches niches={row.best_niches_to_build} cityName={row.city_name} />
        <SectorsToAvoid
          sectors={row.sectors_to_avoid}
          cityName={row.city_name}
        />
        {row.notable_companies.length > 0 ? (
          <NotableCompanies
            cityName={row.city_name}
            companies={row.notable_companies}
          />
        ) : null}
        <CtaBlock cityName={row.city_name} />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="local"
          currentSlug={row.slug}
          cityOrNiche={row.city_name}
          suggestedVerticalSlugs={row.top_sectors.map((sector) => sector.name)}
        />
        {row.faq.length > 0 ? (
          <FaqSection faqs={faqAccordionItems} />
        ) : null}
      </article>
    </MarketingShell>
  )
}

function HeroSection({ row }: { row: LocalOpportunityPage }) {
  const location = row.state_or_country
    ? `${row.city_name}, ${row.state_or_country}`
    : row.city_name

  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        Local Market Intelligence · {row.year} Forensic Scan
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Startup Opportunities in{' '}
        <span className="text-amber-400">{location}</span>{' '}
        <span className="text-zinc-400">({row.year})</span>
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.intro_text}
      </p>

      <div className="max-w-xl rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <WhitespaceScore
          score={row.overall_opportunity_score}
          size="lg"
          label="Overall Opportunity Score"
        />
      </div>
    </header>
  )
}

function CitySnapshot({ row }: { row: LocalOpportunityPage }) {
  const cards = [
    { label: 'Startup Ecosystem', value: row.startup_ecosystem },
    { label: 'Cost of Living', value: row.cost_of_living },
    { label: 'Tech Talent', value: row.tech_talent_availability },
    {
      label: 'Overall Score',
      value: `${formatScore(row.overall_opportunity_score)}/10`
    }
  ] as const

  return (
    <section
      aria-labelledby="city-snapshot-heading"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <h2 id="city-snapshot-heading" className="sr-only">
        City Snapshot
      </h2>
      {cards.map((card) => (
        <div
          key={card.label}
          className="space-y-2 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-5"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            {card.label}
          </p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            {card.value || '—'}
          </p>
        </div>
      ))}
    </section>
  )
}

function TopSectors({ sectors }: { sectors: TopSector[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Best Sectors to Build In Right Now
      </h2>
      {sectors.length === 0 ? (
        <p className="text-sm text-zinc-500">No sector dossiers indexed.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sectors.map((sector) => (
            <article
              key={sector.name}
              className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-black text-zinc-50 md:text-2xl">
                  {sector.name}
                </h3>
                <MetricsBadge
                  label="Opportunity"
                  value={sector.opportunity_level}
                  variant={opportunityLevelVariant(sector.opportunity_level)}
                />
              </div>
              <p className="text-sm leading-relaxed text-zinc-400">
                {sector.reasoning || 'No sector reasoning indexed.'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function BestNiches({
  niches,
  cityName
}: {
  niches: BestNiche[]
  cityName: string
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Specific Niches Worth Entering in {cityName}
      </h2>
      {niches.length === 0 ? (
        <p className="text-sm text-zinc-500">No niche recommendations indexed.</p>
      ) : (
        <div className="space-y-6">
          {niches.map((niche) => (
            <article
              key={niche.name}
              className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8"
            >
              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
                  {niche.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <VerdictBadge verdict={niche.verdict} size="sm" />
                  <div className="min-w-[200px] flex-1">
                    <WhitespaceScore
                      score={niche.whitespace_score}
                      size="sm"
                      label="Whitespace"
                    />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
                  {niche.reason}
                </p>
                {niche.idea_slug ? (
                  <Link
                    href={`/ideas/${niche.idea_slug}`}
                    className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-amber-400/90 transition-colors hover:text-amber-300"
                  >
                    See Full Analysis
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function SectorsToAvoid({
  sectors,
  cityName
}: {
  sectors: SectorToAvoid[]
  cityName: string
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        What to Avoid in {cityName}
      </h2>
      {sectors.length === 0 ? (
        <p className="text-sm text-zinc-500">No avoid signals indexed.</p>
      ) : (
        <ul className="space-y-4 border border-red-500/20 bg-red-500/[0.04] p-6 md:p-8">
          {sectors.map((item) => (
            <li key={item.sector} className="space-y-2">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-red-300">
                {item.sector}
              </p>
              {item.reason ? (
                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.reason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NotableCompanies({
  cityName,
  companies
}: {
  cityName: string
  companies: string[]
}) {
  return (
    <section
      aria-labelledby="notable-companies-heading"
      className="rounded-lg border border-zinc-700/60 bg-zinc-900/50 px-5 py-4"
    >
      <p
        id="notable-companies-heading"
        className="font-mono text-sm leading-relaxed text-zinc-300"
      >
        <span className="font-bold uppercase tracking-[0.12em] text-zinc-500">
          Context ·{' '}
        </span>
        Companies that launched from {cityName}:{' '}
        <span className="text-zinc-100">{companies.join(', ')}</span>
      </p>
    </section>
  )
}

function CtaBlock({ cityName }: { cityName: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Validate a {cityName} Startup Idea
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        This page is a local opportunity scan. The full forensic audit maps
        competitor density, pricing gaps, and demand signals for your exact niche
        in {cityName}.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Run Forensic Audit
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
