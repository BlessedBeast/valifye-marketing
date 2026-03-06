import Link from 'next/link'
import { ArrowRight, Database, Globe, Search, ShieldAlert, Zap, Activity } from 'lucide-react'
import { ValifyeButton } from '@/components/ui/valifye-button'
import { supabase } from '@/lib/supabase'

export const revalidate = 1800 // Revalidate every 30 mins

type ArchiveIdea = {
  slug: string
  niche: string
  city: string
  opportunity_score: number | null
  difficulty_score: number | null // Added this for the brutalist UI
}

export default async function IdeasArchivePage() {
  // supabase is now imported globally

  // Fetch the latest published blueprints
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score, difficulty_score, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false }) // Changed to published_at
    .limit(24) // Increased from 6 to 24 to look like a real database

  if (error) {
    console.error('Supabase Fetch Error (ideas archive):', error)
  }

  // Fetch City Graph data (Assuming you have a 'city_graphs' table from your python script)
  // If your table has different column names, update 'city_name' and 'niche_count' below
  const { data: cityData } = await supabase
    .from('city_graphs')
    .select('city_name, niche_count')
    .order('niche_count', { ascending: false })
    .limit(5)

  const ideas: ArchiveIdea[] = !error && data ? (data as ArchiveIdea[]) : []
  const topCities = cityData || []

  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? score : '—'

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 font-mono text-foreground md:flex-row md:items-start pt-6">
      
      {/* LEFT SIDEBAR: City Graphs & Market Hubs */}
      <aside className="w-full shrink-0 space-y-6 md:w-64 lg:w-72">
        <div className="border border-border bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Active Hubs</h2>
          </div>
          
          <ul className="space-y-3">
            {topCities.length > 0 ? (
              topCities.map((hub, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{hub.city_name}</span>
                  <span className="font-bold text-foreground">{hub.niche_count}</span>
                </li>
              ))
            ) : (
              // Fallback UI if city_graphs table is empty or missing
              <>
                <li className="flex items-center justify-between text-sm"><span className="text-muted-foreground">San Francisco</span><span className="font-bold">42</span></li>
                <li className="flex items-center justify-between text-sm"><span className="text-muted-foreground">London</span><span className="font-bold">38</span></li>
                <li className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Mumbai</span><span className="font-bold">29</span></li>
                <li className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Berlin</span><span className="font-bold">15</span></li>
              </>
            )}
          </ul>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Validator Note</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Scores are calculated based on local friction, regulatory walls, and 2026 capital availability. Proceed with caution.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT: The Database Feed */}
      <main className="flex-1 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4 border border-border bg-card px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-foreground bg-background">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Live Database
              </p>
              <h1 className="text-2xl font-black tracking-tighter md:text-3xl uppercase">
                Forensic Blueprints
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Query market..." 
                className="h-10 border border-border bg-background pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled
              />
            </div>
          </div>
        </header>

        {/* LISTINGS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">
            <span>{ideas.length} Blueprints Indexed</span>
            <span className="inline-flex items-center gap-2 text-primary">
              <Zap className="h-3 w-3" /> System Live
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <Link
                key={idea.slug}
                href={`/ideas/${idea.slug}`}
                className="group relative flex flex-col justify-between border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
              >
                <div className="mb-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {idea.city}
                    </span>
                    {/* Visual Indicator for Opportunity Score */}
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Opp:</span>
                        <span className={`text-xs font-black ${idea.opportunity_score && idea.opportunity_score > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                            {formatScore(idea.opportunity_score)}
                        </span>
                    </div>
                  </div>
                  
                  <h2 className="text-sm font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {idea.niche}
                  </h2>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>Diff:</span>
                    <span className="text-red-500">{formatScore(idea.difficulty_score)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-primary">
                    Open File
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}