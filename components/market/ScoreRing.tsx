'use client'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

const DEFAULT_COLOR = 'hsl(var(--primary))'

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  color = DEFAULT_COLOR,
  label,
  sublabel
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc — stroke-dashoffset for animation */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold leading-none text-foreground">
            {score}
          </span>
          {sublabel && (
            <span className="text-xs text-muted-foreground mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{label}</p>
        </div>
      )}
    </div>
  )
}
