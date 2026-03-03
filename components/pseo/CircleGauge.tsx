'use client'

interface CircleGaugeProps {
  value: number
  max?: number
  label: string
  sublabel: string
  color: string // tailwind color class e.g. 'text-green-400'
  strokeColor: string // hex or hsl e.g. '#22c55e'
  size?: number
}

export function CircleGauge({
  value,
  max = 100,
  label,
  sublabel,
  color,
  strokeColor,
  size = 120
}: CircleGaugeProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = (value / max) * circumference
  const gap = circumference - progress

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.8s ease-in-out' }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold leading-none text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className={`text-xs font-semibold ${color}`}>{sublabel}</p>
      </div>
    </div>
  )
}

