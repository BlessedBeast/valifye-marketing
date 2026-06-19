import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import { indiaSaasIdeasVerticalPath } from '@/lib/indiaSaasIdeasVerticalData'
import { SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'SaaS Vertical Playbooks | Valifye',
  description:
    'Ranked SaaS idea playbooks by industry vertical — sub-niche applications engineered around specific friction points.',
  alternates: { canonical: `${SITE_URL}/india/digital-battlefield/saas-verticals` },
}

type HubRow = {
  slug: string
  meta_title: string | null
  vertical_name: string | null
  vertical_market_size: string | null
}

export default async function SaasVerticalsHubPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('india_saas_ideas_vertical_pages')
    .select('slug, meta_title, vertical_name, vertical_market_size')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[india/digital-battlefield/saas-verticals hub] Fetch failed:', error.message)
  }

  const rows = (data ?? []) as HubRow[]

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Ideation
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">SaaS Vertical Playbooks</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Aggregated sub-niche SaaS ideas ranked by whitespace, verdict, and market timing for each
          industry vertical.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'vertical' : 'verticals'}
        </p>
      </header>

      <PseoHubGrid
        items={rows.map((row) => ({
          href: indiaSaasIdeasVerticalPath(row.slug),
          title: row.meta_title ?? row.vertical_name ?? row.slug,
          subtitle: row.vertical_name ?? undefined,
          badge: row.vertical_market_size ?? undefined,
        }))}
      />
    </MarketingShell>
  )
}
