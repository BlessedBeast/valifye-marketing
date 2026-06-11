'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, LogOut } from 'lucide-react'

import { updateProfile } from '@/app/community/actions/profile'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

const MAX_BIO_CHARS = 160

export type ProfileSettingsInitialData = {
  displayName: string
  username: string
  bio: string
  avatarUrl: string | null
}

type ProfileSettingsFormProps = {
  initialProfile: ProfileSettingsInitialData
}

function SettingsAvatar({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) {
  const initial = name.charAt(0).toUpperCase() || '?'

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt="Your avatar"
        width={72}
        height={72}
        className="h-18 w-18 rounded-full border-2 border-zinc-800 object-cover ring-2 ring-amber-500/20"
      />
    )
  }

  return (
    <span
      className="flex h-18 w-18 items-center justify-center rounded-full border-2 border-zinc-800 bg-zinc-900/80 font-mono text-2xl font-bold text-amber-500 ring-2 ring-amber-500/20"
      aria-hidden
    >
      {initial}
    </span>
  )
}

const FIELD_CLASS = cn(
  'w-full rounded-md border border-zinc-800 bg-black/40 px-3 py-2',
  'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
  'transition-colors focus-visible:border-amber-500/50 focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-amber-500/20'
)

const LABEL_CLASS =
  'font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500'

export function ProfileSettingsForm({ initialProfile }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialProfile.displayName)
  const [username, setUsername] = useState(initialProfile.username)
  const [bio, setBio] = useState(initialProfile.bio)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError(signOutError.message)
        setIsSigningOut(false)
        return
      }
      router.push('/founders-lounge')
    } catch {
      setError('Could not sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        const result = await updateProfile(formData)

        if (result.error) {
          setError(result.error)
          return
        }

        setSuccess(true)
        router.refresh()
      } catch {
        setError('Session expired. Please sign in again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg border border-zinc-900 bg-zinc-900/30 p-4">
        <SettingsAvatar
          name={displayName || username}
          avatarUrl={initialProfile.avatarUrl}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-zinc-100">
            {displayName || 'Unnamed founder'}
          </p>
          <p className="truncate font-mono text-xs text-amber-500/80">
            @{username || 'username'}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            Avatar synced from your sign-in provider
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="settings-display-name" className={LABEL_CLASS}>
          Display Name
        </label>
        <input
          id="settings-display-name"
          name="display_name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={50}
          required
          placeholder="Your public name"
          className={FIELD_CLASS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="settings-username" className={LABEL_CLASS}>
          Username
        </label>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm text-amber-500/70"
          >
            @
          </span>
          <input
            id="settings-username"
            name="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value.toLowerCase().replace(/\s/g, ''))
            }
            maxLength={30}
            required
            placeholder="your_handle"
            className={cn(FIELD_CLASS, 'pl-8')}
          />
        </div>
        <p className="font-mono text-[10px] text-zinc-600">
          Lowercase letters, numbers, and underscores. 3–30 characters.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="settings-bio" className={LABEL_CLASS}>
            Bio
          </label>
          <span
            className={cn(
              'font-mono text-[10px] tabular-nums',
              bio.length >= MAX_BIO_CHARS ? 'text-amber-500' : 'text-zinc-600'
            )}
          >
            {bio.length} / {MAX_BIO_CHARS}
          </span>
        </div>
        <textarea
          id="settings-bio"
          name="bio"
          rows={3}
          value={bio}
          onChange={(event) =>
            setBio(event.target.value.slice(0, MAX_BIO_CHARS))
          }
          maxLength={MAX_BIO_CHARS}
          placeholder="What are you building? One or two sharp lines."
          className={cn(FIELD_CLASS, 'resize-none')}
        />
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-5 py-2.5',
            'font-mono text-xs font-bold uppercase tracking-widest text-amber-400',
            'transition-colors hover:bg-amber-500/20',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 font-mono text-xs text-red-400"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            role="status"
            className="rounded-md border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 font-mono text-xs text-emerald-400"
          >
            Profile updated. Changes are live across the lounge.
          </p>
        ) : null}
      </div>

      <div className="border-t border-zinc-900 pt-6">
        <p className={LABEL_CLASS}>Session</p>
        <p className="mt-2 text-sm text-zinc-500">
          Sign out of the Founders Lounge on this device. You can rejoin anytime from
          the public entry page.
        </p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isPending || isSigningOut}
          className={cn(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500/40',
            'bg-red-950/20 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest',
            'text-red-500 transition-colors hover:bg-red-500/10',
            'disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
          )}
        >
          {isSigningOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Signing out…
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign Out
            </>
          )}
        </button>
      </div>
    </form>
  )
}
