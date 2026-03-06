import { ArrowRight, Activity, Globe, ShieldAlert, Database, MapPin, Zap } from 'lucide-react'
import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValifyeButton } from '@/components/ui/valifye-button'
import { supabase } from '@/lib/supabase'

export const revalidate = 1800

const FEATURES = [
  { icon: Database, label: 'Thick Data Factory', copy: 'No generic trends. We surface exact regulatory shifts and capital movements for 2026.' },
  { icon: MapPin, label: 'Hyper-Local Unit Economics', copy: 'Rent impact, labor costs, and localized margins formatted for immediate GTM execution.' },
  { icon: ShieldAlert, label: 'Failure Mode Analysis', copy: 'We audit exactly why a niche will fail before you burn runway on a doomed build.' },
] as const

export default async function HomePage() {
  // supabase is now imported globally
  // Fetching the latest 3 forensic blueprints
  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score, difficulty_score')
    .eq('status', 'published')
    .order('published_at', { ascending: false }) // Sort by publish date, not creation
    .limit(3)

  if (error) {
    console.error('Supabase Fetch Error (home):', error)
  }

  const liveIdeas = data || []

  // Formatting for a more "Data-Dashboard" feel
  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? score : '—'

  return (
    <div className="min-h-screen bg-background text-foreground font-mono"> {/* Switch to a monospace/tech font if possible */}
      <ValifyeNavbar />

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1280px] flex-col gap-20 px-4 py-10 md:px-10 md:py-16 lg:py-20">
        
        {/* HERO: The Forensic Intelligence Lab */}
        <section className="relative grid gap-10 border border-border bg-card p-6 text-left shadow-[4px_4px_0_0_hsl(var(--primary))] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:p-12">
          
          {/* Subtle grid background pattern */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-foreground bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="h-3 w-3 fill-primary" />
              <span>System Live: 1,000+ Blueprints Indexed</span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tighter md:text-6xl lg:text-7xl">
              Stop building in the dark.
              <br />
              <span className="text-muted-foreground">Audit the market.</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Valifye is a forensic intelligence database for founders. We process regulatory mandates, local infrastructure friction, and capital shifts to generate high-fidelity market blueprints. 
              <br className="hidden md:block" />
              <br className="hidden md:block" />
              We don't tell you what to build. <span className="text-foreground font-semibold">We tell you exactly why you will fail.</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/ideas">
                <ValifyeButton className="rounded-none bg-primary px-8 py-6 text-primary-foreground hover:bg-primary/90 font-bold tracking-widest uppercase" size="lg">
                  Access Intelligence Database
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ValifyeButton>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES: Emphasize the "Thick Data" */}
        <section className="grid gap-8 md:grid-cols-3 border-t border-border pt-12">
            {FEATURES.map((feature, idx) => (
                <div key={idx} className="space-y-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-lg font-bold uppercase tracking-wider">{feature.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.copy}</p>
                </div>
            ))}
        </section>

        {/* RECENT INTELLIGENCE: The Blueprints */}
        <section className="space-y-6 pt-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-foreground">Latest Forensic Blueprints</span>
            </div>
            <Link href="/ideas" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Query All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {liveIdeas.map((idea) => (
              <Link 
                key={idea.slug} 
                href={`/ideas/${idea.slug}`} 
                className="group relative flex flex-col justify-between border border-border bg-card p-6 text-left transition-all hover:border-primary hover:-translate-y-1 hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
              >
                <div className="mb-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {idea.city}
                    </span>
                    {/* Visual Indicator for Opportunity Score */}
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Opp Score:</span>
                        <span className={`text-xs font-black ${idea.opportunity_score && idea.opportunity_score > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                            {formatScore(idea.opportunity_score)}
                        </span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {idea.niche}
                  </h3>
                </div>
                
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Diff Score:</span>
                        <span className="text-xs font-black text-red-500">{formatScore(idea.difficulty_score)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                        Read Audit <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <ValifyeFooter />
    </div>
  )
}