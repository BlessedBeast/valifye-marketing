import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Crosshair, Sparkles } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { WhitespaceScore } from '@/components/ui/WhitespaceScore'
import {
  getAllIndiaSaasIdeasVerticalSlugs,
  getIndiaSaasIdeasVerticalBySlug,
  indiaSaasIdeasVerticalPath,
  type SaasIdeasVerticalPage,
  type SaasVerticalIdea
} from '@/lib/indiaSaasIdeasVerticalData'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { generateItemListSchema } from '@/lib/seo/generateItemListSchema'
import { SITE_URL } from '@/lib/seo'

export const dynamicParams = false

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllIndiaSaasIdeasVerticalSlugs()
  return slugs.map((s) => ({ slug: s }))
}

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${indiaSaasIdeasVerticalPath(slug)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaSaasIdeasVerticalBySlug(slug)

  if (!row) {
    return {
      title: 'Best SaaS Ideas | Valifye',
      description: 'Forensic SaaS idea intelligence for founders.'
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

export default async function SaasIdeasVerticalPage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[PSEO DEBUG] table: india_saas_ideas_vertical_pages | raw params:`, resolvedParams)
  const { slug } = resolvedParams
  console.log(`[PSEO DEBUG] extracted slug: "${slug}"`)
  const cleanSlug = decodeURIComponent(slug).trim()
  const row = await getIndiaSaasIdeasVerticalBySlug(slug)
  console.log(
    `[PSEO DEBUG] query slug: "${cleanSlug}" | result:`,
    row ? `FOUND (id: ${String((row as Record<string, unknown>).id ?? row.slug)})` : 'NULL — will 404'
  )

  if (!row) notFound()

  const year = new Date().getFullYear()
  const faqAccordionItems = row.faq.map((item) => ({
    q: item.question,
    a: item.answer
  }))

  const faqSchema = row.faq.length > 0 ? generateFaqSchema(row.faq) : null
  const itemListSchema =
    row.ideas.length > 0
      ? generateItemListSchema(
          `${row.vertical_name} SaaS Ideas`,
          row.ideas.map((idea) => ({
            title: idea.title,
            one_liner: idea.one_liner
          }))
        )
      : null

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      {itemListSchema ? <JsonLdSchema schema={itemListSchema} /> : null}

      <article className="space-y-16">
        <HeroSection row={row} year={year} />
        <TopPickCallout row={row} />
        <IdeasList ideas={row.ideas} />
        <WhyThisVertical row={row} />
        <CtaBlock verticalName={row.vertical_name} />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="vertical"
          currentSlug={row.slug}
          cityOrNiche={row.vertical_name}
          contentIdeaSlugs={row.ideas
            .map((idea) => idea.idea_slug)
            .filter((slug): slug is string => Boolean(slug))}
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
  year
}: {
  row: SaasIdeasVerticalPage
  year: number
}) {
  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <Crosshair className="h-3.5 w-3.5" aria-hidden />
        Forensic Intelligence · {row.ideas.length} Ideas Analyzed
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Best SaaS Ideas for{' '}
        <span className="text-amber-400">{row.vertical_name}</span>{' '}
        <span className="text-zinc-400">({year})</span>
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.intro_text}
      </p>

      {row.vertical_market_size ? (
        <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
          {row.vertical_market_size} total market
        </span>
      ) : null}
    </header>
  )
}

function TopPickCallout({ row }: { row: SaasIdeasVerticalPage }) {
  if (!row.top_pick_title && !row.top_pick_reason) return null

  return (
    <section
      aria-labelledby="top-pick-heading"
      className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-950/80 p-[1px] shadow-[0_0_60px_-20px_rgba(16,185,129,0.45)]"
    >
      <div className="relative rounded-[15px] border border-emerald-500/20 bg-zinc-950/90 px-6 py-8 md:px-10 md:py-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08)_0%,transparent_55%)]"
          aria-hidden
        />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400/90">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Top Pick
          </p>
          <h2
            id="top-pick-heading"
            className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
          >
            #1 Pick: {row.top_pick_title}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            {row.top_pick_reason}
          </p>
        </div>
      </div>
    </section>
  )
}

function IdeasList({ ideas }: { ideas: SaasVerticalIdea[] }) {
  if (ideas.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
          Ranked SaaS Ideas
        </h2>
        <p className="text-sm text-zinc-500">No ideas indexed for this vertical.</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h2 className="sr-only">Ranked SaaS Ideas</h2>
      <div className="space-y-6">
        {ideas.map((idea, index) => (
          <IdeaCard key={`${idea.title}-${index}`} idea={idea} rank={index + 1} />
        ))}
      </div>
    </section>
  )
}

function IdeaCard({ idea, rank }: { idea: SaasVerticalIdea; rank: number }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4 md:gap-6">
          <span
            className="font-mono text-3xl font-black tabular-nums text-amber-400/90 md:text-4xl"
            aria-label={`Rank ${rank}`}
          >
            {String(rank).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1 space-y-4">
            <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
              {idea.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <VerdictBadge verdict={idea.verdict} size="sm" />
              <div className="min-w-[200px] flex-1">
                <WhitespaceScore
                  score={idea.whitespace_score}
                  size="sm"
                  label="Whitespace"
                />
              </div>
            </div>
          </div>
        </div>

        {idea.one_liner ? (
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            {idea.one_liner}
          </p>
        ) : null}

        <div className="grid gap-3 border border-zinc-800/90 bg-zinc-900/40 sm:grid-cols-3">
          <DataCell label="Target Audience" value={idea.target_audience} />
          <DataCell label="Market Size" value={idea.market_size} />
          <DataCell label="Competition" value={idea.competition} />
        </div>

        {idea.why_now ? (
          <p className="border-l-2 border-amber-500/40 pl-4 text-sm leading-relaxed text-zinc-400">
            {idea.why_now}
          </p>
        ) : null}

        {idea.idea_slug ? (
          <Link
            href={`/ideas/${idea.idea_slug}`}
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-amber-400/90 transition-colors hover:text-amber-300"
          >
            See Full Analysis
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 px-4 py-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="font-mono text-sm font-semibold text-zinc-100">
        {value || '—'}
      </p>
    </div>
  )
}

function WhyThisVertical({ row }: { row: SaasIdeasVerticalPage }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Why Build for {row.vertical_name} Right Now
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.why_this_vertical || 'No vertical timing analysis indexed.'}
      </p>
    </section>
  )
}

function CtaBlock({ verticalName }: { verticalName: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Validate Your {verticalName} SaaS Idea
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
          Run Free Audit
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
        Target vertical · {verticalName}
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
