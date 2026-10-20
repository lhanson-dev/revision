import { describe, expect, it } from 'vitest'
import { verifiedFi001PilotUserId } from './fi001-pilot-access'

describe('FI-001 restricted account gate', () => {
  it('fails closed without a matching trusted Auth user and explicit app metadata', () => {
    const id = '11111111-1111-4111-8111-111111111111'
    expect(verifiedFi001PilotUserId(null, id)).toBeNull()
    expect(verifiedFi001PilotUserId({ id, app_metadata: {} }, id)).toBeNull()
    expect(verifiedFi001PilotUserId({ id, app_metadata: { revision_fi001_pilot: 'true' } }, id)).toBeNull()
    expect(verifiedFi001PilotUserId({ id, app_metadata: { revision_fi001_pilot: true } }, 'different-user')).toBeNull()
    expect(verifiedFi001PilotUserId({ id, app_metadata: { revision_fi001_pilot: true } }, id)).toBe(id)
  })
})
