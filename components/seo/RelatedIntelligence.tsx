import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getIdeaBySlug } from '@/lib/marketData'
import { profitableNichePath } from '@/lib/profitableNicheData'
import { saasIdeasVerticalPath } from '@/lib/saasIdeasVerticalData'
import { shouldIBuildPath } from '@/lib/shouldIBuildData'

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
  /** Current pSEO page slug — used for cross-links between page types */
  currentSlug?: string
  /** Niche, product, city, or vertical label for contextual copy */
  cityOrNiche?: string
  /** Idea slugs from on-page content (e.g. vertical ideas list) */
  contentIdeaSlugs?: string[]
  /** Vertical slugs for local-page cross-links into SaaS vertical hubs */
  suggestedVerticalSlugs?: string[]
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'delivery-calculator': 'Delivery Margin Calculator',
  'sba-loan-scanner': 'SBA Loan Scanner',
  'franchise-profit-simulator': 'Franchise Profit Simulator',
  'uk-vat-cliff-scanner': 'UK VAT Cliff Scanner',
  'local-scout': 'Local Market Scout',
  'aeo-scanner': 'AEO Shadow Scanner',
  'build-pivot-kill': 'Build / Pivot / Kill Analyst'
}

const VALIDATION_TOOL_SUGGESTIONS = [
  'build-pivot-kill',
  'aeo-scanner',
  'local-scout',
  'delivery-calculator'
] as const

type CrossLink = {
  href: string
  label: string
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function slugifyLabel(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getToolDisplayName(slug: string): string {
  return TOOL_DISPLAY_NAMES[slug] ?? slugToTitle(slug)
}

async function resolveIdeaLabels(
  slugs: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(slugs.filter(Boolean))]
  const entries = await Promise.all(
    unique.map(async (slug) => {
      const idea = await getIdeaBySlug(slug)
      if (!idea) return [slug, slugToTitle(slug)] as const
      const label =
        idea.niche && idea.city
          ? `${idea.niche} in ${idea.city}`
          : idea.niche || slugToTitle(slug)
      return [slug, label] as const
    })
  )
  return new Map(entries)
}

function detectVerticalSlug(
  cityOrNiche?: string,
  currentSlug?: string
): string | null {
  if (cityOrNiche) {
    const slug = slugifyLabel(cityOrNiche)
    if (slug.length > 1) return slug
  }
  if (currentSlug) {
    const slug = slugifyLabel(currentSlug)
    if (slug.length > 1) return slug
  }
  return null
}

function buildCrossLinks({
  currentPageType,
  currentSlug,
  cityOrNiche,
  contentIdeaSlugs,
  suggestedVerticalSlugs,
  relatedToolSlugs
}: RelatedIntelligenceProps): CrossLink[] {
  const links: CrossLink[] = []
  const subject = cityOrNiche || (currentSlug ? slugToTitle(currentSlug) : 'this market')

  switch (currentPageType) {
    case 'profitable': {
      if (currentSlug) {
        links.push({
          href: shouldIBuildPath(currentSlug),
          label: `Should I build ${subject}?`
        })
      }
      const verticalSlug = detectVerticalSlug(cityOrNiche, currentSlug)
      if (verticalSlug) {
        links.push({
          href: saasIdeasVerticalPath(verticalSlug),
          label: `Best SaaS ideas for ${cityOrNiche || slugToTitle(verticalSlug)}`
        })
      }
      break
    }
    case 'vertical': {
      const slugs = [...new Set((contentIdeaSlugs ?? []).filter(Boolean))].slice(
        0,
        3
      )
      for (const slug of slugs) {
        links.push({
          href: profitableNichePath(slug),
          label: `Is ${slugToTitle(slug)} profitable?`
        })
      }
      break
    }
    case 'saturation': {
      if (currentSlug) {
        links.push({
          href: shouldIBuildPath(currentSlug),
          label: `Should I build in ${subject}?`
        })
      }
      break
    }
    case 'should-build': {
      if (currentSlug) {
        links.push({
          href: profitableNichePath(currentSlug),
          label: `Is ${subject} profitable?`
        })
      }
      break
    }
    case 'validation': {
      links.push({
        href: '/community',
        label: 'Founders Lounge'
      })
      const toolSlugs = VALIDATION_TOOL_SUGGESTIONS.filter(
        (slug) => !relatedToolSlugs.includes(slug)
      ).slice(0, 2)
      for (const slug of toolSlugs) {
        links.push({
          href: `/tools/${slug}`,
          label: getToolDisplayName(slug)
        })
      }
      break
    }
    case 'local': {
      const verticals = [
        ...new Set(
          (suggestedVerticalSlugs ?? [])
            .map((slug) => slugifyLabel(slug))
            .filter(Boolean)
        )
      ].slice(0, 2)
      if (verticals.length === 0) {
        const fallback = detectVerticalSlug(cityOrNiche, currentSlug)
        if (fallback) verticals.push(fallback)
      }
      for (const verticalSlug of verticals) {
        links.push({
          href: saasIdeasVerticalPath(verticalSlug),
          label: `Best SaaS ideas for ${slugToTitle(verticalSlug)}`
        })
      }
      break
    }
  }

  return links
}

export async function RelatedIntelligence(props: RelatedIntelligenceProps) {
  const {
    relatedIdeaSlugs,
    relatedToolSlugs,
    cityOrNiche,
    currentPageType
  } = props

  const ideaLabels = await resolveIdeaLabels(relatedIdeaSlugs)
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
          {relatedIdeaSlugs.length > 0 ? (
            <ul className="space-y-2">
              {relatedIdeaSlugs.map((ideaSlug) => (
                <li key={ideaSlug}>
                  <Link
                    href={`/ideas/${ideaSlug}`}
                    className="inline-flex items-center gap-2 font-mono text-sm text-zinc-300 transition-colors hover:text-amber-400"
                  >
                    {ideaLabels.get(ideaSlug) ?? slugToTitle(ideaSlug)}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No blueprint links indexed.</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
            Free Tools
          </p>
          {relatedToolSlugs.length > 0 ? (
            <ul className="space-y-2">
              {relatedToolSlugs.map((toolSlug) => (
                <li key={toolSlug}>
                  <Link
                    href={`/tools/${toolSlug}`}
                    className="group inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/40 px-3 py-2 font-mono text-sm text-zinc-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-200"
                  >
                    <span>{getToolDisplayName(toolSlug)}</span>
                    <span className="rounded border border-emerald-500/40 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-200">
                      Free
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-400/80 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No tool links indexed.</p>
          )}
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

      {crossLinks.length > 0 ? (
        <>
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
        </>
      ) : null}
    </section>
  )
}
