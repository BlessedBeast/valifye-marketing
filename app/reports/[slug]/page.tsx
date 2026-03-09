import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Scale } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getReportBySlug } from '@/lib/reportData'
import type { ReportPattern, ExperimentData } from '@/lib/reportData'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

function buildTruthVsHypeRows(experimentData: ExperimentData | null): { hype: string; logic: string; delta: number }[] {
  if (!experimentData?.logic_audit?.patterns?.length) {
    const raw = experimentData?.raw_notes
    const reasoning = experimentData?.logic_audit?.verdict_reasoning ?? ''
    const score = experimentData?.logic_audit?.adjusted_score ?? 0
    if (raw && Object.keys(raw).length > 0) {
      return Object.entries(raw).map(([key, text]) => ({
        hype: text?.slice(0, 400) ?? '',
        logic: reasoning?.slice(0, 300) ?? '—',
        delta: score
      }))
    }
    return [{ hype: '—', logic: reasoning || '—', delta: score }]
  }

  return experimentData.logic_audit.patterns.map((p: ReportPattern) => ({
    hype: p.pattern ?? '—',
    logic: p.implication ?? '—',
    delta: typeof p.evidence_count === 'number' ? p.evidence_count : 0
  }))
}

type ForensicProfile = {
  label: string
  role: string
  techStack: string
  coreAnxiety: string
  dialogue: string
  hiddenObjection: string
  outcome: string
}

function buildInterviewProfiles(experimentData: ExperimentData | null): ForensicProfile[] {
  const dataAny = experimentData as any
  const rawInterviews = dataAny?.Interviews ?? dataAny?.interviews

  if (!rawInterviews) return []

  let list: any[] = []
  if (Array.isArray(rawInterviews)) {
    list = rawInterviews
  } else if (typeof rawInterviews === 'object') {
    list = Object.values(rawInterviews)
  } else if (typeof rawInterviews === 'string') {
    return [
      {
        label: 'Interview 1',
        role: 'Unknown',
        techStack: 'Unknown',
        coreAnxiety: '',
        dialogue: rawInterviews,
        hiddenObjection: '',
        outcome: ''
      }
    ]
  }

  return list.map((item, idx) => {
    const persona = (item && (item as any).persona) || item || {}
    const role =
      (persona as any).role ||
      (persona as any).job_title ||
      'Unknown'
    const techStack =
      (persona as any).tech_stack ||
      (persona as any).stack ||
      'Not specified'
    const coreAnxiety =
      (persona as any).core_anxiety ||
      (persona as any).anxiety ||
      ''
    const dialogue =
      (item as any).mom_test_dialogue ||
      (item as any).mom_test ||
      (item as any).dialogue ||
      ''
    const hiddenObjection = (item as any).hidden_objection || ''
    const outcome = (item as any).outcome || ''

    return {
      label: `Interview ${idx + 1}`,
      role,
      techStack,
      coreAnxiety,
      dialogue,
      hiddenObjection,
      outcome
    }
  })
}

type PreSellMetrics = {
  cpa?: number
  ltv?: number
  roi?: number
  paybackMonths?: number
  ratioValue?: number
}

function extractPreSell(experimentData: ExperimentData | null): { metrics: PreSellMetrics | null; rawText: string | null } {
  const dataAny = experimentData as any
  const src = dataAny?.['Pre-Sell'] ?? dataAny?.pre_sell ?? null

  if (!src) return { metrics: null, rawText: null }

  if (typeof src === 'string') {
    return { metrics: null, rawText: src }
  }

  const base = Array.isArray(src) && src.length > 0 ? src[0] : src
  if (typeof base !== 'object' || base == null) {
    return { metrics: null, rawText: null }
  }

  const lower = Object.fromEntries(
    Object.entries(base as Record<string, unknown>).map(([k, v]) => [k.toLowerCase(), v])
  )

  const num = (val: unknown): number | undefined => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const parsed = Number(val.replace(/[^0-9.-]/g, ''))
      return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
  }

  const cpa = num(lower['cpa'] ?? lower['cac'] ?? lower['cost_per_acquisition'])
  const ltv = num(lower['ltv'] ?? lower['lifetime_value'])
  const roi = num(lower['roi'] ?? lower['return_on_investment'])
  const paybackMonths = num(
    lower['payback_period_months'] ?? lower['payback_period'] ?? lower['payback_months']
  )

  const ratioValue =
    typeof ltv === 'number' && typeof cpa === 'number' && cpa > 0
      ? ltv / cpa
      : undefined

  return {
    metrics: { cpa, ltv, roi, paybackMonths, ratioValue },
    rawText: null
  }
}

