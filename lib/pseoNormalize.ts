type ZodLikeError = {
  name: string
  issues: Array<{
    path: Array<string | number>
    message: string
    code?: string
  }>
}

function isZodLikeError(error: unknown): error is ZodLikeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as ZodLikeError).issues)
  )
}

/**
 * Formats normalization failures (Zod, TypeError, JSON parse, etc.) for server logs.
 */
export function formatPseoNormalizeError(error: unknown): string {
  if (isZodLikeError(error)) {
    const lines = error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
      return `  - ${path}: ${issue.message}${issue.code ? ` [${issue.code}]` : ''}`
    })
    return `Zod validation failed:\n${lines.join('\n')}`
  }

  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`
  }

  if (typeof error === 'string') return error

  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

/**
 * Summarize JSON-ish columns on a raw row to speed up debugging double-serialization.
 */
export function summarizePseoRowForLog(
  row: Record<string, unknown>
): Record<string, string> {
  const summary: Record<string, string> = {}

  for (const [key, value] of Object.entries(row)) {
    if (value == null) {
      summary[key] = 'null'
    } else if (typeof value === 'string') {
      const preview = value.length > 120 ? `${value.slice(0, 120)}…` : value
      summary[key] = `string(${value.length}): ${preview}`
    } else if (Array.isArray(value)) {
      summary[key] = `array(${value.length})`
    } else if (typeof value === 'object') {
      summary[key] = `object{${Object.keys(value as object).join(', ')}}`
    } else {
      summary[key] = `${typeof value}: ${String(value)}`
    }
  }

  return summary
}

/**
 * Run a row normalizer inside try/catch. Logs detailed parse errors instead of
 * letting crashes bubble up as silent 404s via notFound().
 */
export function safeNormalizePseoRow<T>(
  table: string,
  slug: string,
  row: Record<string, unknown>,
  normalizer: (row: Record<string, unknown>) => T
): T | null {
  try {
    return normalizer(row)
  } catch (error) {
    console.error(
      `[${table}] Row normalization failed for slug "${slug}"`,
      '\n',
      formatPseoNormalizeError(error),
      '\n',
      'Field summary:',
      summarizePseoRowForLog(row)
    )
    return null
  }
}
