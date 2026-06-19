import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import { indiaShouldIBuildPath } from '@/lib/indiaShouldIBuildData'
import { SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Build / Pivot / Kill Verdicts | Valifye',
  description:
    'Core risk assessments analyzing whether a product idea justifies development overhead.',
  alternates: { canonical: `${SITE_URL}/india/digital-battlefield/build-verdicts` },
}

type HubRow = {
  slug: string
  meta_title: string | null
  product_name: string | null
  verdict: string | null
  whitespace_score: number | null
}

export default async function BuildVerdictsHubPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('india_should_i_build_pages')
    .select('slug, meta_title, product_name, verdict, whitespace_score')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[india/digital-battlefield/build-verdicts hub] Fetch failed:', error.message)
  }

  const rows = (data ?? []) as HubRow[]

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Decision Engine
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">Build / Pivot / Kill Matrix</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Should you build it? Forensic verdicts with whitespace scores, risk registers, and first
          steps for every indexed product idea.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'verdict' : 'verdicts'}
        </p>
      </header>

      <PseoHubGrid
        items={rows.map((row) => ({
          href: indiaShouldIBuildPath(row.slug),
          title: row.meta_title ?? row.product_name ?? row.slug,
          subtitle: row.product_name ?? undefined,
          badge: row.verdict
            ? `${row.verdict}${row.whitespace_score != null ? ` · ${row.whitespace_score}/10` : ''}`
            : row.whitespace_score != null
              ? `Whitespace ${row.whitespace_score}/10`
              : undefined,
        }))}
      />
    </MarketingShell>
  )
}
