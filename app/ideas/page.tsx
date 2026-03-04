'use server'

import Link from 'next/link'
import { ArrowRight, FolderKanban, PlusCircle, Timer, Zap } from 'lucide-react'
import { ValifyeButton } from '@/components/ui/valifye-button'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 3600

type ArchiveIdea = {
  slug: string
  niche: string
  city: string
  opportunity_score: number | null
}

export default async function IdeasArchivePage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('market_data')
    .select('slug, niche, city, opportunity_score, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Supabase Fetch Error (ideas archive):', error)
  }
  console.log('Fetched archive rows:', data?.length ?? 0)

  const ideas: ArchiveIdea[] = !error && data ? (data as ArchiveIdea[]) : []

  const formatScore = (score: number | null | undefined) =>
    typeof score === 'number' && Number.isFinite(score) ? `${score}/100` : '—'

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border border-border bg-card px-5 py-5 shadow-[3px_3px_0_0_hsl(var(--foreground))] md:flex-row md:items-center md:justify-between md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Validation Archive
            </p>
            <h1 className="text-xl font-black tracking-tight md:text-2xl">
              Your Interrogations
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ValifyeButton className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Start New Validation
          </ValifyeButton>
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Timer className="h-3 w-3" />
            7‑Day brutal sprints only
          </span>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Active &amp; past ideas</span>
          <span className="inline-flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Brutal reality dashboard
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ideas.map((idea) => (
            <Link
              key={idea.slug}
              href={`/ideas/${idea.slug}`}
              className="group flex flex-col justify-between border border-border bg-card p-4 text-left transition-colors hover:border-primary/60"
            >
              <div className="mb-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
                    {idea.niche}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {idea.city}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Opportunity score {formatScore(idea.opportunity_score)}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span>{idea.city}</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  View dossier
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

