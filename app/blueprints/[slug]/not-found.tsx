import Link from 'next/link'

import { MarketingShell } from '@/components/MarketingShell'

export default function BlueprintNotFound() {
  return (
    <MarketingShell className="max-w-3xl gap-10 text-zinc-400">
      <div className="rounded-xl border border-rose-500/30 bg-zinc-950 px-6 py-12 text-center md:px-10 md:py-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-rose-400/90">
          /// 404 · record not found
        </p>
        <h1 className="mt-4 font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
          Blueprint sealed or removed
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-500">
          This slug does not resolve in the 2026 forensic repository. The audit may
          have been retracted, renamed, or never published.
        </p>
        <Link
          href="/blueprints"
          className="mt-8 inline-flex border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-200 transition-colors hover:border-emerald-400/60 hover:text-emerald-100"
        >
          ← Return to repository index
        </Link>
      </div>
    </MarketingShell>
  )
}
