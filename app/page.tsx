import { Fragment } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ValifyeNavbar } from '@/components/valifye-navbar'
import { ValifyeFooter } from '@/components/valifye-footer'
import HeroSection from '@/components/hero-section'
import { FaqAccordion } from '@/components/faq-accordion'
import { SITE_URL } from '@/lib/seo'
import { getLatestIdeas } from '@/lib/marketData'
import { getLatestReports } from '@/lib/reportData'
import { getAllShowcaseReports, type ShowcaseTemplate } from '@/lib/marketingShowcase'
import {
  getLatestLocalOpportunitySlug,
  getLatestMarketSaturationSlug,
  getLatestProfitableNicheSlug,
  getLatestSaasVerticalSlug,
  getLatestShouldIBuildSlug,
  getLatestValidationGuideSlug,
} from '@/lib/pseo-queries'
import { localOpportunityPath } from '@/lib/localOpportunityData'
import { marketSaturationPath } from '@/lib/marketSaturationData'
import { profitableNichePath } from '@/lib/profitableNicheData'
import { saasIdeasVerticalPath } from '@/lib/saasIdeasVerticalData'
import { shouldIBuildPath } from '@/lib/shouldIBuildData'
import { validationGuidePath } from '@/lib/validationGuideData'

export const metadata: Metadata = {
  title: 'Valifye | Forensic Market Intelligence Engine for Founders',
  description:
    'Valifye runs forensic audits on micro-SaaS and business niches — competitor mapping, demand signals, pricing gaps — and returns a BUILD, PIVOT, or KILL verdict before you waste a quarter building the wrong thing.',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: 'Valifye | Forensic Market Intelligence Engine',
    description:
      'Get a BUILD / PIVOT / KILL verdict on any micro-SaaS niche. Forensic competitor analysis, demand signals, and pricing gap data — not opinions.',
    url: SITE_URL,
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valifye | Forensic Market Intelligence',
    description: 'BUILD / PIVOT / KILL verdicts for founders. Stop guessing.',
  },
}

const SIGNAL_STATS = [
  { stat: '500+', label: 'Niches Analyzed' },
  { stat: '4', label: 'Intelligence Engines' },
  { stat: '6', label: 'Cities Covered' },
  { stat: '3', label: 'Verdict Types' },
  { stat: '4', label: 'Free Tools' },
] as const

const ENGINES = [
  {
    tag: 'Engine 01 · Ideas',
    name: 'Market Ideas Database',
    href: '/ideas',
    description:
      'Browse 500+ pre-analyzed business niches. Each idea carries a Whitespace Score, a competitive density rating, and a demand signal — scored before you commit a single hour.',
    samples: ['B2B SaaS', 'Franchise', 'Local Service', 'E-commerce', 'D2C'],
    cta: 'BROWSE IDEAS',
  },
  {
    tag: 'Engine 02 · Verdict Reports',
    name: 'Forensic Verdict Reports',
    href: '/reports',
    description:
      'Full-length forensic reports on specific niches. Competitor stack, pricing architecture, demand curve, risk factors, and a survival checklist — all in one document.',
    samples: ['Competitor Map', 'Pricing Gaps', 'Demand Curve', 'Risk Factors'],
    cta: 'READ REPORTS',
  },
  {
    tag: 'Engine 03 · Local Intelligence',
    name: 'Local Market Reports',
    href: '/local-reports',
    description:
      'City-level forensic data. The same niche behaves differently in Austin versus London. Valifye maps that friction — labor costs, tax structures, local competition density.',
    samples: ['Austin TX', 'Miami FL', 'London UK', 'Denver CO', 'Nashville TN'],
    cta: 'EXPLORE LOCAL REPORTS',
  },
  {
    tag: 'Engine 04 · Blueprints',
    name: 'Market Blueprints',
    href: '/markets',
    description:
      'Region × Sector × Business Model combinations — pre-built intelligence blueprints for the most common founder decisions. Find your exact scenario and start from validated data.',
    samples: ['USA · Food & Bev', 'UK · SaaS', 'Atlanta · Franchise', 'Denver · Retail'],
    cta: 'VIEW BLUEPRINTS',
  },
] as const

function resolveSettledSlug(result: PromiseSettledResult<string>, fallback: string): string {
  if (result.status === 'fulfilled' && result.value.trim()) {
    return result.value.trim()
  }
  return fallback
}

