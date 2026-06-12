import { safeNormalizePseoRow } from '@/lib/pseoNormalize'
import { supabase } from '@/lib/supabase'
import type { FaqItem } from '@/lib/seo/generateFaqSchema'

const TABLE_NAME = 'validation_guide_pages'

export type ValidationGuideStep = {
  step_number: number
  title: string
  description: string
  time_required: string
  tools: string[]
  output: string
}

export type MentionedTool = {
  name: string
  url: string | null
  pricing: string
}

export type ValidationGuidePage = {
  slug: string
  meta_title: string
  meta_description: string
  guide_title: string
  intro_text: string
  startup_type: string
  time_to_validate: string
  success_definition: string
  success_signals: string[]
  steps: ValidationGuideStep[]
  common_mistakes: string[]
  tools_mentioned: MentionedTool[]
  faq: FaqItem[]
  related_idea_slugs: string[]
  related_tool_slugs: string[]
}

type ValidationGuideRow = Record<string, unknown>

function safeParseJSON<T>(value: unknown): T | null {
  if (value == null) return null
  if (typeof value === 'object') return value as T
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asStringArray(value: unknown): string[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

function asFaqArray(value: unknown): FaqItem[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const question = asString(row.question ?? row.q)
      const answer = asString(row.answer ?? row.a)
      if (!question || !answer) return null
      return { question, answer }
    })
    .filter((item): item is FaqItem => item !== null)
}

function asSteps(value: unknown): ValidationGuideStep[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const title = asString(row.title ?? row.name)
      const description = asString(row.description ?? row.text)
      if (!title) return null

      const toolsRaw = row.tools
      const toolsParsed = safeParseJSON<unknown>(toolsRaw) ?? toolsRaw
      const tools = Array.isArray(toolsParsed)
        ? toolsParsed
            .map((tool) => (typeof tool === 'string' ? tool.trim() : ''))
            .filter(Boolean)
        : []

      return {
        step_number: asNumber(row.step_number, index + 1),
        title,
        description,
        time_required: asString(row.time_required),
        tools,
        output: asString(row.output)
      }
    })
    .filter((item): item is ValidationGuideStep => item !== null)
    .sort((a, b) => a.step_number - b.step_number)
}

function asMentionedTools(value: unknown): MentionedTool[] {
  const parsed = safeParseJSON<unknown>(value) ?? value
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const name = asString(row.name)
      if (!name) return null
      const url = asString(row.url) || null
      const pricing = asString(row.pricing) || 'Free'
      return { name, url, pricing }
    })
    .filter((item): item is MentionedTool => item !== null)
}

function normalizeValidationGuideRow(
  row: ValidationGuideRow
): ValidationGuidePage {
  return {
    slug: asString(row.slug),
    meta_title: asString(row.meta_title),
    meta_description: asString(row.meta_description),
    guide_title: asString(row.guide_title),
    intro_text: asString(row.intro_text),
    startup_type: asString(row.startup_type),
    time_to_validate: asString(row.time_to_validate),
    success_definition: asString(row.success_definition),
    success_signals: asStringArray(row.success_signals),
    steps: asSteps(row.steps),
    common_mistakes: asStringArray(row.common_mistakes),
    tools_mentioned: asMentionedTools(row.tools_mentioned),
    faq: asFaqArray(row.faq),
    related_idea_slugs: asStringArray(row.related_idea_slugs),
    related_tool_slugs: asStringArray(row.related_tool_slugs)
  }
}

export function validationGuidePath(slug: string): string {
  return `/how-to-validate-${slug}`
}

/**
 * Fetch a single published validation_guide_pages row by slug.
 */
export async function getValidationGuideBySlug(
  slug: string
): Promise<ValidationGuidePage | null> {
  if (typeof slug !== 'string' || slug.trim().length === 0) return null

  const cleanSlug = decodeURIComponent(slug).trim()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('slug', cleanSlug)
    .eq('is_published', true)
    .maybeSingle<ValidationGuideRow>()

  if (error) {
    console.error(
      '[validation_guide_pages] Fetch failed for slug "%s": %s',
      cleanSlug,
      error.message
    )
    return null
  }

  if (!data) return null

  return safeNormalizePseoRow(
    TABLE_NAME,
    cleanSlug,
    data,
    normalizeValidationGuideRow
  )
}
