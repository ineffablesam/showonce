import { createClient } from '@supabase/supabase-js'

export function createSupabaseBrowser(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
