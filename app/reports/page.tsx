import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Archive,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Crosshair,
  FileText,
  Layers,
  Map as MapIcon,
  Rocket,
  Scale,
  Shield,
  Skull,
  Sparkles,
  Zap,
  type LucideIcon
} from 'lucide-react'
import { MarketingShell } from '@/components/MarketingShell'
import {
  getShowcaseList,
  type MarketingShowcaseReport,
  type ShowcaseTemplate
} from '@/lib/marketingShowcase'
import { getIndustryHubs, getReportsList } from '@/lib/reportData'
import { cn } from '@/lib/utils'

const SITE_URL = 'https://valifye.com'
const PAGE_URL = `${SITE_URL}/reports`

const PAGE_DESCRIPTION =
  'The Intelligence Pathfinder. Choose your battleground: forensic local market audits for brick-and-mortar founders, or competitive intelligence for SaaS and AI builders.'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Intelligence Pathfinder | Forensic Business Intelligence',
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: 'Intelligence Pathfinder | Forensic Business Intelligence',
    description: PAGE_DESCRIPTION,
    type: 'website',
    url: PAGE_URL
  },
  alternates: {
    canonical: PAGE_URL
  }
}

const LOCAL_TYPES: ShowcaseTemplate[] = ['scout', 'scout_pivot', 'arsenal']
const DIGITAL_TYPES: ShowcaseTemplate[] = ['battlefield', 'pivot']

const ALL_TYPES: ShowcaseTemplate[] = [
  ...LOCAL_TYPES,
  ...DIGITAL_TYPES,
  'risk'
]

type TemplateChipMeta = {
  label: string
  Icon: LucideIcon
  className: string
}

const TEMPLATE_CHIP: Record<ShowcaseTemplate, TemplateChipMeta> = {
  scout: {
    label: 'Local Scout',
    Icon: MapIcon,
    className: 'border-amber-400/40 bg-amber-500/[0.08] text-amber-200'
  },
  scout_pivot: {
    label: 'Local Recovery',
    Icon: Skull,
    className: 'border-rose-400/40 bg-rose-500/[0.08] text-rose-200'
  },
  arsenal: {
    label: 'Execution Arsenal',
    Icon: Rocket,
    className: 'border-emerald-400/40 bg-emerald-500/[0.08] text-emerald-200'
  },
  battlefield: {
    label: 'Digital Battlefield',
    Icon: Crosshair,
    className: 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200'
  },
  pivot: {
    label: 'Pivot Playbook',
    Icon: Scale,
    className: 'border-indigo-400/40 bg-indigo-500/[0.08] text-indigo-200'
  },
  risk: {
    label: 'Risk Register',
    Icon: Shield,
    className: 'border-zinc-500/40 bg-zinc-500/[0.08] text-zinc-200'
  }
}

