import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import {
  psychologyDataDrills,
  psychologyExamTechnique,
  psychologyFlashcards,
  psychologyLearn,
  psychologyPaper1Exams,
  psychologyQuestions,
  psychologyTopicLinks,
  psychologyTopics,
} from '../shared/course'

export const psychologyAqaALevel7182Paper1 = contentPackSchema.parse({
  manifest,
  topics: psychologyTopics,
  learn: psychologyLearn,
  formulas: [],
  topicLinks: psychologyTopicLinks,
  flashcards: psychologyFlashcards,
  questions: psychologyQuestions,
  caseStudies: [],
  dataDrills: psychologyDataDrills,
  examTechnique: psychologyExamTechnique,
  exams: psychologyPaper1Exams,
})

export default psychologyAqaALevel7182Paper1
