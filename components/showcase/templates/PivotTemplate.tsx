import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Crown,
  LockKeyhole,
  Rocket,
  Shield,
  Skull,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import {
  extractPayload,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import { cn } from '@/lib/utils'

const SECTION_HEADING =
  'text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/90 mb-6'

const SUBSECTION_LABEL =
  'mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/90'

// ---- Payload types -------------------------------------------------------

type RealityCheckModule = {
  one_line_verdict?: unknown
  market_window?: unknown
  cause_of_death?: unknown
  [key: string]: unknown
}

type PivotRow = {
  title?: unknown
  name?: unknown
  recommended?: unknown
  is_recommended?: unknown
  rank?: unknown
  summary?: unknown
  positioning?: unknown
  new_icp?: unknown
  moat?: unknown
  what_you_kill?: unknown
  what_you_own?: unknown
  recommended_reasoning?: unknown
  reasoning?: unknown
  first_moves?: unknown
  [key: string]: unknown
}

type RoadmapPhase = {
  phase?: unknown
  name?: unknown
  focus?: unknown
  key_actions?: unknown
  actions?: unknown
  kill_switch?: unknown
  [key: string]: unknown
}

type ValidationRoadmapModule = {
  phases?: unknown
  phase_1?: unknown
  phase_2?: unknown
  phase_3?: unknown
  north_star_metric?: unknown
  [key: string]: unknown
}

type SharedRisk = {
  title?: unknown
  description?: unknown
  mitigation?: unknown
  [key: string]: unknown
}

type PivotPayload = {
  module_01_reality_check?: RealityCheckModule
  reality_check?: RealityCheckModule
  module_02_pivots?: unknown
  pivots?: unknown
  module_03_validation_roadmap?: ValidationRoadmapModule
  validation_roadmap?: ValidationRoadmapModule
  module_04_shared_risks?: unknown
  shared_risks?: unknown
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

function asArrayOfRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord)
}

function pickFirstRecord(...candidates: unknown[]): Record<string, unknown> {
  for (const candidate of candidates) {
    if (isRecord(candidate)) return candidate
  }
  return {}
}

// ---- Pivot helpers -------------------------------------------------------

function readPivots(payload: PivotPayload): Record<string, unknown>[] {
  const direct = asArrayOfRecords(
    payload.pivots ?? payload.module_02_pivots
  )

  if (direct.length > 0) return direct

  // Fallback: pivot_1 / pivot_2 / pivot_3 keys.
  const keyed: Record<string, unknown>[] = []
  for (let i = 1; i <= 3; i++) {
    const candidate = payload[`pivot_${i}` as keyof PivotPayload]
    if (isRecord(candidate)) keyed.push(candidate)
  }
  return keyed
}

function readRoadmapPhases(roadmap: ValidationRoadmapModule): RoadmapPhase[] {
  if (Array.isArray(roadmap.phases)) {
    return roadmap.phases.filter(isRecord) as RoadmapPhase[]
  }

  const keyed: RoadmapPhase[] = []
  for (let i = 1; i <= 3; i++) {
    const candidate = roadmap[`phase_${i}` as keyof ValidationRoadmapModule]
    if (isRecord(candidate)) keyed.push(candidate as RoadmapPhase)
  }
  return keyed
}

function isRecommendedPivot(row: PivotRow, index: number): boolean {
  if (row.recommended === true || row.is_recommended === true) return true
  const rank = asNumber(row.rank)
  if (rank !== null) return rank === 1
  return index === 0
}

// ---- Subcomponents -------------------------------------------------------

function FieldBlock({
  icon,
  label,
  children
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-amber-500/15 bg-slate-950/40 p-4">
      <p className={SUBSECTION_LABEL}>
        {icon}
        <strong className="font-semibold">{label}</strong>
      </p>
      <div className="text-sm leading-relaxed text-zinc-200">{children}</div>
    </div>
  )
}

