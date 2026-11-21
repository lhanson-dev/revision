import { describe, expect, it } from 'vitest'
import businessPack from '../../content/business/aqa-a-level/paper-1'
import psychologyPaper2 from '../../content/psychology/aqa-a-level/paper-2'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import { bankRecordToPractice, type CalculationPracticeQuestion } from './practice-questions'
import { guidedMethodRepairForPublishedPage, sourceBackedGuidedMethodRepair } from './practice-repair'

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

  it('routes actual Plan repair skills to distinct methods but never infers evidence from a URL', () => {
    const page = adapter.getLearnPage('bus-evi-004')!
    const value = guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:expected-value', page)
    const gain = guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:net-gain', page)
    expect(value?.title).not.toEqual(gain?.title)
    expect(value?.steps).not.toEqual(gain?.steps)
    expect(value?.kind).toBe('unscored-guided-repair')
    expect(gain?.kind).toBe('unscored-guided-repair')
    expect(guidedMethodRepairForPublishedPage(undefined, page)).toBeNull()
    expect(guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:other', page)).toBeNull()
    expect(guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:net-gain', { ...page, id: 'unrelated-page' })).toBeNull()
    expect(guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:net-gain', { ...page, topicId: 'finance' })).toBeNull()
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

describe('#703 Psychology: real published sign-test skill needs a bounded, unscored repair', () => {
  const psychology = createLearningContentAdapter(psychologyPaper2)
  const original = psychologyPaper2.practiceBank!
    .filter(item => item.namespace === 'rev7182' && item.batch === '4.2.3' && item.id.startsWith('sign-test-'))
    .map(item => bankRecordToPractice(item, 'research-methods'))
    .filter((q): q is CalculationPracticeQuestion => q?.type === 'calculation')

  it('maps both independent scored sign-test cases to the same original worked method, never a scored mark', () => {
    expect(original).toHaveLength(2)
    const guides = original.map(q => sourceBackedGuidedMethodRepair(q, psychology))
    expect(guides[0]).toEqual(guides[1])
    expect(guides[0]).toMatchObject({
      kind: 'unscored-guided-repair',
      specItemId: 'PSY-SRC-4233-IT03',
      sourceLearnPageId: 'research-methods-psy0732',
      title: 'Count the sign-test statistic S',
    })
    expect(guides[0]?.steps).toHaveLength(3)
    expect(guides[0]?.answer).toContain('S = 3')
    expect(guides[0]?.caution).toContain('statistically significant')
    // Neither released scored problem has this third practice example.
    expect(original.every(q => !q.context?.includes('Eight paired observations'))).toBe(true)
  })

  it('allows only the exact AQA calculation atom on the genuine Research Methods page', () => {
    const page = psychology.getLearnPage('research-methods-psy0732')!
    expect(page?.topicId).toBe('research-methods')
    expect(guidedMethodRepairForPublishedPage('PSY-SRC-4233-IT03', page)?.answer).toContain('S = 3')
    expect(guidedMethodRepairForPublishedPage('PSY-SRC-4233-IT02', page)).toBeNull()
    expect(guidedMethodRepairForPublishedPage('PSY-07-32', page)).toBeNull()
    expect(guidedMethodRepairForPublishedPage('PSY-SRC-4233-IT03', { ...page, id: 'other' })).toBeNull()
    expect(guidedMethodRepairForPublishedPage('PSY-SRC-4233-IT03', { ...page, topicId: 'memory' })).toBeNull()
    expect(guidedMethodRepairForPublishedPage('aqa-7132-3.2.2:expected-value', page)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...original[0]!, specItemIds: [] }, psychology)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...original[0]!, specItemIds: ['PSY-SRC-4233-IT02', 'PSY-SRC-4233-IT03'] }, psychology)).toBeNull()
    expect(sourceBackedGuidedMethodRepair({ ...original[0]!, nodeIds: ['unrelated'] }, psychology)).toBeNull()
  })
})
