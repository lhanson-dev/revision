import { describe, expect, it } from 'vitest'
import originalSource from '../../../scripts/assurance/data/aqa-business-7132-sections-33-36-atomic-review.json'
import historicalItems from '../../../research/aqa-business-7132/2027/NAMED_ITEMS.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { salesGrowthSourceRequirement as source } from './shared/marketing-sales-growth-source'
import { createLearningContentAdapter } from '../../../src/engine/content/content-adapter'
import { authoredSkillQuestions, findSkillRecheckOpportunities } from '../../../src/app/skill-recheck'
import { objectiveItemMappingForPractice, type CalculationPracticeQuestion } from '../../../src/app/practice-questions'
import { createCalculationEvidence } from '../../../src/app/practice-evidence'
import { checkCalculation } from '../../../src/app/practice-calculation'
import type { CalculationEvidence } from '../../../src/engine/evidence/evidence'
import { preparationCandidatesFromLearningState } from '../../../src/app/planner-model'
import type { ModuleLearningState } from '../../../src/app/catalogue-model'
import type { RevisionAssessment } from '../../../src/services/planning/planner-service'

const packs = [paper1, paper2, paper3] as const
const firstId = 'rev7132-3.3.2-firm-sales-growth-increase-01'
const secondId = 'rev7132-3.3.2-firm-sales-growth-decline-02'
const marketGrowthId = 'aqa-7132-3.3.1:market-growth'

function findSales(pack: typeof paper1) {
  const adapter = createLearningContentAdapter(pack)
  const questions = authoredSkillQuestions(adapter, 'marketing')
  function get(id: string) {
    const question = questions.find(q => q.id === id)
    expect(question?.type, id).toBe('calculation')
    if (!question || question.type !== 'calculation') throw new Error('Missing published final-number question: ' + id)
    return question
  }
  return { adapter, questions, first: get(firstId), second: get(secondId) }
}

function scored(question: CalculationPracticeQuestion, moduleId: string,
  correct: boolean, confidence: 'certain' | 'guess', id: string,
  at = '2026-10-31T09:00:00.000Z'): CalculationEvidence {
  const value = correct ? question.expected : question.expected + 13
  const evidence = createCalculationEvidence({
    id, moduleId, topicId: 'marketing', contentId: question.id, occurredAt: at,
    correct, enteredValue: value, expectedValue: question.expected,
    unit: question.unit, confidence, itemMapping: objectiveItemMappingForPractice(question),
  })
  if (evidence.source !== 'calculation') throw new Error('Expected recorded calculation')
  return evidence
}

