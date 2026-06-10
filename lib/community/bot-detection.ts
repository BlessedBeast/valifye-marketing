import type {
  JsTokenPayload,
  ModerationFlag,
  RequestFingerprint,
} from '@/lib/community/types'

/**
 * Bot / automated-agent detection for community write paths.
 *
 * Tier 1 (hard block): honeypot populated, blacklisted UA, missing UA.
 * Tier 2 (soft signals): missing referer/language headers, headless screen
 * geometry, UA mismatch between the HTTP header and the JS token payload.
 * An accumulation of tier-2 signals escalates to a hard block.
 */

/** Regex blacklist of scraper/client engines and headless signatures. */
export const BOT_UA_PATTERNS: RegExp[] = [
  /\bcurl\//i,
  /\bwget\//i,
  /python-requests/i,
  /python-urllib/i,
  /\baiohttp\//i,
  /\baxios\//i,
  /node-fetch/i,
  /\bundici\b/i,
  /go-http-client/i,
  /\bokhttp\//i,
  /java\/\d/i,
  /libwww-perl/i,
  /\bscrapy\b/i,
  /headlesschrome/i,
  /\bphantomjs\b/i,
  /\bpuppeteer\b/i,
  /\bplaywright\b/i,
  /\bselenium\b/i,
  /\belectron\b/i,
  /\bbot\b/i,
  /\bcrawler\b/i,
  /\bspider\b/i,
  /\bscraper\b/i,
  /postmanruntime/i,
  /insomnia\//i,
  /httpclient/i,
]

/** Number of accumulated tier-2 signals that escalates to a hard block. */
const SOFT_SIGNAL_BLOCK_THRESHOLD = 3

/** Screen geometries that betray default headless/virtual environments. */
const HEADLESS_DEFAULT_RESOLUTIONS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [800, 600],
]

export type BotDetectionResult = {
  /** True when the request should be rejected outright. */
  isBot: boolean
  /** Aggregate confidence that the request is automated, 0–1. */
  confidence: number
  flags: ModerationFlag[]
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

/**
 * Securely decodes the base64 JS token into browser environment parameters.
 * Returns null for anything malformed — a missing/broken token is treated
 * as a soft signal by the caller, never as a crash.
 */
export function parseJsToken(token: string | null): JsTokenPayload | null {
  if (!token || token.length > 4096) return null

  let decoded: string
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8')
  } catch {
    return null
  }

  let raw: unknown
  try {
    raw = JSON.parse(decoded)
  } catch {
    return null
  }

  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const record = raw as Record<string, unknown>

  return {
    userAgent: toNonEmptyString(record.userAgent),
    screenWidth: toFiniteNumber(record.screenWidth),
    screenHeight: toFiniteNumber(record.screenHeight),
    timezone: toNonEmptyString(record.timezone),
    language: toNonEmptyString(record.language),
  }
}

/** True when the decoded screen geometry matches known headless defaults. */
export function hasHeadlessScreenSignature(payload: JsTokenPayload): boolean {
  const { screenWidth, screenHeight, timezone } = payload

  if (screenWidth == null || screenHeight == null) return false
  if (screenWidth === 0 && screenHeight === 0) return true

  // 800x600 is a legitimate (if rare) viewport; only suspicious when the
  // environment also fails to report a timezone — the classic headless combo.
  return HEADLESS_DEFAULT_RESOLUTIONS.some(
    ([w, h]) =>
      screenWidth === w && screenHeight === h && w !== 0 && timezone == null
  )
}

function makeFlag(
  severity: ModerationFlag['severity'],
  reason: string,
  confidence: number
): ModerationFlag {
  return { type: 'bot_agent', severity, reason, confidence }
}

/**
 * Evaluates a request fingerprint and returns a bot verdict.
 * Hard signals short-circuit to an immediate block; soft signals accumulate
 * and escalate once they cross SOFT_SIGNAL_BLOCK_THRESHOLD.
 */
export function detectBotRequest(
  fingerprint: RequestFingerprint
): BotDetectionResult {
  const flags: ModerationFlag[] = []

  // --- Tier 1: hard blocks -------------------------------------------------

  if (fingerprint.honeypotValue && fingerprint.honeypotValue.trim() !== '') {
    const flag = makeFlag('hard', 'Honeypot field was populated.', 1)
    return { isBot: true, confidence: 1, flags: [flag] }
  }

  const userAgent = fingerprint.userAgent?.trim() ?? ''

  if (userAgent === '') {
    const flag = makeFlag('hard', 'Request carried no User-Agent header.', 0.95)
    return { isBot: true, confidence: 0.95, flags: [flag] }
  }

  const matchedPattern = BOT_UA_PATTERNS.find((pattern) =>
    pattern.test(userAgent)
  )
  if (matchedPattern) {
    const flag = makeFlag(
      'hard',
      `User-Agent matched blacklisted pattern: ${matchedPattern.source}`,
      0.95
    )
    return { isBot: true, confidence: 0.95, flags: [flag] }
  }

  // --- Tier 2: soft signal accumulation ------------------------------------

  if (!fingerprint.referer || fingerprint.referer.trim() === '') {
    flags.push(makeFlag('soft', 'Missing Referer header.', 0.3))
  }

  if (!fingerprint.acceptLanguage || fingerprint.acceptLanguage.trim() === '') {
    flags.push(makeFlag('soft', 'Missing Accept-Language header.', 0.35))
  }

  const payload = parseJsToken(fingerprint.jsToken)

  if (!payload) {
    flags.push(
      makeFlag('soft', 'JS environment token missing or unparseable.', 0.4)
    )
  } else {
    if (hasHeadlessScreenSignature(payload)) {
      flags.push(
        makeFlag(
          'soft',
          `Headless screen signature detected (${payload.screenWidth}x${payload.screenHeight}).`,
          0.5
        )
      )
    }

    if (
      payload.userAgent != null &&
      payload.userAgent.toLowerCase() !== userAgent.toLowerCase()
    ) {
      flags.push(
        makeFlag(
          'soft',
          'User-Agent mismatch between HTTP header and JS token.',
          0.5
        )
      )
    }

    if (payload.language == null) {
      flags.push(makeFlag('soft', 'JS environment reported no language.', 0.3))
    }
  }

  const softCount = flags.length
  const confidence =
    softCount === 0
      ? 0
      : Math.min(
          0.9,
          flags.reduce((sum, flag) => sum + flag.confidence, 0) / 2
        )

  if (softCount >= SOFT_SIGNAL_BLOCK_THRESHOLD) {
    return {
      isBot: true,
      confidence: Math.max(confidence, 0.75),
      flags: [
        ...flags,
        makeFlag(
          'hard',
          `Accumulated ${softCount} tier-2 automation signals.`,
          Math.max(confidence, 0.75)
        ),
      ],
    }
  }

  return { isBot: false, confidence, flags }
}
