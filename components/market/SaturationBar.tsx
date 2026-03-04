'use client'

interface SaturationBarProps {
  score: number
  niche?: string
  city?: string
}

const BANDS = [
  { name: 'Low', max: 25, color: 'bg-green-500' },
  { name: 'Moderate', max: 50, color: 'bg-yellow-500' },
  { name: 'High', max: 75, color: 'bg-orange-500' },
  { name: 'Saturated', max: 100, color: 'bg-red-500' }
] as const

export function SaturationBar({ score, niche, city }: SaturationBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const activeBand = BANDS.find((b) => clampedScore <= b.max) ?? BANDS[3]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Low competition</span>
        <span className="font-semibold text-foreground">
          {activeBand.name} — {clampedScore}/100
        </span>
        <span>Highly saturated</span>
      </div>

      {/* 4-color band track */}
      <div
        className="h-3 overflow-hidden rounded-full"
        style={{
          background: 'hsl(var(--muted))'
        }}
      >
        {/* Fill with 4-color gradient (Green → Yellow → Orange → Red) */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedScore}%`,
            background: `linear-gradient(to right, #22c55e 0%, #22c55e 25%, #eab308 25%, #eab308 50%, #f97316 50%, #f97316 75%, #ef4444 75%, #ef4444 100%)`
          }}
        />
      </div>

      {/* Band labels */}
      <div className="flex justify-between text-xs">
        {BANDS.map((band) => (
          <span
            key={band.name}
            className={
              band.name === activeBand.name
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            }
          >
            {band.name}
          </span>
        ))}
      </div>

      {niche && city && (
        <p className="text-xs text-muted-foreground">
          Highlighted band shows how crowded the {city} {niche} market is
        </p>
      )}
    </div>
  )
}
