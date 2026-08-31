import { z } from 'zod'
import {
  assessmentItemWorkerOutputSchema,
} from './assessment-and-marking'
import {
  assessmentSubquestionSchema,
  diagnoseStructuredAssessment,
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

const ASSESSMENT_ITEM_CONTRACT_VERSION = '7'
const MAX_ASSESSMENT_ITEM_CANDIDATES = 2

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
 * Provider-facing Assessment Item contract for the post-Pilot #20 recovery architecture.
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

type CandidateRejection = {
  candidateNumber: number
  stage: 'diagnostics_after_repair' | 'compilation'
  details: string
}

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
 * structure is complete, the shared assessment-integrity diagnostic API returns
 * every safely inspectable deterministic semantic finding in the same pass.
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

  for (const entry of diagnoseStructuredAssessment({
    itemId: candidate.id,
    maxMark: policy.maxMark,
    governedRequirementIds: policy.requirementIds,
    subquestions: strictSubquestions(candidate),
  })) diagnostics.push(diagnostic(entry.code, entry.path, entry.message))

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

function rejectionText(rejections: CandidateRejection[]) {
  return rejections
    .map((rejection) => `candidate ${rejection.candidateNumber} ${rejection.stage}: ${rejection.details}`)
    .join(' | ')
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

function appendExecution(
  accumulated: WorkerExecution<unknown> | undefined,
  next: WorkerExecution<unknown>,
  retryIncrement: number,
): WorkerExecution<unknown> {
  if (!accumulated) {
    return {
      ...next,
      provenance: {
        ...next.provenance,
        contractVersion: ASSESSMENT_ITEM_CONTRACT_VERSION,
      },
    }
  }

  return {
    ...next,
    provenance: {
      ...next.provenance,
      contractVersion: ASSESSMENT_ITEM_CONTRACT_VERSION,
      retryCount: (accumulated.provenance.retryCount ?? 0) + (next.provenance.retryCount ?? 0) + retryIncrement,
      usageCost: (accumulated.provenance.usageCost ?? 0) + (next.provenance.usageCost ?? 0),
    },
  }
}

function generationInstruction(candidateNumber: number) {
  if (candidateNumber === 1) return assessmentItemV2Instruction
  return [
    assessmentItemV2Instruction,
    'FRESH CANDIDATE RESAMPLE REQUIRED.',
    'A previous candidate for this production slot was rejected after its one permitted targeted repair.',
    'Generate a genuinely fresh Assessment Item candidate for the same governed slot. Do not patch, preserve or imitate the rejected candidate wording.',
    'Satisfy the target policy directly from the supplied governed inputs.',
  ].join('\n')
}

function repairInstruction(diagnostics: AssessmentItemDiagnostic[]) {
  return [
    assessmentItemV2Instruction,
    'TARGETED ASSESSMENT ITEM REPAIR REQUIRED.',
    'This candidate was inspected as far as its available structure safely permits and produced this complete actionable defect set:',
    diagnosticText(diagnostics),
    'Return the complete corrected Assessment Item candidate in one repair. Preserve valid educational content and correct every listed defect.',
    'Do not return top-level componentId, questionFamilyId, requirementIds, maxMark or format. Do not return subquestion requirementIds; Revision derives those from coverageEvidence.',
    'Do not remove genuine educational demand merely to silence validation; repair the structured representation or learner-facing wording so the intended demand is explicit and provable.',
  ].join('\n')
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

      let accumulatedExecution: WorkerExecution<unknown> | undefined
      const rejections: CandidateRejection[] = []

      for (let candidateNumber = 1; candidateNumber <= MAX_ASSESSMENT_ITEM_CANDIDATES; candidateNumber += 1) {
        const generationExecution = appendExecution(
          accumulatedExecution,
          await client.run({
            workerId: candidateNumber === 1
              ? 'content-factory.assessment-item-v2'
              : 'content-factory.assessment-item-v2-resample',
            contractVersion: ASSESSMENT_ITEM_CONTRACT_VERSION,
            routeKind: 'generation',
            outputSchema: assessmentItemV2ProviderOutputSchema,
            instructions: generationInstruction(candidateNumber),
            payload: {
              ...input,
              targetPolicy: policy,
              candidateNumber,
              maxCandidates: MAX_ASSESSMENT_ITEM_CANDIDATES,
            },
          }),
          candidateNumber === 1 ? 0 : 1,
        )
        accumulatedExecution = generationExecution
        if (generationExecution.status !== 'success') return generationExecution

        const firstDiagnostics = diagnoseAssessmentItemV2Candidate(generationExecution.output, policy)
        if (firstDiagnostics.length === 0) {
          try {
            return {
              ...generationExecution,
              output: compileAssessmentItemV2Candidate(generationExecution.output, input, policy),
            }
          } catch (error) {
            rejections.push({
              candidateNumber,
              stage: 'compilation',
              details: errorMessage(error),
            })
            if (candidateNumber < MAX_ASSESSMENT_ITEM_CANDIDATES) continue
            return {
              status: 'failure',
              error: `provider_contract_failure: assessment_item_v2_candidate_recovery_exhausted: ${rejectionText(rejections)}`,
              provenance: generationExecution.provenance,
            }
          }
        }

        const repairedExecution = appendExecution(
          generationExecution,
          await client.run({
            workerId: 'content-factory.assessment-item-v2-repair',
            contractVersion: ASSESSMENT_ITEM_CONTRACT_VERSION,
            routeKind: 'generation',
            outputSchema: assessmentItemV2ProviderOutputSchema,
            instructions: repairInstruction(firstDiagnostics),
            payload: {
              ...input,
              targetPolicy: policy,
              candidateNumber,
              previousCandidate: generationExecution.output,
              repairDiagnostics: firstDiagnostics,
            },
          }),
          1,
        )
        accumulatedExecution = repairedExecution
        if (repairedExecution.status !== 'success') return repairedExecution

        const repairDiagnostics = diagnoseAssessmentItemV2Candidate(repairedExecution.output, policy)
        if (repairDiagnostics.length > 0) {
          rejections.push({
            candidateNumber,
            stage: 'diagnostics_after_repair',
            details: `initial=${diagnosticText(firstDiagnostics)}; repair=${diagnosticText(repairDiagnostics)}`,
          })
          if (candidateNumber < MAX_ASSESSMENT_ITEM_CANDIDATES) continue
          return {
            status: 'failure',
            error: `provider_contract_failure: assessment_item_v2_candidate_recovery_exhausted: ${rejectionText(rejections)}`,
            provenance: repairedExecution.provenance,
          }
        }

        try {
          return {
            ...repairedExecution,
            output: compileAssessmentItemV2Candidate(repairedExecution.output, input, policy),
          }
        } catch (error) {
          rejections.push({
            candidateNumber,
            stage: 'compilation',
            details: errorMessage(error),
          })
          if (candidateNumber < MAX_ASSESSMENT_ITEM_CANDIDATES) continue
          return {
            status: 'failure',
            error: `provider_contract_failure: assessment_item_v2_candidate_recovery_exhausted: ${rejectionText(rejections)}`,
            provenance: repairedExecution.provenance,
          }
        }
      }

      throw new Error('Assessment Item candidate recovery loop exited without a result')
    },
  }
}
