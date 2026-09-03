import { z } from 'zod'
import {
  boardAlignmentSchema,
  courseKnowledgeNodeSchema,
  questionFamilySchema,
  type BoardAlignment,
  type CourseKnowledgeModel,
} from './schema'
import {
  foundationAssessmentBlueprintSchema,
  foundationCompilationWorkerContracts,
  foundationCoverageModelSchema,
  foundationDiscoveredSourceSchema,
  foundationIdentityResolutionSchema,
  foundationStructuredEvidenceSchema,
  type FoundationCompilationWorkers,
  type FoundationCurriculumRequirementInput,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
} from './openai-live-adapter'

export const AQA_A_LEVEL_BUSINESS_7132_URLS = {
  specification: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification',
  assessment: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance',
  scheme: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/scheme-of-assessment',
  subjectContent: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content',
  quantitativeSkills: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/annex-quantitative-skills-in-business',
  keyDates: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/key-dates',
  dfeSubjectContent: 'https://www.gov.uk/government/publications/gce-as-and-a-level-for-business',
  ofqualAssessmentObjectives: 'https://www.gov.uk/government/publications/assessment-objectives-ancient-languages-geography-and-mfl/gcse-as-and-a-level-assessment-objectives',
  libreTextsBusiness: 'https://biz.libretexts.org/Courses/Cosumnes_River_College/Bus_300%3A_Business_Fundamentals_%28Brown%29',
  libreTextsTerms: 'https://libretexts.org/terms-conditions',
} as const

const allComponents = ['paper-1', 'paper-2', 'paper-3']
const allAos = ['ao1', 'ao2', 'ao3', 'ao4']
const permittedCurriculumSources = ['dfe-business-subject-content', 'libretexts-business-fundamentals']

const curriculumRequirements: FoundationCurriculumRequirementInput[] = [
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
]

function requirement(requirementId: string, revisionArea: string, skillsOrKnowledge: string[]): FoundationCurriculumRequirementInput {
  return {
    requirementId,
    officialReference: 'DfE GCE AS and A level subject content for business — governed common A-level Business requirement',
    requirementSummary: revisionArea,
    skillsOrKnowledge,
    componentScope: allComponents,
    revisionArea,
    sourceRefs: permittedCurriculumSources,
  }
}

