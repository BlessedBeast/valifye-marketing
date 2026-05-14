'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { MapPin, Target, Terminal, Users, Zap } from 'lucide-react'

import {
  BpkDossierCard,
  BpkEdgeErrorBanner
} from '@/components/bpk/BpkReportPrimitives'
import {
  parseLocalScoutPayload,
  type LocalScoutPayload
} from '@/lib/localScoutParse'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

function bulletBlock(lines: string[]): string {
  if (lines.length === 0) return ''
  return lines.map((l) => `• ${l}`).join('\n')
}

export function LocalMarketScout() {
  const [businessIdea, setBusinessIdea] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LocalScoutPayload | null>(null)

  const canSubmit = useMemo(
    () =>
      businessIdea.trim().length >= 16 &&
      location.trim().length >= 2 &&
      !loading,
    [businessIdea, location, loading]
  )

  const runScout = useCallback(async () => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'local-scout',
        {
          body: {
            business_idea: businessIdea.trim(),
            location: location.trim()
          }
        }
      )

      if (fnError) {
        setError(fnError.message || 'Edge function request failed.')
        return
      }

      setResult(parseLocalScoutPayload(data))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.')
    } finally {
      setLoading(false)
    }
  }, [businessIdea, location])

  const zonesBody = result ? bulletBlock(result.high_traffic_zones) : ''

  return (
    <div className="space-y-12 md:space-y-16">
      <section aria-labelledby="local-scout-heading" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-400/90" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
            Tool · territory channel
          </p>
        </div>
        <h1
          id="local-scout-heading"
          className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl lg:text-5xl"
        >
          Local Market Scout
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
          On-ground validation playbooks for physical operators — where foot traffic
          concentrates, how to test demand without a lease, and how locals and
          competitors behave in the wild.
        </p>

        <div className="grid gap-4 md:grid-cols-1">
          <label className="space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              What are you building?
            </span>
            <textarea
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              rows={5}
              placeholder="Concrete offer, price band, and who walks in the door first."
              className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              autoComplete="off"
            />
          </label>
          <label className="space-y-2">
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              <Target className="h-3.5 w-3.5 text-orange-400/85" aria-hidden />
              Target City/Neighborhood
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. East Austin, Rittenhouse Square, Shoreditch"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 focus:shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={runScout}
            className={cn(
              'border-2 border-emerald-500/50 bg-zinc-950 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.22em] text-emerald-100',
              'shadow-[0_0_0_1px_rgba(16,185,129,0.18)] transition-all animate-pulse',
              'hover:animate-none hover:border-emerald-400/75 hover:shadow-[0_0_44px_-4px_rgba(16,185,129,0.45)]',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:animate-none disabled:shadow-none'
            )}
          >
            [ SCOUT TERRITORY ]
          </button>
          {!canSubmit && !loading ? (
            <p className="font-mono text-xs text-zinc-500">
              Need ≥16 characters on the concept and a neighborhood or city label.
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
          aria-label="Scouting in progress"
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm text-emerald-200/90 md:p-8"
        >
          <div className="flex items-center gap-3 text-emerald-400/90">
            <Terminal className="h-5 w-5 shrink-0 animate-pulse" aria-hidden />
            <span className="uppercase tracking-[0.2em] text-[11px] md:text-xs">
              /// TRIANGULATING FOOT TRAFFIC · CROSSING STREET-LEVEL SIGNALS…
            </span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Hold position. Latency reflects block-level intelligence pulls.
          </p>
        </section>
      ) : null}

      {result && !loading ? (
        <section
          aria-label="Territory intelligence dossier"
          className="space-y-6 border border-zinc-800/90 bg-zinc-950/40 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:space-y-8 md:p-8"
        >
          <header className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-4">
            <Users className="h-4 w-4 text-emerald-500/80" aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              Field dossier · validation map
            </p>
          </header>

          {result.edgeError ? (
            <BpkEdgeErrorBanner message={result.edgeError} />
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:gap-5">
            <BpkDossierCard
              title="location_vibe"
              body={result.location_analysis}
              icon={MapPin}
              iconClass="text-emerald-400/90"
              className="md:col-span-2"
            />
            <BpkDossierCard
              title="high_traffic_zones"
              body={zonesBody}
              icon={Users}
              iconClass="text-orange-300/90"
              className="md:col-span-2"
            />
          </div>

          {result.validation_tactics.length > 0 ? (
            <div className="space-y-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
                Validation tactics
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {result.validation_tactics.map((t, i) => {
                  const body = [t.action ? `Action\n${t.action}` : '', t.metric ? `Metric\n${t.metric}` : '']
                    .filter(Boolean)
                    .join('\n\n')
                  const title = t.method.trim() || `tactic_${i + 1}`
                  if (!body && !t.method.trim()) return null
                  const cardBody = body || t.method
                  return (
                    <BpkDossierCard
                      key={`scout-tactic-${i}`}
                      title={title}
                      body={cardBody}
                      icon={Zap}
                      iconClass="text-emerald-400/85"
                    />
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <BpkDossierCard
              title="local_nuance"
              body={result.local_nuance}
              icon={Target}
              iconClass="text-orange-400/90"
            />
            <BpkDossierCard
              title="competitor_poaching"
              body={result.competitor_poaching}
              icon={MapPin}
              iconClass="text-rose-400/80"
            />
          </div>
        </section>
      ) : null}

      <aside className="rounded-lg border border-dashed border-zinc-800/80 bg-zinc-900/30 p-5 md:p-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          Operator note
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Street-level reads are directional, not permits or leases. Pair with
          zoning checks, insurance, and cash models before signing anything.
        </p>
      </aside>

      <section aria-label="Escalate" className="pb-4">
        <Link
          href="/local-market-scout"
          className={cn(
            'flex w-full items-center justify-center border-2 border-orange-500/40 bg-zinc-950 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-orange-100',
            'transition-all hover:border-orange-400/60 hover:shadow-[0_0_36px_-6px_rgba(249,115,22,0.35)] md:text-sm md:tracking-[0.22em]'
          )}
        >
          [ OPEN LOCAL MARKET SCOUT HUB ]
        </Link>
      </section>
    </div>
  )
}
