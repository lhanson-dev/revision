import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS,
  AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES,
} from './live-pilot'

const paper1McqFamilyId = 'paper1-mcq-10'
const paper1ShortAnswerFamilyId = 'paper1-short-answer-20'
const paper2FamilyId = 'paper2-case-study-80'

const contributionClarification = 'The supermarket contract has a selling price of GBP 3.40 per pack. The stated GBP 1.70 outsourcing figure is the total variable cost per outsourced supermarket pack.'
const decisionClarification = 'The supermarket contract is guaranteed for three years. RefillWorks may use the existing 18,000 packs of spare annual capacity for supermarket-contract packs and outsource the remaining 6,000 packs, so a hybrid route is feasible. The GBP 1.55 current variable cost applies to supermarket-contract packs made on existing equipment. The GBP 1.30 variable cost applies only to supermarket-contract packs made on the automated line.'
const paper2ResponseClarification = 'Treat automation, full outsourcing, and the feasible hybrid route using 18,000 packs of existing spare capacity plus 6,000 outsourced packs as material alternatives. Compare one-off and recurring financial effects over the supplied three-year contract horizon and use qualitative factors where relevant.'
const shortAnswerClarification = 'Do not classify market research or evidence as quantitative or qualitative unless the learner-facing wording or stimulus explicitly establishes the response format or data type. Do not presuppose a sampling frame or representativeness fact that is not stated in the original scenario.'
const mcqClarification = 'Across a multi-question MCQ set, vary correct-answer positions so the answer key does not reveal a mechanical option pattern.'

function appendOnce(value: string, sentence: string) {
  return value.includes(sentence) ? value : `${value} ${sentence}`
}

function upsertDataPoint(
  context: { dataPoints: Array<{ label: string; value: string; unit?: string }> },
  point: { label: string; value: string; unit?: string },
  replaceLabels: string[] = [],
) {
  context.dataPoints = context.dataPoints.filter((existing) => existing.label !== point.label && !replaceLabels.includes(existing.label))
  context.dataPoints.push(point)
}

export function applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy() {
  const policy = AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES[paper2FamilyId]
  if (policy) {
    policy.requirementIds = policy.requirementIds.filter((requirementId) => requirementId !== 'marketing-demand-and-positioning')
  }

  const mcqPolicy = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[paper1McqFamilyId]
  if (mcqPolicy) mcqPolicy.responseShape = appendOnce(mcqPolicy.responseShape, mcqClarification)

  const shortAnswerPolicy = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[paper1ShortAnswerFamilyId]
  if (shortAnswerPolicy) shortAnswerPolicy.responseShape = appendOnce(shortAnswerPolicy.responseShape, shortAnswerClarification)

  const paper2Policy = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[paper2FamilyId]
  if (paper2Policy) paper2Policy.responseShape = appendOnce(paper2Policy.responseShape, paper2ResponseClarification)

  const context = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS[paper2FamilyId]
  if (!context) return

  context.body = appendOnce(context.body, contributionClarification)
  context.body = appendOnce(context.body, decisionClarification)

  upsertDataPoint(context, {
    label: 'Supermarket-contract selling price',
    value: '3.40',
    unit: 'GBP per pack',
  }, ['Current selling price'])
  upsertDataPoint(context, {
    label: 'Total variable cost per outsourced supermarket pack',
    value: '1.70',
    unit: 'GBP per pack',
  }, ['Outsourcing cost for additional packs'])
  upsertDataPoint(context, {
    label: 'Variable cost per supermarket-contract pack made on current equipment',
    value: '1.55',
    unit: 'GBP per pack',
  }, ['Current variable cost'])
  upsertDataPoint(context, {
    label: 'Variable cost per supermarket-contract pack made on automated line',
    value: '1.30',
    unit: 'GBP per pack',
  }, ['Variable cost after automation'])
  upsertDataPoint(context, {
    label: 'Existing spare annual capacity available for supermarket contract',
    value: '18000',
    unit: 'packs',
  })
  upsertDataPoint(context, {
    label: 'Supermarket contract duration',
    value: '3',
    unit: 'years',
  })
}
