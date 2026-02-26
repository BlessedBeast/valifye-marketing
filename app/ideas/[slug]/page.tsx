import { CompetitorDensityChart } from '@/components/competitor-density-chart'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 86400

type PageProps = {
  params: Promise<{ slug: string }>
}

const formatCurrency = (value: unknown) => {
  if (typeof value !== 'number') return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

const formatNumber = (value: unknown) => {
  if (typeof value !== 'number') return '—'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value)
}

export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('market_data')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  const heatBadgeClass: Record<string, string> = {
    Hot: 'bg-red-500 text-white',
    Warm: 'bg-orange-500 text-white',
    Cool: 'bg-blue-500 text-white'
  }

  const heatBorderClass: Record<string, string> = {
    Hot: 'border-l-4 border-red-500',
    Warm: 'border-l-4 border-orange-500',
    Cool: 'border-l-4 border-blue-500'
  }

  const badgeVariant =
    heatBadgeClass[data.market_heat as keyof typeof heatBadgeClass] ??
    'bg-muted text-foreground'

  const borderVariant =
    heatBorderClass[data.market_heat as keyof typeof heatBorderClass] ??
    'border-l-4 border-border'

  const tamFormatted = formatCurrency(data.estimated_tam)
  const competitorsFormatted = formatNumber(data.local_competitors)
  const confidenceDisplay =
    typeof data.confidence === 'number'
      ? `${data.confidence}%`
      : (data.confidence as string) || '—'

  const saturationScore =
    typeof data.saturation_score === 'number' ? data.saturation_score : 0
  const saturationSafe = Math.min(Math.max(saturationScore, 0), 100)

  const saturationColor =
    saturationSafe < 40
      ? 'bg-emerald-500'
      : saturationSafe <= 70
      ? 'bg-yellow-400'
      : 'bg-red-500'

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 font-sans text-foreground md:py-16">
      {/* HERO */}
      <section className="mb-10 space-y-4 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeVariant}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span>{data.market_heat || 'Market heat'}</span>
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
            {data.niche} Business in {data.city}: Market Analysis &amp;
            Validation
          </h1>

          <p className="text-sm text-muted-foreground md:text-base">
            {formatNumber(data.local_competitors)} competitors · TAM:{' '}
            {tamFormatted} · Confidence: {confidenceDisplay}
          </p>

          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {data.market_narrative}
          </p>
        </div>
      </section>

      {/* STATS + SATURATION */}
      <section className="mb-10 space-y-6 md:mb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            value={tamFormatted}
            label="Estimated TAM"
            borderVariant={borderVariant}
          />
          <StatCard
            value={competitorsFormatted}
            label="Local competitors"
            borderVariant={borderVariant}
          />
          <StatCard
            value={confidenceDisplay}
            label="Data confidence"
            borderVariant={borderVariant}
          />
        </div>

        <div className="space-y-2 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Market saturation
            </p>
            <span className="text-xs font-medium text-muted-foreground">
              {saturationSafe}%
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={`h-2 rounded-full ${saturationColor}`}
              style={{ width: `${saturationSafe}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Low competition</span>
            <span>Highly saturated</span>
          </div>
        </div>

        <CompetitorDensityChart saturationScore={saturationSafe} />
      </section>

      {/* COMPLAINTS / GAPS */}
      {data.top_complaints?.length > 0 && (
        <section className="mb-10 space-y-4 md:mb-12">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Why customers leave existing {data.niche} businesses in {data.city}
          </h2>

          <div className="space-y-3">
            {data.top_complaints.map((complaint: string, i: number) => (
              <article
                key={i}
                className="flex items-start gap-2 rounded-lg border border-border border-l-4 border-l-orange-500 bg-card px-4 py-3 text-sm text-foreground"
              >
                <span
                  aria-hidden
                  className="mt-0.5 text-xs text-muted-foreground"
                >
                  ⚠️
                </span>
                <p className="text-sm leading-relaxed">{complaint}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* RELATED LINKS */}
      {data.related_niches?.length > 0 && (
        <section className="mb-10 space-y-3 md:mb-12">
          <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Related markets in {data.city}
          </h3>

          <ul className="flex flex-wrap gap-2">
            {data.related_niches.map((niche: string) => {
              const relatedSlug =
                niche.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
                '-in-' +
                data.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')

              return (
                <li key={niche}>
                  <a
                    href={`/ideas/${relatedSlug}`}
                    className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    <span>{niche}</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* EMAIL GATE CTA */}
      <section className="mb-4 rounded-2xl border bg-card px-5 py-6 text-center md:px-8 md:py-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Join 478 founders
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Join 478 founders who&apos;ve validated ideas with Valifye.
        </p>

        <h2 className="mb-2 text-lg font-semibold tracking-tight md:text-xl">
          Should you actually build this?
        </h2>

        <p className="mb-5 text-sm text-muted-foreground md:text-base">
          Get Valifye&apos;s BUILD / PIVOT / KILL verdict plus a 90-day
          execution roadmap for this exact market.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://app.valifye.com"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <span aria-hidden className="text-base">
              🔒
            </span>
            <span>Validate this idea with email</span>
          </a>
        </div>
      </section>
    </main>
  )
}

/* -------------------------- */
/* Metadata (Next.js 15+ safe) */
/* -------------------------- */

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data } = await supabase
    .from('market_data')
    .select('niche, city, market_narrative')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return {}

  return {
    title: `${data.niche} Business in ${data.city} — Market Validation`,
    description: `Is ${data.niche} in ${data.city} worth starting? See competitors, customer complaints, and Valifye’s verdict.`
  }
}

/* -------------------------- */
/* Small Component */
/* -------------------------- */

function StatCard({
  value,
  label,
  borderVariant
}: {
  value: string
  label: string
  borderVariant: string
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-xl border bg-card px-4 py-4 text-left shadow-sm sm:px-5 ${borderVariant}`}
    >
      <div className="text-[2.5rem] font-bold leading-none tracking-tight text-primary">
        {value}
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}