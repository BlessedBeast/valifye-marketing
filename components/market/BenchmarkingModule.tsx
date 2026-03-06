import { supabase } from '@/lib/supabase' // 🎯 Use Singleton
import { getMarketVerdict } from '@/lib/utils'

interface BenchmarkingModuleProps {
  currentCityScore: number
  niche: string
  region: string
}

export async function BenchmarkingModule({
  currentCityScore,
  niche,
  region
}: BenchmarkingModuleProps) {
  // 🚨 createClient() REMOVED.
  
  const { data, error } = await supabase
    .from('market_data')
    .select('opportunity_score, data_source')
    .eq('niche', niche)
    .ilike('data_source', `%${region.toUpperCase()}%`)

  const scores =
    !error && data
      ? (data as { opportunity_score: number | null }[])
          .map((row) => Number(row.opportunity_score ?? 0))
          .filter((v) => Number.isFinite(v) && v > 0)
      : []

  if (scores.length === 0 || !Number.isFinite(currentCityScore)) {
    return null
  }

  const avg =
    scores.reduce((sum, v) => sum + v, 0) / (scores.length || 1)
  const verdict = getMarketVerdict(currentCityScore, avg)
  const diff = verdict.diff
  const roundedAvg = Math.round(avg)
  const absDiff = Math.abs(Math.round(diff))

  const maxVal = Math.max(currentCityScore, roundedAvg, 1)
  const cityWidth = Math.max(
    8,
    Math.round((currentCityScore / maxVal) * 100)
  )
  const avgWidth = Math.max(8, Math.round((roundedAvg / maxVal) * 100))

  return (
    <aside
      aria-label="Regional market benchmarking"
      className="space-y-3 rounded-2xl border border-border bg-card p-6"
    >
      <header className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Regional Benchmark — {region}
          </h3>
          <p className="text-xs text-muted-foreground">
            How this city&apos;s opportunity score compares to the{' '}
            {region} average for {niche}.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold ${verdict.color}`}
          >
            <span>{verdict.grade}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {verdict.label}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            City: {currentCityScore}/100 · Region avg: {roundedAvg}/100
          </span>
        </div>
      </header>

      <p className="text-xs leading-relaxed text-muted-foreground">
        At {currentCityScore}/100, this market{' '}
        {diff > 0 ? 'outperforms' : diff < 0 ? 'trails' : 'matches'} the{' '}
        {region} regional average for {niche}
        {diff !== 0 && (
          <> by {absDiff} point{absDiff === 1 ? '' : 's'}</>
        )}
        . {verdict.description}
      </p>

      <div className="space-y-2">
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${cityWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>City opportunity score</span>
          <span>{currentCityScore}/100</span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-muted-foreground/60"
            style={{ width: `${avgWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Regional average ({region})</span>
          <span>{roundedAvg}/100</span>
        </div>
      </div>
    </aside>
  )
}