function formatRelative(iso?: string): string {
  if (!iso) return 'Forensic audit'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Forensic audit'
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} wk ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mo ago`
  return `${Math.floor(diffDays / 365)} yr ago`
}

function formatScore(score: number) {
  return Number.isFinite(score) ? `${score}/100` : '—'
}

function verdictClass(v: string) {
  if (v === 'KILL') return 'border-red-500/50 bg-red-950/50 text-red-200'
  if (v === 'BUILD')
    return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200'
  return 'border-amber-500/50 bg-amber-950/30 text-amber-200'
}

export default async function IntelligencePathfinderPage() {
  const [reports, industryHubs, validationReports] = await Promise.all([
    getShowcaseList(ALL_TYPES),
    getIndustryHubs(),
    getReportsList(50)
  ])

  const localCount = reports.filter((r) =>
    LOCAL_TYPES.includes(r.template)
  ).length
  const digitalCount = reports.filter((r) =>
    DIGITAL_TYPES.includes(r.template)
  ).length
  const totalCount = reports.length

  const latest = reports.slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Intelligence Pathfinder',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    hasPart: [
      {
        '@type': 'WebPage',
        name: 'Local Market Intelligence Center',
        url: `${SITE_URL}/local-market-scout`
      },
      {
        '@type': 'WebPage',
        name: 'Digital Battlefield Hub',
        url: `${SITE_URL}/digital-battlefield`
      }
    ]
  }

  return (
    <MarketingShell className="max-w-[1280px] gap-20">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="space-y-6 text-center md:text-left">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligence Pathfinder
        </p>
        <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-zinc-50 md:text-6xl lg:text-[5rem]">
          Access the World&apos;s Most Detailed
          <span className="block text-primary">
            Forensic Business Intelligence.
          </span>
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
          {PAGE_DESCRIPTION} Every report is generated by the Valifye intelligence
          engine, validated against street-level signals, and engineered to
          eliminate guesswork before you spend a dollar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 md:justify-start">
          <span className="rounded-full border border-zinc-700/60 bg-zinc-900/50 px-3 py-1">
            {totalCount} Featured Audits
          </span>
          <span className="rounded-full border border-zinc-700/60 bg-zinc-900/50 px-3 py-1">
            {validationReports.length} Archive Reports
          </span>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1 text-amber-200">
            {localCount} Local
          </span>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/[0.06] px-3 py-1 text-cyan-200">
            {digitalCount} Digital
          </span>
        </div>
      </section>

      {/* ───────────── FEATURED MARKET AUDITS (new) ───────────── */}
      <DivisionHeader
        eyebrow="Featured Market Audits"
        title="High-fidelity, fully formatted intelligence reports."
        description="Hand-crafted forensic showcases. Each one is a complete audit engineered for operators making a real decision."
        icon={<Sparkles className="h-3.5 w-3.5" />}
        accentClassName="text-primary"
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          <span>Choose Your Battleground</span>
          <span className="hidden text-zinc-600 md:inline">
            Two divisions. One engine.
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BentoCard
            href="/local-market-scout"
            eyebrow="Local Market Scout"
            title="For Brick & Mortar Founders."
            description="Forensic capex, AOV, local demand, saturation autopsies, recovery vectors, and 90-day execution roadmaps for any physical operator."
            Icon={MapIcon}
            ctaLabel="Enter Local Intelligence"
            countLabel={`${localCount} forensic audits`}
            theme="forensic"
          />
          <BentoCard
            href="/digital-battlefield"
            eyebrow="Digital Battlefield"
            title="For SaaS & AI Builders."
            description="Competitor maps, pricing whitespace, feature gaps, complaint mining, and blue-ocean pivot playbooks against entrenched incumbents."
            Icon={Shield}
            ctaLabel="Enter the Battlefield"
            countLabel={`${digitalCount} forensic audits`}
            theme="cyber"
          />
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 border-b border-zinc-800/80 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              <Clock className="h-3.5 w-3.5" />
              Latest Intelligence
            </p>
            <h2 className="font-serif text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">
              Newest forensic audits across every division.
            </h2>
          </div>
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-primary"
          >
            View archive
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        {latest.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-800 bg-slate-900/30 px-6 py-10 text-center text-sm text-zinc-500">
            No forensic audits indexed yet. The intelligence engine is warming up.
          </div>
        ) : (
          <ol className="divide-y divide-zinc-800/80 overflow-hidden rounded-lg border border-zinc-800/80 bg-slate-900/30">
            {latest.map((report, index) => (
              <LatestRow key={report.slug} report={report} index={index} />
            ))}
          </ol>
        )}
      </section>

      {/* ───────────── FULL FORENSIC ARCHIVE (legacy) ───────────── */}
      <DivisionHeader
        eyebrow="Full Forensic Archive"
        title="Every validated business idea, ever."
        description="The open database of forensic verdicts. Browse by sector or scan the full feed of standard validation reports."
        icon={<Archive className="h-3.5 w-3.5" />}
        accentClassName="text-emerald-400"
      />

      {industryHubs.length > 0 && (
        <section className="space-y-4">
          <SubSectionHeader
            title="Browse All Sectors"
            count={industryHubs.length}
            countLabel="sector hubs"
            icon={<Layers className="h-3.5 w-3.5 text-emerald-300" />}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industryHubs.map((hub) => {
              const industry = hub.industry_name || 'Unlabeled'
              const top = Array.isArray(hub.top_verdicts)
                ? hub.top_verdicts.slice(0, 2)
                : []
              const slug =
                hub.sector_slug ||
                industry
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
              return (
                <Link
                  key={industry}
                  href={`/reports/industry/${slug}`}
                  className="flex flex-col justify-between border border-zinc-800 bg-zinc-900 px-5 py-4 text-left text-xs transition-colors hover:border-emerald-500 hover:bg-zinc-900/90"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                        {industry}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                        {hub.report_count} files
                      </span>
                    </div>
                    {top.length > 0 && (
                      <ul className="space-y-1 text-[11px] text-zinc-300">
                        {top.map((v) => (
                          <li key={v.slug} className="line-clamp-1">
                            {v.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    <span>Open Sector Hub</span>
                    <ArrowRight className="h-3 w-3 text-emerald-400" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <SubSectionHeader
          title="Validation Reports"
          count={validationReports.length}
          countLabel="reports indexed"
          icon={<FileText className="h-3.5 w-3.5 text-primary" />}
          rightSlot={
            <span className="inline-flex items-center gap-2 text-primary">
              <Zap className="h-3 w-3" /> System Live
            </span>
          }
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {validationReports.length === 0 ? (
            <div className="col-span-full border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No validation reports yet. Run the verdict pipeline to generate
              forensic reports.
            </div>
          ) : (
            validationReports.map((report) => (
              <Link
                key={report.slug}
                href={`/reports/${report.slug}`}
                className="group flex flex-col justify-between border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[4px_4px_0_0_hsl(var(--primary))]"
              >
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${verdictClass(
                        report.final_verdict
                      )}`}
                    >
                      <Scale className="h-3 w-3" />
                      {report.final_verdict}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {formatScore(report.overall_integrity_score)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold leading-snug tracking-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {report.idea_title}
                  </h3>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Integrity Score</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    Open Report
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </MarketingShell>
  )
}

type DivisionHeaderProps = {
  eyebrow: string
  title: string
  description: string
  icon?: React.ReactNode
  accentClassName?: string
}

