import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getIdeaBySlug } from '@/lib/marketData'
import {
  buildVerdictsHubPath,
  localOpportunitiesHubPath,
  localOpportunityPath,
  profitableNicheHubPath,
  profitableNichePath,
  saasIdeasVerticalHubPath,
  saasIdeasVerticalPath,
  shouldIBuildPath,
  validationGuideHubPath,
  validationGuidePath,
} from '@/lib/pseoPaths'
import {
  isPseoSlugPublished,
  isValidToolSlug,
  type PseoRegistrySection,
} from '@/lib/pseoSlugRegistry'

export type RelatedIntelligencePageType =
  | 'profitable'
  | 'vertical'
  | 'saturation'
  | 'should-build'
  | 'validation'
  | 'local'

export interface RelatedIntelligenceProps {
  relatedIdeaSlugs: string[]
  relatedToolSlugs: string[]
  currentPageType: RelatedIntelligencePageType
  currentSlug?: string
  cityOrNiche?: string
  contentIdeaSlugs?: string[]
  suggestedVerticalSlugs?: string[]
}

type NavLink = {
  href: string
  label: string
  isFreeTool?: boolean
}

type CrossLink = {
  href: string
  label: string
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'delivery-calculator': 'Delivery Margin Calculator',
  'sba-loan-scanner': 'SBA Loan Scanner',
  'franchise-profit-simulator': 'Franchise Profit Simulator',
  'uk-vat-cliff-scanner': 'UK VAT Cliff Scanner',
  'local-scout': 'Local Market Scout',
  'aeo-scanner': 'AEO Shadow Scanner',
  'build-pivot-kill': 'Build / Pivot / Kill Analyst',
}

const FALLBACK_DEEP_DIVE_LINKS: NavLink[] = [
  { href: '/ideas', label: 'Browse Ideas Database' },
  { href: '/reports', label: 'Forensic Verdict Reports' },
  { href: '/markets', label: 'Market Blueprints' },
]

const FALLBACK_TOOL_LINKS: NavLink[] = [
  { href: '/tools/build-pivot-kill', label: 'Build / Pivot / Kill Analyst', isFreeTool: true },
  { href: '/tools/delivery-calculator', label: 'Delivery Margin Calculator', isFreeTool: true },
  { href: '/tools/aeo-scanner', label: 'AEO Shadow Scanner', isFreeTool: true },
]

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getToolDisplayName(slug: string): string {
  return TOOL_DISPLAY_NAMES[slug] ?? slugToTitle(slug)
}

function resolveSpokeOrHub(
  section: PseoRegistrySection,
  slug: string | undefined,
  spokePath: (slug: string) => string,
  hubPath: () => string,
  spokeLabel: (slug: string) => string,
  hubLabel: string
): CrossLink {
  const clean = slug?.trim()
  if (clean && isPseoSlugPublished(section, clean)) {
    return { href: spokePath(clean), label: spokeLabel(clean) }
  }
  return { href: hubPath(), label: hubLabel }
}

async function resolveValidatedIdeaLinks(slugs: string[]): Promise<NavLink[]> {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))]
  const links: NavLink[] = []

  for (const slug of unique) {
    const idea = await getIdeaBySlug(slug)
    if (!idea) continue
    const label =
      idea.niche && idea.city
        ? `${idea.niche} in ${idea.city}`
        : idea.niche || slugToTitle(slug)
    links.push({ href: `/ideas/${slug}`, label })
  }

  return links
}

function resolveValidatedToolLinks(slugs: string[]): NavLink[] {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))]
  return unique
    .filter(isValidToolSlug)
    .map((slug) => ({
      href: `/tools/${slug}`,
      label: getToolDisplayName(slug),
      isFreeTool: true,
    }))
}

function pickProfitableCandidateSlugs(props: RelatedIntelligenceProps): string[] {
  const candidates = [
    ...(props.contentIdeaSlugs ?? []),
    props.currentSlug,
  ].filter((s): s is string => Boolean(s?.trim()))

  return [...new Set(candidates)]
}

