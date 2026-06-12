export interface ArticleSchemaInput {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified: string
}

export interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified: string
}

export function generateArticleSchema(input: ArticleSchemaInput): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified
  }
}
