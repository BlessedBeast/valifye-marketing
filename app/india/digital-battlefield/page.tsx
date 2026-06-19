import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Crosshair,
  MapPin,
  Scale,
  Target,
  TrendingUp
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { buildCanonical, SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

const PAGE_TITLE = 'India Digital Battlefield'
const PAGE_DESCRIPTION =
  'SaaS and software market validation for Indian founders — society management, coaching platforms, GST billing, and the niches nobody else is covering.'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Valifye`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonical('/india/digital-battlefield')
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: buildCanonical('/india/digital-battlefield'),
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
}

type SectionConfig = {
  table: string
  title: string
  description: string
  href: string
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

const SECTIONS: SectionConfig[] = [
  {
    table: 'india_profitable_niche_pages',
    title: 'Profitable Niches',
    description:
      'Forensic profitability scans for Indian SaaS and software niches — whitespace scores, demand signals, and BUILD / PIVOT / KILL verdicts.',
    href: '/india/digital-battlefield/profitable-niches',
    countLabel: 'niches analyzed',
    countLabelSingular: 'niche analyzed',
    icon: TrendingUp,
    accentTag: 'text-emerald-400/90',
    accentBorder: 'hover:border-emerald-500/40',
    accentGlow: 'bg-emerald-500/5',
    accentCta: 'text-emerald-400',
    accentHoverTitle: 'group-hover:text-emerald-400',
    statBorder: 'border-emerald-500/30 bg-emerald-500/[0.06]',
    statText: 'text-emerald-200'
  },
  {
    table: 'india_should_i_build_pages',
    title: 'Build Verdicts',
    description:
      'Should-you-build analysis for Indian software ideas — market size, competitive density, and honest go/no-go reads before you ship.',
    href: '/india/digital-battlefield/build-verdicts',
    countLabel: 'build decisions indexed',
    countLabelSingular: 'build decision indexed',
    icon: Crosshair,
    accentTag: 'text-cyan-400/90',
    accentBorder: 'hover:border-cyan-500/40',
    accentGlow: 'bg-cyan-500/5',
    accentCta: 'text-cyan-400',
    accentHoverTitle: 'group-hover:text-cyan-400',
    statBorder: 'border-cyan-500/30 bg-cyan-500/[0.06]',
    statText: 'text-cyan-200'
  },
  {
    table: 'india_saas_ideas_vertical_pages',
    title: 'SaaS Verticals',
    description:
      'Ranked SaaS playbooks for Indian verticals — society management, coaching platforms, GST billing, and sub-niche applications.',
    href: '/india/digital-battlefield/saas-verticals',
    countLabel: 'verticals indexed',
    countLabelSingular: 'vertical indexed',
    icon: Target,
    accentTag: 'text-indigo-400/90',
    accentBorder: 'hover:border-indigo-500/40',
    accentGlow: 'bg-indigo-500/5',
    accentCta: 'text-indigo-400',
    accentHoverTitle: 'group-hover:text-indigo-400',
    statBorder: 'border-indigo-500/30 bg-indigo-500/[0.06]',
    statText: 'text-indigo-200'
  },
  {
    table: 'india_market_saturation_pages',
    title: 'Market Saturation',
    description:
      'Crowding density and defensive positioning for Indian software markets — saturation audits before you enter a contested category.',
    href: '/india/digital-battlefield/market-saturation',
    countLabel: 'markets audited',
    countLabelSingular: 'market audited',
    icon: Scale,
    accentTag: 'text-rose-400/90',
    accentBorder: 'hover:border-rose-500/40',
    accentGlow: 'bg-rose-500/5',
    accentCta: 'text-rose-400',
    accentHoverTitle: 'group-hover:text-rose-400',
    statBorder: 'border-rose-500/30 bg-rose-500/[0.06]',
    statText: 'text-rose-200'
  },
  {
    table: 'india_local_opportunity_pages',
    title: 'Local Opportunities',
    description:
      'City-level startup opportunity maps for India — regional demand gaps, ecosystem signals, and best niches by metro.',
    href: '/india/digital-battlefield/local-opportunities',
    countLabel: 'opportunity maps',
    countLabelSingular: 'opportunity map',
    icon: MapPin,
    accentTag: 'text-amber-400/90',
    accentBorder: 'hover:border-amber-500/40',
    accentGlow: 'bg-amber-500/5',
    accentCta: 'text-amber-400',
    accentHoverTitle: 'group-hover:text-amber-400',
    statBorder: 'border-amber-500/30 bg-amber-500/[0.06]',
    statText: 'text-amber-200'
  },
  {
    table: 'india_validation_guide_pages',
    title: 'Validation Guides',
    description:
      'Step-by-step validation playbooks for Indian founders — smoke tests, landing page experiments, and pre-sales frameworks.',
    href: '/india/digital-battlefield/validation-guides',
    countLabel: 'validation guides',
    countLabelSingular: 'validation guide',
    icon: BookOpen,
    accentTag: 'text-violet-400/90',
    accentBorder: 'hover:border-violet-500/40',
    accentGlow: 'bg-violet-500/5',
    accentCta: 'text-violet-400',
    accentHoverTitle: 'group-hover:text-violet-400',
    statBorder: 'border-violet-500/30 bg-violet-500/[0.06]',
    statText: 'text-violet-200'
  }
]

async function fetchPublishedCount(table: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) {
    console.error(`[${table}] published count fetch failed:`, error.message)
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

export default async function IndiaDigitalBattlefieldHubPage() {
  const counts = await Promise.all(
    SECTIONS.map((section) => fetchPublishedCount(section.table))
  )

  const sections = SECTIONS.map((section, index) => ({
    ...section,
    count: counts[index] ?? 0
  }))

  const totalPublished = counts.reduce((sum, count) => sum + count, 0)

  return (
    <MarketingShell className="max-w-6xl gap-12">
      <header className="space-y-5 border-b border-zinc-800/80 pb-10">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
          <Crosshair className="h-3.5 w-3.5" aria-hidden />
          Valifye India · Forensic SaaS Intelligence
        </p>
        <h1 className="max-w-4xl font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-5xl">
          India Digital Battlefield
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
          {PAGE_DESCRIPTION}
        </p>
        {totalPublished > 0 ? (
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1 text-cyan-200">
              {totalPublished.toLocaleString('en-IN')} published reports
            </span>
            <span className="rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-zinc-400">
              6 intelligence engines
            </span>
          </div>
        ) : null}
      </header>

      <section aria-labelledby="india-digital-sections-heading" className="space-y-6">
        <h2 id="india-digital-sections-heading" className="sr-only">
          India digital battlefield sections
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-6 transition-all duration-200 hover:bg-[#111111] md:p-7 ${section.accentBorder}`}
            >
              <div
                className={`pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl ${section.accentGlow}`}
                aria-hidden
              />
              <div className="relative mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                  <section.icon
                    className={`h-4 w-4 ${section.accentTag}`}
                    aria-hidden
                  />
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] ${section.statBorder} ${section.statText}`}
                >
                  {formatCountStat(
                    section.count,
                    section.countLabel,
                    section.countLabelSingular
                  )}
                </span>
              </div>
              <h3
                className={`relative mb-2 text-xl font-black text-zinc-50 transition-colors md:text-2xl ${section.accentHoverTitle}`}
              >
                {section.title}
              </h3>
              <p className="relative mb-5 text-sm leading-relaxed text-zinc-500">
                {section.description}
              </p>
              <div
                className={`relative inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${section.accentCta}`}
              >
                Explore section
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  )
}
