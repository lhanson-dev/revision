import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { activeNotNow, dayKey, pickSuggestion, rankSuggestions } from './rev-suggestions'
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

function exam(daysAway: number, topicIds?: string[]): RevisionAssessment {
  const date = new Date(now.getTime() + daysAway * 86_400_000)
  return {
    assessmentId: `exam-${daysAway}`, userId: 'u', subjectId: 'business', courseId: course.course.id, moduleId: null,
    assessmentType: 'mock', title: `Paper ${daysAway}`, assessmentDate: dayKey(date), relativeImportance: 'normal',
    scope: topicIds ? { topicIds } : {}, isActive: true,
  } as RevisionAssessment
}

const stateWith = (evidence: LearningEvidence[]) => createCourseLearningState(course.course, evidence)

describe('REV suggestion rules', () => {
  it('suggests the first unstarted topic, with a reason, for a brand-new student (rule 4)', () => {
    const ranked = rankSuggestions([stateWith([])], [], [course], now)
    expect(ranked[0].rule).toBe(4)
    expect(ranked[0].task.topicId).toBe(topics[0].id)
    expect(ranked[0].reason).toContain('haven’t started')
  })

  it('suggests nothing when the course has no topics to base a reason on', () => {
    expect(rankSuggestions([], [], [course], now)).toEqual([])
  })

  it('puts a Needs work topic ahead of unstarted topics (rule 2)', () => {
    const ranked = rankSuggestions([stateWith(weak(topics[2].id))], [], [course], now)
    expect(ranked[0].rule).toBe(2)
    expect(ranked[0].task.topicId).toBe(topics[2].id)
    expect(ranked[0].reason).toContain('Needs work')
  })

  it('puts a Needs work topic under an exam within 14 days first (rule 1), and says why', () => {
    const state = stateWith([...weak(topics[1].id), ...weak(topics[3].id)])
    const ranked = rankSuggestions([state], [exam(10, [topics[3].id])], [course], now)
    expect(ranked[0].rule).toBe(1)
    expect(ranked[0].task.topicId).toBe(topics[3].id)
    expect(ranked[0].reason).toContain('Paper 10 is in 10 days')
    expect(ranked.map((item) => item.rule).slice(0, 2)).toEqual([1, 2])
  })

  it('does not use rule 1 when the exam is more than 14 days away', () => {
    const ranked = rankSuggestions([stateWith(weak(topics[3].id))], [exam(30, [topics[3].id])], [course], now)
    expect(ranked[0].rule).toBe(2)
  })

  it('suggests an unstudied topic that an exam covers (rule 3) before plain unstarted topics', () => {
    const ranked = rankSuggestions([stateWith([])], [exam(40, [topics[4].id])], [course], now)
    expect(ranked[0].rule).toBe(3)
    expect(ranked[0].task.topicId).toBe(topics[4].id)
    expect(ranked[0].reason).toContain('haven’t studied it yet')
  })

  it('lists each topic once', () => {
    const ranked = rankSuggestions([stateWith(weak(topics[1].id))], [exam(5, [topics[1].id])], [course], now)
    expect(new Set(ranked.map((item) => item.key)).size).toBe(ranked.length)
  })
})

describe('Not now and Suggest something else', () => {
  const ranked = rankSuggestions([stateWith([])], [], [course], now)

  it('skips to the next candidate, and starts again only when everything has been skipped', () => {
    const first = pickSuggestion(ranked, [], [])
    const second = pickSuggestion(ranked, [], [first.suggestion!.key])
    expect(second.suggestion?.key).toBe(ranked[1].key)
    const wrapped = pickSuggestion(ranked, [], ranked.map((item) => item.key))
    expect(wrapped.suggestion?.key).toBe(ranked[0].key)
    expect(wrapped.skipped).toEqual([])
  })

  it('hides a "Not now" suggestion for the rest of today only', () => {
    const record = { day: dayKey(now), keys: [ranked[0].key] }
    expect(pickSuggestion(ranked, activeNotNow(record, now), []).suggestion?.key).toBe(ranked[1].key)
    const tomorrow = new Date(now.getTime() + 86_400_000)
    expect(activeNotNow(record, tomorrow)).toEqual([])
  })

  it('reports when everything has been put to one side', () => {
    const result = pickSuggestion(ranked, ranked.map((item) => item.key), [])
    expect(result.suggestion).toBeNull()
    expect(result.allHidden).toBe(true)
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
