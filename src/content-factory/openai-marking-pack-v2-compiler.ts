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

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

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

function combinedRepairExecution(first: WorkerExecution<unknown>, repair: WorkerExecution<unknown>): WorkerExecution<unknown> {
  return {
    ...repair,
    provenance: {
      ...repair.provenance,
      contractVersion: '4',
      retryCount: (first.provenance.retryCount ?? 0) + (repair.provenance.retryCount ?? 0) + 1,
      usageCost: (first.provenance.usageCost ?? 0) + (repair.provenance.usageCost ?? 0),
    },
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Marking Pack v2 compilation error'
}

export function createOpenAIModelAssistedWorkers(config: OpenAIContentFactoryAdapterConfig): OpenAIModelAssistedWorkers {
  const sharedConfig = withSharedProviderBudget(config)
  const workers = createBaseWorkers(sharedConfig)
  const client = new OpenAIStructuredWorkerClient(sharedConfig)

  return {
    ...workers,
    async generateMarkingPack(input) {
      const outputSchema = providerOutputSchema(input)
      const instruction = markingPackV2Instruction(input)
      const firstExecution = await client.run({
        workerId: 'content-factory.marking-pack-v2',
        contractVersion: '4',
        routeKind: 'generation',
        outputSchema,
        strictOutput: true,
        instructions: instruction,
        payload: input,
      })
      if (firstExecution.status !== 'success') return firstExecution

      const firstDiagnostics = diagnoseMarkingPackV2Candidate(firstExecution.output, input)
      if (firstDiagnostics.length === 0) {
        try {
          return { ...firstExecution, output: compileMarkingPackV2Candidate(firstExecution.output, input) }
        } catch (error) {
          return {
            status: 'failure',
            error: `provider_contract_failure: marking_pack_v2_compilation: ${errorMessage(error)}`,
            provenance: firstExecution.provenance,
          }
        }
      }

      const repairInstruction = [
        instruction,
        'TARGETED MARKING PACK REPAIR REQUIRED.',
        'The first complete candidate was inspected as a whole and produced this complete deterministic defect set:',
        diagnosticText(firstDiagnostics),
        'Return the complete corrected educational Marking Pack candidate. Preserve valid content and correct every listed defect in this one repair.',
        'Do not add rubric IDs, numeric mark bands, subquestion maxMark values or structured aggregate AO arithmetic; Revision owns those mechanical representations.',
      ].join('\n')

      const repairExecution = combinedRepairExecution(
        firstExecution,
        await client.run({
          workerId: 'content-factory.marking-pack-v2-repair',
          contractVersion: '4',
          routeKind: 'generation',
          outputSchema,
          strictOutput: true,
          instructions: repairInstruction,
          payload: {
            ...input,
            previousCandidate: firstExecution.output,
            repairDiagnostics: firstDiagnostics,
          },
        }),
      )
      if (repairExecution.status !== 'success') return repairExecution

      const repairDiagnostics = diagnoseMarkingPackV2Candidate(repairExecution.output, input)
      if (repairDiagnostics.length > 0) {
        return {
          status: 'failure',
          error: `provider_contract_failure: marking_pack_v2_after_complete_diagnostic_repair: initial=${diagnosticText(firstDiagnostics)}; repair=${diagnosticText(repairDiagnostics)}`,
          provenance: repairExecution.provenance,
        }
      }

      try {
        return { ...repairExecution, output: compileMarkingPackV2Candidate(repairExecution.output, input) }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: marking_pack_v2_compilation: ${errorMessage(error)}`,
          provenance: repairExecution.provenance,
        }
      }
    },
  }
}
