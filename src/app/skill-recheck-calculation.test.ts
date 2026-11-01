import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import type { ModuleLearningState } from './catalogue-model'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { createCalculationEvidence } from './practice-evidence'
import type { CalculationEvidence } from '../engine/evidence/evidence'
import { objectiveItemMappingForPractice, type CalculationPracticeQuestion } from './practice-questions'
import { authoredSkillQuestions, findSkillRecheckOpportunities } from './skill-recheck'
import { preparationCandidatesFromLearningState } from './planner-model'

const topicId = 'leadership'
const skillExpected = 'aqa-7132-3.2.2:expected-value'
const skillNet = 'aqa-7132-3.2.2:net-gain'
const packs = [paper1, paper2, paper3]

function authored(pack = paper1) {
  const adapter = createLearningContentAdapter(pack)
  const questions = authoredSkillQuestions(adapter, topicId)
  function calculation(id: string) {
    const found = questions.find((item) => item.id === id)
    expect(found?.type).toBe('calculation')
    if (!found || found.type !== 'calculation') throw new Error('Published calculation missing: ' + id)
    return found
  }
  return { adapter, questions,
    ev1: calculation('rev7132-3.2.2-expected-value-01'),
    ev2: calculation('rev7132-3.2.2-expected-value-02'),
    net1: calculation('rev7132-3.2.2-net-gain-01'),
    net2: calculation('rev7132-3.2.2-net-gain-02'),
  }
}

function answered(
  question: CalculationPracticeQuestion, correct: boolean, confidence: 'certain' | 'guess',
  id: string, when = '2026-10-30T12:00:00.000Z',
  moduleId = paper1.manifest.id,
): CalculationEvidence {
  const evidence = createCalculationEvidence({
    id, moduleId, topicId, contentId: question.id, occurredAt: when,
    correct, enteredValue: correct ? question.expected : question.expected + 9999,
    expectedValue: question.expected, unit: question.unit,
    confidence, itemMapping: objectiveItemMappingForPractice(question),
  })
  if (evidence.source !== 'calculation') throw new Error('Expected scored calculation evidence')
  return evidence
}

describe('IA-05 B2b: scoreable calculation to independent published skill recheck', () => {
  it('finds distinct expected value and net gain checks in all three published paper packs', () => {
    for (const pack of packs) {
      const { questions, ev1, ev2, net1, net2 } = authored(pack)
      const facts = [
        answered(ev1, false, 'certain', 'miss-ev', undefined, pack.manifest.id),
        answered(net1, true, 'guess', 'guess-net', undefined, pack.manifest.id),
      ]
      const actual = findSkillRecheckOpportunities(questions, facts, topicId,
        [pack.manifest.id], ['bus-evi-004'])
      expect(actual).toEqual([
        { specItemId: skillExpected, topicId, sourceEvidenceId: 'miss-ev',
          need: 'missed', freshQuestionId: ev2.id, repairLearnPageId: 'bus-evi-004' },
        { specItemId: skillNet, topicId, sourceEvidenceId: 'guess-net',
          need: 'uncertain', freshQuestionId: net2.id, repairLearnPageId: 'bus-evi-004' },
      ])
    }
  })

  it('clears an immediate need on a distinct independent answer but does not infer mastery; regression is visible', () => {
    const { questions, ev1, ev2 } = authored()
    const wrong = answered(ev1, false, 'certain', 'first')
    const confirmed = answered(ev2, true, 'certain', 'later', '2026-10-30T14:00:00.000Z')
    expect(findSkillRecheckOpportunities(questions, [wrong, confirmed], topicId,
      [paper1.manifest.id])).toEqual([])
    const relapsed = answered(ev1, false, 'certain', 'relapse', '2026-10-30T15:00:00.000Z')
    const needs = findSkillRecheckOpportunities(questions, [wrong, confirmed, relapsed], topicId,
      [paper1.manifest.id])
    expect(needs).toMatchObject([{ specItemId: skillExpected, need: 'missed',
      sourceEvidenceId: 'relapse', freshQuestionId: null }])
  })

  it('rejects old, multi-target, altered-answer and foreign-course events', () => {
    const { questions, ev1 } = authored()
    const answer = answered(ev1, false, 'certain', 'saved')
    const cases = [
      { ...answer, itemMapping: undefined },
      { ...answer, expectedValue: ev1.expected + 7 },
      { ...answer, correct: true },
      { ...answer, enteredValue: ev1.expected },
      { ...answer, unit: 'different-unit' },
      { ...answer, topicId: 'marketing' },
      { ...answer, moduleId: 'psychology-aqa-paper-1' },
      { ...answer, itemMapping: { ...answer.itemMapping!, targetNodeIds: ['wrong-node'] } },
      { ...answer, itemMapping: { ...answer.itemMapping!, targetSpecItemIds: [skillNet], singleTargetSpecItemId: skillNet } },
    ]
    for (const invalid of cases) expect(findSkillRecheckOpportunities(
      questions, [invalid], topicId, [paper1.manifest.id])).toEqual([])
    const ambiguous = { ...ev1, specItemIds: [skillExpected, skillNet] }
    const multi = answered(ambiguous, false, 'certain', 'multi')
    expect(findSkillRecheckOpportunities([ambiguous, ...questions.filter((item) => item.id !== ev1.id)],
      [multi], topicId, [paper1.manifest.id])).toEqual([])
  })

  it('refuses duplicate authored stems as independent rechecks', () => {
    const { questions, ev1, ev2 } = authored()
    const duplicate = { ...ev2, prompt: ev1.prompt, context: ev1.context, table: ev1.table }
    const one = findSkillRecheckOpportunities(
      [...questions.filter((item) => item.id !== ev2.id), duplicate],
      [answered(ev1, false, 'certain', 'wrong')], topicId, [paper1.manifest.id])
    expect(one).toMatchObject([{ specItemId: skillExpected, freshQuestionId: null }])
  })

  it('feeds a single exact calculation recheck into the existing FI-001 programme candidates', () => {
    const { adapter, ev1, ev2 } = authored()
    const evidence = [answered(ev1, false, 'certain', 'persisted')]
    const state = {
      adapter, evidence, readiness: { score: null, confidence: 'insufficient' },
      topicCount: adapter.listTopics().length, evidencedTopics: 1,
      learnExposures: [], recommendation: null,
    } as unknown as ModuleLearningState
    const courseId = `${adapter.manifest.examBoard.id}:${adapter.manifest.qualification.id}:${adapter.manifest.specificationCode}`
    const assessment: RevisionAssessment = {
      assessmentId: 'a1', userId: 'student', subjectId: adapter.manifest.subject.id, courseId,
      moduleId: null, assessmentType: 'mock', title: 'Business test',
      assessmentDate: '2027-06-01', relativeImportance: 'high',
      scope: { topicIds: [topicId] }, isActive: true,
    }
    const candidates = preparationCandidatesFromLearningState(
      [state], [assessment], [], new Date('2026-10-30T10:00:00Z'))
    const recheck = candidates.find((item) => item.skillFocus?.specItemId === skillExpected
      && item.skillFocus.treatment === 'recheck')
    expect(recheck).toMatchObject({
      activityType: 'quick-check', targetedQuestionIds: [ev2.id],
      skillFocus: { specItemId: skillExpected, need: 'missed', treatment: 'recheck' },
    })
    expect(candidates.filter((item) => item.skillFocus?.specItemId === skillNet)).toHaveLength(0)
  })
})
