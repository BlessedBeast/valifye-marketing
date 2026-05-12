import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Crosshair,
  GitBranch,
  Target
} from 'lucide-react'

import { MarketingShell } from '@/components/MarketingShell'
import { VisualEvidenceSplit } from '@/components/compare/VisualEvidenceSplit'
import {
  ForensicScanEvidence,
  ForensicScanHero
} from '@/components/solutions/ForensicScanMotion'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import {
  getSolutionBySlug,
  type SolutionHeroVibe,
  type SolutionRiskFactor
} from '@/lib/solutionData'
import { cn } from '@/lib/utils'

const SITE_URL = 'https://valifye.com'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'
export const revalidate = 0

function vibeClasses(vibe: SolutionHeroVibe): {
  chip: string
  forensicBar: string
  subtitleBorder: string
} {
  switch (vibe) {
    case 'rose':
      return {
        chip:
          'border-rose-500/35 bg-rose-500/[0.08] text-rose-200 shadow-[0_0_40px_-20px_rgba(244,63,94,0.35)]',
        forensicBar: 'border-l-rose-500 bg-rose-500/[0.04]',
        subtitleBorder: 'border-l-rose-500/55'
      }
    case 'emerald':
      return {
        chip:
          'border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-200 shadow-[0_0_40px_-20px_rgba(16,185,129,0.4)]',
        forensicBar: 'border-l-emerald-500 bg-emerald-500/[0.04]',
        subtitleBorder: 'border-l-emerald-500/55'
      }
    case 'amber':
    default:
      return {
        chip:
          'border-amber-500/35 bg-amber-500/[0.08] text-amber-200 shadow-[0_0_40px_-20px_rgba(245,158,11,0.35)]',
        forensicBar: 'border-l-amber-500 bg-amber-500/[0.04]',
        subtitleBorder: 'border-l-amber-500/55'
      }
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const solution = await getSolutionBySlug(slug)

  if (!solution) {
    return {
      title: 'Solutions | Valifye',
      description: 'Valifye solution pillars for high-stakes decisions.'
    }
  }

  const canonical = `${SITE_URL}/solutions/${solution.slug}`

  return {
    title: solution.metaTitle,
    description: solution.metaDescription,
    openGraph: {
      title: solution.metaTitle,
      description: solution.metaDescription,
      type: 'article',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: solution.metaTitle,
      description: solution.metaDescription
    },
    alternates: {
      canonical
    }
  }
}

export default async function SolutionPillarPage({ params }: Props) {
  const { slug } = await params
  const solution = await getSolutionBySlug(slug)
  if (!solution) notFound()

  const vibe = vibeClasses(solution.heroVibe)
  const trimmedCta =
    solution.ctaText != null && solution.ctaText.trim().length > 0
      ? solution.ctaText.trim()
      : ''
  const ctaLabel =
    trimmedCta.length > 0 ? trimmedCta : 'Run Forensic Audit — $49'

  return (
    <MarketingShell className="max-w-[1180px] gap-16">
      <article className="space-y-20 pb-8 md:space-y-24 md:pb-12">
        <ForensicScanHero>
          <header className="space-y-8">
            <p
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]',
                vibe.chip
              )}
            >
              <Crosshair className="h-3.5 w-3.5 shrink-0" aria-hidden />
              High-stakes decision · Forensic warning
            </p>

            <div className="space-y-5">
              <h1 className="max-w-4xl font-serif text-4xl font-black leading-[1.08] tracking-tight text-zinc-50 md:text-5xl lg:text-6xl">
                {solution.title}
                <span
                  className={cn(
                    'mt-4 block h-1 w-20 rounded-full bg-gradient-to-r to-transparent md:w-28',
                    solution.heroVibe === 'rose' && 'from-rose-500',
                    solution.heroVibe === 'emerald' && 'from-emerald-500',
                    (solution.heroVibe === 'amber' || !solution.heroVibe) &&
                      'from-amber-500'
                  )}
                  aria-hidden
                />
              </h1>

              {solution.subtitle && (
                <p
                  className={cn(
                    'max-w-3xl border-l-2 pl-5 font-serif text-xl font-semibold leading-snug tracking-tight text-zinc-200 md:text-2xl',
                    vibe.subtitleBorder
                  )}
                >
                  {solution.subtitle}
                </p>
              )}

              <div
                className={cn(
                  'relative max-w-3xl border border-zinc-800/90 border-l-4 bg-zinc-950/70 p-6 md:p-8',
                  vibe.forensicBar
                )}
              >
                <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Forensic summary · AEO brief
                </p>
                <p className="font-mono text-sm leading-relaxed text-zinc-200 md:text-[15px]">
                  {solution.aeoAnswer}
                </p>
              </div>
            </div>
          </header>
        </ForensicScanHero>

        {solution.riskFactors.length > 0 && (
          <section aria-label="Risk factors" className="space-y-8">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-rose-400/90">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                Hidden icebergs
              </p>
              <h2 className="max-w-3xl font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl">
                Unknown variables that capsize operators who move on gut feel
                alone.
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
                Each factor is a class of failure we see repeatedly in the field.
                Treat them as mandatory inputs to your diligence—not optional
                reading.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {solution.riskFactors.map((factor, i) => (
                <RiskFactorCard key={`${factor.title}-${i}`} factor={factor} />
              ))}
            </div>
          </section>
        )}

        <section aria-label="Evidence comparison" className="space-y-6">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">
              <Crosshair className="h-3.5 w-3.5" aria-hidden />
              Evidence wall
            </p>
            <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
              What you see before the mistake is irreversible.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
              Legacy / gut feeling on the left (blurred, grayscale signal).
              Valifye forensic signal on the right (sharp, cited, emerald
              verified).
            </p>
          </div>

          <ForensicScanEvidence>
            <VisualEvidenceSplit
              competitorName="Legacy / Gut Feeling"
              competitorScreenshot={
                solution.evidenceImages.competitorUrl ?? undefined
              }
              valifyeScreenshot={solution.evidenceImages.valifyeUrl ?? undefined}
            />
          </ForensicScanEvidence>
        </section>

        <section
          aria-label="Execution versus pivot outcomes"
          className="space-y-8 border-y border-zinc-800/80 py-12 md:py-16"
        >
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/90">
              Dynamic outcome
            </p>
            <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
              Two paths. One audit. Capital preserved either way.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
              Valifye does not stop at a verdict—we hand you the next artifact
              your situation demands.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            <OutcomePathPanel
              path="A"
              title="The Execution Arsenal"
              icon={Target}
              accent="emerald"
              imageSrc="/solutions/execution-arsenal.svg"
              imageAlt="Execution Arsenal: roadmap, Mom Test scripts, and customer finder artifacts"
              body="If your audit passes, we hand you the 90-Day Roadmap, Mom Test Scripts, and Customer Finder—so you ship with discipline instead of hope."
              previewLines={[
                '90-DAY ROADMAP · v2',
                'MOM TEST · interview scripts',
                'CUSTOMER FINDER · signal map'
              ]}
            />
            <OutcomePathPanel
              path="B"
              title="The Pivot Playbook"
              icon={GitBranch}
              accent="cyan"
              imageSrc="/solutions/pivot-playbook.svg"
              imageAlt="Pivot Playbook: three adjacent Blue Ocean pivot vectors"
              body="If the audit fails, we provide three adjacent Blue Ocean pivots engineered to salvage momentum and protect remaining capital."
              previewLines={[
                'PIVOT VECTOR 01 · adjacency',
                'PIVOT VECTOR 02 · wedge',
                'PIVOT VECTOR 03 · escape hatch'
              ]}
            />
          </div>
        </section>

        <SolutionGrandSlamCta slug={solution.slug} ctaLabel={ctaLabel} />
      </article>
    </MarketingShell>
  )
}

