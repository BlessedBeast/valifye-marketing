import Link from 'next/link'
import { getIndustryHubBySectorSlug, getReportsBySlugs } from '@/lib/reportData'

type Props = {
  sectorSlug: string | null
  excludeSlug: string
}

export async function IndustryIntelligenceBridge({ sectorSlug, excludeSlug }: Props) {
  if (!sectorSlug) {
    return null
  }

  const hub = await getIndustryHubBySectorSlug(sectorSlug)
  if (!hub || !Array.isArray(hub.all_slugs) || hub.all_slugs.length === 0) {
    return null
  }

  const candidateSlugs = hub.all_slugs.filter(
    (s) => typeof s === 'string' && s && s !== excludeSlug,
  )

  if (candidateSlugs.length === 0) {
    return null
  }

  const relatedReports = await getReportsBySlugs(candidateSlugs.slice(0, 6))
  if (!relatedReports.length) {
    return null
  }

  const formatScore = (score: number | null | undefined) =>
    score != null && Number.isFinite(score) ? `${Math.round(score)}/100` : '—'

  return (
    <section className="mb-10 mt-12 border-t border-zinc-800 pt-8">
      <div className="mb-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500">
        <span className="text-sky-400">
          Sector Intelligence · {hub.industry_name}
        </span>
        <span className="text-zinc-600">
          {hub.report_count} files in sector archive
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {relatedReports.map((r) => (
          <Link
            key={r.slug}
            href={`/reports/${r.slug}`}
            className="flex flex-col justify-between border border-zinc-800 bg-[#050712] p-4 text-xs text-zinc-100 transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:bg-[#050915]"
          >
            <div className="space-y-2">
              <span className="inline-block border border-sky-500/60 bg-sky-500/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-[0.24em] text-sky-300">
                Parallel Verdict
              </span>
              <p className="line-clamp-2 text-[12px] font-semibold text-zinc-50">
                {r.idea_title}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Integrity</span>
              <span className="text-zinc-100">{formatScore(r.overall_integrity_score)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

