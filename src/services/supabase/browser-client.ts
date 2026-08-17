import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xwwhshpmeogswxfjtpvq.supabase.co'
const supabasePublishableKey = 'sb_publishable_N4uw63Yo5_dHLo04C5Tw_g_o8OMXTmG'

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
