import type { Metadata } from 'next'
import type { MarketingShowcaseReport } from '@/lib/marketingShowcase'

const SITE_URL = 'https://valifye.com'

export function buildShowcaseMetadata(report: MarketingShowcaseReport): Metadata {
  const title = `${report.title} | Valifye Forensic Showcase`
  const description = report.forensicVerdict
  const canonical = `${SITE_URL}/showcase/${report.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical
    }
  }
}

export function buildShowcaseDatasetJsonLd(report: MarketingShowcaseReport) {
  const canonical = `${SITE_URL}/showcase/${report.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: report.title,
    description: report.forensicVerdict,
    url: canonical,
    identifier: report.slug,
    creator: {
      '@type': 'Organization',
      name: 'Valifye',
      url: SITE_URL
    },
    ...(report.updatedAt ? { dateModified: report.updatedAt } : {}),
    variableMeasured: report.modules.map((module) => module.title),
    citation: report.sources,
    isAccessibleForFree: true
  }
}
