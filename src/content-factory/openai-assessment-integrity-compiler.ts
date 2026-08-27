import {
  createOpenAIModelAssistedWorkers as createBlueprintHardenedWorkers,
} from './openai-learning-blueprint-compiler'
import {
  assessmentItemWorkerOutputSchema,
  markingPackWorkerOutputSchema,
} from './assessment-and-marking'
import {
  validateStructuredAssessment,
  validateStructuredMarkingGuidance,
} from './assessment-integrity'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown assessment-integrity compilation error'
}

function contractFailure(
  execution: Extract<Awaited<ReturnType<OpenAIModelAssistedWorkers['generateAssessmentItem']>>, { status: 'success' }>,
  stage: string,
  error: unknown,
) {
  return {
    status: 'failure' as const,
    error: `provider_contract_failure: ${stage}: ${errorMessage(error)}`,
    provenance: execution.provenance,
  }
}

const structuredAssessmentInstruction = [
  'Return a non-empty subquestions array that makes every individual mark-bearing task explicit.',
  'The subquestion maxMark values must sum exactly to the governed item maxMark.',
  'Across subquestions, requirementIds must cover every governed target requirement and no others.',
  'Each subquestion coverageEvidence entry must use an exact excerpt from that subquestion wording showing where the requirement is genuinely assessed.',
  'responseDemands must describe only what the command and wording actually ask the student to do; a calculate-only task must not claim interpretation, analysis or evaluation demand.',
  'questionWording must contain each subquestion wording verbatim so the structured contract and learner-visible paper cannot drift apart.',
  'For every selection/MCQ subquestion provide exactly four distinct options A-D with exactly one correct answer; every incorrect option must include a distinct plausible misconceptionBasis explaining why a prepared learner might choose it.',
].join(' ')

const structuredMarkingInstruction = [
  'For every structured subquestion return exactly one subquestionGuidance entry.',
  'Preserve each subquestion maxMark exactly.',
  'rewardedDemands may only reward responseDemands explicitly requested by that subquestion.',
  'Each subquestion AO allocation must total that subquestion maxMark, and the summed subquestion allocations must equal the overall AO allocation.',
].join(' ')

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
      const execution = await workers.generateAssessmentItem(hardenedInput)
      if (execution.status !== 'success' || !policy) return execution
      try {
        const item = assessmentItemWorkerOutputSchema.parse(execution.output)
        if (item.subquestions.length === 0) throw new Error('governed assessment item returned no structured subquestions')
        validateStructuredAssessment({
          itemId: item.id,
          maxMark: policy.maxMark,
          governedRequirementIds: policy.requirementIds,
          subquestions: item.subquestions,
        })
        return { ...execution, output: item }
      } catch (error) {
        return contractFailure(execution, 'assessment_item_compilation', error)
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
      const execution = await workers.generateMarkingPack(hardenedInput)
      if (execution.status !== 'success' || !hasStructuredSubquestions) return execution
      try {
        const pack = markingPackWorkerOutputSchema.parse(execution.output)
        if (pack.subquestionGuidance.length === 0) throw new Error('structured assessment returned no subquestion marking guidance')
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
