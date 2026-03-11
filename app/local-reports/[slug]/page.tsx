import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

interface ScoutReport {
  logic_score: number
  verdict: string
  executive_summary: string
  total_competitors: number
  direct_competitors: number
  avg_rating: number
  density_map: { direct_rivals: any[]; indirect_rivals: any[] }
  competitor_forensic: any[]
  review_sentiment: { top_complaints: string[]; top_praises: string[] }
  your_gap: string
  gap_evidence: string[]
  micro_tam: {
    conservative: string
    realistic: string
    optimistic: string
    calculation_basis: string
  }
  failure_modes: any[]
  entry_playbook: { value_hook: string; positioning_statement: string; steps: any[] }
}

// TODO: Replace this with a real fetch (Supabase, Places API, etc.)
async function getScoutReport(_slug: string): Promise<ScoutReport | null> {
  // Minimal thick sample to exercise the layout
  return {
    logic_score: 78,
    verdict: 'BUILD',
    executive_summary:
      'This is a cached, city-level intelligence file. Demand exists, but only for operators who can navigate dense competition and narrow tolerance for poor service. The market rewards ruthless execution and local relationship depth.',
    total_competitors: 34,
    direct_competitors: 9,
    avg_rating: 4.2,
    density_map: {
      direct_rivals: new Array(9).fill(null),
      indirect_rivals: new Array(25).fill(null),
    },
    competitor_forensic: [],
    review_sentiment: {
      top_complaints: [
        'Staff churn and inconsistent service quality.',
        'Opaque pricing and hidden surcharges.',
        'Slow response times during peak hours.',
      ],
      top_praises: [
        'Clean, well-maintained facilities.',
        'Friendly staff who remember regulars by name.',
        'Convenient location close to transit and parking.',
      ],
    },
    your_gap:
      'No operator is explicitly optimizing for founder-grade reliability and transparent, machine-readable pricing.',
    gap_evidence: [
      'Multiple reviews mention “love the space, but I can never tell what I will actually pay each month.”',
      'No competitor website exposes a public SLA or uptime commitment.',
    ],
    micro_tam: {
      conservative: '$180k / year',
      realistic: '$420k / year',
      optimistic: '$780k / year',
      calculation_basis:
        'Based on a 800m catchment with 1,800 high-intent residents and 3.5% realistic conversion at current ARPU.',
    },
    failure_modes: [],
    entry_playbook: {
      value_hook:
        '“The only local operator where your bill, your uptime, and your support SLA are machine-readable from day one.”',
      positioning_statement:
        'Operate as the forensic-grade, founder-facing option, not another lifestyle brand.',
      steps: [],
    },
  }
}

