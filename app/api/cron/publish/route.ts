import { google } from 'googleapis'
import { NextResponse } from 'next/server'

import { wrapQStashCronHandler } from '@/lib/qstash/cron-verify'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * Publishes draft market_data rows, revalidates pages, and optionally
 * submits URLs to the Google Indexing API. Secured by QStash signature
 * verification (Upstash-Signature header).
 */
async function handler(): Promise<Response> {
  const supabaseAdmin = getSupabaseAdmin()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const isProductionUrl =
    baseUrl &&
    !baseUrl.includes('localhost') &&
    (baseUrl.startsWith('https://') || baseUrl.startsWith('http://'))

  const { data: rows, error } = await supabaseAdmin
    .from('market_data')
    .select('id, slug')
    .eq('status', 'draft')
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({
      message: 'No drafts to publish',
      published: 0,
    })
  }

  await supabaseAdmin
    .from('market_data')
    .update({
      status: 'published',
      google_index_status: 'submitted',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in(
      'id',
      rows.map((r) => r.id)
    )

  if (baseUrl) {
    for (const row of rows) {
      try {
        await fetch(
          `${baseUrl}/api/revalidate?slug=${row.slug}&secret=${process.env.REVALIDATION_SECRET}`
        )
      } catch {
        console.error('Revalidate failed for:', row.slug)
      }
    }
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && isProductionUrl && baseUrl) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
        scopes: ['https://www.googleapis.com/auth/indexing'],
      })

      const indexing = google.indexing({ version: 'v3', auth })

      for (const row of rows) {
        try {
          await indexing.urlNotifications.publish({
            requestBody: {
              url: `${baseUrl}/ideas/${row.slug}`,
              type: 'URL_UPDATED',
            },
          })

          await supabaseAdmin
            .from('market_data')
            .update({ indexed_at: new Date().toISOString() })
            .eq('id', row.id)

          await new Promise((r) => setTimeout(r, 150))
        } catch {
          console.error('Indexing failed for:', row.slug)
        }
      }
    } catch (e) {
      console.error('Indexing setup error:', e)
    }
  }

  return NextResponse.json({ published: rows.length })
}

export const POST = wrapQStashCronHandler(handler)

const METHOD_NOT_ALLOWED = () =>
  NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405, headers: { Allow: 'POST' } }
  )

export const GET = METHOD_NOT_ALLOWED
export const PUT = METHOD_NOT_ALLOWED
export const DELETE = METHOD_NOT_ALLOWED
export const PATCH = METHOD_NOT_ALLOWED
