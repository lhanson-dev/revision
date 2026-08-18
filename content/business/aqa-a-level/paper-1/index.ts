import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import { topics } from '../shared/topics'
import { formulas, topicLinks } from '../shared/learning'
import { flashcards } from '../shared/flashcards'
import { questions } from '../shared/questions'
import { dataDrills } from '../shared/quantitative'
import { caseStudies } from '../shared/cases'
import { examTechnique } from '../shared/exam-technique'
import { exams } from './exam'

export const businessAqaALevel7132Paper1 = contentPackSchema.parse({
  manifest,
  topics,
  formulas,
  topicLinks,
  flashcards,
  questions,
  caseStudies,
  dataDrills,
  examTechnique,
  exams,
})

export default businessAqaALevel7132Paper1
