'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'

export type UpdateProfileResult = {
  success?: boolean
  error?: string
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/
const MAX_DISPLAY_NAME_CHARS = 50
const MAX_BIO_CHARS = 160

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

/**
 * Updates the signed-in user's identity fields on public.profiles.
 * Enforces username format + uniqueness before writing.
 */
export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const displayName = String(formData.get('display_name') ?? '').trim()
  const username = String(formData.get('username') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()

  if (displayName.length < 2 || displayName.length > MAX_DISPLAY_NAME_CHARS) {
    return { error: 'Display name must be between 2 and 50 characters.' }
  }

  if (username !== username.toLowerCase() || /\s/.test(username)) {
    return { error: 'Username must be lowercase and contain no spaces.' }
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        'Username must be 3–30 characters: lowercase letters, numbers, and underscores only.',
    }
  }

  if (bio.length > MAX_BIO_CHARS) {
    return { error: `Bio must be ${MAX_BIO_CHARS} characters or fewer.` }
  }

  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle<{ id: string }>()

  if (lookupError) {
    console.error('[community] username lookup failed:', lookupError.message)
    return { error: 'Could not verify username availability. Try again.' }
  }

  if (existing?.id) {
    return { error: 'This username is already taken.' }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      username,
      bio: bio || null,
    })
    .eq('id', user.id)

  if (updateError) {
    // Race guard: another request may have claimed the username between
    // the availability check and this write.
    if (isUniqueViolation(updateError)) {
      return { error: 'This username is already taken.' }
    }
    console.error('[community] profile update failed:', updateError.message)
    return { error: 'Failed to save profile. Please try again.' }
  }

  revalidatePath('/community')
  revalidatePath('/community/settings')

  return { success: true }
}
