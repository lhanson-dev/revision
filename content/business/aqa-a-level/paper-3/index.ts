import { contentPackSchema } from '../../../schema'
import { manifest } from './manifest'
import { topics } from '../shared/topics'
import { learn } from '../shared/learn'
import { formulas, topicLinks } from '../shared/learning'
import { publishedFlashcards } from '../shared/published-flashcards'
import { questions } from '../shared/questions'
import { aqaBusinessQuestionBank } from '../shared/fast-path-questions'
import { businessFinanceNumericPracticeBank } from '../shared/financial-numeric-practice'
import { businessPurposeProfitNumericBank } from '../shared/purpose-profit-numeric-practice'
import { businessDecisionTreeNumericalBank } from '../shared/decision-tree-numeric-practice'
import { dataDrills } from '../shared/quantitative'
import { networkPractice } from '../shared/network-practice'
import { businessFinancialConstructionDrills } from '../shared/financial-construction-practice'
import { caseStudies } from '../shared/cases'
import { examTechnique } from '../shared/exam-technique'
import { exams } from './exam'

export const businessAqaALevel7132Paper3 = contentPackSchema.parse({
  manifest,
  topics,
  learn,
  formulas,
  topicLinks,
  flashcards: publishedFlashcards,
  questions,
  practiceBank: [...aqaBusinessQuestionBank, ...businessFinanceNumericPracticeBank, ...businessPurposeProfitNumericBank, ...businessDecisionTreeNumericalBank],
  caseStudies,
  dataDrills: [...dataDrills, ...networkPractice, ...businessFinancialConstructionDrills],
  examTechnique,
  exams,
})

export default businessAqaALevel7132Paper3
