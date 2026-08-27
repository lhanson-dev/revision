import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS,
} from './live-pilot'

const paper2FamilyId = 'paper2-case-study-80'

export function applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy() {
  const policy = AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES[paper2FamilyId]
  if (!policy) throw new Error('AQA AS Business pilot is missing the governed Paper 2 assessment policy')
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES[paper2FamilyId] = {
    ...policy,
    // Pilot #9 showed that this requirement was redundantly tagged on Paper 2
    // without substantive question evidence. It is already assessed on Paper 1.
    // The structured assessment contract now requires every remaining tag to be
    // evidenced by an actual subquestion.
    requirementIds: policy.requirementIds.filter((id) => id !== 'marketing-demand-and-positioning'),
  }

  const context = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS[paper2FamilyId]
  if (!context) throw new Error('AQA AS Business pilot is missing the Revision-owned RefillWorks Paper 2 context')
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS[paper2FamilyId] = {
    ...context,
    body: `${context.body} The supermarket contract has a selling price of GBP 3.40 per pack. The stated GBP 1.70 outsourcing figure is the total variable cost per outsourced supermarket pack.`,
    dataPoints: context.dataPoints.map((point) => {
      if (point.label === 'Current selling price') {
        return { ...point, label: 'Supermarket-contract selling price' }
      }
      if (point.label === 'Outsourcing cost for additional packs') {
        return { ...point, label: 'Total variable cost per outsourced supermarket pack' }
      }
      return point
    }),
  }
}
