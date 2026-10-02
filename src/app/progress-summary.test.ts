import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { HOW_THIS_IS_WORKED_OUT, nextProgressAction, progressMeasuresFor, progressSummarySentence, readinessAcross, readinessFor } from './progress-summary'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const business = allCatalogueCourses(catalogue).find((item) => item.subject.id === 'business')
if (!business) throw new Error('Business missing')
const moduleId = business.course.learningAdapter.manifest.id
const topics = business.course.learningAdapter.listTopics().map((topic) => topic.id)
const now = new Date(2026, 9, 7, 9, 0)

function weak(topicId: string): LearningEvidence[] {
  const common = { moduleId, topicId, occurredAt: '2026-10-05T10:00:00.000Z', schemaVersion: 1 as const }
  return [
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-f${n}`, contentId: `${topicId}-f${n}`, source: 'flashcard' as const, rating: 0 as const })),
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-m${n}`, contentId: `${topicId}-m${n}`, source: 'multiple_choice' as const, correct: false, selectedOption: 0, correctOption: 1 })),
  ]
}

describe('Progress summary', () => {
  it('counts topics covered and sorts every topic into a status, never blending them', () => {
    const empty = progressMeasuresFor([createCourseLearningState(business.course, [])])
    expect(empty).toEqual({ covered: 0, total: topics.length, understanding: { notstarted: topics.length } })
    const started = progressMeasuresFor([createCourseLearningState(business.course, weak(topics[0]))])
    expect(started.covered).toBe(1)
    expect(started.understanding.needswork).toBe(1)
  })

  it('opens with a plain sentence that suits a brand-new student', () => {
    const empty = progressMeasuresFor([createCourseLearningState(business.course, [])])
    expect(progressSummarySentence(empty, 'Finance')).toBe('You haven’t answered anything yet. Start with Finance and your progress will build here.')
    expect(progressSummarySentence(empty, null)).toContain('You haven’t answered anything yet.')
  })

  it('says what has been covered and how it is going, using the five fixed words', () => {
    const state = createCourseLearningState(business.course, weak(topics[0]))
    const sentence = progressSummarySentence(progressMeasuresFor([state]), null)
    expect(sentence).toBe(`You’ve covered 1 of ${topics.length} topics. So far: 1 needs work.`)
  })

  it('says so when topics have answers but none can be rated yet', () => {
    const few: LearningEvidence[] = [{ moduleId, topicId: topics[0], occurredAt: '2026-10-05T10:00:00.000Z', schemaVersion: 1, id: 'a', contentId: 'a', source: 'flashcard', rating: 2 }]
    const sentence = progressSummarySentence(progressMeasuresFor([createCourseLearningState(business.course, few)]), null)
    expect(sentence).toContain('None are rated yet')
  })

  it('shows readiness only as the engine produced it, or as not enough evidence with what unlocks it', () => {
    const none = readinessFor(createCourseLearningState(business.course, []))
    expect(none.value).toBeNull()
    expect(none.note.length).toBeGreaterThan(10)
    const across = readinessAcross([createCourseLearningState(business.course, [])])
    expect(across.value).toBeNull()
  })

  it('suggests one next action by REV\'s rules', () => {
    const state = createCourseLearningState(business.course, weak(topics[2]))
    const action = nextProgressAction([state], [business], now)
    expect(action?.courseId).toBe(business.course.id)
    expect(action?.label).toMatch(/^Practise /)
    expect(action?.reason.length).toBeGreaterThan(0)
    expect(nextProgressAction([], [business], now)).toBeNull()
  })

  it('keeps "How this is worked out" to three plain sentences and never promises a grade', () => {
    expect(HOW_THIS_IS_WORKED_OUT).toHaveLength(3)
    expect(HOW_THIS_IS_WORKED_OUT.join(' ')).toContain('never a predicted grade')
  })
})
