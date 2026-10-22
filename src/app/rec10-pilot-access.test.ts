import { describe, expect, it } from 'vitest'
import { verifiedRec10PilotUserId } from './rec10-pilot-access'

describe('REC-10 approved signed cohort identity', () => {
  const id = '11111111-1111-4111-8111-111111111111'
  it('fails closed for missing, mismatched and different-product claims', () => {
    expect(verifiedRec10PilotUserId(null, id)).toBeNull()
    expect(verifiedRec10PilotUserId({ id }, id)).toBeNull()
    expect(verifiedRec10PilotUserId({ id, app_metadata: { revision_rec10_pilot: 'true' } }, id)).toBeNull()
    expect(verifiedRec10PilotUserId({ id, app_metadata: { revision_fi001_pilot: true } }, id)).toBeNull()
    expect(verifiedRec10PilotUserId({ id, app_metadata: { revision_rec10_pilot: true } }, 'other')).toBeNull()
    expect(verifiedRec10PilotUserId({ id, app_metadata: { revision_rec10_pilot: false } }, id)).toBeNull()
  })
  it('accepts only the exactly matching, true Auth app_metadata claim', () => {
    expect(verifiedRec10PilotUserId({ id, app_metadata: { revision_rec10_pilot: true } }, id)).toBe(id)
  })
})
