export interface JsonLdSchemaProps {
  schema: object
}

/**
 * Server-only JSON-LD injector. Renders a single `<script type="application/ld+json">`
 * tag with no client JS and no visible UI.
 */
export function JsonLdSchema({ schema }: JsonLdSchemaProps) {
  if (schema == null || typeof schema !== 'object' || Array.isArray(schema)) {
    return null
  }

  const keys = Object.keys(schema)
  if (keys.length === 0) return null

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
