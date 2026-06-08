/**
 * Lightweight relative time formatter (e.g. "2h ago").
 */
export function formatTimeAgo(isoDate: string, now: Date = new Date()): string {
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return 'unknown'

  const diffSec = Math.max(0, Math.floor((now.getTime() - then) / 1000))

  if (diffSec < 45) return 'just now'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`

  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}w ago`

  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}mo ago`

  const diffYear = Math.floor(diffDay / 365)
  return `${diffYear}y ago`
}
