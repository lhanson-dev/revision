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

const repairableCoverageEvidenceLocatorSchema = z.object({
  // One-based bounded locator into the owning subquestion's requirementIds.
  // It is optional only at the provider edge so the single complete-diagnostic
  // repair can correct an omitted locator before strict compilation.
  requirementPosition: z.number().int().positive().optional(),
  evidence: nonEmptyStringSchema,
})

const repairableAssessmentSubquestionSchema = assessmentSubquestionSchema.omit({
  maxMark: true,
  requirementIds: true,
  coverageEvidence: true,
}).extend({
  maxMark: z.number().int().positive().optional(),
  requirementIds: z.array(identifierSchema).min(1).optional(),
  coverageEvidence: z.array(repairableCoverageEvidenceLocatorSchema).min(1).optional(),
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
 * Provider-facing Assessment Item contract for Reliability v2 after the second Q7 soak.
 *
 * Revision owns top-level target component/family/requirements/format/marks and now
 * also owns the clerical requirement-ID pointer inside final coverageEvidence.
 * The provider authors the educational subquestion requirement mapping and exact
 * evidence excerpt, but identifies the target requirement only through a bounded
 * one-based position. Revision resolves that locator deterministically to the final
 * durable requirementId. Missing repair-eligible structure is admitted only so one
 * complete validator-directed repair can operate before strict compilation.
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
    && subquestion.requirementIds !== undefined
    && subquestion.coverageEvidence !== undefined
    && subquestion.coverageEvidence.every((entry) => entry.requirementPosition !== undefined)
  ))
}

function resolvedCoverageEvidence(subquestion: RepairableSubquestion, subquestionIndex: number) {
  const requirementIds = subquestion.requirementIds
  const coverageEvidence = subquestion.coverageEvidence
  if (!requirementIds || !coverageEvidence) {
    throw new Error(`Subquestion ${subquestionIndex + 1} is missing requirement mapping or coverage evidence before strict compilation`)
  }

  return coverageEvidence.map((entry, evidenceIndex) => {
    const position = entry.requirementPosition
    if (position === undefined || position < 1 || position > requirementIds.length) {
      throw new Error(`Subquestion ${subquestionIndex + 1} coverage evidence ${evidenceIndex + 1} has invalid requirementPosition`)
    }
    return {
      requirementId: requirementIds[position - 1]!,
      evidence: entry.evidence,
    }
  })
}

function strictSubquestions(candidate: RepairableCandidate) {
  return candidate.subquestions.map((subquestion, index) => {
    const { coverageEvidence: _coverageEvidence, ...rest } = subquestion
    return assessmentSubquestionSchema.parse({
      ...rest,
      coverageEvidence: resolvedCoverageEvidence(subquestion, index),
    })
  })
}

/**
 * Inspect the whole parseable candidate before repair. Missing structural fields
 * and invalid bounded coverage locators are reported across every subquestion in
 * one diagnostic set. If structure is complete, the existing deterministic
 * assessment validator remains the source of truth for educational reconciliation.
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
    if (subquestion.requirementIds === undefined) diagnostics.push(diagnostic(
      'ASSESSMENT_SUBQUESTION_REQUIREMENTS_MISSING',
      `${prefix}.requirementIds`,
      'Subquestion requirement mapping is required educational judgement and must be supplied for bounded validation.',
    ))
    if (subquestion.coverageEvidence === undefined) diagnostics.push(diagnostic(
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
      `${prefix}.coverageEvidence`,
      'Subquestion coverage evidence is required so Revision can prove where each governed requirement is assessed.',
    ))

    const coverageEvidence = subquestion.coverageEvidence
    if (!coverageEvidence) return

    let allLocatorsPresent = true
    coverageEvidence.forEach((entry, evidenceIndex) => {
      if (entry.requirementPosition === undefined) {
        allLocatorsPresent = false
        diagnostics.push(diagnostic(
          'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_MISSING',
          `${prefix}.coverageEvidence[${evidenceIndex}].requirementPosition`,
          'Coverage evidence must identify its subquestion requirement through a one-based bounded requirementPosition locator.',
        ))
      }
    })

    const requirementIds = subquestion.requirementIds
    if (!requirementIds || !allLocatorsPresent) return

    const seen = new Set<number>()
    for (let evidenceIndex = 0; evidenceIndex < coverageEvidence.length; evidenceIndex += 1) {
      const position = coverageEvidence[evidenceIndex]!.requirementPosition!
      if (position > requirementIds.length) {
        diagnostics.push(diagnostic(
          'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_OUT_OF_RANGE',
          `${prefix}.coverageEvidence[${evidenceIndex}].requirementPosition`,
          `requirementPosition ${position} exceeds the ${requirementIds.length} requirement(s) declared by this subquestion.`,
        ))
        continue
      }
      if (seen.has(position)) {
        diagnostics.push(diagnostic(
          'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_DUPLICATE',
          `${prefix}.coverageEvidence[${evidenceIndex}].requirementPosition`,
          `requirementPosition ${position} is duplicated; every declared requirement must be evidenced exactly once.`,
        ))
        continue
      }
      seen.add(position)
    }

    for (let position = 1; position <= requirementIds.length; position += 1) {
      if (!seen.has(position)) diagnostics.push(diagnostic(
        'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_UNEVIDENCED',
        `${prefix}.coverageEvidence`,
        `requirementPosition ${position} has no coverage evidence; every declared requirement must be evidenced exactly once.`,
      ))
    }
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
  'Every subquestion must include maxMark, requirementIds, responseDemands and coverageEvidence.',
  'Subquestion maxMark values must sum exactly to targetPolicy.maxMark.',
  'Across subquestions, requirementIds must cover every targetPolicy requirementId and no others.',
  'For each subquestion, coverageEvidence must contain one entry for every requirementIds position, using one-based requirementPosition values 1 through N exactly once. Do not return requirementId inside coverageEvidence; Revision resolves that clerical pointer deterministically.',
  'Each coverageEvidence evidence value must be an exact excerpt from that subquestion wording showing where the corresponding requirement is genuinely assessed.',
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
        'Do not return top-level componentId, questionFamilyId, requirementIds, maxMark or format; Revision owns those governed target fields.',
        'Inside coverageEvidence, return requirementPosition locators rather than requirementId strings; Revision resolves each final requirementId from the owning subquestion requirementIds.',
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
