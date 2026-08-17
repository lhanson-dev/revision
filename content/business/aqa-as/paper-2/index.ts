import { manifest } from './manifest'
import { topics } from './topics'
import { formulas, topicLinks } from './learning'
import { flashcards } from './flashcards'
import { dataDrills, northPeakCaseStudy, questions } from './questions'
import { exams } from './exams'

export const businessAqaAsPaper2 = {
  manifest,
  topics,
  formulas,
  topicLinks,
  flashcards,
  questions,
  caseStudies: [northPeakCaseStudy],
  dataDrills,
  exams,
} as const

export type BusinessAqaAsPaper2Content = typeof businessAqaAsPaper2
