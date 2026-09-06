import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
} from './schema'
import {
  foundationDiscoveredSourceSchema,
  foundationStructuredEvidenceSchema,
  type FoundationCompilationWorkers,
  type FoundationWorkerExecution,
} from './foundation-compilation'
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
        const existingFactIds = new Set(evidence.boardAlignmentFacts.map((fact) => fact.id))
        return success(execution, foundationStructuredEvidenceSchema.parse({
          ...evidence,
          boardAlignmentFacts: [
            ...evidence.boardAlignmentFacts,
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
        const retainedRequirements = alignment.assessmentRequirements.filter((requirement) => !controlledIds.has(requirement.id))
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
          const rules = aqaCourseAlignmentRules.filter((rule) => nodeIdsByRequirement.get(rule.requirementId)?.has(node.id))
          if (rules.length === 0) return node
          const suffixes = rules.map((rule) => rule.summarySuffix).filter((value): value is string => Boolean(value))
          return {
            ...node,
            summary: suffixes.length > 0 ? `${node.summary} ${suffixes.join(' ')}` : node.summary,
            formulas: [...new Set([...node.formulas, ...rules.flatMap((rule) => rule.formulas ?? [])])],
            misconceptions: [...new Set([...node.misconceptions, ...rules.flatMap((rule) => rule.misconceptions ?? [])])],
            applicationContexts: [...new Set([...node.applicationContexts, ...rules.flatMap((rule) => rule.applicationContexts ?? [])])],
            boardAlignmentRefs: [...new Set([...node.boardAlignmentRefs, ...rules.map((rule) => rule.fact.id)])],
          }
        })
        return success(execution, courseKnowledgeModelSchema.parse({ ...model, nodes }))
      } catch (error) {
        return failure('course-truth-alignment', error)
      }
    },
  }
}
