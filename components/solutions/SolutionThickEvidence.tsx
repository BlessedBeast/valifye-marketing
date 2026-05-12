import { ValifyeBadge } from '@/components/ui/ValifyeBadge'
import type {
  SolutionEvidenceImages,
  SolutionFeatureModule,
  SolutionFaqSchemaItem,
  SolutionProofPillar,
  SolutionSeoBodyBlock
} from '@/lib/solutionData'
import { cn } from '@/lib/utils'

function serializeJsonLd(data: unknown): string | null {
  if (data == null) return null
  try {
    const str = JSON.stringify(data)
    if (!str || str === 'null' || str === '{}') return null
    return str
  } catch {
    return null
  }
}

/** Injects CMS-provided JSON-LD for rich results (FAQPage, Article, etc.). */
export function SolutionSchemaJsonLd({
  schemaJson
}: {
  schemaJson: unknown | null
}) {
  if (schemaJson == null) return null

  let payload: unknown = schemaJson
  if (typeof schemaJson === 'string') {
    try {
      payload = JSON.parse(schemaJson) as unknown
    } catch {
      return null
    }
  }

  const json = serializeJsonLd(payload)
  if (!json) return null

  return (
    <script
      type="application/ld+json"
      // Safe: re-serialized from JSON.parse / object only (no raw HTML).
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

export function SolutionThickEvidenceSections({
  evidence
}: {
  evidence: SolutionEvidenceImages
}) {
  return (
    <div className="space-y-20 md:space-y-24">
      {evidence.proofPillars.length > 0 && (
        <ProofPillarsSection pillars={evidence.proofPillars} />
      )}

      {evidence.featureModules.length > 0 && (
        <FeatureModulesSection modules={evidence.featureModules} />
      )}

      {evidence.seoBody.length > 0 && (
        <SeoNarrativeSection blocks={evidence.seoBody} />
      )}
    </div>
  )
}

export function SolutionFaqSection({ items }: { items: SolutionFaqSchemaItem[] }) {
  if (items.length === 0) return null

  return (
    <section
      aria-label="Frequently asked questions"
      className="space-y-6 border-t border-zinc-800/80 pt-12 md:pt-16"
    >
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/90">
          AEO · indexed Q&amp;A
        </p>
        <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
          Questions operators ask before they wire capital.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Structured answers aligned to how search engines surface direct
          responses.
        </p>
      </div>

      <div className="divide-y divide-zinc-800/90 rounded-xl border border-zinc-800/90 bg-slate-950/40">
        {items.map((item, i) => (
          <details
            key={`${item.question}-${i}`}
            className="group px-4 py-1 md:px-6 [&[open]>summary_.faq-chev]:rotate-45"
          >
            <summary className="cursor-pointer list-none py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-zinc-200 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                <span className="text-left leading-snug">{item.question}</span>
                <span
                  className="faq-chev mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/[0.08] font-mono text-sm font-normal text-emerald-300 transition-transform"
                  aria-hidden
                >
                  +
                </span>
              </span>
            </summary>
            <div className="border-t border-zinc-800/80 pb-5 pt-4 text-sm leading-relaxed text-zinc-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

function ProofPillarsSection({ pillars }: { pillars: SolutionProofPillar[] }) {
  return (
    <section aria-label="Proof pillars" className="space-y-6">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
          Quantified signals
        </p>
        <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
          The proof pillars behind this audit class.
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {pillars.map((p, i) => (
          <article
            key={`${p.label}-${i}`}
            className={cn(
              'flex flex-col gap-1.5 rounded-md border border-zinc-800/95 bg-slate-950/70 p-3 md:gap-2 md:p-3.5',
              'shadow-[0_0_32px_-20px_rgba(16,185,129,0.22)]'
            )}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              Signal
            </p>
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
              <span className="font-serif text-3xl font-black tabular-nums leading-none tracking-tight text-zinc-50 md:text-4xl lg:text-5xl">
                {p.stat}
              </span>
              {p.unit ? (
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 md:text-[11px]">
                  {p.unit}
                </span>
              ) : null}
            </div>
            <p className="font-mono text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-zinc-200">
              {p.label}
            </p>
            <p className="font-mono text-[10px] leading-snug text-zinc-500">
              {p.context}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FeatureModulesSection({
  modules
}: {
  modules: SolutionFeatureModule[]
}) {
  return (
    <section aria-label="What the audit uncovers" className="space-y-8">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
          Forensic modules
        </p>
        <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
          What the audit uncovers
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Each module maps to a concrete output bundle—no generic “insights”
          deck.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {modules.map((m, i) => (
          <article
            key={`${m.module}-${i}`}
            className={cn(
              'flex flex-col gap-2.5 rounded-md border border-slate-800 bg-slate-950/60 p-3.5 md:gap-3 md:p-4',
              'shadow-[0_0_36px_-22px_rgba(16,185,129,0.15)]'
            )}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
              Module
            </p>
            <h3 className="font-serif text-base font-bold leading-tight text-zinc-50 md:text-lg">
              {m.module}
            </h3>
            <p className="text-xs leading-snug text-zinc-400 md:text-[13px]">
              {m.description}
            </p>

            {m.outputs.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-800/90 pt-2.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
                  Outputs
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {m.outputs.map((out) => (
                    <li key={out}>
                      <ValifyeBadge
                        variant="default"
                        className="border-emerald-500/25 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[9px] uppercase leading-none tracking-wider text-emerald-200/95"
                      >
                        {out}
                      </ValifyeBadge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function SeoNarrativeSection({ blocks }: { blocks: SolutionSeoBodyBlock[] }) {
  return (
    <section
      aria-label="Deep-dive narrative"
      className="space-y-10 border-y border-zinc-800/60 py-12 md:space-y-12 md:py-16"
    >
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
          Field narrative
        </p>
        <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
          How this decision class breaks in the real economy.
        </h2>
      </div>

      <div className="space-y-12 md:space-y-14">
        {blocks.map((block, i) => (
          <div key={`${block.h2}-${i}`} className="max-w-3xl space-y-4">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-zinc-100 md:text-[1.65rem]">
              {block.h2}
            </h3>
            <div className="space-y-4 text-base leading-relaxed text-zinc-400">
              {block.copy
                .split(/\n\n+/)
                .filter((para) => para.trim().length > 0)
                .map((para, j) => (
                  <p key={`${i}-${j}`}>{para}</p>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
