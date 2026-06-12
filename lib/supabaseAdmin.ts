import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error(
    '[supabaseAdmin] Missing NEXT_PUBLIC_SUPABASE_URL — required for build-time pSEO fetches'
  )
}

if (!serviceRoleKey) {
  throw new Error(
    '[supabaseAdmin] Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local (server-only, never expose to client)'
  )
}

/**
 * Server-only Supabase client (service role). Use in generateStaticParams,
 * build-time redirect generation, and other server-only code — never in client bundles.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
