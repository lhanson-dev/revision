import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import { topics } from '../shared/topics'
import { learn } from '../shared/learn'
import { formulas, topicLinks } from '../shared/learning'
import { publishedFlashcards } from '../shared/published-flashcards'
import { questions } from '../shared/questions'
import { aqaBusinessQuestionBank } from '../shared/fast-path-questions'
import { dataDrills } from '../shared/quantitative'
import { networkPractice } from '../shared/network-practice'
import { caseStudies } from '../shared/cases'
import { examTechnique } from '../shared/exam-technique'
import { exams } from './exam'

export const businessAqaALevel7132Paper1 = contentPackSchema.parse({
  manifest,
  topics,
  learn,
  formulas,
  topicLinks,
  flashcards: publishedFlashcards,
  questions,
  practiceBank: aqaBusinessQuestionBank,
  caseStudies,
  dataDrills: [...dataDrills, ...networkPractice],
  examTechnique,
  exams,
})

export default businessAqaALevel7132Paper1