const boardAlignment: Omit<BoardAlignment, 'fingerprint' | 'jobId'> = {
  schemaVersion: 1,
  courseIdentity: { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' },
  cohortValidity: {
    status: 'outgoing',
    lastAssessment: '2027',
    notes: ['AQA identifies specification 7132 as outgoing and states it remains in use for cohorts taking examinations in 2027.'],
  },
  components: [
    { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 100, durationMinutes: 120, weightingPercent: 33.3 },
    { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 100, durationMinutes: 120, weightingPercent: 33.3 },
    { id: 'paper-3', name: 'Business 3', compulsory: true, marks: 100, durationMinutes: 120, weightingPercent: 33.3 },
  ],
  assessmentObjectives: [
    { id: 'ao1', name: 'Knowledge and understanding of business terms, concepts, theories, methods and models', sourceRefs: ['ofqual-business-assessment-objectives'] },
    { id: 'ao2', name: 'Application of business knowledge and understanding to business contexts', sourceRefs: ['ofqual-business-assessment-objectives'] },
    { id: 'ao3', name: 'Analysis of business issues and influences', sourceRefs: ['ofqual-business-assessment-objectives'] },
    { id: 'ao4', name: 'Evaluation of quantitative and qualitative information to make informed judgements and propose evidence-based solutions', sourceRefs: ['ofqual-business-assessment-objectives'] },
  ],
  assessmentRequirements: [
    { id: 'paper1-structure', summary: 'Paper 1 is a compulsory two-hour, 100-mark paper with 15 one-mark MCQs, short-answer questions worth 35 marks and two 25-mark essay responses selected from choices.', componentScope: ['paper-1'], sourceRefs: ['aqa-7132-assessment'] },
    { id: 'paper2-structure', summary: 'Paper 2 is a compulsory two-hour, 100-mark paper containing three compulsory data-response questions worth approximately 33 marks each.', componentScope: ['paper-2'], sourceRefs: ['aqa-7132-assessment'] },
    { id: 'paper3-structure', summary: 'Paper 3 is a compulsory two-hour, 100-mark paper containing one compulsory case study followed by approximately six questions.', componentScope: ['paper-3'], sourceRefs: ['aqa-7132-assessment'] },
    { id: 'all-content-all-papers', summary: 'All three papers may assess content from across the full A-level Business course.', componentScope: allComponents, sourceRefs: ['aqa-7132-assessment'] },
    { id: 'quantitative-minimum', summary: 'Quantitative skills are assessed at a minimum of 10% of the overall A-level marks.', componentScope: allComponents, sourceRefs: ['dfe-business-subject-content'] },
  ],
  sourceRefs: ['aqa-7132-specification', 'aqa-7132-assessment', 'aqa-7132-scheme', 'dfe-business-subject-content', 'ofqual-business-assessment-objectives'],
  verificationStatus: 'verified',
}

const structuredEvidence = foundationStructuredEvidenceSchema.parse({
  boardAlignmentFacts: [
    { id: 'identity-7132', sourceRef: 'aqa-7132-specification', category: 'course_identity', value: 'AQA A-level Business 7132', verificationStatus: 'verified' },
    { id: 'cohort-2027', sourceRef: 'aqa-7132-specification', category: 'cohort', value: 'Outgoing specification remains in use for cohorts taking examinations in 2027.', verificationStatus: 'verified' },
    { id: 'paper1', sourceRef: 'aqa-7132-assessment', category: 'component', value: 'Paper 1: 2 hours, 100 marks, 33.3%.', verificationStatus: 'verified' },
    { id: 'paper2', sourceRef: 'aqa-7132-assessment', category: 'component', value: 'Paper 2: 2 hours, 100 marks, 33.3%.', verificationStatus: 'verified' },
    { id: 'paper3', sourceRef: 'aqa-7132-assessment', category: 'component', value: 'Paper 3: 2 hours, 100 marks, 33.3%.', verificationStatus: 'verified' },
    { id: 'ao-set', sourceRef: 'ofqual-business-assessment-objectives', category: 'assessment_objective', value: ['AO1', 'AO2', 'AO3', 'AO4'], verificationStatus: 'verified' },
    { id: 'assessment-shape', sourceRef: 'aqa-7132-assessment', category: 'assessment_requirement', value: 'Paper 1 uses MCQ/short-answer/essay demand; Paper 2 uses compulsory data response; Paper 3 uses a compulsory case study.', verificationStatus: 'verified' },
    { id: 'quantitative-floor', sourceRef: 'dfe-business-subject-content', category: 'quantitative_requirement', value: 'At least 10% of overall A-level marks assess quantitative skills.', verificationStatus: 'verified' },
  ],
  curriculumRequirements,
})

const sourceList = z.array(foundationDiscoveredSourceSchema).parse([
  { id: 'dfe-business-subject-content', url: AQA_A_LEVEL_BUSINESS_7132_URLS.dfeSubjectContent, title: 'GCE AS and A level subject content for business', issuer: 'Department for Education', sourceType: 'subject_content', educationalRole: ['permitted common A-level Business curriculum truth', 'quantitative skills'], versionOrDate: 'current publication; runtime preflight required' },
  { id: 'ofqual-business-assessment-objectives', url: AQA_A_LEVEL_BUSINESS_7132_URLS.ofqualAssessmentObjectives, title: 'GCSE, AS and A level assessment objectives — Business', issuer: 'Ofqual', sourceType: 'assessment_objectives', educationalRole: ['permitted assessment-objective truth'], versionOrDate: 'current publication; runtime preflight required' },
  { id: 'libretexts-business-fundamentals', url: AQA_A_LEVEL_BUSINESS_7132_URLS.libreTextsBusiness, title: 'Business Fundamentals (Brown)', issuer: 'LibreTexts', sourceType: 'secondary_supplement', educationalRole: ['permitted business subject explanation and cross-checking'], versionOrDate: 'current CC BY 4.0 resource; runtime preflight required' },
  { id: 'aqa-7132-specification', url: AQA_A_LEVEL_BUSINESS_7132_URLS.specification, title: 'AQA A-level Business 7132 specification', issuer: 'AQA', sourceType: 'specification', educationalRole: ['course identity', 'cohort alignment'] },
  { id: 'aqa-7132-assessment', url: AQA_A_LEVEL_BUSINESS_7132_URLS.assessment, title: 'AQA A-level Business 7132 specification at a glance', issuer: 'AQA', sourceType: 'assessment', educationalRole: ['component and assessment-format alignment'] },
  { id: 'aqa-7132-scheme', url: AQA_A_LEVEL_BUSINESS_7132_URLS.scheme, title: 'AQA A-level Business 7132 scheme of assessment', issuer: 'AQA', sourceType: 'assessment', educationalRole: ['assessment-objective and assessment-rule alignment'] },
  { id: 'aqa-7132-subject-content', url: AQA_A_LEVEL_BUSINESS_7132_URLS.subjectContent, title: 'AQA A-level Business 7132 subject content', issuer: 'AQA', sourceType: 'subject_content', educationalRole: ['structured section-level alignment only'] },
])

const courseTruthEnrichmentSchema = z.object({
  nodes: z.array(courseKnowledgeNodeSchema.omit({ sourceRefs: true, boardAlignmentRefs: true })).min(1),
})

const examTruthEnrichmentSchema = z.object({
  commandDemands: foundationAssessmentBlueprintSchema.shape.commandDemands,
  evidenceExpectations: foundationAssessmentBlueprintSchema.shape.evidenceExpectations,
  quantitativeRequirements: foundationAssessmentBlueprintSchema.shape.quantitativeRequirements,
  synopticRequirements: foundationAssessmentBlueprintSchema.shape.synopticRequirements,
})

export interface FoundationStructuredProviderClient {
  run(input: {
    workerId: string
    contractVersion: string
    routeKind: 'generation' | 'independent_review'
    outputSchema: z.ZodType
    instructions: string
    payload: unknown
    strictOutput?: boolean
  }): Promise<FoundationWorkerExecution<unknown>>
  budgetSnapshot?(): { maxSpendUsd?: number; conservativeConsumedUsd: number }
}

function deterministicSuccess(output: unknown, id: string, provider: string): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: { id, contextId: `${provider}:${id}`, contractVersion: '1', provider },
  }
}

