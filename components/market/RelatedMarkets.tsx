import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

interface RelatedMarketsProps {
  currentNiche: string
  currentCity: string
  currentRegion: string
}

export async function RelatedMarkets({
  currentNiche,
  currentCity,
  currentRegion,
}: RelatedMarketsProps) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('market_data')
    .select('slug, city, opportunity_score, market_heat')
    .eq('niche', currentNiche)
    .eq('region', currentRegion)
    .neq('city', currentCity)
    .order('opportunity_score', { ascending: false })
    .limit(4)

  const neighbors =
    !error && data
      ? (data as {
          slug: string
          city: string
          opportunity_score: number | null
          market_heat: 'Hot' | 'Warm' | 'Cool' | string
        }[])
      : []

  if (!neighbors.length) {
    return null
  }

  const formatScore = (score: number | null | undefined) =>
    Number.isFinite(score) ? `${score}/100` : '—'

  const getHeatBadgeClass = (heat: string) => {
    if (heat === 'Hot') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (heat === 'Warm') return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    if (heat === 'Cool') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-muted text-muted-foreground border-border'
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">
        Explore Related {currentNiche} Markets
      </h3>
      <p className="text-xs text-muted-foreground">
        Other {currentRegion} cities where founders are exploring the same business model.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {neighbors.map((m) => (
          <article
            key={m.slug}
            className="flex flex-col gap-2 rounded-xl border border-border bg-background/70 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/ideas/${m.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-foreground underline-offset-2 hover:underline"
                title={`Analysis: ${currentNiche} in ${m.city}`}
              >
                <span>{m.city}</span>
                <ArrowUpRight size={11} className="text-muted-foreground" />
              </Link>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getHeatBadgeClass(
                  m.market_heat,
                )}`}
              >
                <span className="uppercase tracking-wide">Heat</span>
                <span>{m.market_heat}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="uppercase tracking-wide">Score</span>
              <span className="font-semibold text-foreground">
                {formatScore(m.opportunity_score)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