function clampScore(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function verdictTone(verdict: string | null | undefined) {
  const v = (verdict ?? '').toString().toUpperCase()
  if (v.includes('KILL') || v.includes('FAIL') || v.includes('UNSUITABLE')) {
    return {
      badge: 'bg-red-950 border-red-700 text-red-200',
      bar: 'bg-red-500',
    }
  }
  if (v.includes('BUILD') || v.includes('VIABLE')) {
    return {
      badge: 'bg-emerald-950 border-emerald-600 text-emerald-200',
      bar: 'bg-emerald-400',
    }
  }
  return {
    badge: 'bg-amber-950 border-amber-600 text-amber-200',
    bar: 'bg-amber-400',
  }
}

export default async function LocalReportDetailPage({ params }: Props) {
  const { slug } = await params
  const report = await getScoutReport(slug)

  if (!report) notFound()

  const score = clampScore(report.logic_score)
  const tone = verdictTone(report.verdict)

  const directCount =
    typeof report.direct_competitors === 'number' && Number.isFinite(report.direct_competitors)
      ? report.direct_competitors
      : 0
  const totalCount =
    typeof report.total_competitors === 'number' && Number.isFinite(report.total_competitors)
      ? report.total_competitors
      : 0
  const avgRating =
    typeof report.avg_rating === 'number' && Number.isFinite(report.avg_rating)
      ? report.avg_rating.toFixed(1)
      : 'N/A'

  const complaints =
    report.review_sentiment &&
    Array.isArray(report.review_sentiment.top_complaints)
      ? report.review_sentiment.top_complaints.filter((c) => typeof c === 'string')
      : []

  const praises =
    report.review_sentiment &&
    Array.isArray(report.review_sentiment.top_praises)
      ? report.review_sentiment.top_praises.filter((p) => typeof p === 'string')
      : []

  const gap = typeof report.your_gap === 'string' ? report.your_gap : ''
  const gapEvidence =
    Array.isArray(report.gap_evidence) && report.gap_evidence.length > 0
      ? report.gap_evidence.filter((g) => typeof g === 'string')
      : []

  const microTam = report.micro_tam ?? null
  const entryPlaybook = report.entry_playbook ?? null

  const densityMap = report.density_map ?? { direct_rivals: [], indirect_rivals: [] }
  const directRivalsCount =
    densityMap && Array.isArray(densityMap.direct_rivals)
      ? densityMap.direct_rivals.length
      : directCount
  const indirectRivalsCount =
    densityMap && Array.isArray(densityMap.indirect_rivals)
      ? densityMap.indirect_rivals.length
      : 0

  const terminalCitySlug = slug.replace(/-/g, '_')

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <ValifyeNavbar />

      {/* Sticky CTA header */}
      <div className="sticky top-0 z-30 border-b border-border bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-zinc-400 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">
              This is a cached report for a general area.
            </span>
            <span className="sm:hidden">Cached area report.</span>
          </div>
          <a
            href="https://app.valifye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary/40 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-primary/90"
          >
            Run Live 800m Scan
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back nav */}
        <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          <Link
            href="/local-reports"
            className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-100"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Local Market Database
          </Link>
          <span className="hidden sm:inline">
            Local Intelligence File · {terminalCitySlug}
          </span>
        </div>

        {/* Hero section */}
        <section className="mb-10 border border-zinc-800 bg-zinc-950 px-6 py-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                <MapPin className="h-3 w-3" />
                Local Market Intelligence Report
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-50 sm:text-3xl">
                Cached Market Audit
              </h1>
              {typeof report.executive_summary === 'string' && report.executive_summary.trim() && (
                <p className="max-w-2xl text-xs leading-relaxed text-zinc-300">
                  {report.executive_summary}
                </p>
              )}
            </div>

            {/* Score + verdict */}
            <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-end sm:gap-6">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Logic Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tabular-nums text-zinc-50 sm:text-5xl">
                    {score}
                  </span>
                  <span className="text-sm font-bold text-zinc-600">/100</span>
                </div>
                <div className="mt-2 h-2 w-40 border border-zinc-700 bg-black/70">
                  <div className={`h-full ${tone.bar}`} style={{ width: `${score}%` }} />
                </div>
              </div>

              <div className={`flex flex-col items-center border px-4 py-3 ${tone.badge}`}>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-75">
                  Verdict
                </span>
                <span className="mt-1 text-lg font-black uppercase tracking-[0.35em]">
                  {String(report.verdict || '').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1 – Competitor Density */}
        <section className="mb-10 border border-zinc-800 bg-zinc-950 px-6 py-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            <BarChart3 className="h-4 w-4" />
            Competitor Density
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Direct Competitors
              </span>
              <span className="mt-1 text-3xl font-black tabular-nums text-zinc-50">
                {directRivalsCount}
              </span>
            </div>
            <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Total Operators
              </span>
              <span className="mt-1 text-3xl font-black tabular-nums text-zinc-50">
                {totalCount || directRivalsCount + indirectRivalsCount}
              </span>
            </div>
            <div className="flex flex-col justify-between border border-zinc-800 bg-black px-4 py-4 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Average Rating
              </span>
              <span className="mt-1 text-3xl font-black tabular-nums text-zinc-50">
                {avgRating}
              </span>
            </div>
          </div>
        </section>

        {/* Section 2 – Review Sentiment Engine */}
        {(complaints.length > 0 || praises.length > 0) && (
          <section className="mb-10 border border-zinc-800 bg-zinc-950 px-6 py-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <ShieldAlert className="h-4 w-4" />
              Review Sentiment Engine
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {complaints.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">
                    <ThumbsDown className="h-3 w-3" />
                    What locals complain about
                  </div>
                  <ul className="space-y-2 text-[11px] leading-relaxed text-red-200">
                    {complaints.map((c, idx) => (
                      <li
                        key={`${c}-${idx}`}
                        className="border-l-4 border-red-600/70 bg-red-950/40 px-3 py-2"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {praises.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
                    <ThumbsUp className="h-3 w-3" />
                    What locals love
                  </div>
                  <ul className="space-y-2 text-[11px] leading-relaxed text-emerald-200">
                    {praises.map((p, idx) => (
                      <li
                        key={`${p}-${idx}`}
                        className="border-l-4 border-emerald-500/70 bg-emerald-950/40 px-3 py-2"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section 3 – The Unmet Need */}
        {(gap || gapEvidence.length > 0) && (
          <section className="mb-10 border border-zinc-800 bg-zinc-950 px-6 py-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <AlertTriangle className="h-4 w-4" />
              The Unmet Need
            </h2>
            {gap && (
              <p className="mb-4 text-sm font-semibold leading-relaxed text-zinc-100">
                {gap}
              </p>
            )}
            {gapEvidence.length > 0 && (
              <div className="space-y-3">
                {gapEvidence.map((e, idx) => (
                  <blockquote
                    key={`${e}-${idx}`}
                    className="border-l-4 border-zinc-500 bg-black/60 px-4 py-3 text-[11px] italic leading-relaxed text-zinc-300"
                  >
                    “{e}”
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Section 4 – Entry Playbook & TAM */}
        {(microTam || entryPlaybook) && (
          <section className="mb-10 border border-zinc-800 bg-zinc-950 px-6 py-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Entry Playbook & Micro-TAM
            </h2>

            {microTam && (
              <div className="mb-4 overflow-x-auto border border-zinc-800 bg-black text-[11px] text-zinc-200">
                <table className="w-full text-left">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Scenario</th>
                      <th className="px-3 py-2">Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {typeof microTam.conservative === 'string' && (
                      <tr>
                        <td className="px-3 py-2 font-semibold text-zinc-300">Conservative</td>
                        <td className="px-3 py-2">{microTam.conservative}</td>
                      </tr>
                    )}
                    {typeof microTam.realistic === 'string' && (
                      <tr>
                        <td className="px-3 py-2 font-semibold text-zinc-300">Realistic</td>
                        <td className="px-3 py-2">{microTam.realistic}</td>
                      </tr>
                    )}
                    {typeof microTam.optimistic === 'string' && (
                      <tr>
                        <td className="px-3 py-2 font-semibold text-zinc-300">Optimistic</td>
                        <td className="px-3 py-2">{microTam.optimistic}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {typeof microTam.calculation_basis === 'string' &&
                  microTam.calculation_basis.trim() && (
                    <div className="border-t border-zinc-800 bg-zinc-900/60 px-3 py-2 text-[10px] text-zinc-400">
                      Basis: {microTam.calculation_basis}
                    </div>
                  )}
              </div>
            )}

            {entryPlaybook && typeof entryPlaybook.value_hook === 'string' && (
              <div className="border border-zinc-800 bg-black px-4 py-3 text-[11px] leading-relaxed text-zinc-200">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Value Hook
                </span>
                {entryPlaybook.value_hook}
              </div>
            )}
          </section>
        )}

        {/* Terminal-style note about cached data */}
        <section className="mb-4 border border-zinc-800 bg-black px-6 py-4 text-[11px] leading-relaxed text-zinc-400">
          <p>
            This dossier is rendered from a cached JSON snapshot for programmatic SEO. The live Valifye engine re-scans
            inventory, pricing, and reviews every run. For operational decisions, always rerun a live 800m scan for your
            exact address.
          </p>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}

