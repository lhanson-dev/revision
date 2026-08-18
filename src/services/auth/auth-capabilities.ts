import { supabasePublishableKey, supabaseUrl } from '../supabase/browser-client'

export type AuthCapabilities = {
  google: boolean
}

const unavailableCapabilities: AuthCapabilities = { google: false }

export async function loadAuthCapabilities(fetcher: typeof fetch = fetch): Promise<AuthCapabilities> {
  try {
    const response = await fetcher(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabasePublishableKey },
    })

    if (!response.ok) return unavailableCapabilities

    const payload = await response.json() as { external?: Record<string, unknown> }
    return {
      google: payload.external?.google === true,
    }
  } catch {
    return unavailableCapabilities
  }
}
