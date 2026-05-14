import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  AeoBlueprintReportArticle,
  BpkBlueprintReportArticle,
  BpkEdgeErrorBanner,
  BpkScoreStrip,
  BpkVerdictBadge,
  BpkVisibilityMeter
} from '@/components/bpk/BpkReportPrimitives'
import { MarketingShell } from '@/components/MarketingShell'
import { getAeoScanBySlug } from '@/lib/aeoScans'
import { getBpkAuditBySlug } from '@/lib/bpkAudits'
import { parseAeoScanPayload, parseBpkFullReport } from '@/lib/bpkReportParse'
import { buildCanonical } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://valifye.com'

type Props = { params: Promise<{ slug: string }> }

function oneLine(s: string | null | undefined, max: number): string {
  const t = (s ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1))}…`
}

function buildBpkJsonLd(opts: {
  url: string
  headline: string
  description: string
  datePublished: string
  ideaName: string
  verdict: string
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: opts.headline,
        description: opts.description,
        url: opts.url,
        datePublished: opts.datePublished || undefined,
        author: {
          '@type': 'Organization',
          name: 'Valifye'
        },
        about: {
          '@type': 'Thing',
          name: opts.ideaName
        },
        articleSection: 'Forensic market audit',
        inLanguage: 'en-US'
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Organization',
          name: 'Valifye'
        },
        itemReviewed: {
          '@type': 'CreativeWork',
          name: opts.ideaName
        },
        reviewBody: opts.description,
        datePublished: opts.datePublished || undefined,
        name: `Forensic verdict: ${opts.verdict}`
      }
    ]
  })
}

function buildAeoJsonLd(opts: {
  url: string
  headline: string
  description: string
  datePublished: string
  analyzedUrl: string | null
  category: string | null
  fallbackName: string
}) {
  let host = opts.fallbackName

  if (opts.analyzedUrl) {
    try {
      host = new URL(opts.analyzedUrl).hostname || host
    } catch {
      host = opts.analyzedUrl
    }
  }

  const cat = (opts.category ?? '').toLowerCase()
  const useSoftware =
    cat.includes('saas') ||
    cat.includes('e-commerce') ||
    cat.includes('ecommerce') ||
    cat.includes('software') ||
    cat.includes('fintech')

  const itemReviewed = opts.analyzedUrl
    ? useSoftware
      ? {
          '@type': 'SoftwareApplication',
          name: host,
          url: opts.analyzedUrl,
          applicationCategory: opts.category || undefined
        }
      : {
          '@type': 'Organization',
          name: host,
          url: opts.analyzedUrl
        }
    : {
        '@type': 'Thing',
        name: opts.fallbackName
      }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: opts.headline,
        description: opts.description,
        url: opts.url,
        datePublished: opts.datePublished || undefined,
        author: {
          '@type': 'Organization',
          name: 'Valifye'
        },
        about: itemReviewed,
        articleSection: 'AEO shadow scan',
        inLanguage: 'en-US'
      },
      {
        '@type': 'Review',
        author: {
          '@type': 'Organization',
          name: 'Valifye'
        },
        itemReviewed,
        reviewBody: opts.description,
        datePublished: opts.datePublished || undefined,
        name: `AEO visibility audit: ${host}`
      }
    ]
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw).trim()

  const audit = await getBpkAuditBySlug(slug)
  if (audit) {
    const ideaTitle =
      oneLine(audit.idea_input, 72) || oneLine(audit.slug.replace(/-/g, ' '), 72)
    const audience =
      oneLine(audit.target_audience, 80) || 'micro-SaaS founders and operators'

    const title = `Forensic Blueprint: ${ideaTitle} Market Analysis (2026)`
    const description = `Brutal, data-driven audit of ${ideaTitle}. Analysis of demand, fatal risks, and monetization viability for ${audience}.`

    const canonical = buildCanonical(`/blueprints/${encodeURIComponent(audit.slug)}`)

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${SITE_URL}/blueprints/${encodeURIComponent(audit.slug)}`
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description
      },
      robots: { index: true, follow: true }
    }
  }

  const scan = await getAeoScanBySlug(slug)
  if (!scan) {
    return {
      title: 'Blueprint not found | Valifye',
      description: 'This forensic blueprint is not in the public repository.'
    }
  }

  const urlDisplay =
    oneLine(scan.target_url, 96) || oneLine(scan.slug.replace(/-/g, ' '), 96)

  const title = `Forensic Blueprint: ${urlDisplay} AEO Shadow Scan & Visibility Audit (2026)`
  const description = `Answer-engine visibility dossier for ${urlDisplay}. Citation signals, entity gaps, and competitor pressure — archived for discovery surfaces.`

  const canonical = buildCanonical(`/blueprints/${encodeURIComponent(scan.slug)}`)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/blueprints/${encodeURIComponent(scan.slug)}`
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    robots: { index: true, follow: true }
  }
}

export default async function BlueprintSlugPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw).trim()

  const audit = await getBpkAuditBySlug(slug)
  if (audit) {
    const ideaLabel = audit.idea_input?.trim() || audit.slug.replace(/-/g, ' ')
    const audienceLabel =
      audit.target_audience?.trim() ||
      'micro-SaaS founders and independent operators'

    const payload = parseBpkFullReport(audit.full_report ?? {})

    const ideaTitleMeta = oneLine(audit.idea_input, 72) || ideaLabel
    const metaDescription = `Brutal, data-driven audit of ${ideaTitleMeta}. Analysis of demand, fatal risks, and monetization viability for ${oneLine(audienceLabel, 80)}.`

    const pageUrl = `${SITE_URL}/blueprints/${encodeURIComponent(audit.slug)}`
    const headline = `Forensic Blueprint: ${ideaTitleMeta} Market Analysis (2026)`

    const jsonLd = buildBpkJsonLd({
      url: pageUrl,
      headline,
      description: metaDescription,
      datePublished: audit.created_at,
      ideaName: ideaTitleMeta,
      verdict: String(payload.verdict)
    })

    const ctaRef = `blueprint_${audit.slug}`

    return (
      <MarketingShell className="max-w-4xl gap-12 bg-zinc-950 text-zinc-400">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />

        <article className="space-y-10 pb-12 md:space-y-14 md:pb-16">
          <header className="space-y-4 border-b border-zinc-800/90 pb-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-400/90">
              Forensic blueprint · startup audit
            </p>
            <h1 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl lg:text-5xl">
              {headline}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
              Expert market evaluation archived for answer engines. Static dossier —
              not live pricing or legal advice.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              slug:{' '}
              <span className="text-emerald-600/90">{audit.slug}</span>
              {audit.created_at ? (
                <>
                  {' '}
                  · sealed{' '}
                  <time dateTime={audit.created_at}>
                    {new Date(audit.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC'
                    })}
                  </time>
                </>
              ) : null}
            </p>
          </header>

          <div className="space-y-8 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:space-y-10 md:p-8">
            <div className="space-y-6 text-center">
              {payload.edgeError ? (
                <BpkEdgeErrorBanner message={payload.edgeError} />
              ) : null}
              <BpkVerdictBadge verdict={payload.verdict} />
              <BpkScoreStrip scores={payload.scores} />
            </div>

            <BpkBlueprintReportArticle
              payload={payload}
              ideaLabel={ideaLabel}
              audienceLabel={audienceLabel}
            />
          </div>

          <section
            aria-labelledby="live-audit-heading"
            className="space-y-5 border border-emerald-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
          >
            <h2
              id="live-audit-heading"
              className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
            >
              RUN A LIVE FORENSIC AUDIT
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              This blueprint is a static record from the 2026 repository. To get a
              real-time audit with live competitor clusters, current SERP volatility,
              and a custom execution roadmap, you must run a live report.
            </p>
            <form
              method="get"
              action="https://app.valifye.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto w-full max-w-xl pt-2"
            >
              <input type="hidden" name="ref" value={ctaRef} />
              <button
                type="submit"
                className="w-full border-2 border-emerald-500/55 bg-zinc-950 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] transition-all animate-pulse hover:animate-none hover:border-emerald-400/80 hover:shadow-[0_0_56px_8px_rgba(16,185,129,0.45),0_0_100px_-12px_rgba(16,185,129,0.35)] md:text-sm md:tracking-[0.26em]"
              >
                [ ESCALATE TO LIVE AUDIT ]
              </button>
            </form>
          </section>
        </article>
      </MarketingShell>
    )
  }

  const scan = await getAeoScanBySlug(slug)
  if (!scan) notFound()

  const displayTarget = scan.target_url?.trim() || scan.slug.replace(/-/g, ' ')

  const payload = parseAeoScanPayload(scan.full_report ?? {})

  const urlTitle = oneLine(scan.target_url, 96) || scan.slug.replace(/-/g, ' ')
  const headline = `Forensic Blueprint: ${urlTitle} AEO Shadow Scan & Visibility Audit (2026)`
  const metaDescription = `Answer-engine visibility dossier for ${urlTitle}. Citation signals, entity gaps, and roadmap — archived for discovery surfaces.`

  const pageUrl = `${SITE_URL}/blueprints/${encodeURIComponent(scan.slug)}`

  const jsonLd = buildAeoJsonLd({
    url: pageUrl,
    headline,
    description: metaDescription,
    datePublished: scan.created_at,
    analyzedUrl: scan.target_url?.trim() || null,
    category: scan.category,
    fallbackName: scan.slug.replace(/-/g, ' ')
  })

  const ctaRef = `aeo_blueprint_${scan.slug}`

  return (
    <MarketingShell className="max-w-4xl gap-12 bg-zinc-950 text-zinc-400">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <article className="space-y-10 pb-12 md:space-y-14 md:pb-16">
        <header className="space-y-4 border-b border-zinc-800/90 pb-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-orange-400/90">
            Forensic blueprint · AEO shadow scan
          </p>
          <h1 className="font-serif text-3xl font-black tracking-tight text-zinc-50 md:text-4xl lg:text-5xl">
            {headline}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
            Visibility index and citation intelligence archived for answer engines.
            Static dossier — not a live crawl or legal opinion.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
            slug: <span className="text-orange-500/85">{scan.slug}</span>
            {scan.category ? (
              <>
                {' '}
                · category{' '}
                <span className="text-zinc-500">{scan.category}</span>
              </>
            ) : null}
            {scan.created_at ? (
              <>
                {' '}
                · sealed{' '}
                <time dateTime={scan.created_at}>
                  {new Date(scan.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </time>
              </>
            ) : null}
          </p>
        </header>

        <div className="space-y-8 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] md:space-y-10 md:p-8">
          <div className="space-y-6 text-center">
            {payload.edgeError ? (
              <BpkEdgeErrorBanner message={payload.edgeError} />
            ) : null}
            <BpkVerdictBadge verdict={payload.aeo_verdict} caption="AEO verdict" />
            <BpkVisibilityMeter score={payload.visibility_score} />
          </div>

          <AeoBlueprintReportArticle payload={payload} targetUrl={displayTarget} />
        </div>

        <section
          aria-labelledby="aeo-escalate-heading"
          className="space-y-5 border border-orange-500/25 bg-zinc-900/40 px-6 py-8 text-center md:px-10 md:py-10"
        >
          <h2
            id="aeo-escalate-heading"
            className="font-serif text-2xl font-black uppercase tracking-tight text-zinc-50 md:text-3xl"
          >
            IS YOUR DOMAIN INVISIBLE IN AI CITATIONS?
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            This record is a sealed snapshot. For crawl-backed evidence, live answer
            surface captures, and a bespoke remediation roadmap, escalate to a live AEO
            engagement.
          </p>
          <form
            method="get"
            action="https://app.valifye.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto w-full max-w-xl pt-2"
          >
            <input type="hidden" name="ref" value={ctaRef} />
            <button
              type="submit"
              className="w-full border-2 border-orange-500/55 bg-zinc-950 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-orange-100 shadow-[0_0_0_1px_rgba(249,115,22,0.2)] transition-all hover:border-orange-400/80 hover:shadow-[0_0_56px_8px_rgba(249,115,22,0.35)] md:text-sm md:tracking-[0.26em]"
            >
              [ ESCALATE TO LIVE SHADOW SCAN ]
            </button>
          </form>
        </section>
      </article>
    </MarketingShell>
  )
}