function buildCrossLinks(props: RelatedIntelligenceProps): CrossLink[] {
  const { currentPageType, currentSlug, cityOrNiche, suggestedVerticalSlugs } = props
  const subject = cityOrNiche || (currentSlug ? slugToTitle(currentSlug) : 'this market')
  const links: CrossLink[] = []

  switch (currentPageType) {
    case 'profitable': {
      links.push(
        resolveSpokeOrHub(
          'build-verdict',
          currentSlug,
          shouldIBuildPath,
          buildVerdictsHubPath,
          (slug) => `Should I build ${subject}?`,
          'Browse Market Build Verdicts'
        )
      )
      break
    }

    case 'vertical': {
      const profitableCandidates = pickProfitableCandidateSlugs(props)
      const matched = profitableCandidates.find((slug) =>
        isPseoSlugPublished('profitable', slug)
      )

      links.push(
        resolveSpokeOrHub(
          'profitable',
          matched ?? currentSlug,
          profitableNichePath,
          profitableNicheHubPath,
          (slug) => `Is ${slugToTitle(slug)} profitable?`,
          'Browse Profitable Niches'
        )
      )
      break
    }

    case 'saturation': {
      links.push(
        resolveSpokeOrHub(
          'build-verdict',
          currentSlug,
          shouldIBuildPath,
          buildVerdictsHubPath,
          (slug) => `Should I build in ${subject}?`,
          'Browse Market Build Verdicts'
        )
      )
      break
    }

    case 'should-build': {
      links.push(
        resolveSpokeOrHub(
          'profitable',
          currentSlug,
          profitableNichePath,
          profitableNicheHubPath,
          (slug) => `Is ${subject} profitable?`,
          'Browse Profitable Niches'
        )
      )
      break
    }

    case 'validation': {
      links.push({ href: '/community', label: 'Founders Lounge' })
      links.push(
        resolveSpokeOrHub(
          'validation',
          currentSlug,
          validationGuidePath,
          validationGuideHubPath,
          (slug) => slugToTitle(slug),
          'Browse Validation Guides'
        )
      )
      for (const slug of ['build-pivot-kill', 'aeo-scanner'] as const) {
        if (isValidToolSlug(slug)) {
          links.push({
            href: `/tools/${slug}`,
            label: getToolDisplayName(slug),
          })
        }
      }
      break
    }

    case 'local': {
      const verticalCandidate =
        suggestedVerticalSlugs?.find((slug) => isPseoSlugPublished('vertical', slug)) ??
        (currentSlug && isPseoSlugPublished('vertical', currentSlug) ? currentSlug : undefined)

      links.push(
        resolveSpokeOrHub(
          'vertical',
          verticalCandidate,
          saasIdeasVerticalPath,
          saasIdeasVerticalHubPath,
          (slug) => `Best SaaS ideas for ${slugToTitle(slug)}`,
          'Browse SaaS Vertical Playbooks'
        )
      )

      links.push(
        resolveSpokeOrHub(
          'local',
          currentSlug,
          localOpportunityPath,
          localOpportunitiesHubPath,
          (slug) => `Startup opportunities in ${slugToTitle(slug)}`,
          'Browse Regional Opportunity Maps'
        )
      )
      break
    }
  }

  const seen = new Set<string>()
  return links.filter((link) => {
    if (seen.has(link.href)) return false
    seen.add(link.href)
    return true
  })
}

export async function RelatedIntelligence(props: RelatedIntelligenceProps) {
  const { relatedIdeaSlugs, relatedToolSlugs, cityOrNiche, currentPageType } = props

  const validatedIdeas = await resolveValidatedIdeaLinks(relatedIdeaSlugs)
  const deepDiveLinks =
    validatedIdeas.length > 0 ? validatedIdeas : FALLBACK_DEEP_DIVE_LINKS

  const validatedTools = resolveValidatedToolLinks(relatedToolSlugs)
  const toolLinks = validatedTools.length > 0 ? validatedTools : FALLBACK_TOOL_LINKS

  const crossLinks = buildCrossLinks(props)

  return (
    <section className="space-y-8 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 md:p-8">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-black text-zinc-50 md:text-4xl">
          Related Valifye Intelligence
        </h2>
        {cityOrNiche ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Context · {cityOrNiche}
            {currentPageType ? ` · ${currentPageType.replace('-', ' ')}` : ''}
          </p>
        ) : null}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
            Deep Dive Reports
          </p>
          <ul className="space-y-2">
            {deepDiveLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 font-mono text-sm text-zinc-300 transition-colors hover:text-amber-400"
                >
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
            Free Tools
          </p>
          <ul className="space-y-2">
            {toolLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/40 px-3 py-2 font-mono text-sm text-zinc-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-200"
                >
                  <span>{item.label}</span>
                  {item.isFreeTool ? (
                    <span className="rounded border border-emerald-500/40 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-200">
                      Free
                    </span>
                  ) : null}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-400/80 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
            Community
          </p>
          <Link
            href="/community"
            className="group block rounded-lg border border-zinc-800/90 bg-zinc-900/40 p-4 transition-colors hover:border-amber-500/40"
          >
            <p className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-amber-400/90 transition-colors group-hover:text-amber-300">
              Ask This in the Founders Lounge
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Get feedback from founders who&apos;ve built in this space
            </p>
          </Link>
        </div>
      </div>

      <hr className="border-zinc-800/90" />

      <div className="space-y-4">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
          You might also be interested in
        </h3>
        <div className="flex flex-wrap gap-3">
          {crossLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700/60 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-amber-500/40 hover:text-amber-300"
            >
              {link.label}
              <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
