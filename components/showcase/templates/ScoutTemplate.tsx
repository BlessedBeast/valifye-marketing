import {
  Activity,
  AlertTriangle,
  Banknote,
  LockKeyhole,
  ShieldAlert,
  Target,
  Truck,
  Users
} from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import {
  extractPayload,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import { cn } from '@/lib/utils'

const SECTION_BASE =
  'rounded-md border border-zinc-800 bg-slate-900/50 p-6 shadow-[0_0_0_1px_rgb(255_255_255/0.02)]'

const SECTION_HEADING =
  'text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 mb-4'

type ExecutiveVerdict = {
  feasibility_score?: unknown
  verdict?: unknown
  top_3_fatal_risks?: unknown
}

type MarginBreakdown = {
  cogs?: unknown
  rent?: unknown
  labor?: unknown
  [key: string]: unknown
}

type ForensicFinancials = {
  target_aov?: unknown
  target_operating_margin?: unknown
  estimated_capex?: unknown
  benchmark_margin_breakdown?: unknown
}

type LocalFriction = {
  tax_reality?: unknown
  labor_reality?: unknown
  aggregator_logistics?: unknown
}

type DensityMap = {
  total_physical_threats?: unknown
  [key: string]: unknown
}

type QuantRoadmap = {
  months_to_breakeven?: unknown
  monthly_profit_per_client?: unknown
  [key: string]: unknown
}

type ScoutPayload = {
  module_01_executive_verdict?: ExecutiveVerdict
  module_02_forensic_financials?: ForensicFinancials
  module_03_local_friction?: LocalFriction
  module_04_density_map?: DensityMap
  module_06_quant_roadmap?: QuantRoadmap
  [key: string]: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
}

function formatCurrency(value: unknown): string | null {
  const n = asNumber(value)
  if (n !== null) return `$${Math.round(n).toLocaleString('en-US')}`
  return asString(value)
}

function formatPercent(value: unknown): string | null {
  const n = asNumber(value)
  if (n === null) return asString(value)
  if (Math.abs(n) <= 1) return `${Math.round(n * 100)}%`
  return `${Math.round(n)}%`
}

function getScoreTone(score: number): string {
  if (score < 40) return 'text-rose-500'
  if (score > 70) return 'text-emerald-500'
  return 'text-amber-500'
}

export function ScoutTemplate({ report }: TemplateProps) {
  const payload = extractPayload(report) as ScoutPayload

  const verdictModule = isRecord(payload.module_01_executive_verdict)
    ? payload.module_01_executive_verdict
    : {}
  const financialsModule = isRecord(payload.module_02_forensic_financials)
    ? payload.module_02_forensic_financials
    : {}
  const frictionModule = isRecord(payload.module_03_local_friction)
    ? payload.module_03_local_friction
    : {}
  const densityModule = isRecord(payload.module_04_density_map)
    ? payload.module_04_density_map
    : {}
  const roadmapModule = isRecord(payload.module_06_quant_roadmap)
    ? payload.module_06_quant_roadmap
    : {}

  const feasibilityScore = asNumber(verdictModule.feasibility_score)
  const verdictText = asString(verdictModule.verdict)
  const fatalRisks = asStringArray(verdictModule.top_3_fatal_risks)

  const targetAov = formatCurrency(financialsModule.target_aov)
  const targetOperatingMargin = formatPercent(
    financialsModule.target_operating_margin
  )
  const estimatedCapex = formatCurrency(financialsModule.estimated_capex)
  const marginBreakdown: MarginBreakdown = isRecord(
    financialsModule.benchmark_margin_breakdown
  )
    ? (financialsModule.benchmark_margin_breakdown as MarginBreakdown)
    : {}

  const taxReality = asString(frictionModule.tax_reality)
  const laborReality = asString(frictionModule.labor_reality)
  const aggregatorLogistics = asString(frictionModule.aggregator_logistics)

  const totalPhysicalThreats = asNumber(densityModule.total_physical_threats)
  const monthsToBreakeven = asNumber(roadmapModule.months_to_breakeven)
  const monthlyProfitPerClient = formatCurrency(
    roadmapModule.monthly_profit_per_client
  )

  return (
    <article className="space-y-6 text-slate-100 max-w-4xl mx-auto">
      <header className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Local Market Scout
        </p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
          {report.title}
        </h1>
        {report.forensicVerdict && (
          <p className="text-sm leading-relaxed text-zinc-400">
            {report.forensicVerdict}
          </p>
        )}
      </header>

      {/* Module 1: Executive Verdict */}
      <section className={SECTION_BASE}>
        <h2 className={SECTION_HEADING}>Executive Verdict</h2>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-3">
            {feasibilityScore !== null ? (
              <>
                <strong
                  className={cn(
                    'font-serif text-6xl font-black leading-none tabular-nums md:text-7xl',
                    getScoreTone(feasibilityScore)
                  )}
                >
                  {Math.round(feasibilityScore)}
                </strong>
                <span className="text-sm font-semibold text-zinc-500">
                  / 100
                </span>
              </>
            ) : (
              <span className="text-sm text-zinc-500">
                Feasibility score pending
              </span>
            )}
          </div>

          {verdictText && (
            <p className="max-w-md text-sm leading-relaxed text-zinc-200">
              {verdictText}
            </p>
          )}
        </div>

        {fatalRisks.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400">
              Top 3 Fatal Risks
            </p>
            <ul className="mt-3 space-y-2">
              {fatalRisks.slice(0, 3).map((risk, index) => (
                <li
                  key={`${risk}-${index}`}
                  className="flex gap-3 border-l-2 border-rose-500/70 bg-rose-950/20 px-4 py-2 text-sm leading-relaxed text-zinc-200"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Module 2: Forensic Financials */}
      <section className={SECTION_BASE}>
        <h2 className={SECTION_HEADING}>Forensic Financials</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <FinancialCell label="Target AOV" value={targetAov} />
          <FinancialCell
            label="Target Operating Margin"
            value={targetOperatingMargin}
          />
          <FinancialCell label="Estimated Capex" value={estimatedCapex} />
        </div>

        {Boolean(
          marginBreakdown.cogs ||
            marginBreakdown.rent ||
            marginBreakdown.labor
        ) && (
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Benchmark Margin Breakdown
            </p>
            <dl className="mt-3 grid gap-3 text-xs text-zinc-400 md:grid-cols-3">
              <BenchmarkRow label="COGS" value={marginBreakdown.cogs} />
              <BenchmarkRow label="Rent" value={marginBreakdown.rent} />
              <BenchmarkRow label="Labor" value={marginBreakdown.labor} />
            </dl>
          </div>
        )}
      </section>

      {/* Module 3: Local Friction */}
      <section className={SECTION_BASE}>
        <h2 className={SECTION_HEADING}>Local Friction</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <FrictionCard
            icon={<Banknote className="h-4 w-4 text-emerald-400" />}
            title="Tax Reality"
            body={taxReality}
          />
          <FrictionCard
            icon={<Users className="h-4 w-4 text-sky-400" />}
            title="Labor Reality"
            body={laborReality}
          />
          <FrictionCard
            icon={<Truck className="h-4 w-4 text-amber-400" />}
            title="Aggregator Logistics"
            body={aggregatorLogistics}
          />
        </div>
      </section>

      {/* Conversion Blur: Modules 4, 6, and locked content */}
      <div className="relative">
        <div className="space-y-6">
          {/* Module 4: Threat Matrix */}
          <section className={SECTION_BASE}>
            <h2 className={SECTION_HEADING}>Threat Matrix</h2>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-baseline gap-3">
                <ShieldAlert className="h-6 w-6 text-rose-400" />
                <strong className="font-serif text-5xl font-black leading-none tabular-nums text-zinc-50">
                  {totalPhysicalThreats !== null ? totalPhysicalThreats : '—'}
                </strong>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Total Physical Threats
                </span>
              </div>
              <p className="max-w-md text-sm text-zinc-400">
                Density of direct competitors mapped inside the local radius
                before strategic differentiation is applied.
              </p>
            </div>
          </section>

          {/* Module 6: Quant Roadmap */}
          <section className={SECTION_BASE}>
            <h2 className={SECTION_HEADING}>Quant Roadmap</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <RoadmapCell
                icon={<Activity className="h-4 w-4 text-emerald-400" />}
                label="Months to Breakeven"
                value={
                  monthsToBreakeven !== null
                    ? `${Math.round(monthsToBreakeven)} mo`
                    : null
                }
              />
              <RoadmapCell
                icon={<Target className="h-4 w-4 text-amber-400" />}
                label="Monthly Profit / Client"
                value={monthlyProfitPerClient}
              />
            </div>
          </section>

          {/* Locked placeholder rows so the blur has surface area */}
          <section className={cn(SECTION_BASE, 'opacity-90')}>
            <h2 className={SECTION_HEADING}>Operating Model Stress Test</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {['Cash Cushion', 'Channel Mix', 'Pricing Tolerance'].map(
                (label) => (
                  <div
                    key={label}
                    className="rounded-md border border-zinc-800 bg-black/40 px-4 py-5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-3 text-sm text-zinc-400">
                      Modeled scenarios unlocked in the full forensic audit.
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent flex items-end justify-center pb-12">
          <form
            action="https://app.valifye.com"
            method="get"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input
              type="hidden"
              name="ref"
              value={`showcase_scout_${report.slug}`}
            />
            <ValifyeButton size="lg" type="submit" className="px-8">
              <LockKeyhole className="mr-2 h-4 w-4" />
              Unlock the Full Forensic Audit for $49 →
            </ValifyeButton>
          </form>
        </div>
      </div>
    </article>
  )
}

function FinancialCell({
  label,
  value
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-black/40 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3">
        <strong className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
          {value ?? '—'}
        </strong>
      </p>
    </div>
  )
}

function BenchmarkRow({ label, value }: { label: string; value: unknown }) {
  const display = formatPercent(value) ?? formatCurrency(value) ?? asString(value)
  if (!display) return null

  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-zinc-800/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </dt>
      <dd className="font-serif text-sm text-zinc-200">
        <strong className="font-serif font-bold">{display}</strong>
      </dd>
    </div>
  )
}

function FrictionCard({
  icon,
  title,
  body
}: {
  icon: React.ReactNode
  title: string
  body: string | null
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-black/40 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-950">
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
          {title}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-zinc-300">
        {body ?? 'Detail withheld in the public preview.'}
      </p>
    </div>
  )
}

function RoadmapCell({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-black/40 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-950">
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          {label}
        </p>
      </div>
      <strong className="font-serif text-2xl font-black tabular-nums text-zinc-50">
        {value ?? '—'}
      </strong>
    </div>
  )
}
