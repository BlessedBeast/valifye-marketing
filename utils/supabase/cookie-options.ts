import type { CookieOptions } from '@supabase/ssr'

/** Root domain shared by app.valifye.com and valifye.com for SSO cookies. */
const AUTH_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN ??
  (process.env.NODE_ENV === 'production' ? 'valifye.com' : undefined)

export function applyAuthCookieOptions(options: CookieOptions): CookieOptions {
  if (!AUTH_COOKIE_DOMAIN) {
    return options
  }

  return {
    ...options,
    domain: AUTH_COOKIE_DOMAIN,
  }
}
