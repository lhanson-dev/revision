import { z } from 'zod'
import { markingPackWorkerOutputSchema } from './assessment-and-marking'
import { markingSubquestionGuidanceSchema } from './assessment-integrity'
import {
  createOpenAIModelAssistedWorkers as createBaseWorkers,
} from './openai-assessment-item-provider-normalizer'
import {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import { withSharedProviderBudget } from './openai-shared-provider-budget'
import type { WorkerExecution } from './intake-to-knowledge-model'
import { MAX_MARKING_PACK_CANDIDATES } from './marking-pack-candidate-recovery'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const MARKING_PACK_CONTRACT_VERSION = '5'

const providerSubquestionGuidanceSchema = markingSubquestionGuidanceSchema.omit({ maxMark: true })
const providerRubricGuidanceSchema = z.strictObject({
  subquestionId: identifierSchema,
  levels: z.array(z.strictObject({ descriptor: nonEmptyStringSchema })).min(1),
})

const commonMarkingPackV2ProviderOutputSchema = z.strictObject({
  subquestionGuidance: z.array(providerSubquestionGuidanceSchema).default([]),
  rubricGuidance: z.array(providerRubricGuidanceSchema).min(1),
  applicationRequirements: z.array(nonEmptyStringSchema).default([]),
  analysisRequirements: z.array(nonEmptyStringSchema).default([]),
  evaluationRequirements: z.array(nonEmptyStringSchema).default([]),
  validReasoningRoutes: z.array(nonEmptyStringSchema).min(1),
  indicativeContent: z.array(nonEmptyStringSchema).default([]),
  misconceptions: z.array(nonEmptyStringSchema).default([]),
  diagnosticFeedbackRules: z.array(nonEmptyStringSchema).min(1),
  improvementActions: z.array(nonEmptyStringSchema).min(1),
  ambiguityPolicy: nonEmptyStringSchema,
  confidencePolicy: nonEmptyStringSchema,
})

const unstructuredMarkingPackV2ProviderOutputSchema = commonMarkingPackV2ProviderOutputSchema.extend({
  overallAssessmentObjectiveAllocation: z.array(z.object({
    objectiveId: identifierSchema,
    marks: z.number().int().nonnegative(),
  })).default([]),
})

/**
 * Public structured provider contract used by Reliability v2 qualification.
 * It deliberately contains no rubric IDs, numeric mark bands, subquestion maxMark
 * values or structured aggregate AO arithmetic: Revision owns those mechanics.
 */
export const markingPackV2ProviderOutputSchema = commonMarkingPackV2ProviderOutputSchema

export type MarkingPackDiagnostic = {
  code: string
  path: string
  message: string
}

type MarkingPackInput = Parameters<OpenAIModelAssistedWorkers['generateMarkingPack']>[0]
type CommonCandidate = z.infer<typeof commonMarkingPackV2ProviderOutputSchema>
type Candidate = CommonCandidate & {
  overallAssessmentObjectiveAllocation?: Array<{ objectiveId: string; marks: number }>
}
type RubricScope = {
  id: string
  maxMark: number
  responseDemands: string[]
}
type CandidateRejection = {
  candidateNumber: number
  stage: 'provider_contract' | 'diagnostics_after_repair' | 'compilation'
  details: string
}

function providerOutputSchema(input: MarkingPackInput) {
  return input.assessmentItem.subquestions.length > 0
    ? commonMarkingPackV2ProviderOutputSchema
    : unstructuredMarkingPackV2ProviderOutputSchema
}

function parseCandidate(providerOutput: unknown, input: MarkingPackInput): Candidate {
  return providerOutputSchema(input).parse(providerOutput) as Candidate
}

function diagnostic(code: string, path: string, message: string): MarkingPackDiagnostic {
  return { code, path, message }
}

function rubricScopes(input: MarkingPackInput): RubricScope[] {
  if (input.assessmentItem.subquestions.length > 0) {
    return input.assessmentItem.subquestions.map((subquestion) => ({
      id: subquestion.id,
      maxMark: subquestion.maxMark,
      responseDemands: subquestion.responseDemands,
    }))
  }
  return [{
    id: 'overall',
    maxMark: input.assessmentItem.maxMark,
    responseDemands: [
      ...(input.assessmentItem.format === 'calculation' ? ['calculation'] : []),
      ...(input.questionFamily.analysisRequirements.length > 0 ? ['analysis'] : []),
      ...(input.questionFamily.evaluationRequirements.length > 0 ? ['evaluation'] : []),
    ],
  }]
}

function countBy<T>(values: T[], key: (value: T) => string) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(key(value), (counts.get(key(value)) ?? 0) + 1)
  return counts
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function diagnoseStructuredGuidance(candidate: Candidate, input: MarkingPackInput) {
  const diagnostics: MarkingPackDiagnostic[] = []
  const subquestions = input.assessmentItem.subquestions
  if (subquestions.length === 0) {
    if (candidate.subquestionGuidance.length > 0) {
      diagnostics.push(diagnostic(
        'MARKING_SUBQUESTION_GUIDANCE_UNEXPECTED',
        'subquestionGuidance',
        'Unstructured assessment items must not invent subquestion guidance.',
      ))
    }
    return diagnostics
  }

  const expected = new Map(subquestions.map((subquestion) => [subquestion.id, subquestion]))
  const counts = countBy(candidate.subquestionGuidance, (entry) => entry.subquestionId)

  for (const subquestion of subquestions) {
    const count = counts.get(subquestion.id) ?? 0
    if (count === 0) diagnostics.push(diagnostic(
      'MARKING_SUBQUESTION_GUIDANCE_MISSING',
      `subquestionGuidance[${subquestion.id}]`,
      `Marking Pack must guide subquestion ${subquestion.id} exactly once.`,
    ))
    if (count > 1) diagnostics.push(diagnostic(
      'MARKING_SUBQUESTION_GUIDANCE_DUPLICATE',
      `subquestionGuidance[${subquestion.id}]`,
      `Marking Pack guides subquestion ${subquestion.id} ${count} times; exactly one entry is required.`,
    ))
  }

  for (const entry of candidate.subquestionGuidance) {
    const subquestion = expected.get(entry.subquestionId)
    if (!subquestion) {
      diagnostics.push(diagnostic(
        'MARKING_SUBQUESTION_GUIDANCE_UNKNOWN',
        `subquestionGuidance[${entry.subquestionId}]`,
        `Marking Pack guidance references unknown subquestion ${entry.subquestionId}.`,
      ))
      continue
    }

    for (const demand of entry.rewardedDemands) {
      if (!subquestion.responseDemands.includes(demand)) diagnostics.push(diagnostic(
        'MARKING_UNASKED_REWARDED_DEMAND',
        `subquestionGuidance[${entry.subquestionId}].rewardedDemands`,
        `Guidance for ${entry.subquestionId} rewards unasked demand ${demand}.`,
      ))
    }

    const allocationTotal = entry.assessmentObjectiveAllocation.reduce((sum, allocation) => sum + allocation.marks, 0)
    if (allocationTotal !== subquestion.maxMark) diagnostics.push(diagnostic(
      'MARKING_SUBQUESTION_AO_TOTAL_MISMATCH',
      `subquestionGuidance[${entry.subquestionId}].assessmentObjectiveAllocation`,
      `Guidance AO allocation for ${entry.subquestionId} totals ${allocationTotal}; expected ${subquestion.maxMark}.`,
    ))

    const allocationCounts = countBy(entry.assessmentObjectiveAllocation, (allocation) => allocation.objectiveId)
    for (const [objectiveId, count] of allocationCounts) {
      if (count > 1) diagnostics.push(diagnostic(
        'MARKING_SUBQUESTION_AO_DUPLICATE',
        `subquestionGuidance[${entry.subquestionId}].assessmentObjectiveAllocation`,
        `Guidance for ${entry.subquestionId} repeats objective ${objectiveId}; each objective may appear at most once.`,
      ))
    }
    for (const allocation of entry.assessmentObjectiveAllocation) {
      if (!input.questionFamily.assessmentObjectiveIds.includes(allocation.objectiveId)) diagnostics.push(diagnostic(
        'MARKING_SUBQUESTION_AO_UNKNOWN',
        `subquestionGuidance[${entry.subquestionId}].assessmentObjectiveAllocation`,
        `Guidance for ${entry.subquestionId} uses unavailable objective ${allocation.objectiveId}.`,
      ))
    }
  }

  return diagnostics
}

function diagnoseOverallObjectiveAllocation(candidate: Candidate, input: MarkingPackInput) {
  const diagnostics: MarkingPackDiagnostic[] = []
  if (input.assessmentItem.subquestions.length > 0) return diagnostics

  const allocation = candidate.overallAssessmentObjectiveAllocation ?? []
  const familyObjectives = input.questionFamily.assessmentObjectiveIds
  if (familyObjectives.length > 0 && !sameSet(familyObjectives, allocation.map((entry) => entry.objectiveId))) {
    diagnostics.push(diagnostic(
      'MARKING_OVERALL_AO_SET_MISMATCH',
      'overallAssessmentObjectiveAllocation',
      'Overall AO allocation must use exactly the Question Family assessment objectives for an unstructured item.',
    ))
  }
  const counts = countBy(allocation, (entry) => entry.objectiveId)
  for (const [objectiveId, count] of counts) {
    if (count > 1) diagnostics.push(diagnostic(
      'MARKING_OVERALL_AO_DUPLICATE',
      'overallAssessmentObjectiveAllocation',
      `Overall AO allocation repeats objective ${objectiveId}; each objective may appear at most once.`,
    ))
  }
  if (allocation.length > 0) {
    const total = allocation.reduce((sum, entry) => sum + entry.marks, 0)
    if (total !== input.assessmentItem.maxMark) diagnostics.push(diagnostic(
      'MARKING_OVERALL_AO_TOTAL_MISMATCH',
      'overallAssessmentObjectiveAllocation',
      `Overall AO allocation totals ${total}; expected ${input.assessmentItem.maxMark}.`,
    ))
  }
  return diagnostics
}

function diagnoseRubricGuidance(candidate: Candidate, input: MarkingPackInput) {
  const diagnostics: MarkingPackDiagnostic[] = []
  const scopes = rubricScopes(input)
  const scopeById = new Map(scopes.map((scope) => [scope.id, scope]))
  const counts = countBy(candidate.rubricGuidance, (entry) => entry.subquestionId)

  for (const scope of scopes) {
    const count = counts.get(scope.id) ?? 0
    if (count === 0) diagnostics.push(diagnostic(
      'MARKING_RUBRIC_SCOPE_MISSING',
      `rubricGuidance[${scope.id}]`,
      `Marking rubric is missing educational guidance for ${scope.id}.`,
    ))
    if (count > 1) diagnostics.push(diagnostic(
      'MARKING_RUBRIC_SCOPE_DUPLICATE',
      `rubricGuidance[${scope.id}]`,
      `Marking rubric supplies ${count} guidance entries for ${scope.id}; exactly one is required.`,
    ))
  }

  for (const entry of candidate.rubricGuidance) {
    const scope = scopeById.get(entry.subquestionId)
    if (!scope) {
      diagnostics.push(diagnostic(
        'MARKING_RUBRIC_SCOPE_UNKNOWN',
        `rubricGuidance[${entry.subquestionId}]`,
        `Marking rubric references unknown scope ${entry.subquestionId}.`,
      ))
      continue
    }
    if (entry.levels.length > scope.maxMark + 1) diagnostics.push(diagnostic(
      'MARKING_RUBRIC_TOO_MANY_LEVELS',
      `rubricGuidance[${entry.subquestionId}].levels`,
      `Rubric for ${entry.subquestionId} has ${entry.levels.length} levels but only ${scope.maxMark + 1} integer mark outcomes exist.`,
    ))

    const normalisedDescriptors = entry.levels.map((level) => level.descriptor.trim().toLowerCase())
    if (new Set(normalisedDescriptors).size !== normalisedDescriptors.length) diagnostics.push(diagnostic(
      'MARKING_RUBRIC_LEVELS_NOT_DISTINCT',
      `rubricGuidance[${entry.subquestionId}].levels`,
      `Rubric for ${entry.subquestionId} must use distinct educational quality descriptions.`,
    ))

    const descriptors = normalisedDescriptors.join(' ')
    if (scope.responseDemands.includes('calculation')) {
      if (!/(method|working|process)/.test(descriptors)) diagnostics.push(diagnostic(
        'MARKING_CALCULATION_METHOD_TREATMENT_MISSING',
        `rubricGuidance[${entry.subquestionId}].levels`,
        `Calculation rubric for ${entry.subquestionId} must explain method or working credit.`,
      ))
      if (!/(accuracy|answer|consequential|follow-through)/.test(descriptors)) diagnostics.push(diagnostic(
        'MARKING_CALCULATION_ACCURACY_TREATMENT_MISSING',
        `rubricGuidance[${entry.subquestionId}].levels`,
        `Calculation rubric for ${entry.subquestionId} must explain final-answer accuracy or consequential-error treatment.`,
      ))
    }
    if ((scope.responseDemands.includes('analysis') || scope.responseDemands.includes('evaluation')) && scope.maxMark >= 6 && entry.levels.length < 2) diagnostics.push(diagnostic(
      'MARKING_EXTENDED_RESPONSE_LEVELS_INSUFFICIENT',
      `rubricGuidance[${entry.subquestionId}].levels`,
      `Extended-response rubric for ${entry.subquestionId} must distinguish more than one quality level.`,
    ))
  }

  return diagnostics
}

function diagnoseFamilyDemandPreservation(candidate: Candidate, input: MarkingPackInput) {
  const diagnostics: MarkingPackDiagnostic[] = []
  if (input.questionFamily.applicationRequirements.length > 0 && candidate.applicationRequirements.length === 0) diagnostics.push(diagnostic(
    'MARKING_APPLICATION_DEMAND_DROPPED',
    'applicationRequirements',
    'Marking Pack must preserve the Question Family application demand.',
  ))
  if (input.questionFamily.analysisRequirements.length > 0 && candidate.analysisRequirements.length === 0) diagnostics.push(diagnostic(
    'MARKING_ANALYSIS_DEMAND_DROPPED',
    'analysisRequirements',
    'Marking Pack must preserve the Question Family analysis demand.',
  ))
  if (input.questionFamily.evaluationRequirements.length > 0 && candidate.evaluationRequirements.length === 0) diagnostics.push(diagnostic(
    'MARKING_EVALUATION_DEMAND_DROPPED',
    'evaluationRequirements',
    'Marking Pack must preserve the Question Family evaluation demand.',
  ))
  return diagnostics
}

/** Inspect the entire parseable candidate before any targeted repair is allowed. */
export function diagnoseMarkingPackV2Candidate(providerOutput: unknown, input: MarkingPackInput) {
  const candidate = parseCandidate(providerOutput, input)
  return [
    ...diagnoseStructuredGuidance(candidate, input),
    ...diagnoseOverallObjectiveAllocation(candidate, input),
    ...diagnoseRubricGuidance(candidate, input),
    ...diagnoseFamilyDemandPreservation(candidate, input),
  ]
}

function compiledSubquestionGuidance(candidate: Candidate, input: MarkingPackInput) {
  const maxMarks = new Map(input.assessmentItem.subquestions.map((subquestion) => [subquestion.id, subquestion.maxMark]))
  return candidate.subquestionGuidance.map((entry) => ({
    ...entry,
    maxMark: maxMarks.get(entry.subquestionId)!,
  }))
}

function deriveStructuredOverallObjectiveAllocation(candidate: Candidate, input: MarkingPackInput) {
  const totals = new Map<string, number>()
  for (const entry of candidate.subquestionGuidance) {
    for (const allocation of entry.assessmentObjectiveAllocation) {
      totals.set(allocation.objectiveId, (totals.get(allocation.objectiveId) ?? 0) + allocation.marks)
    }
  }
  return input.questionFamily.assessmentObjectiveIds.map((objectiveId) => ({
    objectiveId,
    marks: totals.get(objectiveId) ?? 0,
  }))
}

function compileRubric(candidate: Candidate, input: MarkingPackInput) {
  const guidance = new Map(candidate.rubricGuidance.map((entry) => [entry.subquestionId, entry]))
  return rubricScopes(input).flatMap((scope) => {
    const entry = guidance.get(scope.id)!
    const levelCount = entry.levels.length
    const outcomeCount = scope.maxMark + 1
    const baseWidth = Math.floor(outcomeCount / levelCount)
    const remainder = outcomeCount % levelCount
    let cursor = 0
    return entry.levels.map((level, index) => {
      const width = baseWidth + (index < remainder ? 1 : 0)
      const minMark = cursor
      const maxMark = cursor + width - 1
      cursor = maxMark + 1
      return {
        id: `${scope.id}-level-${index + 1}`,
        descriptor: level.descriptor,
        minMark,
        maxMark,
      }
    })
  })
}

/** Compile educational judgement into the final mechanically complete worker contract. */
export function compileMarkingPackV2Candidate(providerOutput: unknown, input: MarkingPackInput) {
  const candidate = parseCandidate(providerOutput, input)
  const diagnostics = diagnoseMarkingPackV2Candidate(candidate, input)
  if (diagnostics.length > 0) {
    throw new Error(diagnostics.map((entry) => `${entry.code} @ ${entry.path}: ${entry.message}`).join(' | '))
  }

  return markingPackWorkerOutputSchema.parse({
    assessmentObjectiveAllocation: input.assessmentItem.subquestions.length > 0
      ? deriveStructuredOverallObjectiveAllocation(candidate, input)
      : candidate.overallAssessmentObjectiveAllocation ?? [],
    subquestionGuidance: compiledSubquestionGuidance(candidate, input),
    rubric: compileRubric(candidate, input),
    applicationRequirements: candidate.applicationRequirements,
    analysisRequirements: candidate.analysisRequirements,
    evaluationRequirements: candidate.evaluationRequirements,
    validReasoningRoutes: candidate.validReasoningRoutes,
    indicativeContent: candidate.indicativeContent,
    misconceptions: candidate.misconceptions,
    diagnosticFeedbackRules: candidate.diagnosticFeedbackRules,
    improvementActions: candidate.improvementActions,
    ambiguityPolicy: candidate.ambiguityPolicy,
    confidencePolicy: candidate.confidencePolicy,
  })
}

function diagnosticText(diagnostics: MarkingPackDiagnostic[]) {
  return diagnostics
    .map((entry, index) => `${index + 1}. [${entry.code}] ${entry.path}: ${entry.message}`)
    .join('\n')
}

function rejectionText(rejections: CandidateRejection[]) {
  return rejections
    .map((rejection) => `candidate ${rejection.candidateNumber} ${rejection.stage}: ${rejection.details}`)
    .join(' | ')
}

function markingPackV2Instruction(input: MarkingPackInput) {
  const structured = input.assessmentItem.subquestions.length > 0
  return [
    'Create question-specific Revision marking guidance for the supplied Revision-owned assessment item.',
    'Return educational marking meaning only where the schema asks for it. Revision owns rubric IDs, numeric mark bands, subquestion maxMark values and other mechanically reconstructible structure.',
    structured
      ? 'Return exactly one subquestionGuidance and one rubricGuidance entry for every supplied subquestion. Do not return top-level aggregate AO arithmetic; Revision derives it from validated subquestion allocations.'
      : 'This item is unstructured. Do not invent subquestionGuidance. Use rubricGuidance scope id overall. Return overallAssessmentObjectiveAllocation only where the Question Family uses assessment objectives.',
    'Within each rubricGuidance entry, order levels from lowest/no-credit quality to highest quality. Choose only the number of educationally meaningful quality levels; Revision deterministically maps those ordered levels across available integer marks.',
    'Calculation guidance must explain method or working credit and final-answer accuracy or consequential/follow-through treatment.',
    'For extended analysis/evaluation worth at least six marks, distinguish more than one materially different quality level.',
    'Preserve all application, analysis and evaluation demands from the Question Family.',
    'Indicative content is non-exhaustive: include multiple valid reasoning routes and do not imply only listed answers can score.',
    'Do not invent examiner authority, official wording, anchors or human calibration.',
  ].join(' ')
}

function generationInstruction(input: MarkingPackInput, candidateNumber: number) {
  const instruction = markingPackV2Instruction(input)
  if (candidateNumber === 1) return instruction
  return [
    instruction,
    'FRESH MARKING PACK CANDIDATE RESAMPLE REQUIRED.',
    'A previous Marking Pack candidate for this exact accepted question was rejected within the bounded candidate-recovery process.',
    'Generate genuinely fresh marking guidance from the accepted question, Question Family and governed inputs. Do not patch, preserve or imitate the rejected candidate wording.',
    'The accepted assessment question is fixed and must not be rewritten or weakened to make marking guidance easier.',
  ].join('\n')
}

function repairInstruction(input: MarkingPackInput, diagnostics: MarkingPackDiagnostic[]) {
  return [
    markingPackV2Instruction(input),
    'TARGETED MARKING PACK REPAIR REQUIRED.',
    'The complete candidate was inspected as a whole and produced this complete deterministic defect set:',
    diagnosticText(diagnostics),
    'Return the complete corrected educational Marking Pack candidate. Preserve valid content and correct every listed defect in this one repair.',
    'Do not add rubric IDs, numeric mark bands, subquestion maxMark values or structured aggregate AO arithmetic; Revision owns those mechanical representations.',
  ].join('\n')
}

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
        contractVersion: MARKING_PACK_CONTRACT_VERSION,
        retryCount: (next.provenance.retryCount ?? 0) + retryIncrement,
      },
    }
  }
  return {
    ...next,
    provenance: {
      ...next.provenance,
      contractVersion: MARKING_PACK_CONTRACT_VERSION,
      retryCount: (accumulated.provenance.retryCount ?? 0) + (next.provenance.retryCount ?? 0) + retryIncrement,
      usageCost: (accumulated.provenance.usageCost ?? 0) + (next.provenance.usageCost ?? 0),
    },
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Marking Pack v2 compilation error'
}

