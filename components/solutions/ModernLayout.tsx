import { Fragment, type ReactNode } from 'react'
import {
  AlertOctagon,
  ShieldCheck,
  Terminal
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { SolutionSchemaJsonLd } from '@/components/solutions/SolutionThickEvidence'
import type {
  SolutionContentMatrix,
  SolutionPillar,
  SolutionRiskFactor
} from '@/lib/solutionData'
import { cn } from '@/lib/utils'

function isRow(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function rowStr(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  }
  return ''
}

function briefingParagraphs(aeoAnswer: string): string[] {
  const raw = aeoAnswer.trim()
  if (!raw) return []
  const parts = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  return parts.length > 0 ? parts : [raw]
}

/** Coerce a matrix section value to a row array (JSON string arrays supported). */
function matrixSectionRows(value: unknown): unknown[] {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return []
    try {
      const parsed = JSON.parse(t) as unknown
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

type ThickSection = {
  id: string
  /** First matching key wins for picking rows from the matrix object. */
  keys: string[]
  render: (rows: unknown[]) => ReactNode
}

const THICK_BRIEFING_SECTIONS: ThickSection[] = [
  {
    id: 'timeline',
    keys: ['timeline', 'friction_timeline'],
    render: (rows) => <FrictionTimeline rows={rows} />
  },
  {
    id: 'benchmarks',
    keys: [
      'benchmarks',
      'reality_ledger',
      'ledger',
      'realityLedger'
    ],
    render: (rows) => <RealityLedger rows={rows} />
  },
  {
    id: 'sentiment',
    keys: ['sentiment', 'sentiment_grid', 'sentimentGrid'],
    render: (rows) => <SentimentGrid rows={rows} />
  },
  {
    id: 'risk_matrix',
    keys: ['risk_matrix', 'riskMatrix', 'risk'],
    render: (rows) => <RiskMatrix rows={rows} />
  }
]

/**
 * Renders every thick-briefing block that has non-empty row data under known keys.
 * Multiple sections (timeline + table + grid + risk) can appear on one page.
 */
function ThickIntelligenceBriefing({
  matrix
}: {
  matrix: SolutionContentMatrix
}) {
  const blocks: ReactNode[] = []

  for (const section of THICK_BRIEFING_SECTIONS) {
    let rows: unknown[] | null = null
    for (const key of section.keys) {
      if (!(key in matrix)) continue
      const candidate = matrixSectionRows(matrix[key])
      if (candidate.length > 0) {
        rows = candidate
        break
      }
    }
    if (rows != null) {
      blocks.push(
        <Fragment key={section.id}>{section.render(rows)}</Fragment>
      )
    }
  }

  if (blocks.length === 0) return null

  return (
    <div className="flex flex-col gap-12 md:gap-16">{blocks}</div>
  )
}

function FrictionTimeline({ rows }: { rows: unknown[] }) {
  return (
    <section
      aria-label="Friction timeline"
      className="space-y-6 rounded-lg border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8"
    >
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <Terminal className="h-5 w-5 text-emerald-400/90" aria-hidden />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/85">
            Friction timeline
          </p>
          <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-100 md:text-xl">
            Stepwise manual playbook
          </h2>
        </div>
      </div>

      <div className="relative pl-1">
        <span
          className="pointer-events-none absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-orange-500/30 md:left-[17px]"
          aria-hidden
        />
        <ol className="relative m-0 list-none space-y-0 p-0">
        {rows.map((raw, i) => {
          if (!isRow(raw)) return null
          const stepNum =
            rowStr(raw, ['step', 'step_number', 'stepNumber', 'index', 'order']) ||
            String(i + 1)
          const title = rowStr(raw, [
            'title',
            'name',
            'headline',
            'phase',
            'label'
          ])
          const body = rowStr(raw, [
            'instruction',
            'instructions',
            'body',
            'description',
            'copy',
            'detail',
            'manual',
            'text'
          ])
          if (!title && !body) return null
          return (
            <li
              key={`${stepNum}-${i}`}
              className="relative flex gap-5 pb-10 last:pb-0 md:gap-6"
            >
              <span
                className="relative z-[1] mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-zinc-950 font-mono text-[10px] font-bold text-emerald-300 shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)]"
                aria-hidden
              >
                {stepNum}
              </span>
              <div className="min-w-0 flex-1 space-y-2 border-l border-transparent pt-0.5 pl-0 md:pl-1">
                {title ? (
                  <h3 className="font-serif text-base font-bold text-zinc-50 md:text-lg">
                    {title}
                  </h3>
                ) : null}
                {body ? (
                  <p className="font-mono text-sm leading-relaxed text-zinc-400">
                    {body}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
        </ol>
      </div>
    </section>
  )
}

function RealityLedger({ rows }: { rows: unknown[] }) {
  return (
    <section
      aria-label="Reality ledger"
      className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/80"
    >
      <div className="flex items-center gap-3 border-b border-zinc-800/80 px-6 py-4 md:px-8">
        <ShieldCheck className="h-5 w-5 text-emerald-400/90" aria-hidden />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/85">
            Reality ledger
          </p>
          <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-100 md:text-xl">
            Audit trail · effort vs edge
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left font-mono text-xs md:text-sm">
          <thead>
            <tr className="border-b border-zinc-800/90 bg-zinc-900/40 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              <th scope="col" className="px-4 py-3 md:px-6 md:py-4">
                Audit item
              </th>
              <th scope="col" className="px-4 py-3 md:px-6 md:py-4">
                Manual effort
              </th>
              <th scope="col" className="px-4 py-3 md:px-6 md:py-4 text-orange-300/90">
                Valifye edge
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((raw, i) => {
              if (!isRow(raw)) return null
              const audit = rowStr(raw, [
                'audit_item',
                'auditItem',
                'item',
                'label',
                'title',
                'name'
              ])
              const manual = rowStr(raw, [
                'manual_effort',
                'manualEffort',
                'manual',
                'effort',
                'diy',
                'operator_work'
              ])
              const edge = rowStr(raw, [
                'valifye_edge',
                'valifyeEdge',
                'edge',
                'advantage',
                'signal'
              ])
              if (!audit && !manual && !edge) return null
              return (
                <tr
                  key={i}
                  className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/25"
                >
                  <td className="max-w-[220px] px-4 py-3 align-top text-zinc-200 md:max-w-none md:px-6 md:py-4">
                    {audit || '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400 md:px-6 md:py-4">
                    {manual || '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-orange-200/90 md:px-6 md:py-4">
                    {edge || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SentimentGrid({ rows }: { rows: unknown[] }) {
  return (
    <section aria-label="Sentiment intelligence grid" className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400/90" aria-hidden />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/85">
            Sentiment grid
          </p>
          <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-100 md:text-xl">
            Intelligence cards
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {rows.map((raw, i) => {
          if (!isRow(raw)) return null
          const source = rowStr(raw, [
            'source',
            'origin',
            'channel',
            'publisher'
          ])
          const finding = rowStr(raw, [
            'finding',
            'signal',
            'observation',
            'intel',
            'summary'
          ])
          const opportunity = rowStr(raw, [
            'opportunity',
            'play',
            'angle',
            'wedge',
            'action'
          ])
          if (!source && !finding && !opportunity) return null
          return (
            <article
              key={i}
              className="flex flex-col border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.08)]"
            >
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-zinc-500">
                Source
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-emerald-200/95">
                {source || '— CLASSIFIED —'}
              </p>
              <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-zinc-500">
                Finding
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                {finding || '—'}
              </p>
              <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-orange-400/80">
                Opportunity
              </p>
              <p className="mt-1 text-sm leading-relaxed text-orange-200/85">
                {opportunity || '—'}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unknown'

function parseSeverity(raw: Record<string, unknown>): Severity {
  const s = rowStr(raw, [
    'severity',
    'risk',
    'level',
    'priority',
    'tier'
  ]).toLowerCase()
  if (s.includes('critical') || s.includes('severe')) return 'critical'
  if (s.includes('high') || s === 'h') return 'high'
  if (s.includes('medium') || s.includes('mod') || s === 'm') return 'medium'
  if (s.includes('low') || s === 'l') return 'low'
  return 'unknown'
}

function RiskMatrix({ rows }: { rows: unknown[] }) {
  const slots: (Record<string, unknown> | null)[] = [0, 1, 2, 3].map(
    (i) => (isRow(rows[i]) ? rows[i] : null)
  )

  return (
    <section
      aria-label="Risk assessment matrix"
      className="space-y-6 rounded-lg border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8"
    >
      <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <AlertOctagon className="h-5 w-5 text-orange-400/95" aria-hidden />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-orange-400/85">
            Risk matrix
          </p>
          <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-100 md:text-xl">
            2×2 exposure assessment
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slots.map((raw, i) => {
          const labels = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV']
          if (!raw) {
            return (
              <div
                key={i}
                className="flex min-h-[140px] flex-col justify-center border border-dashed border-zinc-800/80 bg-zinc-900/20 p-4 font-mono text-xs text-zinc-600"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.24em]">
                  {labels[i]}
                </span>
                <span className="mt-2 text-zinc-500">No signal · awaiting intel</span>
              </div>
            )
          }
          const title = rowStr(raw, ['title', 'label', 'name', 'quadrant', 'axis'])
          const summary = rowStr(raw, [
            'summary',
            'body',
            'description',
            'finding',
            'detail',
            'copy'
          ])
          const sev = parseSeverity(raw)
          const hot =
            sev === 'critical' || sev === 'high'
              ? 'border-rose-500/45 bg-rose-950/25 shadow-[0_0_32px_-12px_rgba(244,63,94,0.35)]'
              : sev === 'medium'
                ? 'border-orange-500/40 bg-orange-950/15 shadow-[0_0_28px_-12px_rgba(249,115,22,0.22)]'
                : 'border-zinc-700/80 bg-zinc-900/30'

          return (
            <article
              key={i}
              className={cn(
                'flex min-h-[140px] flex-col gap-2 border p-4 md:p-5',
                hot
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  {labels[i]}
                </span>
                <span
                  className={cn(
                    'rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider',
                    sev === 'critical' || sev === 'high'
                      ? 'border-rose-500/40 text-rose-200'
                      : sev === 'medium'
                        ? 'border-orange-500/40 text-orange-200'
                        : 'border-zinc-600 text-zinc-400'
                  )}
                >
                  {sev}
                </span>
              </div>
              {title ? (
                <h3 className="font-serif text-base font-bold text-zinc-50">
                  {title}
                </h3>
              ) : null}
              {summary ? (
                <p className="font-mono text-xs leading-relaxed text-zinc-400 md:text-sm">
                  {summary}
                </p>
              ) : (
                <p className="font-mono text-xs text-zinc-500">—</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SystemWarnings({ factors }: { factors: SolutionRiskFactor[] }) {
  return (
    <section
      aria-label="System warnings"
      className="rounded-lg border border-rose-500/25 bg-rose-950/20 p-6 md:p-8"
    >
      <div className="flex items-start gap-3">
        <AlertOctagon
          className="mt-0.5 h-6 w-6 shrink-0 text-rose-400"
          aria-hidden
        />
        <div className="min-w-0 space-y-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-rose-300/90">
              System warning
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold tracking-tight text-rose-100 md:text-2xl">
              Confirmed failure classes
            </h2>
            <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-rose-200/80">
              Treat as mandatory diligence inputs. These vectors repeatedly capsize
              operators running on narrative instead of verified demand.
            </p>
          </div>
          <ul className="m-0 list-none space-y-4 p-0">
            {factors.map((f, i) => (
              <li
                key={`${f.title}-${i}`}
                className="border-l-2 border-rose-500/50 pl-4"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300/85">
                  {f.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-rose-200">
                  {f.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function IntelCta({ slug, ctaText }: { slug: string; ctaText: string | null }) {
  const trimmed = ctaText?.trim() ?? ''
  const label = trimmed.length > 0 ? trimmed : 'EXECUTE AUDIT'
  const ctaRef = `solution_${slug}`

  return (
    <section
      aria-label="Execute audit"
      className="border border-zinc-800/90 bg-zinc-950/90 px-4 py-10 md:px-8 md:py-14"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-zinc-500">
          Command channel · sealed orders
        </p>
        <form
          method="get"
          action="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <input type="hidden" name="ref" value={ctaRef} />
          <button
            type="submit"
            className={cn(
              'group relative w-full overflow-hidden border-2 border-emerald-500/50 bg-zinc-950',
              'px-6 py-5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-emerald-100',
              'shadow-[0_0_0_1px_rgba(16,185,129,0.15)]',
              'transition-[box-shadow,border-color,transform] duration-300',
              'hover:border-emerald-400/80 hover:shadow-[0_0_48px_4px_rgba(16,185,129,0.45),0_0_80px_-8px_rgba(16,185,129,0.35)]',
              'hover:animate-pulse hover:scale-[1.01] active:scale-[0.99]',
              'md:text-base md:tracking-[0.28em] md:py-6'
            )}
            aria-label={label}
          >
            <span className="relative z-[1]">
              [ {label} ]
            </span>
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
          </button>
        </form>
        <p className="max-w-lg font-mono text-[11px] leading-relaxed text-zinc-500">
          One move. Data-backed verdict. No deck filler.
        </p>
      </div>
    </section>
  )
}

/**
 * AEO / intelligence briefing shell — Forensic Noir (no product screenshots).
 */
export function ModernLayout({ data }: { data: SolutionPillar }) {
  const paragraphs = briefingParagraphs(data.aeoAnswer)

  return (
    <MarketingShell className="max-w-[1180px] gap-12 text-zinc-100">
      <SolutionSchemaJsonLd schemaJson={data.evidenceImages.schemaJson ?? null} />

      <article className="space-y-12 rounded-xl border border-zinc-800/80 bg-zinc-950 pb-10 shadow-[0_0_80px_-40px_rgba(0,0,0,0.9)] md:space-y-16 md:pb-14">
        <header className="border-b border-zinc-800/80 px-5 pt-8 md:px-10 md:pt-12">
          <div className="flex flex-wrap items-center gap-3">
            <Terminal className="h-5 w-5 text-emerald-400/90" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
              Intelligence briefing · {data.slug}
            </p>
          </div>
          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-black leading-[1.1] tracking-tight text-zinc-50 md:text-4xl lg:text-5xl">
            {data.title}
          </h1>
          {data.subtitle ? (
            <p className="mt-4 max-w-3xl font-serif text-lg font-semibold leading-snug text-zinc-300 md:text-xl">
              {data.subtitle}
            </p>
          ) : null}
        </header>

        <div className="space-y-12 px-5 md:space-y-16 md:px-10">
          <section
            aria-labelledby="generative-engine-briefing-heading"
            className="rounded-lg border border-emerald-500/30 bg-zinc-950/90 p-6 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.06)] md:p-8"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-emerald-500/20 pb-4">
              <ShieldCheck
                className="h-4 w-4 text-emerald-400/90"
                aria-hidden
              />
              <h2
                id="generative-engine-briefing-heading"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300/95 md:text-xs"
              >
                Generative Engine Briefing
              </h2>
              <span className="font-mono text-[10px] text-zinc-500">
                · manual playbook (AEO)
              </span>
            </div>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-zinc-200 md:text-[17px] md:leading-relaxed">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} className="m-0 max-w-none">
                    {p}
                  </p>
                ))
              ) : (
                <p className="m-0 font-mono text-sm text-zinc-500">
                  Awaiting briefing body in CMS (aeo_answer).
                </p>
              )}
            </div>
          </section>

          <ThickIntelligenceBriefing matrix={data.contentMatrix} />

          {data.riskFactors.length > 0 ? (
            <SystemWarnings factors={data.riskFactors} />
          ) : null}

          <IntelCta slug={data.slug} ctaText={data.ctaText} />
        </div>
      </article>
    </MarketingShell>
  )
}
