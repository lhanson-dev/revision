import { describe, expect, it } from 'vitest'
import {
  validateStructuredAssessment,
  validateStructuredMarkingGuidance,
  type AssessmentSubquestion,
} from './assessment-integrity'

function calculationSubquestion(): AssessmentSubquestion {
  return {
    id: 'q1',
    command: 'Calculate',
    wording: 'Calculate the annual contribution from the supermarket contract using the supplied selling price and total variable cost per outsourced pack.',
    maxMark: 4,
    requirementIds: ['finance-analysis'],
    responseDemands: ['calculation', 'application'],
    coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'annual contribution from the supermarket contract' }],
  }
}

describe('structured assessment integrity', () => {
  it('requires exact marks and exact requirement coverage', () => {
    const subquestion = calculationSubquestion()
    expect(validateStructuredAssessment({
      itemId: 'case-1',
      maxMark: 4,
      governedRequirementIds: ['finance-analysis'],
      subquestions: [subquestion],
    })).toEqual([subquestion])

    expect(() => validateStructuredAssessment({
      itemId: 'case-1',
      maxMark: 8,
      governedRequirementIds: ['finance-analysis'],
      subquestions: [subquestion],
    })).toThrow(/marks total 4, expected 8/)

    expect(() => validateStructuredAssessment({
      itemId: 'case-1',
      maxMark: 4,
      governedRequirementIds: ['finance-analysis', 'marketing-demand'],
      subquestions: [subquestion],
    })).toThrow(/must evidence exactly the governed requirement IDs/)
  })

  it('does not let a calculate-only question claim interpretation demand', () => {
    const subquestion: AssessmentSubquestion = {
      ...calculationSubquestion(),
      responseDemands: ['calculation', 'interpretation'],
    }
    expect(() => validateStructuredAssessment({
      itemId: 'case-1', maxMark: 4, governedRequirementIds: ['finance-analysis'], subquestions: [subquestion],
    })).toThrow(/command does not ask for rewarded demand interpretation/)
  })

  it('requires misconception-based MCQ distractors', () => {
    const mcq: AssessmentSubquestion = {
      id: 'q1',
      command: 'Select',
      wording: 'Which statement best describes limited liability?',
      maxMark: 1,
      requirementIds: ['business-foundations'],
      responseDemands: ['selection'],
      coverageEvidence: [{ requirementId: 'business-foundations', evidence: 'limited liability' }],
      options: [
        { label: 'A', text: 'Owners can never lose money.', correct: false, misconceptionBasis: 'Confuses limited liability with zero investment risk.' },
        { label: 'B', text: 'Owners normally risk only the amount invested.', correct: true },
        { label: 'C', text: 'The business cannot borrow.', correct: false, misconceptionBasis: 'Confuses liability protection with finance restrictions.' },
        { label: 'D', text: 'Managers must own all shares.', correct: false, misconceptionBasis: 'Confuses management roles with ownership rights.' },
      ],
    }
    expect(validateStructuredAssessment({ itemId: 'mcq', maxMark: 1, governedRequirementIds: ['business-foundations'], subquestions: [mcq] })).toHaveLength(1)
    const weak = { ...mcq, options: mcq.options!.map((option) => option.label === 'A' ? { ...option, misconceptionBasis: 'wrong' } : option) }
    expect(() => validateStructuredAssessment({ itemId: 'mcq', maxMark: 1, governedRequirementIds: ['business-foundations'], subquestions: [weak] })).toThrow(/plausible misconception basis/)
  })

  it('prevents Marking Packs rewarding demands absent from the question', () => {
    const subquestion = calculationSubquestion()
    expect(validateStructuredMarkingGuidance({
      itemId: 'case-1',
      subquestions: [subquestion],
      allowedObjectiveIds: ['ao2'],
      overallObjectiveAllocation: [{ objectiveId: 'ao2', marks: 4 }],
      guidance: [{
        subquestionId: 'q1',
        maxMark: 4,
        rewardedDemands: ['calculation', 'application'],
        assessmentObjectiveAllocation: [{ objectiveId: 'ao2', marks: 4 }],
        answerRequirements: ['Accurate contribution calculation using the supplied contract values.'],
      }],
    })).toHaveLength(1)

    expect(() => validateStructuredMarkingGuidance({
      itemId: 'case-1',
      subquestions: [subquestion],
      allowedObjectiveIds: ['ao2', 'ao3'],
      overallObjectiveAllocation: [{ objectiveId: 'ao2', marks: 2 }, { objectiveId: 'ao3', marks: 2 }],
      guidance: [{
        subquestionId: 'q1', maxMark: 4, rewardedDemands: ['calculation', 'analysis'],
        assessmentObjectiveAllocation: [{ objectiveId: 'ao2', marks: 2 }, { objectiveId: 'ao3', marks: 2 }],
        answerRequirements: ['Calculate and then analyse the result.'],
      }],
    })).toThrow(/rewards unasked demand analysis/)
  })
})
