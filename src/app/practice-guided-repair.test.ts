import { describe, expect, it } from 'vitest'
import businessPack from '../../content/business/aqa-a-level/paper-1'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import { bankRecordToPractice, type CalculationPracticeQuestion } from './practice-questions'
import { sourceBackedGuidedMethodRepair } from './practice-repair'

// This is a failing-first acceptance contract: two different observed
// calculation skills need genuinely different teaching steps without
// inventing separate Foundation node identities or scoring the repair.
const adapter = createLearningContentAdapter(businessPack)
const cases = businessPack.practiceBank!
  .filter(item => item.namespace === 'rev7132' && item.batch === '3.2.2')
  .map(item => bankRecordToPractice(item, 'leadership'))
  .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')
const bySuffix = (suffix: string) => {
  const question = cases.find(item => item.id.endsWith(suffix))
  if (!question) throw new Error('Missing published decision tree calculation ' + suffix)
  return question
}

describe('#705: two Business 3.2.2 assessed skills receive different unscored method repairs', () => {
  it('selects distinct guided treatments from the same genuine Foundation page', () => {
    const ev = sourceBackedGuidedMethodRepair(bySuffix('expected-value-01'), adapter)
    const gain = sourceBackedGuidedMethodRepair(bySuffix('net-gain-01'), adapter)
    expect(ev?.sourceLearnPageId).toBe('bus-evi-004')
    expect(gain?.sourceLearnPageId).toBe('bus-evi-004')
    expect(ev?.specItemId).toBe('aqa-7132-3.2.2:expected-value')
    expect(gain?.specItemId).toBe('aqa-7132-3.2.2:net-gain')
    expect(ev?.title).not.toBe(gain?.title)
    expect(ev?.challenge).not.toBe(gain?.challenge)
    expect(ev?.steps).not.toEqual(gain?.steps)
    expect(ev?.answer).not.toBe(gain?.answer)
    expect(ev?.kind).toBe('unscored-guided-repair')
    expect(gain?.kind).toBe('unscored-guided-repair')
  })

  it('offers the same targeted teaching for alternate original assessments of each skill', () => {
    for (const prefix of ['expected-value', 'net-gain']) {
      const first = sourceBackedGuidedMethodRepair(bySuffix(prefix + '-01'), adapter)
      const second = sourceBackedGuidedMethodRepair(bySuffix(prefix + '-02'), adapter)
      expect(first).toEqual(second)
      expect(first?.steps.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('fails closed on unsupported, multi-target, untagged, changed node and wrong-topic evidence', () => {
    const question = bySuffix('expected-value-01')
    expect(sourceBackedGuidedMethodRepair({ ...question, specItemIds: [] }, adapter)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...question, specItemIds: ['aqa-7132-3.2.2:expected-value', 'aqa-7132-3.2.2:net-gain'] }, adapter)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...question, nodeIds: ['unknown-node'] }, adapter)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...question, topicId: 'finance' }, adapter)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...question, source: 'course-pack' }, adapter)).toBeNull()
  })
})
