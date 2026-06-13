import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import { localOpportunityPath } from '@/lib/localOpportunityData'
import { SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Regional Opportunity Maps | Valifye',
  description:
    'Hyper-local startup opportunity maps — regional business clusters and demand gaps by city.',
  alternates: { canonical: `${SITE_URL}/local-opportunities` },
}

type HubRow = {
  slug: string
  meta_title: string | null
  city_name: string | null
  state_or_country: string | null
  overall_opportunity_score: number | null
}

export default async function LocalOpportunitiesHubPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('local_opportunity_pages')
    .select('slug, meta_title, city_name, state_or_country, overall_opportunity_score')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[local-opportunities hub] Fetch failed:', error.message)
  }

  const rows = (data ?? []) as HubRow[]

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Localized
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">Regional Opportunity Maps</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Regional business clusters matching hyper-local demand gaps — best niches, sectors to avoid,
          and ecosystem signals by city.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'map' : 'maps'}
        </p>
      </header>

      <PseoHubGrid
        items={rows.map((row) => ({
          href: localOpportunityPath(row.slug),
          title: row.meta_title ?? row.city_name ?? row.slug,
          subtitle:
            row.city_name && row.state_or_country
              ? `${row.city_name}, ${row.state_or_country}`
              : row.city_name ?? undefined,
          badge:
            row.overall_opportunity_score != null
              ? `Opportunity ${row.overall_opportunity_score}/10`
              : undefined,
        }))}
      />
    </MarketingShell>
  )
}
