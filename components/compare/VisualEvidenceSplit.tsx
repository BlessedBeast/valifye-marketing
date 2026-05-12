import {
  AlertOctagon,
  Bot,
  Lock,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type VisualEvidenceSplitProps = {
  /** Competitor brand name. Used in alt text and the browser-chrome URL. */
  competitorName: string
  /** When both screenshot URLs are provided, the "Real Evidence" layout renders. */
  competitorScreenshot?: string
  valifyeScreenshot?: string
  className?: string
}

type InvestigationTagAnchor =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

type InvestigationTagConfig = {
  label: string
  anchor: InvestigationTagAnchor
  tone: 'incumbent' | 'valifye'
}

const COMPETITOR_TAGS: InvestigationTagConfig[] = [
  { label: 'Vague / Hallucinated Data', anchor: 'top-left', tone: 'incumbent' },
  { label: 'No Sources Cited', anchor: 'bottom-right', tone: 'incumbent' }
]

const VALIFYE_TAGS: InvestigationTagConfig[] = [
  { label: 'Live County Backlog Signal', anchor: 'top-right', tone: 'valifye' },
  {
    label: 'Cited Source: County Permits',
    anchor: 'bottom-left',
    tone: 'valifye'
  }
]

/**
 * Side-by-side "Show, don't tell" comparison block.
 *
 * Two render modes:
 * 1. **Real screenshots** — each side uses its URL when present; missing side
 *    falls back to the CSS mock panel for that column only.
 * 2. **CSS Mock** — when a URL is absent for that column, the original mock UI
 *    renders for that side only.
 *
 * Pure server component. No interactivity, no client JS.
 */
export function VisualEvidenceSplit({
  competitorName,
  competitorScreenshot,
  valifyeScreenshot,
  className
}: VisualEvidenceSplitProps) {
  const competitorSrc = competitorScreenshot?.trim() ?? ''
  const valifyeSrc = valifyeScreenshot?.trim() ?? ''
  const showCompetitorShot = competitorSrc.length > 0
  const showValifyeShot = valifyeSrc.length > 0

  return (
    <section
      aria-label="Visual evidence: incumbent intelligence versus Valifye forensic audit"
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}
    >
      {showCompetitorShot ? (
        <IncumbentScreenshotPanel
          competitorName={competitorName}
          src={competitorSrc}
        />
      ) : (
        <IncumbentMockPanel />
      )}
      {showValifyeShot ? (
        <ValifyeScreenshotPanel
          competitorName={competitorName}
          src={valifyeSrc}
        />
      ) : (
        <ValifyeMockPanel />
      )}
    </section>
  )
}

/* ────────────  Real Evidence — Incumbent (manual screenshot)  ──────────── */

function IncumbentScreenshotPanel({
  competitorName,
  src
}: {
  competitorName: string
  src: string
}) {
  const safeHostLabel = competitorName.toLowerCase().replace(/\s+/g, '') || 'incumbent'

  return (
    <article
      aria-label={`Generic incumbent output from ${competitorName}`}
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30"
    >
      <BrowserChrome host={`${safeHostLabel}.app`} tone="incumbent" />

      <div className="group relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${competitorName} dashboard showing generic, low-resolution intelligence output`}
          loading="lazy"
          className={cn(
            'block h-auto w-full object-cover transition-[filter] duration-500',
            '[filter:grayscale(100%)_opacity(0.4)_contrast(0.8)]',
            'group-hover:[filter:none]'
          )}
        />

        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-0"
          aria-hidden
        />

        {COMPETITOR_TAGS.map((tag) => (
          <InvestigationTag key={tag.label} {...tag} />
        ))}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/60 px-4 py-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-400">
          <AlertOctagon className="h-3 w-3" />
          Identified: Generic Output
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
          <Bot className="h-3.5 w-3.5" />
          {competitorName}
        </span>
      </footer>
    </article>
  )
}

