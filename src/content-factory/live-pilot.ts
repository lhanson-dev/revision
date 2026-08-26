import {
  boardAlignmentSchema,
  coverageMapSchema,
  type ContentFactoryJob,
} from './schema'
import {
  fingerprintValue,
  type CurriculumRequirementInput,
  type SourceRightsPolicyRule,
  type WorkerExecution,
} from './intake-to-knowledge-model'
import { executableAssessmentBlueprintSchema } from './assessment-and-marking'
import {
  continueContentFactoryToExpertReviewReady,
  type ContentFactoryEndToEndArtifactKind,
  type ContentFactoryEndToEndProofReport,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'
import { createRequestedJob } from './orchestrator'
import {
  createOpenAIModelAssistedWorkers,
  type OpenAIContentFactoryAdapterConfig,
} from './openai-live-adapter'
import type { ExpertReviewPackage } from './expert-review-handoff'

export const AQA_AS_BUSINESS_7131_URLS = {
  specification: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification',
  assessment: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification/specification-at-a-glance',
  subjectContent: 'https://www.aqa.org.uk/subjects/business/as-level/business-7131/specification/subject-content',
  dfeSubjectContent: 'https://www.gov.uk/government/publications/gce-as-and-a-level-for-business',
  ofqualAssessmentObjectives: 'https://www.gov.uk/government/publications/assessment-objectives-ancient-languages-geography-and-mfl/gcse-as-and-a-level-assessment-objectives',
  libreTextsBusiness: 'https://biz.libretexts.org/Courses/Cosumnes_River_College/Bus_300%3A_Business_Fundamentals_%28Brown%29',
  libreTextsTerms: 'https://libretexts.org/terms-conditions',
} as const

const permittedCurriculumSources = ['dfe-business-subject-content', 'libretexts-business-fundamentals']

const pilotRequirements: CurriculumRequirementInput[] = [
  {
    requirementId: 'business-foundations',
    summary: 'Explain why businesses exist, objectives and profit, ownership and legal forms, stakeholder interests, and how competition and the external environment affect business decisions.',
    skillsOrKnowledge: ['business purpose and objectives', 'profit and cost/revenue relationships', 'ownership and liability', 'stakeholders', 'external influences'],
    componentScope: [], revisionArea: 'Business foundations', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'leadership-and-management',
    summary: 'Compare management and leadership, leadership styles and their suitability, and how organisational context affects leadership choices.',
    skillsOrKnowledge: ['management', 'leadership', 'leadership styles', 'organisational context'],
    componentScope: [], revisionArea: 'Managers and leaders', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'decision-making-and-stakeholders',
    summary: 'Use qualitative and quantitative evidence to make and justify business decisions under risk and uncertainty, including stakeholder interests and trade-offs.',
    skillsOrKnowledge: ['decision making', 'risk and uncertainty', 'qualitative and quantitative evidence', 'stakeholders', 'opportunity cost'],
    componentScope: [], revisionArea: 'Decision making', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-research',
    summary: 'Use marketing objectives and research evidence, distinguish primary and secondary and qualitative and quantitative data, and judge the usefulness and limitations of samples and data relationships.',
    skillsOrKnowledge: ['marketing objectives', 'market research', 'data types', 'sampling', 'data interpretation'],
    componentScope: [], revisionArea: 'Marketing research', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-demand-and-positioning',
    summary: 'Analyse customer needs, segmentation, targeting, positioning and demand responsiveness, including the business implications of price and income elasticity.',
    skillsOrKnowledge: ['customer needs', 'segmentation', 'targeting', 'positioning', 'price elasticity', 'income elasticity'],
    componentScope: [], revisionArea: 'Markets and demand', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'marketing-mix-and-digital',
    summary: 'Evaluate coordinated product, price, promotion and distribution choices, product life-cycle decisions, branding and the effects of digital channels on marketing.',
    skillsOrKnowledge: ['marketing mix', 'product life cycle', 'pricing', 'promotion', 'distribution', 'branding', 'digital marketing'],
    componentScope: [], revisionArea: 'Marketing decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'operations-performance',
    summary: 'Analyse operational objectives and performance using productivity, capacity, unit-cost and efficiency evidence, and judge labour- versus capital-intensive choices.',
    skillsOrKnowledge: ['operations objectives', 'productivity', 'capacity utilisation', 'unit costs', 'efficiency', 'labour and capital intensity'],
    componentScope: [], revisionArea: 'Operations performance', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'operations-quality-and-supply',
    summary: 'Evaluate quality management, inventory and lean approaches, technology, supplier relationships, supply chains and outsourcing in operational decisions.',
    skillsOrKnowledge: ['quality', 'inventory', 'lean operations', 'technology', 'suppliers', 'supply chain', 'outsourcing'],
    componentScope: [], revisionArea: 'Operations decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'finance-profit-cash-budgeting',
    summary: 'Distinguish profit from cash, use revenue and cost information, construct and interpret budgets and cash-flow forecasts, and explain causes and consequences of cash-flow problems.',
    skillsOrKnowledge: ['revenue and costs', 'profit', 'cash flow', 'budgets', 'variance', 'cash-flow forecasting'],
    componentScope: [], revisionArea: 'Financial performance', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'finance-analysis-and-funding',
    summary: 'Use contribution, break-even and profitability evidence, evaluate internal and external finance options, and recommend actions to improve financial performance.',
    skillsOrKnowledge: ['contribution', 'break-even', 'margin of safety', 'profitability ratios', 'sources of finance', 'financial improvement'],
    componentScope: [], revisionArea: 'Financial decisions', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'people-performance-and-structure',
    summary: 'Analyse human-resource objectives and performance, organisational design and workforce choices using measures such as labour productivity and labour turnover.',
    skillsOrKnowledge: ['HR objectives', 'workforce performance', 'labour productivity', 'labour turnover', 'organisational design', 'workforce planning'],
    componentScope: [], revisionArea: 'People and organisation', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'motivation-and-employee-relations',
    summary: 'Evaluate financial and non-financial motivation, employee involvement, leadership and workplace relationships, including the effects of different approaches on performance.',
    skillsOrKnowledge: ['motivation', 'financial and non-financial incentives', 'employee involvement', 'employee relations', 'leadership'],
    componentScope: [], revisionArea: 'Motivation and relations', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
  {
    requirementId: 'quantitative-business-skills',
    summary: 'Calculate and interpret ratios, averages, percentages and changes, graphical and index information, costs, revenue, profit and break-even, and combine numerical and non-numerical evidence to support decisions.',
    skillsOrKnowledge: ['ratios', 'averages', 'percentages', 'graphs', 'index numbers', 'cost revenue profit', 'break-even', 'decision evidence'],
    componentScope: [], revisionArea: 'Quantitative skills', learnRequired: true, practiceRequired: true, examPrepRequired: true,
    sourceRefs: permittedCurriculumSources,
  },
]

const officialReferences: Record<string, string> = {
  'business-foundations': 'AQA 7131 section 3.1 — structured alignment reference only',
  'leadership-and-management': 'AQA 7131 section 3.2 — structured alignment reference only',
  'decision-making-and-stakeholders': 'AQA 7131 section 3.2 — structured alignment reference only',
  'marketing-research': 'AQA 7131 section 3.3 — structured alignment reference only',
  'marketing-demand-and-positioning': 'AQA 7131 section 3.3 — structured alignment reference only',
  'marketing-mix-and-digital': 'AQA 7131 section 3.3 — structured alignment reference only',
  'operations-performance': 'AQA 7131 section 3.4 — structured alignment reference only',
  'operations-quality-and-supply': 'AQA 7131 section 3.4 — structured alignment reference only',
  'finance-profit-cash-budgeting': 'AQA 7131 section 3.5 — structured alignment reference only',
  'finance-analysis-and-funding': 'AQA 7131 section 3.5 — structured alignment reference only',
  'people-performance-and-structure': 'AQA 7131 section 3.6 — structured alignment reference only',
  'motivation-and-employee-relations': 'AQA 7131 section 3.6 — structured alignment reference only',
  'quantitative-business-skills': 'AQA 7131 quantitative-skills annex — structured alignment reference only',
}

export const AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES: SourceRightsPolicyRule[] = [
  {
    id: 'govuk-dfe-ogl-v3', issuer: 'Department for Education', hostnames: ['www.gov.uk'], sourceTypes: ['subject_content'], useClass: 'OPEN',
    permissionBasis: 'Crown copyright publication distributed on GOV.UK under the Open Government Licence v3.0; live preflight verifies the publication and licence marker.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'], restrictions: ['Check identified third-party material separately.'],
    revalidationConditions: ['Publication or licence wording changes.'],
  },
  {
    id: 'govuk-ofqual-ogl-v3', issuer: 'Ofqual', hostnames: ['www.gov.uk'], sourceTypes: ['assessment_objectives'], useClass: 'OPEN',
    permissionBasis: 'Ofqual GOV.UK publication under the Open Government Licence v3.0; live preflight verifies the current page and licence marker.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'], restrictions: ['Check identified third-party material separately.'],
    revalidationConditions: ['Assessment-objective publication or licence wording changes.'],
  },
  {
    id: 'libretexts-business-cc-by-4', issuer: 'LibreTexts', hostnames: ['biz.libretexts.org'], sourceTypes: ['secondary_supplement'], useClass: 'OPEN',
    permissionBasis: 'Business Fundamentals (Brown) is marked CC BY 4.0 by LibreTexts; current LibreTexts terms state content may be copied consistently with the material licence. Live preflight verifies both markers before the source is admitted.',
    aiInputPermitted: true, derivedCommercialUsePermitted: true,
    attributionRequirements: ['Attribute Business Fundamentals (Brown), Cornelius Brown and Hannah Wong / LibreTexts, under CC BY 4.0, and preserve attribution for any separately noted material actually reused.'],
    restrictions: ['Do not ingest or reproduce third-party material separately marked under a different licence; this pilot passes only manually curated structured facts to the model.'],
    revalidationConditions: ['Resource licence, detailed licensing, LibreTexts terms or source composition changes.'],
  },
  {
    id: 'aqa-reference-only-alignment', issuer: 'AQA', hostnames: ['www.aqa.org.uk'], sourceTypes: ['specification', 'assessment', 'subject_content'], useClass: 'REFERENCE_ONLY',
    permissionBasis: 'Founder-approved Content Factory v2 boundary permits awarding-body material only as controlled structured Board Alignment; source prose is not supplied to generative workers.',
    aiInputPermitted: false, derivedCommercialUsePermitted: false,
    attributionRequirements: [], restrictions: ['alignment-facts-only', 'no-generative-source-text', 'no-protected-question-or-mark-scheme-ingestion'],
    revalidationConditions: ['AQA specification, terms, copyright policy or qualification cohort changes.'],
  },
]

