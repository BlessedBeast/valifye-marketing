/**
 * Parser for `local-scout` edge function JSON (on-ground validation strategies).
 */

import {
  asString,
  coerceToTextArray,
  isRecord,
  toCamelCase,
  unwrapFunctionBody
} from '@/lib/bpkReportParse'

export type LocalScoutTactic = {
  method: string
  action: string
  metric: string
}

export type LocalScoutPayload = {
  edgeError?: string | null
  location_analysis: string
  high_traffic_zones: string[]
  validation_tactics: LocalScoutTactic[]
  local_nuance: string
  competitor_poaching: string
}

function edgeErrorFromBag(bag: Record<string, unknown>): string | null {
  const v = bag.error
  if (v == null || v === false) return null
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length ? t : null
  }
  if (isRecord(v)) {
    const m =
      asString(v.message) ||
      asString(v.detail) ||
      asString(v.description)
    return m || null
  }
  return null
}

function strictField(bag: Record<string, unknown>, snake: string): string {
  const camel = toCamelCase(snake)
  const raw = bag[snake] ?? bag[camel]
  return asString(raw)
}

function parseTactics(raw: unknown): LocalScoutTactic[] {
  if (!Array.isArray(raw)) return []
  const out: LocalScoutTactic[] = []
  for (const item of raw) {
    if (isRecord(item)) {
      out.push({
        method: asString(item.method ?? item.name ?? item.title ?? item.label),
        action: asString(
          item.action ?? item.steps ?? item.task ?? item.playbook
        ),
        metric: asString(
          item.metric ?? item.signal ?? item.kpi ?? item.measure
        )
      })
    } else if (typeof item === 'string' && item.trim()) {
      out.push({ method: '', action: item.trim(), metric: '' })
    }
  }
  return out.filter((t) => t.method || t.action || t.metric)
}

export function parseLocalScoutPayload(raw: unknown): LocalScoutPayload {
  const bag = isRecord(raw) ? raw : unwrapFunctionBody(raw)
  const edgeError = edgeErrorFromBag(bag)

  const tacticsRaw =
    bag.validation_tactics ?? bag.validationTactics ?? bag.tactics

  return {
    edgeError,
    location_analysis: strictField(bag, 'location_analysis'),
    high_traffic_zones: coerceToTextArray(
      bag.high_traffic_zones ?? bag.highTrafficZones
    ),
    validation_tactics: parseTactics(tacticsRaw),
    local_nuance: strictField(bag, 'local_nuance'),
    competitor_poaching: strictField(bag, 'competitor_poaching')
  }
}
