import { createBrowserClient } from '@supabase/ssr'

import { getBrowserAuthCookieOptions } from '@/utils/supabase/browser-cookie-options'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: getBrowserAuthCookieOptions(),
    }
  )
}