function RiskFactorCard({ factor }: { factor: SolutionRiskFactor }) {
  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3 rounded-lg border border-zinc-800 bg-slate-900/45 p-5 md:p-6',
        'border-t-2 border-t-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.06)]'
      )}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-500/35 bg-rose-500/[0.08] text-rose-400">
        <AlertTriangle className="h-4 w-4" aria-hidden />
      </span>
      <h3 className="font-serif text-lg font-bold leading-snug text-zinc-50">
        {factor.title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-400">{factor.description}</p>
    </article>
  )
}

function OutcomePathPanel({
  path,
  title,
  icon: Icon,
  accent,
  imageSrc,
  imageAlt,
  body,
  previewLines
}: {
  path: string
  title: string
  icon: typeof Target
  accent: 'emerald' | 'cyan'
  imageSrc: string
  imageAlt: string
  body: string
  previewLines: string[]
}) {
  const isEmerald = accent === 'emerald'
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-slate-950/50',
        isEmerald
          ? 'border-emerald-500/30 shadow-[0_0_45px_-22px_rgba(16,185,129,0.45)]'
          : 'border-cyan-500/30 shadow-[0_0_45px_-22px_rgba(34,211,238,0.25)]'
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-3 border-b px-5 py-4 md:px-6',
          isEmerald ? 'border-emerald-500/15' : 'border-cyan-500/15'
        )}
      >
        <div className="space-y-1">
          <p
            className={cn(
              'font-mono text-[10px] font-bold uppercase tracking-[0.28em]',
              isEmerald ? 'text-emerald-400/90' : 'text-cyan-400/90'
            )}
          >
            Path {path}
          </p>
          <h3 className="font-serif text-xl font-black tracking-tight text-zinc-50 md:text-2xl">
            {title}
          </h3>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
            isEmerald
              ? 'border-emerald-500/35 bg-emerald-500/[0.1] text-emerald-300'
              : 'border-cyan-500/35 bg-cyan-500/[0.08] text-cyan-200'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="space-y-4 px-5 py-5 md:px-6">
        <p className="text-sm leading-relaxed text-zinc-400">{body}</p>

        <div
          className={cn(
            'relative aspect-[16/9] w-full overflow-hidden rounded-lg border',
            isEmerald ? 'border-emerald-500/25' : 'border-cyan-500/25'
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={false}
          />
        </div>

        <OutcomePreviewMock lines={previewLines} accent={accent} />
      </div>
    </div>
  )
}

