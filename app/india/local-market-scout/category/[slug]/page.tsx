import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'

import { FaqAccordion } from '@/components/faq-accordion'
import { MarketingShell } from '@/components/MarketingShell'
import { JsonLdSchema } from '@/components/seo/JsonLdSchema'
import { FeasibilityZoneBadge } from '@/components/ui/FeasibilityZoneBadge'
import {
  getAllIndiaLocalFeasibilityCategorySlugs,
  getIndiaLocalFeasibilityCategoryBySlug,
  indiaLocalFeasibilityCategoryPath,
  type IndiaLocalFeasibilityCategoryPage
} from '@/lib/indiaLocalFeasibilityCategoryData'
import {
  getIndiaLocalFeasibilityHubRows,
  indiaLocalFeasibilityHubPath,
  indiaLocalFeasibilityPath
} from '@/lib/indiaLocalFeasibilityData'
import { buildCanonical } from '@/lib/seo'
import { generateArticleSchema } from '@/lib/seo/generateArticleSchema'
import { generateFaqSchema } from '@/lib/seo/generateFaqSchema'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllIndiaLocalFeasibilityCategorySlugs()
  return slugs.map((s) => ({ slug: s }))
}

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

function pageUrl(slug: string): string {
  return buildCanonical(indiaLocalFeasibilityCategoryPath(slug))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getIndiaLocalFeasibilityCategoryBySlug(slug)

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

export default async function IndiaLocalFeasibilityCategoryPage({
  params
}: Props) {
  const { slug } = await params
  const row = await getIndiaLocalFeasibilityCategoryBySlug(slug)

  if (!row) notFound()

  const reportRows = await getIndiaLocalFeasibilityHubRows({
    category: row.business_category
  })

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

  return (
    <MarketingShell className="max-w-6xl gap-10">
      {faqSchema ? <JsonLdSchema schema={faqSchema} /> : null}
      <JsonLdSchema schema={articleSchema} />

      <article className="space-y-10">
        <HeroSection row={row} reportCount={reportRows.length} />
        <CategoryContextSection row={row} />
        <ReportsSection row={row} reportRows={reportRows} />
        {row.faq.length > 0 ? (
          <FaqSection faqs={faqAccordionItems} />
        ) : null}
        <BackLink />
      </article>
    </MarketingShell>
  )
}

function HeroSection({
  row,
  reportCount
}: {
  row: IndiaLocalFeasibilityCategoryPage
  reportCount: number
}) {
  return (
    <header className="space-y-4">
      <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400/90">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        Valifye India · Local Intelligence · {row.label.toUpperCase()}
      </p>
      <h1 className="text-3xl font-black text-white md:text-4xl">
        {row.label} Business Feasibility in India
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
        {row.intro_text}
      </p>
      <p className="font-mono text-[11px] text-zinc-600">
        {reportCount} published {reportCount === 1 ? 'report' : 'reports'} ·{' '}
        {row.label}
      </p>
    </header>
  )
}

function CategoryContextSection({ row }: { row: IndiaLocalFeasibilityCategoryPage }) {
  return (
    <section aria-labelledby="category-context-heading" className="space-y-4">
      <h2
        id="category-context-heading"
        className="font-serif text-2xl font-black text-zinc-50 md:text-3xl"
      >
        Category Context
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
        {row.category_context}
      </p>
      {row.example_business_types.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {row.example_business_types.map((type) => (
            <span
              key={type}
              className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400"
            >
              {type}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ReportsSection({
  row,
  reportRows
}: {
  row: IndiaLocalFeasibilityCategoryPage
  reportRows: Awaited<ReturnType<typeof getIndiaLocalFeasibilityHubRows>>
}) {
  return (
    <section aria-labelledby="category-reports-heading" className="space-y-6">
      <h2
        id="category-reports-heading"
        className="text-2xl font-black text-white md:text-3xl"
      >
        {row.label} Feasibility Reports
      </h2>

      {reportRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-10 text-center text-sm text-zinc-500">
          No published {row.label} reports yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportRows.map((reportRow) => {
            const location = reportRow.state_or_region
              ? `${reportRow.city_name}, ${reportRow.state_or_region}`
              : reportRow.city_name

            return (
              <Link
                key={reportRow.slug}
                href={indiaLocalFeasibilityPath(reportRow.slug)}
                className="group block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-amber-500/40 hover:bg-zinc-900"
              >
                <div className="mb-3">
                  <FeasibilityZoneBadge
                    zone={reportRow.feasibility_zone}
                    size="sm"
                  />
                </div>
                <h3 className="mb-1 text-base font-bold text-zinc-50 transition-colors group-hover:text-amber-400">
                  {reportRow.business_type}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {location}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] tracking-wide text-amber-400">
                  VIEW REPORT
                  <span
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
        Frequently Asked Questions
      </h2>
      <FaqAccordion faqs={faqs} />
    </section>
  )
}

function BackLink() {
  return (
    <p>
      <Link
        href={indiaLocalFeasibilityHubPath()}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-amber-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        All categories
      </Link>
    </p>
  )
}
