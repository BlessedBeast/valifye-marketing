import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase' // 🎯 Use Singleton

interface CityHubSidebarProps {
  currentCity: string
  currentNiche: string
}

type HubNiche = {
  slug: string
  niche: string
  opportunity_score: number | null
}

export async function CityHubSidebar({ currentCity, currentNiche }: CityHubSidebarProps) {
  // 🚨 createClient() REMOVED.
  
  const { data, error } = await supabase
    .from('city_hubs')
    .select('top_niches')
    .eq('city_name', currentCity)
    .maybeSingle()

  if (error || !data || !Array.isArray(data.top_niches)) {
    return null
  }

  const niches: HubNiche[] = (data.top_niches as HubNiche[]).filter(
    (n) => n.niche && n.niche !== currentNiche
  )

  if (!niches.length) {
    return null
  }

  const recommended = niches.slice(0, 4)

  const relatedTopicsLd = {
    '@context': 'https://schema.org',
    '@graph': recommended.map((n) => ({
      '@type': 'RelatedTopic',
      name: n.niche,
      url: `https://valifye.com/ideas/${n.slug}`
    }))
  }

  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? `${score}/100` : '—'

  return (
    <aside className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedTopicsLd) }}
      />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Recommended opportunities in {currentCity}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            High-signal niches nearby in your city&apos;s knowledge graph.
          </p>
        </div>
      </div>

      <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
        {recommended.map((n) => (
          <Link
            key={n.slug}
            href={`/ideas/${n.slug}`}
            className="group flex min-w-[200px] flex-col justify-between rounded-xl border border-border bg-background/80 px-3 py-3 text-xs transition-colors hover:border-primary/60 hover:bg-card"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="line-clamp-2 text-[13px] font-semibold text-foreground">
                  {n.niche}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Opportunity score
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-2 text-right text-[11px] font-semibold text-foreground">
              {formatScore(n.opportunity_score)}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}