function isRecoverableProviderContractFailure(execution: WorkerExecution<unknown>) {
  return execution.status === 'failure' && execution.error.startsWith('provider_contract_failure:')
}

function rejectedCandidate(
  rejections: CandidateRejection[],
  provenance: WorkerExecution<unknown>['provenance'],
): WorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `provider_contract_failure: marking_pack_v2_candidate_rejected: ${rejectionText(rejections)}`,
    provenance,
  }
}

function exhaustedCandidateRecovery(
  rejections: CandidateRejection[],
  provenance: WorkerExecution<unknown>['provenance'],
): WorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `provider_contract_failure: marking_pack_v2_candidate_recovery_exhausted: ${rejectionText(rejections)}`,
    provenance,
  }
}

export function createOpenAIModelAssistedWorkers(config: OpenAIContentFactoryAdapterConfig): OpenAIModelAssistedWorkers {
  const sharedConfig = withSharedProviderBudget(config)
  const workers = createBaseWorkers(sharedConfig)
  const client = new OpenAIStructuredWorkerClient(sharedConfig)

  return {
    ...workers,
    async generateMarkingPack(input) {
      const outputSchema = providerOutputSchema(input)
      const configuredMaxCandidates = input.maxCandidates ?? MAX_MARKING_PACK_CANDIDATES
      if (configuredMaxCandidates !== MAX_MARKING_PACK_CANDIDATES) {
        throw new Error(`Marking Pack recovery requires the governed ${MAX_MARKING_PACK_CANDIDATES}-candidate ceiling`)
      }
      if (input.candidateNumber !== undefined && (
        !Number.isInteger(input.candidateNumber)
        || input.candidateNumber < 1
        || input.candidateNumber > configuredMaxCandidates
      )) throw new Error('Marking Pack candidateNumber is outside the governed recovery ceiling')

      const singleCandidateMode = input.candidateNumber !== undefined
      const firstCandidateNumber = input.candidateNumber ?? 1
      const lastCandidateNumber = input.candidateNumber ?? configuredMaxCandidates
      let accumulatedExecution: WorkerExecution<unknown> | undefined
      const rejections: CandidateRejection[] = []

      for (let candidateNumber = firstCandidateNumber; candidateNumber <= lastCandidateNumber; candidateNumber += 1) {
        const generationExecution = appendExecution(
          accumulatedExecution,
          await client.run({
            workerId: candidateNumber === 1
              ? 'content-factory.marking-pack-v2'
              : 'content-factory.marking-pack-v2-resample',
            contractVersion: MARKING_PACK_CONTRACT_VERSION,
            routeKind: 'generation',
            outputSchema,
            strictOutput: true,
            instructions: generationInstruction(input, candidateNumber),
            payload: {
              ...input,
              candidateNumber,
              maxCandidates: configuredMaxCandidates,
            },
          }),
          candidateNumber === 1 ? 0 : 1,
        )
        accumulatedExecution = generationExecution
        if (generationExecution.status !== 'success') {
          if (!isRecoverableProviderContractFailure(generationExecution)) return generationExecution
          rejections.push({ candidateNumber, stage: 'provider_contract', details: generationExecution.error })
          if (singleCandidateMode) return rejectedCandidate(rejections, generationExecution.provenance)
          if (candidateNumber < lastCandidateNumber) continue
          return exhaustedCandidateRecovery(rejections, generationExecution.provenance)
        }

        const firstDiagnostics = diagnoseMarkingPackV2Candidate(generationExecution.output, input)
        if (firstDiagnostics.length === 0) {
          try {
            return { ...generationExecution, output: compileMarkingPackV2Candidate(generationExecution.output, input) }
          } catch (error) {
            rejections.push({ candidateNumber, stage: 'compilation', details: errorMessage(error) })
            if (singleCandidateMode) return rejectedCandidate(rejections, generationExecution.provenance)
            if (candidateNumber < lastCandidateNumber) continue
            return exhaustedCandidateRecovery(rejections, generationExecution.provenance)
          }
        }

        const repairExecution = appendExecution(
          generationExecution,
          await client.run({
            workerId: 'content-factory.marking-pack-v2-repair',
            contractVersion: MARKING_PACK_CONTRACT_VERSION,
            routeKind: 'generation',
            outputSchema,
            strictOutput: true,
            instructions: repairInstruction(input, firstDiagnostics),
            payload: {
              ...input,
              candidateNumber,
              maxCandidates: configuredMaxCandidates,
              previousCandidate: generationExecution.output,
              repairDiagnostics: firstDiagnostics,
            },
          }),
          1,
        )
        accumulatedExecution = repairExecution
        if (repairExecution.status !== 'success') {
          if (!isRecoverableProviderContractFailure(repairExecution)) return repairExecution
          rejections.push({ candidateNumber, stage: 'provider_contract', details: repairExecution.error })
          if (singleCandidateMode) return rejectedCandidate(rejections, repairExecution.provenance)
          if (candidateNumber < lastCandidateNumber) continue
          return exhaustedCandidateRecovery(rejections, repairExecution.provenance)
        }

        const repairDiagnostics = diagnoseMarkingPackV2Candidate(repairExecution.output, input)
        if (repairDiagnostics.length > 0) {
          rejections.push({
            candidateNumber,
            stage: 'diagnostics_after_repair',
            details: `initial=${diagnosticText(firstDiagnostics)}; repair=${diagnosticText(repairDiagnostics)}`,
          })
          if (singleCandidateMode) return rejectedCandidate(rejections, repairExecution.provenance)
          if (candidateNumber < lastCandidateNumber) continue
          return exhaustedCandidateRecovery(rejections, repairExecution.provenance)
        }

        try {
          return { ...repairExecution, output: compileMarkingPackV2Candidate(repairExecution.output, input) }
        } catch (error) {
          rejections.push({ candidateNumber, stage: 'compilation', details: errorMessage(error) })
          if (singleCandidateMode) return rejectedCandidate(rejections, repairExecution.provenance)
          if (candidateNumber < lastCandidateNumber) continue
          return exhaustedCandidateRecovery(rejections, repairExecution.provenance)
        }
      }

      throw new Error('Marking Pack candidate recovery loop exited without a result')
    },
  }
}
