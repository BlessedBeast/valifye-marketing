'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, FlaskConical, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const PLATFORM_COMMISSION = 0.3
const CREDIT_CARD_FEE = 0.03
const PACKAGING_COST = 0.08
const SPOILAGE_BUFFER = 0.05

const DEDUCTIONS = [
  { label: 'Platform Commission', rate: PLATFORM_COMMISSION },
  { label: 'Credit Card Fee', rate: CREDIT_CARD_FEE },
  { label: 'Packaging Cost', rate: PACKAGING_COST },
  { label: 'Spoilage/Waste Buffer', rate: SPOILAGE_BUFFER }
] as const

function formatMoney(n: number) {
  return n.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

type DeliveryMarginCalculatorProps = {
  platformLabel?: string
  currencySymbol?: string
}

export function DeliveryMarginCalculator({
  platformLabel = 'Delivery Platforms',
  currencySymbol = '$'
}: DeliveryMarginCalculatorProps) {
  const [heroPrice, setHeroPrice] = useState(15)
  const [rawCost, setRawCost] = useState(4.5)

  const deductions = useMemo(() => {
    return DEDUCTIONS.map((d) => ({
      ...d,
      amount: heroPrice * d.rate
    }))
  }, [heroPrice])

  const totalDeductions = useMemo(
    () => deductions.reduce((acc, d) => acc + d.amount, 0),
    [deductions]
  )

  const netMarginDollars = heroPrice - rawCost - totalDeductions
  const netMarginPercent =
    heroPrice > 0 ? (netMarginDollars / heroPrice) * 100 : 0

  const marginVisual =
    netMarginPercent < 15
      ? 'danger'
      : netMarginPercent > 20
        ? 'success'
        : 'neutral'

  return (
    <Card
      className={cn(
        'overflow-hidden border-border bg-terminal-panel shadow-[0_0_0_1px_hsl(var(--terminal-glow)/0.12)]',
        'dark:shadow-[0_0_24px_-8px_hsl(var(--terminal-glow)/0.35)]'
      )}
    >
      <CardHeader className="border-b border-border/80 bg-background/40 dark:bg-slate-950/50">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-terminal-positive/30 bg-terminal-positive/10 p-2 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <FlaskConical
              className="size-5 text-terminal-positive dark:text-emerald-400"
              aria-hidden
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="font-mono text-base uppercase tracking-[0.2em] text-foreground">
              Delivery Margin — Forensic
            </CardTitle>
            <CardDescription className="font-mono text-xs tracking-wide text-muted-foreground">
              Live deduction trace · item-level net after{' '}
              <span className="font-semibold text-foreground">{platformLabel}</span>{' '}
              economics
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Inputs */}
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="hero-price"
                className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Hero Item Price
              </label>
              <Input
                id="hero-price"
                type="number"
                inputMode="decimal"
                min={1}
                step={0.5}
                value={heroPrice}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (Number.isNaN(v)) return
                  setHeroPrice(clamp(v, 1, 200))
                }}
                className="font-terminal-mono h-9 max-w-[7.5rem] border-border/80 bg-background text-right text-sm tabular-nums text-foreground dark:bg-slate-950/80"
              />
            </div>
            <Slider
              value={[heroPrice]}
              onValueChange={([v]) => setHeroPrice(v)}
              min={1}
              max={80}
              step={0.5}
              className="py-1"
              aria-label="Hero item price"
            />
            <p className="font-mono text-[10px] text-muted-foreground">
              Range $1–$80 · default $15.00
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="raw-cost"
                className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Raw Ingredient Cost
              </label>
              <Input
                id="raw-cost"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.25}
                value={rawCost}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (Number.isNaN(v)) return
                  setRawCost(clamp(v, 0, 100))
                }}
                className="font-terminal-mono h-9 max-w-[7.5rem] border-border/80 bg-background text-right text-sm tabular-nums text-foreground dark:bg-slate-950/80"
              />
            </div>
            <Slider
              value={[rawCost]}
              onValueChange={([v]) => setRawCost(v)}
              min={0}
              max={40}
              step={0.25}
              className="py-1"
              aria-label="Raw ingredient cost"
            />
            <p className="font-mono text-[10px] text-muted-foreground">
              Range $0–$40 · default $4.50
            </p>
          </div>
        </div>

        {/* Fixed deductions + COGS */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fixed deductions (% of item price)
            </p>
            <div className="rounded-lg border border-border/80 bg-background/60 dark:bg-slate-950/40">
              <ul className="divide-y divide-border/60">
                {deductions.map((d) => (
                  <li
                    key={d.label}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 font-mono text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <Minus
                        className="size-3.5 shrink-0 text-terminal-negative opacity-80 dark:text-red-400"
                        aria-hidden
                      />
                      <span className="truncate">{d.label}</span>
                      <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground/80 sm:inline">
                        ({Math.round(d.rate * 100)}%)
                      </span>
                    </span>
                    <span className="font-terminal-mono shrink-0 tabular-nums text-foreground">
                      −{currencySymbol}
                      {formatMoney(d.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              COGS (your input)
            </p>
            <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5 dark:bg-slate-900/40">
              <div className="flex items-center justify-between gap-3 font-mono text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Minus
                    className="size-3.5 shrink-0 text-terminal-negative opacity-80 dark:text-red-400"
                    aria-hidden
                  />
                  Raw ingredient cost
                </span>
                <span className="font-terminal-mono tabular-nums text-foreground">
                  −{currencySymbol}
                  {formatMoney(rawCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net margin output */}
        <div className="rounded-lg border border-dashed border-border px-4 py-4 dark:border-emerald-500/20">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Actual net margin
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p
              className={cn(
                'font-terminal-mono text-3xl font-bold tabular-nums tracking-tight',
                marginVisual === 'danger' && 'text-red-500',
                marginVisual === 'success' &&
                  'text-terminal-positive dark:text-emerald-400',
                marginVisual === 'neutral' && 'text-foreground'
              )}
            >
              <data value={netMarginDollars.toFixed(2)}>
                <strong>
                  {currencySymbol}
                  {formatMoney(netMarginDollars)}
                </strong>
              </data>
            </p>
            <p
              className={cn(
                'font-terminal-mono text-xl font-semibold tabular-nums',
                marginVisual === 'danger' && 'text-red-500',
                marginVisual === 'success' &&
                  'text-terminal-positive dark:text-emerald-400',
                marginVisual === 'neutral' && 'text-muted-foreground'
              )}
            >
              <data value={netMarginPercent.toFixed(1)}>
                {netMarginPercent.toFixed(1)}%
              </data>
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                of item price
              </span>
            </p>
            {marginVisual === 'danger' && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-red-500">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                Below 15% target
              </span>
            )}
          </div>
        </div>

        {/* Upsell */}
        <div className="rounded-xl border border-border bg-slate-950 p-5 text-slate-100 shadow-inner dark:border-slate-700 dark:bg-black/50 dark:ring-1 dark:ring-emerald-500/10">
          <p className="text-sm leading-relaxed text-slate-300 dark:text-slate-400">
            At this margin, surviving is a mathematical coin-toss. Are there
            enough customers in your zip code to hit breakeven?
          </p>
          <Button
            asChild
            className="mt-4 w-full border-2 border-emerald-500/40 bg-emerald-600 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)] hover:bg-emerald-500 sm:w-auto"
          >
            <Link href="/audit">Run Forensic Local Audit ($49)</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
