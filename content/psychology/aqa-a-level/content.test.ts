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
  psychologyObjectivePracticeContracts,
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
    expect(questions[4]?.stimulus?.narrative).toContain('calculated correlation coefficient is -0.62')
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


  it('keeps AQA quasi-experiment framing distinct from non-random allocation alone', () => {
    const researchMethods = psychologyCourseTruthTopics.find((topic) => topic.topicNumber === 7)
    const requirement = researchMethods?.requirements.find((candidate) => candidate.requirementId === 'PSY-07-01')
    const definition = requirement?.subjectTruth.definitionsAndCoreConcepts?.join(' ') ?? ''
    expect(definition).toContain('pre-existing participant characteristic or naturally occurring difference')
    expect(definition).toContain('non-random allocation alone does not define the AQA quasi-experiment category')
  })

  it('keeps objective Practice definitions grammatical and excludes known overlapping distractors', () => {
    for (const question of psychologyQuestions) {
      expect(question.prompt, question.id).not.toMatch(/This concept (?:are|organise|propose|examine|focus|use|measure|distinguish)\b/i)
    }

    const contractByRequirement = new Map(psychologyObjectivePracticeContracts.map((contract) => [contract.requirementId, contract]))
    const q1503 = psychologyQuestions.find((question) => question.id === 'psy-psy1503-check')
    const q1505 = psychologyQuestions.find((question) => question.id === 'psy-psy1505-check')
    const label1503 = contractByRequirement.get('PSY-15-03')?.label
    const label1505 = contractByRequirement.get('PSY-15-05')?.label
    expect(q1503?.options).not.toContain(label1505)
    expect(q1505?.options).not.toContain(label1503)
  })

  it('makes every expressly offered generic mock route self-markable', () => {
    const questions = [
      ...(paper1.exams[0]?.questions ?? []),
      ...(paper2.exams[0]?.questions ?? []),
      ...(paper3.exams[0]?.questions ?? []),
    ].filter((question) => !question.id.includes('-rm-') && /-q[134]$/.test(question.id))

    for (const question of questions) {
      const match = question.id.match(/-(\d+)-q([134])$/)
      expect(match, question.id).not.toBeNull()
      const topicNumber = Number(match?.[1])
      const questionNumber = Number(match?.[2])
      const topic = psychologyCourseTruthTopics.find((candidate) => candidate.topicNumber === topicNumber)
      const requirement = topic?.requirements[questionNumber - 1]
      expect(requirement, question.id).toBeDefined()
      const guidance = question.markingGuidance.join(' ')

      for (const point of requirement?.subjectTruth.definitionsAndCoreConcepts ?? []) {
        expect(guidance, `${question.id}: missing knowledge route`).toContain(point)
      }
      if (questionNumber === 3 || questionNumber === 4) {
        for (const point of requirement?.subjectTruth.evaluationAndLimits ?? []) {
          expect(guidance, `${question.id}: missing evaluation route`).toContain(point)
        }
      }
    }
  })

  it('coaches explain contextually and includes discuss and evaluate command words', () => {
    const byWord = new Map((aqaPsychology7182ExamPapers.commandWords ?? []).map((entry) => [entry.word, entry]))
    expect(byWord.has('discuss')).toBe(true)
    expect(byWord.has('evaluate')).toBe(true)
    for (const word of ['explain', 'explain how', 'explain why']) {
      expect(byWord.get(word)?.aos).toContain('AO1 or AO2')
    }
  })

  it('binds every objective Practice stem and key to the same approved Course Truth definition', () => {
    expect(psychologyObjectivePracticeContracts).toHaveLength(118)
    expect(psychologyQuestions).toHaveLength(118)
    expect(new Set(psychologyQuestions.map((question) => question.correctOption))).toEqual(new Set([0, 1, 2, 3]))

    let offset = 0
    for (const topic of psychologyCourseTruthTopics) {
      const topicQuestions = psychologyQuestions.slice(offset, offset + topic.requirements.length)
      const contracts = psychologyObjectivePracticeContracts.slice(offset, offset + topic.requirements.length)
      offset += topic.requirements.length

      for (const [index, question] of topicQuestions.entries()) {
        const contract = contracts[index]
        expect(contract, question.id).toBeDefined()
        expect(new Set(question.options).size, question.id).toBe(4)
        expect(question.options[question.correctOption], question.id).toBe(contract?.label)
        expect(question.prompt, question.id).toBe(contract?.prompt)
        expect(question.explanation, question.id).toContain(contract?.definition)
        expect(question.prompt.toLowerCase(), question.id).not.toContain(contract?.label.toLowerCase())
        for (const option of question.options) {
          expect(contracts.some((candidate) => candidate.label === option), `${question.id}: ${option}`).toBe(true)
        }
      }

      if (topicQuestions.length >= 8) {
        const positions = topicQuestions.map((question) => question.correctOption)
        expect(positions.slice(0, 4), `topic ${topic.topicNumber} answer positions`).not.toEqual(positions.slice(4, 8))
      }
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

  it('aligns prompt scope, section structure, AO demand and operational self-marking guidance', () => {
    const p1 = paper1.exams[0]?.questions ?? []
    const p2 = paper2.exams[0]?.questions ?? []
    const p3 = paper3.exams[0]?.questions ?? []
    const all = [...p1, ...p2, ...p3]

    for (const question of all) {
      expect(question.sectionLabel, question.id).toMatch(/^Section [A-D]$/)
      expect(question.sectionTitle?.length, question.id).toBeGreaterThan(2)
      expect(question.sectionMarks, question.id).toBeGreaterThan(0)
      expect(question.markingGuidance.some((line) => line.startsWith('Mark allocation:')), question.id).toBe(true)
      if (question.assessmentObjectives.ao1 > 0) expect(question.markingGuidance.join(' '), question.id).toContain(`AO1 (${question.assessmentObjectives.ao1})`)
      if (question.assessmentObjectives.ao2 > 0) expect(question.markingGuidance.join(' '), question.id).toContain(`AO2 (${question.assessmentObjectives.ao2})`)
      if (question.assessmentObjectives.ao3 > 0) expect(question.markingGuidance.join(' '), question.id).toContain(`AO3 (${question.assessmentObjectives.ao3})`)
    }

    for (const question of [...p1, ...p2].filter((candidate) => /-q1$|-q3$|-q4$/.test(candidate.id) && !candidate.id.includes('-rm-'))) {
      expect(question.prompt, question.id).toMatch(/choose any two|Focus on one issue only|do not need to cover every named element/i)
    }

    const embeddedRm = p1.filter((question) => question.id.endsWith('-q2'))
    for (const question of embeddedRm) {
      expect(question.markingGuidance.join(' '), question.id).toContain('reproducibility')
      expect(question.markingGuidance.join(' '), question.id).toContain('Construct validity is separate')
    }

    const validity = p2.find((question) => question.id === 'psy-7182-2-c-rm-q3')
    expect(validity?.assessmentObjectives).toEqual({ ao1: 2, ao2: 5, ao3: 5, ao4: 0 })
    const paper2AoTotals = p2.reduce((totals, question) => ({
      ao1: totals.ao1 + question.assessmentObjectives.ao1,
      ao2: totals.ao2 + question.assessmentObjectives.ao2,
      ao3: totals.ao3 + question.assessmentObjectives.ao3,
    }), { ao1: 0, ao2: 0, ao3: 0 })
    expect(paper2AoTotals).toEqual({ ao1: 21, ao2: 50, ao3: 25 })

    const clinical = p1.find((question) => question.id === 'psy-7182-1-d-4-q2')
    expect(clinical?.prompt).toContain('consistent with OCD')
    expect(clinical?.stimulus?.narrative).toContain('intrusive thoughts')
  })

  it('binds heterogeneous mock application questions to one coherent concept contract', () => {
    const questions = [
      ...(paper1.exams[0]?.questions ?? []),
      ...(paper2.exams[0]?.questions ?? []),
      ...(paper3.exams[0]?.questions ?? []),
    ]
    const question = (id: string) => {
      const found = questions.find((candidate) => candidate.id === id)
      expect(found, id).toBeDefined()
      return found!
    }
    const indicative = (id: string) => question(id).markingGuidance
      .filter((line) => line.startsWith('Indicative '))
      .join(' ')

    const attachment = question('psy-7182-1-c-3-q2')
    expect(attachment.prompt).toContain('Bowlby')
    expect(indicative(attachment.id)).not.toMatch(/conditioning|classical conditioning|operant conditioning/i)

    const clinical = question('psy-7182-1-d-4-q2')
    expect(clinical.prompt).toMatch(/choose any two/i)
    expect(clinical.stimulus?.narrative).toContain('intense anxiety')
    expect(indicative(clinical.id)).toMatch(/OCD|obsessive-compulsive|compulsion|obsession/i)
    expect(indicative(clinical.id)).not.toMatch(/phobia|depression/i)

    const biopsychology = question('psy-7182-2-b-6-q2')
    expect(biopsychology.prompt).toContain('sensory, relay and motor neurons')
    expect(indicative(biopsychology.id)).toMatch(/sensory neurons|relay|interneurons|motor neurons/i)
    expect(indicative(biopsychology.id)).not.toMatch(/glutamate|GABA|summation/i)

    const relationships = question('psy-7182-3-b-9-q2')
    expect(relationships.prompt).toContain('Rusbult')
    expect(indicative(relationships.id)).toMatch(/satisfaction|alternatives|investment/i)
    expect(indicative(relationships.id)).not.toMatch(/equity|Duck/i)

    const schizophrenia = question('psy-7182-3-c-12-q2')
    expect(schizophrenia.prompt).toContain('genetic explanations of schizophrenia')
    expect(schizophrenia.stimulus?.narrative).not.toMatch(/scan|neurotransmitter/i)
    expect(indicative(schizophrenia.id)).not.toMatch(/dopamine|neural correlate|antipsychotic/i)

    const eating = question('psy-7182-3-c-13-q2')
    expect(eating.prompt).toContain('neural and hormonal control of eating behaviour')
    expect(indicative(eating.id)).toMatch(/hypothalam|ghrelin|leptin/i)

    const forensic = question('psy-7182-3-d-16-q2')
    expect(forensic.prompt).toContain('genetic explanations of offending behaviour')
    expect(forensic.stimulus?.narrative).not.toMatch(/imaging|brain region/i)
    expect(indicative(forensic.id)).not.toMatch(/neural explanations|brain structure|imaging/i)
  })

  it('closes run-10 Paper 2 self-marking blockers', () => {
    const questions = paper2.exams[0]?.questions ?? []

    const slt = questions.find((question) => question.id === 'psy-7182-2-a-5-q2')
    expect(slt).toBeDefined()
    expect(slt?.stimulus?.narrative).toContain('admired older student')
    const sltIndicative = slt?.markingGuidance.filter((line) => line.startsWith('Indicative ')).join(' ') ?? ''
    expect(sltIndicative).toMatch(/identification/i)
    expect(sltIndicative).toMatch(/vicarious reinforcement/i)
    expect(sltIndicative).toMatch(/imitation/i)
    expect(sltIndicative).not.toMatch(/Bobo|doll/i)

    const rm = questions.find((question) => question.id === 'psy-7182-2-c-rm-q1')
    expect(rm).toBeDefined()
    expect(rm?.prompt).toContain('state one procedure that should be standardised')
    const rmGuidance = rm?.markingGuidance.join(' ') ?? ''
    expect(rmGuidance).toContain('three distinct applied requirements')
    expect(rmGuidance).toContain('standardised across conditions')
    expect(rmGuidance).toContain('same 20-word list and recall instructions')
    expect(rmGuidance).not.toContain('sufficiently observable and repeatable')
  })

  it('keeps run-7 and run-9 Research Methods and Paper 3 contracts markable', () => {
    const histogram = psychologyLearn.chapters
      .flatMap((chapter) => chapter.groups)
      .find((group) => group.id === 'psy0727')
    const histogramText = JSON.stringify(histogram)
    expect(histogramText).toContain('frequency density')
    expect(histogramText).toContain('frequency divided by class width')
    expect(histogramText).toContain("bar's area")
    expect(histogramText).toContain('plotting raw frequency as bar height with unequal widths would distort')

    const rm = paper2.exams[0]?.questions.filter((question) => question.id.startsWith('psy-7182-2-c-rm-')) ?? []
    const signTest = rm.find((question) => question.id === 'psy-7182-2-c-rm-q4')
    expect(signTest?.prompt).toContain('+ to mean After is greater than Before')
    expect(signTest?.prompt).toContain('− to mean After is less than Before')
    expect(signTest?.markingGuidance.join(' ')).toContain('A +, B tie, C −, D +, E +')

    const inferential = rm.find((question) => question.id === 'psy-7182-2-c-rm-q5')
    expect(inferential?.prompt).toMatch(/Select and justify the appropriate inferential test/)
    expect(inferential?.stimulus?.narrative).not.toMatch(/Spearman/i)
    expect(inferential?.markingGuidance.join(' ')).toContain('select Spearman’s rho')

    const p3 = paper3.exams[0]?.questions ?? []
    const evaluationQuestions = p3.filter((question) => question.id.endsWith('-q3'))
    expect(evaluationQuestions).toHaveLength(10)
    for (const question of evaluationQuestions) {
      expect(question.prompt).toContain('Evaluate one limitation or boundary')
      expect(question.prompt).not.toMatch(/conclusion|judgement/i)
      const ao3Rule = question.markingGuidance.find((line) => line.startsWith('AO3 (5):')) ?? ''
      expect(ao3Rule).toContain('one fully developed limitation or boundary')
      expect(ao3Rule).not.toMatch(/conclusion|judgement/i)
    }

    const discussionQuestions = p3.filter((question) => question.id.endsWith('-q4'))
    for (const question of discussionQuestions) {
      expect(question.prompt).toMatch(/reach a proportionate conclusion/i)
      expect(question.markingGuidance.join(' ')).toMatch(/judgement.*proportionate conclusion/i)
    }
  })

  it('makes Research Methods markable and Paper 3 application cues non-leading', () => {
    const rm = paper2.exams[0]?.questions.filter((question) => question.id.startsWith('psy-7182-2-c-rm-')) ?? []
    expect(rm[0]?.markingGuidance.join(' ')).toContain('AO1 (1)')
    expect(rm[1]?.markingGuidance.join(' ')).toContain('Mean (2)')
    expect(rm[1]?.markingGuidance.join(' ')).toContain('Range (2)')
    expect(rm[2]?.markingGuidance.join(' ')).toContain('AO3 (5)')
    expect(rm[3]?.markingGuidance.join(' ')).toContain('effective n as 4')
    expect(rm[4]?.markingGuidance.join(' ')).toContain('Spearman’s rho')

    const p3Questions = paper3.exams[0]?.questions ?? []
    const applicationText = p3Questions.filter((question) => question.id.endsWith('-q2')).map((question) => question.stimulus?.narrative ?? '').join(' ')
    expect(applicationText).not.toMatch(/non-binary|ghrelin|leptin|genetic vulnerability|neural explanations|evolved mechanisms|fixed action pattern|innate releasing mechanism/i)

    const p1 = paper1.exams[0]
    expect(p1?.caseHtml).toContain('Section A — Social influence — 24 marks')
    expect(p1?.caseHtml).toContain('Section D — Clinical Psychology and Mental Health — 24 marks')
    const p2 = paper2.exams[0]
    expect(p2?.caseHtml).toContain('Section C — Research methods — 48 marks')

    const p3 = paper3.exams[0]
    expect(p3?.printedMarks).toBeUndefined()
    expect(p3?.caseHtml).toContain('Section A')
    expect(p3?.caseHtml).toContain('Section B')
    expect(p3?.caseHtml).toContain('Section C')
    expect(p3?.caseHtml).toContain('Section D')
    expect(p3?.caseHtml).toContain('96 marks')
    expect(p3?.learnerClaim).toContain('exactly one topic from each of Sections B, C and D')
  })

  it('is available only on the governed promotion candidate after launch assurance passes', () => {
    expect([paper1, paper2, paper3].map((pack) => pack.manifest.status)).toEqual(['available', 'available', 'available'])
  })
})
