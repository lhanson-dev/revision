import { describe, expect, it } from 'vitest'
import { businessDecisionTreeNumericalBank } from '../../content/business/aqa-a-level/shared/decision-tree-numeric-practice'
import { createCalculationEvidence } from './practice-evidence'
import { bankRecordToPractice, objectiveItemMappingForPractice, type CalculationPracticeQuestion } from './practice-questions'
import { findSkillRecheckOpportunities } from './skill-recheck'
import { planSkillFocusLabel } from './plan-skill-focus'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildPlannerSnapshot } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'

const topicId = 'leadership'
const moduleId = 'business-aqa-a-level-7132-paper-1'
const questions = businessDecisionTreeNumericalBank.map((record) => bankRecordToPractice(record, topicId))
  .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')
const byId = (key: string) => {
  const question = questions.find((q) => q.id === `rev7132-3.2.2-${key}`)
  if (!question) throw new Error('Published original Business question missing: ' + key)
  return question
}
function scored(key: string, correct: boolean, time: string) {
  const question = byId(key)
  return createCalculationEvidence({
    id: 'skill-' + key + '-' + time, moduleId, topicId, contentId: question.id,
    correct, enteredValue: correct ? question.expected : question.expected + 7,
    expectedValue: question.expected, unit: question.unit, confidence: 'certain',
    itemMapping: objectiveItemMappingForPractice(question), occurredAt: time,
  })
}
const firstMisses = [
  scored('expected-value-01', false, '2026-11-02T09:00:00.000Z'),
  scored('net-gain-01', false, '2026-11-02T09:01:00.000Z'),
]
const find = (facts: ReturnType<typeof scored>[]) =>
  findSkillRecheckOpportunities(questions, facts, topicId, [moduleId], ['bus-evi-004'])

describe('#705: timely source-backed repair scheduling within the existing FI-001 programme', () => {
  it('does not postpone two independently observed calculation weaknesses for months while an exam remains distant', () => {
    const course = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
      .find((item) => item.course.id === 'aqa:aqa-a-level:7132')!
    const state = createCourseLearningState(course.course, firstMisses)
    const now = new Date(2026, 10, 3, 12)
    const assessment: RevisionAssessment = {
      assessmentId: 'business-paper-next-year', userId: 'isolated',
      courseId: course.course.id, subjectId: 'business', moduleId: null,
      assessmentType: 'public_exam', title: 'Business Paper 1',
      assessmentDate: '2027-05-20', relativeImportance: 'high',
      scope: { topicIds: [topicId] }, isActive: true,
    }
    const minutes = { monday: 240, tuesday: 240, wednesday: 240, thursday: 240,
      friday: 240, saturday: 240, sunday: 240 }
    const available: RevisionAvailabilityProfile = {
      userId: 'isolated', timezone: 'Europe/London',
      weekdayMinutes: 240, weekendMinutes: 240, weeklyMinutes: minutes,
    }
    const plan = buildPlannerSnapshot([state], [assessment], available, [], [], now, [], 14)
    const days = plan?.schedule.flatMap(day => day.items.map(item => ({ day: day.date, item }))) ?? []
    const repairs = days.filter(entry => entry.item.skillFocus?.treatment === 'repair')
    expect(new Set(repairs.map(entry => entry.item.skillFocus?.specItemId))).toEqual(new Set([
      'aqa-7132-3.2.2:expected-value', 'aqa-7132-3.2.2:net-gain',
    ]))
    for (const repair of repairs) {
      expect(repair.item.activityType).toBe('learn')
      expect(repair.item.learnTarget?.learnPageId).toBe('bus-evi-004')
      const next = days.find(entry => entry.item.skillFocus?.treatment === 'recheck'
        && entry.item.skillFocus.specItemId === repair.item.skillFocus?.specItemId)
      expect(next?.item.targetedQuestionIds).toHaveLength(1)
      expect(next?.day && next.day > repair.day).toBe(true)
    }
  })
})

describe('#703: two genuinely distinct Business skills in one published topic', () => {
  it('distinguishes separate AQA demands and separate independently authored checks', () => {
    const opportunities = find(firstMisses)
    expect(opportunities).toHaveLength(2)
    expect(opportunities.map((o) => [o.specItemId, o.freshQuestionId])).toEqual([
      ['aqa-7132-3.2.2:expected-value', byId('expected-value-02').id],
      ['aqa-7132-3.2.2:net-gain', byId('net-gain-02').id],
    ])
    expect(opportunities.every((o) => o.need === 'missed')).toBe(true)
    expect(opportunities.every((o) => o.repairLearnPageId === 'bus-evi-004')).toBe(true)
    // Published page is shared; the actual assessed skills and new
    // response tasks are DIFFERENT. This is not two distinct Learn pages.
    expect(opportunities.map((o) => planSkillFocusLabel({
      specItemId: o.specItemId, need: o.need, treatment: 'recheck',
    }))).toEqual([
      'Independent recheck: Expected value (last result was incorrect)',
      'Independent recheck: Net gain (last result was incorrect)',
    ])
  })
  it('improvement in one skill does not erase a different still-missed skill; regression is recognised', () => {
    const improved = scored('expected-value-02', true, '2026-11-02T10:00:00.000Z')
    expect(find([...firstMisses, improved]).map(x => x.specItemId))
      .toEqual(['aqa-7132-3.2.2:net-gain'])
    const netImproved = scored('net-gain-02', true, '2026-11-02T10:01:00.000Z')
    expect(find([...firstMisses, improved, netImproved])).toEqual([])
    // The check has been used up, so a new same-skill wrong answer remains
    // evidence of difficulty without promising another unsupported question.
    const regression = scored('expected-value-01', false, '2026-11-02T11:00:00.000Z')
    const need = find([...firstMisses, improved, netImproved, regression])
    expect(need.map(x => x.specItemId)).toEqual(['aqa-7132-3.2.2:expected-value'])
    expect(need[0]?.freshQuestionId).toBeNull()
  })
  it('does not call an uncertain successful guess or lesson reading mastery', () => {
    expect(planSkillFocusLabel({
      specItemId: 'aqa-7132-3.2.2:net-gain', need: 'uncertain', treatment: 'recheck',
    })).toBe('Independent check: Net gain (last result was a guess)')
    expect(planSkillFocusLabel({
      specItemId: 'aqa-7132-3.2.2:net-gain', need: 'missed', treatment: 'repair',
    })).toBe('Review Net gain after an incorrect answer')
  })
})
