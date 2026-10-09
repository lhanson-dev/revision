import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const courses = readFileSync(new URL('../../src/app/courses-v2.css', import.meta.url), 'utf8')
const overview = readFileSync(new URL('../../src/app/course-overview-v2.css', import.meta.url), 'utf8')
const coursesBase = readFileSync(new URL('../../src/app/courses.css', import.meta.url), 'utf8')

describe('C3 Courses and Course Overview canonical token migration', () => {
  it('removes the retired v2 compatibility namespace from the scoped v2 page styles', () => {
    expect(courses).not.toMatch(/--rv-[a-z0-9-]+/)
    expect(overview).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses canonical learner roles for Courses and Course Overview', () => {
    for (const role of [
      'var(--color-surface)',
      'var(--color-border)',
      'var(--font-family-display)',
    ]) {
      expect(courses).toContain(role)
      expect(overview).toContain(role)
    }

    expect(courses).toContain('var(--type-learner-h1-size)')
    expect(courses).toContain('var(--radius-surface)')
    expect(overview).toContain('var(--radius-feature)')
    expect(overview).toContain('var(--radius-surface)')
    expect(overview).toContain('var(--radius-control)')
    expect(overview).toContain('var(--learning-status-gotit)')
    expect(overview).toContain('var(--learning-status-needswork)')
    expect(overview).toContain('border-color: var(--color-action)')
  })

  it('keeps the Courses mobile modal inside the canonical surface radius family', () => {
    expect(coursesBase).toContain('border-radius: var(--radius-surface) var(--radius-surface) 0 0;')
    expect(coursesBase).not.toContain('border-radius: 24px 24px 0 0;')
  })
})
