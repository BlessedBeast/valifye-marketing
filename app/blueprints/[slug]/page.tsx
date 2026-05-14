import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  BpkBlueprintReportArticle,
  BpkEdgeErrorBanner,
  BpkScoreStrip,
  BpkVerdictBadge
} from '@/components/bpk/BpkReportPrimitives'
import { MarketingShell } from '@/components/MarketingShell'
import { getBpkAuditBySlug } from '@/lib/bpkAudits'
import { parseBpkFullReport } from '@/lib/bpkReportParse'
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

function buildJsonLd(opts: {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw).trim()
  const audit = await getBpkAuditBySlug(slug)
  if (!audit) {
    return {
      title: 'Blueprint not found | Valifye',
      description: 'This forensic blueprint is not in the public repository.'
    }
  }

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

export default async function BlueprintSlugPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw).trim()
  const audit = await getBpkAuditBySlug(slug)
  if (!audit) notFound()

  const ideaLabel = audit.idea_input?.trim() || audit.slug.replace(/-/g, ' ')
  const audienceLabel =
    audit.target_audience?.trim() ||
    'micro-SaaS founders and independent operators'

  const payload = parseBpkFullReport(audit.full_report ?? {})

  const ideaTitleMeta = oneLine(audit.idea_input, 72) || ideaLabel
  const metaDescription = `Brutal, data-driven audit of ${ideaTitleMeta}. Analysis of demand, fatal risks, and monetization viability for ${oneLine(audienceLabel, 80)}.`

  const pageUrl = `${SITE_URL}/blueprints/${encodeURIComponent(audit.slug)}`
  const headline = `Forensic Blueprint: ${ideaTitleMeta} Market Analysis (2026)`

  const jsonLd = buildJsonLd({
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
            Forensic blueprint · repository record
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