async function checkedText(fetchImpl: typeof fetch, url: string, markers: string[]) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'Revision-Foundation-Live-Proof/1.0' } })
  if (!response.ok) throw new Error(`foundation_source_preflight_http_${response.status}:${url}`)
  const text = (await response.text()).toLowerCase()
  for (const marker of markers) {
    if (!text.includes(marker.toLowerCase())) throw new Error(`foundation_source_preflight_marker_missing:${marker}:${url}`)
  }
}

export async function preflightAqaAlevelBusiness7132Sources(fetchImpl: typeof fetch = fetch) {
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.dfeSubjectContent, ['business', 'open government licence'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.ofqualAssessmentObjectives, ['assessment objectives', 'business', 'open government licence'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.libreTextsBusiness, ['business fundamentals', 'cc by 4.0'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.libreTextsTerms, ['content can be downloaded or copied', 'licensing of the material'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.specification, ['a-level business', '7132', 'outgoing', '2027'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.assessment, ['paper 1', '100 marks', 'paper 2', 'paper 3'])
  await checkedText(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_URLS.scheme, ['assessment objectives', 'ao1', 'ao4'])
}

function failure(stage: string, error: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'infrastructure_failure',
    error: error instanceof Error ? error.message : String(error),
    provenance: { id: `${stage}-failed`, contextId: `revision-live-source:${stage}`, contractVersion: '1', provider: 'revision-live-source-preflight' },
  }
}

function exactNodeSet(nodes: Array<{ id: string }>, expectedIds: string[]) {
  const actual = new Set(nodes.map((node) => node.id))
  return actual.size === expectedIds.length && expectedIds.every((id) => actual.has(id))
}

export function createAqaAlevelBusiness7132FoundationLiveWorkers(input: {
  provider: FoundationStructuredProviderClient
  fetchImpl?: typeof fetch
}): FoundationCompilationWorkers {
  const fetchImpl = input.fetchImpl ?? fetch
  return {
    async resolveIdentity({ jobId }) {
      return deterministicSuccess(foundationIdentityResolutionSchema.parse({
        courseIdentity: boardAlignment.courseIdentity,
        cohortValidity: boardAlignment.cohortValidity,
        components: boardAlignment.components,
        unresolvedChoices: [],
      }), `foundation-identity-${jobId}`, 'revision-governed-course-profile')
    },
    async discoverSources({ jobId }) {
      try {
        await preflightAqaAlevelBusiness7132Sources(fetchImpl)
        return deterministicSuccess(sourceList, `foundation-sources-${jobId}`, 'revision-live-source-preflight')
      } catch (error) {
        return failure('source-discovery', error)
      }
    },
    async resolveStructuredEvidence({ jobId }) {
      return deterministicSuccess(structuredEvidence, `foundation-evidence-${jobId}`, 'revision-controlled-evidence-profile')
    },
    async compileBoardAlignment({ jobId }) {
      return deterministicSuccess(boardAlignmentSchema.parse({ ...boardAlignment, jobId, fingerprint: 'compiler-replaces-this-fingerprint' }), `foundation-board-${jobId}`, 'revision-controlled-evidence-profile')
    },
    async compileCoverage({ jobId, sourceLicenceRegister, requirements }) {
      return deterministicSuccess(foundationCoverageModelSchema.parse({
        schemaVersion: 1,
        jobId,
        sourceSetFingerprint: sourceLicenceRegister.fingerprint,
        requirements: requirements.map((governed) => ({ ...governed, knowledgeNodeIds: [governed.requirementId], coverageStatus: 'complete' })),
      }), `foundation-coverage-${jobId}`, 'revision-foundation-coverage-compiler')
    },
    async compileCourseTruth({ jobId, requirements }) {
      const execution = await input.provider.run({
        workerId: foundationCompilationWorkerContracts.courseTruth.workerId,
        contractVersion: foundationCompilationWorkerContracts.courseTruth.contractVersion,
        routeKind: 'generation',
        outputSchema: courseTruthEnrichmentSchema,
        strictOutput: true,
        instructions: [
          'Create one canonical Course Truth node for every governed requirement and no extra nodes.',
          'Preserve every supplied requirementId exactly as the node id.',
          'Do not invent source or Board Alignment references; those are attached deterministically after your semantic output.',
          'Use prerequisiteIds and relatedIds only from the supplied requirement IDs. Use [] when a relationship is not clearly justified.',
          'Summaries must be independent Revision-authored subject truth, not reconstructed awarding-body wording.',
          'Include useful misconceptions, formulas where relevant, application contexts and evidenceTypes sufficient to support later Learn/Practice/Exam Prep factories.',
        ].join('\n'),
        payload: {
          courseIdentity: boardAlignment.courseIdentity,
          requirements: requirements.map(({ requirementId, requirementSummary, skillsOrKnowledge, revisionArea }) => ({ requirementId, requirementSummary, skillsOrKnowledge, revisionArea })),
          allowedNodeIds: requirements.map((item) => item.requirementId),
        },
      })
      if (execution.status !== 'success') return execution
      const enrichment = courseTruthEnrichmentSchema.parse(execution.output)
      const expectedIds = requirements.map((item) => item.requirementId)
      if (!exactNodeSet(enrichment.nodes, expectedIds)) {
        return { ...execution, status: 'failure', error: 'provider_contract_failure: Course Truth provider must return exactly the governed requirement IDs' }
      }
      const requirementsById = new Map(requirements.map((item) => [item.requirementId, item]))
      const nodes = enrichment.nodes.map((node) => {
        const governed = requirementsById.get(node.id)!
        return {
          ...node,
          sourceRefs: governed.sourceRefs,
          boardAlignmentRefs: [...new Set([...governed.componentScope, ...allAos])],
        }
      })
      const model: CourseKnowledgeModel = { schemaVersion: 1, jobId, fingerprint: 'compiler-replaces-this-fingerprint', nodes }
      return { ...execution, output: model }
    },
    async compileExamTruth({ jobId, boardAlignment: alignment, boardAlignmentFingerprint, courseKnowledgeModel, courseKnowledgeModelFingerprint }) {
      const execution = await input.provider.run({
        workerId: foundationCompilationWorkerContracts.examTruth.workerId,
        contractVersion: foundationCompilationWorkerContracts.examTruth.contractVersion,
        routeKind: 'generation',
        outputSchema: examTruthEnrichmentSchema,
        strictOutput: true,
        instructions: [
          'Derive only Revision-authored Exam Truth guidance from the supplied structured Board Alignment and Course Truth.',
          'Do not alter component structure, marks, timing, assessment objectives or assessment requirements.',
          'Return command demands, evidence expectations, quantitative requirements and synoptic requirements only.',
          'All componentScope values must use only paper-1, paper-2 or paper-3.',
        ].join('\n'),
        payload: { boardAlignment: alignment, courseTruthNodes: courseKnowledgeModel.nodes.map(({ id, kind, summary, evidenceTypes }) => ({ id, kind, summary, evidenceTypes })) },
      })
      if (execution.status !== 'success') return execution
      const enrichment = examTruthEnrichmentSchema.parse(execution.output)
      return {
        ...execution,
        output: foundationAssessmentBlueprintSchema.parse({
          schemaVersion: 1,
          jobId,
          boardAlignmentFingerprint,
          courseKnowledgeModelFingerprint,
          assessmentObjectives: alignment.assessmentObjectives.map(({ id, weightingPercent }) => ({ id, weightingPercent })),
          assessmentRequirements: alignment.assessmentRequirements.map(({ id, summary, componentScope }) => ({ id, summary, componentScope })),
          components: [
            { componentId: 'paper-1', questionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-essay'], markTotal: 100, timingMinutes: 120, constraints: ['15 one-mark MCQs', '35 marks of short-answer questions', 'two 25-mark essay responses selected from choices'] },
            { componentId: 'paper-2', questionFamilyIds: ['paper2-data-response'], markTotal: 100, timingMinutes: 120, constraints: ['three compulsory data-response questions worth approximately 33 marks each'] },
            { componentId: 'paper-3', questionFamilyIds: ['paper3-case-study'], markTotal: 100, timingMinutes: 120, constraints: ['one compulsory case study followed by approximately six questions'] },
          ],
          ...enrichment,
        }),
      }
    },
    async compileQuestionFamilies({ assessmentBlueprint, requestedFamilyIds, courseKnowledgeModel }) {
      return input.provider.run({
        workerId: foundationCompilationWorkerContracts.questionFamilies.workerId,
        contractVersion: foundationCompilationWorkerContracts.questionFamilies.contractVersion,
        routeKind: 'generation',
        outputSchema: z.array(questionFamilySchema).min(1),
        strictOutput: true,
        instructions: [
          'Create exactly the requested Revision-owned question-family contracts and no others.',
          'Preserve every requested id exactly.',
          'componentScope must match the component mapping in Exam Truth exactly.',
          'Use only assessment objective ids present in Exam Truth.',
          'These are Revision-authored exam-style families, never official AQA questions or mark schemes.',
          'Calibration status must remain not_calibrated because Slice 2B performs no qualified-human calibration.',
        ].join('\n'),
        payload: {
          requestedFamilyIds,
          assessmentBlueprint,
          courseTruthNodes: courseKnowledgeModel.nodes.map(({ id, kind, summary, evidenceTypes }) => ({ id, kind, summary, evidenceTypes })),
        },
      })
    },
  }
}

export function createOpenAIFoundationLiveProvider(config: OpenAIContentFactoryAdapterConfig): FoundationStructuredProviderClient {
  return new OpenAIStructuredWorkerClient(config)
}
