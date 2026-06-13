import type { Metadata } from 'next'

import { MarketingShell } from '@/components/MarketingShell'
import { PseoHubGrid } from '@/components/pseo/PseoHubGrid'
import { validationGuidePath } from '@/lib/validationGuideData'
import { SITE_URL } from '@/lib/seo'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Validation Execution Guides | Valifye',
  description:
    'Step-by-step validation playbooks — smoke tests, landing page experiments, and pre-sales frameworks.',
  alternates: { canonical: `${SITE_URL}/validation-guides` },
}

type HubRow = {
  slug: string
  meta_title: string | null
  guide_title: string | null
  startup_type: string | null
  time_to_validate: string | null
}

export default async function ValidationGuidesHubPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('validation_guide_pages')
    .select('slug, meta_title, guide_title, startup_type, time_to_validate')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[validation-guides hub] Fetch failed:', error.message)
  }

  const rows = (data ?? []) as HubRow[]

  return (
    <MarketingShell className="max-w-6xl gap-10">
      <header className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
          Intelligence Hub · Playbooks
        </p>
        <h1 className="text-3xl font-black text-white md:text-4xl">Validation Execution Guides</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
          Step-by-step instructions for smoke tests, message testing, and pre-sales validation.
        </p>
        <p className="font-mono text-[11px] text-[#4b5563]">
          {rows.length} published {rows.length === 1 ? 'guide' : 'guides'}
        </p>
      </header>

      <PseoHubGrid
        items={rows.map((row) => ({
          href: validationGuidePath(row.slug),
          title: row.meta_title ?? row.guide_title ?? row.slug,
          subtitle: row.guide_title ?? undefined,
          badge: row.startup_type
            ? `${row.startup_type}${row.time_to_validate ? ` · ${row.time_to_validate}` : ''}`
            : row.time_to_validate ?? undefined,
        }))}
      />
    </MarketingShell>
  )
}
