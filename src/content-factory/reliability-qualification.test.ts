import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'

describe('Content Factory reliability qualification gate', () => {
  it('fails closed before paid live-pilot execution while qualification is paused', () => {
    const result = spawnSync(process.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], {
      encoding: 'utf8',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('content_factory_live_pilot_paused')
    expect(result.stderr).toContain('course-agnostic qualification gates')
  })
})
