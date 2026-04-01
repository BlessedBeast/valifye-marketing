'use client'

import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, ShieldAlert, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type FranchiseBleedSimulatorProps = {
  currencySymbol?: string
}

const REV_MIN = 10_000
const REV_MAX = 250_000
const ROY_MIN = 0
const ROY_MAX = 15
const MARGIN_MIN = 5
const MARGIN_MAX = 25

function formatMoney(n: number, symbol: string) {
  return `${symbol}${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function FranchiseBleedSimulator({ currencySymbol = '$' }: FranchiseBleedSimulatorProps) {
  const [monthlyGross, setMonthlyGross] = useState(85_000)
  const [royaltyPct, setRoyaltyPct] = useState(8)
  const [netMarginPct, setNetMarginPct] = useState(12)
  const [hasInteracted, setHasInteracted] = useState(false)

  const markInteracted = useCallback(() => {
    setHasInteracted(true)
  }, [])

  const franchisorRealTake = useMemo(() => {
    if (netMarginPct <= 0) return 0
    return (royaltyPct / netMarginPct) * 100
  }, [royaltyPct, netMarginPct])

  const marginDollars = useMemo(
    () => (monthlyGross * netMarginPct) / 100,
    [monthlyGross, netMarginPct]
  )
  const royaltyDollars = useMemo(
    () => (monthlyGross * royaltyPct) / 100,
    [monthlyGross, royaltyPct]
  )
  const ownerAfterRoyalty = useMemo(() => marginDollars - royaltyDollars, [marginDollars, royaltyDollars])

  const rawFranchisorShare = useMemo(() => {
    if (marginDollars <= 0) return 100
    return (royaltyDollars / marginDollars) * 100
  }, [marginDollars, royaltyDollars])

  const franchisorShareOfMargin = useMemo(
    () => Math.min(100, rawFranchisorShare),
    [rawFranchisorShare]
  )

  const userShareOfMargin = useMemo(
    () => Math.max(0, 100 - franchisorShareOfMargin),
    [franchisorShareOfMargin]
  )

  const bleedSeverity = useMemo(() => {
    const t = franchisorRealTake
    if (t >= 75) return 'fatal' as const
    if (t > 50) return 'subsidized' as const
    return 'ok' as const
  }, [franchisorRealTake])

  const glowStyle = useMemo(() => {
    const t = Math.min(100, franchisorRealTake) / 100
    const opacity = 0.15 + t * 0.55
    const spread = 20 + t * 50
    return {
      boxShadow: `0 0 ${spread}px rgba(248, 113, 113, ${opacity.toFixed(2)})`,
    }
  }, [franchisorRealTake])

  return (
    <Card
      className="border-red-900/60 bg-zinc-950 text-zinc-100 transition-[box-shadow] duration-300"
      style={glowStyle}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-red-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/60 bg-red-900/40">
            <TrendingDown className="h-4 w-4 text-red-300" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold tracking-[0.2em] text-red-200">
              FORENSIC PROFIT CALCULATOR
            </CardTitle>
            <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-red-300/80">
              Royalty load vs. your net margin
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="space-y-5">
          <SliderField
            label="Monthly gross revenue"
            value={monthlyGross}
            min={REV_MIN}
            max={REV_MAX}
            step={1000}
            minLabel={`${currencySymbol}10k`}
            maxLabel={`${currencySymbol}250k`}
            formatDisplay={() => formatMoney(monthlyGross, currencySymbol)}
            onChange={(v) => {
              markInteracted()
              setMonthlyGross(v)
            }}
            accentClass="text-emerald-400/90"
          />
          <SliderField
            label="Total royalty + ad fees"
            value={royaltyPct}
            min={ROY_MIN}
            max={ROY_MAX}
            step={0.5}
            minLabel="0%"
            maxLabel="15%"
            formatDisplay={() => `${royaltyPct.toFixed(royaltyPct % 1 === 0 ? 0 : 1)}%`}
            onChange={(v) => {
              markInteracted()
              setRoyaltyPct(v)
            }}
            accentClass="text-red-400"
          />
          <SliderField
            label="Est. net margin (before royalties)"
            value={netMarginPct}
            min={MARGIN_MIN}
            max={MARGIN_MAX}
            step={0.5}
            minLabel="5%"
            maxLabel="25%"
            formatDisplay={() => `${netMarginPct.toFixed(netMarginPct % 1 === 0 ? 0 : 1)}%`}
            onChange={(v) => {
              markInteracted()
              setNetMarginPct(v)
            }}
            accentClass="text-amber-300/90"
          />
        </div>

        <div
          className={cn(
            'rounded-xl border px-4 py-4 transition-colors duration-300',
            bleedSeverity === 'fatal' && 'border-red-500/80 bg-red-950/50',
            bleedSeverity === 'subsidized' && 'border-red-700/70 bg-red-950/35',
            bleedSeverity === 'ok' && 'border-red-900/50 bg-zinc-900/60'
          )}
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-red-300/90">
            Franchisor&apos;s share of your margin dollars
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-red-100 sm:text-3xl">
            The Franchisor&apos;s Real Take:{' '}
            <data value={franchisorRealTake.toFixed(1)}>
              <strong
                className={cn(
                  'font-mono tabular-nums',
                  franchisorRealTake > 50 && 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.85)]',
                  franchisorRealTake <= 50 && 'text-zinc-100'
                )}
              >
                {franchisorRealTake.toFixed(1)}%
              </strong>
            </data>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            (Royalty % ÷ Net margin %) × 100 — e.g. 8% royalty on a 10% margin →{' '}
            <span className="font-mono text-zinc-300">80%</span> of your pre-royalty profit accrues to the franchisor.
          </p>
        </div>

        {bleedSeverity === 'subsidized' && (
          <div className="flex gap-2 rounded-lg border border-red-600/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p>
              <span className="font-mono font-semibold uppercase tracking-wide text-red-300">
                STATUS: SUBSIDIZED LABOR.{' '}
              </span>
              You are working primarily for the franchisor.
            </p>
          </div>
        )}
        {bleedSeverity === 'fatal' && (
          <div className="flex gap-2 rounded-lg border border-red-500 bg-red-950/60 px-3 py-2 text-xs text-red-100">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p>
              <span className="font-mono font-semibold uppercase tracking-wide text-red-200">
                STATUS: FATAL BLEED.{' '}
              </span>
              Your business exists to pay their royalties.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Profit split (of pre-royalty margin)
          </p>
          <div className="flex h-10 w-full overflow-hidden rounded-md border border-red-900/50 bg-zinc-900">
            <div
              className="flex items-center justify-center bg-emerald-600/80 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-50 shadow-inner"
              style={{ width: `${userShareOfMargin}%` }}
              title="You"
            >
              {userShareOfMargin > 12 && <span>You</span>}
            </div>
            <div
              className={cn(
                'flex items-center justify-center font-mono text-[10px] font-semibold uppercase tracking-wider text-red-50',
                franchisorRealTake > 50
                  ? 'bg-red-600 shadow-[inset_0_0_24px_rgba(248,113,113,0.45)]'
                  : 'bg-red-700/80'
              )}
              style={{ width: `${franchisorShareOfMargin}%` }}
              title="Franchisor"
            >
              {franchisorShareOfMargin > 12 && <span>Franchisor</span>}
            </div>
          </div>
          <div className="flex justify-between font-mono text-[11px] text-zinc-400">
            <span>
              Your margin after royalty:{' '}
              <data value={Math.round(ownerAfterRoyalty)}>
                <strong className="text-emerald-300">{formatMoney(Math.max(0, ownerAfterRoyalty), currencySymbol)}</strong>
              </data>
              /mo
            </span>
            <span>
              Royalty + ad:{' '}
              <data value={Math.round(royaltyDollars)}>
                <strong className="text-red-400">{formatMoney(royaltyDollars, currencySymbol)}</strong>
              </data>
              /mo
            </span>
          </div>
        </div>

        {royaltyPct > netMarginPct && (
          <p className="rounded border border-red-500/60 bg-red-950/50 px-3 py-2 text-xs text-red-200">
            Royalty exceeds stated net margin — model is underwater before ops noise.
          </p>
        )}

        {hasInteracted && (
          <Button
            asChild
            className="w-full border border-red-500/60 bg-red-500 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-950 hover:bg-red-400"
          >
            <Link href="/audit">Run Full Franchise Audit</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

type SliderFieldProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  minLabel: string
  maxLabel: string
  formatDisplay: () => string
  onChange: (v: number) => void
  accentClass?: string
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  formatDisplay,
  onChange,
  accentClass,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <span className={cn('font-mono text-sm tabular-nums', accentClass)}>{formatDisplay()}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? min)}
        className="[&_.bg-primary]:bg-red-500"
      />
      <div className="flex justify-between font-mono text-[10px] text-zinc-600">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}
