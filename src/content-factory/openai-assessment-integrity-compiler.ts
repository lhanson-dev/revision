import {
  createOpenAIModelAssistedWorkers as createBlueprintHardenedWorkers,
} from './openai-learning-blueprint-compiler'
import {
  assessmentItemWorkerOutputSchema,
  markingPackWorkerOutputSchema,
} from './assessment-and-marking'
import {
  assessmentResponseDemandCommandContractText,
  validateStructuredAssessment,
  validateStructuredMarkingGuidance,
} from './assessment-integrity'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import type { WorkerExecution } from './intake-to-knowledge-model'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown assessment-integrity compilation error'
}

function withContractVersion(execution: WorkerExecution<unknown>, contractVersion: string): WorkerExecution<unknown> {
  return {
    ...execution,
    provenance: { ...execution.provenance, contractVersion },
  }
}

function withTargetedRepairAccounting(
  first: WorkerExecution<unknown>,
  repair: WorkerExecution<unknown>,
): WorkerExecution<unknown> {
  return {
    ...repair,
    provenance: {
      ...repair.provenance,
      contractVersion: '3',
      retryCount: (first.provenance.retryCount ?? 0) + (repair.provenance.retryCount ?? 0) + 1,
      usageCost: (first.provenance.usageCost ?? 0) + (repair.provenance.usageCost ?? 0),
    },
  }
}

const responseDemandCommandContract = assessmentResponseDemandCommandContractText()

const structuredAssessmentInstruction = [
  'Return a non-empty subquestions array that makes every individual mark-bearing task explicit.',
  'The subquestion maxMark values must sum exactly to the governed item maxMark.',
  'Across subquestions, requirementIds must cover every governed target requirement and no others.',
  'Each subquestion coverageEvidence entry must use an exact excerpt from that subquestion wording showing where the requirement is genuinely assessed.',
  'responseDemands must describe only what the command and wording actually ask the student to do; do not declare a demand merely because a student might use that skill while reaching the answer.',
  `For every responseDemand, the learner-facing command or wording must contain at least one compatible command term from this exact deterministic contract: ${responseDemandCommandContract}.`,
  'For a multiple-choice question that genuinely requires calculation, include both selection and calculation responseDemands and phrase the learner-facing task so the learner is explicitly asked to calculate, work out or determine the result before selecting the option; if the task only asks the learner to choose an answer, declare selection only.',
  'questionWording must contain each subquestion wording verbatim so the structured contract and learner-visible paper cannot drift apart.',
  'For every selection/MCQ subquestion provide exactly four distinct options A-D with exactly one correct answer; every incorrect option must include a distinct plausible misconceptionBasis explaining why a prepared learner might choose it.',
  'If deterministic validation reports a contract error, a single targeted repair may be requested; preserve valid content and correct only the reported contract mismatch.',
].join(' ')

const structuredMarkingInstruction = [
  'For every structured subquestion return exactly one subquestionGuidance entry.',
  'Preserve each subquestion maxMark exactly.',
  'rewardedDemands may only reward responseDemands explicitly requested by that subquestion.',
  'Each subquestion AO allocation must total that subquestion maxMark.',
  'For structured items, set the top-level assessmentObjectiveAllocation to an empty array. Revision derives the overall AO allocation deterministically by summing the validated subquestion allocations; do not duplicate that arithmetic.',
].join(' ')

function targetedAssessmentRepairInstruction(error: unknown) {
  return [
    'TARGETED CONTRACT REPAIR REQUIRED.',
    `The completed candidate failed deterministic assessment validation with this exact error: ${errorMessage(error)}`,
    'Return the complete corrected assessment item.',
    'Preserve all valid educational content, governed requirements, marks, context and question-family intent.',
    'Change only what is necessary to make the learner-facing wording, structured subquestions and responseDemands satisfy the deterministic contract.',
    'Do not remove a genuinely intended assessment demand merely to silence validation; instead make that intended demand explicit in the learner-facing command or wording.',
  ].join(' ')
}

