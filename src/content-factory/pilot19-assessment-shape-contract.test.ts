import { describe, expect, it } from 'vitest'
import {
  assessmentResponseDemandValidationMode,
  validateStructuredAssessment,
  type AssessmentSubquestion,
} from './assessment-integrity'

function options(correctLabel: 'A' | 'B' | 'C' | 'D' = 'B') {
  return [
    { label: 'A' as const, text: 'Option A', correct: correctLabel === 'A', misconceptionBasis: 'Confuses the first plausible alternative with the governed concept.' },
    { label: 'B' as const, text: 'Option B', correct: correctLabel === 'B', ...(correctLabel === 'B' ? {} : { misconceptionBasis: 'Uses a related but incorrect interpretation of the supplied information.' }) },
    { label: 'C' as const, text: 'Option C', correct: correctLabel === 'C', ...(correctLabel === 'C' ? {} : { misconceptionBasis: 'Applies a familiar idea that does not answer this particular question.' }) },
    { label: 'D' as const, text: 'Option D', correct: correctLabel === 'D', ...(correctLabel === 'D' ? {} : { misconceptionBasis: 'Selects an overgeneralised statement that is not supported by the task.' }) },
  ]
}

function validate(subquestion: AssessmentSubquestion, requirementId = 'governed-requirement') {
  return validateStructuredAssessment({
    itemId: 'pilot19-regression-item',
    maxMark: subquestion.maxMark,
    governedRequirementIds: [requirementId],
    subquestions: [subquestion],
  })
}

describe('Pilot #19 assessment-shape contract architecture', () => {
  it('separates MCQ interaction format from knowledge/application cognitive demand', () => {
    expect(assessmentResponseDemandValidationMode).toMatchObject({
      selection: 'lexical_command',
      knowledge: 'lexical_or_mcq_semantic',
      application: 'lexical_or_mcq_semantic',
      calculation: 'lexical_command',
      interpretation: 'lexical_command',
      analysis: 'lexical_command',
      evaluation: 'lexical_command',
    })
  })

  it('accepts a knowledge MCQ without inventing a second command verb', () => {
    const wording = 'Which option describes a private limited company in this original question?'
    expect(() => validate({
      id: 'q1',
      command: 'Which',
      wording,
      maxMark: 1,
      requirementIds: ['governed-requirement'],
      responseDemands: ['selection', 'knowledge'],
      coverageEvidence: [{ requirementId: 'governed-requirement', evidence: 'private limited company' }],
      options: options(),
    })).not.toThrow()
  })

  it('accepts an application MCQ where selection is the interaction and application is semantic judgement', () => {
    const wording = 'Which option is the most appropriate response for the business described in this original scenario?'
    expect(() => validate({
      id: 'q1',
      command: 'Which',
      wording,
      maxMark: 1,
      requirementIds: ['governed-requirement'],
      responseDemands: ['selection', 'application'],
      coverageEvidence: [{ requirementId: 'governed-requirement', evidence: 'business described' }],
      options: options('C'),
    })).not.toThrow()
  })

  it('preserves the explicit calculation guard for MCQs', () => {
    const wording = 'Which option shows the contribution per unit from the supplied figures?'
    expect(() => validate({
      id: 'q1',
      command: 'Which',
      wording,
      maxMark: 1,
      requirementIds: ['governed-requirement'],
      responseDemands: ['selection', 'calculation'],
      coverageEvidence: [{ requirementId: 'governed-requirement', evidence: 'contribution per unit' }],
      options: options(),
    })).toThrow(/rewarded demand calculation/i)
  })

  it('preserves the explicit interpretation guard for MCQs', () => {
    const wording = 'Which option shows the capacity utilisation figure from the supplied data?'
    expect(() => validate({
      id: 'q1',
      command: 'Which',
      wording,
      maxMark: 1,
      requirementIds: ['governed-requirement'],
      responseDemands: ['selection', 'interpretation'],
      coverageEvidence: [{ requirementId: 'governed-requirement', evidence: 'capacity utilisation figure' }],
      options: options(),
    })).toThrow(/rewarded demand interpretation/i)
  })

  it('does not relax knowledge command evidence for non-MCQ written questions', () => {
    const wording = 'What is the governed concept in this original question?'
    expect(() => validate({
      id: 'q1',
      command: 'What',
      wording,
      maxMark: 2,
      requirementIds: ['governed-requirement'],
      responseDemands: ['knowledge'],
      coverageEvidence: [{ requirementId: 'governed-requirement', evidence: 'governed concept' }],
    })).toThrow(/rewarded demand knowledge/i)
  })
})
