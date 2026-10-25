import { describe, expect, it } from 'vitest'
import { fi001RestrictedContent } from './fi001-pilot-mode'

describe('ordinary authenticated learner programme access', () => {
  it('never withholds published exam preparation by pilot metadata', () => {
    expect(fi001RestrictedContent(false)).toBe(false)
    expect(fi001RestrictedContent(true)).toBe(false)
  })
})
