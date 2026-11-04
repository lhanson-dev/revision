import { contentPackSchema } from '../../../schema'
import { psychologyCaseStudies } from '../shared/cases'
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
import { psychologySignTestPracticeBank } from '../shared/sign-test-practice'
import { psychologySignCriticalPracticeBank, psychologySignCriticalDrills } from '../shared/sign-critical-practice'
import { psychologySocialInfluenceAppliedPracticeBank, psychologySocialInfluenceWrittenDrills } from '../shared/social-influence-practice'

export const psychologyAqaALevel7182Paper2 = contentPackSchema.parse({
  manifest,
  topics: psychologyTopics,
  learn: psychologyLearn,
  formulas: [],
  topicLinks: psychologyTopicLinks,
  flashcards: psychologyFlashcards,
  questions: [...psychologyQuestions, ...psychologyResearchMethodsAppliedQuestions, ...psychologyInferenceChoiceQuestions],
  practiceBank: [...psychologyStandardDeviationPracticeBank, ...psychologySignTestPracticeBank, ...psychologySignCriticalPracticeBank, ...psychologySocialInfluenceAppliedPracticeBank],
  caseStudies: psychologyCaseStudies,
  dataDrills: [...psychologyDataDrills, ...psychologyResearchMethodsAppliedDrills, ...psychologyInferenceChoiceDrills, ...psychologySignCriticalDrills, ...psychologySocialInfluenceWrittenDrills],
  examTechnique: psychologyExamTechnique,
  exams: psychologyPaper2Exams,
})

export default psychologyAqaALevel7182Paper2
