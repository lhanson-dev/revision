/** #698: source-reviewed extension, NOT a rewrite of the historical 344-item list.
 * Founder-supplied AQA Business 7132 v2.0 (14 June 2023), printed page 15:
 * §3.3.1 names "market and sales growth" separately and §3.3.2 requires
 * students to calculate both. Exact PDF SHA256 matches Issue #698's baseline.
 * Only an individual company's sales change is attributable to this target.
 * No independent expert sign-off or whole-course completeness is asserted.
 */
export const salesGrowthSourceRequirement = {
  id: 'aqa-7132-3.3.2:sales-growth',
  sourceAtomId: 'BUS7132-ATOM-3.3.2-006',
  sourceSection: '3.3.2',
  linkedObjectivesSection: '3.3.1',
  printedPage: 15,
  sourceSha256: '3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332',
  status: 'source-reviewed-educational-adequacy-unverified',
  topicId: 'marketing',
  learnNodeId: 'bus-mkt-002',
  capability: 'Calculate the signed percentage change in one company’s sales between comparable periods, using the earlier sales value as the denominator; do not substitute whole-market growth.',
  assessmentLimit: 'One independently marked final number only; method, comparison, analysis, evaluation and mastery remain unverified.',
} as const