function buildDeepDiveScans(slugs: {
  profitable: string
  vertical: string
  saturation: string
  shouldBuild: string
  validation: string
  local: string
}) {
  return [
    {
      tag: 'PROFITABILITY',
      name: 'Niche Monetization Checks',
      description:
        'Granular cost-to-fee breakdowns verifying if a vertical can support a bootstrapping founder.',
      href: profitableNichePath(slugs.profitable),
      cta: 'VIEW PROFITABILITY SCAN',
    },
    {
      tag: 'IDEATION',
      name: 'SaaS Vertical Playbooks',
      description:
        'Aggregated sub-niche application ideas engineered around specific industry friction points.',
      href: saasIdeasVerticalPath(slugs.vertical),
      cta: 'BROWSE VERTICAL IDEAS',
    },
    {
      tag: 'COMPETITION',
      name: 'Market Saturation Audits',
      description:
        'Crowding density and defensive positioning metrics mapping alternative solutions.',
      href: marketSaturationPath(slugs.saturation),
      cta: 'CHECK SATURATION',
    },
    {
      tag: 'DECISION ENGINE',
      name: 'Build / Pivot / Kill Matrix',
      description: 'Core risk assessments analyzing if an idea justifies development overhead.',
      href: shouldIBuildPath(slugs.shouldBuild),
      cta: 'GET VERDICT',
    },
    {
      tag: 'PLAYBOOKS',
      name: 'Validation Execution Guides',
      description:
        'Step-by-step instructions on setting up smoke tests, landed message testing, and pre-sales.',
      href: validationGuidePath(slugs.validation),
      cta: 'READ PLAYBOOK',
    },
    {
      tag: 'LOCALIZED',
      name: 'Regional Opportunity Maps',
      description: 'Regional business clusters matching hyper-local business demand gaps.',
      href: localOpportunityPath(slugs.local),
      cta: 'EXPLORE LOCAL MAP',
    },
  ] as const
}

const VERDICTS = [
  {
    verdict: 'BUILD',
    color: '#22c55e',
    borderColor: 'border-[#22c55e]/30',
    bgGlow: 'bg-[#22c55e]/5',
    description:
      'The market has measurable whitespace, manageable competition, and validated demand signals. Capital requirements are reasonable relative to the opportunity size. Valifye scores this niche as worth serious investment of time and resources.',
    signals: ['Whitespace Score ≥ 7.0', 'Competition: Fragmented', 'Demand: Rising or Stable'],
  },
  {
    verdict: 'PIVOT',
    color: '#f5a623',
    borderColor: 'border-[#f5a623]/30',
    bgGlow: 'bg-[#f5a623]/5',
    description:
      'The core niche is contested or oversaturated, but adjacent opportunities exist. Valifye identifies the pivot angle — a different business model, geography, or customer segment that unlocks the whitespace.',
    signals: ['Whitespace Score 4.0–6.9', 'Competition: Concentrated', 'Adjacent Angle: Identified'],
  },
  {
    verdict: 'KILL',
    color: '#ef4444',
    borderColor: 'border-[#ef4444]/30',
    bgGlow: 'bg-[#ef4444]/5',
    description:
      'The market is either structurally unattractive, dominated by incumbents with deep moats, or the demand signals do not justify entry capital. Valifye scores this as a capital destruction scenario.',
    signals: ['Whitespace Score < 4.0', 'Competition: Entrenched', 'Demand: Declining or Artificial'],
  },
] as const

const TOOLS = [
  {
    slug: 'delivery-calculator',
    title: 'Delivery Margin Calculator',
    description: 'Know your real unit economics after platform fees, packaging, and last-mile costs.',
    icon: '📦',
    color: 'hover:border-[#22c55e]/40',
    ctaColor: 'text-[#22c55e]',
  },
  {
    slug: 'sba-loan-scanner',
    title: 'SBA Loan Scanner',
    description: 'Pre-qualify your business model against SBA eligibility parameters in 60 seconds.',
    icon: '🏦',
    color: 'hover:border-[#22c55e]/40',
    ctaColor: 'text-[#22c55e]',
  },
  {
    slug: 'franchise-profit-simulator',
    title: 'Franchise Profit Simulator',
    description: 'Model royalties, COGS, and territory fees to find the real break-even point.',
    icon: '📊',
    color: 'hover:border-[#22c55e]/40',
    ctaColor: 'text-[#22c55e]',
  },
  {
    slug: 'uk-vat-cliff-scanner',
    title: 'UK VAT Cliff Scanner',
    description: 'Find the exact revenue point where crossing £85k destroys your margin model.',
    icon: '🇬🇧',
    color: 'hover:border-[#22c55e]/40',
    ctaColor: 'text-[#22c55e]',
  },
] as const

