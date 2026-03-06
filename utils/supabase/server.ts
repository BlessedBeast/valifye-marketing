import { supabase } from '@/lib/supabase'

// 🛡️ THE PROXY: Intercepts legacy calls and returns the secure singleton
export function createClient() {
  return supabase;
}