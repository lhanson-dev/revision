import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { aqaBusiness7132ExamPapers } from './shared/exam-papers'
import { fastPathFlashcards } from './shared/fast-path-flashcards'
import { examSchema } from '../../schema'

const packs = [paper1, paper2, paper3]

/** Attempted marks count only one question per alternative group. */
function aoTotals(exam: (typeof paper1.exams)[number]) {
  const seen = new Set<string>()
  return exam.questions.filter((question) => {
    if (!question.choiceGroup) return true
    if (seen.has(question.choiceGroup)) return false
    seen.add(question.choiceGroup)
    return true
  }).reduce(
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
    expect(packs.every((pack) => pack.manifest.status === 'available')).toBe(true)
  })

  it('shares the complete ten-area A-level curriculum and substantial practice layer', () => {
    const expectedTopics = ['business','leadership','marketing','operations','finance','hr','strategic-position','strategic-direction','strategic-methods','strategic-change']
    for (const pack of packs) {
      expect(pack.manifest.topicIds).toEqual(expectedTopics)
      expect(pack.topics).toHaveLength(10)
      expect(pack.formulas).toHaveLength(31)
      expect(pack.topicLinks).toHaveLength(22)
      expect(pack.flashcards).toHaveLength(100 + fastPathFlashcards.length)
      expect(pack.questions).toHaveLength(50)
      expect(pack.caseStudies).toHaveLength(6)
      expect(pack.dataDrills).toHaveLength(25)
      expect(pack.examTechnique).toHaveLength(9)
      expect(pack.exams).toHaveLength(1)
    }
  })

  it('makes generated Practice flashcards available through all three ordinary course packs', () => {
    expect(fastPathFlashcards.length).toBeGreaterThan(0)
    for (const pack of packs) {
      const produced = pack.flashcards.filter((card) => card.id.startsWith('fast-'))
      expect(produced).toHaveLength(fastPathFlashcards.length)
      expect(produced.map((card) => card.id)).toEqual(fastPathFlashcards.map((card) => card.id))
      expect(produced.every((card) => pack.manifest.topicIds.includes(card.topic))).toBe(true)
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


  it('matches all authored questions to approved response-section identities and exact section marks', () => {
    const guide = aqaBusiness7132ExamPapers
    for (const [index, pack] of packs.entries()) {
      const paper = guide.papers.find((entry) => entry.number === index + 1)!
      const sections = new Map(paper.sections.map((section) => [section.name, section]))
      const markTotals = new Map<string, number>()
      const seenChoiceGroup = new Set<string>()
      for (const exam of pack.exams) {
        for (const question of exam.questions) {
          const section = question.sectionLabel ? sections.get(question.sectionLabel) : undefined
          expect(section, `Missing approved section for ${question.id}`).toBeDefined()
          expect(question.sectionTitle).toBe(section?.type)
          expect(question.sectionMarks).toBe(section?.marks)
          // Alternatives are printed twice but students attempt only one.
          if (question.choiceGroup) {
            if (seenChoiceGroup.has(question.choiceGroup)) continue
            seenChoiceGroup.add(question.choiceGroup)
          }
          markTotals.set(question.sectionLabel!, (markTotals.get(question.sectionLabel!) ?? 0) + question.marks)
        }
      }
      expect(markTotals.size).toBe(paper.sections.length)
      for (const section of paper.sections) {
        expect(markTotals.get(section.name), `Paper ${index + 1} ${section.name}`).toBe(section.marks)
      }
      expect([...markTotals.values()].reduce((total, marks) => total + marks, 0)).toBe(100)
    }
  })

  it('keeps source-backed response labels explicit instead of inferring from topic or question marks', () => {
    const [p1, p2, p3] = packs.map((pack) => pack.exams[0]!)
    expect(p1.questions.slice(0, 15).every((q) => q.sectionLabel === 'Section A')).toBe(true)
    expect(p1.questions.slice(15, 22).every((q) => q.sectionLabel === 'Section B')).toBe(true)
    expect(p1.questions.slice(22, 24).every((q) => q.sectionLabel === 'Section C')).toBe(true)
    expect(p1.questions.slice(24, 26).every((q) => q.sectionLabel === 'Section D')).toBe(true)
    for (let g = 1; g <= 3; g++) {
      expect(p2.questions.slice((g - 1) * 4, g * 4)
        .every((q) => q.sectionLabel === `Question ${g}`)).toBe(true)
    }
    expect(p3.questions.every((q) => q.sectionLabel === 'Case study questions')).toBe(true)
  })

  it('renders each of the 15 original Section A options without changing the authored correct-answer key', () => {
    const items = paper1.exams[0]!.questions.slice(0, 15)
    expect(items).toHaveLength(15)
    for (const item of items) {
      expect(item.responseType).toBe('multiple-choice')
      expect(item.prompt).toMatch(/^Section A — /)
      expect(item.options?.map((option) => option.label)).toEqual(['A', 'B', 'C', 'D'])
      expect(item.options?.every((option) => option.text.trim().length > 0)).toBe(true)
      const guidance = item.markingGuidance.join(' ')
      const key = guidance.match(/Correct answer: ([A-D])/)
      expect(key, `Missing authored answer key in ${item.id}`).not.toBeNull()
      expect(item.options?.some((option) => option.label === key?.[1])).toBe(true)
      // The multiple-choice answer remains self-assessed in the existing
      // ExamSimulator; this test does not assert an independent outcome.
      expect(item.marks).toBe(1)
      expect(item.assessmentObjectives).toEqual({ ao1: 1, ao2: 0, ao3: 0, ao4: 0 })
    }
    expect(paper1.exams[0]?.questions.slice(15).every((item) => item.responseType !== 'multiple-choice')).toBe(true)
  })

  it('keeps Paper 1 Sections C/D as two 25-mark essay choices, without recycling combined legacy question IDs', () => {
    const exam = paper1.exams[0]!
    const alternatives = exam.questions.filter((question) => question.choiceKind === 'paper-alternative')
    expect(alternatives).toHaveLength(4)
    expect(alternatives.map((question) => question.id)).toEqual([
      'p1-q23-essay-a', 'p1-q23-essay-b', 'p1-q24-essay-a', 'p1-q24-essay-b',
    ])
    expect(alternatives.every((question) => question.marks === 25
      && question.responseType === 'written' && question.assessmentObjectives.ao4 === 8)).toBe(true)
    expect(exam.questions.some((question) => ['p1-q23','p1-q24'].includes(question.id))).toBe(false)
    for (const [section,topic] of [['C','strategic-direction'],['D','strategic-change']]) {
      const matching = alternatives.filter((item) => item.sectionLabel === `Section ${section}`)
      expect(matching).toHaveLength(2)
      expect(matching.map((item) => item.choiceOption)).toEqual(['essay-a','essay-b'])
      expect(matching.every((item) => item.choiceGroup === `section-${section.toLowerCase()}`
        && item.topic === topic && item.sectionMarks === 25)).toBe(true)
      expect(matching[0].prompt).not.toBe(matching[1].prompt)
      expect(matching.every((item) => !item.prompt.includes(' OR B: '))).toBe(true)
    }
  })

  it('rejects incomplete or mixed original-paper essay choices before the simulator can publish them', () => {
    const paper = paper1.exams[0]!
    const incomplete = {
      ...paper,
      questions: paper.questions.filter((question) => question.id !== 'p1-q23-essay-b'),
      printedMarks: 125,
    }
    expect(examSchema.safeParse(incomplete).success).toBe(false)

    const duplicateChoice = {
      ...paper, questions: paper.questions.map((question) =>
        question.id === 'p1-q23-essay-b' ? { ...question, choiceOption: 'essay-a' } : question),
    }
    expect(examSchema.safeParse(duplicateChoice).success).toBe(false)

    const incorrectlyTyped = {
      ...paper, questions: paper.questions.map((question) =>
        question.id === 'p1-q23-essay-b' ? { ...question, choiceKind: undefined } : question),
    }
    expect(examSchema.safeParse(incorrectlyTyped).success).toBe(false)

    const crossSection = {
      ...paper, questions: paper.questions.map((question) =>
        question.id === 'p1-q23-essay-b' ? { ...question, sectionLabel: 'Section D' } : question),
    }
    expect(examSchema.safeParse(crossSection).success).toBe(false)
    expect(examSchema.safeParse({ ...paper, printedMarks: undefined }).success).toBe(false)
    expect(examSchema.safeParse(paper).success).toBe(true)
    expect(examSchema.safeParse(paper2.exams[0]).success).toBe(true)
    expect(examSchema.safeParse(paper3.exams[0]).success).toBe(true)
  })

  it('recalculates numerical answers in all three original paper simulations from their authored inputs', () => {
    function numbers(text: string, pattern: RegExp, name: string): number[] {
      const matched = text.match(pattern)
      expect(matched, `Missing source numbers for ${name}`).not.toBeNull()
      return matched!.slice(1).map((number) => Number(number.replaceAll(',', '')))
    }
    function answer(exam: (typeof paper1.exams)[number], id: string) {
      const question = exam.questions.find((item) => item.id === id)
      expect(question, `Missing original item ${id}`).toBeDefined()
      return question!
    }
    const p1 = paper1.exams[0]!, p2 = paper2.exams[0]!, p3 = paper3.exams[0]!
    const q16 = answer(p1, 'p1-q16')
    const [sell,variable,fixed] = numbers(q16.prompt,
      /sells for £(\d+) and has variable cost of £(\d+) per unit\. Fixed costs are £([\d,]+)/,q16.id)
    const contribution=sell!-variable!
    expect(contribution).toBeGreaterThan(0)
    expect(q16.markingGuidance.join(' ')).toContain(`£${contribution}`)
    expect(q16.markingGuidance.join(' ')).toContain(`${(fixed!/contribution).toLocaleString('en-GB')} units`)

    const q17=answer(p1,'p1-q17')
    const [profit1,employed1]=numbers(q17.prompt,/operating profit of £([\d.]+)m and capital employed of £([\d.]+)m/,q17.id)
    expect(q17.markingGuidance.join(' ')).toContain(`${profit1!/employed1!*100}%`)

    const q18=answer(p1,'p1-q18')
    const [probA,payA,probB,payB,cost]=numbers(q18.prompt,
      /(\d+)% chance of a £([\d,]+) outcome and a (\d+)% chance of a £([\d,]+) outcome\. The decision costs £([\d,]+)/,q18.id)
    expect(probA!+probB!).toBe(100)
    const ev=probA!*payA!/100+probB!*payB!/100
    expect(q18.markingGuidance.join(' ')).toContain(`£${ev.toLocaleString('en-GB')}`)
    expect(q18.markingGuidance.join(' ')).toContain(`£${(ev-cost!).toLocaleString('en-GB')}`)

    const [revenue2,profit2]=numbers(p2.caseHtml,
      /Revenue in 2026 was £([\d.]+)m and operating profit was £([\d,]+)\./,'Solace operating margin')
    expect(answer(p2,'p2-q01').markingGuidance.join(' ')).toContain(
      `${profit2!/(revenue2!*1_000_000)*100}%`)
    const [cap2,debt2]=numbers(p2.caseHtml,
      /capital employed of £([\d.]+)m and non-current liabilities of £([\d.]+)m/,'MetroRide gearing')
    expect(answer(p2,'p2-q05').markingGuidance.join(' ')).toContain(`${debt2!/cap2!*100}%`)
    const [pa,va,pb,vb,spend]=numbers(p2.caseHtml,
      /(\d+)% chance of generating £([\d.]+)m contribution and a (\d+)% chance of £([\d.]+)m contribution\. The development programme would cost £([\d.]+)m/,'Aster expected value')
    expect(pa!+pb!).toBe(100)
    const ev2=pa!*va!/100+pb!*vb!/100
    expect(Number(ev2.toFixed(2))).toBe(1.68)
    expect(answer(p2,'p2-q09').markingGuidance.join(' ')).toContain(`£${ev2.toFixed(2)}m`)
    expect(answer(p2,'p2-q09').markingGuidance.join(' ')).toContain(
      `£${(ev2-spend!).toFixed(2)}m`)

    const [revenue3,profit3,employed3,assets3,liabilities3,debt3]=numbers(p3.caseHtml,
      /revenue £([\d.]+)m; operating profit £([\d.]+)m; capital employed £([\d.]+)m; current assets £([\d.]+)m; current liabilities £([\d.]+)m; non-current liabilities £([\d.]+)m/,'Cedar financial ratios')
    const guidance3=answer(p3,'p3-q03').markingGuidance.join(' ')
    expect(guidance3).toContain(`${profit3!/revenue3!*100}%`)
    expect(guidance3).toContain(`${profit3!/employed3!*100}%`)
    expect(guidance3).toContain(`${assets3!/liabilities3!}:1`)
    expect(guidance3).toContain(`${debt3!/employed3!*100}%`)
  })

  it('preserves the intended Paper 1 15 + 35 + 25 + 25 structure and AO profile', () => {
    const exam = paper1.exams[0]
    expect(exam.questions).toHaveLength(26)
    expect(exam.questions.slice(0, 15).every((question) => question.marks === 1)).toBe(true)
    expect(exam.questions.slice(15, 22).map((question) => question.marks)).toEqual([4,4,4,5,6,6,6])
    expect(exam.questions.slice(22).map((question) => question.marks)).toEqual([25,25,25,25])
    expect(exam.questions.reduce((sum, question) => sum + question.marks, 0)).toBe(150)
    expect(exam.printedMarks).toBe(150)
    // The two mandatory essay sections count one selected alternative each.
    const selected = exam.questions.filter((question) => !question.choiceGroup || question.choiceOption === 'essay-a')
    expect(selected.reduce((sum, question) => sum + question.marks, 0)).toBe(100)
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
