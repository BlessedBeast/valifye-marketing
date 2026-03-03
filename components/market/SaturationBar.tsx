interface SaturationBarProps {
  score: number
  niche: string
  city: string
}

export function SaturationBar({ score, niche, city }: SaturationBarProps) {
  const bands = [
    { name: 'Low', max: 30, color: 'bg-green-500' },
    { name: 'Moderate', max: 50, color: 'bg-yellow-500' },
    { name: 'High', max: 70, color: 'bg-orange-500' },
    { name: 'Saturated', max: 100, color: 'bg-red-500' }
  ]
  const active = bands.find((b) => score <= b.max) || bands[3]

  return (
    <div className="space-y-3">
      {/* Top labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Low competition</span>
        <span className="font-semibold text-foreground">
          {active.name} — {score}/100
        </span>
        <span>Highly saturated</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${active.color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Band labels row */}
      <div className="flex justify-between">
        {bands.map((band) => {
          const prevMax = bands[bands.indexOf(band) - 1]?.max || 0
          const isActive = score <= band.max && score > prevMax
          return (
            <span
              key={band.name}
              className={`text-xs ${
                isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {band.name}
            </span>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Highlighted band shows how crowded the {city} {niche} market is
      </p>
    </div>
  )
}

