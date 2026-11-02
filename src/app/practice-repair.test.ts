import { describe, expect, it } from 'vitest'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { PracticeQuestion } from './practice-questions'
import { sourceBackedPracticeRepairPage } from './practice-repair'

const exact = 'aqa-7132-3.2.2:expected-value'
const netGain = 'aqa-7132-3.2.2:net-gain'
const question: Extract<PracticeQuestion, { type: 'calculation' }> = {
  id: 'expected-value-01', type: 'calculation', level: 'Apply', topicId: 'leadership',
  marks: 1, source: 'aqa-bank', prompt: 'Calculate expected value', context: null, table: null,
  specItemIds: [exact], nodeIds: ['bus-evi-004'], expected: 20, accepted: [20],
  unit: null, answerText: '20', workings: 'Expected payoff times probability.',
}
const learnPage = { id: 'bus-evi-004', topicId: 'leadership', title: 'Expected value', orientation: '',
  blocks: [{ type: 'explanation' as const, paragraphs: ['Worked example'] }] }
const adapter = {
  getLearnPage: (id: string) => id === learnPage.id ? learnPage : undefined,
} as Pick<LearningContentAdapter, 'getLearnPage'>

describe('issue #703: direct repair handoff after a marked objective response', () => {
  it('selects the exact published Foundation page for a single-target calculation', () => {
    expect(sourceBackedPracticeRepairPage(question, adapter)).toEqual(learnPage)
  })
  it('supports the same bounded contract for source-tagged software-scored MCQ', () => {
    const mcq: Extract<PracticeQuestion, { type: 'multiple-choice' }> = {
      ...question, type: 'multiple-choice', options: [{ text: 'A', why: null }, { text: 'B', why: null }],
      correctOption: 0, explanation: 'Because it is a probability-weighted outcome.',
    }
    expect(sourceBackedPracticeRepairPage(mcq, adapter)?.id).toBe('bus-evi-004')
  })
  it('does not pretend that one multi-target, untagged or foreign-topic answer diagnoses a skill', () => {
    expect(sourceBackedPracticeRepairPage({ ...question, specItemIds: [exact, netGain] }, adapter)).toBeNull()
    expect(sourceBackedPracticeRepairPage({ ...question, specItemIds: [] }, adapter)).toBeNull()
    expect(sourceBackedPracticeRepairPage({ ...question, source: 'course-pack' }, adapter)).toBeNull()
    expect(sourceBackedPracticeRepairPage({ ...question, topicId: 'marketing' }, adapter)).toBeNull()
    expect(sourceBackedPracticeRepairPage(question, { getLearnPage: () => undefined })).toBeNull()
  })
})
