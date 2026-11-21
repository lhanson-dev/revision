import { describe, expect, it } from 'vitest'
import psychologyPaper1 from '../../content/psychology/aqa-a-level/paper-1'
import psychologyPaper2 from '../../content/psychology/aqa-a-level/paper-2'
import psychologyPaper3 from '../../content/psychology/aqa-a-level/paper-3'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import { createCalculationEvidence } from './practice-evidence'
import { authoredSkillQuestions, findSkillRecheckOpportunities } from './skill-recheck'
import { objectiveItemMappingForPractice, type CalculationPracticeQuestion } from './practice-questions'
import { specItemLabel } from './spec-item-labels'
import { guidedMethodRepairForPublishedPage } from './practice-repair'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildPlannerSnapshot, preparationCandidatesFromLearningState } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { planSkillFocusLabel } from './plan-skill-focus'

const skill = 'PSY-SRC-4233-IT03'
const topicId = 'research-methods'
const nodeId = 'research-methods-psy0732'
const moduleId = 'psychology-aqa-a-level-7182-paper-2'
const papers = [psychologyPaper1, psychologyPaper2, psychologyPaper3]

function available(pack = psychologyPaper2) {
  const adapter = createLearningContentAdapter(pack)
  const questions = authoredSkillQuestions(adapter, topicId)
  const first = questions.find(q => q.id === 'rev7182-4.2.3-sign-test-01')
  const second = questions.find(q => q.id === 'rev7182-4.2.3-sign-test-02')
  if (first?.type !== 'calculation' || second?.type !== 'calculation') {
    throw new Error('AQA Psychology sign-test pair is not published through the normal course adapter')
  }
  return { adapter, questions, first, second }
}

function saved(q: CalculationPracticeQuestion, entered: number, when: string, module = moduleId) {
  return createCalculationEvidence({
    id: 'psychology-evidence-' + when, moduleId: module, topicId,
    contentId: q.id, correct: entered === q.expected,
    enteredValue: entered, expectedValue: q.expected, unit: q.unit,
    confidence: 'certain', occurredAt: when,
    itemMapping: objectiveItemMappingForPractice(q),
  })
}

