import { describe, expect, it } from 'vitest'

import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import {
  psychologyCourseSummary,
  psychologyCourseTruthTopics,
  psychologyDataDrills,
  psychologyFlashcards,
  psychologyLearn,
  psychologyQuestions,
  psychologyTopics,
} from './shared/course'
import { aqaPsychology7182ExamPapers } from './shared/exam-papers'

describe('AQA Psychology 7182 restricted-pilot content pack', () => {
  it('projects the complete approved Course Truth into learner content', () => {
    expect(psychologyCourseSummary).toEqual({ topicCount: 17, requirementCount: 118 })
    expect(psychologyTopics).toHaveLength(17)
    expect(psychologyLearn.chapters).toHaveLength(17)
    expect(psychologyLearn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))).toHaveLength(118)
    expect(psychologyFlashcards).toHaveLength(118)
    expect(psychologyQuestions).toHaveLength(118)
  })

  it('keeps the three paper modules on one shared learner course', () => {
    expect(paper1.topics).toEqual(paper2.topics)
    expect(paper2.topics).toEqual(paper3.topics)
    expect(paper1.learn).toEqual(paper2.learn)
    expect(paper2.learn).toEqual(paper3.learn)
    expect(paper1.questions).toEqual(paper2.questions)
    expect(paper2.questions).toEqual(paper3.questions)
  })

  it('keeps each representative mock at 96 attempted marks and 120 minutes', () => {
    for (const pack of [paper1, paper2, paper3]) {
      expect(pack.exams).toHaveLength(1)
      expect(pack.exams[0]?.totalMarks).toBe(96)
      expect(pack.exams[0]?.durationMinutes).toBe(120)
    }
  })

  it('gives every AO2 mock question a concrete learner-visible stimulus', () => {
    for (const pack of [paper1, paper2, paper3]) {
      for (const question of pack.exams[0]?.questions ?? []) {
        if (question.assessmentObjectives.ao2 > 0) {
          expect(question.stimulus, question.id).toBeDefined()
          expect(question.stimulus?.narrative.trim().length, question.id).toBeGreaterThan(20)
        }
      }
    }
  })

  it('uses concrete Research Methods tasks in Paper 2 Section C', () => {
    const questions = paper2.exams[0]?.questions.filter((question) => question.id.startsWith('psy-7182-2-c-rm-')) ?? []
    expect(questions.map((question) => question.marks)).toEqual([4, 8, 12, 12, 12])
    expect(questions.reduce((sum, question) => sum + question.marks, 0)).toBe(48)
    expect(questions[1]?.stimulus?.table?.rows).toHaveLength(5)
    expect(questions[3]?.stimulus?.table?.rows).toHaveLength(5)
    expect(questions[4]?.stimulus?.narrative).toContain('rho = -0.62')
    expect(questions[4]?.stimulus?.narrative).toContain('0.587')
  })

  it('represents Paper 3 option groups as whole topic options', () => {
    const exam = paper3.exams[0]
    expect(exam).toBeDefined()
    const groups = new Map<string, Set<string>>()
    exam?.questions.forEach((question) => {
      if (!question.choiceGroup) return
      const options = groups.get(question.choiceGroup) ?? new Set<string>()
      options.add(question.choiceOption ?? question.id)
      groups.set(question.choiceGroup, options)
    })
    expect([...groups.keys()].sort()).toEqual(['section-b', 'section-c', 'section-d'])
    expect([...groups.values()].map((options) => options.size)).toEqual([3, 3, 3])
  })

  it('publishes the exact three-paper guide with Psychology AO1 to AO3', () => {
    expect(aqaPsychology7182ExamPapers.papers).toHaveLength(3)
    expect(aqaPsychology7182ExamPapers.papers.map((paper) => [paper.durationMinutes, paper.totalMarks])).toEqual([
      [120, 96],
      [120, 96],
      [120, 96],
    ])
    expect(aqaPsychology7182ExamPapers.assessmentObjectives.map((ao) => ao.id)).toEqual(['AO1', 'AO2', 'AO3'])
  })


  it('uses requirement-specific objective Practice rather than the generic absolute template', () => {
    expect(new Set(psychologyQuestions.map((question) => question.correctOption))).toEqual(new Set([0, 1, 2, 3]))
    for (const question of psychologyQuestions) {
      expect(new Set(question.options).size, question.id).toBe(question.options.length)
      expect(question.options.join(' '), question.id).not.toMatch(/always produces the same outcome|proves that no alternative psychological explanation can apply|fixed rule without considering/i)
    }
  })

  it('keeps revision cards and Research Methods drill answers complete against approved Course Truth', () => {
    for (const topic of psychologyCourseTruthTopics) {
      for (const requirement of topic.requirements) {
        const cardId = `psy-${requirement.requirementId.toLowerCase().replaceAll('-', '')}-card`
        const card = psychologyFlashcards.find((candidate) => candidate.id === cardId)
        expect(card, cardId).toBeDefined()
        expect(card?.prompt, cardId).toContain(requirement.boardAlignment.summary)

        const requiredParagraphs = [...new Set([
          ...(requirement.subjectTruth.definitionsAndCoreConcepts ?? []),
          ...(requirement.subjectTruth.modelsResearchAndRelationships ?? []),
          ...(requirement.subjectTruth.evaluationAndLimits ?? []),
        ])]
        expect(requiredParagraphs.length, cardId).toBeGreaterThan(0)

        for (const paragraph of requiredParagraphs) {
          expect(card?.answer, `${cardId}: ${paragraph}`).toContain(paragraph)
        }
      }
    }

    const researchMethods = psychologyCourseTruthTopics.find((topic) => topic.topicNumber === 7)
    expect(researchMethods).toBeDefined()
    for (const [index, requirement] of (researchMethods?.requirements ?? []).slice(0, 12).entries()) {
      const drill = psychologyDataDrills[index]
      expect(drill, `psy-rm-drill-${index + 1}`).toBeDefined()
      expect(drill?.prompt, drill?.id).toContain(requirement.boardAlignment.summary)

      const requiredParagraphs = [...new Set([
        ...(requirement.subjectTruth.definitionsAndCoreConcepts ?? []),
        ...(requirement.subjectTruth.modelsResearchAndRelationships ?? []),
        ...(requirement.subjectTruth.evaluationAndLimits ?? []),
      ])]
      for (const paragraph of requiredParagraphs) {
        expect(drill?.answer, `${drill?.id}: ${paragraph}`).toContain(paragraph)
      }
    }
  })

  it('states consistently that range is sensitive to extreme scores', () => {
    const learnPage = psychologyLearn.chapters
      .flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
      .find((page) => page.id.endsWith('psy0726'))
    const card = psychologyFlashcards.find((candidate) => candidate.id === 'psy-psy0726-card')
    expect(JSON.stringify(learnPage)).toContain('range is directly determined by the minimum and maximum and is therefore sensitive to extreme scores')
    expect(card?.answer).toContain('range is directly determined by the minimum and maximum and is therefore sensitive to extreme scores')
    expect(JSON.stringify(learnPage)).not.toContain('range/other robust summaries can be more resistant')
  })

  it('uses calibrated 6 and 8 mark extended-response tariffs in generic mock sections', () => {
    expect(paper1.exams[0]?.questions.map((question) => question.marks)).toEqual(
      Array.from({ length: 4 }, () => [4, 8, 6, 6]).flat(),
    )
    expect(paper2.exams[0]?.questions.slice(0, 8).map((question) => question.marks)).toEqual(
      Array.from({ length: 2 }, () => [4, 8, 6, 6]).flat(),
    )
    const paper3Marks = paper3.exams[0]?.questions.map((question) => question.marks) ?? []
    for (let index = 0; index < paper3Marks.length; index += 4) {
      expect(paper3Marks.slice(index, index + 4)).toEqual([4, 8, 6, 6])
    }
    expect(paper1.exams[0]?.questions.some((question) => question.marks === 12)).toBe(false)
  })

  it('aligns application prompts, AO demand and self-marking guidance', () => {
    const p1 = paper1.exams[0]?.questions ?? []
    const p2 = paper2.exams[0]?.questions ?? []
    expect(p1.filter((question) => question.id.endsWith('-q2')).every((question) =>
      question.markingGuidance.some((line) => line.startsWith('Operationalisation credit:')),
    )).toBe(true)
    expect(p2.filter((question) => /-a-5-q2$|-b-6-q2$/.test(question.id)).every((question) =>
      !question.prompt.includes('limitation or alternative interpretation'),
    )).toBe(true)
    const clinical = p1.find((question) => question.id === 'psy-7182-1-d-4-q2')
    expect(clinical?.prompt).toContain('consistent with OCD')
    expect(clinical?.stimulus?.narrative).toContain('intrusive thoughts')
  })

  it('makes the Paper 2 variables task unambiguous and the Paper 3 route learner-visible', () => {
    const rmVariables = paper2.exams[0]?.questions.find((question) => question.id === 'psy-7182-2-c-rm-q1')
    expect(rmVariables?.stimulus?.narrative).toContain('digit-cancellation')
    expect(rmVariables?.stimulus?.narrative).toContain('sitting quietly')
    expect(rmVariables?.markingGuidance.join(' ')).toContain('Independent variable: distraction condition')

    const relationships = paper3.exams[0]?.questions.find((question) => question.id === 'psy-7182-3-b-9-q2')
    expect(relationships?.stimulus?.narrative).toContain('mutual friends become involved')
    expect(relationships?.stimulus?.narrative).toContain('after the breakup')

    const p3 = paper3.exams[0]
    expect(p3?.printedMarks).toBeUndefined()
    expect(p3?.caseHtml).toContain('Section A')
    expect(p3?.caseHtml).toContain('Section B')
    expect(p3?.caseHtml).toContain('Section C')
    expect(p3?.caseHtml).toContain('Section D')
    expect(p3?.caseHtml).toContain('96 marks')
    expect(p3?.learnerClaim).toContain('exactly one topic from each of Sections B, C and D')
  })

  it('stays preview-only until final independent assurance passes', () => {
    expect([paper1, paper2, paper3].map((pack) => pack.manifest.status)).toEqual(['preview', 'preview', 'preview'])
  })
})
