import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import { marketSaturationPath } from '@/lib/marketSaturationData'
import { SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Market Saturation Audits | Valifye',
  description:
    'Crowding density and defensive positioning metrics — forensic saturation audits for competitive markets.',
  alternates: { canonical: `${SITE_URL}/market-saturation` },
}

type HubRow = {
  slug: string
  meta_title: string | null
  market_name: string | null
  saturation_score: number | null
  saturation_verdict: string | null
}

export default async function MarketSaturationHubPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('market_saturation_pages')
    .select('slug, meta_title, market_name, saturation_score, saturation_verdict')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[market-saturation hub] Fetch failed:', error.message)
  }

  const rows = (data ?? []) as HubRow[]

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Competition
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">Market Saturation Audits</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Crowding density, competitor maps, and whitespace angles for oversaturated markets.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'audit' : 'audits'}
        </p>
      </header>

      <PseoHubGrid
        items={rows.map((row) => ({
          href: marketSaturationPath(row.slug),
          title: row.meta_title ?? row.market_name ?? row.slug,
          subtitle: row.market_name ?? undefined,
          badge: row.saturation_verdict
            ? `${row.saturation_verdict}${row.saturation_score != null ? ` · ${row.saturation_score}/10` : ''}`
            : row.saturation_score != null
              ? `Saturation ${row.saturation_score}/10`
              : undefined,
        }))}
      />
    </MarketingShell>
  )
}
