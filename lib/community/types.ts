/**
 * Core type models for the algorithmic moderation pipeline.
 *
 * The pipeline evaluates every inbound community mutation across three axes:
 *  1. Request fingerprinting (bot/agent detection)
 *  2. Content quality scoring (fluff + unedited AI copy heuristics)
 *  3. Behavioral velocity (rate/window checks, handled at the action layer)
 */

/** Lifecycle state of a moderated submission. */
export type ModerationStatus = 'pending' | 'passed' | 'flagged' | 'blocked'

/** Discrete classifier categories a submission can trip. */
export type ModerationFlagType =
  | 'fluff'
  | 'ai_copy'
  | 'bot_agent'
  | 'velocity'
  | 'new_account'

/** Severity tiers: soft flags accumulate, hard flags block outright. */
export type ModerationFlagSeverity = 'soft' | 'hard'

export type ModerationFlag = {
  type: ModerationFlagType
  severity: ModerationFlagSeverity
  /** Human-readable explanation persisted to the audit trail. */
  reason: string
  /** Classifier confidence in the 0–1 range. */
  confidence: number
}

/** Aggregate verdict produced by the moderation brain for one submission. */
export type ModerationResult = {
  status: ModerationStatus
  /** Composite content quality score, 0 (worst) to 100 (best). */
  score: number
  flags: ModerationFlag[]
  /** Pipeline revision written to comments.moderation_version. */
  version: number
}

/**
 * Raw request-level signals captured at the server action boundary.
 * All fields are nullable: absence of a signal is itself a signal.
 */
export type RequestFingerprint = {
  /** User-Agent header value. */
  userAgent: string | null
  /** Referer header value. */
  referer: string | null
  /** Accept-Language header value. */
  acceptLanguage: string | null
  /** Hidden honeypot form field — must be empty for humans. */
  honeypotValue: string | null
  /** Base64-encoded JSON payload of browser environment parameters. */
  jsToken: string | null
}

/** Decoded browser environment parameters carried inside the JS token. */
export type JsTokenPayload = {
  userAgent: string | null
  screenWidth: number | null
  screenHeight: number | null
  timezone: string | null
  language: string | null
}

/** Itemized scoring adjustment applied during content evaluation. */
export type ContentScoreAdjustment = {
  /** Stable identifier for the heuristic that fired (e.g. 'fluff_phrase'). */
  rule: string
  /** Signed point delta applied to the running score. */
  points: number
  detail: string
}

/** Output of the heuristic content evaluation matrix. */
export type ContentScore = {
  /** Final clamped quality score, 0–100 (higher = better). */
  score: number
  /** Negative adjustments (fluff floors, AI copy indicators, etc.). */
  deductions: ContentScoreAdjustment[]
  /** Positive adjustments (code blocks, metrics, context references). */
  bonuses: ContentScoreAdjustment[]
  /** Moderation flags raised when deduction thresholds are crossed. */
  flags: ModerationFlag[]
}
