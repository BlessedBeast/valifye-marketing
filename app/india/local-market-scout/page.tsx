import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lock, MapPin, icons, type LucideIcon } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { FeasibilityZoneBadge } from '@/components/ui/FeasibilityZoneBadge'
import {
  getAllIndiaLocalFeasibilityCategories,
  indiaLocalFeasibilityCategoryPath
} from '@/lib/indiaLocalFeasibilityCategoryData'
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

type CategoryAccentClasses = {
  accentTag: string
  accentBorder: string
  accentGlow: string
  accentCta: string
  accentHoverTitle: string
  statBorder: string
  statText: string
}

const ACCENT_COLOR_CLASSES: Record<string, CategoryAccentClasses> = {
  amber: {
    accentTag: 'text-amber-400/90',
    accentBorder: 'hover:border-amber-500/40',
    accentGlow: 'bg-amber-500/5',
    accentCta: 'text-amber-400',
    accentHoverTitle: 'group-hover:text-amber-400',
    statBorder: 'border-amber-500/30 bg-amber-500/[0.06]',
    statText: 'text-amber-200'
  },
  emerald: {
    accentTag: 'text-emerald-400/90',
    accentBorder: 'hover:border-emerald-500/40',
    accentGlow: 'bg-emerald-500/5',
    accentCta: 'text-emerald-400',
    accentHoverTitle: 'group-hover:text-emerald-400',
    statBorder: 'border-emerald-500/30 bg-emerald-500/[0.06]',
    statText: 'text-emerald-200'
  },
  rose: {
    accentTag: 'text-rose-400/90',
    accentBorder: 'hover:border-rose-500/40',
    accentGlow: 'bg-rose-500/5',
    accentCta: 'text-rose-400',
    accentHoverTitle: 'group-hover:text-rose-400',
    statBorder: 'border-rose-500/30 bg-rose-500/[0.06]',
    statText: 'text-rose-200'
  },
  fuchsia: {
    accentTag: 'text-fuchsia-400/90',
    accentBorder: 'hover:border-fuchsia-500/40',
    accentGlow: 'bg-fuchsia-500/5',
    accentCta: 'text-fuchsia-400',
    accentHoverTitle: 'group-hover:text-fuchsia-400',
    statBorder: 'border-fuchsia-500/30 bg-fuchsia-500/[0.06]',
    statText: 'text-fuchsia-200'
  },
  violet: {
    accentTag: 'text-violet-400/90',
    accentBorder: 'hover:border-violet-500/40',
    accentGlow: 'bg-violet-500/5',
    accentCta: 'text-violet-400',
    accentHoverTitle: 'group-hover:text-violet-400',
    statBorder: 'border-violet-500/30 bg-violet-500/[0.06]',
    statText: 'text-violet-200'
  },
  indigo: {
    accentTag: 'text-indigo-400/90',
    accentBorder: 'hover:border-indigo-500/40',
    accentGlow: 'bg-indigo-500/5',
    accentCta: 'text-indigo-400',
    accentHoverTitle: 'group-hover:text-indigo-400',
    statBorder: 'border-indigo-500/30 bg-indigo-500/[0.06]',
    statText: 'text-indigo-200'
  }
}

const DEFAULT_ACCENT = ACCENT_COLOR_CLASSES.amber

function resolveLucideIcon(name: string): LucideIcon {
  const Icon = icons[name as keyof typeof icons]
  if (Icon && typeof Icon === 'function') {
    return Icon as LucideIcon
  }
  return Lock
}

function resolveAccentClasses(accentColor: string): CategoryAccentClasses {
  const key = accentColor.trim().toLowerCase()
  return ACCENT_COLOR_CLASSES[key] ?? DEFAULT_ACCENT
}

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

function formatCountStat(count: number): string {
  if (count <= 0) return 'Coming soon'
  const label = count === 1 ? 'report' : 'reports'
  return `${count.toLocaleString('en-IN')} ${label}`
}

export default async function IndiaLocalMarketScoutHubPage() {
  const categoryRows = await getAllIndiaLocalFeasibilityCategories()

  const [rows, categoryCounts] = await Promise.all([
    getIndiaLocalFeasibilityHubRows(),
    Promise.all(
      categoryRows.map((category) => fetchCategoryCount(category.business_category))
    )
  ])

  const categories = categoryRows.map((category, index) => ({
    ...category,
    count: categoryCounts[index] ?? 0,
    accent: resolveAccentClasses(category.accent_color),
    Icon: resolveLucideIcon(category.icon)
  }))

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
        </p>
      </header>

      <section aria-labelledby="india-local-categories-heading" className="space-y-6">
        <h2 id="india-local-categories-heading" className="sr-only">
          India local market scout categories
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={indiaLocalFeasibilityCategoryPath(category.slug)}
              className={`group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-6 transition-all duration-200 hover:bg-[#111111] md:p-7 ${category.accent.accentBorder}`}
            >
              <div
                className={`pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl ${category.accent.accentGlow}`}
                aria-hidden
              />
              <div className="relative mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                  <category.Icon
                    className={`h-4 w-4 ${category.accent.accentTag}`}
                    aria-hidden
                  />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] ${category.accent.statBorder} ${category.accent.statText}`}
                >
                  {formatCountStat(category.count)}
                </span>
              </div>
              <h3
                className={`relative mb-2 text-xl font-black text-zinc-50 transition-colors md:text-2xl ${category.accent.accentHoverTitle}`}
              >
                {category.label}
              </h3>
              <p className="relative mb-5 text-sm leading-relaxed text-zinc-500">
                {category.short_description}
              </p>
              <div
                className={`relative inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${category.accent.accentCta}`}
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
          No published India local feasibility reports yet.
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
