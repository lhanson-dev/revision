import { createClient } from '@supabase/supabase-js'

const productionSupabaseUrl = 'https://xwwhshpmeogswxfjtpvq.supabase.co'
const productionSupabasePublishableKey = 'sb_publishable_N4uw63Yo5_dHLo04C5Tw_g_o8OMXTmG'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || productionSupabaseUrl
export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || productionSupabasePublishableKey

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function currentAppUrl() {
  return new URL('./', window.location.href).toString()
}