function RecommendedPivotCard({
  row,
  index
}: {
  row: Record<string, unknown>
  index: number
}) {
  const pivot = row as PivotRow
  const title =
    asString(pivot.title) ??
    asString(pivot.name) ??
    asString(pivot.positioning) ??
    `Pivot ${index + 1}`
  const summary = asString(pivot.summary) ?? asString(pivot.positioning)
  const newIcp = asString(pivot.new_icp)
  const moat = asString(pivot.moat)
  const whatYouKill = asString(pivot.what_you_kill)
  const whatYouOwn = asString(pivot.what_you_own)
  const reasoning =
    asString(pivot.recommended_reasoning) ?? asString(pivot.reasoning)
  const firstMoves = asStringArray(pivot.first_moves)

  return (
    <article className="relative overflow-hidden rounded-lg border-2 border-amber-500/70 bg-gradient-to-br from-amber-500/[0.10] to-slate-900 p-7 shadow-[0_0_32px_-8px_rgba(245,158,11,0.55)]">
      <span
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden
      />
      <header className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.4)]">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200">
              <Sparkles className="h-3 w-3" />
              Recommended
            </span>
            <h3 className="mt-2 font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
              {title}
            </h3>
            {summary && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300">
                {summary}
              </p>
            )}
          </div>
        </div>
        <span className="rounded-full border border-amber-400/40 bg-slate-950/60 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300">
          Pivot 01 · Elite
        </span>
      </header>

      <div className="relative mt-6 grid gap-4 md:grid-cols-2">
        {newIcp && (
          <FieldBlock
            icon={<Target className="h-3.5 w-3.5" />}
            label="New ICP"
          >
            {newIcp}
          </FieldBlock>
        )}
        {moat && (
          <FieldBlock
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Moat"
          >
            {moat}
          </FieldBlock>
        )}
        {whatYouOwn && (
          <FieldBlock
            icon={<Trophy className="h-3.5 w-3.5" />}
            label="What You Own"
          >
            {whatYouOwn}
          </FieldBlock>
        )}
        {whatYouKill && (
          <FieldBlock
            icon={<Skull className="h-3.5 w-3.5" />}
            label="What You Kill"
          >
            {whatYouKill}
          </FieldBlock>
        )}
      </div>

      {firstMoves.length > 0 && (
        <div className="relative mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/[0.05] p-4">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            <Rocket className="h-3 w-3" />
            First Moves
          </p>
          <ul className="mt-3 space-y-2">
            {firstMoves.map((move, moveIndex) => (
              <li
                key={`${move}-${moveIndex}`}
                className="flex gap-2 text-sm leading-relaxed text-zinc-200"
              >
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{move}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reasoning && (
        <footer className="relative mt-6 border-t border-amber-500/20 pt-4 text-[11px] leading-relaxed text-amber-100/90">
          <cite className="not-italic">
            <span className="font-semibold uppercase tracking-[0.22em] text-amber-300/80">
              Recommended Reasoning ·
            </span>{' '}
            {reasoning}
          </cite>
        </footer>
      )}
    </article>
  )
}

function BackupPivotCard({
  row,
  index
}: {
  row: Record<string, unknown>
  index: number
}) {
  const pivot = row as PivotRow
  const title =
    asString(pivot.title) ??
    asString(pivot.name) ??
    asString(pivot.positioning) ??
    `Pivot ${index + 1}`
  const summary = asString(pivot.summary) ?? asString(pivot.positioning)
  const newIcp = asString(pivot.new_icp)
  const moat = asString(pivot.moat)

  return (
    <article className="rounded-md border border-zinc-700 bg-slate-900/50 p-5">
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-bold text-zinc-100">{title}</h3>
        <span className="rounded-full border border-zinc-700 bg-slate-950/60 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Backup
        </span>
      </header>
      {summary && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{summary}</p>
      )}
      <dl className="mt-4 space-y-2 text-[12px] text-zinc-400">
        {newIcp && (
          <div>
            <dt>
              <strong className="font-semibold uppercase tracking-[0.18em] text-amber-300/80">
                New ICP
              </strong>
            </dt>
            <dd className="text-zinc-300">{newIcp}</dd>
          </div>
        )}
        {moat && (
          <div>
            <dt>
              <strong className="font-semibold uppercase tracking-[0.18em] text-amber-300/80">
                Moat
              </strong>
            </dt>
            <dd className="text-zinc-300">{moat}</dd>
          </div>
        )}
      </dl>
    </article>
  )
}

function PhaseCard({
  row,
  index
}: {
  row: RoadmapPhase
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
        className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/50 bg-slate-950 font-serif text-sm font-black text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
        aria-hidden
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      {index < 2 && (
        <span
          className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-gradient-to-b from-amber-500/40 to-amber-500/0"
          aria-hidden
        />
      )}
      <div className="rounded-md border border-zinc-800 bg-slate-900/50 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300">
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
                <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        )}
        {killSwitch && (
          <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-950/20 p-3">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300">
              <Skull className="h-3 w-3" />
              Kill Switch
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-rose-100/90">
              {killSwitch}
            </p>
          </div>
        )}
      </div>
    </li>
  )
}

function SharedRiskCard({ row }: { row: Record<string, unknown> }) {
  const risk = row as SharedRisk
  const title = asString(risk.title) ?? 'Shared risk'
  const description = asString(risk.description)
  const mitigation = asString(risk.mitigation)

  return (
    <article className="rounded-md border border-rose-500/30 bg-rose-950/10 p-5">
      <h3 className="inline-flex items-center gap-2 font-serif text-base font-bold text-rose-200">
        <AlertTriangle className="h-4 w-4 text-rose-400" />
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">
          {description}
        </p>
      )}
      {mitigation && (
        <cite className="mt-3 block text-[11px] not-italic leading-relaxed text-rose-100/80">
          <span className="font-semibold uppercase tracking-[0.22em] text-rose-300/80">
            Forensic Mitigation ·
          </span>{' '}
          {mitigation}
        </cite>
      )}
    </article>
  )
}

