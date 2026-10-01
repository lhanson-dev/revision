import { describe, expect, it } from 'vitest'
import { FALLBACK_HUE, resolveSubjectIdentity } from './subject-palette'

describe('resolveSubjectIdentity', () => {
  it('uses the subject map for known subjects', () => {
    expect(resolveSubjectIdentity('business', 'Business')).toEqual({ hue: 'blue', mark: 'B' })
  })

  it('gives an unknown subject a neutral hue and its first letter, never a brand, status or made-up colour', () => {
    const unknown = resolveSubjectIdentity('astronomy', 'astronomy')
    expect(unknown).toEqual({ hue: FALLBACK_HUE, mark: 'A' })
    expect(['teal', 'yellow', 'coral']).not.toContain(unknown.hue)
  })
})
