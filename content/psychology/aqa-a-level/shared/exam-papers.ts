import { examPapersContentSchema } from '../../../exam-papers-schema'
import examTruth from '../../../../research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'

const needsCheck = { status: 'needs_check', why: 'Revision learner-facing coaching derived from the approved Psychology Exam Truth; fresh final learner-content assurance is still required before restricted-pilot publication.' } as const

const topicIds: Record<number, string> = {
  1: 'social-influence',
  2: 'memory',
  3: 'attachment',
  4: 'clinical-psychology-and-mental-health',
  5: 'approaches-in-psychology',
  6: 'biopsychology',
  7: 'research-methods',
  8: 'issues-and-debates-in-psychology',
  9: 'relationships',
  10: 'gender',
  11: 'cognition-and-development',
  12: 'schizophrenia',
  13: 'eating-behaviour',
  14: 'stress',
  15: 'aggression',
  16: 'forensic-psychology',
  17: 'addiction',
}

function topicIdFor(number: number) {
  const id = topicIds[number]
  if (!id) throw new Error(`Missing Psychology topic id for topic ${number}`)
  return id
}

type PsychologyExamScope =
  | { topicNumber: number; topic?: string }
  | { topicNumbers: number[]; topics?: string[] }

const papers = examTruth.assessmentModel.papers.map((paper) => ({
  number: Number(paper.id.slice(-1)),
  name: `Paper ${paper.id.slice(-1)}`,
  title: paper.name,
  what: paper.id === '7182/1'
    ? 'Introductory topics in Psychology'
    : paper.id === '7182/2'
      ? 'Psychology in Context, including the dedicated Research Methods section'
      : 'Issues and Debates plus one topic from each option group',
  durationMinutes: paper.durationMinutes,
  totalMarks: paper.rawMarks,
  weighting: 'about a third of your A-level',
  sections: paper.sections.map((section) => {
    const scope = section.scope as PsychologyExamScope
    if ('topicNumber' in scope) {
      return {
        name: `Section ${section.id}`,
        type: scope.topic ?? `Topic ${scope.topicNumber}`,
        marks: section.marks,
      }
    }
    return {
      name: `Section ${section.id}`,
      type: `Choose one: ${scope.topics?.join(' / ') ?? scope.topicNumbers.map((number) => `Topic ${number}`).join(' / ')}`,
      marks: section.marks,
    }
  }),
  topics: paper.sections.flatMap((section) => {
    const scope = section.scope as PsychologyExamScope
    return 'topicNumber' in scope
      ? [topicIdFor(scope.topicNumber)]
      : scope.topicNumbers.map((number) => topicIdFor(number))
  }),
}))

export const aqaPsychology7182ExamPapers = examPapersContentSchema.parse({
  schemaVersion: 1,
  examBoard: 'AQA',
  specificationCode: '7182',
  checkedAgainst: {
    source: 'https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/specification-at-a-glance',
    checkedOn: examTruth.checkedDate,
    approvedBy: 'Source-First Psychology Exam Truth',
  },
  papers,
  assessmentObjectives: [
    {
      id: 'AO1',
      capability: 'Knowledge and understanding of scientific ideas, processes, techniques and procedures',
      overallPercentRange: examTruth.assessmentObjectives.AO1.overallPercentRange,
      coaching: { does: 'Accurate psychological knowledge and understanding.', show: 'Select precise concepts, theories, evidence, processes or procedures that answer the question.', check: needsCheck },
    },
    {
      id: 'AO2',
      capability: 'Application of knowledge and understanding',
      overallPercentRange: examTruth.assessmentObjectives.AO2.overallPercentRange,
      coaching: { does: 'Use psychology in theoretical, practical and data contexts.', show: 'Apply the right knowledge to the cues, study, data or scenario you have actually been given.', check: needsCheck },
    },
    {
      id: 'AO3',
      capability: 'Analysis, interpretation and evaluation',
      overallPercentRange: examTruth.assessmentObjectives.AO3.overallPercentRange,
      coaching: { does: 'Analyse, interpret, evaluate, judge and refine.', show: 'Develop reasoning, compare explanations, evaluate evidence and keep conclusions proportional to what the evidence supports.', check: needsCheck },
    },
  ],
  commandWords: Object.entries(examTruth.commandDemandModel.commands).flatMap(([demand, words]) =>
    words.map((word) => ({
      word,
      asks: `Respond to the ${demand.replaceAll('_', ' ')} demand using the exact question context.`,
      marks: 'Variable',
      aos: demand.includes('analysis')
        ? 'Mainly AO3'
        : demand === 'explanation_application'
          ? 'AO1 or AO2 depending on whether the stem asks for explanation of knowledge or application to a supplied context'
          : 'Depends on the question',
      check: needsCheck,
    })),
  ),
  levelsNote: {
    text: 'Longer responses are judged against the complete assessment demand. Revision marking guidance is independently authored and is not an official AQA mark scheme.',
    check: needsCheck,
  },
})
