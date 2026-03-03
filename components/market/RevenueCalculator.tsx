'use client'

import { useState } from 'react'
import { Calculator, DollarSign, TrendingUp, Clock } from 'lucide-react'
import type { Idea } from '@/lib/ideaData'

interface RevenueCalculatorProps {
  idea: Pick<
    Idea,
    | 'niche'
    | 'city'
    | 'avg_revenue_per_unit'
    | 'startup_cost_range'
    | 'breakeven_months'
    | 'revenue_potential'
  >
}

export function RevenueCalculator({ idea }: RevenueCalculatorProps) {
  const [customers, setCustomers] = useState(100)

  const scenarios = [
    {
      label: 'Conservative',
      customers: Math.round(customers * 0.5),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/5 border-yellow-500/20'
    },
    {
      label: 'Moderate',
      customers,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/5 border-emerald-500/20'
    },
    {
      label: 'Optimistic',
      customers: Math.round(customers * 2),
      color: 'text-green-400',
      bg: 'bg-green-500/5 border-green-500/20'
    }
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
          <Calculator size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Revenue Potential Calculator
          </p>
          <p className="text-xs text-muted-foreground">
            Estimate your {idea.niche} revenue in {idea.city}
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Monthly Customers
            </label>
            <span className="text-lg font-bold text-primary">
              {customers}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={customers}
            onChange={(e) => setCustomers(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[hsl(var(--primary))] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>500</span>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="grid grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <div
              key={s.label}
              className={`space-y-1 rounded-xl border p-4 text-center ${s.bg}`}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {s.label}
              </p>
              <p className={`text-lg font-bold ${s.color}`}>
                $
                {(
                  s.customers * idea.avg_revenue_per_unit
                ).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
          ))}
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-2">
          {[
            {
              icon: DollarSign,
              value: `$${idea.startup_cost_range.low.toLocaleString()}–$${idea.startup_cost_range.high.toLocaleString()}`,
              label: 'Startup cost'
            },
            {
              icon: TrendingUp,
              value: `$${idea.avg_revenue_per_unit}`,
              label: 'Avg per unit'
            },
            {
              icon: Clock,
              value: `~${idea.breakeven_months} months`,
              label: 'Breakeven'
            }
          ].map((m, i) => (
            <div
              key={i}
              className="space-y-1 text-center"
            >
              <m.icon
                size={16}
                className="mx-auto text-muted-foreground"
              />
              <p className="text-sm font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