// ---- Main template -------------------------------------------------------

export function PivotTemplate({ report }: TemplateProps) {
  const payload = extractPayload(report) as PivotPayload

  const realityCheck = pickFirstRecord(
    payload.module_01_reality_check,
    payload.reality_check
  ) as RealityCheckModule

  const pivots = readPivots(payload)
  const recommendedIndex = pivots.findIndex((row, index) =>
    isRecommendedPivot(row as PivotRow, index)
  )
  const recommendedRow =
    recommendedIndex >= 0 ? pivots[recommendedIndex] : pivots[0]
  const backupPivots = pivots.filter(
    (_, index) => index !== (recommendedIndex >= 0 ? recommendedIndex : 0)
  )

  const oneLineVerdict = asString(realityCheck.one_line_verdict)
  const marketWindow = asString(realityCheck.market_window)
  const causeOfDeath = asString(realityCheck.cause_of_death)
  const warningText = marketWindow ?? causeOfDeath
  const warningLabel = marketWindow ? 'Market Window' : 'Cause of Death'

  const roadmap = pickFirstRecord(
    payload.module_03_validation_roadmap,
    payload.validation_roadmap
  ) as ValidationRoadmapModule
  const phases = readRoadmapPhases(roadmap).slice(0, 3)
  const northStarMetric = asString(roadmap.north_star_metric)

  const sharedRisks = asArrayOfRecords(
    payload.shared_risks ?? payload.module_04_shared_risks
  )

  return (
    <article className="space-y-12 text-slate-100 max-w-5xl mx-auto">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400/90">
          <Crown className="h-3.5 w-3.5" />
          Pivot Playbook · Strategic Redirection
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

      {/* Module 1: Reality Check */}
      <section>
        <h2 className={SECTION_HEADING}>The Reality Check</h2>
        <div className="rounded-lg border border-zinc-800 bg-slate-900/60 p-7">
          {oneLineVerdict ? (
            <blockquote className="border-l-2 border-amber-400/70 pl-5">
              <p className="font-serif text-2xl italic leading-snug text-zinc-50">
                “{oneLineVerdict}”
              </p>
            </blockquote>
          ) : (
            <p className="font-serif text-base italic text-zinc-400">
              Reality verdict pending.
            </p>
          )}

          {warningText && (
            <div className="mt-6 flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/[0.06] p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                  {warningLabel}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-amber-100/90">
                  {warningText}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Module 2 (visible part): Recommended Pivot */}
      <section>
        <h2 className={SECTION_HEADING}>The Recommended Blue-Ocean Pivot</h2>
        {recommendedRow ? (
          <RecommendedPivotCard row={recommendedRow} index={0} />
        ) : (
          <p className="text-sm text-zinc-500">
            No pivot has been promoted to recommended yet.
          </p>
        )}
      </section>

      {/* Conversion Blur: Backup Pivots, Validation Roadmap, Shared Risks */}
      <div className="relative">
        <div className="space-y-12">
          {/* Backup Pivots */}
          <section>
            <h2 className={SECTION_HEADING}>Backup Pivots</h2>
            {backupPivots.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Backup pivot vectors unlock with the full transition roadmap.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {backupPivots.map((row, index) => (
                  <BackupPivotCard
                    key={`backup-${index}`}
                    row={row}
                    index={index + 1}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 30-Day Validation Roadmap */}
          <section>
            <h2 className={SECTION_HEADING}>30-Day Validation Roadmap</h2>
            {phases.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Phase-by-phase validation plan unlocks with the full roadmap.
              </p>
            ) : (
              <ol className="space-y-6">
                {phases.map((phase, index) => (
                  <PhaseCard
                    key={`phase-${index}`}
                    row={phase}
                    index={index}
                  />
                ))}
              </ol>
            )}

            {northStarMetric && (
              <aside className="mt-8 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] p-5">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  <Trophy className="h-3.5 w-3.5" />
                  Victory Condition · North Star Metric
                </p>
                <p className="mt-2 font-serif text-xl font-bold text-emerald-100">
                  {northStarMetric}
                </p>
              </aside>
            )}
          </section>

          {/* Shared Risks */}
          <section>
            <h2 className={SECTION_HEADING}>Shared Risks</h2>
            {sharedRisks.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Cross-pivot risk analysis unlocks with the full roadmap.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sharedRisks.map((row, index) => (
                  <SharedRiskCard key={`risk-${index}`} row={row} />
                ))}
              </div>
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
              value={`showcase_pivot_${report.slug}`}
            />
            <ValifyeButton
              size="xl"
              type="submit"
              className={cn(
                'bg-amber-500 hover:bg-amber-600 text-slate-950',
                'shadow-[0_0_30px_rgba(245,158,11,0.55)] ring-1 ring-amber-300/40',
                'font-mono uppercase tracking-[0.22em]'
              )}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Unlock the Full Transition Roadmap for $99 →
            </ValifyeButton>
          </form>
        </div>
      </div>
    </article>
  )
}
