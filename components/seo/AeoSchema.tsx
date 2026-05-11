import type { Faq } from '@/lib/comparisonData'

export type AeoSchemaProps = {
  competitorName: string
  faqs: Faq[]
}

/**
 * Server-only AEO helper. Emits a single `<script type="application/ld+json">`
 * tag containing schema.org `FAQPage` markup for the given competitor.
 *
 * Renders nothing when no valid Q/A pairs are present, so it is always safe to
 * drop into any page — empty FAQ blobs never reach search engines.
 *
 * No client JS. No visible UI. Safe to render inside an `<article>` or `<main>`.
 */
export function AeoSchema({ competitorName, faqs }: AeoSchemaProps) {
  const cleanedFaqs = Array.isArray(faqs)
    ? faqs
        .filter(
          (entry): entry is Faq =>
            !!entry &&
            typeof entry.question === 'string' &&
            typeof entry.answer === 'string' &&
            entry.question.trim().length > 0 &&
            entry.answer.trim().length > 0
        )
        .map((entry) => ({
          question: entry.question.trim(),
          answer: entry.answer.trim()
        }))
    : []

  if (cleanedFaqs.length === 0) return null

  const trimmedCompetitor =
    typeof competitorName === 'string' && competitorName.trim().length > 0
      ? competitorName.trim()
      : 'this product'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: `Frequently Asked Questions about ${trimmedCompetitor}`,
    mainEntity: cleanedFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c')
      }}
    />
  )
}
