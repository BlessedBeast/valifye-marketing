import type { Metadata } from 'next'
import { Crosshair, Scale } from 'lucide-react'
import { MarketingShell } from '@/components/MarketingShell'
import { ShowcaseSection } from '@/components/showcase/ShowcaseSection'
import { getShowcaseList } from '@/lib/marketingShowcase'

const SITE_URL = 'https://valifye.com'
const HUB_URL = `${SITE_URL}/digital-battlefield`

const PAGE_DESCRIPTION =
  'Forensic competitive intelligence and blue-ocean pivot playbooks for SaaS and AI operators. Every report exposes moats, pricing whitespace, complaint signals, and the recommended angle of attack.'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Digital Battlefield Hub | SaaS & AI Strategy Audits',
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: 'Digital Battlefield Hub | SaaS & AI Strategy Audits',
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: HUB_URL
  },
  alternates: {
    canonical: HUB_URL
  }
}

export default async function DigitalBattlefieldHubPage() {
  const reports = await getShowcaseList(['battlefield', 'pivot'])

  const battlefields = reports.filter((r) => r.template === 'battlefield')
  const pivots = reports.filter((r) => r.template === 'pivot')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Digital Battlefield Hub',
    description: PAGE_DESCRIPTION,
    url: HUB_URL,
    hasPart: reports.map((report) => ({
      '@type': 'Report',
      name: report.title,
      url: `${SITE_URL}/showcase/${report.slug}`,
      abstract: report.forensicVerdict
    }))
  }

  return (
    <MarketingShell className="max-w-[1280px] gap-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-5 border-b border-zinc-800/80 pb-10">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
          <Crosshair className="h-3.5 w-3.5" />
          Forensic SaaS Intelligence
        </p>
        <h1 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-5xl">
          Digital Battlefield Hub
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
          {PAGE_DESCRIPTION}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1 text-cyan-200">
            {battlefields.length} Competitive Battlefields
          </span>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/[0.06] px-3 py-1 text-indigo-200">
            {pivots.length} Pivot Playbooks
          </span>
        </div>
      </header>

      <ShowcaseSection
        title="Competitive Battlefields"
        description="Competitor maps, pricing whitespace, feature gaps, complaint mining, and the recommended angle of attack against incumbents."
        accentClassName="text-cyan-400/90"
        iconColorClassName="text-cyan-300"
        icon={<Crosshair className="h-3.5 w-3.5" />}
        reports={battlefields}
        emptyState="No competitive battlefield audits indexed yet."
      />

      <ShowcaseSection
        title="Blue Ocean Pivot Playbooks"
        description="Three forensic pivots per market with a recommended vector, new ICP, moat analysis, and a 30-day validation roadmap."
        accentClassName="text-indigo-400/90"
        iconColorClassName="text-indigo-300"
        icon={<Scale className="h-3.5 w-3.5" />}
        reports={pivots}
        emptyState="No pivot playbooks indexed yet."
      />
    </MarketingShell>
  )
}
