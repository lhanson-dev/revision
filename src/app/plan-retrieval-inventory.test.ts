import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildAdaptivePlan } from '../engine/planning/planning'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildPlannerSnapshot, preparationCandidatesFromLearningState } from './planner-model'
import { authoredFlashcardsForTask, supportedActivityMinutes, tasksFromPlanner } from './home-task'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import type { LearningEvidence } from '../engine/evidence/evidence'

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
    expect(authoredFlashcardsForTask(task).map((card) => card.id)).toEqual(retrieval.retrievalContentIds)
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

  it('audits an experienced learner with 84 prior authentic-asset attempts and 45-minute weekdays', () => {
    const evidence: LearningEvidence[] = []
    const eligible = programme.flatMap((entry) => entry.course.learningAdapter.listTopics()
      .filter((topic) => entry.course.learningAdapter.listQuestions(topic.id).length > 0)
      .map((topic) => ({ entry, topic }))).slice(0, 21)
    expect(eligible).toHaveLength(21)
    for (const { entry, topic } of eligible) {
      const questions = entry.course.learningAdapter.listQuestions(topic.id)
      const cards = entry.course.learningAdapter.listFlashcards(topic.id)
      for (let i = 0; i < 4; i++) {
        const id = 'synthetic-attempt-' + evidence.length
        const moduleId = entry.course.modules[0]!.manifest.id
        const content = questions[i % questions.length]!
        const time = '2026-10-' + String(19 + i).padStart(2, '0') + 'T09:00:00.000Z'
        if (i === 0 && cards.length) {
          const card = cards[0]!
          evidence.push(createFlashcardEvidence({
            id, moduleId, topicId: card.topic, contentId: card.id,
            rating: 1, occurredAt: time,
          }))
        } else {
          evidence.push(createMultipleChoiceEvidence({
            id, moduleId, topicId: content.topic, contentId: content.id,
            selectedOption: i % 2 === 0 ? content.correctOption : (content.correctOption + 1) % content.options.length,
            correctOption: content.correctOption, occurredAt: time,
          }))
        }
      }
    }
    expect(evidence).toHaveLength(84)
    const states = programme.map((entry) => createCourseLearningState(entry.course, evidence))
    const availability: RevisionAvailabilityProfile = {
      userId: 'synthetic', weekdayMinutes: 45, weekendMinutes: 0, timezone: 'Europe/London',
      weeklyMinutes: { monday: 45, tuesday: 45, wednesday: 45, thursday: 45,
        friday: 45, saturday: 0, sunday: 0 },
    }
    const selected = preparationCandidatesFromLearningState(states, assessments, [], now)
    const retrieval = selected.filter((item) => item.retrievalContentIds?.length)
    const scheduled = buildPlannerSnapshot(states, assessments, availability, [], [], now, [], 14)
    const days = scheduled?.schedule.filter((day) => day.date >= '2026-11-02'
      && day.date <= '2026-11-08') ?? []
    const activeWeekdays = days.filter((day) => day.items.length > 0).map((day) => day.date)
    console.info('P0_RETURNING_LEARNER ' + JSON.stringify({
      evidenceItems: evidence.length, candidateCount: selected.length,
      newRetrievalCandidates: retrieval.length, activeWeekdays,
      dailyMinutes: days.map((day) => [day.date, day.items.reduce((m, item) => m + item.estimatedMinutes, 0)]),
    }))
    expect(days).toHaveLength(7)
    expect(days.every((day) => day.items.reduce((minutes, item) =>
      minutes + item.estimatedMinutes, 0) <= day.availableMinutes)).toBe(true)
    expect(days.slice(5).every((day) => day.items.length === 0)).toBe(true)
    expect(retrieval.length).toBeGreaterThan(0)
    // The screenshot counterexample has supported days on Mon/Tue only;
    // with genuinely distinct authored retrieval now available, require more
    // than the previously failing two days for this returning-learner fixture.
    expect(activeWeekdays.length).toBeGreaterThan(2)
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
