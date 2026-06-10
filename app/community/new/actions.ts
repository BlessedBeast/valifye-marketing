'use server'

import { after } from 'next/server'
import { redirect } from 'next/navigation'

import { triggerAutonomousBotScan } from '@/app/community/actions/bot-scan'
import { schedulePostModeration } from '@/lib/community/moderation'
import { getSpaceAvailabilityForTheme } from '@/lib/community/theme-guards'
import {
  createPostSchema,
  KARMA_PRODUCT_URL_THRESHOLD,
  validatePostForTheme,
  type CreatePostInput,
  type PostInsert,
} from '@/lib/community/post-schema'
import { getTodayTheme } from '@/lib/community/themes'
import {
  extractCommunityImageFiles,
  uploadCommunityImages,
} from '@/lib/supabase/storage'
import { createClient } from '@/utils/supabase/server'

export type CreatePostState = {
  error?: string
}

export async function createCommunityPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('karma_points')
    .eq('id', user.id)
    .maybeSingle<{ karma_points: number | null }>()

  if (profileError) {
    console.error('[community] profile lookup failed:', profileError.message)
  }

  const karmaPoints = profile?.karma_points ?? 0

  const raw: CreatePostInput = {
    title: String(formData.get('title') ?? ''),
    space: String(formData.get('space') ?? '') as CreatePostInput['space'],
    stage: String(formData.get('stage') ?? '') as CreatePostInput['stage'],
    body: String(formData.get('body') ?? ''),
    productUrl: String(formData.get('productUrl') ?? ''),
  }

  const parsed = createPostSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid post data.' }
  }

  const input = parsed.data
  const theme = getTodayTheme()
  const spaceAvailability = getSpaceAvailabilityForTheme(
    input.space,
    theme,
    karmaPoints
  )

  if (!spaceAvailability.allowed) {
    return { error: spaceAvailability.reason ?? 'This space is locked today.' }
  }

  const themeError = validatePostForTheme(input, theme)
  if (themeError) {
    return { error: themeError }
  }

  const productUrl = input.productUrl.trim()
  if (productUrl && karmaPoints < KARMA_PRODUCT_URL_THRESHOLD) {
    return {
      error:
        'Product URLs require 10+ Karma. Review other founders to unlock link sharing.',
    }
  }

  const imageFiles = extractCommunityImageFiles(formData)
  const imageUrls = await uploadCommunityImages(imageFiles)

  const row: PostInsert = {
    author_id: user.id,
    title: input.title,
    body: input.body,
    space: input.space,
    stage: input.stage,
    product_url: productUrl || null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(row)
    .select('id, slug')
    .single<{ id: string; slug: string }>()

  if (error || !data?.slug || !data.id) {
    console.error('[community] post insert failed:', error?.message)
    return { error: error?.message ?? 'Failed to create post. Please try again.' }
  }

  // Deferred thread quality pass; bot threads are shielded inside.
  schedulePostModeration({
    postId: data.id,
    body: input.body,
    isBot: false,
  })

  const market = input.title.trim() || `${input.space} market`
  after(() => {
    void triggerAutonomousBotScan(data.id, market, input.body, data.slug).catch(
      (scanError) => {
        console.error('[community] autonomous bot scan failed:', scanError)
      }
    )
  })

  redirect(`/community/${data.slug}`)
}
