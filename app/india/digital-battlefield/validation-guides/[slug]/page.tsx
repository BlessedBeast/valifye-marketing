import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { RelatedIntelligence } from '@/components/seo/RelatedIntelligence'
import {
  getAllIndiaValidationGuideSlugs,
  getIndiaValidationGuideBySlug,
  indiaValidationGuidePath,
  type MentionedTool,
  type ValidationGuidePage,
  type ValidationGuideStep
} from '@/lib/indiaValidationGuideData'
import {
  formatIsoDuration,
  generateHowToSchema
} from '@/lib/seo/generateHowToSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const dynamicParams = true

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllIndiaValidationGuideSlugs()
  return slugs.map((s) => ({ slug: s }))
}

type Props = { params: Promise<{ slug: string }> }

const VALIFYE_TOOL: MentionedTool = {
  name: 'Valifye',
  url: 'https://app.valifye.com',
  pricing: 'Free'
}

function pageUrl(slug: string): string {
  return `${SITE_URL}${indiaValidationGuidePath(slug)}`
}

function pricingBadgeVariant(
  pricing: string
): 'positive' | 'neutral' | 'negative' {
  const lower = pricing.toLowerCase()
  if (lower.includes('free')) return 'positive'
  if (lower.includes('paid') || lower.includes('$')) return 'negative'
  return 'neutral'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaValidationGuideBySlug(slug)

  if (!row) {
    return {
      title: 'Validation Guide | Valifye',
      description: 'Forensic startup validation frameworks for founders.'
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

export default async function ValidationGuidePage({ params }: Props) {
  const resolvedParams = await params
  console.log(`[PSEO DEBUG] table: india_validation_guide_pages | raw params:`, resolvedParams)
  const { slug } = resolvedParams
  console.log(`[PSEO DEBUG] extracted slug: "${slug}"`)
  const cleanSlug = decodeURIComponent(slug).trim()
  const row = await getIndiaValidationGuideBySlug(slug)
  console.log(
    `[PSEO DEBUG] query slug: "${cleanSlug}" | result:`,
    row ? `FOUND (id: ${String((row as Record<string, unknown>).id ?? row.slug)})` : 'NULL — will 404'
  )

  if (!row) notFound()

  const faqAccordionItems = row.faq.map((item) => ({
    q: item.question,
    a: item.answer
  }))

  const faqSchema = row.faq.length > 0 ? generateFaqSchema(row.faq) : null
  const howToSchema =
    row.steps.length > 0
      ? generateHowToSchema(
          row.guide_title,
          row.steps.map((step) => ({
            name: step.title,
            text: step.description,
            position: step.step_number
          })),
          {
            description: row.meta_description,
            totalTime: formatIsoDuration(row.time_to_validate)
          }
        )
      : null

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      {howToSchema ? <JsonLdSchema schema={howToSchema} /> : null}

      <article className="space-y-16">
        <HeroSection row={row} />
        <SuccessDefinition row={row} />
        <ValidationSteps steps={row.steps} />
        <CommonMistakes items={row.common_mistakes} />
        <ToolsMentioned tools={row.tools_mentioned} />
        <CtaBlock />
        <RelatedIntelligence
          relatedIdeaSlugs={row.related_idea_slugs}
          relatedToolSlugs={row.related_tool_slugs}
          currentPageType="validation"
          currentSlug={row.slug}
          cityOrNiche={row.startup_type}
        />
        {row.faq.length > 0 ? (
          <FaqSection faqs={faqAccordionItems} />
        ) : null}
      </article>
    </MarketingShell>
  )
}

function HeroSection({ row }: { row: ValidationGuidePage }) {
  const startupLabel = row.startup_type
    ? row.startup_type.toUpperCase()
    : 'FOUNDER'

  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <BookOpen className="h-3.5 w-3.5" aria-hidden />
        Validation Framework · {startupLabel} Edition
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        {row.guide_title}
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.intro_text}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {row.time_to_validate ? (
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
            Time to validate: {row.time_to_validate}
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
          {row.steps.length} steps
        </span>
      </div>
    </header>
  )
}

function SuccessDefinition({ row }: { row: ValidationGuidePage }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        What Does &apos;Validated&apos; Actually Mean?
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.success_definition || 'No success definition indexed.'}
      </p>
      {row.success_signals.length > 0 ? (
        <div className="space-y-4 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
            Signs You&apos;re Validated
          </h3>
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {row.success_signals.map((signal) => (
              <li key={signal} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  aria-hidden
                />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function ValidationSteps({ steps }: { steps: ValidationGuideStep[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        The {steps.length}-Step Validation Process
      </h2>
      {steps.length === 0 ? (
        <p className="text-sm text-zinc-500">No validation steps indexed.</p>
      ) : (
        <div className="space-y-6">
          {steps.map((step) => (
            <StepCard key={`${step.step_number}-${step.title}`} step={step} />
          ))}
        </div>
      )}
    </section>
  )
}

function StepCard({ step }: { step: ValidationGuideStep }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <div className="flex flex-col gap-5 p-6 md:flex-row md:gap-8 md:p-8">
        <span
          className="font-mono text-4xl font-black tabular-nums text-amber-400/90 md:text-5xl"
          aria-hidden
        >
          {String(step.step_number).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <h3 className="font-serif text-2xl font-black text-zinc-50 md:text-3xl">
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
            {step.description}
          </p>
          {step.time_required ? (
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Time required: {step.time_required}
            </p>
          ) : null}
          {step.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {step.tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex rounded-md border border-zinc-600/40 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-zinc-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : null}
          {step.output ? (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3 font-mono text-sm text-emerald-200">
              After this step you have: {step.output}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function CommonMistakes({ items }: { items: string[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Mistakes That Kill the Validation Process
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

function ToolsMentioned({ tools }: { tools: MentionedTool[] }) {
  const allTools = [
    ...tools,
    ...(tools.some((tool) => tool.name.toLowerCase() === 'valifye')
      ? []
      : [VALIFYE_TOOL])
  ]

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Tools Referenced in This Guide
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allTools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </section>
  )
}

function ToolCard({ tool }: { tool: MentionedTool }) {
  const isValifye = tool.name.toLowerCase() === 'valifye'
  const variant = pricingBadgeVariant(tool.pricing)

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3 rounded-lg border p-5',
        isValifye
          ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
          : 'border-zinc-800 bg-slate-900/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-sm font-bold uppercase tracking-[0.12em] text-zinc-100">
          {tool.name}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded-md border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide',
            variant === 'positive' &&
              'border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-200',
            variant === 'negative' &&
              'border-red-500/40 bg-red-500/[0.08] text-red-200',
            variant === 'neutral' &&
              'border-zinc-600/40 bg-zinc-800/60 text-zinc-300'
          )}
        >
          {tool.pricing}
        </span>
      </div>
      {isValifye ? (
        <p className="text-sm leading-relaxed text-zinc-400">
          Forensic market audit — free to start
        </p>
      ) : null}
      {tool.url ? (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 font-mono text-xs text-amber-400/90 transition-colors hover:text-amber-300"
        >
          {tool.url.replace(/^https?:\/\//, '')}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        </a>
      ) : null}
    </article>
  )
}

function CtaBlock() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Skip the Guesswork — Get a Forensic Audit
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        Instead of validating manually, run a Valifye audit and get a
        BUILD/PIVOT/KILL verdict with competitor data in 60 seconds.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Audit My Idea Free
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
