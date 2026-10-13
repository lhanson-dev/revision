import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { activeNotNow, dayKey, rankSuggestions } from './rev-suggestions'
import { buildCourseTiles } from './home-view'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const business = allCatalogueCourses(catalogue).find((item) => item.subject.id === 'business')
if (!business) throw new Error('Business course missing from the catalogue')
const course = business
const moduleId = course.course.learningAdapter.manifest.id
const topics = course.course.learningAdapter.listTopics()
const now = new Date(2026, 9, 1, 9, 0)

/** Six wrong answers across two evidence types: the engine reads this as low knowledge (Needs work). */
function weak(topicId: string, when = '2026-09-30T10:00:00.000Z'): LearningEvidence[] {
  const common = { moduleId, topicId, occurredAt: when, schemaVersion: 1 as const }
  return [
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-f${n}`, contentId: `${topicId}-f${n}`, source: 'flashcard' as const, rating: 0 as const })),
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-m${n}`, contentId: `${topicId}-m${n}`, source: 'multiple_choice' as const, correct: false, selectedOption: 0, correctOption: 1 })),
  ]
}

const stateWith = (evidence: LearningEvidence[]) => createCourseLearningState(course.course, evidence)

describe('REV uses the shared deterministic fallback', () => {
  it('offers real supported unscheduled work and repeats identically', () => {
    const result = rankSuggestions([stateWith([])], [], [course], now)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((s) => s.task.source === 'fallback')).toBe(true)
    expect(result).toEqual(rankSuggestions([stateWith([])], [], [course], now))
    expect(rankSuggestions([], [], [course], now)).toEqual([])
  })
  it('expires Not now at local midnight', () => {
    const record = { day: dayKey(now), keys: ['hidden'] }
    expect(activeNotNow(record, now)).toEqual(['hidden'])
    expect(activeNotNow(record, new Date(2026, 9, 2))).toEqual([])
  })
})

describe('Home course tiles', () => {
  it('shows topics covered and understanding counts, with an honest empty start', () => {
    const [empty] = buildCourseTiles([course], [stateWith([])])
    expect(empty.covered).toBe(0)
    expect(empty.total).toBe(topics.length)
    expect(empty.counts).toEqual({ notstarted: topics.length })
    expect(empty.hue).toBe('blue')
    expect(empty.mark).toBe('B')

    const [started] = buildCourseTiles([course], [stateWith(weak(topics[0].id))])
    expect(started.covered).toBe(1)
    expect(started.counts.needswork).toBe(1)
    expect(started.counts.notstarted).toBe(topics.length - 1)
  })
})
