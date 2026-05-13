import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Crosshair, MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { extractUsaStateCode, usaStateDisplayName } from '@/lib/marketsStateHub'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'
const HUB_URL = `${SITE_URL}/markets`

const PAGE_DESCRIPTION =
  'Browse forensic market blueprints by U.S. state — metro-level dossiers for high-ticket operators and answer engines.'

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

type StateHubRow = {
  stateCode: string
  blueprintCount: number
}

async function fetchStateHubSummaries(): Promise<StateHubRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('region_key')
    .eq('status', 'published')

  if (error) {
    console.error('[markets] state hubs:', error.message)
    return []
  }

  const counts = new Map<string, number>()
  for (const row of Array.isArray(data) ? data : []) {
    const rk = typeof row.region_key === 'string' ? row.region_key : ''
    const st = extractUsaStateCode(rk)
    if (!st) continue
    counts.set(st, (counts.get(st) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([stateCode, blueprintCount]) => ({ stateCode, blueprintCount }))
    .sort((a, b) => a.stateCode.localeCompare(b.stateCode))
}

export default async function MarketsDirectoryPage() {
  const hubs = await fetchStateHubSummaries()

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
              U.S. state market hubs
            </h1>
            <p className="max-w-2xl font-serif text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              {PAGE_DESCRIPTION}
            </p>
          </div>
          <p className="font-mono text-xs text-zinc-600">
            {hubs.length} state hub{hubs.length === 1 ? '' : 's'}
            {totalBlueprints > 0 ? ` · ${totalBlueprints} published blueprint${totalBlueprints === 1 ? '' : 's'}` : ''}
          </p>
        </header>

        {hubs.length === 0 ? (
          <div
            className="rounded-xl border border-zinc-800/90 bg-[#09090b] p-8 text-center shadow-[0_0_60px_-24px_rgba(245,158,11,0.1)]"
            role="status"
          >
            <p className="font-serif text-sm text-zinc-400">
              No published USA metro blueprints yet. Check back after the synthesis run.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hubs.map(({ stateCode, blueprintCount }) => {
              const name = usaStateDisplayName(stateCode)
              const href = `/markets/state/${stateCode.toLowerCase()}`
              return (
                <li key={stateCode}>
                  <Link
                    href={href}
                    className={cn(
                      'group flex h-full min-h-[9.5rem] flex-col justify-between gap-6 rounded-xl border border-zinc-800/90 bg-[#09090b] p-6',
                      'shadow-[0_0_56px_-22px_rgba(245,158,11,0.12)] transition-colors',
                      'hover:border-amber-500/30 hover:bg-zinc-950/85',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/45'
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <MapPin className="h-4 w-4 shrink-0 text-amber-500/85" aria-hidden />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          USA · {stateCode}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl font-black leading-snug text-zinc-50 md:text-2xl">
                        {name}{' '}
                        <span className="font-bold text-zinc-400">
                          Market Intelligence
                        </span>
                      </h2>
                      <p className="font-mono text-[11px] text-zinc-500">
                        {blueprintCount} forensic blueprint
                        {blueprintCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-amber-500/90">
                      Open state hub
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </MarketingShell>
  )
}
