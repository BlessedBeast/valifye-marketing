'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Gauge } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UKVATCliffScannerProps = {
  isEU?: boolean
  currencySymbol?: string
}

const MAX_REVENUE = 150_000
const UK_THRESHOLD = 90_000
const EU_THRESHOLD = 85_000
const VAT_RATE = 0.2

function formatCurrency(value: number, symbol: string) {
  return `${symbol}${value.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

export function UKVATCliffScanner({
  isEU = false,
  currencySymbol: overrideSymbol
}: UKVATCliffScannerProps) {
  const [revenue, setRevenue] = useState(85_000)
  const [marginPct, setMarginPct] = useState(20)

  const threshold = isEU ? EU_THRESHOLD : UK_THRESHOLD
  const currencySymbol = overrideSymbol ?? (isEU ? '€' : '£')

  const margin = marginPct / 100
  const inVATZone = revenue > threshold
  const baseProfit = revenue * margin
  const vatCharge = inVATZone ? revenue * VAT_RATE : 0
  const profitAtRevenue = baseProfit - vatCharge
  const effectiveMarginAfterVAT = revenue > 0 ? (profitAtRevenue / revenue) * 100 : 0

  const base85 = 85_000 * margin
  const vat85 = 85_000 > threshold ? 85_000 * VAT_RATE : 0
  const profitAt85 = base85 - vat85

  const base95 = 95_000 * margin
  const vat95 = 95_000 > threshold ? 95_000 * VAT_RATE : 0
  const profitAt95 = base95 - vat95

  const deathZone = profitAt95 < profitAt85 && revenue >= threshold

  const cliffPosition =
    Math.max(0, Math.min(1, threshold / MAX_REVENUE)) * 100

  const revenuePosition =
    Math.max(0, Math.min(1, revenue / MAX_REVENUE)) * 100

  const dangerLevel =
    !inVATZone ? 'safe' : deathZone ? 'critical' : 'warning'

  return (
    <Card className="overflow-hidden border border-amber-800/60 bg-slate-950 text-slate-50 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
      <CardHeader className="border-b border-slate-800/80 bg-slate-950/70">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-2">
            <Gauge className="h-5 w-5 text-amber-400" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle className="font-mono text-sm uppercase tracking-[0.28em] text-slate-50">
              {isEU ? 'EU VAT Cliff Scanner' : 'UK VAT Cliff Scanner'}
            </CardTitle>
            <CardDescription className="font-mono text-[11px] tracking-[0.18em] text-amber-200/90">
              Detect the profitability drop as you cross the{' '}
              {currencySymbol}
              {threshold.toLocaleString('en-GB')} VAT threshold.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="uk-vat-revenue"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300"
              >
                Projected annual revenue
              </label>
              <Input
                id="uk-vat-revenue"
                type="number"
                inputMode="decimal"
                min={0}
                max={MAX_REVENUE}
                step={1_000}
                value={revenue}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isNaN(v)) return
                  setRevenue(Math.max(0, Math.min(MAX_REVENUE, v)))
                }}
                className="font-terminal-mono h-9 max-w-[9rem] border-slate-700 bg-slate-950 text-right text-sm tabular-nums text-slate-50"
              />
            </div>
            <Slider
              value={[revenue]}
              onValueChange={([v]) => setRevenue(v)}
              min={0}
              max={MAX_REVENUE}
              step={1_000}
              className="py-1"
              aria-label="Projected annual revenue"
            />
            <p className="font-mono text-[10px] text-slate-400">
              0 – {formatCurrency(MAX_REVENUE, currencySymbol)} · VAT cliff at{' '}
              {formatCurrency(threshold, currencySymbol)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="uk-vat-margin"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300"
              >
                Current net profit margin
              </label>
              <div className="flex items-center gap-1">
                <Input
                  id="uk-vat-margin"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={80}
                  step={1}
                  value={marginPct}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isNaN(v)) return
                    setMarginPct(Math.max(1, Math.min(80, v)))
                  }}
                  className="font-terminal-mono h-9 w-20 border-slate-700 bg-slate-950 text-right text-sm tabular-nums text-slate-50"
                />
                <span className="font-mono text-xs text-slate-400">%</span>
              </div>
            </div>
            <Slider
              value={[marginPct]}
              onValueChange={([v]) => setMarginPct(v)}
              min={5}
              max={60}
              step={1}
              className="py-1"
              aria-label="Net profit margin"
            />
            <p className="font-mono text-[10px] text-slate-400">
              Default 20% · real-world margins are often lower.
            </p>
          </div>
        </div>

        {/* Danger gauge */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
            Profit cliff gauge
          </p>
          <div className="relative h-16 overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-r from-emerald-900/40 via-amber-900/40 to-red-900/50">
            {/* Threshold marker */}
            <div
              className="absolute inset-y-0 w-px bg-amber-300/80"
              style={{ left: `${cliffPosition}%` }}
            />
            <span
              className="absolute top-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.22em] text-amber-200"
              style={{ left: `${cliffPosition}%` }}
            >
              VAT threshold
            </span>

            {/* Revenue marker */}
            <div
              className={cn(
                'absolute bottom-2 flex -translate-x-1/2 flex-col items-center gap-1',
                dangerLevel === 'safe' && 'text-emerald-300',
                dangerLevel === 'warning' && 'text-amber-200',
                dangerLevel === 'critical' && 'text-red-300'
              )}
              style={{ left: `${revenuePosition}%` }}
            >
              <div className="h-4 w-px bg-current" />
              <div className="rounded-full border border-current bg-slate-950/90 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.22em]">
                {formatCurrency(revenue, currencySymbol)}
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Profit at current revenue
              </p>
              <p className="font-terminal-mono mt-1 text-sm tabular-nums">
                <data value={Math.max(0, Math.round(profitAtRevenue))}>
                  <strong>
                    {formatCurrency(Math.max(0, Math.round(profitAtRevenue)), currencySymbol)}
                  </strong>
                </data>
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Effective margin {effectiveMarginAfterVAT.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Take-home at 85k vs 95k
              </p>
              <p className="font-terminal-mono mt-1 text-sm tabular-nums">
                <data value={Math.round(profitAt85)}>
                  {formatCurrency(Math.round(profitAt85), currencySymbol)}
                </data>{' '}
                →{' '}
                <data value={Math.round(profitAt95)}>
                  {formatCurrency(Math.round(profitAt95), currencySymbol)}
                </data>
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Includes {Math.round(VAT_RATE * 100)}% VAT hit once over threshold.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Zone assessment
              </p>
              <p
                className={cn(
                  'mt-1 font-mono text-xs',
                  dangerLevel === 'safe' && 'text-emerald-300',
                  dangerLevel === 'warning' && 'text-amber-200',
                  dangerLevel === 'critical' && 'text-red-300'
                )}
              >
                {!inVATZone && 'Below VAT threshold · safe zone.'}
                {inVATZone && !deathZone && 'Above threshold · margin compressed, but still ahead.'}
                {deathZone &&
                  'Death zone: 95k profit is lower than 85k. Growth without pricing strategy destroys take-home.'}
              </p>
            </div>
          </div>
        </div>

        {/* Warning copy */}
        {inVATZone && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-700/70 bg-amber-900/30 px-4 py-3 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" aria-hidden />
            <p>
              You are entering the{' '}
              <span className="font-semibold">“Unprofitability Valley”.</span>{' '}
              You must increase prices by{' '}
              <span className="font-semibold">{Math.round(VAT_RATE * 100)}%</span> just to maintain your
              current lifestyle once VAT applies.
            </p>
          </div>
        )}

        {/* Upsell */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm leading-relaxed text-slate-200">
            The UK/EU tax system punishes growth without strategy. Run a 10-page Forensic Audit to build
            a “VAT-proof” pricing model.
          </p>
          <Button
            asChild
            className="mt-4 w-full border border-amber-500/60 bg-amber-500 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-950 hover:bg-amber-400 sm:w-auto"
          >
            <Link href="/audit">Get UK/EU Audit - $49</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

