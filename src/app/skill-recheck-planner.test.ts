import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildAdaptivePlan } from '../engine/planning/planning'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { preparationCandidatesFromLearningState } from './planner-model'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { bankRecordToPractice, objectiveItemMappingForPractice, topicOrderForSpecItem } from './practice-questions'
import { authoredQuestionsForTask, supportedActivityMinutes, tasksFromPlanner } from './home-task'
import type { StructuredPracticeBankRecord } from '../../content/structured-practice-bank'

const catalogue = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const course = catalogue.find((entry) => entry.course.id === 'aqa:aqa-a-level:7132')!
const record = course.course.learningAdapter.listPracticeBank().find((entry) =>
  entry.question.family === 'MCQ' && entry.target_item_ids.length === 1)!
const order = topicOrderForSpecItem(record.target_item_ids[0]!)
const topic = course.course.learningAdapter.listTopics().find((entry) => entry.order === order)!
const first = bankRecordToPractice(record, topic.id)!
if (first.type !== 'multiple-choice') throw new Error('Published bank lacks a valid single-target MCQ')
// A second *synthetic fixture* standing in for a future separately assured
// authored independent question. Never publish the cloned item as real content.
const secondRecord: StructuredPracticeBankRecord = {
  ...record, id: 'synthetic-independent-check',
  question: { ...record.question, id: 'synthetic-independent-check',
    stem: 'Synthetic independent objective question for isolated testing' },
}
const sourceAdapter = course.course.learningAdapter
const adapter = { ...sourceAdapter,
  listPracticeBank: () => [record, secondRecord],
}
const syntheticCourse = { ...course.course, learningAdapter: adapter }
const second = bankRecordToPractice(secondRecord, topic.id)!
const sourceId = sourceAdapter.manifest.id
const now = new Date(2026, 9, 29, 12)
const paper = course.course.modules[0]!
const assessment: RevisionAssessment = {
  assessmentId: 'business-paper-test', userId: 'synthetic', courseId: course.course.id,
  subjectId: course.subject.id, moduleId: paper.manifest.id,
  assessmentType: 'public_exam', assessmentDate: '2027-05-20', title: 'Business Paper 1',
  relativeImportance: 'high', scope: {}, isActive: true,
}
function evidence(contentId: string, correct: boolean, id: string, date: string) {
  const question = contentId === first.id ? first : second
  if (question.type !== 'multiple-choice') throw new Error('Synthetic check is not MCQ')
  return createMultipleChoiceEvidence({
    id, moduleId: sourceId, topicId: topic.id, contentId,
    selectedOption: correct ? question.correctOption : (question.correctOption + 1) % question.options.length,
    correctOption: question.correctOption, confidence: 'certain',
    itemMapping: objectiveItemMappingForPractice(question), occurredAt: date,
  })
}

describe('IA-05: shared FI-001 planner to real exact Start', () => {
  it('offers an independently authored question only after matching specific wrong evidence and launches exactly it', () => {
    const state = createCourseLearningState(syntheticCourse, [
      evidence(first.id, false, 'original-wrong', '2026-10-29T09:00:00.000Z')])
    const candidates = preparationCandidatesFromLearningState([state], [assessment], [], now)
    const targeted = candidates.filter((entry) => entry.skillFocus?.treatment === 'recheck')
    expect(targeted).toHaveLength(1)
    expect(targeted[0]?.targetedQuestionIds).toEqual([second.id])
    expect(targeted[0]?.skillFocus?.specItemId).toBe(record.target_item_ids[0])
    expect(targeted[0]?.moduleId).toBeUndefined()
    const scheduled = buildAdaptivePlan(targeted, [{ date: '2026-10-30', availableMinutes: 45 }])
    const [task] = tasksFromPlanner(scheduled.today, [state], [course])
    expect(task).toBeDefined()
    expect(task.targetedQuestionIds).toEqual([second.id])
    const questions = authoredQuestionsForTask(task)
    expect(questions).toHaveLength(1)
    expect(questions[0]?.id).toBe(second.id)
    expect(questions[0]?.itemMapping?.singleTargetSpecItemId).toBe(record.target_item_ids[0])
    expect(supportedActivityMinutes(task)).toBe(targeted[0]?.estimatedMinutes)
  })

  it('withdraws the same recommendation after a separately saved correct retest rather than looping it', () => {
    const state = createCourseLearningState(syntheticCourse, [
      evidence(first.id, false, 'original-wrong', '2026-10-29T09:00:00.000Z'),
      evidence(second.id, true, 'independent-right', '2026-10-29T10:00:00.000Z'),
    ])
    const after = preparationCandidatesFromLearningState([state], [assessment], [], now)
    expect(after.filter((entry) => entry.skillFocus?.treatment === 'recheck')).toHaveLength(0)
    expect(after.some((entry) => entry.topicId === topic.id)).toBe(true)
    // A single correct result is not a topic-mastery score.
    expect(state.topicKnowledge.topics.find((entry) => entry.topicId === topic.id)?.score).toBeNull()
  })

  it('does not fabricate a new independent recheck using only one published question', () => {
    const noSecondAdapter = { ...sourceAdapter, listPracticeBank: () => [record] }
    const state = createCourseLearningState(
      { ...course.course, learningAdapter: noSecondAdapter },
      [evidence(first.id, false, 'original-wrong', '2026-10-29T09:00:00.000Z')])
    const after = preparationCandidatesFromLearningState([state], [assessment], [], now)
    expect(after.some((entry) => entry.skillFocus?.treatment === 'recheck')).toBe(false)
  })

  it('fails closed if the exact authored target disappears before Start, without generic replacement', () => {
    const state = createCourseLearningState(syntheticCourse, [
      evidence(first.id, false, 'original-wrong', '2026-10-29T09:00:00.000Z')])
    const targeted = preparationCandidatesFromLearningState([state], [assessment], [], now)
      .find((entry) => entry.skillFocus?.treatment === 'recheck')!
    const scheduled = buildAdaptivePlan([targeted], [{ date: '2026-10-30', availableMinutes: 45 }])
    const [task] = tasksFromPlanner(scheduled.today, [state], [course])
    const changed = { ...task,
      adapter: { ...sourceAdapter, listPracticeBank: () => [record] },
    }
    expect(authoredQuestionsForTask(changed)).toEqual([])
  })
})
