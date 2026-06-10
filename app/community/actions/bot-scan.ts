'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { revalidatePath } from 'next/cache'

import { getSupabaseAdmin } from '@/lib/supabase'

const BOT_SCAN_DELAY_MS = 3000
const SERPER_SEARCH_URL = 'https://google.serper.dev/search'
const GEMINI_MODEL = 'gemini-2.5-flash'
const MAX_ORGANIC_RESULTS = 5

const MODERATOR_SYSTEM_PROMPT = `You are a human moderator, veteran startup analyst, and data-driven indie hacker running the Valifye Founders Lounge. Your job is to audit new text submissions using live Google search results.

Do NOT sound like an AI. Never say 'Here is your report', 'As an AI', or use mechanical introductory phrases. Dive straight into the analysis like a real founder dropping a smart, constructive forum comment.

Format your reply in beautiful, crisp Markdown with these exact conversational elements:
- An introductory line sizing up the market space casually but authoritatively.
- A breakdown of the exact real competitor domain links discovered from the search results, summarizing their main product angles.
- A realistic cost evaluation of the keywords based on market density.
- A blunt, high-value assessment of the #1 fatal strategic hurdle they need to solve.
- End with a natural, encouraging closer telling them they can view the full deep-dive competitive footprint by clicking their custom report link.`

type SerperOrganicResult = {
  title?: string
  link?: string
  snippet?: string
}

type SerperSearchResponse = {
  organic?: SerperOrganicResult[]
}

type OrganicSearchHit = {
  title: string
  link: string
  snippet: string
  domain: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function extractDomain(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return link
  }
}

function estimateCpc(competitorCount: number): number {
  const base = 1.5
  const densityFactor = competitorCount * 1.15
  return Math.round(Math.min(14, base + densityFactor) * 100) / 100
}

function deriveVerdict(competitors: number): 'BUILD' | 'PIVOT' | 'KILL' {
  if (competitors >= 5) return 'KILL'
  if (competitors >= 4) return 'PIVOT'
  return 'BUILD'
}

