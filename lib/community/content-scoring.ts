import type {
  ContentScore,
  ContentScoreAdjustment,
  ModerationFlag,
} from '@/lib/community/types'

/**
 * Heuristic content evaluation matrix.
 *
 * Aggregates a weighted quality score from 0 to 100 (higher = better) from
 * three engines:
 *  - FLUFF: hard length floors, filler-phrase deductions, lexical density.
 *  - AI COPY: transition-phrase density, mechanical sentence uniformity,
 *    generic hypotheticals, and missing first-person voice on long texts.
 *  - AUTHORITY: bonuses for code blocks, live links, thread context
 *    references, and concrete business metrics.
 */

const BASELINE_SCORE = 50

/** Common low-effort filler phrases. Each match stacks a deduction. */
export const FLUFF_PHRASES: ReadonlySet<string> = new Set([
  'well done',
  'awesome post',
  'nice read',
  'great post',
  'great idea',
  'good job',
  'good luck',
  'love this',
  'love it',
  'so true',
  'totally agree',
  'thanks for sharing',
  'keep it up',
  'very interesting',
  'very cool',
  'nice one',
  'amazing work',
  'this is great',
  'well said',
  'cool idea',
])

/** Transitional phrases characteristic of unedited AI generation. */
export const AI_TRANSITION_PHRASES: ReadonlyArray<string> = [
  "it's worth noting",
  'it is worth noting',
  'in conclusion',
  'furthermore',
  'that being said',
  'with that said',
  'moreover',
  'additionally',
  'in summary',
  'to summarize',
  "it's important to note",
  'it is important to note',
  'on the other hand',
  'at the end of the day',
  'in the ever-evolving',
  'delve into',
  'dive deeper',
  'navigate the landscape',
  'unlock the potential',
  'game-changer',
]

/** Generic hypothetical framings typical of mass-generated examples. */
const GENERIC_HYPOTHETICAL_PATTERNS: RegExp[] = [
  /consider a scenario where/i,
  /imagine a (?:startup|company|business|founder|user|world) (?:that|who|where)/i,
  /let's say (?:you|a startup|a company|a founder)/i,
  /suppose (?:you|a startup|a company) (?:are|is|have|has|want)/i,
  /for (?:example|instance), a (?:startup|company|business) (?:might|could|may)/i,
  /picture a (?:startup|company|business|founder)/i,
]

const FIRST_PERSON_PRONOUNS: RegExp =
  /\b(?:i|i'm|i've|i'd|i'll|me|my|mine|myself|we|we're|we've|our|ours|us)\b/i

