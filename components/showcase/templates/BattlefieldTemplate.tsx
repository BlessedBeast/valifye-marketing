import {
  AlertCircle,
  Crosshair,
  ExternalLink,
  Globe,
  LockKeyhole,
  Quote,
  Sparkles,
  Tags,
  Target,
  Zap
} from 'lucide-react'
import { ValifyeButton } from '@/components/ui/ValifyeButton'
import { ScoreRing } from '@/components/market/ScoreRing'
import {
  extractPayload,
  type TemplateProps
} from '@/components/showcase/templates/shared'
import { cn } from '@/lib/utils'

const SECTION_BASE =
  'rounded-md border border-cyan-500/15 bg-slate-900/60 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]'

const SECTION_HEADING =
  'text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-500/90 mb-6'

const CYAN_GLOW =
  '[text-shadow:0_0_18px_rgba(34,211,238,0.55),0_0_2px_rgba(34,211,238,0.65)]'

const INDIGO_GLOW =
  '[text-shadow:0_0_14px_rgba(129,140,248,0.55)]'

// ---- Payload types -------------------------------------------------------

type Competitor = {
  name?: unknown
  logo_url?: unknown
  url?: unknown
  domain?: unknown
  competitive_moat?: unknown
  pricing?: unknown
  monthly_visitors?: unknown
  cpc?: unknown
  funding?: unknown
}

type PricingLadderRow = {
  tier?: unknown
  label?: unknown
  price?: unknown
  occupied?: unknown
  is_occupied?: unknown
  note?: unknown
}

type ComplaintRow = {
  category?: unknown
  sample_quote?: unknown
  source?: unknown
  thread_title?: unknown
  thread_url?: unknown
  upvotes?: unknown
  count?: unknown
}

type WhitespaceFeature = {
  feature?: unknown
  rationale?: unknown
  gap?: unknown
  severity?: unknown
}

type StrategicAngle = {
  title?: unknown
  description?: unknown
  positioning?: unknown
}

type CompetitorMapModule = {
  competitors?: unknown
  total_competitors?: unknown
  [key: string]: unknown
}

type PricingIntelligenceModule = {
  dominant_model?: unknown
  pricing_ladder?: unknown
  unoccupied_tiers?: unknown
  [key: string]: unknown
}

type FeatureMatrixModule = {
  whitespace_features?: unknown
  [key: string]: unknown
}

type ComplaintMinerModule = {
  top_complaints?: unknown
  [key: string]: unknown
}

type StrategicAnglesModule = {
  angles?: unknown
  positioning_angles?: unknown
  [key: string]: unknown
}

type VerdictModule = {
  whitespace_score?: unknown
  market_verdict?: unknown
  build_vs_wait?: unknown
  geo_coverage_score?: unknown
  keyword_arbitrage_score?: unknown
  [key: string]: unknown
}

type BattlefieldPayload = {
  module_01_competitor_map?: CompetitorMapModule
  module_02_pricing_intelligence?: PricingIntelligenceModule
  module_03_feature_matrix?: FeatureMatrixModule
  module_04_complaint_miner?: ComplaintMinerModule
  module_05_strategic_angles?: StrategicAnglesModule
  module_07_verdict?: VerdictModule
  [key: string]: unknown
}

// ---- Utility coercers ----------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null
}

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function asArrayOfRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord)
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item))
}

function formatNumberToken(value: unknown): string | null {
  const n = asNumber(value)
  if (n !== null) return n.toLocaleString('en-US')
  return asString(value)
}

function formatCurrencyToken(value: unknown): string | null {
  const n = asNumber(value)
  if (n !== null) {
    const rounded = Math.round(n * 100) / 100
    return `$${rounded.toLocaleString('en-US')}`
  }
  return asString(value)
}

// ---- ScoreGauge (semicircle SVG) ----------------------------------------

