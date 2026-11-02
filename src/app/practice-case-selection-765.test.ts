import { describe, expect, it } from 'vitest'
import businessPaper1 from '../../content/business/aqa-a-level/paper-1'
import businessPaper2 from '../../content/business/aqa-a-level/paper-2'
import businessPaper3 from '../../content/business/aqa-a-level/paper-3'
import { caseStudies } from '../../content/business/aqa-a-level/shared/cases'
import { topics } from '../../content/business/aqa-a-level/shared/topics'
import { caseStudyForPractice } from './practice-start'

describe('LF-04 — case-study relevance on canonical Practice', () => {
  const expected: Record<string, string> = {
    operations: 'northstar-meals',
    hr: 'willow-health',
    'strategic-methods': 'willow-health',
    marketing: 'kestrel-bikes',
    'strategic-direction': 'kestrel-bikes',
    'strategic-position': 'pulse-learning',
    'strategic-change': 'ember-home',
  }

  it('declares authentic topic relevance for five cases, without misclassifying investment appraisal as §3.5 Finance', () => {
    const known = new Set(topics.map(t => t.id))
    expect(caseStudies).toHaveLength(6)
    expect(caseStudies.filter(c => (c.topicIds?.length ?? 0) > 0)).toHaveLength(5)
    expect(caseStudies.find(c => c.id === 'tide-renewables')?.topicIds).toBeUndefined()
    for (const c of caseStudies) {
      expect(new Set(c.topicIds ?? []).size, c.id).toBe((c.topicIds ?? []).length)
      for (const id of c.topicIds ?? []) expect(known.has(id), `${c.id}: ${id}`).toBe(true)
      expect(c.bodyHtml.length, c.id).toBeGreaterThan(100)
      expect(c.questions.length, c.id).toBeGreaterThan(0)
    }
  })

  it('selects a relevant authored case rather than the first generic case', () => {
    for (const [topicId, id] of Object.entries(expected)) {
      const c = caseStudyForPractice(caseStudies, topicId)
      expect(c?.id, topicId).toBe(id)
      expect(c?.topicIds, topicId).toContain(topicId)
    }
    // Finance (§3.5) does not include the §3.7.8 investment appraisal
    // illustrated by Tide. A misleading case is worse than an honest gap.
    for (const topic of ['business', 'leadership', 'finance']) {
      expect(caseStudyForPractice(caseStudies, topic), topic).toBeNull()
    }
  })

  it('publishes identical tagged cases across all three Business paper packs', () => {
    for (const pack of [businessPaper1, businessPaper2, businessPaper3]) {
      expect(pack.caseStudies).toEqual(caseStudies)
      for (const [topicId, id] of Object.entries(expected)) {
        expect(caseStudyForPractice(pack.caseStudies, topicId)?.id).toBe(id)
      }
    }
  })

  it('retains backwards-compatible first-case behaviour only for wholly untagged legacy packs', () => {
    const legacy = [{ id: 'older-case' }, { id: 'another-case' }]
    expect(caseStudyForPractice(legacy, 'unknown')?.id).toBe('older-case')
    expect(caseStudyForPractice([], 'unknown')).toBeNull()
    expect(caseStudyForPractice([{ id: 'legacy' }, { id: 'tagged', topicIds: ['finance'] }], 'marketing')).toBeNull()
  })
})
