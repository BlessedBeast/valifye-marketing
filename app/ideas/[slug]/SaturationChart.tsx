'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface Props {
  score: number
  niche: string
  city: string
}

const bands = [
  { name: 'Low', range: '0-30', min: 0, max: 30 },
  { name: 'Moderate', range: '30-50', min: 30, max: 50 },
  { name: 'High', range: '50-70', min: 50, max: 70 },
  { name: 'Saturated', range: '70-100', min: 70, max: 100 }
]

const getColor = (bandName: string, activeBandName: string) => {
  if (bandName !== activeBandName) return 'hsl(var(--muted-foreground))'
  return 'hsl(var(--primary))'
}

export default function SaturationChart({ score, niche, city }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const activeBand = bands.find(
    (b) => clampedScore >= b.min && clampedScore < b.max
  ) || bands[bands.length - 1]

  const data = bands.map((band) => ({
    name: band.name,
    value: 25,
    active: band.name === activeBand.name
  }))

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Low competition</span>
        <span className="text-sm font-semibold text-primary">
          {activeBand.name} — {clampedScore}/100
        </span>
        <span className="text-sm text-muted-foreground">Highly saturated</span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} barCategoryGap="8%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const band = payload[0].payload as (typeof data)[number]
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                  <p className="font-medium text-foreground">
                    {band.name} competition
                  </p>
                  <p className="text-muted-foreground">
                    {niche} in {city} is in this band
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={getColor(entry.name, activeBand.name)}
                opacity={entry.active ? 1 : 0.25}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Highlighted band shows how crowded the {city} {niche} market is
      </p>
    </div>
  )
}