export const AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES: NonNullable<OpenAIContentFactoryAdapterConfig['questionFamilyPolicies']> = {
  'paper1-knowledge-10': { title: 'Paper 1 knowledge and short response', componentId: 'paper-1', maxMark: 10, assessmentObjectiveIds: ['ao1'], responseShape: 'short structured responses', contextRequired: false },
  'paper1-data-30': { title: 'Paper 1 data response analysis', componentId: 'paper-1', maxMark: 30, assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'], responseShape: 'data response with calculations and analysis', contextRequired: true },
  'paper1-evaluation-40': { title: 'Paper 1 extended data response evaluation', componentId: 'paper-1', maxMark: 40, assessmentObjectiveIds: ['ao2', 'ao3', 'ao4'], responseShape: 'extended contextual analysis and evaluation', contextRequired: true },
  'paper2-application-20': { title: 'Paper 2 case application', componentId: 'paper-2', maxMark: 20, assessmentObjectiveIds: ['ao1', 'ao2'], responseShape: 'case-based application and quantitative response', contextRequired: true },
  'paper2-analysis-30': { title: 'Paper 2 case analysis', componentId: 'paper-2', maxMark: 30, assessmentObjectiveIds: ['ao2', 'ao3'], responseShape: 'case-based analytical response', contextRequired: true },
  'paper2-evaluation-30': { title: 'Paper 2 case evaluation', componentId: 'paper-2', maxMark: 30, assessmentObjectiveIds: ['ao2', 'ao3', 'ao4'], responseShape: 'case-based recommendation and evaluation', contextRequired: true },
}

export const AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES: NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']> = {
  'paper1-knowledge-10': { requirementIds: ['business-foundations', 'leadership-and-management', 'quantitative-business-skills'], maxMark: 10, format: 'mixed' },
  'paper1-data-30': { requirementIds: ['marketing-research', 'marketing-demand-and-positioning', 'marketing-mix-and-digital', 'operations-performance'], maxMark: 30, format: 'mixed' },
  'paper1-evaluation-40': { requirementIds: ['operations-quality-and-supply', 'finance-profit-cash-budgeting', 'finance-analysis-and-funding', 'people-performance-and-structure', 'motivation-and-employee-relations', 'decision-making-and-stakeholders'], maxMark: 40, format: 'case_question' },
  'paper2-application-20': { requirementIds: ['business-foundations', 'marketing-demand-and-positioning', 'finance-profit-cash-budgeting', 'quantitative-business-skills'], maxMark: 20, format: 'mixed' },
  'paper2-analysis-30': { requirementIds: ['leadership-and-management', 'decision-making-and-stakeholders', 'operations-performance', 'people-performance-and-structure'], maxMark: 30, format: 'case_question' },
  'paper2-evaluation-30': { requirementIds: ['marketing-research', 'marketing-mix-and-digital', 'operations-quality-and-supply', 'finance-analysis-and-funding', 'motivation-and-employee-relations'], maxMark: 30, format: 'case_question' },
}

