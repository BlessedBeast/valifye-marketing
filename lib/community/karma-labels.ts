import type { KarmaEventRow } from '@/types/supabase'

const KARMA_EVENT_LABELS: Record<KarmaEventRow['event_type'], string> = {
  review_given: 'Review Given',
}

export function formatKarmaEventDescription(
  eventType: KarmaEventRow['event_type'],
  delta: number
): string {
  const label = KARMA_EVENT_LABELS[eventType] ?? eventType
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta} Karma awarded for ${label}`
}
