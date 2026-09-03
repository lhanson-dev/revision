import type { FoundationCurriculumRequirementInput } from '../foundation-compilation'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID = 'revision-aqa-7132-2027-course-truth-seed'

export const AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED = {
  schemaVersion: 1 as const,
  seedId: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
  status: 'governed_main_only' as const,
  purpose: 'Revision-owned structured curriculum seed for the Slice 2B AQA A-level Business 7132 / 2027 Foundation proof. It is a compilation input, not an approved Course Foundation.',
  upstreamEvidence: [
    {
      sourceRef: 'dfe-business-subject-content',
      role: 'OPEN common GCE AS/A-level Business subject-content scope under the Open Government Licence, subject to live revalidation.',
    },
    {
      sourceRef: 'libretexts-business-fundamentals',
      role: 'OPEN CC BY 4.0 secondary business-knowledge cross-checking source, subject to live licence/terms revalidation.',
    },
  ],
  limitations: [
    'This seed is intentionally bounded for the first Foundation live-runtime proof and is not a claim of qualified-human curriculum completeness.',
    'AQA REFERENCE_ONLY material is not an upstream curriculum-truth source for this seed; AQA contributes only controlled Board Alignment facts elsewhere in the live profile.',
    'Slice 3 assurance must determine whether the seed and resulting Course Truth are sufficiently complete and precise for an Approved Course Foundation.',
  ],
  requirements: [
    requirement('business-purpose-forms-environment', 'Business purpose, forms and external environment', ['business objectives', 'profit and cash flow', 'ownership forms', 'shareholders and stakeholders', 'external influences']),
    requirement('leadership-management-decisions', 'Management, leadership and decision making', ['management and leadership', 'leadership styles', 'decision making', 'risk and uncertainty', 'stakeholder trade-offs']),
    requirement('marketing-analysis', 'Marketing objectives, research, markets and demand', ['marketing objectives', 'market research', 'segmentation and targeting', 'positioning', 'price elasticity', 'income elasticity']),
    requirement('marketing-decisions', 'Marketing mix and competitive marketing decisions', ['product decisions', 'pricing', 'promotion', 'distribution', 'branding', 'digital marketing']),
    requirement('operations-decisions', 'Operational objectives, performance, quality and supply', ['productivity', 'capacity utilisation', 'unit costs', 'quality', 'inventory', 'lean operations', 'supply chains', 'technology']),
    requirement('financial-performance', 'Financial objectives, profit, cash flow and budgets', ['revenue costs and profit', 'cash flow', 'budgets', 'variance analysis', 'cash-flow forecasting']),
    requirement('financial-decisions', 'Financial analysis, investment and funding decisions', ['contribution', 'break-even', 'profitability ratios', 'investment appraisal', 'sources of finance', 'financial decision making']),
    requirement('human-resources', 'Human-resource objectives, organisation, motivation and employee relations', ['workforce performance', 'organisational design', 'motivation', 'employee involvement', 'employee relations', 'labour productivity', 'labour turnover']),
    requirement('strategic-position', 'Analysing the strategic position of a business', ['mission and objectives', 'financial ratio analysis', 'SWOT', 'external environment', 'competitive position', 'investment appraisal', 'decision trees']),
    requirement('strategic-direction', 'Choosing strategic direction', ['strategic objectives', 'markets and products', 'competitive positioning', 'strategic choices and trade-offs']),
    requirement('strategic-methods', 'Strategic methods for pursuing strategy', ['organic growth', 'mergers and takeovers', 'internationalisation', 'innovation', 'digital technology', 'strategic alliances']),
    requirement('strategic-change', 'Managing strategic change', ['organisational culture', 'change management', 'leadership of change', 'barriers to change', 'implementation risk']),
    requirement('quantitative-skills', 'Quantitative skills in business', ['ratios and averages', 'percentages and percentage change', 'index numbers', 'cost revenue profit and break-even', 'investment appraisal', 'elasticity', 'graphical and numerical interpretation']),
    requirement('synoptic-business-judgement', 'Synoptic business judgement', ['interrelationships between business functions', 'contextual analysis', 'quantitative and qualitative evidence', 'evaluation', 'evidence-based judgement']),
  ] satisfies FoundationCurriculumRequirementInput[],
}

function requirement(requirementId: string, revisionArea: string, skillsOrKnowledge: string[]): FoundationCurriculumRequirementInput {
  return {
    requirementId,
    officialReference: `Revision governed Course Truth seed requirement: ${requirementId}`,
    requirementSummary: revisionArea,
    skillsOrKnowledge,
    componentScope: ['paper-1', 'paper-2', 'paper-3'],
    revisionArea,
    sourceRefs: [AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID],
  }
}