async function fetchSerperResults(query: string): Promise<OrganicSearchHit[]> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not configured')
  }

  const response = await fetch(SERPER_SEARCH_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Serper request failed (${response.status}): ${errorBody}`)
  }

  const payload = (await response.json()) as SerperSearchResponse
  const organic = Array.isArray(payload.organic) ? payload.organic : []

  return organic
    .slice(0, MAX_ORGANIC_RESULTS)
    .map((result) => ({
      title: result.title?.trim() || 'Untitled result',
      link: result.link?.trim() || '',
      snippet: result.snippet?.trim() || '',
      domain: result.link ? extractDomain(result.link) : 'unknown',
    }))
    .filter((result) => result.link.length > 0)
}

function formatSearchResultsForPrompt(results: OrganicSearchHit[]): string {
  if (results.length === 0) {
    return 'No organic Google results were returned for this query.'
  }

  return results
    .map(
      (result, index) =>
        `${index + 1}. **${result.title}**\n   - Domain: ${result.domain}\n   - URL: ${result.link}\n   - Snippet: ${result.snippet}`
    )
    .join('\n\n')
}

type BotScanCompetitorEntry = {
  domain: string
  title: string
  url: string
  snippet: string
}

type BotScanRiskFlags = {
  verdict: 'BUILD' | 'PIVOT' | 'KILL'
  competitor_density: 'low' | 'medium' | 'high'
  market_query: string
  source: 'serper_organic'
}

function buildCompetitorEntries(results: OrganicSearchHit[]): BotScanCompetitorEntry[] {
  return results.map((result) => ({
    domain: result.domain,
    title: result.title,
    url: result.link,
    snippet: result.snippet,
  }))
}

function buildRiskFlags(params: {
  verdict: 'BUILD' | 'PIVOT' | 'KILL'
  competitorCount: number
  marketQuery: string
}): BotScanRiskFlags {
  const density =
    params.competitorCount >= 5 ? 'high' : params.competitorCount >= 4 ? 'medium' : 'low'

  return {
    verdict: params.verdict,
    competitor_density: density,
    market_query: params.marketQuery,
    source: 'serper_organic',
  }
}

async function generateModeratorComment(params: {
  market: string
  description: string
  searchResults: OrganicSearchHit[]
  cpc: number
  competitorCount: number
  reportUrl: string
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: MODERATOR_SYSTEM_PROMPT,
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.4,
    },
  })

  const founderExcerpt =
    params.description.trim().length > 600
      ? `${params.description.trim().slice(0, 600).trim()}…`
      : params.description.trim()

  const userPrompt = [
    'Audit this new Founders Lounge submission using the live Google search index below.',
    '',
    `**Market / query:** ${params.market}`,
    founderExcerpt ? `**Founder submission:** ${founderExcerpt}` : '',
    '',
    `**Mapped competitor count:** ${params.competitorCount}`,
    `**Estimated keyword CPC (market density model):** $${params.cpc.toFixed(2)}`,
    `**Custom report link (use this exact URL in your closer):** ${params.reportUrl}`,
    '',
    '**Live Google organic results:**',
    formatSearchResultsForPrompt(params.searchResults),
  ]
    .filter(Boolean)
    .join('\n')

  const result = await model.generateContent(userPrompt)
  const text = result.response.text().trim()

  if (!text) {
    throw new Error('Gemini returned an empty moderator comment')
  }

  return text
}

/**
 * Runs a live Serper + Gemini market scan, upserts structured bot_scans metrics,
 * flips posts.is_bot_processed, then posts a system comment marked is_bot=true.
 */
export async function triggerAutonomousBotScan(
  postId: string,
  market: string,
  description: string,
  postSlug?: string
): Promise<void> {
  try {
    await sleep(BOT_SCAN_DELAY_MS)

    const searchQuery = market.trim() || 'startup market'
    const organicResults = await fetchSerperResults(searchQuery)

    if (organicResults.length === 0) {
      console.warn('[community] bot scan: no organic Serper results for query:', searchQuery)
      return
    }

    const competitorEntries = buildCompetitorEntries(organicResults)
    const competitorCount = organicResults.length
    const keywordCpc = estimateCpc(competitorCount)
    const verdict = deriveVerdict(competitorCount)
    const riskFlags = buildRiskFlags({
      verdict,
      competitorCount,
      marketQuery: searchQuery,
    })
    const fullReportUrl = `https://app.valifye.com/report/${postId}`

    const botCommentBody = await generateModeratorComment({
      market: searchQuery,
      description,
      searchResults: organicResults,
      cpc: keywordCpc,
      competitorCount,
      reportUrl: fullReportUrl,
    })

    const supabase = getSupabaseAdmin()

    const { error: scanError } = await supabase.from('bot_scans').upsert(
      {
        post_id: postId,
        keyword_cpc: keywordCpc,
        competitor_count: competitorCount,
        competitors: competitorEntries,
        risk_flags: riskFlags,
        full_report_url: fullReportUrl,
      },
      { onConflict: 'post_id' }
    )

    if (scanError) {
      console.error('[community] bot_scans upsert failed:', scanError.message)
      return
    }

    const { error: flagError } = await supabase
      .from('posts')
      .update({ is_bot_processed: true })
      .eq('id', postId)

    if (flagError) {
      console.error('[community] is_bot_processed update failed:', flagError.message)
    }

    const { error: commentError } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: null,
      is_bot: true,
      body: botCommentBody,
      status: 'published',
    })

    if (commentError) {
      console.error('[community] bot comment insert failed:', commentError.message)
      return
    }

    // posts.comment_count is maintained by the on_comment_change DB trigger.

    if (postSlug) {
      revalidatePath(`/community/${postSlug}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown bot scan error'
    console.error('[community] triggerAutonomousBotScan failed:', message)
  }
}
