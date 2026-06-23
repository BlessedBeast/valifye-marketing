import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import {
  getIndiaProfitableNicheHubRows,
  indiaProfitableNichePath,
  type IndiaProfitableNicheHubRow,
} from '@/lib/indiaProfitableNicheData'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Profitable Niches | Valifye',
  description:
    'Forensic profitability scans for bootstrapping founders — cost-to-fee breakdowns, whitespace scores, and BUILD / PIVOT / KILL verdicts.',
  alternates: { canonical: `${SITE_URL}/india/digital-battlefield/profitable-niches` },
}

function mapHubGridItems(rows: IndiaProfitableNicheHubRow[]) {
  return rows.map((row) => ({
    href: indiaProfitableNichePath(row.slug),
    title: row.meta_title || row.niche_name || row.slug,
    subtitle: row.niche_name || undefined,
    badge: row.verdict
      ? `${row.verdict}${
          row.whitespace_score != null ? ` · ${row.whitespace_score}/10` : ''
        }`
      : row.whitespace_score != null
        ? `Whitespace ${row.whitespace_score}/10`
        : undefined,
  }))
}

export default async function ProfitableNichesHubPage() {
  const rows = await getIndiaProfitableNicheHubRows()

  let gridItems: ReturnType<typeof mapHubGridItems> = []

  try {
    gridItems = mapHubGridItems(rows)
  } catch (error) {
    console.error(
      '[india/digital-battlefield/profitable-niches hub] Grid mapping failed:',
      error
    )
  }

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Profitability
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">Profitable Niches</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Granular monetization viability scans — whitespace scores, demand signals, and forensic
          verdicts for every indexed niche.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'report' : 'reports'}
        </p>
      </header>

      <PseoHubGrid items={gridItems} />
    </MarketingShell>
  )
}