const FAQS = [
  {
    q: 'What is Valifye?',
    a: 'Valifye is a forensic market intelligence platform built for indie founders and micro-SaaS builders. It analyzes business niches across six dimensions — competitor density, pricing gaps, demand signals, local friction, capital requirements, and unit economics — and returns a BUILD, PIVOT, or KILL verdict on each opportunity.',
  },
  {
    q: 'What is a BUILD / PIVOT / KILL verdict?',
    a: 'A BUILD verdict means the market has measurable whitespace, fragmented competition, and validated demand. A PIVOT verdict means the core niche is contested but an adjacent opportunity exists. A KILL verdict means the market is structurally unattractive, dominated by entrenched players, or demand signals do not justify entry capital.',
  },
  {
    q: 'How is Valifye different from a business idea generator?',
    a: 'Valifye does not generate ideas. It forensically audits specific niches using structured data — the same methodology used by market research firms. Every report includes real competitor data, pricing architecture analysis, demand curve modeling, and a city-level friction assessment, not a list of generic suggestions.',
  },
  {
    q: 'Is Valifye free to use?',
    a: 'Valifye offers free access to its Ideas database, Local Reports, and all four founder tools (Delivery Margin Calculator, SBA Loan Scanner, Franchise Profit Simulator, UK VAT Cliff Scanner). Full forensic audit reports and Market Blueprints require a paid plan.',
  },
  {
    q: 'What is a Whitespace Score?',
    a: "The Whitespace Score is Valifye's proprietary metric — a 0–10 rating of the uncontested opportunity in a given market. A score of 7+ indicates meaningful whitespace. A score below 4 indicates a saturated or structurally unattractive market. The score synthesizes competitor density, pricing gaps, and demand signal data.",
  },
  {
    q: 'What cities does Valifye cover for local market intelligence?',
    a: 'Valifye currently covers Austin (TX), Miami (FL), London (UK), Denver (CO), Seattle (WA), and Nashville (TN) for city-level forensic reports. New cities are added with each major data release.',
  },
  {
    q: 'Can I use Valifye to research franchise opportunities?',
    a: "Yes. Valifye's Market Blueprints and forensic reports cover franchise models across multiple sectors. The Franchise Profit Simulator tool specifically models unit economics for franchise decisions — royalties, COGS, territory fees, and break-even timelines.",
  },
  {
    q: 'What is a Forensic Market Audit?',
    a: "A Forensic Market Audit is Valifye's structured analysis process. It applies six scoring dimensions to a business niche: competitive density, pricing gap analysis, demand signal strength, local market friction, capital requirement modeling, and unit economics viability. The output is a full intelligence report ending in a BUILD, PIVOT, or KILL verdict.",
  },
] as const

const SHOWCASE_TEMPLATE_LABEL: Record<ShowcaseTemplate, string> = {
  scout: 'Local Scout',
  scout_pivot: 'Local Recovery',
  battlefield: 'Digital Battlefield',
  pivot: 'Pivot Playbook',
  arsenal: 'Execution Arsenal',
  risk: 'Risk Register',
}

