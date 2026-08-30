import { z } from 'zod'
import {
  assessmentItemWorkerOutputSchema,
} from './assessment-and-marking'
import {
  assessmentSubquestionSchema,
  validateStructuredAssessment,
} from './assessment-integrity'
import {
  createOpenAIModelAssistedWorkers as createBaseWorkers,
} from './openai-marking-pack-v2-compiler'
import {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import { normaliseAssessmentItemOptionalUnits } from './openai-assessment-item-provider-normalizer'
import {
  rebalanceMcqCorrectAnswerPositions,
  validateMcqCorrectAnswerDistribution,
} from './openai-output-integrity-compiler'
import { withSharedProviderBudget } from './openai-shared-provider-budget'
import type { WorkerExecution } from './intake-to-knowledge-model'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().trim().min(1)

const repairableAssessmentSubquestionSchema = assessmentSubquestionSchema.omit({
  requirementIds: true,
}).extend({
  maxMark: z.number().int().positive().optional(),
  coverageEvidence: z.array(z.object({
    requirementId: identifierSchema,
    evidence: nonEmptyStringSchema,
  })).min(1).optional(),
})

const repairableAssessmentContextSchema = z.object({
  id: identifierSchema,
  title: nonEmptyStringSchema,
  body: nonEmptyStringSchema,
  dataPoints: z.array(z.object({
    label: nonEmptyStringSchema,
    value: nonEmptyStringSchema,
    // Blank/whitespace strings are admitted only at this provider edge so the
    // existing Pilot #17 normalizer can deterministically convert them to absence.
    unit: z.string().optional(),
  })).default([]),
}).optional()

/**
 * Provider-facing Assessment Item contract for Reliability v2 after Q7.
 *
 * Revision owns top-level target component/family/requirements/format/marks and
 * now also owns the duplicated subquestion requirementIds representation. The
 * provider retains the educational judgement about which governed requirement an
 * exact question excerpt evidences through coverageEvidence[].requirementId;
 * Revision deterministically derives subquestions[].requirementIds from that
 * mapping before strict whole-artifact validation.
 *
 * Subquestion maxMark and coverageEvidence remain required in the final artifact
 * but may be absent at this provider edge so one complete, validator-directed
 * repair can operate on the bounded omission classes already exposed by Q7.
 */
export const assessmentItemV2ProviderOutputSchema = assessmentItemWorkerOutputSchema.omit({
  componentId: true,
  questionFamilyId: true,
  requirementIds: true,
  format: true,
  maxMark: true,
  subquestions: true,
  context: true,
}).extend({
  subquestions: z.array(repairableAssessmentSubquestionSchema).default([]),
  context: repairableAssessmentContextSchema,
})

export type AssessmentItemDiagnostic = {
  code: string
  path: string
  message: string
}

type AssessmentItemInput = Parameters<OpenAIModelAssistedWorkers['generateAssessmentItem']>[0]
type AssessmentItemPolicy = NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']>[string]
type RepairableSubquestion = z.infer<typeof repairableAssessmentSubquestionSchema>
type RepairableCandidate = z.infer<typeof assessmentItemV2ProviderOutputSchema>

function diagnostic(code: string, path: string, message: string): AssessmentItemDiagnostic {
  return { code, path, message }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Assessment Item v2 compilation error'
}

function normalisedCandidate(providerOutput: unknown) {
  return assessmentItemV2ProviderOutputSchema.parse(normaliseAssessmentItemOptionalUnits(providerOutput))
}

function candidateHasCompleteSubquestionStructure(candidate: RepairableCandidate) {
  return candidate.subquestions.length > 0 && candidate.subquestions.every((subquestion) => (
    subquestion.maxMark !== undefined
    && subquestion.coverageEvidence !== undefined
  ))
}

function strictSubquestions(candidate: RepairableCandidate) {
  return candidate.subquestions.map((subquestion) => assessmentSubquestionSchema.parse({
    ...subquestion,
    requirementIds: subquestion.coverageEvidence?.map((entry) => entry.requirementId) ?? [],
  }))
}

/**
 * Inspect the whole parseable candidate before repair. Missing structural fields
 * are reported for every subquestion in one diagnostic set. Provider-authored
 * subquestion requirementIds are deliberately outside this contract: the exact
 * set is compiled from coverageEvidence[].requirementId. Once repairable
 * structure is complete, deterministic assessment validation remains the source
 * of truth for mark arithmetic, governed requirement coverage, exact excerpts,
 * duplicate mappings, command/demand integrity and all remaining semantics.
 */
export function diagnoseAssessmentItemV2Candidate(
  providerOutput: unknown,
  policy: AssessmentItemPolicy,
): AssessmentItemDiagnostic[] {
  const candidate = normalisedCandidate(providerOutput)
  const diagnostics: AssessmentItemDiagnostic[] = []

  if (candidate.subquestions.length === 0) {
    diagnostics.push(diagnostic(
      'ASSESSMENT_SUBQUESTIONS_MISSING',
      'subquestions',
      'Assessment Item must contain at least one explicit mark-bearing subquestion.',
    ))
    return diagnostics
  }

  candidate.subquestions.forEach((subquestion: RepairableSubquestion, index: number) => {
    const prefix = `subquestions[${index}]`
    if (subquestion.maxMark === undefined) diagnostics.push(diagnostic(
      'ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING',
      `${prefix}.maxMark`,
      'Subquestion mark allocation is required educational judgement and must be supplied for bounded validation.',
    ))
    if (subquestion.coverageEvidence === undefined) diagnostics.push(diagnostic(
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
      `${prefix}.coverageEvidence`,
      'Subquestion coverage evidence is required so Revision can prove where each governed requirement is assessed.',
    ))
  })

  if (diagnostics.length > 0 || !candidateHasCompleteSubquestionStructure(candidate)) return diagnostics

  try {
    validateStructuredAssessment({
      itemId: candidate.id,
      maxMark: policy.maxMark,
      governedRequirementIds: policy.requirementIds,
      subquestions: strictSubquestions(candidate),
    })
  } catch (error) {
    diagnostics.push(diagnostic(
      'ASSESSMENT_STRUCTURED_CONTRACT_INVALID',
      'subquestions',
      errorMessage(error),
    ))
  }

  return diagnostics
}

export function compileAssessmentItemV2Candidate(
  providerOutput: unknown,
  input: AssessmentItemInput,
  policy: AssessmentItemPolicy,
) {
  const candidate = normalisedCandidate(providerOutput)
  const diagnostics = diagnoseAssessmentItemV2Candidate(candidate, policy)
  if (diagnostics.length > 0) {
    throw new Error(diagnostics.map((entry) => `${entry.code} @ ${entry.path}: ${entry.message}`).join(' | '))
  }

  const item = assessmentItemWorkerOutputSchema.parse({
    ...candidate,
    subquestions: strictSubquestions(candidate),
    componentId: input.targetComponentId,
    questionFamilyId: input.questionFamily.id,
    requirementIds: policy.requirementIds,
    maxMark: policy.maxMark,
    format: policy.format,
  })

  validateStructuredAssessment({
    itemId: item.id,
    maxMark: policy.maxMark,
    governedRequirementIds: policy.requirementIds,
    subquestions: item.subquestions,
  })

  const balanced = rebalanceMcqCorrectAnswerPositions(item)
  validateMcqCorrectAnswerDistribution(balanced)
  return assessmentItemWorkerOutputSchema.parse(balanced)
}

function diagnosticText(diagnostics: AssessmentItemDiagnostic[]) {
  return diagnostics
    .map((entry, index) => `${index + 1}. [${entry.code}] ${entry.path}: ${entry.message}`)
    .join('\n')
}

const assessmentItemV2Instruction = [
  'Create one original Revision-owned exam-style assessment item for the exact target component and Question Family. Never reproduce or closely mimic a known past-paper question.',
  'Use the supplied targetPolicy requirementIds, maxMark and format to shape the item, but do not return those governed top-level target fields; Revision injects them deterministically after provider validation.',
  'Return a non-empty subquestions array that makes every individual mark-bearing task explicit.',
  'Every subquestion must include maxMark, responseDemands and coverageEvidence. Do not return subquestion requirementIds; Revision derives them deterministically from coverageEvidence requirementId values.',
  'Subquestion maxMark values must sum exactly to targetPolicy.maxMark.',
  'Across subquestion coverageEvidence requirementId values, cover every targetPolicy requirementId and no others.',
  'Each subquestion coverageEvidence entry must identify the governed requirementId and use an exact excerpt from that subquestion wording showing where the requirement is genuinely assessed.',
  'responseDemands must describe only what the learner-facing command and wording actually ask the student to do.',
  'For selection/MCQ tasks provide exactly four distinct options A-D with exactly one correct answer and a distinct plausible misconceptionBasis for every incorrect option.',
  'Use only supplied knowledgeNodeIds. When context or stimulus is required, make it original, subject-authentic and internally consistent with supplied structured data.',
  'Do not make a learner prove or classify a property that the supplied wording or context does not establish. State enough original scenario information for every factual premise the task requires.',
].join(' ')

function combinedRepairExecution(
  first: WorkerExecution<unknown>,
  repair: WorkerExecution<unknown>,
): WorkerExecution<unknown> {
  return {
    ...repair,
    provenance: {
      ...repair.provenance,
      contractVersion: '5',
      retryCount: (first.provenance.retryCount ?? 0) + (repair.provenance.retryCount ?? 0) + 1,
      usageCost: (first.provenance.usageCost ?? 0) + (repair.provenance.usageCost ?? 0),
    },
  }
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const sharedConfig = withSharedProviderBudget(config)
  const workers = createBaseWorkers(sharedConfig)
  const client = new OpenAIStructuredWorkerClient(sharedConfig)

  return {
    ...workers,
    async generateAssessmentItem(input) {
      const policy = sharedConfig.assessmentItemPolicies?.[input.questionFamily.id]
      if (!policy) return workers.generateAssessmentItem(input)

      const firstExecution = await client.run({
        workerId: 'content-factory.assessment-item-v2',
        contractVersion: '5',
        routeKind: 'generation',
        outputSchema: assessmentItemV2ProviderOutputSchema,
        instructions: assessmentItemV2Instruction,
        payload: { ...input, targetPolicy: policy },
      })
      if (firstExecution.status !== 'success') return firstExecution

      const firstDiagnostics = diagnoseAssessmentItemV2Candidate(firstExecution.output, policy)
      if (firstDiagnostics.length === 0) {
        try {
          return { ...firstExecution, output: compileAssessmentItemV2Candidate(firstExecution.output, input, policy) }
        } catch (error) {
          return {
            status: 'failure',
            error: `provider_contract_failure: assessment_item_v2_compilation: ${errorMessage(error)}`,
            provenance: firstExecution.provenance,
          }
        }
      }

      const repairInstruction = [
        assessmentItemV2Instruction,
        'TARGETED ASSESSMENT ITEM REPAIR REQUIRED.',
        'The first complete provider candidate was inspected as far as its available structure safely permits and produced this complete actionable defect set:',
        diagnosticText(firstDiagnostics),
        'Return the complete corrected Assessment Item candidate in one repair. Preserve valid educational content and correct every listed defect.',
        'Do not return top-level componentId, questionFamilyId, requirementIds, maxMark or format. Do not return subquestion requirementIds; Revision derives those from coverageEvidence.',
        'Do not remove genuine educational demand merely to silence validation; repair the structured representation or learner-facing wording so the intended demand is explicit and provable.',
      ].join('\n')

      const repairExecution = combinedRepairExecution(
        firstExecution,
        await client.run({
          workerId: 'content-factory.assessment-item-v2-repair',
          contractVersion: '5',
          routeKind: 'generation',
          outputSchema: assessmentItemV2ProviderOutputSchema,
          instructions: repairInstruction,
          payload: {
            ...input,
            targetPolicy: policy,
            previousCandidate: firstExecution.output,
            repairDiagnostics: firstDiagnostics,
          },
        }),
      )
      if (repairExecution.status !== 'success') return repairExecution

      const repairDiagnostics = diagnoseAssessmentItemV2Candidate(repairExecution.output, policy)
      if (repairDiagnostics.length > 0) {
        return {
          status: 'failure',
          error: `provider_contract_failure: assessment_item_v2_after_complete_diagnostic_repair: initial=${diagnosticText(firstDiagnostics)}; repair=${diagnosticText(repairDiagnostics)}`,
          provenance: repairExecution.provenance,
        }
      }

      try {
        return { ...repairExecution, output: compileAssessmentItemV2Candidate(repairExecution.output, input, policy) }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: assessment_item_v2_compilation: ${errorMessage(error)}`,
          provenance: repairExecution.provenance,
        }
      }
    },
  }
}