export default async function ReportDetailPage({ params }: Props) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) notFound()

  const isKill = report.final_verdict === 'KILL'
  const isBuild = report.final_verdict === 'BUILD'
  const rows = buildTruthVsHypeRows(report.experiment_data)
  const interviewProfiles = buildInterviewProfiles(report.experiment_data)
  const { metrics: preSellMetrics, rawText: preSellRaw } = extractPreSell(report.experiment_data)

  const experimentDataAny = report.experiment_data as any
  const executiveSummary: string | null =
    (experimentDataAny && (experimentDataAny.executive_summary as string)) ||
    (experimentDataAny && (experimentDataAny.ExecutiveSummary as string)) ||
    null

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border border-border bg-card px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to reports
          </Link>
          <span className="text-foreground">{report.idea_title}</span>
        </header>

        {executiveSummary && (
          <section className="border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">
              Executive Summary
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {executiveSummary}
            </p>
          </section>
        )}

        {/* Forensic Header */}
        <section
          className={`border border-foreground p-8 shadow-[4px_4px_0_0_hsl(var(--foreground))] ${
            isKill
              ? 'bg-red-950 text-white'
              : isBuild
                ? 'bg-emerald-950 text-emerald-50 border-emerald-500'
                : 'bg-amber-950 text-amber-50 border-amber-500'
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Scale className="h-10 w-10 shrink-0 opacity-90" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                  Calculated Verdict
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest md:text-4xl">
                  {report.final_verdict}
                </h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Overall Integrity Score
              </p>
              <p className="text-4xl font-black tabular-nums md:text-5xl">
                {report.overall_integrity_score}/100
              </p>
            </div>
          </div>
        </section>

        {report.forensic_narrative && (
          <section className="border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">
              Forensic Narrative
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {report.forensic_narrative}
            </p>
          </section>
        )}

        {interviewProfiles.length > 0 && (
          <section className="border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">
              Forensic Profiles (Interviews)
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {interviewProfiles.map((p) => (
                <div
                  key={p.label}
                  className="flex flex-col gap-2 border border-border bg-background p-4 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>{p.label}</span>
                    <span>{p.role}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Tech Stack:</span> {p.techStack}
                  </p>
                  {p.coreAnxiety && (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Core Anxiety:</span> {p.coreAnxiety}
                    </p>
                  )}
                  {p.dialogue && (
                    <div className="mt-2 space-y-1 border-t border-border pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Mom Test Dialogue
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {p.dialogue}
                      </p>
                    </div>
                  )}
                  {(p.hiddenObjection || p.outcome) && (
                    <div className="mt-2 space-y-1 border-t border-border pt-2">
                      {p.hiddenObjection && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Hidden Objection:</span> {p.hiddenObjection}
                        </p>
                      )}
                      {p.outcome && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Outcome:</span> {p.outcome}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(preSellMetrics || preSellRaw) && (
          <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Economics Table (Pre-Sell)
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                CPA, LTV, and payback period math from the smoke test.
              </p>
            </div>

            {/* Desktop table */}
            {preSellMetrics && (
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        CPA
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        {preSellMetrics.cpa ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        LTV
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        {preSellMetrics.ltv ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        LTV : CAC
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {preSellMetrics.ratioValue ? (
                          <span
                            className={
                              preSellMetrics.ratioValue >= 3
                                ? 'text-emerald-400'
                                : preSellMetrics.ratioValue >= 1
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }
                          >
                            {preSellMetrics.ratioValue.toFixed(2)} : 1
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Payback Period (months)
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        {preSellMetrics.paybackMonths ?? '—'}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-40 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        ROI
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground">
                        {preSellMetrics.roi ?? '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile detail toggle */}
            {(preSellMetrics || preSellRaw) && (
              <div className="md:hidden border-t border-border px-4 py-3 text-sm">
                <details>
                  <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    View Economics Details
                  </summary>
                  <div className="mt-3 space-y-2 text-xs">
                    {preSellMetrics && (
                      <>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">CPA</span>
                          <span className="font-mono text-foreground">{preSellMetrics.cpa ?? '—'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">LTV</span>
                          <span className="font-mono text-foreground">{preSellMetrics.ltv ?? '—'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">LTV : CAC</span>
                          <span className="font-mono">
                            {preSellMetrics.ratioValue
                              ? `${preSellMetrics.ratioValue.toFixed(2)} : 1`
                              : '—'}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Payback (months)</span>
                          <span className="font-mono text-foreground">
                            {preSellMetrics.paybackMonths ?? '—'}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">ROI</span>
                          <span className="font-mono text-foreground">{preSellMetrics.roi ?? '—'}</span>
                        </p>
                      </>
                    )}
                    {preSellRaw && (
                      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        {preSellRaw}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}
          </section>
        )}

        {/* Truth vs. Hype Logic Table */}
        <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Truth vs. Hype
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Founder optimism vs. forensic analyzer output.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    The Hype
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Valifye Logic
                  </th>
                  <th className="w-24 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => (
                  <tr key={idx} className="bg-card">
                    <td className="max-w-md px-4 py-3 italic leading-relaxed text-muted-foreground">
                      {row.hype}
                    </td>
                    <td className="max-w-md px-4 py-3 font-mono text-xs font-bold leading-relaxed text-foreground">
                      {row.logic}
                    </td>
                    <td className="w-24 px-4 py-3 text-right font-mono text-sm font-bold tabular-nums text-foreground">
                      {row.delta >= 0 ? `+${row.delta}` : row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile detail toggles */}
          <div className="md:hidden divide-y divide-border">
            {rows.map((row, idx) => (
              <details key={idx} className="bg-card px-4 py-3 text-sm">
                <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Delta {row.delta >= 0 ? `+${row.delta}` : row.delta}
                </summary>
                <div className="mt-2 space-y-2 text-[11px]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      The Hype
                    </p>
                    <p className="italic text-muted-foreground">{row.hype}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Valifye Logic
                    </p>
                    <p className="font-mono text-foreground">{row.logic}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <ValifyeFooter />
    </div>
  )
}
