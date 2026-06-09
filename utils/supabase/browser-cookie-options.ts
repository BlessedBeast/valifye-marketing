import type { CookieOptions } from '@supabase/ssr'

/**
 * Shared auth cookie defaults for cross-subdomain SSO on valifye.com.
 * Domain is omitted on localhost so local dev keeps working.
 */
export function getBrowserAuthCookieOptions(): CookieOptions {
  if (typeof window === 'undefined') {
    return {
      path: '/',
      sameSite: 'lax',
      secure: true,
    }
  }

  const isValifyeHost = window.location.hostname.includes('valifye.com')

  return {
    domain: isValifyeHost ? '.valifye.com' : undefined,
    path: '/',
    sameSite: 'lax',
    secure: true,
  }
}
