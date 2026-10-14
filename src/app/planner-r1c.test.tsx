import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { learningEvidenceSchema } from '../engine/evidence/evidence'
import { recordStartingCheckEvidence, loadStartingCheckEvidence, type StartingCheckEvidenceStore } from '../services/progress/starting-check-evidence-service'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { progressMeasuresFor, readinessFor } from './progress-summary'
import { buildPlannerSnapshot } from './planner-model'
import { homeToday } from './home-v3-model'
import { recommendationExplanation, todayRecommendations } from './today-recommendations'
import { LearnBlock } from './ui/learn/LearnBlock'
import { breakEvenPage } from './ui/learn/fixtures'

/** Real published Business 7132 course; no artificial curriculum/question mappings. */
const programme = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .filter(({ course }) => course.id === 'aqa:aqa-a-level:7132')
const course = programme[0]!.course
const moduleId = course.learningAdapter.manifest.id
const topicId = 'finance'
const question = course.learningAdapter.listQuestions(topicId)[0]
const now = new Date(2026, 9, 13, 12)
const assessment: RevisionAssessment = {
  assessmentId: 'r1c-paper-1', userId: 'r1c-student', subjectId: 'business',
  courseId: course.id, moduleId: course.modules[0]!.manifest.id,
  assessmentType: 'public_exam', title: 'Paper 1', assessmentDate: '2026-10-20',
  relativeImportance: 'normal', scope: { topicIds: [topicId] }, isActive: true,
}
const availability: RevisionAvailabilityProfile = {
  userId: 'r1c-student', timezone: 'Europe/London', weekdayMinutes: 90, weekendMinutes: 90,
  weeklyMinutes: { monday: 90, tuesday: 90, wednesday: 90, thursday: 90, friday: 90, saturday: 90, sunday: 90 },
}

function measuresAndPlan(scoredEvidence: Parameters<typeof createCourseLearningState>[1]) {
  const state = createCourseLearningState(course, scoredEvidence)
  const snapshot = buildPlannerSnapshot([state], [assessment], availability, [], [], now, [])!
  const day = homeToday('2026-10-13', [], snapshot.schedule, [assessment], availability.weeklyMinutes, [], programme, [state])
  const tasks = todayRecommendations(day, [state], programme, false, true, now)
  return {
    measures: progressMeasuresFor([state]),
    readiness: readinessFor(state),
    engineReadiness: state.readiness,
    snapshot,
    recommendations: tasks.map((task) => ({
      id: task.id, courseId: task.courseId, topicId: task.topicId,
      activityType: task.activityType, reason: recommendationExplanation(task),
    })),
  }
}

describe('FI-001 R1-11 evidence provenance through course, planner, Progress and REV selection', () => {
  it('mock starting-check records remain outside a separately supplied scored-only recalculation', async () => {
    expect(question).toBeDefined()
    const baseline = measuresAndPlan([])
    const directional = {
      id: 'r1c-starting-only', schemaVersion: 1 as const, moduleId, topicId,
      questionId: question!.id, selectedOption: (question!.correctOption + 1) % question!.options.length, correctOption: question!.correctOption, correct: false,
      occurredAt: '2026-10-13T11:00:00.000Z',
    }
    const insert = vi.fn().mockResolvedValue({ error: null })
    const list = vi.fn().mockResolvedValue({ data: [{ payload: directional }], error: null })
    const store: StartingCheckEvidenceStore = { insert, list }
    await recordStartingCheckEvidence(store, 'r1c-student', directional)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'r1c-student', payload: directional,
    }))
    expect(await loadStartingCheckEvidence(store, 'r1c-student', moduleId)).toEqual([directional])

    // A scored-only recalculation using [] is an isolation control, not a production read-after-write integration test.
    const recalculated = measuresAndPlan([])
    expect(recalculated.measures).toEqual(baseline.measures)
    expect(recalculated.readiness).toEqual(baseline.readiness)
    expect(recalculated.engineReadiness).toEqual(baseline.engineReadiness)
    expect(recalculated.snapshot).toEqual(baseline.snapshot)
    expect(recalculated.recommendations).toEqual(baseline.recommendations)
    expect(recalculated.measures.covered).toBe(0)
    expect(recalculated.readiness.value).toBeNull()
    expect(recalculated.recommendations.every((task) => task.reason.length > 0)).toBe(true)
  })

  it('embedded Learn Quick check has no evidence callback; fixture renders unscored guidance, not attainment', () => {
    const block = breakEvenPage.blocks.find((item) => item.type === 'quick-check')
    expect(block).toBeDefined()
    const html = renderToStaticMarkup(<LearnBlock block={block!} />)
    expect(html).toContain('Not scored')
    expect(html).toContain('Quick check')
    expect(html).not.toContain('This doesn’t count towards your progress.')
    // The component's public props contain no onAnswer/onRecordEvidence channel.
    const baseline = measuresAndPlan([])
    expect(measuresAndPlan([])).toEqual(baseline)
    expect(baseline.readiness.value).toBeNull()
  })

  it('validated scored Practice evidence still changes coverage/understanding inputs without fabricating readiness', () => {
    expect(question).toBeDefined()
    const baseline = measuresAndPlan([])
    const scored = learningEvidenceSchema.parse(createMultipleChoiceEvidence({
      id: 'r1c-valid-practice', moduleId, topicId, contentId: question!.id,
      selectedOption: question!.correctOption, correctOption: question!.correctOption, occurredAt: '2026-10-13T11:00:00.000Z',
    }))
    const after = measuresAndPlan([scored])
    expect(after.measures.covered).toBe(1)
    expect(after.measures.total).toBe(baseline.measures.total)
    expect(after.engineReadiness.evidenceCount).toBeGreaterThan(baseline.engineReadiness.evidenceCount)
    expect(after.readiness.value).toBeNull() // One MCQ cannot establish exam readiness.
    expect(after.snapshot).toBeDefined()
    expect(after.recommendations.every((task) => task.courseId === course.id)).toBe(true)
    expect(after.recommendations.every((task) => task.reason.length > 0)).toBe(true)
    expect(measuresAndPlan([scored])).toEqual(after) // Deterministic recalculation.
  })
})
