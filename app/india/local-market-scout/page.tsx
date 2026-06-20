import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  MapPin,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FeasibilityZoneBadge } from '@/components/ui/FeasibilityZoneBadge'
import {
  getIndiaLocalFeasibilityHubRows,
  indiaLocalFeasibilityPath
} from '@/lib/indiaLocalFeasibilityData'
import { buildCanonical } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

const PAGE_TITLE = 'India Local Market Scout Reports'
const PAGE_DESCRIPTION =
  'Forensic local business feasibility scans for Indian cities — café, gym, clinic, turf, and franchise viability with regulatory context, crowding signals, and category benchmarks.'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Valifye`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/india/local-market-scout')
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: buildCanonical('/india/local-market-scout')
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
}

type CategoryConfig = {
  value: string
  label: string
  description: string
  countLabel: string
  countLabelSingular: string
  icon: LucideIcon
  accentTag: string
  accentBorder: string
  accentGlow: string
  accentCta: string
  accentHoverTitle: string
  statBorder: string
  statText: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: 'Food & Beverage',
    label: 'Food & Beverage',
    description:
      'Café, restaurant, and F&B viability scans for Indian metros and tier-2 cities.',
    countLabel: 'reports',
    countLabelSingular: 'report',
    icon: UtensilsCrossed,
    accentTag: 'text-amber-400/90',
    accentBorder: 'hover:border-amber-500/40',
    accentGlow: 'bg-amber-500/5',
    accentCta: 'text-amber-400',
    accentHoverTitle: 'group-hover:text-amber-400',
    statBorder: 'border-amber-500/30 bg-amber-500/[0.06]',
    statText: 'text-amber-200'
  },
  {
    value: 'Fitness & Recreation',
    label: 'Fitness & Recreation',
    description:
      'Gym, turf, sports academy, and recreation business feasibility with crowding signals.',
    countLabel: 'reports',
    countLabelSingular: 'report',
    icon: Dumbbell,
    accentTag: 'text-emerald-400/90',
    accentBorder: 'hover:border-emerald-500/40',
    accentGlow: 'bg-emerald-500/5',
    accentCta: 'text-emerald-400',
    accentHoverTitle: 'group-hover:text-emerald-400',
    statBorder: 'border-emerald-500/30 bg-emerald-500/[0.06]',
    statText: 'text-emerald-200'
  },
  {
    value: 'Healthcare & Wellness',
    label: 'Healthcare & Wellness',
    description:
      'Clinic, diagnostic, and wellness venture scans with regulatory checklist context.',
    countLabel: 'reports',
    countLabelSingular: 'report',
    icon: HeartPulse,
    accentTag: 'text-rose-400/90',
    accentBorder: 'hover:border-rose-500/40',
    accentGlow: 'bg-rose-500/5',
    accentCta: 'text-rose-400',
    accentHoverTitle: 'group-hover:text-rose-400',
    statBorder: 'border-rose-500/30 bg-rose-500/[0.06]',
    statText: 'text-rose-200'
  },
  {
    value: 'Personal Care',
    label: 'Personal Care',
    description:
      'Salon, spa, and personal services feasibility with category benchmarks.',
    countLabel: 'reports',
    countLabelSingular: 'report',
    icon: Sparkles,
    accentTag: 'text-violet-400/90',
    accentBorder: 'hover:border-violet-500/40',
    accentGlow: 'bg-violet-500/5',
    accentCta: 'text-violet-400',
    accentHoverTitle: 'group-hover:text-violet-400',
    statBorder: 'border-violet-500/30 bg-violet-500/[0.06]',
    statText: 'text-violet-200'
  },
  {
    value: 'Education & Childcare',
    label: 'Education & Childcare',
    description:
      'Coaching, daycare, and education venture feasibility for Indian city markets.',
    countLabel: 'reports',
    countLabelSingular: 'report',
    icon: GraduationCap,
    accentTag: 'text-indigo-400/90',
    accentBorder: 'hover:border-indigo-500/40',
    accentGlow: 'bg-indigo-500/5',
    accentCta: 'text-indigo-400',
    accentHoverTitle: 'group-hover:text-indigo-400',
    statBorder: 'border-indigo-500/30 bg-indigo-500/[0.06]',
    statText: 'text-indigo-200'
  }
]

const CATEGORY_VALUES = new Set(CATEGORIES.map((category) => category.value))

async function fetchCategoryCount(businessCategory: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('local_feasibility_pages')
    .select('id', { count: 'exact', head: true })
    .eq('business_category', businessCategory)
    .eq('country', 'India')
    .eq('is_published', true)

  if (error) {
    console.error(
      `[local_feasibility_pages] category count failed for "${businessCategory}":`,
      error.message
    )
    return 0
  }

  return count ?? 0
}

function formatCountStat(
  count: number,
  plural: string,
  singular: string
): string {
  if (count <= 0) return 'Coming soon'
  const label = count === 1 ? singular : plural
  return `${count.toLocaleString('en-IN')} ${label}`
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function IndiaLocalMarketScoutHubPage({ searchParams }: Props) {
  const { category: rawCategory } = await searchParams
  const activeCategory =
    rawCategory && CATEGORY_VALUES.has(rawCategory) ? rawCategory : undefined

  const [rows, categoryCounts] = await Promise.all([
    getIndiaLocalFeasibilityHubRows(
      activeCategory ? { category: activeCategory } : undefined
    ),
    Promise.all(CATEGORIES.map((category) => fetchCategoryCount(category.value)))
  ])

  const categories = CATEGORIES.map((category, index) => ({
    ...category,
    count: categoryCounts[index] ?? 0
  }))

  const activeCategoryConfig = activeCategory
    ? categories.find((category) => category.value === activeCategory)
    : undefined

  const emptyMessage = activeCategory
    ? `No published India ${activeCategory} reports yet.`
    : 'No published India local feasibility reports yet.'

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-400/90">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Valifye India · Local Intelligence
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">
          India Local Market Scout Reports
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500 md:text-base">
          {PAGE_DESCRIPTION}
        </p>
        <p className="font-mono text-[11px] text-zinc-600">
          {rows.length} published {rows.length === 1 ? 'report' : 'reports'}
          {activeCategoryConfig ? ` · ${activeCategoryConfig.label}` : ''}
        </p>
      </header>

      <section aria-labelledby="india-local-categories-heading" className="space-y-6">
        <h2 id="india-local-categories-heading" className="sr-only">
          India local market scout categories
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.value}
              href={`/india/local-market-scout?category=${encodeURIComponent(category.value)}`}
              className={`group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-6 transition-all duration-200 hover:bg-[#111111] md:p-7 ${category.accentBorder}`}
            >
              <div
                className={`pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl ${category.accentGlow}`}
                aria-hidden
              />
              <div className="relative mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                  <category.icon
                    className={`h-4 w-4 ${category.accentTag}`}
                    aria-hidden
                  />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] ${category.statBorder} ${category.statText}`}
                >
                  {formatCountStat(
                    category.count,
                    category.countLabel,
                    category.countLabelSingular
                  )}
                </span>
              </div>
              <h3
                className={`relative mb-2 text-xl font-black text-zinc-50 transition-colors md:text-2xl ${category.accentHoverTitle}`}
              >
                {category.label}
              </h3>
              <p className="relative mb-5 text-sm leading-relaxed text-zinc-500">
                {category.description}
              </p>
              <div
                className={`relative inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${category.accentCta}`}
              >
                Browse category
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-10 text-center text-sm text-zinc-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const location = row.state_or_region
              ? `${row.city_name}, ${row.state_or_region}`
              : row.city_name

            return (
              <Link
                key={row.slug}
                href={indiaLocalFeasibilityPath(row.slug)}
                className="group block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-amber-500/40 hover:bg-zinc-900"
              >
                <div className="mb-3">
                  <FeasibilityZoneBadge zone={row.feasibility_zone} size="sm" />
                </div>
                <h2 className="mb-1 text-base font-bold text-zinc-50 transition-colors group-hover:text-amber-400">
                  {row.business_type}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-500">{location}</p>
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
    </MarketingShell>
  )
}
