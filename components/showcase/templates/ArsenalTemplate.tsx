import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Flag,
  LockKeyhole,
  MessageCircle,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import {
  extractPayload,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import { cn } from '@/lib/utils'

const SECTION_HEADING =
  'text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90 mb-6'

const SUBSECTION_LABEL =
  'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]'

// ---- Payload types -------------------------------------------------------

type RoadmapPhase = {
  phase?: unknown
  name?: unknown
  focus?: unknown
  key_tasks?: unknown
  tasks?: unknown
  goal?: unknown
  north_star_metric?: unknown
  [key: string]: unknown
}

type RoadmapModule = {
  phases?: unknown
  setup?: unknown
  launch?: unknown
  scale?: unknown
  phase_1?: unknown
  phase_2?: unknown
  phase_3?: unknown
  north_star_metric?: unknown
  [key: string]: unknown
}

type MomTestQuestion = {
  q?: unknown
  question?: unknown
  tests_risk?: unknown
  what_it_reveals?: unknown
  [key: string]: unknown
}

type MomTestModule = {
  discovery_goal?: unknown
  target_payer_profile?: unknown
  questions?: unknown
  red_flag_answer_pattern?: unknown
  green_flag_answer_pattern?: unknown
  [key: string]: unknown
}

type CustomerTactic = {
  name?: unknown
  title?: unknown
  who_to_target?: unknown
  audience?: unknown
  execution_steps?: unknown
  steps?: unknown
  expected_result?: unknown
  expected_outcome?: unknown
  conversion_hook?: unknown
  week_1_priority?: unknown
  [key: string]: unknown
}

type CustomerFinderModule = {
  tactic_1?: unknown
  tactic_2?: unknown
  tactics?: unknown
  conversion_hook?: unknown
  week_1_priority?: unknown
  [key: string]: unknown
}

type ArsenalPayload = {
  module_01_roadmap?: RoadmapModule
  roadmap?: RoadmapModule
  module_02_mom_test?: MomTestModule
  mom_test?: MomTestModule
  module_03_customer_finder?: CustomerFinderModule
  customer_finder?: CustomerFinderModule
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

// ---- Roadmap helpers -----------------------------------------------------

const PHASE_KEYS = ['setup', 'launch', 'scale'] as const
type PhaseKey = (typeof PHASE_KEYS)[number]

const PHASE_DEFINITIONS: Record<
  PhaseKey,
  { label: string; icon: typeof Compass; accent: string }
> = {
  setup: {
    label: 'Phase 01 · Setup',
    icon: Compass,
    accent: 'text-indigo-300'
  },
  launch: {
    label: 'Phase 02 · Launch',
    icon: Rocket,
    accent: 'text-emerald-300'
  },
  scale: {
    label: 'Phase 03 · Scale',
    icon: TrendingUp,
    accent: 'text-cyan-300'
  }
}

function readRoadmapPhases(
  module: RoadmapModule
): { key: PhaseKey; row: RoadmapPhase }[] {
  const explicitNamed = PHASE_KEYS.map((key) => ({
    key,
    row: isRecord(module[key]) ? (module[key] as RoadmapPhase) : null
  })).filter((entry) => entry.row !== null) as {
    key: PhaseKey
    row: RoadmapPhase
  }[]

  if (explicitNamed.length > 0) return explicitNamed

  if (Array.isArray(module.phases)) {
    return module.phases
      .filter(isRecord)
      .slice(0, 3)
      .map((row, index) => ({
        key: PHASE_KEYS[index] ?? 'scale',
        row: row as RoadmapPhase
      }))
  }

  const keyed: { key: PhaseKey; row: RoadmapPhase }[] = []
  for (let i = 1; i <= 3; i++) {
    const candidate = module[`phase_${i}`]
    if (isRecord(candidate)) {
      keyed.push({
        key: PHASE_KEYS[i - 1] ?? 'scale',
        row: candidate as RoadmapPhase
      })
    }
  }
  return keyed
}

function readTactics(module: CustomerFinderModule): Record<string, unknown>[] {
  const fromArray = asArrayOfRecords(module.tactics)
  if (fromArray.length > 0) return fromArray.slice(0, 2)

  const result: Record<string, unknown>[] = []
  if (isRecord(module.tactic_1)) result.push(module.tactic_1)
  if (isRecord(module.tactic_2)) result.push(module.tactic_2)
  return result
}

// ---- Subcomponents -------------------------------------------------------

function PhaseColumn({
  phaseKey,
  row,
  index
}: {
  phaseKey: PhaseKey
  row: RoadmapPhase
  index: number
}) {
  const definition = PHASE_DEFINITIONS[phaseKey]
  const Icon = definition.icon
  const focus = asString(row.focus)
  const goal = asString(row.goal) ?? asString(row.north_star_metric)
  const tasks = asStringArray(row.key_tasks ?? row.tasks)
  const explicitName = asString(row.name) ?? asString(row.phase)

  return (
    <article className="flex h-full flex-col rounded-lg border border-zinc-800 bg-slate-900/50 p-6">
      <header className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] shadow-[0_0_18px_rgba(16,185,129,0.25)]',
            definition.accent
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-zinc-700 bg-slate-950/60 px-3 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
          {String(index + 1).padStart(2, '0')} / 03
        </span>
      </header>

      <p className={cn('mt-5 text-[10px] font-semibold uppercase tracking-[0.28em]', definition.accent)}>
        {explicitName ?? definition.label}
      </p>

      {focus && (
        <div className="mt-3 rounded-md border border-indigo-500/30 bg-indigo-500/[0.08] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
            <strong className="font-semibold">Focus</strong>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-indigo-100/90">
            {focus}
          </p>
        </div>
      )}

      {goal && (
        <p className="mt-4 text-sm leading-relaxed text-zinc-200">
          Core goal: <strong className="font-bold text-zinc-50">{goal}</strong>
        </p>
      )}

      {tasks.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {tasks.map((task, taskIndex) => (
            <li
              key={`${task}-${taskIndex}`}
              className="flex gap-2 text-sm leading-relaxed text-zinc-200"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function QuestionCard({
  row,
  index
}: {
  row: Record<string, unknown>
  index: number
}) {
  const q = row as MomTestQuestion
  const question = asString(q.q) ?? asString(q.question)
  const testsRisk = asString(q.tests_risk)
  const whatItReveals = asString(q.what_it_reveals)

  return (
    <article className="rounded-md border border-zinc-800 bg-slate-900/50 p-5">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
          <MessageCircle className="h-3 w-3" />
          Q{String(index + 1).padStart(2, '0')}
        </span>
      </header>
      {question && (
        <blockquote className="mt-3 border-l-2 border-emerald-400/60 pl-4">
          <p className="font-serif text-lg leading-snug text-zinc-100">
            “{question}”
          </p>
        </blockquote>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {testsRisk && (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200">
            <Target className="h-3 w-3" />
            Tests Risk · {testsRisk}
          </span>
        )}
        {whatItReveals && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
            <Zap className="h-3 w-3" />
            Reveals · {whatItReveals}
          </span>
        )}
      </div>
    </article>
  )
}

function CustomerTacticCard({
  row,
  index
}: {
  row: Record<string, unknown>
  index: number
}) {
  const tactic = row as CustomerTactic
  const name =
    asString(tactic.name) ?? asString(tactic.title) ?? `Tactic ${index + 1}`
  const audience =
    asString(tactic.who_to_target) ?? asString(tactic.audience)
  const steps = asStringArray(tactic.execution_steps ?? tactic.steps)
  const expectedResult =
    asString(tactic.expected_result) ?? asString(tactic.expected_outcome)

  return (
    <article className="flex h-full flex-col rounded-lg border border-zinc-800 bg-slate-900/50 p-6">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/[0.08] px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
          <Users className="h-3 w-3" />
          Tactic 0{index + 1}
        </span>
      </header>
      <h3 className="mt-3 font-serif text-xl font-bold text-zinc-50">
        <strong className="font-bold">{name}</strong>
      </h3>

      {audience && (
        <div className="mt-4 rounded-md border border-indigo-500/30 bg-indigo-500/[0.06] p-3">
          <p className={cn(SUBSECTION_LABEL, 'text-indigo-300')}>
            <Target className="h-3 w-3" />
            Who to Target
          </p>
          <p className="mt-1 text-sm leading-relaxed text-indigo-100/90">
            {audience}
          </p>
        </div>
      )}

      {steps.length > 0 && (
        <ol className="mt-5 space-y-2.5">
          {steps.map((step, stepIndex) => (
            <li
              key={`${step}-${stepIndex}`}
              className="flex gap-3 text-sm leading-relaxed text-zinc-200"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-300">
                {stepIndex + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {expectedResult && (
        <footer className="mt-6 border-t border-dashed border-emerald-500/30 pt-4">
          <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
            <TrendingUp className="h-3 w-3" />
            Expected Result
          </p>
          <cite className="mt-1 block text-sm not-italic leading-relaxed text-emerald-100/90">
            {expectedResult}
          </cite>
        </footer>
      )}
    </article>
  )
}

// ---- Main template -------------------------------------------------------

export function ArsenalTemplate({ report }: TemplateProps) {
  const payload = extractPayload(report) as ArsenalPayload

  const roadmap = pickFirstRecord(
    payload.module_01_roadmap,
    payload.roadmap
  ) as RoadmapModule
  const phases = readRoadmapPhases(roadmap)
  const roadmapNorthStar = asString(roadmap.north_star_metric)

  const momTest = pickFirstRecord(
    payload.module_02_mom_test,
    payload.mom_test
  ) as MomTestModule
  const discoveryGoal = asString(momTest.discovery_goal)
  const targetPayerProfile = asString(momTest.target_payer_profile)
  const momQuestions = asArrayOfRecords(momTest.questions)
  const redFlagPattern = asString(momTest.red_flag_answer_pattern)
  const greenFlagPattern = asString(momTest.green_flag_answer_pattern)

  const customerFinder = pickFirstRecord(
    payload.module_03_customer_finder,
    payload.customer_finder
  ) as CustomerFinderModule
  const tactics = readTactics(customerFinder)
  const conversionHook = asString(customerFinder.conversion_hook)
  const weekOnePriority = asString(customerFinder.week_1_priority)

  return (
    <article className="space-y-12 text-slate-100 max-w-5xl mx-auto">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
          <Rocket className="h-3.5 w-3.5" />
          Execution Arsenal · GTM Playbook
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

      {/* Module 1: 90-Day Roadmap */}
      <section>
        <h2 className={SECTION_HEADING}>The 90-Day Roadmap</h2>

        {phases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Roadmap phases unlock with the full execution playbook.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {phases.map((phase, index) => (
              <PhaseColumn
                key={`phase-${phase.key}-${index}`}
                phaseKey={phase.key}
                row={phase.row}
                index={index}
              />
            ))}
          </div>
        )}

        {roadmapNorthStar && (
          <aside className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] p-5">
            <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
              <Flag className="h-3.5 w-3.5" />
              <strong className="font-semibold">North Star Metric</strong>
            </p>
            <p className="mt-2 font-serif text-lg font-bold text-emerald-100">
              {roadmapNorthStar}
            </p>
          </aside>
        )}
      </section>

      {/* Conversion Blur: Mom Test + Customer Finder */}
      <div className="relative">
        <div className="space-y-12">
          {/* Module 2: The Mom Test */}
          <section>
            <h2 className={SECTION_HEADING}>The Mom Test · Discovery Script</h2>

            {(discoveryGoal || targetPayerProfile) && (
              <div className="mb-6 grid gap-4 rounded-lg border border-emerald-500/30 bg-slate-900/60 p-5 md:grid-cols-2">
                {discoveryGoal && (
                  <div>
                    <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                      <Target className="h-3 w-3" />
                      Discovery Goal
                    </p>
                    <cite className="mt-1 block text-sm not-italic leading-relaxed text-zinc-200">
                      {discoveryGoal}
                    </cite>
                  </div>
                )}
                {targetPayerProfile && (
                  <div>
                    <p className={cn(SUBSECTION_LABEL, 'text-indigo-300')}>
                      <Users className="h-3 w-3" />
                      Target Payer Profile
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-200">
                      {targetPayerProfile}
                    </p>
                  </div>
                )}
              </div>
            )}

            {momQuestions.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Discovery questions unlock with the full execution playbook.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {momQuestions.map((row, index) => (
                  <QuestionCard key={`question-${index}`} row={row} index={index} />
                ))}
              </div>
            )}

            {(redFlagPattern || greenFlagPattern) && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {greenFlagPattern && (
                  <div className="rounded-md border border-emerald-500/40 bg-emerald-500/[0.06] p-4">
                    <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                      <CheckCircle2 className="h-3 w-3" />
                      Green Flag · Buy Signal
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                      {greenFlagPattern}
                    </p>
                  </div>
                )}
                {redFlagPattern && (
                  <div className="rounded-md border border-rose-500/40 bg-rose-950/30 p-4">
                    <p className={cn(SUBSECTION_LABEL, 'text-rose-300')}>
                      <AlertTriangle className="h-3 w-3" />
                      Red Flag · Polite Lies
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-rose-100/90">
                      {redFlagPattern}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Module 3: Customer Finder */}
          <section>
            <h2 className={SECTION_HEADING}>The Customer Finder · First 50 Buyers</h2>

            {tactics.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Acquisition tactics unlock with the full execution playbook.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tactics.map((row, index) => (
                  <CustomerTacticCard
                    key={`tactic-${index}`}
                    row={row}
                    index={index}
                  />
                ))}
              </div>
            )}

            {(conversionHook || weekOnePriority) && (
              <aside className="mt-6 grid gap-4 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.08] to-slate-900 p-5 md:grid-cols-2">
                {conversionHook && (
                  <div>
                    <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                      <Zap className="h-3 w-3" />
                      Immediate Action · Conversion Hook
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                      {conversionHook}
                    </p>
                  </div>
                )}
                {weekOnePriority && (
                  <div>
                    <p className={cn(SUBSECTION_LABEL, 'text-emerald-300')}>
                      <Flag className="h-3 w-3" />
                      Immediate Action · Week 1 Priority
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
                      {weekOnePriority}
                    </p>
                  </div>
                )}
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
              value={`showcase_arsenal_${report.slug}`}
            />
            <ValifyeButton
              size="xl"
              type="submit"
              className={cn(
                'bg-emerald-500 hover:bg-emerald-600 text-slate-950',
                'shadow-[0_0_30px_rgba(16,185,129,0.55)] ring-1 ring-emerald-300/40',
                'font-mono uppercase tracking-[0.22em]'
              )}
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Unlock the Full Execution Playbook for $49 →
            </ValifyeButton>
          </form>
        </div>
      </div>
    </article>
  )
}