function deterministicExecution(output: unknown, id: string): WorkerExecution<unknown> {
  return { status: 'success', output, provenance: { id, contextId: `deterministic-${id}`, contractVersion: '1', provider: 'revision-deterministic' } }
}

async function checkedText(fetchImpl: typeof fetch, url: string, markers: string[]) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'Revision-Content-Factory-Live-Pilot/1.0' } })
  if (!response.ok) throw new Error(`Live source preflight failed for ${url}: HTTP ${response.status}`)
  const text = (await response.text()).toLowerCase()
  for (const marker of markers) if (!text.includes(marker.toLowerCase())) throw new Error(`Live source preflight marker missing for ${url}: ${marker}`)
}

export async function preflightAqaAsBusiness7131Sources(fetchImpl: typeof fetch = fetch) {
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.dfeSubjectContent, ['gce as and a level', 'business', 'open government licence'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.ofqualAssessmentObjectives, ['assessment objectives', 'business', 'open government licence'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness, ['business fundamentals', 'cc by 4.0', 'marketing', 'accounting and finance', 'operations', 'human resources'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.libreTextsTerms, ['content can be downloaded or copied', 'licensing of the material'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.specification, ['as business', '7131', '2026'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.assessment, ['paper 1', 'paper 2', '80 marks'])
  await checkedText(fetchImpl, AQA_AS_BUSINESS_7131_URLS.subjectContent, ['what is business', 'marketing management', 'financial management'])
}

export class LivePilotArtifactStore {
  private readonly values = new Map<string, unknown>()
  private readonly refsByValue = new Map<string, string>()
  private sequence = 0

  async writeJson(input: { jobId: string; kind: ContentFactoryEndToEndArtifactKind; fingerprint: string; value: unknown }) {
    this.sequence += 1
    const ref = `pilot-artifact:${input.jobId}:${input.kind}:${this.sequence}:${input.fingerprint.slice(0, 16)}`
    const value = structuredClone(input.value)
    this.values.set(ref, value)
    this.refsByValue.set(JSON.stringify(value), ref)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Unknown live-pilot artifact reference: ${ref}`)
    return structuredClone(this.values.get(ref))
  }

  findRef(value: unknown) {
    return this.refsByValue.get(JSON.stringify(value))
  }

  exportArtifacts() {
    return [...this.values.entries()].map(([ref, value]) => ({ ref, value: structuredClone(value) }))
  }
}

async function buildBoardAlignment(jobId: string) {
  const value = {
    schemaVersion: 1 as const,
    jobId,
    fingerprint: await fingerprintValue({ jobId, profile: 'aqa-as-business-7131-2026-v1' }),
    courseIdentity: { subject: 'Business', qualification: 'AS Level', awardingBody: 'AQA', specificationId: '7131' },
    cohortValidity: { status: 'outgoing' as const, lastAssessment: '2026', notes: ['AQA states the current AS Business 7131 specification continues for cohorts taking examinations in 2026.'] },
    components: [
      { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
      { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
    ],
    assessmentObjectives: [
      { id: 'ao1', name: 'Knowledge and understanding of business terms, concepts, theories, methods and models', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao2', name: 'Application of business knowledge and understanding to contexts', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao3', name: 'Analysis of business issues and influences', sourceRefs: ['ofqual-business-assessment-objectives'] },
      { id: 'ao4', name: 'Evaluation of quantitative and qualitative information to make informed judgements and propose evidence-based solutions', sourceRefs: ['ofqual-business-assessment-objectives'] },
    ],
    assessmentRequirements: [
      { id: 'paper1-structure', summary: 'Paper 1 assesses all course content through three compulsory sections combining multiple-choice, short-answer and data-response work.', componentScope: ['paper-1'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'paper2-structure', summary: 'Paper 2 assesses all course content through one compulsory case-study paper with several questions.', componentScope: ['paper-2'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'both-papers-required', summary: 'Both Paper 1 and Paper 2 are compulsory and each contributes half of the AS qualification.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['aqa-7131-assessment'] },
      { id: 'quantitative-minimum', summary: 'Quantitative skills must be assessed across the AS qualification and form at least 10% of overall marks.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['dfe-business-subject-content'] },
    ],
    sourceRefs: ['aqa-7131-specification', 'aqa-7131-assessment', 'ofqual-business-assessment-objectives', 'dfe-business-subject-content'],
    verificationStatus: 'verified' as const,
  }
  return boardAlignmentSchema.parse(value)
}

async function buildAssessmentBlueprint(jobId: string, boardAlignmentFingerprint: string) {
  return executableAssessmentBlueprintSchema.parse({
    schemaVersion: 1,
    jobId,
    fingerprint: await fingerprintValue({ jobId, boardAlignmentFingerprint, profile: 'aqa-as-business-assessment-v1' }),
    boardAlignmentFingerprint,
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['paper1-knowledge-10', 'paper1-data-30', 'paper1-evaluation-40'], markTotal: 80, timingMinutes: 90, constraints: ['10 + 30 + 40 marks = 80', 'combine short response and data-response demands'] },
      { componentId: 'paper-2', questionFamilyIds: ['paper2-application-20', 'paper2-analysis-30', 'paper2-evaluation-30'], markTotal: 80, timingMinutes: 90, constraints: ['20 + 30 + 30 marks = 80', 'use original Revision-owned case contexts without copying awarding-body material'] },
    ],
    quantitativeRequirements: ['Include quantitative interpretation and calculation demand in the learning/practice package and generated assessment set.'],
    synopticRequirements: ['Assess connections between functional areas and require contextual business judgement.'],
    commandDemands: [
      { command: 'calculate', cognitiveDemand: 'apply structured quantitative methods accurately', componentScope: ['paper-1', 'paper-2'] },
      { command: 'analyse', cognitiveDemand: 'develop connected contextual chains of reasoning', componentScope: ['paper-1', 'paper-2'] },
      { command: 'evaluate', cognitiveDemand: 'weigh evidence and reach a supported contextual judgement', componentScope: ['paper-1', 'paper-2'] },
    ],
    evidenceExpectations: ['Questions and Marking Packs must remain Revision-owned and non-exhaustive.', 'All thirteen non-deferred curriculum requirements must appear in the generated assessment set.'],
  })
}

export function createAqaAsBusiness7131LivePilotWorkers(input: {
  openAI: Omit<OpenAIContentFactoryAdapterConfig, 'resolveArtifactRef' | 'questionFamilyPolicies' | 'assessmentItemPolicies'>
  artifactStore: LivePilotArtifactStore
  fetchImpl?: typeof fetch
}): ContentFactoryEndToEndWorkers {
  const fetchImpl = input.fetchImpl ?? fetch
  const ai = createOpenAIModelAssistedWorkers({
    ...input.openAI,
    resolveArtifactRef: (value) => input.artifactStore.findRef(value),
    questionFamilyPolicies: AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES,
    assessmentItemPolicies: AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  })

  return {
    ...ai,
    async resolveIdentity({ jobId }) {
      return deterministicExecution({
        courseIdentity: { subject: 'Business', qualification: 'AS Level', awardingBody: 'AQA', specificationId: '7131' },
        cohortValidity: { status: 'outgoing', lastAssessment: '2026', notes: ['Outgoing specification retained for 2026 examination cohort.'] },
        components: [
          { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
          { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
        ],
        unresolvedChoices: [],
      }, `pilot-identity-${jobId}`)
    },
    async discoverSources({ jobId }) {
      try {
        await preflightAqaAsBusiness7131Sources(fetchImpl)
      } catch (error) {
        return {
          status: 'infrastructure_failure',
          error: error instanceof Error ? error.message : 'live source preflight failed',
          provenance: { id: `pilot-source-${jobId}`, contextId: `deterministic-pilot-source-${jobId}`, contractVersion: '1', provider: 'revision-live-source-preflight' },
        }
      }
      return deterministicExecution([
        { id: 'dfe-business-subject-content', url: AQA_AS_BUSINESS_7131_URLS.dfeSubjectContent, title: 'GCE AS and A level subject content for business', issuer: 'Department for Education', sourceType: 'subject_content', educationalRole: ['permitted common AS Business curriculum truth', 'quantitative skills'], versionOrDate: 'DFE-00358-2014' },
        { id: 'ofqual-business-assessment-objectives', url: AQA_AS_BUSINESS_7131_URLS.ofqualAssessmentObjectives, title: 'GCSE, AS and A level assessment objectives — Business', issuer: 'Ofqual', sourceType: 'assessment_objectives', educationalRole: ['permitted assessment-objective truth'] },
        { id: 'libretexts-business-fundamentals', url: AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness, title: 'Bus 300: Business Fundamentals (Brown)', issuer: 'LibreTexts', sourceType: 'secondary_supplement', educationalRole: ['permitted reusable business subject explanation and cross-checking'], versionOrDate: 'current CC BY 4.0 resource; preflight checked at run time' },
        { id: 'aqa-7131-specification', url: AQA_AS_BUSINESS_7131_URLS.specification, title: 'AQA AS Business 7131 specification', issuer: 'AQA', sourceType: 'specification', educationalRole: ['course identity', 'cohort alignment'] },
        { id: 'aqa-7131-assessment', url: AQA_AS_BUSINESS_7131_URLS.assessment, title: 'AQA AS Business 7131 specification at a glance', issuer: 'AQA', sourceType: 'assessment', educationalRole: ['component and assessment-format alignment'] },
        { id: 'aqa-7131-subject-content', url: AQA_AS_BUSINESS_7131_URLS.subjectContent, title: 'AQA AS Business 7131 subject content', issuer: 'AQA', sourceType: 'subject_content', educationalRole: ['structured section-level curriculum alignment only'] },
      ], `pilot-source-${jobId}`)
    },
    async resolveStructuredEvidence({ jobId }) {
      return deterministicExecution({
        boardAlignmentFacts: [
          { id: 'identity-7131', sourceRef: 'aqa-7131-specification', category: 'course_identity', value: 'AQA AS Business 7131', verificationStatus: 'verified' },
          { id: 'cohort-2026', sourceRef: 'aqa-7131-specification', category: 'cohort', value: 'Outgoing specification continues for cohorts taking examinations in 2026.', verificationStatus: 'verified' },
          { id: 'paper1-fact', sourceRef: 'aqa-7131-assessment', category: 'component', value: 'Paper 1: 90 minutes, 80 marks, 50% of AS, all course content.', verificationStatus: 'verified' },
          { id: 'paper2-fact', sourceRef: 'aqa-7131-assessment', category: 'component', value: 'Paper 2: 90 minutes, 80 marks, 50% of AS, all course content.', verificationStatus: 'verified' },
          { id: 'ao-source', sourceRef: 'ofqual-business-assessment-objectives', category: 'assessment_objective', value: 'AS Business uses AO1 knowledge, AO2 application, AO3 analysis and AO4 evaluation.', verificationStatus: 'verified' },
          { id: 'quantitative-source', sourceRef: 'dfe-business-subject-content', category: 'quantitative_requirement', value: 'Quantitative skills form at least 10% of overall AS marks.', verificationStatus: 'verified' },
        ],
        curriculumRequirements: pilotRequirements,
      }, `pilot-evidence-${jobId}`)
    },
    async compileBoardAlignment({ jobId }) {
      return deterministicExecution(await buildBoardAlignment(jobId), `pilot-board-alignment-${jobId}`)
    },
    async compileCoverage({ jobId, sourceLicenceRegister, requirements }) {
      const coverage = coverageMapSchema.parse({
        schemaVersion: 1,
        jobId,
        sourceSetFingerprint: sourceLicenceRegister.fingerprint,
        requirements: requirements.map((requirement) => ({
          requirementId: requirement.requirementId,
          officialReference: officialReferences[requirement.requirementId] ?? 'AQA 7131 structured alignment reference only',
          requirementSummary: requirement.summary,
          skillsOrKnowledge: requirement.skillsOrKnowledge,
          componentScope: requirement.componentScope,
          revisionArea: requirement.revisionArea,
          learnRequired: requirement.learnRequired,
          practiceRequired: requirement.practiceRequired,
          examPrepRequired: requirement.examPrepRequired,
          coverageStatus: 'planned',
          contentRefs: [],
          sourceRefs: requirement.sourceRefs,
        })),
      })
      return deterministicExecution(coverage, `pilot-coverage-${jobId}`)
    },
    async compileAssessmentBlueprint({ jobId, components }) {
      if (components.length !== 2 || !components.some((component) => component.id === 'paper-1') || !components.some((component) => component.id === 'paper-2')) {
        return {
          status: 'failure',
          error: 'AQA AS Business live pilot expected exact Paper 1 and Paper 2 component structure',
          provenance: { id: `pilot-assessment-blueprint-${jobId}`, contextId: `deterministic-pilot-assessment-blueprint-${jobId}`, contractVersion: '1', provider: 'revision-deterministic' },
        }
      }
      const boardAlignmentFingerprint = await fingerprintValue({ jobId, profile: 'aqa-as-business-7131-2026-v1' })
      return deterministicExecution(await buildAssessmentBlueprint(jobId, boardAlignmentFingerprint), `pilot-assessment-blueprint-${jobId}`)
    },
  }
}

export async function runAqaAsBusiness7131LivePilot(input: {
  jobId: string
  contentHeadSha: string
  now: string
  openAI: Omit<OpenAIContentFactoryAdapterConfig, 'resolveArtifactRef' | 'questionFamilyPolicies' | 'assessmentItemPolicies'>
  artifactStore?: LivePilotArtifactStore
  fetchImpl?: typeof fetch
}): Promise<{ job: ContentFactoryJob; report: ContentFactoryEndToEndProofReport; package?: ExpertReviewPackage; artifactStore: LivePilotArtifactStore }> {
  const artifactStore = input.artifactStore ?? new LivePilotArtifactStore()
  const job = createRequestedJob({
    jobId: input.jobId,
    officialUrls: [AQA_AS_BUSINESS_7131_URLS.specification],
    founderInstruction: 'Run the governed rights-safe live adapter pilot for AQA AS Business 7131, 2026 examination cohort, through expert_review_ready without publishing learner content.',
    createdAt: input.now,
    schemaVersion: 2,
  })
  const result = await continueContentFactoryToExpertReviewReady({
    job,
    workers: createAqaAsBusiness7131LivePilotWorkers({ openAI: input.openAI, artifactStore, fetchImpl: input.fetchImpl }),
    artifactStore,
    sourceRightsRules: AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
    versionPersister: { async persist() { throw new Error('Live pilot does not fabricate remediation commits; a material independent-review finding must reopen governed repository remediation.') } },
    contentHeadSha: input.contentHeadSha,
    now: input.now,
    proofMode: 'live_adapter',
    maxRemediationCycles: 0,
    limitations: [
      'Live pilot is an internal Content Factory proof and does not publish learner content.',
      'AQA sources remain REFERENCE_ONLY; generative workers receive only controlled structured alignment facts, never AQA source prose.',
      'The secondary CC BY source is admitted only after live licence/terms preflight and only manually curated structured facts are passed downstream.',
    ],
  })
  return { ...result, artifactStore }
}
