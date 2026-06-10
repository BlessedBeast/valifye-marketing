import { getSupabaseAdmin } from '@/lib/supabase'

const COMMUNITY_ASSETS_BUCKET = 'community_assets'

/** Max images accepted per post or comment. */
export const MAX_COMMUNITY_IMAGES = 3

/**
 * Pulls valid image attachments from FormData under the `images` key:
 * real, non-empty File entries with an image/* mime type, capped at 3.
 */
export function extractCommunityImageFiles(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File)
    .filter((file) => file.size > 0 && file.type.startsWith('image/'))
    .slice(0, MAX_COMMUNITY_IMAGES)
}

/**
 * Uploads a batch of images sequentially, collecting successful public URLs.
 * Failed individual uploads are skipped rather than failing the batch.
 */
export async function uploadCommunityImages(files: File[]): Promise<string[]> {
  const urls: string[] = []

  for (const file of files) {
    const url = await uploadCommunityImage(file)
    if (url) {
      urls.push(url)
    }
  }

  return urls
}

/**
 * Uploads a community image to the community_assets bucket and returns its
 * public URL. Returns null on any failure — callers treat a failed upload
 * as a skipped attachment, never a fatal error.
 */
export async function uploadCommunityImage(file: File): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin()

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`

    const { error: uploadError } = await supabase.storage
      .from(COMMUNITY_ASSETS_BUCKET)
      .upload(filename, file, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('[community] image upload failed:', uploadError.message)
      return null
    }

    const { data } = supabase.storage
      .from(COMMUNITY_ASSETS_BUCKET)
      .getPublicUrl(filename)

    return data.publicUrl ?? null
  } catch (error) {
    console.error('[community] image upload threw:', error)
    return null
  }
}
