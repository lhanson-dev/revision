import { describe, expect, it } from 'vitest'
import { scanText } from './scan-secrets.mjs'

describe('repository secret/config scanner', () => {
  it('allows browser-safe Supabase publishable keys', () => {
    expect(scanText('src/services/supabase/browser-client.ts', "const key = 'sb_publishable_N4uw63Yo5_dHLo04C5Tw_g_o8OMXTmG'")).toEqual([])
  })

  it('rejects Supabase secret keys and privileged literals', () => {
    const supabaseSecret = ['sb', 'secret', 'abcdefghijklmnopqrstuvwxyz123456'].join('_')
    expect(scanText('config.ts', `const key = '${supabaseSecret}'`)).toEqual([
      { path: 'config.ts', kind: 'Supabase secret key' },
    ])

    const serviceRoleName = ['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_')
    expect(scanText('config.ts', `${serviceRoleName} = 'definitely-a-real-secret-value'`)).toEqual([
      { path: 'config.ts', kind: 'Literal privileged configuration: SUPABASE_SERVICE_ROLE_KEY' },
    ])
  })

  it('rejects privileged credential references in browser source', () => {
    expect(scanText('src/services/example.ts', 'const role = service_role')).toContainEqual({
      path: 'src/services/example.ts',
      kind: 'Privileged Supabase credential reference in browser/application source',
    })
  })

  it('rejects private key blocks and credential-bearing database urls', () => {
    const privateKey = `-----BEGIN ${'PRIVATE KEY-----'}`
    expect(scanText('ops.env', privateKey)).toContainEqual({ path: 'ops.env', kind: 'Private key block' })

    const databaseUrl = `postgresql://${'revision:supersecret@db.example.com/revision'}`
    expect(scanText('ops.env', databaseUrl)).toContainEqual({
      path: 'ops.env',
      kind: 'Credential-bearing database URL',
    })
  })
})
