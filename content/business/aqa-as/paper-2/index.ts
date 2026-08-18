import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import { topics } from './topics'
import { formulas, topicLinks } from './learning'
import { flashcards } from './flashcards'
import { dataDrills, northPeakCaseStudy, questions } from './questions'
import { extendedCaseStudies } from './cases-extended'
import { extendedDataDrills } from './quantitative-extended'
import { examTechnique } from './exam-technique'
import { exams } from './exams'
import { extendedExams } from './exams-extended'

export const businessAqaAsPaper2 = contentPackSchema.parse({
  manifest,
  topics,
  formulas,
  topicLinks,
  flashcards,
  questions,
  caseStudies: [northPeakCaseStudy, ...extendedCaseStudies],
  dataDrills: [...dataDrills, ...extendedDataDrills],
  examTechnique,
  exams: [...exams, ...extendedExams],
})

export default businessAqaAsPaper2

export type BusinessAqaAsPaper2Content = typeof businessAqaAsPaper2