function OutcomePreviewMock({
  lines,
  accent
}: {
  lines: string[]
  accent: 'emerald' | 'cyan'
}) {
  const isEmerald = accent === 'emerald'
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border font-mono text-[11px] leading-relaxed',
        isEmerald
          ? 'border-emerald-500/25 bg-slate-900/80 text-emerald-100/90'
          : 'border-cyan-500/25 bg-slate-900/80 text-cyan-100/85'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b px-3 py-2',
          isEmerald ? 'border-emerald-500/15' : 'border-cyan-500/15'
        )}
      >
        <span className="uppercase tracking-[0.2em] text-zinc-500">
          Artifact preview
        </span>
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            isEmerald
              ? 'bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.5)]'
              : 'bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.45)]'
          )}
        />
      </div>
      <div className="space-y-2.5 px-3 py-3">
        {lines.map((line) => (
          <div
            key={line}
            className="flex items-center gap-2 border-l-2 border-zinc-700 pl-2.5 text-zinc-300"
          >
            <span
              className={cn(
                'font-bold uppercase tracking-wider',
                isEmerald ? 'text-emerald-400/90' : 'text-cyan-400/90'
              )}
            >
              ▸
            </span>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

function SolutionGrandSlamCta({
  slug,
  ctaLabel
}: {
  slug: string
  ctaLabel: string
}) {
  const ctaRef = `solution_${slug}`

  return (
    <section
      aria-label="Call to action"
      className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/50 p-8 text-center md:p-12"
    >
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-300">
          Grand slam · single move
        </p>
        <form
          method="get"
          action="https://app.valifye.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full flex-col items-center gap-5"
        >
          <input type="hidden" name="ref" value={ctaRef} />
          <ValifyeButton
            type="submit"
            size="lg"
            className={cn(
              'inline-flex gap-3',
              'min-w-[min(100%,280px)] px-10 uppercase tracking-[0.14em]',
              'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
              'shadow-[0_0_50px_-8px_rgba(16,185,129,0.75)] ring-2 ring-emerald-400/35'
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </ValifyeButton>
        </form>

        <div className="flex flex-col gap-2 font-mono text-xs text-zinc-400 md:flex-row md:items-center md:gap-6 md:text-sm">
          <span className="inline-flex items-center justify-center gap-2 text-emerald-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            100% Data-Back Guarantee
          </span>
          <span className="hidden h-4 w-px bg-zinc-700 md:inline-block" aria-hidden />
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Prevents $50k+ mistakes
          </span>
        </div>
      </div>
    </section>
  )
}
