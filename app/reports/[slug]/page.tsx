import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Scale,
  Activity,
  ListTree,
  ShieldAlert,
  Terminal,
  AlertTriangle,
} from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getReportBySlug, getIndustryHubBySectorSlug, getReportsBySlugs } from '@/lib/reportData'
import type { ExperimentData, LogicAudit, UnitEconomics } from '@/lib/reportData'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

function clampScore(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function getToneClasses(verdict: string | null | undefined) {
  const v = (verdict ?? '').toString().toUpperCase()
  if (v.includes('KILL') || v.includes('FAIL') || v.includes('CATASTROPHIC')) {
    return {
      header: 'border-red-700 bg-red-950 text-red-100',
      bar: 'bg-red-500',
      accent: 'text-red-400',
    }
  }
  if (v.includes('BUILD') || v.includes('VIABLE') || v.includes('GREEN')) {
    return {
      header: 'border-emerald-600 bg-emerald-950 text-emerald-50',
      bar: 'bg-emerald-400',
      accent: 'text-emerald-300',
    }
  }
  return {
    header: 'border-amber-600 bg-amber-950 text-amber-50',
    bar: 'bg-amber-400',
    accent: 'text-amber-300',
  }
}

function safeLogicAudit(experiment: ExperimentData | null): LogicAudit | null {
  if (
    experiment &&
    typeof experiment === 'object' &&
    !Array.isArray(experiment) &&
    (experiment as any).logic_audit &&
    typeof (experiment as any).logic_audit === 'object' &&
    !Array.isArray((experiment as any).logic_audit)
  ) {
    return (experiment as any).logic_audit as LogicAudit
  }
  return null
}

function safeUnitEconomics(logicAudit: LogicAudit | null): UnitEconomics | null {
  if (
    logicAudit &&
    typeof logicAudit.unit_economics === 'object' &&
    !Array.isArray(logicAudit.unit_economics)
  ) {
    return logicAudit.unit_economics as UnitEconomics
  }
  return null
}

function buildTerminalText(experiment: ExperimentData | null): string {
  if (
    !experiment ||
    typeof experiment !== 'object' ||
    Array.isArray(experiment) ||
    !(experiment as any).raw_notes
  ) {
    return ''
  }
  const rawNotes: unknown = (experiment as any).raw_notes
  if (!rawNotes || typeof rawNotes !== 'object' || Array.isArray(rawNotes)) return ''

  let buf = ''
  for (const [key, value] of Object.entries(rawNotes as Record<string, unknown>)) {
    const filename = key.toLowerCase().replace(/\s+/g, '_')
    const text =
      typeof value === 'string'
        ? value
        : typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : String(value)

    buf += `root@valifye:~# cat ${filename}.log\n${text}\n\n`
  }
  return buf.trim()
}

function inferSectorFromTitle(title: string | null | undefined): string | null {
  if (!title) return null
  const t = title.toLowerCase()
  if (t.includes('ai') || t.includes('artificial intelligence') || t.includes('llm')) {
    return 'Artificial Intelligence'
  }
  if (t.includes('iot') || t.includes('internet of things')) {
    return 'Internet of Things'
  }
  if (
    t.includes('fintech') ||
    t.includes('payments') ||
    t.includes('lending') ||
    t.includes('banking')
  ) {
    return 'FinTech'
  }
  return null
}

function slugifyIndustry(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default async function ReportDetailPage({ params }: Props) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) notFound()

  const experiment = (report.experiment_data ?? null) as ExperimentData | null
  const audit = safeLogicAudit(experiment)

  const tone = getToneClasses(report.final_verdict)
  const score = clampScore(report.overall_integrity_score)

  // Executive summary prefers thick aeo_summary, falls back to forensic_narrative
  const executiveSummary: string | null =
    (audit && typeof audit.aeo_summary === 'string' && audit.aeo_summary) ||
    (typeof report.forensic_narrative === 'string' ? report.forensic_narrative : null)

  const unitEcon = safeUnitEconomics(audit)
  const cpa =
    unitEcon && typeof unitEcon.cpa !== 'undefined' ? Number(unitEcon.cpa) : null
  const ltv =
    unitEcon && typeof unitEcon.ltv !== 'undefined' ? Number(unitEcon.ltv) : null
  const paybackMonths =
    unitEcon && typeof unitEcon.payback_months !== 'undefined'
      ? Number(unitEcon.payback_months)
      : null
  const ratio =
    typeof ltv === 'number' &&
    Number.isFinite(ltv) &&
    typeof cpa === 'number' &&
    Number.isFinite(cpa) &&
    cpa > 0
      ? ltv / cpa
      : null
  const hasUnitEcon =
    unitEcon &&
    (Number.isFinite(cpa) || Number.isFinite(ltv) || ratio !== null || Number.isFinite(paybackMonths))

  const entities: string[] =
    audit &&
    Array.isArray(audit.market_entities) &&
    audit.market_entities.length > 0
      ? audit.market_entities.filter((e) => typeof e === 'string')
      : []

  const rejections: string[] =
    audit &&
    Array.isArray(audit.brutal_rejections) &&
    audit.brutal_rejections.length > 0
      ? audit.brutal_rejections.filter((e) => typeof e === 'string')
      : []

  const hasSplitView = entities.length > 0 || rejections.length > 0

  const patterns =
    audit &&
    Array.isArray(audit.patterns) &&
    audit.patterns.length > 0
      ? audit.patterns.filter(
          (p) =>
            p &&
            typeof p === 'object' &&
            typeof p.pattern === 'string' &&
            p.pattern.trim().length > 0,
        )
      : []

  const terminalText = buildTerminalText(experiment)

  // --- Sector context bridge ---
  const sectorName = inferSectorFromTitle(report.idea_title)
  let sectorSlug: string | null = null
  let sectorHub: Awaited<ReturnType<typeof getIndustryHubBySectorSlug>> | null = null
  let relatedReports: Awaited<ReturnType<typeof getReportsBySlugs>> = []

  if (sectorName) {
    sectorSlug = slugifyIndustry(sectorName)
    sectorHub = await getIndustryHubBySectorSlug(sectorSlug)
    if (sectorHub) {
      const topSlugs = new Set(sectorHub.top_verdicts.map((v) => v.slug))
      const candidateSlugs = sectorHub.all_slugs.filter(
        (s) => s && s !== report.slug && !topSlugs.has(s),
      )
      const limited = candidateSlugs.slice(0, 3)
      if (limited.length > 0) {
        relatedReports = await getReportsBySlugs(limited)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-mono text-zinc-200">
      <ValifyeNavbar />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Back nav */}
        <div className="mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Validation Reports
          </Link>
          <span className="hidden sm:block">
            Case ID: {report.id?.toString().slice(0, 8) ?? 'VAL-0000'}
          </span>
        </div>

        {/* Forensic header */}
        <section
          className={`mb-10 border px-6 py-6 shadow-[4px_4px_0_0_hsl(var(--primary))] ${tone.header}`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                <Scale className="h-4 w-4" />
                Forensic Market Intelligence Report
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-4xl">
                {report.idea_title}
              </h1>
            </div>

            <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-end sm:gap-6">
              {/* Integrity score + bar */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                  Integrity Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tabular-nums sm:text-5xl">
                    {score}
                  </span>
                  <span className="text-sm font-bold opacity-70">/100</span>
                </div>
                <div className="mt-2 h-2 w-40 border border-current bg-black/50">
                  <div
                    className={`h-full ${tone.bar}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Verdict badge */}
              <div className="flex flex-col items-center border border-current px-5 py-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                  Verdict
                </span>
                <span className="mt-1 text-xl font-black uppercase tracking-[0.4em]">
                  {String(report.final_verdict || '').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Executive summary */}
        {executiveSummary && (
          <section className="mb-8 border border-zinc-800 bg-[#080808] px-6 py-5 text-sm leading-relaxed text-zinc-300">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <AlertTriangle className="h-4 w-4" />
              Executive Summary
            </h2>
            <p>{executiveSummary}</p>
          </section>
        )}

        {/* Financial carnage / assessment grid */}
        {hasUnitEcon && (
          <section className="mb-8 border border-zinc-800 bg-[#080808] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
                <Activity className="h-4 w-4" />
                <span>Financial Assessment</span>
              </div>
              {unitEcon?.math_verdict && typeof unitEcon.math_verdict === 'string' && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {unitEcon.math_verdict}
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {Number.isFinite(cpa) && (
                <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    CPA
                  </span>
                  <span className="text-3xl font-black tabular-nums text-zinc-100">
                    {Math.round(Number(cpa))}
                  </span>
                </div>
              )}
              {Number.isFinite(ltv) && (
                <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    LTV
                  </span>
                  <span className="text-3xl font-black tabular-nums text-zinc-100">
                    {Math.round(Number(ltv))}
                  </span>
                </div>
              )}
              {ratio !== null && (
                <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    LTV : CAC
                  </span>
                  <span
                    className={`text-3xl font-black tabular-nums ${
                      ratio >= 3
                        ? 'text-emerald-400'
                        : ratio >= 1
                          ? 'text-amber-300'
                          : 'text-red-400'
                    }`}
                  >
                    {ratio.toFixed(2)} : 1
                  </span>
                </div>
              )}
            </div>

            {Number.isFinite(paybackMonths) && (
              <div className="mt-4 border border-zinc-800 bg-black px-4 py-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Payback Period
                </span>
                <p className="mt-1 font-mono text-sm text-zinc-200">
                  {Math.round(Number(paybackMonths))} months
                </p>
              </div>
            )}
          </section>
        )}

        {/* Split view: entities vs brutal rejections */}
        {hasSplitView && (
          <section className="mb-8 grid gap-6 md:grid-cols-2">
            {entities.length > 0 && (
              <div className="border border-zinc-800 bg-[#080808] px-6 py-5 text-xs">
                <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                  <ListTree className="h-3 w-3" />
                  Market Entities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {entities.map((entity, idx) => (
                    <span
                      key={`${entity}-${idx}`}
                      className="border border-zinc-700 bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-200"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rejections.length > 0 && (
              <div className="border border-red-900 bg-[#1a0505] px-6 py-5 text-xs">
                <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">
                  <ShieldAlert className="h-3 w-3" />
                  Brutal Rejections
                </h2>
                <ul className="space-y-3">
                  {rejections.map((line, idx) => (
                    <li
                      key={`${line}-${idx}`}
                      className="border-l-4 border-red-600 bg-red-950/40 px-3 py-2 text-[11px] italic leading-relaxed text-red-200"
                    >
                      “{line}”
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Truth vs Hype patterns table (desktop) + mobile details */}
        {patterns.length > 0 && (
          <section className="mb-8 border border-zinc-800 bg-[#080808]">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <Activity className="h-4 w-4" />
              <span>Truth vs. Hype Patterns</span>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    <th className="px-6 py-3 w-1/3">Founder Claim (The Hype)</th>
                    <th className="px-6 py-3">Valifye Logic</th>
                    <th className="px-6 py-3 w-20 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {patterns.map((p, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="px-6 py-4 align-top text-xs italic text-zinc-300">
                        {p.pattern}
                      </td>
                      <td className="px-6 py-4 align-top font-mono text-[11px] leading-relaxed text-zinc-200">
                        {p.implication}
                      </td>
                      <td className="px-6 py-4 align-top text-right font-mono text-xs font-bold text-zinc-400">
                        {typeof p.evidence_count === 'number'
                          ? p.evidence_count >= 0
                            ? `+${p.evidence_count}`
                            : p.evidence_count
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile detail toggles */}
            <div className="divide-y divide-zinc-800 md:hidden">
              {patterns.map((p, idx) => (
                <details key={idx} className="px-4 py-3 text-xs">
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                    {p.pattern}
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                        Valifye Logic
                      </p>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed text-zinc-200">
                        {p.implication}
                      </p>
                    </div>
                    {typeof p.evidence_count === 'number' && (
                      <p className="text-[10px] font-mono text-zinc-400">
                        Delta:{' '}
                        {p.evidence_count >= 0
                          ? `+${p.evidence_count}`
                          : p.evidence_count}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Sector Intelligence bridge */}
        {sectorName && sectorSlug && sectorHub && relatedReports.length > 0 && (
          <section className="mb-8 border border-zinc-800 bg-[#080808] px-6 py-5 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Sector Intelligence
                </span>
                <Link
                  href={`/reports/industry/${sectorSlug}`}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400 hover:text-emerald-300"
                >
                  {sectorHub.industry_name}
                </Link>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {sectorHub.report_count} files in sector
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedReports.map((r) => (
                <Link
                  key={r.slug}
                  href={`/reports/${r.slug}`}
                  className="flex flex-col justify-between border border-zinc-800 bg-black/60 px-4 py-3 text-left transition-colors hover:border-emerald-500 hover:bg-black/80"
                >
                  <div className="mb-2 space-y-1">
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${(() => {
                        const upper = r.final_verdict.toString().toUpperCase()
                        if (upper.includes('KILL')) {
                          return 'border-red-500/60 bg-red-950/40 text-red-200'
                        }
                        if (upper.includes('BUILD')) {
                          return 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                        }
                        return 'border-amber-500/60 bg-amber-950/40 text-amber-200'
                      })()}`}
                    >
                      <Scale className="h-3 w-3" />
                      {r.final_verdict}
                    </span>
                    <p className="text-[11px] font-semibold leading-snug text-zinc-100 line-clamp-2">
                      {r.idea_title}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Score</span>
                    <span className="font-bold text-zinc-100">
                      {Number.isFinite(r.overall_integrity_score)
                        ? `${r.overall_integrity_score}/100`
                        : '—'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Terminal vault for raw notes */}
        {terminalText && (
          <section className="mb-10 border border-zinc-800 bg-[#080808] px-6 py-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span>Raw Evidence Vault</span>
              </div>
            </div>
            <details className="mt-3 border border-zinc-800 bg-black/90 px-4 py-3 text-[11px] text-emerald-200">
              <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                Toggle raw_notes (terminal stream)
              </summary>
              <pre className="mt-3 whitespace-pre-wrap leading-relaxed">
{`root@valifye:~# tail -n 200 evidence.log
${terminalText}`}
              </pre>
            </details>
          </section>
        )}
      </main>

      <ValifyeFooter />
    </div>
  )
}