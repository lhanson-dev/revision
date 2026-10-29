import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'

/**
 * Issue #698: independent exact-specification assessment-structure preflight.
 * Authoritative source: user-supplied AQA 7132 PDF v2.0 (14 June 2023),
 * physical pages 9–10, fingerprint below. The PDF is REFERENCE_ONLY and
 * protected prose is not imported into this test or into learner content.
 *
 * This validates the actual published learner ContentPacks and paper shapes;
 * it does NOT approve the educational accuracy of every item, the handling of
 * student responses or the final marking quality of extended writing.
 */
type Source = { courses: Array<{ specification_code: string; pdf_sha256: string }> }
const source = JSON.parse(readFileSync(join(process.cwd(),
  'research/specification-to-learner/aqa-2027-source-manifest.json'), 'utf8')) as Source
const packs = [paper1, paper2, paper3]
type Paper = (typeof packs)[number]['exams'][number]
type Item = Paper['questions'][number]
const sum = (values: readonly number[]) => values.reduce((total, n) => total + n, 0)
const bySection = (paper: Paper, label: string) =>
  paper.questions.filter((item) => item.sectionLabel === label)
const marks = (items: readonly Item[]) => sum(items.map((item) => item.marks))
const activeMarks = (paper: Paper) => {
  const compulsory = paper.questions.filter((item) => !item.choiceGroup)
  const groups = new Map<string, Map<string, number>>()
  for (const item of paper.questions.filter((question) => question.choiceGroup)) {
    const group = groups.get(item.choiceGroup!) ?? new Map<string, number>()
    group.set(item.choiceOption!, (group.get(item.choiceOption!) ?? 0) + item.marks)
    groups.set(item.choiceGroup!, group)
  }
  return marks(compulsory) + sum([...groups.values()].map((choices) => [...choices.values()][0]))
}

describe('Issue #698 AQA 7132 v2.0 whole-paper exam shape', () => {
  it('pins official examination shape to the exact uploaded Business specification, not AS or a later edition', () => {
    const business = source.courses.find((item) => item.specification_code === '7132')
    expect(business?.pdf_sha256).toBe('3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332')
    expect(packs.map((pack) => pack.manifest.specificationCode)).toEqual(['7132', '7132', '7132'])
    expect(packs.map((pack) => pack.manifest.paper.number)).toEqual([1, 2, 3])
    for (const pack of packs) {
      expect(pack.manifest.qualification.name).toMatch(/AQA A-level/)
      expect(pack.exams).toHaveLength(1)
      const paper = pack.exams[0]
      expect(paper.durationMinutes).toBe(120)
      expect(pack.manifest.paper.durationMinutes).toBe(120)
      expect(paper.totalMarks).toBe(100)
      expect(pack.manifest.paper.totalMarks).toBe(100)
      expect(activeMarks(paper)).toBe(100)
      expect(new Set(paper.questions.map((item) => item.id)).size).toBe(paper.questions.length)
      expect(paper.questions.every((item) =>
        Object.values(item.assessmentObjectives).reduce((n, m) => n + m, 0) === item.marks)).toBe(true)
      expect(paper.subtitle).toMatch(/Original Revision-authored/)
    }
  })

  it('Paper 1 has compulsory 15 × 1 MCQs and 35 short-answer marks, then exactly one 25-mark essay from each of C and D', () => {
    const exam=paper1.exams[0]
    expect(exam.printedMarks).toBe(150)
    expect(marks(exam.questions)).toBe(150)
    const a=bySection(exam,'Section A')
    const b=bySection(exam,'Section B')
    const c=bySection(exam,'Section C')
    const d=bySection(exam,'Section D')
    expect(a).toHaveLength(15)
    expect(a.every((item) => item.marks === 1 && item.responseType === 'multiple-choice'
      && item.options?.some((option) => option.label === item.correctOptionLabel))).toBe(true)
    expect(marks(a)).toBe(15)
    expect(b.every((item) => !item.choiceGroup)).toBe(true)
    expect(marks(b)).toBe(35)
    for (const [group, options, label] of [
      ['section-c', c, 'Section C'], ['section-d', d, 'Section D']
    ] as const) {
      expect(options).toHaveLength(2)
      expect(options.every((item) => item.sectionLabel === label && item.marks === 25
        && item.choiceGroup === group && item.choiceKind === 'paper-alternative'
        && item.responseType === 'written')).toBe(true)
      expect(new Set(options.map((item) => item.choiceOption)).size).toBe(2)
    }
  })

  it('Paper 2 has three compulsory, separately labelled data-response blocks summing to 100 marks', () => {
    const exam=paper2.exams[0]
    expect(exam.printedMarks).toBeUndefined()
    expect(exam.questions.every((item) => !item.choiceGroup)).toBe(true)
    expect(marks(bySection(exam,'Question 1'))).toBe(33)
    expect(marks(bySection(exam,'Question 2'))).toBe(33)
    expect(marks(bySection(exam,'Question 3'))).toBe(34)
    for (const index of [1,2,3]) {
      expect(exam.caseHtml).toContain('Data Response ' + index)
      expect(bySection(exam, 'Question ' + index).length).toBeGreaterThanOrEqual(3)
    }
    // Explicit honest product limitation: one shared caseHtml presently holds all
    // three original stimuli; they are distinguished in text, not separate panels.
    expect(exam.caseHtml).toContain('one stimulus field')
  })


  it('recomputes the quantitative conclusions already printed in all three original mocks', () => {
    // These are independent original numerical checks, not AQA paper content.
    const p1=paper1.exams[0].questions
    const p2=paper2.exams[0].questions
    const p3=paper3.exams[0].questions
    const guidance=(questions: readonly Item[], id: string) => {
      const row=questions.find((item)=>item.id===id)
      expect(row, `Missing mock question ${id}`).toBeDefined()
      return row!.markingGuidance.join(' ')
    }
    expect(192000 / (40-24)).toBe(12000)
    expect(guidance(p1,'p1-q16')).toContain('12,000')
    expect(3.6 / 24 * 100).toBe(15)
    expect(guidance(p1,'p1-q17')).toContain('15%')
    expect(0.6*200000+0.4*50000-90000).toBe(50000)
    expect(guidance(p1,'p1-q18')).toContain('50,000')
    expect(480000/6000000*100).toBe(8)
    expect(guidance(p2,'p2-q01')).toContain('8%')
    expect(9/30*100).toBe(30)
    expect(guidance(p2,'p2-q05')).toContain('30%')
    expect((0.55*2.4+0.45*0.8)-1.1).toBeCloseTo(0.58,10)
    expect(guidance(p2,'p2-q09')).toContain('0.58m')
    expect(4.8/48*100).toBe(10)
    expect(4.8/32*100).toBe(15)
    expect(9/6).toBe(1.5)
    expect(12/32*100).toBe(37.5)
    const caseCalculation=guidance(p3,'p3-q03')
    for(const answer of ['10%', '15%', '1.5:1', '37.5%'])expect(caseCalculation).toContain(answer)
  })

  it('Paper 3 contains one compulsory integrated case and approximately six questions worth 100 marks', () => {
    const exam=paper3.exams[0]
    expect(exam.printedMarks).toBeUndefined()
    expect(exam.questions).toHaveLength(6)
    expect(exam.questions.every((item) => !item.choiceGroup
      && item.sectionLabel === 'Case study questions')).toBe(true)
    expect(marks(exam.questions)).toBe(100)
    expect(exam.caseHtml).toContain('Cedar Mobility plc')
    expect(exam.questions.some((item) => item.assessmentObjectives.ao4 > 0)).toBe(true)
  })
})
