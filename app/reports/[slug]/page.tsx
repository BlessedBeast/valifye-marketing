import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  Scale, 
  AlertOctagon, 
  Terminal, 
  Database, 
  BookOpen, 
  Fingerprint, 
  Activity, 
  Crosshair, 
  ShieldAlert 
} from 'lucide-react'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import { getReportBySlug, ReportPattern } from '@/lib/reportData'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function ReportDetailPage({ params }: Props) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) notFound()

  // 🛡️ DEFENSIVE DATA EXTRACTION (Crash-Proofing)
  const audit = report.experiment_data?.logic_audit || {}
  const rawNotes = report.experiment_data?.raw_notes || {}
  
  const verdictStr = report.final_verdict || 'PIVOT'
  const isKill = verdictStr === 'KILL'
  const isBuild = verdictStr === 'BUILD'
  
  // 🎨 DYNAMIC UI THEME
  const theme = isKill ? {
    border: 'border-red-900',
    bg: 'bg-red-950/20',
    text: 'text-red-500',
    bar: 'bg-red-600',
    accent: 'text-red-400'
  } : isBuild ? {
    border: 'border-emerald-900',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    accent: 'text-emerald-300'
  } : {
    border: 'border-amber-900',
    bg: 'bg-amber-950/20',
    text: 'text-amber-500',
    bar: 'bg-amber-500',
    accent: 'text-amber-400'
  }

  // 🛡️ SAFE FALLBACKS FOR ARRAYS & OBJECTS
  const summary = audit.aeo_summary || report.forensic_narrative
  const caseStudy = audit.thick_case_study
  const economics = audit.unit_economics
  const hasEconomics = economics && typeof economics === 'object'
  
  const entities = Array.isArray(audit.market_entities) ? audit.market_entities : []
  const rejections = Array.isArray(audit.brutal_rejections) ? audit.brutal_rejections : []
  
  const validPatterns = Array.isArray(audit.patterns) 
    ? audit.patterns.filter((p: any) => p && typeof p === 'object' && typeof p.pattern === 'string' && p.pattern.trim() !== '' && p.pattern.toLowerCase() !== 'string')
    : []

  const validRawNotes = rawNotes && typeof rawNotes === 'object' && !Array.isArray(rawNotes) 
    ? Object.entries(rawNotes).filter(([_, text]) => typeof text === 'string') 
    : []

  // Helpers for Unit Economics
  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  }
  const formatRatio = (ltv: any, cpa: any) => {
    const l = Number(ltv); const c = Number(cpa);
    if (isNaN(l) || isNaN(c) || c === 0) return 'N/A';
    return (l/c).toFixed(2) + ' : 1';
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-mono text-zinc-300">
      <ValifyeNavbar />
      <main className="mx-auto w-full max-w-[1000px] flex-1 px-4 py-12">
        
        {/* BACK NAVIGATION */}
        <Link href="/reports" className="mb-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-3 w-3" /> Return to Database
        </Link>

        {/* 1. THE AUDIT HEADER */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-8 gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase flex items-center gap-2">
              <Database className="w-3 h-3" /> Forensic Case ID: {report.id?.slice(0,8) || 'VAL-001'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">{report.idea_title}</h1>
          </div>
          
          <div className="flex gap-4 shrink-0">
            {/* Integrity Score */}
            <div className="flex flex-col items-end justify-end">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Integrity Score</span>
               <div className="flex items-baseline gap-1">
                 <span className={`text-4xl font-black tabular-nums ${theme.text}`}>{report.overall_integrity_score}</span>
                 <span className="text-lg text-zinc-600 font-bold">/100</span>
               </div>
               <div className="w-full h-1.5 bg-zinc-900 mt-2 overflow-hidden">
                 <div className={`h-full ${theme.bar}`} style={{ width: `${report.overall_integrity_score}%` }} />
               </div>
            </div>

            {/* Verdict Badge */}
            <div className={`flex flex-col items-center justify-center border-2 px-6 py-3 ml-2 ${theme.border} ${theme.bg}`}>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Verdict</span>
              <span className={`text-2xl font-black tracking-widest ${theme.text}`}>{report.final_verdict}</span>
            </div>
          </div>
        </div>

        {/* 2. AEO DIRECT ANSWER (THE 'WHY') */}
        {summary && (
          <section className={`mb-12 border-l-4 p-8 ${theme.bg} ${theme.border}`}>
            <h2 className={`mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${theme.text}`}>
              <AlertOctagon className="h-4 w-4" /> Forensic Summary
            </h2>
            <p className="text-sm leading-relaxed text-zinc-200">
              {summary}
            </p>
          </section>
        )}

        {/* 3. UNIT ECONOMICS GRID (THICK DATA ONLY) */}
        {hasEconomics && (
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <Activity className="h-4 w-4" /> 
              {isKill ? "Financial Carnage Assessment" : "Unit Economics Projection"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-zinc-800 bg-[#0a0a0a] p-6 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Acquisition Cost (CPA)</span>
                <span className="text-4xl font-black text-white">{formatCurrency(economics.cpa)}</span>
              </div>
              <div className="border border-zinc-800 bg-[#0a0a0a] p-6 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Lifetime Value (LTV)</span>
                <span className="text-4xl font-black text-white">{formatCurrency(economics.ltv)}</span>
              </div>
              <div className={`border p-6 flex flex-col justify-between ${theme.bg} ${theme.border}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.text}`}>LTV : CAC Ratio</span>
                <span className={`text-4xl font-black ${theme.text}`}>{formatRatio(economics.ltv, economics.cpa)}</span>
              </div>
            </div>
            {economics.math_verdict && (
              <div className="mt-4 border-l-2 border-zinc-700 bg-zinc-900/30 p-4 text-xs text-zinc-400 italic">
                "{economics.math_verdict}"
              </div>
            )}
          </div>
        )}

        {/* 4. MARKET REALITY (SPLIT VIEW) */}
        {(entities.length > 0 || rejections.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {entities.length > 0 && (
              <div className="border border-zinc-800 bg-[#0a0a0a] p-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Crosshair className="w-3 h-3" /> Identified Market Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                   {entities.map((e, i) => (
                     <span key={i} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] uppercase tracking-wider px-3 py-1.5 font-semibold">
                       {e}
                     </span>
                   ))}
                </div>
              </div>
            )}
            {rejections.length > 0 && (
              <div className="border border-red-900/30 bg-red-950/10 p-6">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Critical Vulnerabilities & Rejections
                </h3>
                <ul className="space-y-3">
                   {rejections.map((r, i) => (
                     <li key={i} className="text-xs leading-relaxed text-red-300/80 border-l-2 border-red-700/50 pl-3 italic">
                       "{r}"
                     </li>
                   ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 5. THICK CASE STUDY */}
        {caseStudy && (
          <section className="mb-12 border border-zinc-800 bg-[#0a0a0a] p-8">
            <h2 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-4">
              <BookOpen className="h-4 w-4" /> Simulated Field Report
            </h2>
            <div className="prose prose-sm prose-invert max-w-none text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {caseStudy}
            </div>
          </section>
        )}

        {/* 6. TRUTH VS. HYPE (PATTERNS) */}
        {validPatterns.length > 0 && (
          <section className="mb-12 border border-zinc-800 bg-[#0a0a0a] overflow-hidden">
            <div className="border-b border-zinc-800 bg-black px-6 py-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Behavioral Patterns (Truth vs. Hype)</h2>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="border-b border-zinc-800 bg-zinc-900/30">
                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-1/3">Detected Pattern</th>
                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Forensic Implication</th>
                       <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right w-24">Instances</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                     {validPatterns.map((row: ReportPattern, i: number) => (
                       <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-5 text-xs font-bold text-zinc-200">{row.pattern}</td>
                          <td className="px-6 py-5 text-xs text-zinc-400 leading-relaxed">{row.implication}</td>
                          <td className="px-6 py-5 text-xs font-mono font-bold text-right text-zinc-500">+{row.evidence_count}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </section>
        )}

        {/* 7. RAW EVIDENCE VAULT (TERMINAL LOGS) */}
        {validRawNotes.length > 0 && (
          <details className="group border border-zinc-800 bg-[#0a0a0a] open:bg-black transition-all duration-200">
            <summary className="p-6 cursor-pointer flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 select-none">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4" />
                Access Raw Intercepted Data
              </div>
              <span className="text-[10px] font-mono bg-zinc-800 px-2 py-1 text-zinc-400">{validRawNotes.length} FILES</span>
            </summary>
            <div className="border-t border-zinc-800 p-6 space-y-8 bg-zinc-950/30">
              {validRawNotes.map(([key, text]) => (
                <div key={key} className="space-y-3">
                   <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                     <span className="text-emerald-700/50">root@valifye:~#</span> cat {key.toLowerCase().replace(/\s+/g, '_')}.log
                   </h4>
                   <div className="bg-black border border-zinc-800 p-5 text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap font-mono overflow-x-auto shadow-inner">
                     {text as string}
                   </div>
                </div>
              ))}
            </div>
          </details>
        )}

      </main>
      <ValifyeFooter />
    </div>
  )
}