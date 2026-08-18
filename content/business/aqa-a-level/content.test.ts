import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'

const packs = [paper1, paper2, paper3]

function aoTotals(exam: (typeof paper1.exams)[number]) {
  return exam.questions.reduce(
    (totals, question) => ({
      ao1: totals.ao1 + question.assessmentObjectives.ao1,
      ao2: totals.ao2 + question.assessmentObjectives.ao2,
      ao3: totals.ao3 + question.assessmentObjectives.ao3,
      ao4: totals.ao4 + question.assessmentObjectives.ao4,
    }),
    { ao1: 0, ao2: 0, ao3: 0, ao4: 0 },
  )
}

function expectUnique(ids: string[]) {
  expect(new Set(ids).size).toBe(ids.length)
}

describe('AQA A-level Business 7132 coordinated content packs', () => {
  it('models one qualification as three coordinated 120-minute 100-mark paper packs', () => {
    expect(packs.map((pack) => pack.manifest.id)).toEqual([
      'business-aqa-a-level-7132-paper-1',
      'business-aqa-a-level-7132-paper-2',
      'business-aqa-a-level-7132-paper-3',
    ])
    expect(packs.map((pack) => pack.manifest.specificationCode)).toEqual(['7132', '7132', '7132'])
    expect(packs.map((pack) => pack.manifest.paper.number)).toEqual([1, 2, 3])
    expect(packs.every((pack) => pack.manifest.paper.durationMinutes === 120)).toBe(true)
    expect(packs.every((pack) => pack.manifest.paper.totalMarks === 100)).toBe(true)
    expect(packs.every((pack) => pack.manifest.status === 'preview')).toBe(true)
  })

  it('shares the complete ten-area A-level curriculum and substantial practice layer', () => {
    const expectedTopics = ['business','leadership','marketing','operations','finance','hr','strategic-position','strategic-direction','strategic-methods','strategic-change']
    for (const pack of packs) {
      expect(pack.manifest.topicIds).toEqual(expectedTopics)
      expect(pack.topics).toHaveLength(10)
      expect(pack.formulas).toHaveLength(31)
      expect(pack.topicLinks).toHaveLength(22)
      expect(pack.flashcards).toHaveLength(100)
      expect(pack.questions).toHaveLength(50)
      expect(pack.caseStudies).toHaveLength(6)
      expect(pack.dataDrills).toHaveLength(24)
      expect(pack.examTechnique).toHaveLength(9)
      expect(pack.exams).toHaveLength(1)
    }
  })

  it('keeps content identifiers unique and topic references declared', () => {
    for (const pack of packs) {
      expectUnique(pack.topics.map((item) => item.id))
      expectUnique(pack.formulas.map((item) => item.id))
      expectUnique(pack.topicLinks.map((item) => item.id))
      expectUnique(pack.flashcards.map((item) => item.id))
      expectUnique(pack.questions.map((item) => item.id))
      expectUnique(pack.caseStudies.map((item) => item.id))
      expectUnique(pack.dataDrills.map((item) => item.id))
      expectUnique(pack.examTechnique.map((item) => item.id))

      const topics = new Set(pack.manifest.topicIds)
      for (const item of pack.flashcards) expect(topics.has(item.topic)).toBe(true)
      for (const item of pack.questions) expect(topics.has(item.topic)).toBe(true)
      for (const item of pack.topicLinks) expect(topics.has(item.topic)).toBe(true)
      for (const exam of pack.exams) {
        for (const question of exam.questions) expect(topics.has(question.topic)).toBe(true)
      }
    }
  })

  it('preserves the intended Paper 1 15 + 35 + 25 + 25 structure and AO profile', () => {
    const exam = paper1.exams[0]
    expect(exam.questions).toHaveLength(24)
    expect(exam.questions.slice(0, 15).every((question) => question.marks === 1)).toBe(true)
    expect(exam.questions.slice(15, 22).map((question) => question.marks)).toEqual([4,4,4,5,6,6,6])
    expect(exam.questions.slice(22).map((question) => question.marks)).toEqual([25,25])
    expect(exam.questions.reduce((sum, question) => sum + question.marks, 0)).toBe(100)
    expect(aoTotals(exam)).toEqual({ ao1: 30, ao2: 30, ao3: 21, ao4: 19 })
  })

  it('preserves three Paper 2 data-response groups and the intended AO profile', () => {
    const exam = paper2.exams[0]
    expect(exam.questions.map((question) => question.marks)).toEqual([4,6,9,14,4,6,9,14,4,6,10,14])
    expect(exam.questions.slice(0, 4).reduce((sum, question) => sum + question.marks, 0)).toBe(33)
    expect(exam.questions.slice(4, 8).reduce((sum, question) => sum + question.marks, 0)).toBe(33)
    expect(exam.questions.slice(8).reduce((sum, question) => sum + question.marks, 0)).toBe(34)
    expect(aoTotals(exam)).toEqual({ ao1: 21, ao2: 30, ao3: 29, ao4: 20 })
  })

  it('preserves the six-question integrated Paper 3 profile with high analysis/evaluation demand', () => {
    const exam = paper3.exams[0]
    expect(exam.questions.map((question) => question.marks)).toEqual([12,12,16,16,20,24])
    expect(exam.questions.reduce((sum, question) => sum + question.marks, 0)).toBe(100)
    expect(aoTotals(exam)).toEqual({ ao1: 20, ao2: 18, ao3: 31, ao4: 31 })
  })
})
