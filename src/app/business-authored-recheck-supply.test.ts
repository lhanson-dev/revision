import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import authored from '../../content/business/aqa-a-level/shared/source-mapped-recheck-questions.json'
import { structuredPracticeBankRecordSchema } from '../../content/structured-practice-bank'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { authoredSkillQuestions, findSkillRecheckOpportunities } from './skill-recheck'
import { bankQuestionId, bankRecordToPractice, objectiveItemMappingForPractice } from './practice-questions'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { preparationCandidatesFromLearningState } from './planner-model'
import { buildAdaptivePlan } from '../engine/planning/planning'
import { tasksFromPlanner, authoredQuestionsForTask } from './home-task'
import type { RevisionAssessment } from '../services/planning/planner-service'

const course = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .find((entry) => entry.course.id === 'aqa:aqa-a-level:7132')!
if (!course) throw new Error('Business 7132 missing from the published learner catalogue')
const originalQuestions = aqaBusinessQuestionBank.filter((record) =>
  (record.namespace ?? 'aqa7132') === 'aqa7132')
const newRecords = authored.questions.map((entry) => structuredPracticeBankRecordSchema.parse(entry))
const expected = [
  { specId: 'aqa-7132-3.3.1:market-share', nodeId: 'bus-mkt-002', answer: 14, correct: 'B', topicOrder: 3 },
  { specId: 'aqa-7132-3.4.2:capacity-utilisation', nodeId: 'bus-ops-003', answer: 65, correct: 'B', topicOrder: 4 },
  { specId: 'aqa-7132-3.7.2:payables-days', nodeId: 'bus-fin-013', answer: 30, correct: 'B', topicOrder: 7 },
  { specId: 'aqa-7132-3.10.3:critical-path', nodeId: 'bus-evi-008', answer: 13, correct: 'A', topicOrder: 10 },
] as const

