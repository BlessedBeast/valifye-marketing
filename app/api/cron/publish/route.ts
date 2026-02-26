import { supabaseAdmin } from '@/lib/supabase'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // 🔐 Verify CRON secret
if (
    req.headers.get('authorization') !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // 1️⃣ Get draft rows
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
      published: 0
    })
  }

  // 2️⃣ Publish rows
  await supabaseAdmin
    .from('market_data')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .in('id', rows.map((r) => r.id))

  // 3️⃣ Revalidate each page
  for (const row of rows) {
    try {
      await fetch(
        `${baseUrl}/api/revalidate?slug=${row.slug}&secret=${process.env.REVALIDATION_SECRET}`
      )
    } catch (e) {
      console.error('Revalidate failed for:', row.slug)
    }
  }

  // 4️⃣ Google Indexing API (optional)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        ),
        scopes: ['https://www.googleapis.com/auth/indexing']
      })

      const indexing = google.indexing({ version: 'v3', auth })

      for (const row of rows) {
        try {
          await indexing.urlNotifications.publish({
            requestBody: {
              url: `${baseUrl}/ideas/${row.slug}`,
              type: 'URL_UPDATED'
            }
          })

          await new Promise((r) => setTimeout(r, 150))
        } catch (e) {
          console.error('Indexing failed for:', row.slug)
        }
      }
    } catch (e) {
      console.error('Indexing setup error:', e)
    }
  }

  return NextResponse.json({ published: rows.length })
}