function ScoreGauge({
  score,
  size = 240
}: {
  score: number | null
  size?: number
}) {
  const width = size
  const height = size / 2 + 24
  const stroke = 14
  const radius = (size - stroke) / 2
  const cy = size / 2
  const arcLength = Math.PI * radius
  const safeScore =
    score !== null && Number.isFinite(score)
      ? Math.max(0, Math.min(100, score))
      : 0
  const offset = arcLength - (safeScore / 100) * arcLength

  return (
    <div
      className="relative"
      style={{ width, height }}
      aria-label="Whitespace score gauge"
      role="img"
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="battlefield-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <path
          d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${
            width - stroke / 2
          } ${cy}`}
          fill="none"
          stroke="rgba(148, 163, 184, 0.18)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${cy} A ${radius} ${radius} 0 0 1 ${
            width - stroke / 2
          } ${cy}`}
          fill="none"
          stroke="url(#battlefield-gauge)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={offset}
          style={{
            filter:
              'drop-shadow(0 0 12px rgba(34,211,238,0.55)) drop-shadow(0 0 24px rgba(34,211,238,0.25))'
          }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
        <strong
          className={cn(
            'font-serif text-5xl font-black leading-none tabular-nums text-cyan-300',
            CYAN_GLOW
          )}
        >
          {score !== null ? Math.round(safeScore) : '—'}
        </strong>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-500/80">
          Whitespace / 100
        </span>
      </div>
    </div>
  )
}

// ---- Subcomponents -------------------------------------------------------

function CompetitorLogo({
  src,
  name
}: {
  src: string | null
  name: string
}) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-cyan-500/20 bg-slate-950 font-serif text-base font-black text-cyan-300">
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-cyan-500/20 bg-slate-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        className="h-9 w-9 object-contain"
      />
    </div>
  )
}

function CompetitorRow({ row }: { row: Record<string, unknown> }) {
  const comp = row as Competitor
  const name = asString(comp.name) ?? 'Unnamed Competitor'
  const logoUrl = asString(comp.logo_url)
  const moat = asString(comp.competitive_moat)
  const url = asString(comp.url) ?? asString(comp.domain)
  const pricing = formatCurrencyToken(comp.pricing) ?? asString(comp.pricing)
  const monthlyVisitors = formatNumberToken(comp.monthly_visitors)
  const cpc = formatCurrencyToken(comp.cpc)

  return (
    <li className="flex flex-col gap-4 border-t border-cyan-500/10 py-4 first:border-t-0 first:pt-0 md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-4">
        <CompetitorLogo src={logoUrl} name={name} />
        <div className="min-w-0">
          <strong className={cn('block font-serif text-base text-zinc-50', INDIGO_GLOW)}>
            {name}
          </strong>
          {url && (
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-cyan-300/80 hover:text-cyan-200"
            >
              {url.replace(/^https?:\/\//, '')}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {moat && (
            <cite className="mt-1 block text-[11px] font-normal not-italic text-zinc-400">
              <span className="text-cyan-500/80">Moat:</span> {moat}
            </cite>
          )}
        </div>
      </div>

      <div className="ml-16 flex flex-wrap items-center gap-x-6 gap-y-2 md:ml-auto">
        {pricing && (
          <MetricInline label="Pricing">
            <strong className="font-serif text-zinc-100">{pricing}</strong>
          </MetricInline>
        )}
        {monthlyVisitors && (
          <MetricInline label="Monthly Visitors">
            <strong className="font-serif text-zinc-100">{monthlyVisitors}</strong>
          </MetricInline>
        )}
        {cpc && (
          <MetricInline label="CPC">
            <strong className="font-serif text-zinc-100">{cpc}</strong>
          </MetricInline>
        )}
      </div>
    </li>
  )
}

function MetricInline({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <span className="flex flex-col leading-tight">
      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-500/70">
        {label}
      </span>
      <span className="text-sm text-zinc-200">{children}</span>
    </span>
  )
}

function PricingLadderItem({
  row,
  unoccupiedSet
}: {
  row: Record<string, unknown>
  unoccupiedSet: Set<string>
}) {
  const entry = row as PricingLadderRow
  const tier = asString(entry.tier) ?? asString(entry.label) ?? 'Tier'
  const price = formatCurrencyToken(entry.price) ?? asString(entry.price)
  const note = asString(entry.note)

  const explicitlyOccupied =
    typeof entry.occupied === 'boolean'
      ? entry.occupied
      : typeof entry.is_occupied === 'boolean'
        ? entry.is_occupied
        : null

  const isUnoccupied =
    explicitlyOccupied === false || unoccupiedSet.has(tier.toLowerCase())

  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-md border px-4 py-3 md:flex-row md:items-center md:justify-between',
        isUnoccupied
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-cyan-500/20 bg-slate-950/60'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-2 w-2 rounded-full',
            isUnoccupied ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]' : 'bg-cyan-400'
          )}
          aria-hidden
        />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-100">
          {tier}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        {price && (
          <strong className={cn('font-serif text-base text-zinc-50', INDIGO_GLOW)}>
            {price}
          </strong>
        )}
        {note && <span className="text-[11px] text-zinc-400">{note}</span>}
        {isUnoccupied && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-300">
            <Sparkles className="h-3 w-3" />
            Opportunity
          </span>
        )}
      </div>
    </li>
  )
}