describe('#703 Psychology AQA 7182 sign-test: source-to-FI-001 bounded learning loop', () => {
  it('keeps two original independently scoreable integer questions across all three published packs', () => {
    for (const paper of papers) {
      const { adapter, questions, first, second } = available(paper)
      expect(first.exactInteger).toBe(true)
      expect(second.exactInteger).toBe(true)
      expect(first.marks).toBe(1)
      expect(second.marks).toBe(1)
      expect(first.expected).toBe(2)
      expect(second.expected).toBe(1)
      expect(first.context).not.toBe(second.context)
      expect(first.table).not.toEqual(second.table)
      expect(objectiveItemMappingForPractice(first)?.singleTargetSpecItemId).toBe(skill)
      expect(objectiveItemMappingForPractice(second)?.singleTargetSpecItemId).toBe(skill)
      expect(adapter.getLearnPage(nodeId)?.topicId).toBe(topicId)
      const missed = saved(first, 99, '2026-11-12T10:00:00.000Z', paper.manifest.id)
      expect(findSkillRecheckOpportunities(questions, [missed], topicId, [paper.manifest.id], [nodeId]))
        .toMatchObject([{ specItemId: skill, need: 'missed',
          freshQuestionId: second.id, repairLearnPageId: nodeId }])
    }
  })

  it('never promotes a saved non-integer expression as verified scored evidence', () => {
    const { questions, first } = available()
    const entered = saved(first, first.expected, '2026-11-12T10:00:00.000Z')
    const forged = { ...entered, enteredValue: '2+1' as unknown as number, correct: true }
    expect(findSkillRecheckOpportunities(questions, [forged], topicId, [moduleId], [nodeId])).toEqual([])
    const fractional = { ...entered, enteredValue: 2.4, correct: false }
    expect(findSkillRecheckOpportunities(questions, [fractional], topicId, [moduleId], [nodeId])).toEqual([])
    expect(findSkillRecheckOpportunities(questions, [saved(first, 99, '2026-11-12T10:00:00.000Z', 'foreign-module')], topicId, [moduleId], [nodeId]))
      .toEqual([])
  })

  it('offers exact Learn before distinct FI-001 retest; later correct S clears only immediate demand', () => {
    const { adapter, questions, first, second } = available()
    const miss = saved(first, 99, '2026-11-12T10:00:00.000Z')
    const needs = findSkillRecheckOpportunities(questions, [miss], topicId, [moduleId], [nodeId])
    expect(needs).toHaveLength(1)
    expect(planSkillFocusLabel({ specItemId: skill, need: 'missed', treatment: 'repair' }))
      .toBe('Review Sign-test statistic S after an incorrect answer')
    expect(specItemLabel(skill)).toBe('Sign-test statistic S')
    expect(guidedMethodRepairForPublishedPage(skill, adapter.getLearnPage(nodeId)!)?.kind).toBe('unscored-guided-repair')

    const course = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
      .find(c => c.course.id === 'aqa:aqa-a-level:7182')!
    const state = createCourseLearningState(course.course, [miss])
    const exam: RevisionAssessment = {
      assessmentId: 'synthetic-psychology-paper2', userId: 'synthetic',
      courseId: 'aqa:aqa-a-level:7182', subjectId: 'psychology',
      moduleId: null, assessmentType: 'public_exam', title: 'Psychology Paper 2',
      assessmentDate: '2027-05-20', relativeImportance: 'high',
      scope: { topicIds: [topicId] }, isActive: true,
    }
    const candidates = preparationCandidatesFromLearningState([state], [exam], [], new Date('2026-11-12T10:00:00Z'))
    const repair = candidates.find(q => q.skillFocus?.specItemId === skill && q.skillFocus.treatment === 'repair')
    const retest = candidates.find(q => q.skillFocus?.specItemId === skill && q.skillFocus.treatment === 'recheck')
    expect(repair).toMatchObject({ activityType: 'learn', learnTarget: { learnPageId: nodeId },
      skillFocus: { specItemId: skill, need: 'missed', treatment: 'repair' } })
    expect(retest).toMatchObject({ activityType: 'quick-check', targetedQuestionIds: [second.id],
      preparationPrerequisiteId: repair?.id })
    const capacity: RevisionAvailabilityProfile = {
      userId: 'synthetic', timezone: 'Europe/London',
      weekdayMinutes: 240, weekendMinutes: 240,
      weeklyMinutes: { monday: 240, tuesday: 240, wednesday: 240,
        thursday: 240, friday: 240, saturday: 240, sunday: 240 },
    }
    const plan = buildPlannerSnapshot([state], [exam], capacity, [], [], new Date('2026-11-12T10:00:00Z'), [], 14)
    const entries = plan?.schedule.flatMap(day => day.items.map(item => ({ day: day.date, item }))) ?? []
    const scheduledRepair = entries.find(x => x.item.skillFocus?.specItemId === skill
      && x.item.skillFocus.treatment === 'repair')
    const scheduledRetest = entries.find(x => x.item.skillFocus?.specItemId === skill
      && x.item.skillFocus.treatment === 'recheck')
    expect(scheduledRepair?.item.learnTarget?.learnPageId).toBe(nodeId)
    expect(scheduledRetest?.item.targetedQuestionIds).toEqual([second.id])
    expect(scheduledRetest?.day && scheduledRepair?.day && scheduledRetest.day > scheduledRepair.day).toBe(true)

    const correct = saved(second, second.expected, '2026-11-12T11:00:00.000Z')
    expect(findSkillRecheckOpportunities(questions, [miss, correct], topicId, [moduleId], [nodeId])).toEqual([])
    const stateAfter = createCourseLearningState(course.course, [miss, correct])
    const revised = preparationCandidatesFromLearningState([stateAfter], [exam], [], new Date('2026-11-12T12:00:00Z'))
    expect(revised.filter(x => x.skillFocus?.specItemId === skill)).toHaveLength(0)
    // One correct final S is not proof of correct written method, significance, or broad Psychology mastery.
  })
})