function exampleFor(specId: string) {
  const record = originalQuestions.find((item) => item.question.family === 'MCQ'
    && item.target_item_ids.length === 1 && item.target_item_ids[0] === specId)!
  const replacement = newRecords.find((item) => item.target_item_ids[0] === specId)!
  const topic = course.course.learningAdapter.listTopics().find((item) =>
    item.order === Number(specId.match(/^aqa-7132-3\.(\d+)/)?.[1]))!
  if (!record || !replacement || !topic) throw new Error('Unmapped real Business check')
  return { record, replacement, topic }
}
describe('Issue #698 — actual published Business independent single-item retest supply', () => {
  it('publishes four different original assessed contexts through every Business course-paper pack', () => {
    expect(newRecords).toHaveLength(4)
    const records = aqaBusinessQuestionBank
    const ids = records.map(bankQuestionId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of expected) {
      const { record, replacement, topic } = exampleFor(e.specId)
      expect(replacement.target_item_ids).toEqual([e.specId])
      expect(replacement.target_node_ids).toEqual([e.nodeId])
      expect(replacement.question.family).toBe('MCQ')
      expect(replacement.question.marks).toBe(1)
      expect(replacement.question.options).toHaveLength(4)
      expect(replacement.question.mark_scheme.correct_option).toBe(e.correct)
      expect(replacement.question.mark_scheme.option_rationale).toHaveLength(4)
      expect(replacement.question.stem).not.toBe(record.question.stem)
      expect(replacement.question.context).not.toBe(record.question.context)
      expect(replacement.question.options.map(o => o.text)).not.toEqual(record.question.options.map(o => o.text))
      const first = bankRecordToPractice(record, topic.id)
      const second = bankRecordToPractice(replacement, topic.id)
      expect(first?.type).toBe('multiple-choice')
      expect(second?.type).toBe('multiple-choice')
      expect(first?.id).not.toBe(second?.id)
      expect(second && 'specItemIds' in second ? second.specItemIds : []).toEqual([e.specId])
      for (const module of course.course.modules) {
        const all = module.listPracticeBank()
        expect(all.some(item => bankQuestionId(item) === bankQuestionId(replacement))).toBe(true)
      }
    }
  })

  it('checks the original numeric answers independently of stored correct-option text', () => {
    // The tests deliberately calculate, rather than merely read, answer keys.
    expect(6.3 / 45 * 100).toBe(14)
    expect(5850 / 9000 * 100).toBe(65)
    expect(Math.round(54000 / 657000 * 365)).toBe(30)
    expect([3 + 6 + 4, 4 + 4 + 4, 5 + 7]).toEqual([13, 12, 12])
    for (const item of expected) {
      const q = exampleFor(item.specId).replacement.question
      expect(q.options.find(o => o.label === q.mark_scheme.correct_option)?.text)
        .toContain(String(item.answer))
    }
  })

  it('uses an actual saved incorrect question to choose an unattempted real published same-skill recheck', () => {
    for (const e of expected) {
      const { record, replacement, topic } = exampleFor(e.specId)
      const original = bankRecordToPractice(record, topic.id)!
      const alternate = bankRecordToPractice(replacement, topic.id)!
      if (original.type !== 'multiple-choice' || alternate.type !== 'multiple-choice') throw Error('Missing MCQ')
      const evidence = createMultipleChoiceEvidence({
        id: 'miss-' + e.topicOrder,
        moduleId: course.course.learningAdapter.manifest.id,
        topicId: topic.id, contentId: original.id,
        selectedOption: (original.correctOption + 1) % 4,
        correctOption: original.correctOption,
        confidence: 'certain', occurredAt: '2026-10-29T10:00:00.000Z',
        itemMapping: objectiveItemMappingForPractice(original),
      })
      const available = authoredSkillQuestions(course.course.learningAdapter, topic.id)
      const found = findSkillRecheckOpportunities(available, [evidence], topic.id,
        course.course.modules.map(module => module.manifest.id))
      expect(found.find(item => item.specItemId === e.specId)?.freshQuestionId).toBe(alternate.id)
      expect(found.find(item => item.specItemId === e.specId)?.need).toBe('missed')
      expect(found.find(item => item.specItemId === e.specId)?.sourceEvidenceId).toBe(evidence.id)
    }
  })

  it('connects a real Business missed skill through ONE Planner/Start question and withdraws after correctly assessed fresh check', () => {
    const item = expected[0]
    const { record, replacement, topic } = exampleFor(item.specId)
    const original = bankRecordToPractice(record, topic.id)!
    const alternate = bankRecordToPractice(replacement, topic.id)!
    if (original.type !== 'multiple-choice' || alternate.type !== 'multiple-choice') throw Error('Missing MCQ')
    const given = (id: string, question: typeof original, correct: boolean, occurredAt: string) =>
      createMultipleChoiceEvidence({
        id, moduleId: course.course.learningAdapter.manifest.id,
        topicId: topic.id, contentId: question.id, confidence: 'certain',
        correctOption: question.correctOption,
        selectedOption: correct ? question.correctOption : (question.correctOption + 1) % question.options.length,
        itemMapping: objectiveItemMappingForPractice(question), occurredAt,
      })
    const exam: RevisionAssessment = {
      assessmentId: 'test-paper-1', userId: 'synthetic',
      courseId: course.course.id, subjectId: course.subject.id,
      moduleId: course.course.modules[0]!.manifest.id,
      assessmentType: 'public_exam', assessmentDate: '2027-05-25',
      title: 'Business exam', relativeImportance: 'normal', scope: {}, isActive: true,
    }
    const initial = given('original', original, false, '2026-10-29T08:00:00.000Z')
    const state = createCourseLearningState(course.course, [initial])
    const candidates = preparationCandidatesFromLearningState([state], [exam], [], new Date('2026-10-29T12:00:00.000Z'))
    const check = candidates.find(c => c.skillFocus?.treatment === 'recheck'
      && c.skillFocus.specItemId === item.specId)
    expect(check).toBeDefined()
    expect(check?.targetedQuestionIds).toEqual([alternate.id])
    // Real authored question, not a copied question fixture nor a plan-time phantom.
    const plan = buildAdaptivePlan([check!], [{ date: '2026-10-30', availableMinutes: 45 }])
    const [task] = tasksFromPlanner(plan.today, [state], [course])
    expect(task).toBeDefined()
    expect(authoredQuestionsForTask(task).map(q => q.id)).toEqual([alternate.id])
    const after = createCourseLearningState(course.course, [initial,
      given('fresh-correct', alternate, true, '2026-10-30T09:00:00.000Z')])
    const afterCandidates = preparationCandidatesFromLearningState(
      [after], [exam], [], new Date('2026-10-30T12:00:00.000Z'))
    expect(afterCandidates.filter(c => c.skillFocus?.treatment === 'recheck'
      && c.skillFocus.specItemId === item.specId)).toEqual([])
  })
})