function WhitespaceFeatureItem({ row }: { row: Record<string, unknown> }) {
  const feature = row as WhitespaceFeature
  const name = asString(feature.feature) ?? 'Unspecified feature'
  const rationale = asString(feature.rationale) ?? asString(feature.gap)
  const severity = asString(feature.severity)

  return (
    <li className="rounded-md border border-cyan-500/15 bg-slate-950/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Target className="h-3.5 w-3.5 text-cyan-400" />
          {name}
        </p>
        {severity && (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {severity}
          </span>
        )}
      </div>
      {rationale && (
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          {rationale}
        </p>
      )}
    </li>
  )
}

function ComplaintQuote({ row }: { row: Record<string, unknown> }) {
  const complaint = row as ComplaintRow
  const category = asString(complaint.category) ?? 'Recurring complaint'
  const quote = asString(complaint.sample_quote)
  const source = asString(complaint.source) ?? 'External community thread'
  const threadTitle = asString(complaint.thread_title)
  const threadUrl = asString(complaint.thread_url)
  const upvotes = asNumber(complaint.upvotes)
  const count = asNumber(complaint.count)

  return (
    <article className="rounded-md border border-cyan-500/15 bg-slate-950/60 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          <AlertCircle className="h-3 w-3" />
          {category}
        </p>
        {(upvotes !== null || count !== null) && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {upvotes !== null && (
              <>
                <strong className="text-zinc-200">{upvotes}</strong> upvotes
              </>
            )}
            {upvotes !== null && count !== null && ' · '}
            {count !== null && (
              <>
                <strong className="text-zinc-200">{count}</strong> mentions
              </>
            )}
          </span>
        )}
      </header>
      {quote && (
        <blockquote className="mt-4 border-l-2 border-cyan-400/70 bg-slate-900/70 px-4 py-3">
          <p className="flex gap-2 text-sm italic leading-relaxed text-zinc-200">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
            <span>“{quote}”</span>
          </p>
        </blockquote>
      )}
      <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <cite className="not-italic">
          <span className="text-cyan-500/80">External evidence:</span>{' '}
          {threadTitle ? `${source} — ${threadTitle}` : source}
        </cite>
        {threadUrl && (
          <a
            href={threadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-300/80 hover:text-cyan-200"
          >
            View thread
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </footer>
    </article>
  )
}

function StrategicAngleCard({ row }: { row: Record<string, unknown> }) {
  const angle = row as StrategicAngle
  const title = asString(angle.title) ?? asString(angle.positioning) ?? 'Angle'
  const description = asString(angle.description)

  return (
    <div className="rounded-md border border-indigo-500/30 bg-slate-950/60 p-4">
      <p className={cn('font-serif text-base font-bold text-indigo-200', INDIGO_GLOW)}>
        {title}
      </p>
      {description && (
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          {description}
        </p>
      )}
    </div>
  )
}

// ---- Main template -------------------------------------------------------

export function BattlefieldTemplate({ report }: TemplateProps) {
  const payload = extractPayload(report) as BattlefieldPayload

  const competitorMap = isRecord(payload.module_01_competitor_map)
    ? (payload.module_01_competitor_map as CompetitorMapModule)
    : {}
  const pricingModule = isRecord(payload.module_02_pricing_intelligence)
    ? (payload.module_02_pricing_intelligence as PricingIntelligenceModule)
    : {}
  const featureModule = isRecord(payload.module_03_feature_matrix)
    ? (payload.module_03_feature_matrix as FeatureMatrixModule)
    : {}
  const complaintModule = isRecord(payload.module_04_complaint_miner)
    ? (payload.module_04_complaint_miner as ComplaintMinerModule)
    : {}
  const strategicModule = isRecord(payload.module_05_strategic_angles)
    ? (payload.module_05_strategic_angles as StrategicAnglesModule)
    : {}
  const verdictModule = isRecord(payload.module_07_verdict)
    ? (payload.module_07_verdict as VerdictModule)
    : {}

  const whitespaceScore = asNumber(verdictModule.whitespace_score)
  const marketVerdict = asString(verdictModule.market_verdict)
  const buildVsWait = asString(verdictModule.build_vs_wait)
  const geoCoverageScore = asNumber(verdictModule.geo_coverage_score)
  const keywordArbitrageScore = asNumber(verdictModule.keyword_arbitrage_score)

  const competitors = asArrayOfRecords(competitorMap.competitors)
  const totalCompetitors =
    asNumber(competitorMap.total_competitors) ?? competitors.length

  const dominantModel = asString(pricingModule.dominant_model)
  const pricingLadder = asArrayOfRecords(pricingModule.pricing_ladder)
  const unoccupiedTiers = asStringArray(pricingModule.unoccupied_tiers)
  const unoccupiedSet = new Set(unoccupiedTiers.map((t) => t.toLowerCase()))

  const whitespaceFeatures = asArrayOfRecords(featureModule.whitespace_features)
  const topComplaints = asArrayOfRecords(complaintModule.top_complaints)
  const strategicAngles = asArrayOfRecords(
    strategicModule.angles ?? strategicModule.positioning_angles
  )

  return (
    <article className="space-y-10 text-slate-100 max-w-5xl mx-auto">
      <header className="space-y-3">
        <p
          className={cn(
            'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-500/90',
            CYAN_GLOW
          )}
        >
          <Crosshair className="h-3.5 w-3.5" />
          Digital Battlefield
        </p>
        <h1
          className={cn(
            'font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-5xl',
            INDIGO_GLOW
          )}
        >
          {report.title}
        </h1>
        {report.forensicVerdict && (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
            {report.forensicVerdict}
          </p>
        )}
      </header>

      {/* Module 1: Engine Summary & ScoreGauge */}
      <section className={SECTION_BASE}>
        <h2 className={SECTION_HEADING}>Engine Summary</h2>

        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center">
            <ScoreGauge score={whitespaceScore} />
          </div>

          <div className="space-y-5">
            {marketVerdict && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-500/80">
                  Market Verdict
                </p>
                <p
                  className={cn(
                    'mt-2 font-serif text-xl font-bold text-zinc-50 md:text-2xl',
                    CYAN_GLOW
                  )}
                >
                  {marketVerdict}
                </p>
              </div>
            )}

            {buildVsWait && (
              <div className="rounded-md border border-indigo-500/30 bg-indigo-500/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300">
                  Build vs Wait
                </p>
                <p
                  className={cn(
                    'mt-1 text-sm leading-relaxed text-zinc-100',
                    INDIGO_GLOW
                  )}
                >
                  {buildVsWait}
                </p>
              </div>
            )}

            {(geoCoverageScore !== null || keywordArbitrageScore !== null) && (
              <div className="flex flex-wrap gap-6 border-t border-cyan-500/10 pt-5">
                {geoCoverageScore !== null && (
                  <ScoreRing
                    score={Math.round(geoCoverageScore)}
                    size={84}
                    strokeWidth={7}
                    color="#22d3ee"
                    label="GEO Coverage"
                    sublabel="/100"
                  />
                )}
                {keywordArbitrageScore !== null && (
                  <ScoreRing
                    score={Math.round(keywordArbitrageScore)}
                    size={84}
                    strokeWidth={7}
                    color="#818cf8"
                    label="Keyword Arbitrage"
                    sublabel="/100"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Module 2: Competitor Map */}
      <section className={SECTION_BASE}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className={cn(SECTION_HEADING, 'mb-0')}>Competitor Map</h2>
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <Globe className="h-3 w-3 text-cyan-400" />
            <strong className="font-serif text-zinc-200">
              {totalCompetitors}
            </strong>{' '}
            tracked
          </span>
        </div>

        {competitors.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Competitor intelligence not yet populated for this market.
          </p>
        ) : (
          <ul className="divide-y divide-cyan-500/10">
            {competitors.map((row, index) => (
              <CompetitorRow key={`${asString(row.name) ?? 'comp'}-${index}`} row={row} />
            ))}
          </ul>
        )}
      </section>

      {/* Module 3: Pricing Intelligence */}
      <section className={SECTION_BASE}>
        <h2 className={SECTION_HEADING}>Pricing Intelligence</h2>

        {dominantModel && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-500/80">
              Dominant Model
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3 py-1 font-serif text-sm font-bold text-cyan-200',
                CYAN_GLOW
              )}
            >
              <Tags className="h-3.5 w-3.5" />
              {dominantModel}
            </span>
          </div>
        )}

        {pricingLadder.length === 0 ? (
          <p className="text-sm text-zinc-500">Pricing ladder not provided.</p>
        ) : (
          <ol className="space-y-2">
            {pricingLadder.map((row, index) => (
              <PricingLadderItem
                key={`${asString(row.tier) ?? 'tier'}-${index}`}
                row={row}
                unoccupiedSet={unoccupiedSet}
              />
            ))}
          </ol>
        )}

        {unoccupiedTiers.length > 0 && (
          <p className="mt-5 text-[11px] leading-relaxed text-amber-200/90">
            <strong className="text-amber-300">Unoccupied opportunity tiers:</strong>{' '}
            {unoccupiedTiers.join(' · ')}
          </p>
        )}
      </section>

      {/* Conversion Blur: Feature Matrix, Complaint Miner, Strategic Angles */}
      <div className="relative">
        <div className="space-y-10">
          {/* Module 4a: Feature Matrix */}
          <section className={SECTION_BASE}>
            <h2 className={SECTION_HEADING}>Feature Matrix · Whitespace</h2>

            {whitespaceFeatures.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Feature whitespace analysis is unlocked in the full audit.
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {whitespaceFeatures.map((row, index) => (
                  <WhitespaceFeatureItem
                    key={`${asString(row.feature) ?? 'feat'}-${index}`}
                    row={row}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Module 4b: Complaint Miner */}
          <section className={SECTION_BASE}>
            <h2 className={SECTION_HEADING}>Complaint Miner</h2>

            {topComplaints.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Live complaint mining is unlocked in the full audit.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {topComplaints.map((row, index) => (
                  <ComplaintQuote
                    key={`${asString(row.category) ?? 'comp'}-${index}`}
                    row={row}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Module 5: Strategic Angles */}
          <section className={SECTION_BASE}>
            <h2 className={SECTION_HEADING}>Strategic Angles</h2>

            {strategicAngles.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Positioning angles unlock with the full forensic audit.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {strategicAngles.map((row, index) => (
                  <StrategicAngleCard
                    key={`${asString(row.title) ?? 'angle'}-${index}`}
                    row={row}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-16">
          <form
            action="https://app.valifye.com"
            method="get"
            target="_blank"
            rel="noopener noreferrer"
          >
            <input
              type="hidden"
              name="ref"
              value={`showcase_battlefield_${report.slug}`}
            />
            <ValifyeButton
              size="xl"
              variant="cyan"
              type="submit"
              className="font-mono uppercase tracking-[0.22em]"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Unlock the Full Competitive Battlefield for $49 →
              <Zap className="ml-2 h-4 w-4" />
            </ValifyeButton>
          </form>
        </div>
      </div>
    </article>
  )
}