describe('Business #698: sales-growth calculation is independently source-mapped', () => {
  it('proves the exact PDF atom, page and target independently of historical market-growth mapping', () => {
    const section = originalSource.sections.find(x => x.section_id === '3.3.2')!
    const atom = section.atoms.find(x => x.id === source.sourceAtomId)!
    expect(section.printed_page).toBe(15)
    expect(atom.observable_skill).toBe('calculate sales growth')
    expect(source.printedPage).toBe(15)
    expect(source.sourceSection).toBe('3.3.2')
    expect(source.id).toBe('aqa-7132-3.3.2:sales-growth')
    expect(source.sourceSha256).toBe('3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332')
    expect(historicalItems.items.some(x => x.id === source.id)).toBe(false)
    expect(source.status).toBe('source-reviewed-educational-adequacy-unverified')
    expect(source.id).not.toBe(marketGrowthId)
  })

  it('publishes two genuinely different independently checked company-sales cases in every Business paper', () => {
    for (const pack of packs) {
      const { first, second } = findSales(pack)
      const list = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.3.2')
      expect(list.filter(r => r.target_item_ids.includes(source.id)).map(r => r.id))
        .toEqual(['firm-sales-growth-increase-01', 'firm-sales-growth-decline-02'])
      for (const question of [first, second]) {
        expect(question.specItemIds).toEqual([source.id])
        expect(question.nodeIds).toEqual([source.learnNodeId])
        expect(question.topicId).toBe(source.topicId)
        expect(question.marks).toBe(1)
        expect(question.unit).toBe('%')
        expect(objectiveItemMappingForPractice(question)).toMatchObject({
          singleTargetSpecItemId: source.id,
          targetNodeIds: [source.learnNodeId],
        })
        expect(checkCalculation(String(question.expected), question.accepted, question.unit).status).toBe('right')
        expect(checkCalculation(String(question.expected + 5), question.accepted, question.unit).status).toBe('wrong')
        expect(question.workings).toMatch(/firm|retailer|manufacturer/i)
        expect(question).not.toHaveProperty('markedWorking')
      }
      expect(first.expected).toBe(25)
      expect(second.expected).toBe(-12.5)
      expect(first.prompt).not.toBe(second.prompt)
      expect(first.context).not.toBe(second.context)
      expect(checkCalculation('40%', first.accepted, first.unit).status).toBe('wrong')
      expect(checkCalculation('10%', second.accepted, second.unit).status).toBe('wrong')
      expect(checkCalculation('12.5%', second.accepted, second.unit).status).toBe('wrong')
      expect(checkCalculation('-12.5%', second.accepted, second.unit).status).toBe('right')
    }
    expect((7.5 - 6) / 6 * 100).toBe(25)
    expect((140000 - 160000) / 160000 * 100).toBe(-12.5)
    expect((56 - 40) / 40 * 100).toBe(40) // Do not attribute market growth to one firm's sales.
  })

  it('maps a specific wrong answer to a different fresh question, and preserves unknown/missing proof boundaries', () => {
    for (const pack of packs) {
      const { questions, first, second } = findSales(pack)
      const wrong = scored(first, pack.manifest.id, false, 'certain', 'wrong')
      const needs = findSkillRecheckOpportunities(questions, [wrong], 'marketing',
        [pack.manifest.id], [source.learnNodeId])
      expect(needs).toEqual([{
        specItemId: source.id, topicId: 'marketing', sourceEvidenceId: 'wrong',
        need: 'missed', freshQuestionId: second.id, repairLearnPageId: source.learnNodeId,
      }])
      const later = scored(second, pack.manifest.id, true, 'certain', 'later',
        '2026-10-31T11:00:00.000Z')
      expect(findSkillRecheckOpportunities(questions, [wrong, later], 'marketing',
        [pack.manifest.id], [source.learnNodeId])).toEqual([])
      expect(findSkillRecheckOpportunities(questions, [{ ...wrong, itemMapping: undefined }],
        'marketing', [pack.manifest.id], [source.learnNodeId])).toEqual([])
      expect(findSkillRecheckOpportunities(questions, [{ ...wrong, moduleId: 'foreign-course' }],
        'marketing', [pack.manifest.id], [source.learnNodeId])).toEqual([])
      expect(findSkillRecheckOpportunities(questions, [{ ...wrong, expectedValue: 40 }],
        'marketing', [pack.manifest.id], [source.learnNodeId])).toEqual([])
      expect(findSkillRecheckOpportunities(questions, [wrong], 'marketing',
        [pack.manifest.id], [])).toMatchObject([{ repairLearnPageId: null }])
    }
  })

  it('offers the exact fresh sales-growth question through the current Plan candidates without claiming mastery', () => {
    const { adapter, first, second } = findSales(paper1)
    const facts = [scored(first, paper1.manifest.id, false, 'certain', 'first')]
    const state = {
      adapter, evidence: facts, readiness: { score: null, confidence: 'insufficient' },
      topicCount: adapter.listTopics().length, evidencedTopics: 1,
      learnExposures: [], recommendation: null,
    } as unknown as ModuleLearningState
    const courseId = `${adapter.manifest.examBoard.id}:${adapter.manifest.qualification.id}:${adapter.manifest.specificationCode}`
    const assessment: RevisionAssessment = {
      assessmentId: 'marketing-exam', userId: 'student', subjectId: adapter.manifest.subject.id,
      courseId, moduleId: null, assessmentType: 'mock', title: 'AQA Business',
      assessmentDate: '2027-06-01', relativeImportance: 'high',
      scope: { topicIds: ['marketing'] }, isActive: true,
    }
    const candidates = preparationCandidatesFromLearningState([state], [assessment], [],
      new Date('2026-10-31T09:00:00.000Z'))
    const actual = candidates.find(x => x.skillFocus?.specItemId === source.id
      && x.skillFocus.treatment === 'recheck')
    expect(actual).toMatchObject({
      activityType: 'quick-check', targetedQuestionIds: [second.id],
      skillFocus: { specItemId: source.id, need: 'missed', treatment: 'recheck' },
    })
    expect(actual?.skillFocus?.specItemId).not.toBe(marketGrowthId)
  })
})
