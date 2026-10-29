import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import {
  psychologyDataDrills,
  psychologyExamTechnique,
  psychologyFlashcards,
  psychologyLearn,
  psychologyPaper2Exams,
  psychologyQuestions,
  psychologyTopicLinks,
  psychologyTopics,
} from '../shared/course'
import { psychologyPackPracticeExperience } from '../shared/practice-experience'

export const psychologyAqaALevel7182Paper2 = contentPackSchema.parse({
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
  practiceExperience: psychologyPackPracticeExperience,
  exams: psychologyPaper2Exams,
})

export default psychologyAqaALevel7182Paper2
