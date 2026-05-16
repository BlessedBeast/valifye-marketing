import type { Metadata } from 'next'
import { Crosshair } from 'lucide-react'

import { MarketsStateHubCard } from '@/components/markets/MarketsStateHubCard'
import { MarketingShell } from '@/components/MarketingShell'
import {
  COUNTRY_SECTION_ORDER,
  countrySectionLabel,
  globalHubDisplayName,
  summarizeGlobalMarketHubs,
  type GlobalHubSummary
} from '@/lib/marketsStateHub'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'
const HUB_URL = `${SITE_URL}/markets`

const PAGE_DESCRIPTION =
  'Browse forensic market blueprints by global region — metro-level dossiers for high-ticket operators and answer engines.'

export const metadata: Metadata = {
  title: 'Global Market Intelligence Directory | Valifye',
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: 'Global Market Intelligence Directory | Valifye',
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: HUB_URL
  },
  alternates: {
    canonical: HUB_URL
  }
}

async function fetchPublishedRegionKeys(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('region_key')
    .eq('status', 'published')

  if (error) {
    console.error('[markets] region keys:', error.message)
    return []
  }

  const out: string[] = []
  for (const row of Array.isArray(data) ? data : []) {
    const rk = typeof row.region_key === 'string' ? row.region_key.trim() : ''
    if (rk) out.push(rk)
  }
  return out
}

function groupHubsByCountry(
  hubs: GlobalHubSummary[]
): { countryCode: string; hubs: GlobalHubSummary[] }[] {
  const map = new Map<string, GlobalHubSummary[]>()
  for (const h of hubs) {
    const list = map.get(h.countryCode)
    if (list) list.push(h)
    else map.set(h.countryCode, [h])
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.regionCode.localeCompare(b.regionCode))
  }

  const countryKeys = [...map.keys()].sort((a, b) => {
    const oa = COUNTRY_SECTION_ORDER.indexOf(a)
    const ob = COUNTRY_SECTION_ORDER.indexOf(b)
    const sa = oa === -1 ? 999 : oa
    const sb = ob === -1 ? 999 : ob
    if (sa !== sb) return sa - sb
    return countrySectionLabel(a).localeCompare(countrySectionLabel(b))
  })

  return countryKeys.map((countryCode) => ({
    countryCode,
    hubs: map.get(countryCode) ?? []
  }))
}

export default async function MarketsDirectoryPage() {
  const regionKeys = await fetchPublishedRegionKeys()
  const hubs = summarizeGlobalMarketHubs(regionKeys)
  const sections = groupHubsByCountry(hubs)

  const totalBlueprints = hubs.reduce((acc, h) => acc + h.blueprintCount, 0)

  return (
    <MarketingShell className="max-w-5xl gap-12 px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <header className="space-y-6 border-b border-zinc-800/80 pb-10">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            <Crosshair className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
            Market intelligence directory
          </p>
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-4xl">
              Global Market Hubs
            </h1>
            <p className="max-w-2xl font-serif text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              {PAGE_DESCRIPTION}
            </p>
          </div>
          <p className="font-mono text-xs text-zinc-600">
            {hubs.length} market hub{hubs.length === 1 ? '' : 's'}
            {sections.length > 0
              ? ` · ${sections.length} ${sections.length === 1 ? 'country' : 'countries'}`
              : ''}
            {totalBlueprints > 0
              ? ` · ${totalBlueprints} published blueprint${totalBlueprints === 1 ? '' : 's'}`
              : ''}
          </p>
        </header>

        {hubs.length === 0 ? (
          <div
            className="rounded-xl border border-zinc-800/90 bg-[#09090b] p-8 text-center shadow-[0_0_60px_-24px_rgba(245,158,11,0.1)]"
            role="status"
          >
            <p className="font-serif text-sm text-zinc-400">
              No published market blueprints yet. Check back after the synthesis run.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {sections.map(({ countryCode, hubs: countryHubs }) => (
              <section
                key={countryCode}
                aria-labelledby={`country-${countryCode}`}
                className="space-y-6"
              >
                <h2
                  id={`country-${countryCode}`}
                  className="border-b border-zinc-800/60 pb-3 font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500/90"
                >
                  {countrySectionLabel(countryCode)}
                </h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {countryHubs.map(({ regionCode, blueprintCount }) => {
                    const name = globalHubDisplayName(countryCode, regionCode)
                    const href = `/markets/state/${regionCode.toLowerCase()}`
                    return (
                      <li key={`${countryCode}|${regionCode}`} className="h-full">
                        <MarketsStateHubCard
                          href={href}
                          metaLine={`${countryCode} · ${regionCode}`}
                          hubDisplayName={name}
                          blueprintCount={blueprintCount}
                          className="h-full"
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </MarketingShell>
  )
}
