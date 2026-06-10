import type { KarmaEventRow } from '@/types/supabase'

const KARMA_EVENT_LABELS: Record<KarmaEventRow['event_type'], string> = {
  review_given: 'Review Given',
}

export function formatKarmaEventDescription(
  eventType: KarmaEventRow['event_type'],
  points: number
): string {
  const label = KARMA_EVENT_LABELS[eventType] ?? eventType
  const sign = points >= 0 ? '+' : ''
  return `${sign}${points} Karma awarded for ${label}`
}