function excerpt(text: string, max: number) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export default async function HomePage() {
  const [latestIdeas, latestReports, showcaseReports, pseoSlugResults] = await Promise.all([
    getLatestIdeas(3),
    getLatestReports(3),
    getAllShowcaseReports(),
    Promise.allSettled([
      getLatestProfitableNicheSlug(),
      getLatestSaasVerticalSlug(),
      getLatestMarketSaturationSlug(),
      getLatestShouldIBuildSlug(),
      getLatestValidationGuideSlug(),
      getLatestLocalOpportunitySlug(),
    ]),
  ])
  const featuredShowcase = showcaseReports.slice(0, 3)

  const [
    profitableSlugResult,
    verticalSlugResult,
    saturationSlugResult,
    shouldBuildSlugResult,
    validationSlugResult,
    localSlugResult,
  ] = pseoSlugResults

  const deepDiveScans = buildDeepDiveScans({
    profitable: resolveSettledSlug(profitableSlugResult, 'saas'),
    vertical: resolveSettledSlug(verticalSlugResult, 'saas'),
    saturation: resolveSettledSlug(saturationSlugResult, 'marketing'),
    shouldBuild: resolveSettledSlug(shouldBuildSlugResult, 'saas'),
    validation: resolveSettledSlug(validationSlugResult, 'marketing'),
    local: resolveSettledSlug(localSlugResult, 'retail'),
  })

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Valifye',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    description:
      'Forensic market intelligence engine for founders. Analyzes business niches and returns BUILD, PIVOT, or KILL verdicts based on competitor data, demand signals, and unit economics.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free access to Ideas database, Local Reports, and Founder Tools',
    },
    featureList: [
      'Market niche forensic analysis',
      'BUILD / PIVOT / KILL verdicts',
      'Competitor density mapping',
      'Pricing gap analysis',
      'Demand signal scoring',
      'City-level market friction reports',
      'Free founder calculators',
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-foreground antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <ValifyeNavbar />

      <HeroSection />

      <section className="overflow-x-auto border-y border-[#1f2937] bg-[#0d0d0d] py-3">
        <div className="flex items-center justify-center gap-6 whitespace-nowrap px-6">
          {SIGNAL_STATS.map((item, i, arr) => (
            <Fragment key={item.label}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-[#f5a623]">{item.stat}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#6b7280]">
                  {item.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <span className="select-none text-lg text-[#1f2937]" aria-hidden>
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5a623]">
            WHAT IS VALIFYE
          </p>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-black text-white md:text-4xl">
                A Forensic Intelligence Engine. Not a Business Idea Generator.
              </h2>
              <div className="max-w-prose space-y-4 text-base leading-relaxed text-[#9ca3af]">
                <p>
                  Valifye applies structured forensic analysis to business niches — the same methodology used by
                  market research firms, applied to the decisions indie founders actually face: should I build this,
                  pivot my model, or kill the idea?
                </p>
                <p>
                  Every niche in the Valifye database has been analyzed across six forensic dimensions: competitor
                  density, pricing gaps, demand signal strength, local market friction, capital requirements, and unit
                  economics viability.
                </p>
                <p>The output is not a business plan. It is a verdict.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  n: '01',
                  title: 'Pick a niche or enter your idea',
                  body: 'Browse 500+ pre-analyzed ideas or submit your own for a live forensic audit. The engine scores it across six dimensions immediately.',
                },
                {
                  n: '02',
                  title: 'Forensic analysis runs automatically',
                  body: 'Competitor mapping, demand signal weighting, pricing gap detection, and local market friction — all synthesized into a single intelligence report.',
                },
                {
                  n: '03',
                  title: 'Get a BUILD / PIVOT / KILL verdict',
                  body: 'Every report ends with a clear verdict and a survival checklist. No opinions. No filler. Actionable forensic intelligence only.',
                },
              ].map((step) => (
                <div key={step.n} className="rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5">
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5a623] font-mono text-sm font-black text-black">
                    {step.n}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6b7280]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-3xl font-black text-white md:text-4xl">Four Engines. One Verdict.</h2>
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
            Every surface inside Valifye is built to answer one question: is this market worth your next 12 months?
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ENGINES.map((engine) => (
              <Link
                key={engine.href}
                href={engine.href}
                className="group relative block overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0d0d0d] p-7 transition-all duration-200 hover:border-[#f5a623]/40 hover:bg-[#111111]"
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#f5a623]/5 blur-2xl" />
                <p className="relative mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5a623]">
                  {engine.tag}
                </p>
                <h3 className="relative mb-2 text-2xl font-black text-white transition-colors group-hover:text-[#f5a623]">
                  {engine.name}
                </h3>
                <p className="relative mb-5 text-sm leading-relaxed text-[#6b7280]">{engine.description}</p>
                <div className="relative mb-5 flex flex-wrap gap-2">
                  {engine.samples.map((s) => (
                    <span
                      key={s}
                      className="rounded px-2 py-1 font-mono text-[10px] tracking-wide text-[#9ca3af] bg-[#1f2937]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="relative flex items-center gap-1 font-mono text-[11px] tracking-wide text-[#f5a623]">
                  {engine.cta}{' '}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-3xl font-black text-white md:text-4xl">On-Demand Market Intelligence</h2>
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
            Six answer-first forensic scans — profitability, saturation, build decisions, validation playbooks, and
            regional opportunity maps. Each links to a live published report.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deepDiveScans.map((scan) => (
              <Link
                key={scan.href}
                href={scan.href}
                className="group relative block overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0d0d0d] p-7 transition-all duration-200 hover:border-[#f5a623]/40 hover:bg-[#111111]"
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#f5a623]/5 blur-2xl" />
                <p className="relative mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5a623]">
                  {scan.tag}
                </p>
                <h3 className="relative mb-2 text-2xl font-black text-white transition-colors group-hover:text-[#f5a623]">
                  {scan.name}
                </h3>
                <p className="relative mb-5 text-sm leading-relaxed text-[#6b7280]">{scan.description}</p>
                <div className="relative flex items-center gap-1 font-mono text-[11px] tracking-wide text-[#f5a623]">
                  {scan.cta}{' '}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-3xl font-black text-white md:text-4xl">
            The Verdict System — How Valifye Scores a Market
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {VERDICTS.map((v) => (
              <div
                key={v.verdict}
                className={`relative overflow-hidden rounded-2xl border ${v.borderColor} bg-[#0d0d0d] p-7`}
              >
                <div className={`absolute inset-0 ${v.bgGlow} opacity-30`} />
                <div className="relative">
                  <span
                    className="mb-4 inline-block font-mono text-2xl font-black tracking-[0.1em]"
                    style={{ color: v.color }}
                  >
                    {v.verdict}
                  </span>
                  <p className="mb-5 text-sm leading-relaxed text-[#9ca3af]">{v.description}</p>
                  <div className="space-y-2">
                    {v.signals.map((signal) => (
                      <div key={signal} className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: v.color }}
                        />
                        <span className="font-mono text-[11px] tracking-wide text-[#6b7280]">{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="founders-lounge-cta-heading"
        className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-[#f5a623]/50 via-[#22c55e]/30 to-[#f5a623]/20">
            <div className="relative rounded-[15px] bg-[#0d0d0d] px-6 py-12 md:px-12 md:py-16">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.08)_0%,_transparent_50%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,166,35,0.08)_0%,_transparent_50%)]"
                aria-hidden
              />
              <div className="relative mx-auto max-w-3xl text-center">
                <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#22c55e]">
                  Valifye Founders Lounge
                </p>
                <h2
                  id="founders-lounge-cta-heading"
                  className="text-balance text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl"
                >
                  Build in Public. Without the Toxicity.
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#9ca3af] md:text-lg">
                  Join 1,000+ vibe-coders and indie hackers in the Valifye Founders Lounge. Exchange feedback,
                  unlock autonomous market scans, and launch your SaaS without fighting auto-moderators.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/community"
                    className="inline-flex items-center justify-center rounded-full bg-[#22c55e] px-8 py-3.5 font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-black transition hover:bg-[#22c55e]/90"
                  >
                    Enter the Lounge
                  </Link>
                  <Link
                    href="/founders-lounge"
                    className="inline-flex items-center justify-center rounded-full border border-[#374151] px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#f5a623] hover:text-[#f5a623]"
                  >
                    How the Karma System Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-black text-white md:text-4xl">Latest Intelligence</h2>
            <Link
              href="/ideas"
              className="font-mono text-[11px] tracking-wide text-[#f5a623] transition-colors hover:text-[#f5a623]/90"
            >
              VIEW ALL →
            </Link>
          </div>

          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">Recent Ideas</p>
          {latestIdeas.length === 0 ? (
            <p className="mb-12 text-sm text-[#6b7280]">No published ideas yet.</p>
          ) : (
            <div className="mb-12 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
              {latestIdeas.map((idea) => (
                <Link
                  key={idea.slug}
                  href={`/ideas/${idea.slug}`}
                  className="group min-w-[260px] flex-shrink-0 rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5 transition-all hover:border-[#f5a623]/30 md:min-w-0"
                >
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#6b7280]">
                    {idea.city ?? 'Global'}
                  </p>
                  <h4 className="mb-3 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-[#f5a623]">
                    {idea.meta_title ?? idea.niche}
                  </h4>
                  {idea.whitespace_score != null && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-[#6b7280]">
                        Whitespace
                      </span>
                      <span className="font-mono text-sm font-bold text-[#f5a623]">
                        {idea.whitespace_score}/10
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b7280]">Recent Reports</p>
          {latestReports.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No published reports yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
              {latestReports.map((report) => (
                <Link
                  key={report.slug}
                  href={`/reports/${report.slug}`}
                  className="group min-w-[260px] flex-shrink-0 rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5 transition-all hover:border-[#f5a623]/30 md:min-w-0"
                >
                  <span
                    className={`mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] font-black tracking-wider ${
                      report.verdict === 'BUILD'
                        ? 'bg-[#22c55e] text-black'
                        : report.verdict === 'KILL'
                          ? 'bg-[#ef4444] text-black'
                          : 'bg-[#f5a623] text-black'
                    }`}
                  >
                    {report.verdict}
                  </span>
                  <h4 className="line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-[#f5a623]">
                    {report.meta_title ?? report.idea_title}
                  </h4>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-3xl font-black text-white md:text-4xl">Free Founder Tools — No Signup Required</h2>
          <p className="mb-10 text-sm text-[#6b7280] md:text-base">
            Four calculators built for the decisions that happen before you build.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={`group block rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5 transition-all duration-200 ${tool.color}`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-black bg-[#22c55e]">
                    FREE
                  </span>
                </div>
                <h3 className="mb-2 text-base font-bold text-white transition-colors group-hover:text-[#22c55e]">
                  {tool.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[#6b7280]">{tool.description}</p>
                <span
                  className={`flex items-center gap-1 font-mono text-[11px] tracking-wide ${tool.ctaColor}`}
                >
                  OPEN TOOL{' '}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-3xl font-black text-white md:text-4xl">Real Reports. Anonymized. Live.</h2>
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-[#6b7280] md:text-base">
            These are actual Valifye forensic reports — the same output you get when you run an audit.
          </p>
          {featuredShowcase.length === 0 ? (
            <p className="text-sm text-[#6b7280]">Showcase reports will appear here once published.</p>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
                {featuredShowcase.map((report) => (
                  <Link
                    key={report.slug}
                    href={`/showcase/${report.slug}`}
                    className="group min-w-[280px] flex-shrink-0 rounded-xl border border-[#1f2937] bg-[#0d0d0d] p-5 transition-all hover:border-[#f5a623]/30 md:min-w-0"
                  >
                    <span className="mb-3 inline-block rounded px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-black bg-[#f5a623]/90">
                      {SHOWCASE_TEMPLATE_LABEL[report.template]}
                    </span>
                    <h4 className="mb-2 line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-[#f5a623]">
                      {report.title}
                    </h4>
                    <p className="line-clamp-3 text-sm leading-relaxed text-[#6b7280]">
                      {excerpt(report.forensicVerdict, 160)}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center md:text-left">
                <Link
                  href="/showcase"
                  className="font-mono text-[11px] tracking-wide text-[#f5a623] transition-colors hover:text-[#f5a623]/90"
                >
                  SEE ALL REPORTS →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-[#1f2937] bg-[#0a0a0a] px-6 py-20 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-3xl font-black text-white md:text-4xl">Frequently Asked Questions</h2>
          <FaqAccordion faqs={[...FAQS]} />
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#1f2937] px-6 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(245,166,35,0.06),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b7280]">
            Stop Guessing. Start Auditing.
          </p>
          <h2 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl">
            Your next idea deserves
            <br />
            forensic intelligence.
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-[#9ca3af]">
            Not opinions. Not guru frameworks. Real competitor data, real demand signals, and a verdict you can act on
            today.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/ideas"
              className="rounded-full bg-[#f5a623] px-8 py-3.5 font-mono text-sm font-bold tracking-wide text-black transition hover:bg-[#f5a623]/90"
            >
              BROWSE IDEAS — FREE →
            </Link>
            <Link
              href="/reports"
              className="rounded-full border border-[#1f2937] px-8 py-3.5 font-mono text-sm tracking-wide text-white transition hover:border-[#f5a623]/40 hover:text-[#f5a623]"
            >
              READ A REPORT
            </Link>
          </div>
        </div>
      </section>

      <ValifyeFooter />
    </div>
  )
}
