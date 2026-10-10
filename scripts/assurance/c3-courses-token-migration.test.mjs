import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const courses = readFileSync(new URL('../../src/app/courses-v2.css', import.meta.url), 'utf8')
const coursesBase = readFileSync(new URL('../../src/app/courses.css', import.meta.url), 'utf8')
const overview = readFileSync(new URL('../../src/app/course-overview-v2.css', import.meta.url), 'utf8')
const overviewRev = readFileSync(new URL('../../src/app/course-overview-rev-feature.css', import.meta.url), 'utf8')

describe('C3 Courses and Course Overview canonical token migration', () => {
  it('removes direct retired v2 compatibility roles from the local C3 stylesheets', () => {
    expect(courses).not.toMatch(/--rv-[a-z0-9-]+/)
    expect(overview).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses canonical learner roles for Courses and Course Overview', () => {
    for (const role of [
      'var(--color-surface)',
      'var(--color-border)',
      'var(--color-text-secondary)',
      'var(--font-family-display)',
      'var(--radius-surface)',
      'var(--type-learner-h1-size)',
    ]) expect(courses).toContain(role)

    // The governed C4 composition removes whole-topic status rows and their
    // local state/pill styling. Those roles still belong to shared Progress
    // and REV primitives; verify only roles owned by the live Overview page.
    for (const role of [
      'var(--color-surface)',
      'var(--color-surface-soft)',
      'var(--color-border)',
      'var(--color-text)',
      'var(--color-text-secondary)',
      'var(--radius-surface)',
      'var(--radius-feature)',
      'var(--type-learner-h3-size)',
      'var(--font-family-display)',
    ]) expect(overview).toContain(role)
  })

  it('does not retain the superseded local Courses/Overview radius values', () => {
    for (const css of [courses, coursesBase, overview, overviewRev]) {
      expect(css).not.toMatch(/border-radius:\s*(?:10|13|16|18|24)px/)
    }
  })
})
