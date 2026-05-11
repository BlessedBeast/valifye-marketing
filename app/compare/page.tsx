import type { Metadata } from 'next'
import {
  Building2,
  Crosshair,
  MapPin,
  Rocket,
  type LucideIcon
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import {
  ComparisonCard,
  TIER_META
} from '@/components/compare/ComparisonCard'
import {
  getComparisonList,
  type ComparisonReport,
  type ComparisonTier
} from '@/lib/comparisonData'
import { cn } from '@/lib/utils'

const SITE_URL = 'https://valifye.com'
const HUB_URL = `${SITE_URL}/compare`

const PAGE_DESCRIPTION =
  'Forensic, evidence-backed audits of the world\u2019s leading market intelligence tools. Compare Valifye against indie, enterprise, and local incumbents \u2014 real data, no hallucinations.'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Compare Valifye: Forensic Market Intelligence vs. Competitors',
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: 'Compare Valifye: Forensic Market Intelligence vs. Competitors',
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: HUB_URL
  },
  alternates: {
    canonical: HUB_URL
  }
}

type TierSectionMeta = {
  id: ComparisonTier
  eyebrow: string
  heading: string
  description: string
  accent: string
  Icon: LucideIcon
}

const TIER_SECTIONS: TierSectionMeta[] = [
  {
    id: 'indie',
    eyebrow: 'Indie Takedowns',
    heading: 'Valifye vs. Indie Tools',
    description:
      'Forensic audits of the solo-founder and indie-SaaS stack: where lightweight tooling breaks for serious operators.',
    accent: 'text-emerald-400/90',
    Icon: Rocket
  },
  {
    id: 'enterprise',
    eyebrow: 'Enterprise Takedowns',
    heading: 'Valifye vs. Enterprise Incumbents',
    description:
      'Where six-figure platforms still rely on stale TAM, hallucinated insights, and uncited reports.',
    accent: 'text-cyan-400/90',
    Icon: Building2
  },
  {
    id: 'local',
    eyebrow: 'Local Takedowns',
    heading: 'Valifye vs. Local Intelligence Tools',
    description:
      'Audits of the legacy tools serving brick-and-mortar and local operators \u2014 and the friction their data misses.',
    accent: 'text-amber-400/90',
    Icon: MapPin
  }
]

export default async function ComparisonHubPage() {
  const reports = await getComparisonList()

  const indie = reports.filter((r) => r.tier === 'indie')
  const enterprise = reports.filter((r) => r.tier === 'enterprise')
  const local = reports.filter((r) => r.tier === 'local')

  const sectionData: Array<{
    meta: TierSectionMeta
    reports: ComparisonReport[]
  }> = [
    { meta: TIER_SECTIONS[0], reports: indie },
    { meta: TIER_SECTIONS[1], reports: enterprise },
    { meta: TIER_SECTIONS[2], reports: local }
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Valifye vs. The Incumbents',
    description: PAGE_DESCRIPTION,
    url: HUB_URL,
    hasPart: reports.map((report) => ({
      '@type': 'WebPage',
      name: `Valifye vs. ${report.competitorName}`,
      url: `${SITE_URL}/compare/${report.slug}`,
      abstract: report.verdictSummary
    }))
  }

  return (
    <MarketingShell className="max-w-[1280px] gap-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="space-y-6 text-center md:text-left">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-400">
          <Crosshair className="h-3.5 w-3.5" />
          Comparison Engine v3.0
        </p>
        <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-7xl">
          Valifye vs.{' '}
          <span className="text-emerald-400">The Incumbents</span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Forensic audits of the world&apos;s leading market intelligence tools.
          Real data. No hallucinations.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 md:justify-start">
          <span className="rounded-full border border-zinc-700/60 bg-zinc-900/50 px-3 py-1">
            {reports.length} Takedowns Indexed
          </span>
          <span
            className={cn(
              'rounded-full border px-3 py-1',
              TIER_META.indie.badge
            )}
          >
            {indie.length} Indie
          </span>
          <span
            className={cn(
              'rounded-full border px-3 py-1',
              TIER_META.enterprise.badge
            )}
          >
            {enterprise.length} Enterprise
          </span>
          <span
            className={cn(
              'rounded-full border px-3 py-1',
              TIER_META.local.badge
            )}
          >
            {local.length} Local
          </span>
        </div>
      </section>

      {sectionData.map(({ meta, reports: sectionReports }) => (
        <TierSection
          key={meta.id}
          meta={meta}
          reports={sectionReports}
          totalAcrossHub={reports.length}
        />
      ))}
    </MarketingShell>
  )
}

function TierSection({
  meta,
  reports,
  totalAcrossHub
}: {
  meta: TierSectionMeta
  reports: ComparisonReport[]
  totalAcrossHub: number
}) {
  const Icon = meta.Icon

  // Empty + nothing else on the hub yet: render a subtle placeholder so the
  // page still scans as the Comparison Engine instead of looking broken.
  // Empty + other tiers populated: hide the section so the hub stays tight.
  if (reports.length === 0) {
    if (totalAcrossHub > 0) return null
    return (
      <section
        aria-label={meta.eyebrow}
        className="space-y-4 border-y border-zinc-800/80 py-10"
      >
        <header className="space-y-2">
          <p
            className={cn(
              'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em]',
              meta.accent
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.eyebrow}
          </p>
          <h2 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
            {meta.heading}
          </h2>
        </header>
        <div className="rounded-md border border-dashed border-zinc-800 bg-slate-900/30 px-6 py-8 text-center text-sm text-zinc-500">
          More audits pending&hellip;
        </div>
      </section>
    )
  }

  return (
    <section aria-label={meta.eyebrow} className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="space-y-2">
          <p
            className={cn(
              'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em]',
              meta.accent
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.eyebrow}
          </p>
          <h2 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
            {meta.heading}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            {meta.description}
          </p>
        </div>
        <span className="self-start text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 md:self-end">
          {reports.length}{' '}
          {reports.length === 1 ? 'takedown' : 'takedowns'}
        </span>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ComparisonCard key={report.slug} report={report} />
        ))}
      </div>
    </section>
  )
}
