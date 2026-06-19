import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Crosshair, X } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { WhitespaceScore } from '@/components/ui/WhitespaceScore'
import {
  buildVerdictToBadge,
  getAllIndiaShouldIBuildSlugs,
  getIndiaShouldIBuildBySlug,
  indiaShouldIBuildPath,
  type BuildStep,
  type ExistingSolution,
  type ShouldIBuildPage
} from '@/lib/indiaShouldIBuildData'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { generateHowToSchema } from '@/lib/seo/generateHowToSchema'
import { SITE_URL } from '@/lib/seo'

export const dynamicParams = false

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllIndiaShouldIBuildSlugs()
  return slugs.map((s) => ({ slug: s }))
}

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${indiaShouldIBuildPath(slug)}`
}

function formatWhitespaceScore(score: number): string {
  const clamped = Math.min(10, Math.max(0, Number.isFinite(score) ? score : 0))
  return (Math.round(clamped * 10) / 10).toFixed(1)
}

function buildVerdictLead(row: ShouldIBuildPage): string {
  const score = formatWhitespaceScore(row.whitespace_score)

  if (row.verdict === 'No') {
    return `No — Valifye's analysis rates ${row.product_name} as a KILL with a ${score}/10 whitespace score. Here's why.`
  }

  if (row.verdict === 'Yes — If') {
    const condition =
      row.verdict_condition ||
      'you commit to a differentiated wedge from day one'
    return `Yes, but only if ${condition}. The market exists but requires a specific angle to be worth entering.`
  }

  const conditionSuffix = row.verdict_condition
    ? ` with ${row.verdict_condition}`
    : ''
  return `Yes — you should build ${row.product_name}. Valifye rates this a ${score}/10 whitespace score${conditionSuffix}.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaShouldIBuildBySlug(slug)

  if (!row) {
    return {
      title: 'Should I Build This? | Valifye',
      description: 'Forensic build-decision intelligence for founders.'
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

export default async function ShouldIBuildPage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[PSEO DEBUG] table: india_should_i_build_pages | raw params:`, resolvedParams)
  const { slug } = resolvedParams
  console.log(`[PSEO DEBUG] extracted slug: "${slug}"`)
  const cleanSlug = decodeURIComponent(slug).trim()
  const row = await getIndiaShouldIBuildBySlug(slug)
  console.log(
    `[PSEO DEBUG] query slug: "${cleanSlug}" | result:`,
    row ? `FOUND (id: ${String((row as Record<string, unknown>).id ?? row.slug)})` : 'NULL — will 404'
  )

  if (!row) notFound()

  const year = new Date().getFullYear()
  const url = pageUrl(row.slug)
  const verdictLead = buildVerdictLead(row)
  const badgeVerdict = buildVerdictToBadge(row.verdict)
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
  const howToSchema =
    row.first_three_steps.length > 0
      ? generateHowToSchema(
          `How to Start Building ${row.product_name}`,
          row.first_three_steps
        )
      : null

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      <JsonLdSchema schema={articleSchema} />
      {howToSchema ? <JsonLdSchema schema={howToSchema} /> : null}

      <article className="space-y-16">
        <HeroSection
          row={row}
          year={year}
          verdictLead={verdictLead}
          badgeVerdict={badgeVerdict}
        />
        <ContextGrid row={row} />
        <ProblemSection text={row.problem_being_solved} />
        <BuildDecisionGrid row={row} />
        {row.existing_solutions.length > 0 ? (
          <ExistingSolutions solutions={row.existing_solutions} />
        ) : null}
        {row.advantage_needed ? (
          <AdvantageNeeded text={row.advantage_needed} />
        ) : null}
        {row.ideal_founder_profile ? (
          <IdealFounder text={row.ideal_founder_profile} />
        ) : null}
        {row.first_three_steps.length > 0 ? (
          <FirstThreeSteps steps={row.first_three_steps} />
        ) : null}
        {row.key_risks.length > 0 ? (
          <KeyRisks risks={row.key_risks} />
        ) : null}
        <CtaBlock productName={row.product_name} />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="should-build"
          currentSlug={row.slug}
          cityOrNiche={row.product_name}
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
  verdictLead,
  badgeVerdict
}: {
  row: ShouldIBuildPage
  year: number
  verdictLead: string
  badgeVerdict: ReturnType<typeof buildVerdictToBadge>
}) {
  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <Crosshair className="h-3.5 w-3.5" aria-hidden />
        Build Decision Analysis · Valifye Verdict
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        Should I Build {row.product_name}?{' '}
        <span className="text-amber-400">(Honest {year} Analysis)</span>
      </h1>

      <p className="max-w-3xl text-sm font-semibold leading-relaxed text-zinc-200 md:text-base">
        {verdictLead}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            Valifye Verdict
          </p>
          <VerdictBadge verdict={badgeVerdict} size="lg" />
        </div>
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          <WhitespaceScore score={row.whitespace_score} size="lg" />
        </div>
      </div>
    </header>
  )
}

function ContextGrid({ row }: { row: ShouldIBuildPage }) {
  const cards = [
    { label: 'Market Size', value: row.market_size },
    { label: 'Target Audience', value: row.target_audience },
    { label: 'Time to MVP', value: row.estimated_time_to_mvp },
    { label: 'Time to Revenue', value: row.estimated_time_to_revenue }
  ] as const

  return (
    <section
      aria-labelledby="context-grid-heading"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <h2 id="context-grid-heading" className="sr-only">
        Build Context
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

function ProblemSection({ text }: { text: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        The Problem
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {text || 'No problem statement indexed.'}
      </p>
    </section>
  )
}

function BuildDecisionGrid({ row }: { row: ShouldIBuildPage }) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          Reasons to Build
        </h2>
        {row.reasons_to_build.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.reasons_to_build.map((item) => (
              <li key={item} className="flex gap-3">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No build signals indexed.</p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        <h2 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
          Reasons Not to Build
        </h2>
        {row.reasons_not_to_build.length > 0 ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.reasons_not_to_build.map((item) => (
              <li key={item} className="flex gap-3">
                <X
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No kill signals indexed.</p>
        )}
      </div>
    </section>
  )
}

function ExistingSolutions({
  solutions
}: {
  solutions: ExistingSolution[]
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Existing Solutions and Their Weaknesses
      </h2>
      <div className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800/90">
              <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 md:px-6">
                Solution
              </th>
              <th className="px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90 md:px-6">
                Weakness · Opportunity Signal
              </th>
            </tr>
          </thead>
          <tbody>
            {solutions.map((solution) => (
              <tr
                key={solution.name}
                className="border-t border-zinc-800/90 align-top"
              >
                <td className="px-4 py-4 font-mono text-sm font-semibold text-zinc-100 md:px-6">
                  {solution.name}
                </td>
                <td className="px-4 py-4 md:px-6">
                  <span className="inline-block rounded-md border border-emerald-500/40 bg-emerald-500/[0.08] px-3 py-2 font-mono text-sm text-emerald-200">
                    {solution.weakness}
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

function AdvantageNeeded({ text }: { text: string }) {
  return (
    <section
      aria-labelledby="advantage-heading"
      className="space-y-4 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 md:px-10 md:py-10"
    >
      <h2
        id="advantage-heading"
        className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
      >
        What You Need to Win
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {text}
      </p>
    </section>
  )
}

function IdealFounder({ text }: { text: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Who Should Build This
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {text}
      </p>
    </section>
  )
}

function FirstThreeSteps({ steps }: { steps: BuildStep[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        If You Decide to Build — Start Here
      </h2>
      <ol className="space-y-4 border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        {steps.map((step, index) => (
          <li key={step.name} className="flex gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="space-y-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-zinc-100">
                {step.name}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function KeyRisks({ risks }: { risks: string[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Risks to Know Before You Start
      </h2>
      <ol className="space-y-4 border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        {risks.map((risk, index) => (
          <li
            key={risk}
            className="flex gap-4 text-sm leading-relaxed text-zinc-400"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-400/90">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{risk}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function CtaBlock({ productName }: { productName: string }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Get a Full Forensic Audit Before You Commit
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        This page is a structured build-decision scan. The full audit stress-tests
        your assumptions with live competitor data, demand curves, and a complete
        survival checklist.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Audit This Idea Free
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
        Product · {productName}
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
