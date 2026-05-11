import {
  CheckCircle2,
  LockKeyhole,
  RotateCw,
  ShieldAlert,
  Skull,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import {
  extractPayload,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import { cn } from '@/lib/utils'

const SECTION_HEADING =
  'text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-400 mb-6'

const SUBSECTION_LABEL =
  'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]'

// ---- Payload types -------------------------------------------------------

type AutopsyModule = {
  one_line_verdict?: unknown
  cause_of_death?: unknown
  salvageable_asset?: unknown
  [key: string]: unknown
}

type UnitEconomics = {
  aov?: unknown
  target_aov?: unknown
  cogs_percent?: unknown
  cogs?: unknown
  operating_margin_percent?: unknown
  operating_margin?: unknown
  [key: string]: unknown
}

type RecoveryVector = {
  model_name?: unknown
  name?: unknown
  target_buyer?: unknown
  buyer?: unknown
  why_it_works?: unknown
  rationale?: unknown
  new_unit_economics?: unknown
  unit_economics?: unknown
  first_test?: unknown
  [key: string]: unknown
}

type TransitionPhase = {
  phase?: unknown
  name?: unknown
  focus?: unknown
  key_actions?: unknown
  actions?: unknown
  kill_switch?: unknown
  [key: string]: unknown
}

type TransitionRoadmap = {
  phases?: unknown
  phase_1?: unknown
  phase_2?: unknown
  phase_3?: unknown
  north_star_metric?: unknown
  [key: string]: unknown
}

type ScoutPivotPayload = {
  module_01_autopsy?: AutopsyModule
  autopsy?: AutopsyModule
  module_02_pivot_alpha?: RecoveryVector
  pivot_alpha?: RecoveryVector
  module_03_pivot_beta?: RecoveryVector
  pivot_beta?: RecoveryVector
  module_04_transition_roadmap?: TransitionRoadmap
  transition_roadmap?: TransitionRoadmap
  [key: string]: unknown
}

// ---- Coercers ------------------------------------------------------------

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

function pickFirstRecord(...candidates: unknown[]): Record<string, unknown> {
  for (const candidate of candidates) {
    if (isRecord(candidate)) return candidate
  }
  return {}
}

function formatCurrency(value: unknown): string | null {
  const n = asNumber(value)
  if (n !== null) return `$${Math.round(n).toLocaleString('en-US')}`
  return asString(value)
}

function formatPercent(value: unknown): { display: string; raw: number } | null {
  const n = asNumber(value)
  if (n === null) {
    const s = asString(value)
    return s ? { display: s, raw: NaN } : null
  }
  const normalized = Math.abs(n) <= 1 ? n * 100 : n
  return {
    display: `${Math.round(normalized)}%`,
    raw: normalized
  }
}

// ---- Roadmap helpers -----------------------------------------------------

function readPhases(roadmap: TransitionRoadmap): TransitionPhase[] {
  if (Array.isArray(roadmap.phases)) {
    return roadmap.phases.filter(isRecord).slice(0, 3) as TransitionPhase[]
  }

  const keyed: TransitionPhase[] = []
  for (let i = 1; i <= 3; i++) {
    const candidate = roadmap[`phase_${i}`]
    if (isRecord(candidate)) keyed.push(candidate as TransitionPhase)
  }
  return keyed
}

// ---- Subcomponents -------------------------------------------------------

function UnitEconomicsGrid({ data }: { data: UnitEconomics }) {
  const aov = formatCurrency(data.aov ?? data.target_aov)
  const cogs = formatPercent(data.cogs_percent ?? data.cogs)
  const operatingMargin = formatPercent(
    data.operating_margin_percent ?? data.operating_margin
  )

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <EconomicTile
        label="AOV"
        value={aov ?? '—'}
        accent="text-emerald-300"
        bar={null}
      />
      <EconomicTile
        label="COGS %"
        value={cogs?.display ?? '—'}
        accent="text-rose-300"
        bar={
          cogs && Number.isFinite(cogs.raw)
            ? { pct: Math.min(100, cogs.raw), color: 'bg-rose-500/80' }
            : null
        }
      />
      <EconomicTile
        label="Operating Margin %"
        value={operatingMargin?.display ?? '—'}
        accent="text-emerald-300"
        bar={
          operatingMargin && Number.isFinite(operatingMargin.raw)
            ? {
                pct: Math.min(100, Math.max(0, operatingMargin.raw)),
                color: 'bg-emerald-500/80'
              }
            : null
        }
      />
    </div>
  )
}

function EconomicTile({
  label,
  value,
  accent,
  bar
}: {
  label: string
  value: string
  accent: string
  bar: { pct: number; color: string } | null
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-slate-950/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p
        className={cn(
          'mt-3 font-serif text-3xl font-black tabular-nums',
          accent
        )}
      >
        <strong className="font-black">{value}</strong>
      </p>
      {bar && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn('h-full', bar.color)}
            style={{ width: `${bar.pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

function RecoveryVectorCard({
  row,
  label,
  index,
  recommended
}: {
  row: Record<string, unknown>
  label: string
  index: number
  recommended: boolean
}) {
  const vector = row as RecoveryVector
  const modelName =
    asString(vector.model_name) ?? asString(vector.name) ?? `Vector ${index + 1}`
  const targetBuyer = asString(vector.target_buyer) ?? asString(vector.buyer)
  const whyItWorks = asString(vector.why_it_works) ?? asString(vector.rationale)
  const firstTest = asString(vector.first_test)
  const economicsSource = isRecord(vector.new_unit_economics)
    ? (vector.new_unit_economics as UnitEconomics)
    : isRecord(vector.unit_economics)
      ? (vector.unit_economics as UnitEconomics)
      : null

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border bg-slate-900/50 p-6',
        recommended
          ? 'border-emerald-500/40 shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]'
          : 'border-zinc-800'
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em]',
            recommended
              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
              : 'border-zinc-700 bg-slate-950/60 text-zinc-400'
          )}
        >
          <RotateCw className="h-3 w-3" />
          {label}
        </span>
        {recommended && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <Zap className="h-3 w-3" />
            Lead Recovery
          </span>
        )}
      </header>

      <h3 className="mt-3 font-serif text-2xl font-bold text-zinc-50 md:text-3xl">
        <strong className="font-bold">Recovery Vector ·</strong> {modelName}
      </h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {targetBuyer && (
          <div className="rounded-md border border-indigo-500/30 bg-indigo-500/[0.06] p-4">
            <p className={cn(SUBSECTION_LABEL, 'text-indigo-300')}>
              <Target className="h-3 w-3" />
              Target Buyer
            </p>
            <p className="mt-1 text-sm leading-relaxed text-indigo-100/90">
              {targetBuyer}
            </p>
          </div>
        )}
        {whyItWorks && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
            <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
              <TrendingUp className="h-3 w-3" />
              Why It Works
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-100/90">
              {whyItWorks}
            </p>
          </div>
        )}
      </div>

      {economicsSource && (
        <div className="mt-6">
          <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
            <TrendingUp className="h-3 w-3" />
            New Unit Economics
          </p>
          <div className="mt-3">
            <UnitEconomicsGrid data={economicsSource} />
          </div>
        </div>
      )}

      {firstTest && (
        <div className="mt-6 rounded-md border border-amber-500/40 bg-amber-500/[0.06] p-4">
          <p className={cn(SUBSECTION_LABEL, 'text-amber-300')}>
            <Zap className="h-3 w-3" />
            The 7-Day Test · Action Box
          </p>
          <cite className="mt-2 block text-sm not-italic leading-relaxed text-amber-100/90">
            <span className="font-semibold uppercase tracking-[0.22em] text-amber-200">
              First Test ·
            </span>{' '}
            {firstTest}
          </cite>
        </div>
      )}
    </article>
  )
}

function TransitionPhaseRow({
  row,
  index
}: {
  row: TransitionPhase
  index: number
}) {
  const name =
    asString(row.phase) ?? asString(row.name) ?? `Phase ${index + 1}`
  const focus = asString(row.focus)
  const actions = asStringArray(row.key_actions ?? row.actions)
  const killSwitch = asString(row.kill_switch)

  return (
    <li className="relative pl-10">
      <span
        className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/50 bg-slate-950 font-serif text-sm font-black text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.4)]"
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      {index < 2 && (
        <span
          className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-gradient-to-b from-rose-500/50 to-rose-500/0"
          aria-hidden
        />
      )}
      <div className="rounded-md border border-zinc-800 bg-slate-900/50 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-300">
          {name}
        </p>
        {focus && (
          <p className="mt-2 font-serif text-base font-bold text-zinc-100">
            {focus}
          </p>
        )}
        {actions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {actions.map((action, actionIndex) => (
              <li
                key={`${action}-${actionIndex}`}
                className="flex gap-2 text-sm leading-relaxed text-zinc-200"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        )}
        {killSwitch && (
          <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-950/20 p-3">
            <p className={cn(SUBSECTION_LABEL, 'text-rose-300')}>
              <ShieldAlert className="h-3 w-3" />
              Exit Criteria
            </p>
            <cite className="mt-2 block text-[12px] not-italic leading-relaxed text-rose-100/90">
              <span className="font-semibold uppercase tracking-[0.22em] text-rose-200">
                Kill Switch ·
              </span>{' '}
              {killSwitch}
            </cite>
          </div>
        )}
      </div>
    </li>
  )
}

// ---- Main template -------------------------------------------------------

export function ScoutPivotTemplate({ report }: TemplateProps) {
  const payload = extractPayload(report) as ScoutPivotPayload

  const autopsy = pickFirstRecord(
    payload.module_01_autopsy,
    payload.autopsy
  ) as AutopsyModule

  const oneLineVerdict = asString(autopsy.one_line_verdict)
  const causeOfDeath = asString(autopsy.cause_of_death)
  const salvageableAsset = asString(autopsy.salvageable_asset)

  const pivotAlpha = pickFirstRecord(
    payload.module_02_pivot_alpha,
    payload.pivot_alpha
  ) as RecoveryVector
  const pivotBeta = pickFirstRecord(
    payload.module_03_pivot_beta,
    payload.pivot_beta
  ) as RecoveryVector

  const hasAlpha = Object.keys(pivotAlpha).length > 0
  const hasBeta = Object.keys(pivotBeta).length > 0

  const roadmap = pickFirstRecord(
    payload.module_04_transition_roadmap,
    payload.transition_roadmap
  ) as TransitionRoadmap
  const phases = readPhases(roadmap)
  const northStarMetric = asString(roadmap.north_star_metric)

  return (
    <article className="space-y-12 text-slate-100 max-w-5xl mx-auto">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-400">
          <Skull className="h-3.5 w-3.5" />
          Local Recovery · Scout Pivot Autopsy
        </p>
        <h1 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-5xl">
          {report.title}
        </h1>
        {report.forensicVerdict && (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {report.forensicVerdict}
          </p>
        )}
      </header>

      {/* Module 1: The Autopsy */}
      <section>
        <h2 className={SECTION_HEADING}>The Autopsy</h2>

        <div className="rounded-lg border border-rose-500/30 bg-slate-900/60 p-7">
          {oneLineVerdict ? (
            <p className="font-serif text-2xl italic leading-snug text-rose-500">
              “{oneLineVerdict}”
            </p>
          ) : (
            <p className="font-serif text-base italic text-zinc-400">
              Autopsy verdict pending.
            </p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-md border border-rose-500/20 bg-rose-950/10 p-5">
              <p className={cn(SUBSECTION_LABEL, 'text-rose-300')}>
                <Skull className="h-3.5 w-3.5" />
                <strong className="font-semibold">Cause of Death</strong>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-rose-100/90">
                {causeOfDeath ??
                  'Cause-of-death narrative unlocks with the full recovery plan.'}
              </p>
            </article>

            <article className="rounded-md border border-emerald-500/20 bg-emerald-950/10 p-5">
              <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                <Zap className="h-3.5 w-3.5" />
                <strong className="font-semibold">Salvageable Asset</strong>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                {salvageableAsset ??
                  'Salvageable asset detail unlocks with the full recovery plan.'}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Module 2 (visible part): Recovery Vector Alpha */}
      <section>
        <h2 className={SECTION_HEADING}>Recovery Vector · Alpha</h2>
        {hasAlpha ? (
          <RecoveryVectorCard
            row={pivotAlpha}
            label="Pivot Alpha"
            index={0}
            recommended
          />
        ) : (
          <p className="text-sm text-zinc-500">
            Lead recovery vector unlocks with the full recovery plan.
          </p>
        )}
      </section>

      {/* Conversion Blur: Recovery Vector Beta + Transition Roadmap */}
      <div className="relative">
        <div className="space-y-12">
          <section>
            <h2 className={SECTION_HEADING}>Recovery Vector · Beta</h2>
            {hasBeta ? (
              <RecoveryVectorCard
                row={pivotBeta}
                label="Pivot Beta"
                index={1}
                recommended={false}
              />
            ) : (
              <p className="text-sm text-zinc-500">
                Backup recovery vector unlocks with the full recovery plan.
              </p>
            )}
          </section>

          <section>
            <h2 className={SECTION_HEADING}>Transition Roadmap</h2>

            {phases.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Phase-by-phase transition plan unlocks with the full recovery plan.
              </p>
            ) : (
              <ol className="space-y-6">
                {phases.map((phase, index) => (
                  <TransitionPhaseRow
                    key={`phase-${index}`}
                    row={phase}
                    index={index}
                  />
                ))}
              </ol>
            )}

            {northStarMetric && (
              <aside className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] p-5">
                <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                  <TrendingUp className="h-3.5 w-3.5" />
                  Victory Condition · North Star Metric
                </p>
                <p className="mt-2 font-serif text-lg font-bold text-emerald-100">
                  {northStarMetric}
                </p>
              </aside>
            )}
          </section>
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-16">
          <form
            action="https://app.valifye.com"
            method="get"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input
              type="hidden"
              name="ref"
              value={`showcase_scout_pivot_${report.slug}`}
            />
            <ValifyeButton
              size="xl"
              variant="destructive"
              type="submit"
              className="font-mono uppercase tracking-[0.22em]"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Unlock the Full Recovery Plan & Economics for $99 →
            </ValifyeButton>
          </form>
        </div>
      </div>
    </article>
  )
}
