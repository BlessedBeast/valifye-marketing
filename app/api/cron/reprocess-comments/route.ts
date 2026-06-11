import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { NextResponse } from 'next/server'

import { reprocessOrphanedComments } from '@/lib/community/moderation'

export const dynamic = 'force-dynamic'

/**
 * Fail-safe recovery cron: re-runs the moderation pipeline over comments
 * whose deferred scoring pass never completed. Secured by QStash signature
 * verification (Upstash-Signature header).
 */
async function handler(): Promise<Response> {
  try {
    const result = await reprocessOrphanedComments()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron] reprocess-comments failed:', error)
    return NextResponse.json({ error: 'Reprocess failed.' }, { status: 500 })
  }
}

export const POST = verifySignatureAppRouter(handler)

const METHOD_NOT_ALLOWED = () =>
  NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405, headers: { Allow: 'POST' } }
  )

export const GET = METHOD_NOT_ALLOWED
export const PUT = METHOD_NOT_ALLOWED
export const DELETE = METHOD_NOT_ALLOWED
export const PATCH = METHOD_NOT_ALLOWED
