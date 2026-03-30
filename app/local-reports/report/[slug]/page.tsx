import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  MapPin,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'

type Props = { params: Promise<{ slug: string }> }

type PublicSeoReportRow = {
  slug: string
  idea_title: string | null
  business_type: string | null
  location_label: string | null
  logic_score: number | null
  report_type: string | null
  report_data: Record<string, any> | null
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

function fixSloppySlug(slug: string): string | null {
  const cleaned = slug.replace(/([a-z0-9])in([a-z0-9])/g, '$1-in-$2')
  return cleaned !== slug ? cleaned : null
}

// --- FORENSIC PARSER COMPONENT ---
// Recursively renders nested JSON into clean UI, parsing basic markdown.
function ForensicDataNode({ data }: { data: any }) {
  if (data === null || data === undefined) {
    return <span className="text-zinc-600 italic">No data available</span>
  }

  // 1. Primitive: String (with Markdown parsing)
  if (typeof data === 'string') {
    return (
      <div className="space-y-2">
        {data.split('\n').map((line, i) => {
          if (!line.trim()) return null

          // Handle bullet points in strings
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const cleanLine = line.trim().substring(2)
            return (
              <div key={i} className="flex gap-2 ml-2">
                <span className="text-primary">›</span>
                <span className="leading-relaxed text-zinc-300">
                  {formatBoldText(cleanLine)}
                </span>
              </div>
            )
          }

          // Handle standard paragraphs
          return (
            <p key={i} className="leading-relaxed text-zinc-300">
              {formatBoldText(line)}
            </p>
          )
        })}
      </div>
    )
  }

  // 2. Primitives: Numbers and Booleans
  if (typeof data === 'number' || typeof data === 'boolean') {
    return <span className="font-mono text-zinc-100">{String(data)}</span>
  }

  // 3. Arrays
  if (Array.isArray(data)) {
    return (
      <ul className="mt-2 space-y-3 border-l border-zinc-800/50 pl-4">
        {data.map((item, i) => (
          <li key={i} className="relative text-[11px]">
            <span className="absolute -left-[21px] top-0 text-primary">›</span>
            <ForensicDataNode data={item} />
          </li>
        ))}
      </ul>
    )
  }

  // 4. Nested Objects
  if (typeof data === 'object') {
    return (
      <div className="mt-3 space-y-4">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="border-l-2 border-zinc-800/50 pl-3">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              {key.replace(/_/g, ' ')}
            </span>
            <div className="text-[11px]">
              <ForensicDataNode data={val} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// Helper for bold text (**text**)
function formatBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={j} className="font-bold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
// ---------------------------------

export default async function LocalSeoReportPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const { data, error } = await supabase
    .from('public_seo_reports')
    .select('slug, idea_title, business_type, location_label, logic_score, report_type, report_data')
    .eq('slug', slug)
    .maybeSingle<PublicSeoReportRow>()

  if (error) {
    console.error('Supabase Fetch Error (public_seo_reports):', error)
  }

  let report = data

  if (!report) {
    const corrected = fixSloppySlug(slug)
    if (corrected) {
      const { data: alt } = await supabase
        .from('public_seo_reports')
        .select('slug')
        .eq('slug', corrected)
        .maybeSingle<Pick<PublicSeoReportRow, 'slug'>>()
      if (alt) {
        permanentRedirect(`/local-reports/report/${corrected}`)
      }
    }
    notFound()
  }

  const score =
    typeof report.logic_score === 'number' && Number.isFinite(report.logic_score)
      ? Math.round(report.logic_score)
      : null

  const [rawCity, rawRegion] = (report.location_label || '')
    .split(',')
    .map((s) => s.trim())

  const cityPart = rawCity || null
  const regionPart = rawRegion || null

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans text-zinc-100">
      <ValifyeNavbar />

      {/* High Urgency Sticky Banner */}
      <div className="sticky top-0 z-30 border-b border-zinc-900 bg-[#050505]/95 backdrop-blur font-mono">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-zinc-400 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">
              Cached programmatic SEO audit. Always rerun a live scan before operating decisions.
            </span>
            <span className="sm:hidden">Cached pSEO audit.</span>
          </div>
          <a
            href="https://app.valifye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary/20"
          >
            Run Live Scan
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Back nav */}
        <div className="mb-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
          <Link
            href="/local-reports"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" />
            Local Market Database
          </Link>
          {report.location_label && (
            <span className="hidden sm:inline-flex items-center gap-2 text-zinc-400">
              <MapPin className="h-3 w-3 text-primary" />
              {report.location_label}
            </span>
          )}
        </div>

        {/* Hero Briefing */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-500">
                <MapPin className="h-3 w-3" />
                Forensic Local Audit
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-50 sm:text-4xl md:text-5xl leading-none">
                {report.idea_title || 'Unnamed Local Market Audit'}
              </h1>
              {report.location_label && (
                <p className="text-sm leading-relaxed text-zinc-400 font-serif italic">
                  Archived market intelligence for{' '}
                  <span className="font-semibold text-zinc-100 not-italic">
                    {cityPart}
                    {regionPart ? `, ${regionPart}` : null}
                  </span>
                  . Data synthesized to evaluate market saturation and demand gaps.
                </p>
              )}
            </div>

            {score !== null && (
              <div className="flex flex-col items-end gap-2 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Viability Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tabular-nums text-zinc-50">
                    {score}
                  </span>
                  <span className="text-sm font-bold text-zinc-600">/100</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Structured Intelligence Grid */}
        {report.report_data && typeof report.report_data === 'object' && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
              <BarChart3 className="h-4 w-4" />
              Intelligence Annex
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 items-start">
              {Object.entries(report.report_data).map(([rawKey, value]) => {
                const label = rawKey.replace(/_/g, ' ')
                
                return (
                  <div
                    key={rawKey}
                    className="flex flex-col border border-zinc-800 bg-[#080808] overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="border-b border-zinc-800 bg-black/40 px-5 py-3">
                      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                        {label}
                      </h3>
                    </div>
                    
                    {/* Card Body with Recursive Renderer */}
                    <div className="p-5 font-mono text-[11px]">
                      <ForensicDataNode data={value} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="mt-16 border-t border-zinc-900 pt-8 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <p>
            Generated via Valifye automated local intelligence network. Data represents a snapshot in time.
          </p>
        </section>
      </main>

      <ValifyeFooter />
    </div>
  )
}