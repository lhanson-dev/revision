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
import { psychologyResearchMethodsAppliedQuestions, psychologyResearchMethodsAppliedDrills } from '../shared/research-methods-practice'
import { psychologyInferenceChoiceQuestions, psychologyInferenceChoiceDrills } from '../shared/inferential-choice-practice'
import { psychologyStandardDeviationPracticeBank } from '../shared/standard-deviation-practice'

export const psychologyAqaALevel7182Paper2 = contentPackSchema.parse({
  manifest,
  topics: psychologyTopics,
  learn: psychologyLearn,
  formulas: [],
  topicLinks: psychologyTopicLinks,
  flashcards: psychologyFlashcards,
  questions: [...psychologyQuestions, ...psychologyResearchMethodsAppliedQuestions, ...psychologyInferenceChoiceQuestions],
  practiceBank: psychologyStandardDeviationPracticeBank,
  caseStudies: [],
  dataDrills: [...psychologyDataDrills, ...psychologyResearchMethodsAppliedDrills, ...psychologyInferenceChoiceDrills],
  examTechnique: psychologyExamTechnique,
  exams: psychologyPaper2Exams,
})

export default psychologyAqaALevel7182Paper2
