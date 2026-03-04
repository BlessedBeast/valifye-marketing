import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ValidationBlueprintDashboard } from '@/components/market/ValidationBlueprint'
import { BenchmarkingModule } from '@/components/market/BenchmarkingModule'
import { RelatedMarkets } from '@/components/market/RelatedMarkets'
import { getIdeaBySlug } from '@/lib/marketData'

type Props = { params: Promise<{ slug: string }> }

export default async function IdeaDossierPage({ params }: Props) {
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)

  if (!idea) {
    notFound()
  }

  const hasBlueprint = Array.isArray(idea.local_friction) && idea.local_friction.length > 0

  return (
    <div className="space-y-10">
      {/* TOP BAR */}
      <header className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-[11px] hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to archive
        </Link>
        <span className="inline-flex items-center gap-2">
          <span>Validation blueprint for</span>
          <span className="text-foreground">{idea.niche} in {idea.city}</span>
        </span>
      </header>

      {/* PRIMARY BLUEPRINT DASHBOARD / FALLBACK */}
      {hasBlueprint ? (
        <ValidationBlueprintDashboard idea={idea} />
      ) : (
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-foreground">
            Deep Validation Pending
          </h1>
          <p className="text-sm text-muted-foreground">
            This market has a legacy narrative but has not yet been fully converted into a thick Validation Blueprint.
            The current summary below is based on earlier research and will be upgraded with forensic local friction,
            GTM, and economic gauges in a future run.
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {idea.market_narrative}
          </p>
        </section>
      )}

      {/* CITY KNOWLEDGE GRAPH: Benchmarking + Related Markets */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <BenchmarkingModule
            currentCityScore={idea.opportunity_score}
            niche={idea.niche}
            region={idea.region ?? ''}
          />
        </div>
        <RelatedMarkets
          currentNiche={idea.niche}
          currentCity={idea.city}
          currentRegion={idea.region ?? ''}
        />
      </section>
    </div>
  )
}