function compileAssessmentItem(
  execution: Extract<Awaited<ReturnType<OpenAIModelAssistedWorkers['generateAssessmentItem']>>, { status: 'success' }>,
  policy: NonNullable<OpenAIContentFactoryAdapterConfig['assessmentItemPolicies']>[string],
) {
  const item = assessmentItemWorkerOutputSchema.parse(execution.output)
  if (item.subquestions.length === 0) throw new Error('governed assessment item returned no structured subquestions')
  validateStructuredAssessment({
    itemId: item.id,
    maxMark: policy.maxMark,
    governedRequirementIds: policy.requirementIds,
    subquestions: item.subquestions,
  })
  return item
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createBlueprintHardenedWorkers(config)

  return {
    ...workers,
    async generateAssessmentItem(input) {
      const policy = config.assessmentItemPolicies?.[input.questionFamily.id]
      const hardenedInput = policy ? {
        ...input,
        questionFamily: {
          ...input.questionFamily,
          responseShape: `${input.questionFamily.responseShape} ${structuredAssessmentInstruction}`,
        },
        assessmentBlueprint: {
          ...input.assessmentBlueprint,
          evidenceExpectations: [...input.assessmentBlueprint.evidenceExpectations, structuredAssessmentInstruction],
        },
      } : input
      const firstExecution = withContractVersion(await workers.generateAssessmentItem(hardenedInput), '3')
      if (firstExecution.status !== 'success' || !policy) return firstExecution

      try {
        const item = compileAssessmentItem(firstExecution, policy)
        return { ...firstExecution, output: item }
      } catch (firstError) {
        const repairInstruction = targetedAssessmentRepairInstruction(firstError)
        const repairInput = {
          ...hardenedInput,
          questionFamily: {
            ...hardenedInput.questionFamily,
            responseShape: `${hardenedInput.questionFamily.responseShape} ${repairInstruction}`,
          },
          assessmentBlueprint: {
            ...hardenedInput.assessmentBlueprint,
            evidenceExpectations: [...hardenedInput.assessmentBlueprint.evidenceExpectations, repairInstruction],
          },
        }
        const repairExecution = withTargetedRepairAccounting(
          firstExecution,
          await workers.generateAssessmentItem(repairInput),
        )
        if (repairExecution.status !== 'success') return repairExecution
        try {
          const repairedItem = compileAssessmentItem(repairExecution, policy)
          return { ...repairExecution, output: repairedItem }
        } catch (repairError) {
          return {
            status: 'failure',
            error: `provider_contract_failure: assessment_item_compilation_after_targeted_repair: initial=${errorMessage(firstError)}; repair=${errorMessage(repairError)}`,
            provenance: repairExecution.provenance,
          }
        }
      }
    },

    async generateMarkingPack(input) {
      const hasStructuredSubquestions = input.assessmentItem.subquestions.length > 0
      const hardenedInput = hasStructuredSubquestions ? {
        ...input,
        questionFamily: {
          ...input.questionFamily,
          responseShape: `${input.questionFamily.responseShape} ${structuredMarkingInstruction}`,
        },
        assessmentBlueprint: {
          ...input.assessmentBlueprint,
          evidenceExpectations: [...input.assessmentBlueprint.evidenceExpectations, structuredMarkingInstruction],
        },
      } : input
      const execution = withContractVersion(await workers.generateMarkingPack(hardenedInput), '3')
      if (execution.status !== 'success' || !hasStructuredSubquestions) return execution
      try {
        const pack = markingPackWorkerOutputSchema.parse(execution.output)
        if (pack.subquestionGuidance.length === 0) throw new Error('structured assessment returned no subquestion marking guidance')
        if (pack.assessmentObjectiveAllocation.length !== 0) {
          throw new Error('structured Marking Pack must leave overall AO allocation empty for deterministic derivation')
        }
        validateStructuredMarkingGuidance({
          itemId: input.assessmentItem.id,
          subquestions: input.assessmentItem.subquestions,
          guidance: pack.subquestionGuidance,
          allowedObjectiveIds: input.questionFamily.assessmentObjectiveIds,
          overallObjectiveAllocation: pack.assessmentObjectiveAllocation,
        })
        return { ...execution, output: pack }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: marking_pack_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
