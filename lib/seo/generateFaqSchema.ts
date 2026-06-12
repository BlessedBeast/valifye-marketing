export interface FaqItem {
  question: string
  answer: string
}

export interface FaqAnswerSchema {
  '@type': 'Answer'
  text: string
}

export interface FaqQuestionSchema {
  '@type': 'Question'
  name: string
  acceptedAnswer: FaqAnswerSchema
}

export interface FaqPageSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: FaqQuestionSchema[]
}

export function generateFaqSchema(faqs: FaqItem[]): FaqPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}
