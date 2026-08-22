import { describe, expect, it } from 'vitest'
import { buildCatalogue } from './catalogue-model'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { projectLearnerProgramme } from './learner-programme'

const catalogue = buildCatalogue(listAvailableContentAdapters())

function membership(courseId: string) {
  return { userId: '00000000-0000-4000-8000-000000000111', courseId, createdAt: '2026-08-22T00:00:00.000Z' }
}

describe('learner programme projection', () => {
  it('contains only explicitly saved courses', () => {
    const projection = projectLearnerProgramme(catalogue, [membership('aqa:aqa-as:7131')])
    expect(projection.courses.map((item) => item.course.id)).toEqual(['aqa:aqa-as:7131'])
  })

  it('does not silently remap an unknown saved course', () => {
    const projection = projectLearnerProgramme(catalogue, [membership('unknown:course')])
    expect(projection.courses).toEqual([])
    expect(projection.unknownCourseIds).toEqual(['unknown:course'])
  })

  it('keeps multiple saved course identities distinct even when they share a subject', () => {
    const projection = projectLearnerProgramme(catalogue, [
      membership('aqa:aqa-a-level:7132'),
      membership('aqa:aqa-as:7131'),
    ])
    expect(new Set(projection.courses.map((item) => item.course.id))).toEqual(new Set([
      'aqa:aqa-a-level:7132',
      'aqa:aqa-as:7131',
    ]))
  })
})
