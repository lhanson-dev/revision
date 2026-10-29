import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildAdaptivePlan } from '../engine/planning/planning'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { preparationCandidatesFromLearningState } from './planner-model'
import { supportedActivityMinutes, tasksFromPlanner } from './home-task'
import type { RevisionAssessment } from '../services/planning/planner-service'

const programme = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .filter((entry) => ['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182'].includes(entry.course.id))
const now = new Date(2026, 9, 29, 10)
const assessments: RevisionAssessment[] = programme.map((entry) => ({
  assessmentId: 'synthetic-' + entry.subject.id,
  userId: 'synthetic', subjectId: entry.subject.id, courseId: entry.course.id,
  moduleId: null, assessmentType: 'public_exam',
  title: entry.subject.name + ' exam',
  assessmentDate: entry.subject.id === 'business' ? '2027-05-20' : '2027-04-08',
  relativeImportance: 'normal', scope: {}, isActive: true,
}))

describe('P0 returning learner: distinct supported retrieval opportunities', () => {
  it('proposes exact unattempted authored cards alongside a different scored check, with an actionable Start', () => {
    expect(programme).toHaveLength(2)
    const states = programme.map((entry) => createCourseLearningState(entry.course, []))
    const candidates = preparationCandidatesFromLearningState(states, assessments, [], now)
    const retrieval = candidates.find((item) => item.activityType === 'flashcards'
      && !!item.retrievalContentIds?.length && item.retrievalContentIds.length > 1)
    expect(retrieval, 'Published original course has independent retrieval assets').toBeDefined()
    if (!retrieval?.retrievalContentIds?.length) return
    const state = states.find((item) => item.course?.id === retrieval.courseId)!
    const eligibleCards = state.adapter.listFlashcards(retrieval.topicId)
    expect(retrieval.retrievalContentIds.every((id) =>
      eligibleCards.some((card) => card.id === id))).toBe(true)
    expect(new Set(retrieval.retrievalContentIds).size).toBe(retrieval.retrievalContentIds.length)
    expect(candidates.some((item) => item.topicId === retrieval.topicId
      && item.courseId === retrieval.courseId && item.activityType === 'quick-check')).toBe(true)
    const result = buildAdaptivePlan([retrieval], [{ date: '2026-10-29', availableMinutes: 45 }])
    expect(result.today).toHaveLength(1)
    const [task] = tasksFromPlanner(result.today, states, programme)
    expect(task).toBeDefined()
    expect(task.retrievalContentIds).toEqual(retrieval.retrievalContentIds)
    expect(supportedActivityMinutes(task)).toBe(retrieval.estimatedMinutes)
  })

  it('after a real authored card has been attempted, a new Plan selects remaining cards rather than repeating it', () => {
    const original = programme.map((entry) => createCourseLearningState(entry.course, []))
    const first = preparationCandidatesFromLearningState(original, assessments, [], now)
      .find((item) => item.activityType === 'flashcards' && (item.retrievalContentIds?.length ?? 0) > 1)
    expect(first).toBeDefined()
    if (!first?.retrievalContentIds) return
    const source = programme.find((entry) => entry.course.id === first.courseId)!
    const attemptedId = first.retrievalContentIds[0]!
    const evidence = createFlashcardEvidence({
      id: 'synthetic-first-retrieval', moduleId: source.course.modules[0]!.manifest.id,
      topicId: first.topicId, contentId: attemptedId, rating: 0,
      occurredAt: '2026-10-29T09:00:00.000Z',
    })
    const updated = programme.map((entry) => createCourseLearningState(entry.course, [evidence]))
    const second = preparationCandidatesFromLearningState(updated, assessments, [], now)
      .find((item) => item.activityType === 'flashcards'
        && item.topicId === first.topicId && item.courseId === first.courseId
        && !!item.retrievalContentIds)
    expect(second?.retrievalContentIds).not.toContain(attemptedId)
    expect(second?.retrievalContentIds?.length).toBeGreaterThan(0)
    expect(second?.id).not.toBe(first.id)
  })

  it('does not manufacture retrieval when all real flashcards for the scoped topic have already been attempted', () => {
    const initial = programme.map((entry) => createCourseLearningState(entry.course, []))
    const first = preparationCandidatesFromLearningState(initial, assessments, [], now)
      .find((item) => item.activityType === 'flashcards' && !!item.retrievalContentIds?.length)
    expect(first).toBeDefined()
    if (!first?.retrievalContentIds) return
    const source = programme.find((entry) => entry.course.id === first.courseId)!
    const cards = source.course.learningAdapter.listFlashcards(first.topicId)
    const evidence = cards.map((card, index) => createFlashcardEvidence({
      id: 'synthetic-reviewed-' + index, moduleId: source.course.modules[0]!.manifest.id,
      topicId: first.topicId, contentId: card.id, rating: 2,
      occurredAt: '2026-10-20T09:00:00.000Z',
    }))
    const updated = programme.map((entry) => createCourseLearningState(entry.course, evidence))
    const remaining = preparationCandidatesFromLearningState(updated, assessments, [], now)
      .filter((item) => item.courseId === first.courseId && item.topicId === first.topicId
        && item.activityType === 'flashcards' && item.retrievalContentIds)
    expect(remaining).toHaveLength(0)
  })

  it('does not infer a score from two unverified self-rated cards', () => {
    const source = programme[0]!
    const cards = source.course.learningAdapter.listFlashcards()
    expect(cards.length).toBeGreaterThan(1)
    const evidence = cards.slice(0, 2).map((card, index) => createFlashcardEvidence({
      id: 'synthetic-rating-' + index,
      moduleId: source.course.modules[0]!.manifest.id,
      topicId: card.topic, contentId: card.id, rating: 2,
      occurredAt: '2026-10-20T09:00:00.000Z',
    }))
    const state = createCourseLearningState(source.course, evidence)
    expect(state.readiness.score).toBeNull()
  })
})
