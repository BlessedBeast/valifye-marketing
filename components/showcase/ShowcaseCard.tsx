import Link from 'next/link'
import {
  ArrowRight,
  Crosshair,
  MapPin,
  Rocket,
  Scale,
  ShieldAlert,
  Skull,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type MarketingShowcaseReport,
  type ShowcaseTemplate
} from '@/lib/marketingShowcase'
import { extractPayload } from '@/components/showcase/templates/shared'

export type ShowcaseCardProps = {
  report: MarketingShowcaseReport
  className?: string
}

type ThemeKey = 'cyan' | 'amber' | 'emerald' | 'rose'

type Theme = {
  badgeBorder: string
  badgeBg: string
  badgeText: string
  ringStroke: string
  ringText: string
  glowFilter: string
  ctaText: string
  ctaHover: string
}

const THEMES: Record<ThemeKey, Theme> = {
  cyan: {
    badgeBorder: 'border-cyan-400/40',
    badgeBg: 'bg-cyan-500/[0.08]',
    badgeText: 'text-cyan-200',
    ringStroke: 'stroke-cyan-400',
    ringText: 'text-cyan-200',
    glowFilter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))',
    ctaText: 'text-cyan-300',
    ctaHover: 'group-hover:text-cyan-100'
  },
  amber: {
    badgeBorder: 'border-amber-400/40',
    badgeBg: 'bg-amber-500/[0.08]',
    badgeText: 'text-amber-200',
    ringStroke: 'stroke-amber-400',
    ringText: 'text-amber-200',
    glowFilter: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))',
    ctaText: 'text-amber-300',
    ctaHover: 'group-hover:text-amber-100'
  },
  emerald: {
    badgeBorder: 'border-emerald-400/40',
    badgeBg: 'bg-emerald-500/[0.08]',
    badgeText: 'text-emerald-200',
    ringStroke: 'stroke-emerald-400',
    ringText: 'text-emerald-200',
    glowFilter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))',
    ctaText: 'text-emerald-300',
    ctaHover: 'group-hover:text-emerald-100'
  },
  rose: {
    badgeBorder: 'border-rose-400/40',
    badgeBg: 'bg-rose-500/[0.08]',
    badgeText: 'text-rose-200',
    ringStroke: 'stroke-rose-400',
    ringText: 'text-rose-200',
    glowFilter: 'drop-shadow(0 0 6px rgba(244,63,94,0.6))',
    ctaText: 'text-rose-300',
    ctaHover: 'group-hover:text-rose-100'
  }
}

type TemplateMeta = {
  label: string
  Icon: LucideIcon
  theme: ThemeKey
}

const TEMPLATE_META: Record<ShowcaseTemplate, TemplateMeta> = {
  scout: { label: 'Local Market Scout', Icon: MapPin, theme: 'amber' },
  scout_pivot: { label: 'Local Recovery', Icon: Skull, theme: 'amber' },
  battlefield: { label: 'Digital Battlefield', Icon: Crosshair, theme: 'cyan' },
  pivot: { label: 'Pivot Playbook', Icon: Scale, theme: 'cyan' },
  arsenal: { label: 'Execution Arsenal', Icon: Rocket, theme: 'emerald' },
  risk: { label: 'Risk Register', Icon: ShieldAlert, theme: 'rose' }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickString(
  payload: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  for (const moduleKey of Object.keys(payload)) {
    const candidate = payload[moduleKey]
    if (!isRecord(candidate)) continue
    for (const key of keys) {
      const value = candidate[key]
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim()
      }
    }
  }
  return null
}

function pickNumber(
  payload: Record<string, unknown>,
  keys: string[]
): number | null {
  const tryValue = (raw: unknown): number | null => {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const parsed = Number(raw)
      if (Number.isFinite(parsed)) return parsed
    }
    return null
  }
  for (const key of keys) {
    const v = tryValue(payload[key])
    if (v !== null) return v
  }
  for (const moduleKey of Object.keys(payload)) {
    const candidate = payload[moduleKey]
    if (!isRecord(candidate)) continue
    for (const key of keys) {
      const v = tryValue(candidate[key])
      if (v !== null) return v
    }
  }
  return null
}

export function ShowcaseCard({ report, className }: ShowcaseCardProps) {
  const meta = TEMPLATE_META[report.template]
  const theme = THEMES[meta.theme]
  const Icon = meta.Icon

  const payload = extractPayload(report)

  const feasibilityScore =
    pickNumber(payload, [
      'feasibility_score',
      'whitespace_score',
      'score',
      'overall_score'
    ]) ??
    (typeof report.score === 'number' && Number.isFinite(report.score)
      ? report.score
      : null)

  const verdictSnippet =
    pickString(payload, [
      'one_line_verdict',
      'market_verdict',
      'verdict',
      'forensic_verdict'
    ]) ?? report.forensicVerdict

  const metadataLabel = pickString(payload, [
    'location_target',
    'product_name',
    'business_name',
    'target_market',
    'target_buyer'
  ])

  const ariaLabel = `Open the ${meta.label} forensic audit: ${report.title}`

  return (
    <Link
      href={`/showcase/${report.slug}`}
      aria-label={ariaLabel}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-slate-900/40 p-6 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-zinc-700',
        className
      )}
    >
      <span
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-current opacity-[0.04] blur-3xl"
        aria-hidden
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span
            className={cn(
              'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]',
              theme.badgeBorder,
              theme.badgeBg,
              theme.badgeText
            )}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
          {metadataLabel && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {metadataLabel}
            </span>
          )}
        </div>

        {feasibilityScore !== null && (
          <ScoreRing score={feasibilityScore} theme={theme} />
        )}
      </header>

      <div className="relative mt-5 flex flex-1 flex-col">
        <h3 className="font-serif text-xl font-bold leading-snug tracking-tight text-zinc-50 transition-colors group-hover:text-white">
          {report.title}
        </h3>
        {verdictSnippet && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
            {verdictSnippet}
          </p>
        )}
      </div>

      <footer
        className={cn(
          'relative mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em]',
          theme.ctaText
        )}
      >
        {report.updatedAt ? (
          <span className="text-zinc-500">
            Updated {formatRelative(report.updatedAt)}
          </span>
        ) : (
          <span className="text-zinc-500">Forensic audit</span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 transition-colors',
            theme.ctaText,
            theme.ctaHover
          )}
        >
          Open Forensic Audit
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </Link>
  )
}

function ScoreRing({ score, theme }: { score: number; theme: Theme }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const display = Math.round(clamped)

  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
      aria-hidden
    >
      <svg
        viewBox="0 0 56 56"
        className="h-14 w-14 -rotate-90"
        style={{ filter: theme.glowFilter }}
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          className="fill-none stroke-zinc-800"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className={cn('fill-none transition-all', theme.ringStroke)}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center leading-none',
          theme.ringText
        )}
      >
        <span className="font-serif text-base font-black tabular-nums">
          {display}
        </span>
        <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Pulse
        </span>
      </span>
    </div>
  )
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mo ago`
  return `${Math.floor(diffDays / 365)} yr ago`
}
