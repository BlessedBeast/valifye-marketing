import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { cn } from '@/lib/utils'

export type MarketsStateHubCardProps = {
  href: string
  /** e.g. `USA · AZ` */
  metaLine: string
  /** Primary hub label, e.g. state or region name */
  hubDisplayName: string
  /** Shown after hub name (default: Market Intelligence) */
  titleSuffix?: string
  blueprintCount: number
  ctaLabel?: string
  className?: string
}

/**
 * Forensic Noir hub tile — unified padding (no nested p-4/p-6 mismatch).
 */
export function MarketsStateHubCard({
  href,
  metaLine,
  hubDisplayName,
  titleSuffix = 'Market Intelligence',
  blueprintCount,
  ctaLabel = 'Open market hub',
  className
}: MarketsStateHubCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'MarketsStateHubCard group flex min-h-[9.5rem] flex-col gap-3 rounded-xl border border-zinc-800/90 bg-[#09090b] p-6',
        'shadow-[0_0_56px_-22px_rgba(245,158,11,0.12)] transition-all',
        'hover:border-emerald-900/50 hover:bg-zinc-950/85',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/45',
        className
      )}
    >
      <div className="meta">
        <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
            aria-hidden
          />
          {metaLine}
        </span>
      </div>
      <div className="body flex flex-1 flex-col gap-2">
        <h3 className="font-serif text-xl font-black leading-snug tracking-tight text-zinc-100 md:text-2xl">
          {hubDisplayName}{' '}
          <span className="font-bold text-zinc-400">{titleSuffix}</span>
        </h3>
        <p className="font-mono text-[11px] text-zinc-500">
          {blueprintCount} forensic blueprint{blueprintCount === 1 ? '' : 's'}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-amber-500/90">
        {ctaLabel}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  )
}
