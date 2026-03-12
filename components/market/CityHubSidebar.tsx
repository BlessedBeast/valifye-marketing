import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CityHubSidebarProps {
  currentCity: string
  currentNiche: string
}

export async function CityHubSidebar({ currentCity, currentNiche }: CityHubSidebarProps) {
  // 🎯 DIRECT QUERY: We bypass the broken city_hubs JSON and fetch real, published ideas.
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, opportunity_score')
    .eq('city', currentCity)
    .eq('status', 'published') // Only show ideas that are actually live
    .neq('niche', currentNiche) // Don't show the one we are currently looking at
    .order('opportunity_score', { ascending: false }) // Show the best ones first
    .limit(4)

  if (error || !data || data.length === 0) {
    return null
  }

  const recommended = data

  const relatedTopicsLd = {
    '@context': 'https://schema.org',
    '@graph': recommended
      .filter((n) => n && typeof n.slug === 'string')
      .map((n) => ({
        '@type': 'RelatedTopic',
        name: typeof n.niche === 'string' ? n.niche : String(n.niche ?? ''),
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
        {recommended.map((n, idx) => {
          if (!n || typeof n.slug !== 'string') return null;
          const niche = typeof n.niche === 'string' ? n.niche : String(n.niche ?? '');
          return (
            <Link
              key={n.slug}
              href={`/ideas/${n.slug}`}
              className="group flex min-w-[200px] flex-col justify-between rounded-xl border border-border bg-background/80 px-3 py-3 text-xs transition-colors hover:border-primary/60 hover:bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="line-clamp-2 text-[13px] font-semibold text-foreground">
                    {niche}
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
          );
        })}
      </div>
    </aside>
  )
}