/* ────────────  Real Evidence — Valifye (manual screenshot)  ──────────── */

function ValifyeScreenshotPanel({
  competitorName,
  src
}: {
  competitorName: string
  src: string
}) {
  return (
    <article
      aria-label="Valifye forensic audit output"
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-900',
        'border border-[rgba(16,185,129,0.5)]',
        'shadow-[0_0_40px_-15px_rgba(16,185,129,0.55)]',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-xl',
        'before:shadow-[0_0_48px_rgba(16,185,129,0.35)]'
      )}
    >
      <BrowserChrome host="valifye.com/audit" tone="valifye" />

      <div className="group relative overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Valifye forensic audit dashboard for ${competitorName} comparison, showing live data signals and cited sources`}
          loading="lazy"
          className="block h-auto w-full object-cover object-top"
        />

        {VALIFYE_TAGS.map((tag) => (
          <InvestigationTag key={tag.label} {...tag} />
        ))}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-emerald-500/20 bg-slate-950/70 px-4 py-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">
          <ShieldAlert className="h-3 w-3" />
          Verified: Forensic Data
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/80">
          <Lock className="h-3.5 w-3.5" />
          audit lock 0x7F
        </span>
      </footer>
    </article>
  )
}

/* ────────────  Browser-style frame chrome  ──────────── */

function BrowserChrome({
  host,
  tone
}: {
  host: string
  tone: 'incumbent' | 'valifye'
}) {
  const isValifye = tone === 'valifye'
  return (
    <header
      className={cn(
        'flex items-center gap-3 border-b px-4 py-2.5',
        isValifye
          ? 'border-emerald-500/20 bg-slate-950/80'
          : 'border-zinc-800 bg-zinc-950/70'
      )}
    >
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
      </span>
      <span
        className={cn(
          'flex flex-1 items-center gap-2 rounded-md px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]',
          isValifye
            ? 'bg-slate-900/80 text-emerald-300/90'
            : 'bg-zinc-900/80 text-zinc-500'
        )}
      >
        <Lock className="h-3 w-3" />
        {host}
      </span>
    </header>
  )
}

/* ────────────  Investigation Tag (pulsing dot → label on hover)  ──────────── */

function anchorClassName(anchor: InvestigationTagAnchor): string {
  switch (anchor) {
    case 'top-left':
      return 'top-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'bottom-right':
    default:
      return 'bottom-4 right-4'
  }
}

function labelOffsetClassName(anchor: InvestigationTagAnchor): string {
  // The label sits next to the dot so it never falls outside the frame edge.
  switch (anchor) {
    case 'top-left':
    case 'bottom-left':
      return 'left-6 top-1/2 -translate-y-1/2'
    case 'top-right':
    case 'bottom-right':
    default:
      return 'right-6 top-1/2 -translate-y-1/2'
  }
}

function InvestigationTag({
  label,
  anchor,
  tone
}: InvestigationTagConfig) {
  const isValifye = tone === 'valifye'

  return (
    <div
      className={cn(
        'group/tag absolute z-10',
        anchorClassName(anchor)
      )}
    >
      <button
        type="button"
        tabIndex={0}
        aria-label={label}
        className="relative flex h-3 w-3 cursor-help items-center justify-center rounded-full focus:outline-none"
      >
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            isValifye ? 'bg-emerald-400' : 'bg-rose-400'
          )}
          aria-hidden
        />
        <span
          className={cn(
            'relative inline-flex h-3 w-3 rounded-full ring-2',
            isValifye
              ? 'bg-emerald-500 ring-emerald-300/40'
              : 'bg-rose-500 ring-rose-300/40'
          )}
          aria-hidden
        />
      </button>

      <span
        role="presentation"
        className={cn(
          'pointer-events-none absolute whitespace-nowrap rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] shadow-lg',
          'opacity-0 transition-opacity duration-200 group-hover/tag:opacity-100 group-focus-within/tag:opacity-100',
          labelOffsetClassName(anchor),
          isValifye
            ? 'border-emerald-500/40 bg-slate-950/95 text-emerald-300'
            : 'border-rose-500/40 bg-slate-950/95 text-rose-300'
        )}
      >
        {label}
      </span>
    </div>
  )
}

