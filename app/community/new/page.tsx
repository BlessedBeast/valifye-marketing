import Link from 'next/link'

import {
  CreateThreadForm,
  GuestAuthPrompt,
} from '@/components/community/CreateThreadForm'
import { getCommunityProfile } from '@/lib/community/profile'
import { getTodayTheme } from '@/lib/community/themes'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CreateThreadPage() {
  const todayTheme = getTodayTheme()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getCommunityProfile() : null
  const karmaPoints = profile?.karmaPoints ?? 0

  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-border pb-6">
        <Link
          href="/community"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          ← Back to feed
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create Thread Engine</h1>
        <p className="text-sm text-muted-foreground">
          Posts are validated against today&apos;s theme schedule and your Karma tier
          before publishing.
        </p>
      </header>

      {!user || !profile ? (
        <GuestAuthPrompt />
      ) : (
        <CreateThreadForm todayTheme={todayTheme} karmaPoints={karmaPoints} />
      )}
    </div>
  )
}
