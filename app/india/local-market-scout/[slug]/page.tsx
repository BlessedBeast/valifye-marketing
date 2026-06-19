import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Check,
  MapPin
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FaqAccordion } from '@/components/faq-accordion'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { CategoryBenchmarkTable } from '@/components/ui/CategoryBenchmarkTable'
import { CrowdingBadge } from '@/components/ui/CrowdingBadge'
import { FeasibilityZoneBadge } from '@/components/ui/FeasibilityZoneBadge'
import { LockedModuleCard } from '@/components/ui/LockedModuleCard'
import {
  formatIndiaReportPrice,
  getAllIndiaLocalFeasibilitySlugs,
  getIndiaLocalFeasibilityBySlug,
  indiaLocalFeasibilityHubPath,
  indiaLocalFeasibilityPath,
  type IndiaLocalFeasibilityPage
} from '@/lib/indiaLocalFeasibilityData'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'
import { SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllIndiaLocalFeasibilitySlugs()
  return slugs.map((s) => ({ slug: s }))
}

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return `${SITE_URL}${indiaLocalFeasibilityPath(slug)}`
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'delivery-calculator': 'Delivery Margin Calculator',
  'sba-loan-scanner': 'SBA Loan Scanner',
  'franchise-profit-simulator': 'Franchise Profit Simulator',
  'uk-vat-cliff-scanner': 'UK VAT Cliff Scanner',
  'local-scout': 'Local Market Scout',
  'aeo-scanner': 'AEO Shadow Scanner',
  'build-pivot-kill': 'Build / Pivot / Kill Analyst'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaLocalFeasibilityBySlug(slug)

  if (!row) {
    return {
      title: 'India Local Market Scout | Valifye',
      description:
        'Forensic local business feasibility intelligence for Indian cities.'
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

export default async function IndiaLocalFeasibilityPage({ params }: Props) {
  const resolvedParams = await params
  console.log(
    `[PSEO DEBUG] table: local_feasibility_pages | raw params:`,
    resolvedParams
  )
  const { slug } = resolvedParams
  console.log(`[PSEO DEBUG] extracted slug: "${slug}"`)
  const cleanSlug = decodeURIComponent(slug).trim()
  const row = await getIndiaLocalFeasibilityBySlug(slug)
  console.log(
    `[PSEO DEBUG] query slug: "${cleanSlug}" | result:`,
    row ? `FOUND (slug: ${row.slug})` : 'NULL — will 404'
  )

  if (!row) notFound()

  const year = new Date(row.date_published).getFullYear() || new Date().getFullYear()
  const url = pageUrl(row.slug)
  const faqAccordionItems = row.faq.map((item) => ({
    q: item.question,
    a: item.answer
  }))
  const priceLabel = formatIndiaReportPrice(
    row.report_price,
    row.report_price_currency
  )

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
        <HeroSection row={row} year={year} />
        <MarketContextSection text={row.market_context} />
        <CategoryBenchmarksSection row={row} />
        <CrowdingSnapshotSection row={row} />
        <RegulatoryChecklistSection items={row.regulatory_checklist} />
        <LockedModulesSection modules={row.locked_modules} />
        <InternalLinksSection row={row} />
        <CtaBlock row={row} priceLabel={priceLabel} />
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
  row: IndiaLocalFeasibilityPage
  year: number
}) {
  const location = row.state_or_region
    ? `${row.city_name}, ${row.state_or_region}`
    : row.city_name

  return (
    <header className="space-y-8">
      <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-400/90">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        India Local Market Scout · {year} Feasibility Scan
      </p>

      <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
        {row.meta_title || (
          <>
            Is a {row.business_type} in{' '}
            <span className="text-amber-400">{location}</span> Feasible?
          </>
        )}
      </h1>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {row.meta_description}
      </p>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <FeasibilityZoneBadge zone={row.feasibility_zone} size="lg" />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          {row.business_type} · {location} · {row.country}
        </p>
      </div>
    </header>
  )
}

function MarketContextSection({ text }: { text: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Market Context
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
        {text || 'No market context indexed for this scan.'}
      </p>
    </section>
  )
}

function CategoryBenchmarksSection({ row }: { row: IndiaLocalFeasibilityPage }) {
  return (
    <section aria-labelledby="category-benchmarks-heading" className="space-y-4">
      <h2
        id="category-benchmarks-heading"
        className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500"
      >
        Category Benchmarks
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
        Industry benchmark ranges for {row.business_type.toLowerCase()} operations
        in {row.city_name} — COGS, labor, rent, and operating margin bands drawn
        from category data (not your specific unit economics).
      </p>
      <CategoryBenchmarkTable
        benchmarks={row.benchmarks}
        label={`${row.business_type} category benchmarks for ${row.city_name}`}
      />
    </section>
  )
}

function CrowdingSnapshotSection({ row }: { row: IndiaLocalFeasibilityPage }) {
  return (
    <section aria-labelledby="crowding-snapshot-heading" className="space-y-4">
      <h2
        id="crowding-snapshot-heading"
        className="font-serif text-3xl font-black text-zinc-50 md:text-4xl"
      >
        Crowding Snapshot
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
        Competitive density signal for {row.business_type.toLowerCase()} in{' '}
        {row.city_name}. Full competitor mapping and named weakness analysis unlock
        in the paid report.
      </p>
      <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
        {row.crowding_label ? (
          <CrowdingBadge
            intensity={row.crowding_intensity}
            label={row.crowding_label}
            size="lg"
          />
        ) : (
          <p className="text-sm text-zinc-500">No crowding signal indexed.</p>
        )}
      </div>
    </section>
  )
}

function RegulatoryChecklistSection({ items }: { items: string[] }) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
          Regulatory Checklist
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
          Key compliance requirements to account for before opening. Permit
          sequencing and filing order unlock in the full report.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No regulatory items indexed.</p>
      ) : (
        <ul className="space-y-3 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function LockedModulesSection({
  modules
}: {
  modules: IndiaLocalFeasibilityPage['locked_modules']
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
          Full Report Modules
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
          The complete forensic audit includes unit economics, competitor
          weakness mapping, permit sequencing, and go/no-go analysis. Preview
          modules below — unlock via the main CTA.
        </p>
      </div>
      {modules.length === 0 ? (
        <p className="text-sm text-zinc-500">No locked modules indexed.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <LockedModuleCard
              key={`${module.module_number}-${module.module_name}`}
              moduleNumber={module.module_number}
              moduleName={module.module_name}
              teaserLine={module.teaser_line}
              icon={module.icon}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function InternalLinksSection({ row }: { row: IndiaLocalFeasibilityPage }) {
  const reportLinks = row.related_report_slugs.map((relatedSlug) => ({
    href: indiaLocalFeasibilityPath(relatedSlug),
    label: slugToTitle(relatedSlug)
  }))
  const ideaLinks = row.related_idea_slugs.map((ideaSlug) => ({
    href: `/ideas/${ideaSlug}`,
    label: slugToTitle(ideaSlug)
  }))
  const toolLinks = row.related_tool_slugs.map((toolSlug) => ({
    href: `/tools/${toolSlug}`,
    label: TOOL_DISPLAY_NAMES[toolSlug] ?? slugToTitle(toolSlug)
  }))

  const hubLinks = [
    { href: indiaLocalFeasibilityHubPath(), label: 'All India Local Scout Reports' },
    { href: '/india', label: 'Valifye India Hub' }
  ]

  const allLinks = [...hubLinks, ...reportLinks, ...ideaLinks, ...toolLinks]

  if (allLinks.length === 0) return null

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Related Intelligence
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {allLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 transition-colors hover:border-amber-500/40 hover:bg-zinc-900'
              )}
            >
              <span className="text-sm font-medium text-zinc-200 group-hover:text-amber-400">
                {link.label}
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CtaBlock({
  row,
  priceLabel
}: {
  row: IndiaLocalFeasibilityPage
  priceLabel: string
}) {
  const location = row.state_or_region
    ? `${row.city_name}, ${row.state_or_region}`
    : row.city_name

  return (
    <section
      aria-labelledby="cta-heading"
      className="space-y-5 border border-amber-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
    >
      <h2
        id="cta-heading"
        className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
      >
        Run the Full Forensic Report
      </h2>
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
        This page shows the free feasibility scan. The full report unlocks unit
        economics, named competitor weaknesses, permit sequencing, and a complete
        go/no-go memo for {row.business_type.toLowerCase()} in {location}.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <a
          href="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-primary-foreground transition hover:bg-primary/90"
        >
          Run the Full Report — {priceLabel}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </a>
        <Link
          href={indiaLocalFeasibilityHubPath()}
          className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 font-mono text-sm uppercase tracking-[0.12em] text-foreground transition hover:border-primary hover:text-primary"
        >
          Browse India Scout Reports
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
        {row.business_type} · {location}
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
