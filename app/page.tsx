

import { ArrowRight, Check, Target, Timer, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { ValifyeButton } from '@/components/ui/valifye-button'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 1800

const FEATURES = [
  { icon: Zap, label: 'Brutal Validation', copy: 'No fluff, no vibes. Only hard signals that tell you if anyone actually cares.' },
  { icon: Target, label: 'Market Fit Radar', copy: 'See exactly which segment is reacting — and which ones are ignoring you.' },
  { icon: Users, label: 'Customer Truth Engine', copy: 'Structured conversations that force prospects to reveal what they would really pay for.' },
  { icon: Timer, label: '7‑Day Sprint', copy: 'A brutally clear week-long playbook that forces a verdict instead of endless tinkering.' },
  { icon: Check, label: 'BUILD / PIVOT / KILL', copy: 'Your idea leaves with a label. No maybes. No “we’ll see”.' },
  { icon: ArrowRight, label: 'Deployed Test Pages', copy: 'Launch validation pages in minutes with copy tuned for brutal honesty, not vanity clicks.' },
  { icon: Users, label: 'Signal Board', copy: 'Every “yes”, “no”, and “maybe” is logged, scored, and visualized in one brutal dashboard.' },
  { icon: Target, label: 'Offer Stress‑Test', copy: 'Push pricing, positioning, and promise until they break — before your runway does.' },
  { icon: Timer, label: 'Runway Protector', copy: 'Protect the next 6 months of your life by killing bad ideas in week one.' }
] as const

export default async function HomePage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Supabase Fetch Error (home):', error)
  }

  const liveIdeas = data || []

  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? `${score}/100` : '—'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ValifyeNavbar />

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1280px] flex-col gap-16 px-4 py-10 md:px-10 md:py-16 lg:py-20">
        {/* HERO */}
        <section className="relative grid gap-10 border border-border bg-card p-6 text-left shadow-[0_0_0_3px_hsl(var(--foreground))] md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:p-10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary))/8,_transparent_60%),_radial-gradient(circle_at_bottom_right,_hsl(var(--primary))/6,_transparent_55%)]" />

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Brutal startup validation, no fluff</span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Brutal truth for your next startup idea.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Valifye is a brutal validation system for founders who are done building in the dark. In 7 days you&apos;ll
              know whether to <span className="font-semibold text-foreground">BUILD</span>,{' '}
              <span className="font-semibold text-foreground">PIVOT</span>, or{' '}
              <span className="font-semibold text-foreground">KILL</span> your idea.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/ideas">
                <ValifyeButton className="bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                  Get Brutal Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ValifyeButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Market Interrogations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>Live Market Interrogations</span>
            <Link href="/ideas" className="inline-flex items-center gap-1 text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {liveIdeas.map((idea) => (
              <Link 
                key={idea.slug} 
                href={`/ideas/${idea.slug}`} 
                className="group flex flex-col justify-between border border-border bg-card p-4 text-left transition-colors hover:border-primary/60"
              >
                <div className="mb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{idea.niche}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {idea.city}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Opportunity score {formatScore(idea.opportunity_score)}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                  View Blueprint <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}