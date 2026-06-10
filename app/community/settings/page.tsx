import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import {
  ProfileSettingsForm,
  type ProfileSettingsInitialData,
} from '@/components/community/ProfileSettingsForm'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profile Settings — Founders Lounge | Valifye',
  description: 'Manage your Founders Lounge identity, handle, and bio.',
}

type ProfileSettingsRow = {
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default async function CommunitySettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/community')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .maybeSingle<ProfileSettingsRow>()

  if (profileError) {
    console.error('[community] settings profile fetch failed:', profileError.message)
  }

  const initialProfile: ProfileSettingsInitialData = {
    displayName: profile?.display_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <header className="space-y-2 border-b border-zinc-900 pb-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/80">
          {'// Identity Console'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Profile Settings
        </h1>
        <p className="text-sm text-zinc-500">
          Control how you appear across threads, the leaderboard, and your
          public profile.
        </p>
      </header>

      <ProfileSettingsForm initialProfile={initialProfile} />
    </div>
  )
}
