interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  color: string
  textColor: string
  label: string
  sublabel: string
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  color,
  textColor,
  label,
  sublabel
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const gap = circumference - filled

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG ring */}
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
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${gap}`}
          />
        </svg>
        {/* Center text — counter-rotated */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold leading-none text-foreground">
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      {/* Labels */}
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className={`text-xs font-semibold ${textColor}`}>{sublabel}</p>
      </div>
    </div>
  )
}

