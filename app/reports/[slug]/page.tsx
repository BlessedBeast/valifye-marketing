import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Scale, TrendingUp, AlertTriangle, Database, BookOpen } from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getReportBySlug } from '@/lib/reportData'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function ReportDetailPage({ params }: Props) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) notFound()

  const isKill = report.final_verdict === 'KILL'
  const isBuild = report.final_verdict === 'BUILD'
  
  // Safe extraction of the new Thick Data JSON structure
  const audit = report.experiment_data?.logic_audit || {}
  const rawNotes = report.experiment_data?.raw_notes || {}

  // 🛡️ Filter out lazy AI templates so the Truth vs Hype table doesn't break
  const validPatterns = (audit.patterns || []).filter(p => 
    p.pattern && p.pattern.trim() !== '' && p.pattern.toLowerCase() !== 'string'
  )

  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <ValifyeNavbar />
      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between border border-border bg-card px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Link href="/reports" className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] hover:border-primary hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to reports
          </Link>
          <span className="text-foreground truncate ml-4">{report.idea_title}</span>
        </header>

        {/* 1. The Verdict Hero */}
        <section className={`border p-8 shadow-[4px_4px_0_0_hsl(var(--foreground))] ${
            isKill ? 'bg-red-950 text-red-50 border-red-500' : 
            isBuild ? 'bg-emerald-950 text-emerald-50 border-emerald-500' : 
            'bg-amber-950 text-amber-50 border-amber-500'
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Scale className="h-10 w-10 shrink-0 opacity-90" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Calculated Verdict</p>
                <h1 className="text-3xl font-black uppercase tracking-widest md:text-4xl">{report.final_verdict}</h1>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Integrity Score</p>
              <p className="text-4xl font-black tabular-nums md:text-5xl">{report.overall_integrity_score}/100</p>
            </div>
          </div>
        </section>

        {/* 2. The AEO Anchor (Replaces Executive Summary) */}
        {(audit.aeo_summary || report.forensic_narrative) && (
          <section className="border border-border bg-card p-6 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
              <BookOpen className="h-4 w-4 text-primary" /> Direct Answer (AEO Summary)
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {audit.aeo_summary || report.forensic_narrative}
            </p>
          </section>
        )}

        {/* 3. Unit Economics Dashboard */}
        {audit.unit_economics && typeof audit.unit_economics === 'object' && (
          <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Unit Economics Projection</h2>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Target CPA</p>
                <p className="text-2xl font-mono font-bold text-foreground">${audit.unit_economics.cpa ?? 'N/A'}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Projected LTV</p>
                <p className="text-2xl font-mono font-bold text-foreground">${audit.unit_economics.ltv ?? 'N/A'}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Payback (Mo)</p>
                <p className="text-2xl font-mono font-bold text-foreground">{audit.unit_economics.payback_months ?? 'N/A'}</p>
              </div>
            </div>
            {audit.unit_economics.math_verdict && (
              <div className="p-4 bg-background/50">
                <p className="text-xs italic text-muted-foreground border-l-2 border-primary pl-3">
                  "{audit.unit_economics.math_verdict}"
                </p>
              </div>
            )}
          </section>
        )}

        {/* 4. Market Reality (Split View: Entities vs Rejections) */}
        {((audit.market_entities && audit.market_entities.length > 0) || (audit.brutal_rejections && audit.brutal_rejections.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Market Entities */}
            {audit.market_entities && audit.market_entities.length > 0 && (
              <section className="border border-border bg-card p-6">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Market Entities</h2>
                <div className="flex flex-wrap gap-2">
                  {audit.market_entities.map((entity, i) => (
                    <span key={i} className="bg-muted px-2 py-1 text-[10px] border border-border text-muted-foreground uppercase">
                      {entity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Brutal Rejections */}
            {audit.brutal_rejections && audit.brutal_rejections.length > 0 && (
              <section className="border border-red-900/50 bg-red-950/10 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                  <AlertTriangle className="h-4 w-4" /> Brutal Rejections
                </h2>
                <ul className="space-y-3">
                  {audit.brutal_rejections.map((rejection, i) => (
                    <li key={i} className="text-xs text-red-200/80 border-l-2 border-red-500/50 pl-3 italic">
                      "{rejection}"
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        )}{/* 4. Market Reality (Split View: Entities vs Rejections) */}
        {((audit.market_entities && audit.market_entities.length > 0) || (audit.brutal_rejections && audit.brutal_rejections.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Market Entities */}
            {audit.market_entities && audit.market_entities.length > 0 && (
              <section className="border border-border bg-card p-6">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Market Entities</h2>
                <div className="flex flex-wrap gap-2">
                  {audit.market_entities.map((entity, i) => (
                    <span key={i} className="bg-muted px-2 py-1 text-[10px] border border-border text-muted-foreground uppercase">
                      {entity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Brutal Rejections */}
            {audit.brutal_rejections && audit.brutal_rejections.length > 0 && (
              <section className="border border-red-900/50 bg-red-950/10 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                  <AlertTriangle className="h-4 w-4" /> Brutal Rejections
                </h2>
                <ul className="space-y-3">
                  {audit.brutal_rejections.map((rejection, i) => (
                    <li key={i} className="text-xs text-red-200/80 border-l-2 border-red-500/50 pl-3 italic">
                      "{rejection}"
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        )}

        {/* 5. Thick Case Study */}
        {audit.thick_case_study && (
          <section className="border border-border bg-card p-8 shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-foreground border-b border-border pb-4">
              Simulated Field Report
            </h2>
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {audit.thick_case_study}
            </div>
          </section>
        )}

        {/* 6. Truth vs. Hype (Sanitized) */}
        {validPatterns.length > 0 && (
          <section className="border border-border bg-card shadow-[4px_4px_0_0_hsl(var(--primary))]">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Truth vs. Hype</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detected Pattern</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Implication</th>
                    <th className="w-24 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instances</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {validPatterns.map((row, idx) => (
                    <tr key={idx} className="bg-card">
                      <td className="max-w-[200px] px-4 py-3 text-xs font-bold text-foreground">{row.pattern}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">{row.implication}</td>
                      <td className="w-24 px-4 py-3 text-right font-mono text-sm font-bold tabular-nums text-primary">{row.evidence_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 7. The Raw Evidence Vault */}
        {Object.keys(rawNotes).length > 0 && (
          <section className="mt-8 border border-border bg-background">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 bg-muted/20 px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/30">
                <Database className="h-4 w-4" /> Expand Raw Simulated Evidence
              </summary>
              <div className="border-t border-border p-6 space-y-8">
                {Object.entries(rawNotes).map(([key, text]) => (
                  <div key={key}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{key}</h3>
                    <div className="bg-card border border-border p-4 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                      {text as string}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

      </main>
      <ValifyeFooter />
    </div>
  )
}