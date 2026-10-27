/**
 * Non-publishing 9BS0 Market 1.2 ContentPack compatibility trial.
 *
 * Reprojects already-authored, unreviewed original research into the actual
 * learner-facing schema WITHOUT pretending that it was factory-generated,
 * AI-assured, educationally accepted, or eligible for publication.
 *
 * Deliberately outside the Vite content pack entry-point discovery. This is not a live
 * Content Factory run and must not record learner mastery or create Exam Prep
 * simulations from unapproved question/marking candidates.
 */
import { contentPackSchema } from '../../content/schema'
import existing from './edexcel-9bs0-market-learning-assessment-specimen.json'
import additions from './edexcel-9bs0-market-demand-elasticity-authoring-v1.json'
import revised from './edexcel-9bs0-market-assessment-remediation-v2.json'

const topic = 'markets'
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const originalSections = existing.learner_content_specimen.sections
const supplemental = additions.skill_specimens

// Every input is a Revision-authored specimen; these are not official Pearson passages.
const originalPages = originalSections.map((section) => ({
  id: 'edexcel-market-' + slug(section.id),
  topicId: topic,
  title: section.heading,
  orientation: 'Understand the model, then test its limits with original practice.',
  blocks: [
    { type: 'explanation' as const, heading: section.heading, paragraphs: section.paragraphs },
    { type: 'recap' as const, items: [section.paragraphs[section.paragraphs.length - 1]] },
  ],
}))
const extraPages = supplemental.map((item) => ({
  id: 'edexcel-market-' + slug(item.skill_id),
  topicId: topic,
  title: item.original_semantic_tag.replace(/-/g, ' '),
  orientation: 'Apply this idea to the original fictional situation.',
  blocks: [
    { type: 'explanation' as const, heading: item.original_semantic_tag.replace(/-/g, ' '), paragraphs: [item.teaching_note] },
    { type: 'example' as const, paragraphs: [item.original_case] },
    { type: 'misconception' as const, title: 'Check the assumption', paragraphs: [item.misconception_to_challenge] },
  ],
}))
const multipleChoice = existing.practice_specimens.filter((item) => item.mode === 'multiple_choice')
const numeric = existing.practice_specimens.filter((item) => item.mode === 'calculation')

/**
 * A DataDrill exposes worked feedback, but is not a scored learner attempt.
 * Deliberately exclude the author's draft written marking points and the
 * graph-construction skill, neither of which is learner-assessed here.
 */
export const edexcelMarketTrialPack = contentPackSchema.parse({
  manifest: {
    id: 'business-edexcel-a-level-9bs0-market-trial',
    schemaVersion: 1,
    status: 'planned',
    subject: { id: 'business', name: 'Business' },
    qualification: { id: 'edexcel-a-level', name: 'Edexcel A-level' },
    examBoard: { id: 'edexcel', name: 'Pearson Edexcel' },
    specificationCode: '9BS0',
    paper: { id: 'paper-1', name: 'Paper 1: Marketing, people and global businesses', number: 1, durationMinutes: 120, totalMarks: 100 },
    learnerExperience: {
      title: 'Edexcel Business Market section 1.2 (unreviewed internal trial)',
      what_is_this: 'Non-published research projection of original section 1.2 learning and practice.',
      why_it_matters: 'Explore demand, supply, market equilibrium and elasticity at A-level.',
      what_you_are_trying_to_do: 'Explain shifts, calculate changes and analyse fictional business contexts.',
      how_results_are_worked_out: 'No educational readiness or marking decisions are authorised by this trial.',
      what_to_do_next: 'Do not publish: establish exact Course/Exam Truth and independent educational assurance.',
    },
    topicIds: [topic],
  },
  topics: [{
    id: topic, order: 1, title: 'Market — research trial', shortTitle: 'Market',
    sections: [
      { id: 'demand', title: 'Factors affecting market demand', points: ['Explain how demand can shift at unchanged own price.'] },
      { id: 'supply-equilibrium', title: 'Supply and market equilibrium', points: ['Calculate and explain market-equilibrium changes.'] },
      { id: 'elasticity', title: 'Elasticity of demand', points: ['Calculate and interpret elasticity in context.'] },
    ],
  }],
  learn: { chapters: [{
    id: topic, topicId: topic, title: 'Market — unreviewed original authoring',
    groups: [
      { id: 'supply-guide', title: 'Supply, demand and equilibrium', pages: originalPages },
      { id: 'demand-and-elasticity-guide', title: 'Demand determinants and elasticity', pages: extraPages },
    ],
  }] },
  formulas: [],
  topicLinks: [],
  flashcards: [],
  questions: multipleChoice.map((item) => ({
    id: 'edexcel-market-' + slug(item.id),
    topic,
    prompt: item.prompt,
    options: item.options!,
    correctOption: item.correct_option_index!,
    explanation: item.explanation!,
  })),
  practiceBank: [],
  dataDrills: [
    ...numeric.map((item) => ({
      id: 'edexcel-market-' + slug(item.id),
      title: 'Calculate a market quantity or price',
      prompt: item.prompt,
      answer: String(item.expected_number) + ' (' + item.unit + '). ' + item.explanation,
    })),
    ...supplemental.map((item) => ({
      id: 'edexcel-market-' + slug(item.skill_id),
      title: 'Apply: ' + item.original_semantic_tag.replace(/-/g, ' '),
      prompt: item.original_case + ' ' + item.original_practice_prompt,
      answer: item.unscored_expected_reasoning + ' Caution: ' + item.misconception_to_challenge,
    })),
  ],
  caseStudies: [],
  examTechnique: [],
  exams: [], // Correct: no assured full paper or approved extended-response scoring.
})

/** An explicit record of what is NOT in the learner pack. */
export const edexcelMarketTrialEvidence = {
  classification: 'UNREVIEWED_RESEARCH_ADAPTER_PROOF_ONLY',
  exactCourseAiAssured: false,
  foundationApproved: false,
  published: false,
  approvedExamTruth: false,
  generatedProviderCallsThisRun: 0,
  generatedProviderSpendUsdThisRun: 0,
  manualConversion: 'One custom test-only research-to-pack conversion; NOT a reusable factory production run',
  sourceSection: '1.2',
  provisionalSkillCount: 26,
  originalSupplyTeachingPages: originalPages.length,
  originallyAuthoredDemandElasticityPages: extraPages.length,
  provisionalMCQs: multipleChoice.length,
  provisionalCalculationDrills: numeric.length,
  provisionalContextualDrills: supplemental.length,
  graphicalConstructionTested: false,
  revisedOriginalTenMarkQuestion: {
    id: revised.new_assessment_candidate.id,
    prompt: revised.new_assessment_candidate.prompt,
    learnerReleased: false,
    markingAllowed: false,
    reason: 'No approved exact Exam Truth, independent level-based rubric or response calibration',
  },
  missing: [
    'Independent acceptance and atomic source coverage for all section 1.2 skills',
    'Graph construction performance and valid scoring',
    'Full, level-based original exam responses and feedback validated against exam truth',
    'Full paper simulation and all 2027 qualification exam context',
    'Verified provider generation, retries, time, cost and second-section portability',
  ],
} as const