const CODE_BLOCK_PATTERN = /```[\s\S]*?```|`[^`\n]+`/
const EXTERNAL_LINK_PATTERN = /https?:\/\/[^\s)>"']+/gi
const MENTION_PATTERN = /(?:^|\s)@[a-z0-9_]{3,}/i
const BLOCKQUOTE_PATTERN = /^\s*>\s+\S/m
const BUSINESS_METRIC_PATTERN =
  /\b(?:mrr|arr|cac|ltv|nps|churn|retention|conversion|signups?|revenue|payback)\b|\d+(?:\.\d+)?\s*%|\$\s?\d[\d,]*(?:\.\d+)?\s*(?:k|m)?\b/i

/** AI transition density (share of sentences) that raises the ai_copy flag. */
const AI_TRANSITION_DENSITY_THRESHOLD = 0.25
/** Sentence word-count stddev floor signalling mechanical uniformity. */
const SENTENCE_STDDEV_FLOOR = 3.5
/** Minimum sentence count before uniformity analysis is meaningful. */
const SENTENCE_STDDEV_MIN_SENTENCES = 6
/** Word count above which missing first-person voice becomes suspicious. */
const FIRST_PERSON_MIN_WORDS = 120

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function splitSentences(text: string): string[] {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).filter(Boolean).length >= 2)
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/** Unique-word ratio; low values on short texts indicate repetitive filler. */
function lexicalDensity(words: string[]): number {
  if (words.length === 0) return 1
  const unique = new Set(words.map((word) => word.toLowerCase()))
  return unique.size / words.length
}

type EngineOutput = {
  adjustments: ContentScoreAdjustment[]
  flagged: boolean
  reasons: string[]
}

// --- FLUFF ENGINE -----------------------------------------------------------

function runFluffEngine(text: string, normalized: string): EngineOutput {
  const adjustments: ContentScoreAdjustment[] = []
  const reasons: string[] = []
  const charLength = text.trim().length
  const words = normalized.split(/\s+/).filter(Boolean)

  if (charLength < 20) {
    adjustments.push({
      rule: 'fluff_hard_floor',
      points: -35,
      detail: `Text length ${charLength} chars is below the 20-char hard floor.`,
    })
    reasons.push('below 20-char hard floor')
  } else if (charLength < 60) {
    adjustments.push({
      rule: 'fluff_soft_floor',
      points: -20,
      detail: `Text length ${charLength} chars is below the 60-char floor.`,
    })
    reasons.push('below 60-char floor')
  }

  for (const phrase of FLUFF_PHRASES) {
    if (normalized.includes(phrase)) {
      adjustments.push({
        rule: 'fluff_phrase',
        points: -10,
        detail: `Filler phrase detected: "${phrase}".`,
      })
      reasons.push(`filler phrase "${phrase}"`)
    }
  }

  if (words.length > 0 && words.length <= 40) {
    const density = lexicalDensity(words)
    if (density < 0.5) {
      adjustments.push({
        rule: 'fluff_low_lexical_density',
        points: -10,
        detail: `Lexical density ${density.toFixed(2)} on a short text indicates repetitive filler.`,
      })
      reasons.push('low lexical density')
    }
  }

  return { adjustments, flagged: adjustments.length > 0, reasons }
}

// --- AI COPY DETECTION --------------------------------------------------------

function runAiCopyEngine(text: string, normalized: string): EngineOutput {
  const adjustments: ContentScoreAdjustment[] = []
  const reasons: string[] = []
  const sentences = splitSentences(text)
  const wordCount = countWords(normalized)

  // a) Transition phrase density across sentences.
  if (sentences.length > 0) {
    const transitionalSentences = sentences.filter((sentence) => {
      const lower = sentence.toLowerCase()
      return AI_TRANSITION_PHRASES.some((phrase) => lower.includes(phrase))
    }).length
    const density = transitionalSentences / sentences.length

    if (density > AI_TRANSITION_DENSITY_THRESHOLD) {
      adjustments.push({
        rule: 'ai_transition_density',
        points: -20,
        detail: `AI transition phrases in ${Math.round(density * 100)}% of sentences (threshold 25%).`,
      })
      reasons.push('high AI transition phrase density')
    }
  }

  // b) Mechanical sentence-length uniformity.
  if (sentences.length >= SENTENCE_STDDEV_MIN_SENTENCES) {
    const stddev = standardDeviation(sentences.map(countWords))
    if (stddev < SENTENCE_STDDEV_FLOOR) {
      adjustments.push({
        rule: 'ai_sentence_uniformity',
        points: -15,
        detail: `Sentence word-count stddev ${stddev.toFixed(2)} across ${sentences.length} sentences (floor 3.5).`,
      })
      reasons.push('mechanical sentence uniformity')
    }
  }

  // c) Generic hypothetical examples.
  const hypothetical = GENERIC_HYPOTHETICAL_PATTERNS.find((pattern) =>
    pattern.test(text)
  )
  if (hypothetical) {
    adjustments.push({
      rule: 'ai_generic_hypothetical',
      points: -10,
      detail: 'Generic templated hypothetical example detected.',
    })
    reasons.push('generic hypothetical example')
  }

  // d) Missing first-person voice on long texts.
  if (wordCount > FIRST_PERSON_MIN_WORDS && !FIRST_PERSON_PRONOUNS.test(text)) {
    adjustments.push({
      rule: 'ai_no_first_person',
      points: -15,
      detail: `No first-person pronouns across ${wordCount} words.`,
    })
    reasons.push('no first-person voice on long text')
  }

  return { adjustments, flagged: adjustments.length >= 2, reasons }
}

// --- AUTHORITY BONUSES --------------------------------------------------------

function runAuthorityEngine(text: string): ContentScoreAdjustment[] {
  const bonuses: ContentScoreAdjustment[] = []

  if (CODE_BLOCK_PATTERN.test(text)) {
    bonuses.push({
      rule: 'authority_code_block',
      points: 10,
      detail: 'Contains code block(s).',
    })
  }

  const links = text.match(EXTERNAL_LINK_PATTERN)
  if (links && links.length > 0) {
    bonuses.push({
      rule: 'authority_external_link',
      points: Math.min(8 * links.length, 16),
      detail: `Contains ${links.length} external link(s).`,
    })
  }

  if (MENTION_PATTERN.test(text) || BLOCKQUOTE_PATTERN.test(text)) {
    bonuses.push({
      rule: 'authority_thread_context',
      points: 6,
      detail: 'References thread context (@mention or blockquote).',
    })
  }

  if (BUSINESS_METRIC_PATTERN.test(text)) {
    bonuses.push({
      rule: 'authority_business_metrics',
      points: 8,
      detail: 'Cites concrete business metrics (MRR/ARR/CAC/percentages).',
    })
  }

  return bonuses
}

// --- AGGREGATOR ----------------------------------------------------------------

/**
 * Evaluates content quality and returns a 0–100 score with itemized
 * adjustments and any moderation flags the heuristics raised.
 */
export function scoreContent(text: string): ContentScore {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()

  const fluff = runFluffEngine(text, normalized)
  const aiCopy = runAiCopyEngine(text, normalized)
  const bonuses = runAuthorityEngine(text)

  const deductions = [...fluff.adjustments, ...aiCopy.adjustments]
  const totalDeductions = deductions.reduce((sum, a) => sum + a.points, 0)
  const totalBonuses = bonuses.reduce((sum, a) => sum + a.points, 0)
  const score = clampScore(BASELINE_SCORE + totalDeductions + totalBonuses)

  const flags: ModerationFlag[] = []

  if (fluff.flagged) {
    flags.push({
      type: 'fluff',
      severity: score < 25 ? 'hard' : 'soft',
      reason: `Fluff indicators: ${fluff.reasons.join('; ')}.`,
      confidence: Math.min(1, fluff.adjustments.length * 0.3),
    })
  }

  if (aiCopy.flagged) {
    flags.push({
      type: 'ai_copy',
      severity: aiCopy.adjustments.length >= 3 ? 'hard' : 'soft',
      reason: `Unedited AI copy indicators: ${aiCopy.reasons.join('; ')}.`,
      confidence: Math.min(1, aiCopy.adjustments.length * 0.3),
    })
  }

  return { score, deductions, bonuses, flags }
}
