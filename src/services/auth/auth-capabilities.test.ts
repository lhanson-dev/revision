import { describe, expect, it } from 'vitest'
import { loadAuthCapabilities } from './auth-capabilities'

describe('loadAuthCapabilities', () => {
  it('enables Google only when Supabase reports the provider enabled', async () => {
    const fetcher = async () => new Response(JSON.stringify({ external: { google: true } }), { status: 200 })

    await expect(loadAuthCapabilities(fetcher as typeof fetch)).resolves.toEqual({ google: true })
  })

  it('fails closed when auth settings cannot be read', async () => {
    const fetcher = async () => new Response('unavailable', { status: 503 })

    await expect(loadAuthCapabilities(fetcher as typeof fetch)).resolves.toEqual({ google: false })
  })
})
