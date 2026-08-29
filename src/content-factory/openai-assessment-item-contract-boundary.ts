import { assessmentItemWorkerOutputSchema } from './assessment-and-marking'
import { assessmentSubquestionSchema } from './assessment-integrity'
import {
  createOpenAIModelAssistedWorkers as createBaseWorkers,
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import { withSharedProviderBudget } from './openai-shared-provider-budget'

/**
 * Assessment Item subquestion marks, requirement allocation and exact coverage
 * evidence carry educational meaning, so Revision must never invent them.
 *
 * The Q7 live soak showed that a provider can omit those fields before the
 * higher assessment-integrity compiler gets a chance to diagnose and perform
 * its single bounded targeted repair. This candidate schema therefore relaxes
 * only presence at the first provider boundary. All supplied values still have
 * their normal types, and the complete Assessment Item is parsed strictly by
 * the existing assessment-integrity compiler before it can be accepted.
 */
export const assessmentItemRepairCandidateSubquestionSchema = assessmentSubquestionSchema.partial({
  maxMark: true,
  requirementIds: true,
  coverageEvidence: true,
})

export const assessmentItemRepairCandidateProviderSchema = assessmentItemWorkerOutputSchema.omit({
  componentId: true,
  questionFamilyId: true,
  requirementIds: true,
  format: true,
  maxMark: true,
}).extend({
  subquestions: assessmentItemRepairCandidateSubquestionSchema.array().default([]),
})

const structuredSubquestionInstruction = [
  'For every subquestion, always return maxMark, requirementIds and coverageEvidence.',
  'Those fields carry educational meaning: Revision will not invent or default them.',
  'Each coverageEvidence entry must identify a governed requirementId and quote an exact excerpt from that subquestion wording that genuinely assesses it.',
  'If any of these fields are omitted, the candidate may be sent through at most one deterministic targeted repair before strict acceptance.',
].join(' ')

function assessmentInstruction() {
  return [
    'Create one original Revision-owned exam-style assessment item for the exact target component and Question Family.',
    'Never reproduce or closely mimic a known past-paper question.',
    'Use the supplied targetPolicy requirementIds, maxMark and format to shape the item, but do not return those governed top-level target fields; Revision injects them deterministically after provider candidate parsing.',
    'Use only supplied knowledgeNodeIds.',
    'When context or stimulus is required, make it original, subject-authentic and internally consistent with supplied structured data.',
    structuredSubquestionInstruction,
  ].join(' ')
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

      const execution = await client.run({
        workerId: 'content-factory.assessment-item',
        contractVersion: '2',
        routeKind: 'generation',
        outputSchema: assessmentItemRepairCandidateProviderSchema,
        strictOutput: false,
        instructions: assessmentInstruction(),
        payload: { ...input, targetPolicy: policy },
      })
      if (execution.status !== 'success') return execution

      return {
        ...execution,
        output: {
          ...(execution.output as Record<string, unknown>),
          componentId: input.targetComponentId,
          questionFamilyId: input.questionFamily.id,
          requirementIds: policy.requirementIds,
          maxMark: policy.maxMark,
          format: policy.format,
        },
      }
    },
  }
}

export {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
  type OpenAIModelRoute,
} from './openai-provider-adapter'
