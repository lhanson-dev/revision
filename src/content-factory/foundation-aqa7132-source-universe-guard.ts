import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
} from './schema'
import {
  foundationAssessmentBlueprintSchema,
  foundationDiscoveredSourceSchema,
  foundationStructuredEvidenceSchema,
  type FoundationCompilationWorkers,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX,
  assertFoundationAssessmentObjectiveCoveragePlan,
  serializeFoundationAssessmentObjectiveCoveragePlan,
  type FoundationAssessmentObjectiveCoveragePlan,
} from './foundation-assessment-objective-coverage'
import { assertFoundationSourceUniverse } from './foundation-source-universe'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
} from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

export const AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS = {
  formulaeKeyData: 'https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-FORMULAE.PDF',
  specificationUpdates2023: 'https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-SPEC-UPDATES.PDF',
} as const

const formulaSourceId = 'aqa-7131-7132-formulae-key-data'
const subjectContentSourceId = 'aqa-7132-subject-content'
const schemeSourceId = 'aqa-7132-scheme'
const historicalPaper1NineMarkId = 'paper1-nine-mark-analysis'

const aqaAssessmentObjectiveCoveragePlan: FoundationAssessmentObjectiveCoveragePlan = {
  schemaVersion: 1,
  sourceAssessmentRequirementId: 'aqa-exam-ao-weighting',
  scope: 'qualification_total',
  totalAssessmentMarks: 300,
  objectives: [
    { assessmentObjectiveId: 'ao1', minWeightingPercent: 22, maxWeightingPercent: 25 },
    { assessmentObjectiveId: 'ao2', minWeightingPercent: 24, maxWeightingPercent: 27 },
    { assessmentObjectiveId: 'ao3', minWeightingPercent: 25, maxWeightingPercent: 28 },
    { assessmentObjectiveId: 'ao4', minWeightingPercent: 23, maxWeightingPercent: 26 },
  ],
  accountingBasis: 'primary_assessment_objective_marks',
  multiObjectiveTreatment: 'each_mark_allocated_once_to_a_primary_objective',
  generationValidation: 'sum_assessment_objective_marks_within_ranges',
  questionFamilyCoverageRequired: true,
}

type AqaAlignmentFact = {
  id: string
  sourceRef: string
  category: 'assessment_requirement' | 'quantitative_requirement' | 'other_alignment'
  value: string
  verificationStatus: 'verified'
}

type AqaCourseAlignmentRule = {
  fact: AqaAlignmentFact
  requirementId: string
  formulas?: string[]
  summarySuffix?: string
  misconceptions?: string[]
  applicationContexts?: string[]
}

type RevisionCourseProcedureRule = {
  requirementId: string
  applicationContexts: string[]
  misconceptions?: string[]
}

type AqaBoardAlignmentRule = {
  fact: AqaAlignmentFact
}

/**
 * Qualification-specific facts from REFERENCE_ONLY AQA material are retained as
 * Board Alignment facts. They never become curriculum sourceRefs or protected source
 * text supplied to a generative worker. The deterministic Course Truth overlay below
 * applies only deliberately approved curriculum-facing factual conventions and binds
 * them back to their Board Alignment fact IDs.
 */
