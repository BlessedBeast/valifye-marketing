import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Crosshair, MapPin } from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { createClient } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = 'https://valifye.com'
const HUB_URL = `${SITE_URL}/markets`

const PAGE_DESCRIPTION =
  'Published forensic market blueprints by region, sector, and business model — evidence-bound intelligence for operators and answer engines.'

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

type BlueprintListRow = {
  region_key: string
  sector: string
  business_model: string
  meta_title: string
}

/** Aligns path segments with `build_slug` / `slugify_part` in `scripts/generate_market_blueprints.py`. */
function slugifyPart(value: string): string {
  const s = (value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'unknown'
}

function blueprintHref(row: BlueprintListRow): string {
  const r = slugifyPart(row.region_key)
  const s = slugifyPart(row.sector)
  const m = slugifyPart(row.business_model)
  return `/markets/${r}/${s}/${m}`
}

function groupByRegion(rows: BlueprintListRow[]): Map<string, BlueprintListRow[]> {
  const map = new Map<string, BlueprintListRow[]>()
  for (const row of rows) {
    const key = row.region_key
    const list = map.get(key)
    if (list) list.push(row)
    else map.set(key, [row])
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.meta_title.localeCompare(b.meta_title))
  }
  return map
}

async function fetchPublishedBlueprintIndex(): Promise<BlueprintListRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('local_business_blueprints')
    .select('region_key, sector, business_model, meta_title')
    .eq('status', 'published')

  if (error) {
    console.error('[markets] blueprint index:', error.message)
    return []
  }
  return Array.isArray(data) ? (data as BlueprintListRow[]) : []
}

export default async function MarketsDirectoryPage() {
  const rows = await fetchPublishedBlueprintIndex()
  const byRegion = groupByRegion(rows)
  const regionKeys = [...byRegion.keys()].sort((a, b) => a.localeCompare(b))

  return (
    <MarketingShell className="max-w-4xl gap-12 px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <header className="space-y-6 border-b border-zinc-800/80 pb-10">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            <Crosshair className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
            Market intelligence directory
          </p>
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-4xl">
              Global market blueprints
            </h1>
            <p className="max-w-2xl font-serif text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              {PAGE_DESCRIPTION}
            </p>
          </div>
          <p className="font-mono text-xs text-zinc-600">
            {rows.length} published entr{rows.length === 1 ? 'y' : 'ies'}
            {regionKeys.length > 0 ? ` · ${regionKeys.length} region${regionKeys.length === 1 ? '' : 's'}` : ''}
          </p>
        </header>

        {regionKeys.length === 0 ? (
          <div
            className="rounded-xl border border-zinc-800/90 bg-[#09090b] p-8 text-center shadow-[0_0_60px_-24px_rgba(245,158,11,0.1)]"
            role="status"
          >
            <p className="font-serif text-sm text-zinc-400">
              No published blueprints yet. Check back after the matrix synthesis run.
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {regionKeys.map((regionKey, regionIdx) => {
              const items = byRegion.get(regionKey) ?? []
              const regionHeadingId = `markets-region-${regionIdx}`
              return (
                <section
                  key={regionKey}
                  aria-labelledby={regionHeadingId}
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/60 pb-4">
                    <MapPin
                      className="h-4 w-4 shrink-0 text-amber-500/80"
                      aria-hidden
                    />
                    <h2
                      id={regionHeadingId}
                      className="font-mono text-sm font-bold uppercase tracking-wide text-zinc-200"
                    >
                      {regionKey}
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      {items.length} blueprint{items.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <ul className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {items.map((row) => {
                      const href = blueprintHref(row)
                      return (
                        <li key={`${row.region_key}|${row.sector}|${row.business_model}`}>
                          <Link
                            href={href}
                            className={cn(
                              'group flex h-full flex-col justify-between gap-4 rounded-lg border border-zinc-800/90 bg-[#09090b] p-5',
                              'shadow-[0_0_48px_-20px_rgba(245,158,11,0.08)] transition-colors',
                              'hover:border-amber-500/25 hover:bg-zinc-950/80',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40'
                            )}
                          >
                            <div className="min-w-0 space-y-2">
                              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                {row.sector}
                                <span className="text-zinc-700"> · </span>
                                {row.business_model}
                              </p>
                              <p className="font-serif text-base font-semibold leading-snug text-zinc-100 md:text-[17px]">
                                {row.meta_title}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-amber-500/90">
                              Open dossier
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
                </section>
              )
            })}
          </div>
        )}
      </div>
    </MarketingShell>
  )
}
