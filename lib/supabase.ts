import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🛡️ THE SINGLETON: Ensures only ONE client exists in the browser
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side: Create a fresh client per request
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  // Client-side: Reuse the existing instance to prevent LockManager timeouts
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'valifye-auth-token' // Specific key to avoid collisions
      }
    });
  }
  return supabaseInstance;
})();

/**
 * 🚨 SECURITY RULE: Never use this on the client side.
 * This is for Server Actions or API routes ONLY.
 */
export const getSupabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}