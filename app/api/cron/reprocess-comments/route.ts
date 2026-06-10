import { createHash, timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { reprocessOrphanedComments } from '@/lib/community/moderation'

export const dynamic = 'force-dynamic'

/**
 * Constant-time token comparison. Hashing both sides to fixed-length
 * digests equalizes buffer lengths so timingSafeEqual never throws and
 * no length information leaks.
 */
function safeCompare(candidate: string | null, secret: string): boolean {
  if (candidate == null) return false
  const candidateDigest = createHash('sha256').update(candidate).digest()
  const secretDigest = createHash('sha256').update(secret).digest()
  return timingSafeEqual(candidateDigest, secretDigest)
}

/**
 * Fail-safe recovery cron: re-runs the moderation pipeline over comments
 * whose deferred scoring pass never completed. Secured by CRON_SECRET via
 * the Authorization header (Vercel Cron convention) or a ?token= fallback.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET

  if (!secret || secret.trim() === '') {
    console.error('[cron] CRON_SECRET is not configured.')
    return NextResponse.json({ error: 'Cron not configured.' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null
  const tokenParam = new URL(request.url).searchParams.get('token')

  const authorized =
    safeCompare(bearerToken, secret) || safeCompare(tokenParam, secret)

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const result = await reprocessOrphanedComments()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron] reprocess-comments failed:', error)
    return NextResponse.json({ error: 'Reprocess failed.' }, { status: 500 })
  }
}

const METHOD_NOT_ALLOWED = () =>
  NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405, headers: { Allow: 'GET' } }
  )

export const POST = METHOD_NOT_ALLOWED
export const PUT = METHOD_NOT_ALLOWED
export const DELETE = METHOD_NOT_ALLOWED
export const PATCH = METHOD_NOT_ALLOWED
