import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { caseStudyForPractice } from '../../../../src/app/practice-start'
import { psychologyCaseStudies } from './cases'

describe('LF-04 Psychology case-context Practice warmups', () => {
  const packs = [paper1, paper2, paper3]
  const topicCases = [
    ['social-influence', 'psy-social-influence-supervisor-case'],
    ['memory', 'psy-memory-dual-task-case'],
    ['attachment', 'psy-attachment-caregiver-case'],
    ['clinical-psychology-and-mental-health', 'psy-clinical-ocd-case'],
    ['research-methods', 'psy-research-methods-memory-cues-case'],
  ] as const

  it('publishes the same original topic-tagged contexts in every AQA Psychology paper pack', () => {
    expect(psychologyCaseStudies).toHaveLength(5)
    for (const pack of packs) {
      expect(pack.caseStudies).toEqual(psychologyCaseStudies)
      for (const [topicId, id] of topicCases) {
        const study = caseStudyForPractice(pack.caseStudies, topicId)
        expect(study?.id, topicId).toBe(id)
        expect(study?.topicIds).toContain(topicId)
        expect(study?.bodyHtml.length, id).toBeGreaterThan(100)
        expect(study?.facts.length, id).toBeGreaterThanOrEqual(3)
        expect(study?.questions.length, id).toBe(2)
        expect(study?.questions.every(q => q.prompt.length > 30 && q.guidance.length > 60)).toBe(true)
      }
      expect(caseStudyForPractice(pack.caseStudies, 'biopsychology')).toBeNull()
      expect(caseStudyForPractice(pack.caseStudies, 'issues-and-debates-in-psychology')).toBeNull()
    }
  })

  it('never advertises a case from the wrong topic or creates scored question identities', () => {
    const ids = psychologyCaseStudies.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    const qids = psychologyCaseStudies.flatMap(c => c.questions.map(q => q.id))
    expect(new Set(qids).size).toBe(qids.length)
    for (const study of psychologyCaseStudies) {
      expect(study.topicIds).toHaveLength(1)
      expect(study.questions.every(q => !('marks' in q) && !('correctOption' in q))).toBe(true)
      for (const pack of packs) {
        expect(pack.questions.some(q => q.id === study.id || qids.includes(q.id))).toBe(false)
        expect((pack.practiceBank ?? []).some(q => q.id === study.id || qids.includes(q.id))).toBe(false)
      }
    }
  })

  it('uses case-specific guidance rather than generic model-answer text', () => {
    const social = caseStudyForPractice(psychologyCaseStudies, 'social-influence')
    expect(social?.questions[0]?.guidance).toContain('supervisor')
    expect(social?.questions[1]?.guidance).toContain('one observation')
    expect(social?.questions[1]?.guidance).toContain('their behaviour is not described')
    expect(social?.questions[1]?.guidance).not.toContain('follow the other trainees')
    const memory = caseStudyForPractice(psychologyCaseStudies, 'memory')
    expect(memory?.questions[0]?.guidance).toContain('phonological loop')
    const rm = caseStudyForPractice(psychologyCaseStudies, 'research-methods')
    expect(rm?.questions[1]?.guidance).toContain('selected their own condition')
  })
})
