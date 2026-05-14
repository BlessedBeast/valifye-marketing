import { unstable_noStore } from 'next/cache'

import { getRecentAeoScans } from '@/lib/aeoScans'
import { getRecentBpkAudits } from '@/lib/bpkAudits'

export type BlueprintFeedItem = {
  kind: 'bpk' | 'aeo'
  slug: string
  created_at: string
  preview: string
  verdict_status: string | null
}

function parseCreatedMs(iso: string): number {
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * Merge the latest rows from `bpk_audits` and `aeo_scans`, newest first (cap `limit`).
 */
export async function getBlueprintFeed(limit = 50): Promise<BlueprintFeedItem[]> {
  unstable_noStore()

  const [bpkRows, aeoRows] = await Promise.all([
    getRecentBpkAudits(50),
    getRecentAeoScans(50)
  ])

  const items: BlueprintFeedItem[] = [
    ...bpkRows.map((row) => ({
      kind: 'bpk' as const,
      slug: row.slug,
      created_at: row.created_at,
      preview: row.idea_input?.trim() || row.slug.replace(/-/g, ' '),
      verdict_status: row.verdict_status
    })),
    ...aeoRows.map((row) => ({
      kind: 'aeo' as const,
      slug: row.slug,
      created_at: row.created_at,
      preview: row.target_url?.trim() || row.slug.replace(/-/g, ' '),
      verdict_status: row.verdict_status
    }))
  ]

  items.sort((a, b) => parseCreatedMs(b.created_at) - parseCreatedMs(a.created_at))
  return items.slice(0, limit)
}
