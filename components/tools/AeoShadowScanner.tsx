'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { EyeOff, Fingerprint, Search, Terminal } from 'lucide-react'

import {
  BpkEdgeErrorBanner,
  BpkVerdictBadge,
  BpkVisibilityMeter,
  ShadowScanReportBody
} from '@/components/bpk/BpkReportPrimitives'
import { parseAeoScanPayload, type AeoScanPayload } from '@/lib/bpkReportParse'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'SaaS',
  'E-commerce',
  'Local MIDC',
  'Services',
  'Healthcare',
  'FinTech',
  'Media'
] as const

export function AeoShadowScanner() {
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('SaaS')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AeoScanPayload | null>(null)

  const canSubmit = useMemo(() => {
    const u = url.trim()
    if (u.length < 8 || loading) return false
    const withProto =
      u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`
    try {
      new URL(withProto)
      return true
    } catch {
      return false
    }
  }, [url, loading])

  const normalizedUrl = useMemo(() => {
    const u = url.trim()
    if (!u) return ''
    return u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`
  }, [url])

  const runScan = useCallback(async () => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'aeo-scanner',
        {
          body: {
            url: normalizedUrl,
            category
          }
        }
      )

      if (fnError) {
        setError(fnError.message || 'Edge function request failed.')
        return
      }

      const parsed = parseAeoScanPayload(data)
      setResult(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.')
    } finally {
      setLoading(false)
    }
  }, [category, normalizedUrl])

  return (
    <div className="space-y-12 md:space-y-16">
      <section aria-labelledby="aeo-tool-heading" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Search className="h-5 w-5 text-emerald-400/90" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
            Tool · shadow channel
          </p>
        </div>
        <h1
          id="aeo-tool-heading"
          className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl lg:text-5xl"
        >
          AEO Shadow Scanner
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Forensic answer-engine visibility probe. One URL, one vertical slice —
          structured briefing for operators who need citation-grade intelligence, not
          vanity dashboards.
        </p>

        <div className="grid gap-4 md:grid-cols-1">
          <label className="space-y-2">
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              <Terminal className="h-3.5 w-3.5 text-emerald-500/80" aria-hidden />
              Target URL
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com or example.com"
              className="w-full rounded border border-emerald-900/40 bg-black px-4 py-3 font-mono text-sm tracking-tight text-emerald-100/95 placeholder:text-zinc-600 shadow-[inset_0_0_0_1px_rgba(6,78,59,0.35),0_0_32px_-12px_rgba(16,185,129,0.12)] outline-none transition-colors focus:border-emerald-500/50 focus:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.25),0_0_48px_-8px_rgba(16,185,129,0.22)]"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              <Fingerprint className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
              Category
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as (typeof CATEGORIES)[number])
              }
              className="w-full cursor-pointer appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 py-3 font-mono text-sm text-zinc-200 outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={runScan}
            className={cn(
              'border-2 border-emerald-400/55 bg-zinc-950 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-emerald-50',
              'shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_36px_-4px_rgba(16,185,129,0.45)] transition-all',
              'hover:border-emerald-300/80 hover:shadow-[0_0_52px_4px_rgba(16,185,129,0.35),0_0_80px_-8px_rgba(16,185,129,0.25)]',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none'
            )}
          >
            [ INITIALIZE SHADOW SCAN ]
          </button>
          {!canSubmit && !loading ? (
            <p className="font-mono text-xs text-zinc-500">
              Enter a valid URL (with or without protocol) to arm the channel.
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            className="rounded-lg border border-rose-500/35 bg-rose-950/20 px-4 py-3 font-mono text-sm text-rose-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </section>

      {loading ? (
        <section
          aria-busy="true"
          aria-label="Scan in progress"
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm text-emerald-200/90 md:p-8"
        >
          <div className="flex items-center gap-3 text-emerald-400/90">
            <EyeOff className="h-5 w-5 shrink-0 animate-pulse" aria-hidden />
            <span className="uppercase tracking-[0.2em] text-[11px] md:text-xs">
              /// PROBING ANSWER SURFACES · CORRELATING CITATION GRAPH…
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Latency reflects upstream retrieval. Do not close this terminal.
          </p>
        </section>
      ) : null}

      {result && !loading ? (
        <section
          aria-label="Search intelligence briefing"
          className="space-y-8 border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:space-y-10 md:p-8"
        >
          <header className="space-y-4 border-b border-zinc-800/80 pb-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Search className="h-4 w-4 text-emerald-500/80" aria-hidden />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
                Search intelligence briefing
              </p>
            </div>
            {result.edgeError ? (
              <BpkEdgeErrorBanner message={result.edgeError} />
            ) : null}
            <BpkVerdictBadge verdict={result.aeo_verdict} caption="AEO verdict" />
            <BpkVisibilityMeter score={result.visibility_score} />
          </header>

          <ShadowScanReportBody payload={result} />
        </section>
      ) : null}

      <aside className="rounded-lg border border-dashed border-zinc-800/80 bg-zinc-900/30 p-5 md:p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          Operator note
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Synthetic visibility signals are informational only. Escalate to a full
          market intelligence engagement for crawl-backed evidence, live SERP
          captures, and legal review where applicable.
        </p>
      </aside>

      <section aria-label="Escalate" className="pb-4">
        <Link
          href="/solutions"
          className={cn(
            'flex w-full items-center justify-center border-2 border-orange-500/40 bg-zinc-950 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-orange-100',
            'transition-all hover:border-orange-400/60 hover:shadow-[0_0_36px_-6px_rgba(249,115,22,0.35)] md:text-sm md:tracking-[0.22em]'
          )}
        >
          [ ESCALATE: REQUEST FULL MARKET INTELLIGENCE REPORT ]
        </Link>
      </section>
    </div>
  )
}