/* ─────────────────────  Mock fallback — Incumbent  ───────────────────── */

function IncumbentMockPanel() {
  return (
    <article
      aria-label="Incumbent generic output"
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
    >
      <header className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-400/90">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500/50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
          </span>
          The Incumbent Output
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
          <Bot className="h-3.5 w-3.5" />
          generic-llm
        </span>
      </header>

      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-600"
          aria-hidden
        >
          ai
        </span>
        <div className="flex-1 space-y-4 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4">
          <div className="space-y-2" aria-hidden>
            <div className="h-2 w-3/4 rounded bg-zinc-800 blur-sm" />
            <div className="h-2 w-5/6 rounded bg-zinc-800 blur-sm" />
            <div className="h-2 w-1/2 rounded bg-zinc-800 blur-sm" />
          </div>

          <blockquote className="border-l-2 border-zinc-700 pl-3 text-sm leading-relaxed text-zinc-400">
            &ldquo;The TAM for this sector is $5B. You should focus on social
            media marketing.&rdquo;
          </blockquote>

          <div className="space-y-2" aria-hidden>
            <div className="h-2 w-2/3 rounded bg-zinc-800 blur-sm" />
            <div className="h-2 w-11/12 rounded bg-zinc-800 blur-sm" />
            <div className="h-2 w-3/5 rounded bg-zinc-800 blur-sm" />
            <div className="h-2 w-4/6 rounded bg-zinc-800 blur-sm" />
          </div>
        </div>
      </div>

      <footer className="mt-5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
        <span>Source: training data, &lt; 2023</span>
        <span>No citations</span>
      </footer>
    </article>
  )
}

/* ─────────────────────  Mock fallback — Valifye  ───────────────────── */

function ValifyeMockPanel() {
  return (
    <article
      aria-label="Valifye forensic audit"
      className={cn(
        'relative overflow-hidden rounded-xl border border-emerald-500/50 bg-slate-900 p-6',
        'shadow-[0_0_30px_-8px_rgba(16,185,129,0.55)]',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-xl',
        'before:shadow-[0_0_60px_rgba(16,185,129,0.45)] before:animate-pulse'
      )}
    >
      <span
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden
      />

      <header className="relative mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          The Valifye Audit
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/80">
          <ShieldAlert className="h-3.5 w-3.5" />
          valifye.sys / forensic.v3
        </span>
      </header>

      <div className="relative space-y-3 rounded-lg border border-emerald-500/20 bg-slate-950/80 p-4 font-mono text-sm">
        <ForensicRow
          label="LOCAL FRICTION"
          value="14-Month Permitting Backlog in Target County"
        />
        <ForensicRow
          label="90-DAY BURN"
          value="$42,500 (Based on local labor rates)"
          valueClassName="tabular-nums"
        />

        <div className="border-t border-emerald-500/10 pt-3">
          <ForensicRow
            label="STATUS"
            value={
              <span className="inline-flex items-center gap-2 font-bold text-rose-400">
                <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
                [ FATAL FLAW DETECTED ]
              </span>
            }
            valueClassName="text-rose-400"
          />
        </div>
      </div>

      <footer className="relative mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/70">
        <span>Source: street-level signals · live</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Audit lock 0x7F · verified
        </span>
      </footer>
    </article>
  )
}

function ForensicRow({
  label,
  value,
  valueClassName
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400/80 md:w-32">
        {label}:
      </span>
      <span className={cn('text-sm leading-snug text-zinc-100', valueClassName)}>
        {value}
      </span>
    </div>
  )
}