function DivisionHeader({
  eyebrow,
  title,
  description,
  icon,
  accentClassName
}: DivisionHeaderProps) {
  return (
    <section
      aria-label={eyebrow}
      className="space-y-3 border-y border-zinc-800/80 py-6"
    >
      <p
        className={cn(
          'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em]',
          accentClassName ?? 'text-zinc-400'
        )}
      >
        {icon}
        {eyebrow}
      </p>
      <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </section>
  )
}

type SubSectionHeaderProps = {
  title: string
  count: number
  countLabel: string
  icon?: React.ReactNode
  rightSlot?: React.ReactNode
}

function SubSectionHeader({
  title,
  count,
  countLabel,
  icon,
  rightSlot
}: SubSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span className="inline-flex items-center gap-2">
        {icon}
        {title}
        <span className="text-zinc-500"> · {count} {countLabel}</span>
      </span>
      {rightSlot}
    </div>
  )
}

type BentoTheme = 'forensic' | 'cyber'

type BentoCardProps = {
  href: string
  eyebrow: string
  title: string
  description: string
  Icon: LucideIcon
  ctaLabel: string
  countLabel: string
  theme: BentoTheme
}

function BentoCard({
  href,
  eyebrow,
  title,
  description,
  Icon,
  ctaLabel,
  countLabel,
  theme
}: BentoCardProps) {
  const isCyber = theme === 'cyber'

  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-slate-950/40 p-8 transition-all duration-300 md:p-10',
        'hover:-translate-y-1',
        isCyber
          ? 'border-cyan-500/25 hover:border-cyan-400/60 hover:shadow-[0_0_60px_-12px_rgba(34,211,238,0.55),0_0_2px_rgba(99,102,241,0.5)]'
          : 'border-amber-500/25 hover:border-amber-400/60 hover:shadow-[0_0_60px_-12px_rgba(245,158,11,0.55),0_0_2px_rgba(244,63,94,0.5)]'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 opacity-90 transition-opacity duration-500 group-hover:opacity-100',
          isCyber
            ? 'bg-gradient-to-br from-cyan-950/50 via-slate-950 to-indigo-950/40'
            : 'bg-gradient-to-br from-amber-950/40 via-slate-950 to-rose-950/40'
        )}
        aria-hidden
      />
      <span
        className={cn(
          'pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl transition-opacity duration-500',
          isCyber
            ? 'bg-cyan-500/20 group-hover:bg-cyan-400/30'
            : 'bg-amber-500/20 group-hover:bg-amber-400/30'
        )}
        aria-hidden
      />

      <div className="relative flex h-full flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-lg border',
              isCyber
                ? 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200 shadow-[0_0_30px_-8px_rgba(34,211,238,0.55)]'
                : 'border-amber-400/40 bg-amber-500/[0.08] text-amber-200 shadow-[0_0_30px_-8px_rgba(245,158,11,0.55)]'
            )}
          >
            <Icon className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]',
              isCyber
                ? 'border-cyan-400/30 bg-slate-950/40 text-cyan-200'
                : 'border-amber-400/30 bg-slate-950/40 text-amber-200'
            )}
          >
            {countLabel}
          </span>
        </header>

        <div className="space-y-3">
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.32em]',
              isCyber ? 'text-cyan-300' : 'text-amber-300'
            )}
          >
            {eyebrow}
          </p>
          <h3 className="font-serif text-3xl font-black leading-tight tracking-tight text-zinc-50 md:text-4xl">
            {title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            {description}
          </p>
        </div>

        <footer
          className={cn(
            'mt-auto inline-flex items-center justify-between gap-3 border-t pt-6 text-sm font-semibold uppercase tracking-[0.18em]',
            isCyber
              ? 'border-cyan-500/20 text-cyan-200'
              : 'border-amber-500/20 text-amber-200'
          )}
        >
          <span>{ctaLabel}</span>
          <span
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all',
              isCyber
                ? 'border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-100 group-hover:bg-cyan-400 group-hover:text-slate-950'
                : 'border-amber-400/40 bg-amber-500/[0.08] text-amber-100 group-hover:bg-amber-400 group-hover:text-slate-950'
            )}
          >
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </footer>
      </div>
    </Link>
  )
}

function LatestRow({
  report,
  index
}: {
  report: MarketingShowcaseReport
  index: number
}) {
  const chip = TEMPLATE_CHIP[report.template]
  const ChipIcon = chip.Icon

  return (
    <li className="group">
      <Link
        href={`/showcase/${report.slug}`}
        className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-slate-900/60 md:flex-row md:items-center md:gap-6 md:px-6"
      >
        <span className="flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
          <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]',
              chip.className
            )}
          >
            <ChipIcon className="h-3 w-3" />
            {chip.label}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-base font-bold tracking-tight text-zinc-100 transition-colors group-hover:text-white md:text-lg">
            {report.title}
          </h3>
          {report.forensicVerdict && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-400">
              {report.forensicVerdict}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          <span>{formatRelative(report.updatedAt)}</span>
          <span className="inline-flex items-center gap-1 text-zinc-300 transition-colors group-hover:text-primary">
            Open
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  )
}
