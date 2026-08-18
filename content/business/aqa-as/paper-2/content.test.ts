import { describe, expect, it } from 'vitest'
import { businessAqaAsPaper2 } from './index'

function expectUnique(ids: string[]) {
  expect(new Set(ids).size).toBe(ids.length)
}

describe('AQA AS Business Paper 2 content pack', () => {
  it('has catalogue-ready identity and paper metadata', () => {
    expect(businessAqaAsPaper2.manifest.id).toBe('business-aqa-as-paper-2')
    expect(businessAqaAsPaper2.manifest.specificationCode).toBe('7131')
    expect(businessAqaAsPaper2.manifest.paper.durationMinutes).toBe(90)
    expect(businessAqaAsPaper2.manifest.paper.totalMarks).toBe(80)
  })

  it('covers all six topic areas referenced by the manifest', () => {
    const topicIds = businessAqaAsPaper2.topics.map((topic) => topic.id)
    expect(topicIds).toEqual(businessAqaAsPaper2.manifest.topicIds)
    expect(topicIds).toHaveLength(6)
    expectUnique(topicIds)
  })

  it('keeps content identifiers unique within each content family', () => {
    expectUnique(businessAqaAsPaper2.formulas.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.topicLinks.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.flashcards.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.questions.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.dataDrills.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.examTechnique.map((item) => item.id))
    expectUnique(businessAqaAsPaper2.exams.map((item) => item.id))
  })

  it('contains substantial extracted recall and quick-check content', () => {
    expect(businessAqaAsPaper2.flashcards.length).toBeGreaterThanOrEqual(90)
    expect(businessAqaAsPaper2.questions.length).toBeGreaterThanOrEqual(39)
    expect(businessAqaAsPaper2.formulas.length).toBeGreaterThanOrEqual(22)
    expect(businessAqaAsPaper2.dataDrills.length).toBeGreaterThanOrEqual(18)
  })

  it('preserves the six legacy Paper 2 answer blueprints as structured guidance', () => {
    expect(businessAqaAsPaper2.examTechnique).toHaveLength(6)
    expect(businessAqaAsPaper2.examTechnique.map((item) => item.id)).toEqual([
      'blt-analysis',
      'mops-evaluation',
      'calculation-questions',
      'case-study-application',
      'analyse',
      'evaluate-assess',
    ])
    expect(businessAqaAsPaper2.examTechnique[0].steps).toEqual(['Case fact', 'Because', 'Leading to', 'Therefore'])
  })

  it('only references declared topics', () => {
    const topicIds = new Set(businessAqaAsPaper2.manifest.topicIds)
    for (const card of businessAqaAsPaper2.flashcards) expect(topicIds.has(card.topic)).toBe(true)
    for (const question of businessAqaAsPaper2.questions) expect(topicIds.has(question.topic)).toBe(true)
    for (const link of businessAqaAsPaper2.topicLinks) expect(topicIds.has(link.topic)).toBe(true)
    for (const exam of businessAqaAsPaper2.exams) {
      for (const question of exam.questions) expect(topicIds.has(question.topic)).toBe(true)
    }
  })

  it('preserves the current full simulator mark profile', () => {
    const exam = businessAqaAsPaper2.exams[0]
    expect(exam.durationMinutes).toBe(90)
    expect(exam.totalMarks).toBe(80)
    expect(exam.questions.map((question) => question.marks)).toEqual([3, 3, 4, 9, 9, 16, 16, 20])
    expect(exam.questions.reduce((sum, question) => sum + question.marks, 0)).toBe(80)
  })

  it('keeps the NorthPeak training case and its seven guided questions', () => {
    const caseStudy = businessAqaAsPaper2.caseStudies[0]
    expect(caseStudy.id).toBe('northpeak-bikes')
    expect(caseStudy.questions).toHaveLength(7)
    expect(caseStudy.facts).toContain('94% capacity utilisation')
  })
})
