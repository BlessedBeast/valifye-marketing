import { Terminal } from 'lucide-react'

export function GhostGate() {
  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card px-6 py-6 text-foreground dark:border-orange-500/20 dark:bg-zinc-950 dark:text-zinc-100 sm:px-8 sm:py-7">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-60 mix-blend-screen animate-[scanline_3s_linear_infinite]" />

      {/* Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-orange-300 animate-pulse">
        <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]" />
        Status: Forensic Hardening in Progress
      </div>

      {/* Header and copy */}
      <div className="space-y-2">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.28em] text-foreground dark:text-zinc-200">
          Intelligence Dossier Under Construction
        </h2>
        <p className="max-w-2xl text-xs text-muted-foreground dark:text-zinc-400">
          The underlying market dossier is still being hardened by the forensic engine. We&apos;re
          injecting economics, mapping competitors, and syncing authority signals before exposing
          this file to operators or search engines.
        </p>
      </div>

      {/* Blueprint shard grid */}
      <div className="mt-5 grid gap-3 text-xs text-foreground dark:text-zinc-300 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-md border border-border bg-background/60 px-3 py-3 dark:border-zinc-800 dark:bg-black/40">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300 animate-pulse">
            <Terminal className="h-3 w-3" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-zinc-500">
              Data Shard · 01
            </p>
            <p className="text-[11px] text-foreground dark:text-zinc-200">Injecting Economics</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border bg-background/60 px-3 py-3 dark:border-zinc-800 dark:bg-black/40">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300 animate-pulse">
            <Terminal className="h-3 w-3" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-zinc-500">
              Data Shard · 02
            </p>
            <p className="text-[11px] text-foreground dark:text-zinc-200">Mapping Competitors</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border bg-background/60 px-3 py-3 dark:border-zinc-800 dark:bg-black/40">
          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300 animate-pulse">
            <Terminal className="h-3 w-3" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-zinc-500">
              Data Shard · 03
            </p>
            <p className="text-[11px] text-foreground dark:text-zinc-200">Syncing Authority</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Tailwind keyframes (add to your globals or tailwind config):
// @keyframes scanline {
//   0% { transform: translateY(-100%); }
//   100% { transform: translateY(200%); }
// }