const aqaCourseAlignmentRules: AqaCourseAlignmentRule[] = [
  {
    fact: {
      id: 'aqa-quant-market-capitalisation',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Market capitalisation uses issued shares multiplied by current share price.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-1-2',
    formulas: ['Market capitalisation = number of issued shares × current share price'],
  },
  {
    fact: {
      id: 'aqa-quant-added-value',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Added value uses sales revenue less the cost of bought-in goods and services.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-4-1',
    formulas: ['Added value = sales revenue − cost of bought-in goods and services'],
  },
  {
    fact: {
      id: 'aqa-quant-return-on-investment',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Return on investment percentage uses profit from the investment divided by its cost, multiplied by 100.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-5-1',
    formulas: ['Return on investment (%) = profit from investment ÷ cost of investment × 100'],
  },
  {
    fact: {
      id: 'aqa-quant-profit-measures',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Qualification calculations distinguish gross profit, operating profit and profit for the year using their constituent revenue, cost, other-activity, finance-cost and tax figures.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-5-2',
    formulas: [
      'Gross profit = revenue − cost of sales',
      'Operating profit = gross profit − operating expenses',
      'Profit for the year = operating profit + profit from other activities − net finance costs − tax',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-profit-margins',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Gross, operating and profit-for-year margins each express the relevant profit measure as a percentage of revenue.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-5-2',
    formulas: [
      'Gross profit margin (%) = gross profit ÷ revenue × 100',
      'Operating profit margin (%) = operating profit ÷ revenue × 100',
      'Profit for the year margin (%) = profit for the year ÷ revenue × 100',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-variance-convention',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'The current qualification formula guide presents variance as budgeted figure minus actual figure; favourable or adverse meaning still depends on the business context.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-5-2',
    formulas: ['Variance = budgeted figure − actual figure'],
    misconceptions: ['Do not infer favourable or adverse performance from the sign of a variance without considering whether the figure is a cost, revenue or other measure.'],
  },
  {
    fact: {
      id: 'aqa-quant-labour-turnover',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'The current qualification formula guide presents labour turnover as staff leaving divided by staff employed, multiplied by 100; an alternative formula may be valid where the supplied data and context support it.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-6-2',
    formulas: ['Labour turnover (%) = number of staff leaving ÷ number of staff employed × 100'],
    applicationContexts: ['Use the denominator supported by the supplied data and explain any justified alternative convention rather than hard-coding average employment in every context.'],
  },
  {
    fact: {
      id: 'aqa-method-critical-path',
      sourceRef: subjectContentSourceId,
      category: 'other_alignment',
      value: 'Critical-path analysis identifies the longest-duration start-to-finish route through a network; that route determines the shortest possible project completion time.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-10-3',
    summarySuffix: 'For qualification alignment, identify the critical path as the longest-duration start-to-finish route through the network; it determines the shortest possible project completion time.',
    misconceptions: ['Zero total float is a property associated with critical activities; it is not a substitute for identifying the longest-duration start-to-finish route.'],
  },
]

/**
 * Revision-owned procedure overlays make quantitative Course Truth actionable at
 * initial compilation. They are original structured methods, not copied protected
 * awarding-body text, and therefore do not add REFERENCE_ONLY sourceRefs.
 */
const revisionCourseProcedureRules: RevisionCourseProcedureRule[] = [
  {
    requirementId: 'aqa-3-2-2',
    applicationContexts: [
      'For quantitative decision analysis: define the decision objective and alternatives; identify the relevant figures, units and probabilities; apply the permitted calculation to each alternative; compare the results; interpret the result alongside risk, uncertainty and stakeholder effects; state any material limitation.',
    ],
    misconceptions: ['A numerically highest option is not automatically the best business decision when qualitative risk, uncertainty or stakeholder consequences materially change the judgement.'],
  },
  {
    requirementId: 'aqa-3-4-2',
    applicationContexts: [
      'For quantitative operations analysis: identify the operational objective and constraint; identify the relevant capacity, output, productivity or cost inputs; calculate the required measure using consistent units and time periods; compare alternatives or benchmarks; interpret the operational consequence; qualify the conclusion for constraints and risk.',
    ],
    misconceptions: ['Do not compare operational ratios built from inconsistent capacity bases, units or time periods.'],
  },
  {
    requirementId: 'aqa-3-5-2',
    applicationContexts: [
      'For financial-performance calculations: identify the requested profit, margin or variance measure; select the governed formula; substitute the supplied figures; calculate with the correct unit or percentage; compare with the relevant benchmark or period; interpret the business meaning; state any limitation that affects the conclusion.',
    ],
  },
  {
    requirementId: 'aqa-3-10-3',
    applicationContexts: [
      'For critical-path calculations: identify activities, durations and dependencies; construct or interpret the network; calculate route totals and any required timing values; identify the longest start-to-finish route as the critical path; use float or timing information to prioritise activity; interpret the operational action and trade-off.',
    ],
    misconceptions: ['The shortest route through a network is not the critical path.'],
  },
  {
    requirementId: 'aqa-annex-quantitative',
    applicationContexts: [
      'For any supported quantitative method: identify the required method or formula; select the correct inputs and units; substitute the data; calculate; check reasonableness and rounding; interpret the result in business context; compare or qualify the result where the question requires judgement.',
    ],
    misconceptions: ['A calculation alone is incomplete when the assessment demand also requires interpretation, analysis or evaluation.'],
  },
]

/**
 * Exam-only qualification facts remain in Board Alignment and are available to the
 * Exam Truth compiler, but they are not overlaid onto curriculum Course Truth nodes.
 */
const aqaBoardAlignmentRules: AqaBoardAlignmentRule[] = [
  {
    fact: {
      id: 'aqa-exam-ao-weighting',
      sourceRef: schemeSourceId,
      category: 'assessment_requirement',
      value: 'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
      verificationStatus: 'verified',
    },
  },
]

const allAqaAlignmentRules = [
  ...aqaCourseAlignmentRules,
  ...aqaBoardAlignmentRules,
]

function success<T>(execution: Extract<FoundationWorkerExecution<T>, { status: 'success' }>, output: T): FoundationWorkerExecution<T> {
  return { ...execution, output }
}

function failure(stage: string, error: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `aqa_7132_source_universe:${stage}:${error instanceof Error ? error.message : String(error)}`,
    provenance: {
      id: `aqa-7132-source-universe-${stage}-failed`,
      contextId: `deterministic-aqa-7132-source-universe:${stage}`,
      contractVersion: '1',
      provider: 'revision-deterministic-source-universe',
    },
  }
}

async function assertPdf(fetchImpl: typeof fetch, url: string) {
  const response = await fetchImpl(url, { headers: { 'User-Agent': 'Revision-Foundation-Source-Universe/1.0' } })
  if (!response.ok) throw new Error(`http_${response.status}:${url}`)
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.includes('pdf')) throw new Error(`expected_pdf:${url}`)
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0) throw new Error(`empty_pdf:${url}`)
}

function alignmentRequirementIds() {
  return new Set(allAqaAlignmentRules.map((rule) => rule.fact.id))
}

function isHistoricalPaper1PatternText(value: string) {
  const text = value.toLowerCase().replace(/[–—−]/g, '-')
  return text.includes(historicalPaper1NineMarkId)
    || ((text.includes('9-mark') || text.includes('9 mark')) && text.includes('analyse'))
}

function controlledPaperConstraints(componentId: string, existing: string[]) {
  if (componentId === 'paper1') {
    return [
      'Paper 1 totals 100 marks and lasts 2 hours.',
      'Paper 1 contains 15 one-mark multiple-choice questions, worth 15 marks in total.',
      'Paper 1 contains 35 marks of short-answer questions.',
      'Paper 1 contains two 25-mark essay questions.',
      'Historical constituent mark patterns are calibration evidence only and are not mandatory qualification structure.',
    ]
  }
  if (componentId === 'paper2') {
    return [
      'Paper 2 totals 100 marks and lasts 2 hours.',
      'Paper 2 contains three compulsory data-response question sets.',
      'Each Paper 2 data-response set is approximately 33 marks; this is set-level qualification structure and does not prescribe constituent question marks.',
    ]
  }
  return existing.filter((constraint) => !isHistoricalPaper1PatternText(constraint))
}

export function withAqa7132SourceUniverseGuard(
  workers: FoundationCompilationWorkers,
  fetchImpl: typeof fetch = fetch,
): FoundationCompilationWorkers {
  return {
    ...workers,
    async discoverSources(input) {
      const execution = await workers.discoverSources(input)
      if (execution.status !== 'success') return execution
      try {
        await Promise.all([
          assertPdf(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.formulaeKeyData),
          assertPdf(fetchImpl, AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.specificationUpdates2023),
        ])
        const existing = foundationDiscoveredSourceSchema.array().parse(execution.output)
        return success(execution, foundationDiscoveredSourceSchema.array().parse([
          ...existing,
          {
            id: formulaSourceId,
            url: AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.formulaeKeyData,
            title: 'AQA AS/A-level Business 7131/7132 Formulae and key data',
            issuer: 'AQA',
            sourceType: 'quantitative_or_skills_annex',
            educationalRole: ['reference-only quantitative truth', 'formula/convention challenge source'],
            versionOrDate: 'revised 09 June 2023; runtime preflight required',
          },
          {
            id: 'aqa-7131-7132-specification-updates-2023',
            url: AQA_A_LEVEL_BUSINESS_7132_SOURCE_UNIVERSE_URLS.specificationUpdates2023,
            title: 'AQA AS/A-level Business specification updates for teaching from September 2023',
            issuer: 'AQA',
            sourceType: 'amendment_or_notice',
            educationalRole: ['reference-only source-universe currency challenge'],
            versionOrDate: 'March 2023; runtime preflight required',
          },
        ]))
      } catch (error) {
        return failure('discovery', error)
      }
    },
    async resolveStructuredEvidence(input) {
      const execution = await workers.resolveStructuredEvidence(input)
      if (execution.status !== 'success') return execution
      try {
        const evidence = foundationStructuredEvidenceSchema.parse(execution.output)
        const retainedFacts = evidence.boardAlignmentFacts.filter((fact) => fact.id !== historicalPaper1NineMarkId)
        const existingFactIds = new Set(retainedFacts.map((fact) => fact.id))
        return success(execution, foundationStructuredEvidenceSchema.parse({
          ...evidence,
          boardAlignmentFacts: [
            ...retainedFacts,
            ...allAqaAlignmentRules
              .filter((rule) => !existingFactIds.has(rule.fact.id))
              .map((rule) => rule.fact),
          ],
        }))
      } catch (error) {
        return failure('structured-evidence', error)
      }
    },
    async compileBoardAlignment(input) {
      const execution = await workers.compileBoardAlignment(input)
      if (execution.status !== 'success') return execution
      try {
        const alignment = boardAlignmentSchema.parse(execution.output)
        const inputFacts = new Map(input.facts.map((fact) => [fact.id, fact] as const))
        for (const rule of allAqaAlignmentRules) {
          const fact = inputFacts.get(rule.fact.id)
          if (!fact || fact.verificationStatus !== 'verified') {
            throw new Error(`missing_verified_alignment_fact:${rule.fact.id}`)
          }
          if (fact.sourceRef !== rule.fact.sourceRef) {
            throw new Error(`alignment_fact_source_mismatch:${rule.fact.id}:${fact.sourceRef}`)
          }
        }

        const controlledIds = alignmentRequirementIds()
        const retainedRequirements = alignment.assessmentRequirements.filter((requirement) =>
          !controlledIds.has(requirement.id)
          && requirement.id !== historicalPaper1NineMarkId
          && !isHistoricalPaper1PatternText(requirement.summary),
        )
        const componentScope = input.identity.components.map((component) => component.id)
        return success(execution, boardAlignmentSchema.parse({
          ...alignment,
          assessmentRequirements: [
            ...retainedRequirements,
            ...allAqaAlignmentRules.map((rule) => ({
              id: rule.fact.id,
              summary: rule.fact.value,
              componentScope,
              sourceRefs: [rule.fact.sourceRef],
            })),
          ],
          sourceRefs: [...new Set([
            ...alignment.sourceRefs,
            ...allAqaAlignmentRules.map((rule) => rule.fact.sourceRef),
          ])],
        }))
      } catch (error) {
        return failure('board-alignment', error)
      }
    },
    async compileCoverage(input) {
      try {
        assertFoundationSourceUniverse({
          profileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
          requirements: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
          sourceEvidence: input.sourceLicenceRegister.sources.map((source) => ({
            id: source.id,
            issuer: source.issuer,
            sourceType: source.sourceType,
            useClass: source.useClass,
          })),
        })
      } catch (error) {
        return failure('coverage', error)
      }
      return workers.compileCoverage(input)
    },
    async compileCourseTruth(input) {
      const execution = await workers.compileCourseTruth(input)
      if (execution.status !== 'success') return execution
      try {
        const alignmentIds = new Set(input.boardAlignment.assessmentRequirements.map((requirement) => requirement.id))
        for (const rule of aqaCourseAlignmentRules) {
          if (!alignmentIds.has(rule.fact.id)) throw new Error(`course_truth_missing_alignment_fact:${rule.fact.id}`)
        }

        const model = courseKnowledgeModelSchema.parse(execution.output)
        const nodeIdsByRequirement = new Map(
          input.coverageModel.requirements.map((requirement) => [requirement.requirementId, new Set(requirement.knowledgeNodeIds)] as const),
        )
        const nodes = model.nodes.map((node) => {
          const alignmentRules = aqaCourseAlignmentRules.filter((rule) => nodeIdsByRequirement.get(rule.requirementId)?.has(node.id))
          const procedureRules = revisionCourseProcedureRules.filter((rule) => nodeIdsByRequirement.get(rule.requirementId)?.has(node.id))
          if (alignmentRules.length === 0 && procedureRules.length === 0) return node
          const suffixes = alignmentRules.map((rule) => rule.summarySuffix).filter((value): value is string => Boolean(value))
          return {
            ...node,
            summary: suffixes.length > 0 ? `${node.summary} ${suffixes.join(' ')}` : node.summary,
            formulas: [...new Set([...node.formulas, ...alignmentRules.flatMap((rule) => rule.formulas ?? [])])],
            misconceptions: [...new Set([
              ...node.misconceptions,
              ...alignmentRules.flatMap((rule) => rule.misconceptions ?? []),
              ...procedureRules.flatMap((rule) => rule.misconceptions ?? []),
            ])],
            applicationContexts: [...new Set([
              ...node.applicationContexts,
              ...alignmentRules.flatMap((rule) => rule.applicationContexts ?? []),
              ...procedureRules.flatMap((rule) => rule.applicationContexts),
            ])],
            boardAlignmentRefs: [...new Set([...node.boardAlignmentRefs, ...alignmentRules.map((rule) => rule.fact.id)])],
          }
        })
        return success(execution, courseKnowledgeModelSchema.parse({ ...model, nodes }))
      } catch (error) {
        return failure('course-truth-alignment', error)
      }
    },
    async compileExamTruth(input) {
      const execution = await workers.compileExamTruth(input)
      if (execution.status !== 'success') return execution
      try {
        const blueprint = foundationAssessmentBlueprintSchema.parse(execution.output)
        const assessmentRequirements = blueprint.assessmentRequirements.filter((requirement) =>
          requirement.id !== historicalPaper1NineMarkId && !isHistoricalPaper1PatternText(requirement.summary),
        )
        const aoRequirement = {
          id: 'aqa-exam-ao-weighting',
          summary: 'Qualification-level AO ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%; generated assessment marks must be accounted once to a primary AO and validated against these ranges.',
          componentScope: input.identity.components.map((component) => component.id),
        }
        const withoutAoRequirement = assessmentRequirements.filter((requirement) => requirement.id !== aoRequirement.id)
        const aoCoverageContract = serializeFoundationAssessmentObjectiveCoveragePlan(aqaAssessmentObjectiveCoveragePlan)

        const components = blueprint.components.map((component) => {
          const controlledMarkTotal = ['paper1', 'paper2', 'paper3'].includes(component.componentId) ? 100 : component.markTotal
          const controlledTiming = ['paper1', 'paper2', 'paper3'].includes(component.componentId) ? 120 : component.timingMinutes
          const filteredFamilyIds = component.questionFamilyIds.filter((id) => id !== historicalPaper1NineMarkId)
          const questionFamilyIds = component.componentId === 'paper1'
            ? [...new Set(['paper1-mcq', 'paper1-short-response', 'paper1-extended-response', ...filteredFamilyIds])]
            : component.componentId === 'paper2'
              ? ['paper2-data-response']
              : filteredFamilyIds
          return {
            ...component,
            markTotal: controlledMarkTotal,
            timingMinutes: controlledTiming,
            questionFamilyIds,
            constraints: controlledPaperConstraints(component.componentId, component.constraints),
          }
        })

        const normalized = foundationAssessmentBlueprintSchema.parse({
          ...blueprint,
          assessmentObjectives: aqaAssessmentObjectiveCoveragePlan.objectives.map((objective) => ({ id: objective.assessmentObjectiveId })),
          assessmentRequirements: [...withoutAoRequirement, aoRequirement],
          components,
          evidenceExpectations: [
            ...blueprint.evidenceExpectations.filter((expectation) =>
              !expectation.startsWith(FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX)
              && !isHistoricalPaper1PatternText(expectation),
            ),
            aoCoverageContract,
          ],
        })
        return success(execution, normalized)
      } catch (error) {
        return failure('exam-truth-alignment', error)
      }
    },
    async compileQuestionFamilies(input) {
      const execution = await workers.compileQuestionFamilies(input)
      if (execution.status !== 'success') return execution
      try {
        const families = questionFamilySchema.array().parse(execution.output)
          .filter((family) => family.id !== historicalPaper1NineMarkId)
          .map((family) => {
            if (family.id !== 'paper2-data-response') return family
            return questionFamilySchema.parse({
              ...family,
              componentScope: ['paper2'],
              markRange: { min: 100, max: 100 },
              responseShape: 'Set-level family representing the complete 100-mark Paper 2: three compulsory data-response question sets of approximately 33 marks each. Constituent question marks are not prescribed by this Foundation.',
            })
          })
        assertFoundationAssessmentObjectiveCoveragePlan({
          blueprint: input.assessmentBlueprint,
          questionFamilies: families,
          expectedPlan: aqaAssessmentObjectiveCoveragePlan,
        })
        return success(execution, families)
      } catch (error) {
        return failure('question-family-alignment', error)
      }
    },
  }
}
