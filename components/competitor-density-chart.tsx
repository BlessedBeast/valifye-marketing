'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

type CompetitorDensityChartProps = {
  saturationScore: number | null | undefined
}

type BandKey = 'low' | 'medium' | 'high' | 'very-high'

const getBandForScore = (score: number): BandKey => {
  if (score < 25) return 'low'
  if (score < 50) return 'medium'
  if (score < 75) return 'high'
  return 'very-high'
}

export function CompetitorDensityChart({
  saturationScore
}: CompetitorDensityChartProps) {
  const safeScore =
    typeof saturationScore === 'number' && !Number.isNaN(saturationScore)
      ? Math.min(Math.max(saturationScore, 0), 100)
      : 0

  const activeBand = getBandForScore(safeScore)

  const data = [
    { name: 'Low', band: 'low' as BandKey, value: 1 },
    { name: 'Medium', band: 'medium' as BandKey, value: 1 },
    { name: 'High', band: 'high' as BandKey, value: 1 },
    { name: 'Very High', band: 'very-high' as BandKey, value: 1 }
  ]

  const activeColor = 'hsl(var(--primary))'
  const inactiveColor = 'hsl(var(--muted-foreground))'

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Competitor density
          </h3>
          <p className="text-xs text-muted-foreground/80">
            Visualized by saturation band for this market
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {safeScore}% saturation
        </span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide domain={[0, 1.2]} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                fontSize: 12
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.band}
                  fill={
                    entry.band === activeBand
                      ? activeColor
                      : inactiveColor
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Highlighted band shows how crowded this local market is relative to
        others.
      </p>
    </div>
  )
}