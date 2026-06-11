import { NextResponse } from 'next/server'

import { resend } from '@/lib/resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { CommentRow, PostRow, ProfileRow } from '@/types/supabase'

export const dynamic = 'force-dynamic'

const SENDER = 'Valifye Lounge <notifications@valifye.com>'
const THREAD_BASE_URL = 'https://www.valifye.com/community'
const COMMENT_PREVIEW_MAX = 180

type SupabaseInsertWebhookPayload = {
  type: string
  table: string
  schema: string
  record: CommentRow
  old_record: CommentRow | null
}

type PostNotificationRow = Pick<PostRow, 'id' | 'title' | 'slug' | 'author_id'>
type ProfileNameRow = Pick<ProfileRow, 'id' | 'display_name' | 'username'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseInsertPayload(body: unknown): SupabaseInsertWebhookPayload | null {
  if (!isRecord(body)) return null
  if (body.type !== 'INSERT' || body.table !== 'comments' || body.schema !== 'public') {
    return null
  }
  if (!isRecord(body.record)) return null

  const record = body.record
  if (
    typeof record.id !== 'string' ||
    typeof record.post_id !== 'string' ||
    typeof record.body !== 'string'
  ) {
    return null
  }

  return {
    type: 'INSERT',
    table: 'comments',
    schema: 'public',
    record: record as CommentRow,
    old_record: isRecord(body.old_record) ? (body.old_record as CommentRow) : null,
  }
}

function displayName(profile: ProfileNameRow | null): string {
  if (!profile) return 'A founder'
  const name = profile.display_name?.trim()
  if (name) return name
  return profile.username
}

function truncateComment(body: string): string {
  const trimmed = body.trim()
  if (trimmed.length <= COMMENT_PREVIEW_MAX) return trimmed
  return `${trimmed.slice(0, COMMENT_PREVIEW_MAX).trimEnd()}…`
}

function buildEmailHtml(params: {
  recipientName: string
  commenterName: string
  postTitle: string
  commentPreview: string
  threadUrl: string
}): string {
  const { recipientName, commenterName, postTitle, commentPreview, threadUrl } =
    params

  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#e4e4e7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#111;border:1px solid #27272a;border-radius:12px;padding:28px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#f59e0b;">Valifye Lounge</p>
                <h1 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#fafafa;">New critique on your thread</h1>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a1a1aa;">
                  Hi ${recipientName}, <strong style="color:#fafafa;">${commenterName}</strong> left feedback on
                  <strong style="color:#fafafa;">${postTitle}</strong>.
                </p>
                <blockquote style="margin:0 0 24px;padding:14px 16px;border-left:3px solid #f59e0b;background:#18181b;font-size:13px;line-height:1.6;font-style:italic;color:#d4d4d8;">
                  ${commentPreview}
                </blockquote>
                <a href="${threadUrl}" style="display:inline-block;padding:12px 20px;background:#f59e0b;color:#0a0a0a;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:8px;">
                  View Thread
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (!webhookSecret || webhookSecret.trim() === '') {
      console.error('[comment-notification] SUPABASE_WEBHOOK_SECRET is not configured.')
      return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return unauthorized()
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
    }

    const payload = parseInsertPayload(body)
    if (!payload) {
      return NextResponse.json({ message: 'Ignored non-comment insert event.' })
    }

    const { post_id: postId, author_id: commenterId, body: commentBody, is_bot: isBot } =
      payload.record

    if (isBot || !commenterId) {
      return NextResponse.json({ message: 'Bot or anonymous comment. No notification sent.' })
    }

    const supabase = getSupabaseAdmin()

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, slug, author_id')
      .eq('id', postId)
      .maybeSingle<PostNotificationRow>()

    if (postError) {
      console.error('[comment-notification] post lookup failed:', postError.message)
      return NextResponse.json({ error: 'Failed to load parent post.' }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: 'Parent post not found.' }, { status: 404 })
    }

    if (commenterId === post.author_id) {
      return NextResponse.json({ message: 'Self-comment. No notification sent.' })
    }

    const profileIds = [post.author_id, commenterId]
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', profileIds)

    if (profilesError) {
      console.error('[comment-notification] profile lookup failed:', profilesError.message)
      return NextResponse.json({ error: 'Failed to load profiles.' }, { status: 500 })
    }

    const profileRows = (profiles ?? []) as ProfileNameRow[]
    const postAuthorProfile =
      profileRows.find((row) => row.id === post.author_id) ?? null
    const commenterProfile =
      profileRows.find((row) => row.id === commenterId) ?? null

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(post.author_id)

    if (authError) {
      console.error('[comment-notification] auth lookup failed:', authError.message)
      return NextResponse.json({ error: 'Failed to load post author.' }, { status: 500 })
    }

    const recipientEmail = authUser.user?.email?.trim()
    if (!recipientEmail) {
      return NextResponse.json({ message: 'Post author has no email on file.' })
    }

    const recipientName = displayName(postAuthorProfile)
    const commenterName = displayName(commenterProfile)
    const postTitle = post.title.trim() || 'your thread'
    const threadUrl = `${THREAD_BASE_URL}/${post.slug}`
    const commentPreview = truncateComment(commentBody)

    const { error: sendError } = await resend.emails.send({
      from: SENDER,
      to: recipientEmail,
      subject: `🔥 New critique on '${postTitle}'`,
      html: buildEmailHtml({
        recipientName,
        commenterName,
        postTitle,
        commentPreview,
        threadUrl,
      }),
    })

    if (sendError) {
      console.error('[comment-notification] resend failed:', sendError)
      return NextResponse.json({ error: 'Failed to send notification email.' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Notification email sent.',
      postId: post.id,
      recipientEmail,
    })
  } catch (error) {
    console.error('[comment-notification] unhandled error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
