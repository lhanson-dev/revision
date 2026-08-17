import { describe, expect, it } from 'vitest'
import { architectureBoundaries, isArchitectureBoundary } from './foundation'

describe('architecture foundation', () => {
  it('keeps the approved application boundaries explicit', () => {
    expect(architectureBoundaries).toEqual(['app', 'engine', 'services', 'content'])
  })

  it('recognises only approved boundaries', () => {
    expect(isArchitectureBoundary('engine')).toBe(true)
    expect(isArchitectureBoundary('business-paper-2')).toBe(false)
  })
})
