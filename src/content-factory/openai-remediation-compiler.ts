import {
  remediationWorkerOutputSchema,
  type AssuranceAndRemediationWorkers,
} from './assurance-and-remediation'
import {
  assessmentItemArtifactSchema,
  executableMarkingPackSchema,
  type AssessmentItemArtifact,
} from './assessment-and-marking'
import { learningPracticeArtifactSchema } from './learning-and-practice'
import {
  createOpenAIModelAssistedWorkers as createIndependentReviewHardenedWorkers,
} from './openai-independent-review-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

type RemediationInput = Parameters<AssuranceAndRemediationWorkers['remediate']>[0]
type RemediationOutput = ReturnType<typeof remediationWorkerOutputSchema.parse>

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown remediation compilation error'
}

function stableMetadataEqual(left: unknown[], right: unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function assertExactFindingResolution(output: RemediationOutput, input: RemediationInput) {
  const expected = input.findings.map((finding) => finding.id).sort()
  const actual = [...output.resolvedFindingIds].sort()
  if (new Set(actual).size !== actual.length) {
    throw new Error('Remediation resolvedFindingIds must not contain duplicates')
  }
  if (!arraysEqual(expected, actual)) {
    throw new Error('Remediation must resolve exactly the findings assigned to the governed target')
  }
}

function validateLearningPracticeTarget(input: RemediationInput, output: RemediationOutput) {
  if (input.target.kind !== 'learning' && input.target.kind !== 'practice') return undefined
  if (output.correctedDependentMarkingPack !== undefined) {
    throw new Error(`Remediation for ${input.target.kind} may not return a dependent Marking Pack`)
  }

  const before = learningPracticeArtifactSchema.parse(input.target.artifact)
  const after = learningPracticeArtifactSchema.parse(output.correctedArtifact)
  const stableBefore = [
    before.schemaVersion,
    before.artifactType,
    before.jobId,
    before.workUnitId,
    before.knowledgeModelFingerprint,
    before.knowledgeNodeIds,
    before.sourceRefs,
  ]
  const stableAfter = [
    after.schemaVersion,
    after.artifactType,
    after.jobId,
    after.workUnitId,
    after.knowledgeModelFingerprint,
    after.knowledgeNodeIds,
    after.sourceRefs,
  ]
  if (!stableMetadataEqual(stableBefore, stableAfter)) {
    throw new Error(`Remediation may not expand or change governed target identity/provenance for ${before.workUnitId}`)
  }
  return output
}

function validateMarkingPackTarget(input: RemediationInput, output: RemediationOutput) {
  if (input.target.kind !== 'marking_pack') return undefined
  if (output.correctedDependentMarkingPack !== undefined) {
    throw new Error('Marking Pack remediation may not return an additional dependent Marking Pack')
  }

  const before = executableMarkingPackSchema.parse(input.target.artifact)
  const after = executableMarkingPackSchema.parse(output.correctedArtifact)
  const stableBefore = [
    before.schemaVersion,
    before.id,
    before.questionId,
    before.questionVersion,
    before.exactQuestionWording,
    before.contextRef,
    before.maxMark,
    before.conceptIds,
    before.questionFamilyId,
    before.assessmentBlueprintFingerprint,
    before.sourceRefs,
    before.questionOrigin,
    before.indicativeContentPolicy,
    before.calibrationStatus,
  ]
  const stableAfter = [
    after.schemaVersion,
    after.id,
    after.questionId,
    after.questionVersion,
    after.exactQuestionWording,
    after.contextRef,
    after.maxMark,
    after.conceptIds,
    after.questionFamilyId,
    after.assessmentBlueprintFingerprint,
    after.sourceRefs,
    after.questionOrigin,
    after.indicativeContentPolicy,
    after.calibrationStatus,
  ]
  if (!stableMetadataEqual(stableBefore, stableAfter)) {
    throw new Error(`Marking Pack remediation may not expand or change governed question identity/provenance for ${before.questionId}`)
  }
  if (after.calibrationStatus === 'not_calibrated' && after.anchors.some((anchor) => anchor.calibrationStatus === 'expert_calibrated')) {
    throw new Error(`Marking Pack remediation may not invent expert calibration for ${before.questionId}`)
  }
  return output
}

function validateDependentPackForCorrectedItem(
  packInput: unknown,
  item: AssessmentItemArtifact,
  originalPackInput: unknown,
) {
  const original = executableMarkingPackSchema.parse(originalPackInput)
  const pack = executableMarkingPackSchema.parse(packInput)
  if (
    pack.id !== original.id
    || pack.questionId !== item.id
    || pack.questionVersion !== item.version
    || pack.exactQuestionWording !== item.questionWording
    || pack.maxMark !== item.maxMark
    || pack.questionFamilyId !== item.questionFamilyId
    || pack.assessmentBlueprintFingerprint !== item.assessmentBlueprintFingerprint
    || pack.questionOrigin !== 'revision_owned'
    || pack.indicativeContentPolicy !== 'non_exhaustive'
  ) {
    throw new Error(`Dependent Marking Pack remediation does not match corrected assessment item ${item.id}`)
  }
  if (pack.calibrationStatus !== original.calibrationStatus) {
    throw new Error(`Dependent Marking Pack remediation may not change calibration status for ${item.id}`)
  }
  if (pack.calibrationStatus === 'not_calibrated' && pack.anchors.some((anchor) => anchor.calibrationStatus === 'expert_calibrated')) {
    throw new Error(`Dependent Marking Pack remediation may not invent expert calibration for ${item.id}`)
  }
  if (!arraysEqual(pack.sourceRefs, item.sourceRefs)) {
    throw new Error(`Dependent Marking Pack source references do not match corrected assessment item ${item.id}`)
  }
}

function validateAssessmentItemTarget(input: RemediationInput, output: RemediationOutput) {
  if (input.target.kind !== 'assessment_item') return undefined

  const before = assessmentItemArtifactSchema.parse(input.target.artifact)
  const after = assessmentItemArtifactSchema.parse(output.correctedArtifact)
  const stableBefore = [
    before.schemaVersion,
    before.artifactType,
    before.jobId,
    before.id,
    before.version,
    before.componentId,
    before.questionFamilyId,
    before.requirementIds,
    before.knowledgeNodeIds,
    before.origin,
    before.presentationLabel,
    before.assessmentBlueprintFingerprint,
    before.knowledgeModelFingerprint,
    before.sourceRefs,
  ]
  const stableAfter = [
    after.schemaVersion,
    after.artifactType,
    after.jobId,
    after.id,
    after.version,
    after.componentId,
    after.questionFamilyId,
    after.requirementIds,
    after.knowledgeNodeIds,
    after.origin,
    after.presentationLabel,
    after.assessmentBlueprintFingerprint,
    after.knowledgeModelFingerprint,
    after.sourceRefs,
  ]
  if (!stableMetadataEqual(stableBefore, stableAfter)) {
    throw new Error(`Assessment remediation may not expand or change governed identity/provenance for ${before.id}`)
  }
  if (output.correctedDependentMarkingPack === undefined) {
    throw new Error(`Assessment-item remediation for ${after.id} must also return the exact dependent Marking Pack scope`)
  }
  validateDependentPackForCorrectedItem(
    output.correctedDependentMarkingPack,
    after,
    input.target.dependentMarkingPack,
  )
  return output
}

export function compileProviderRemediation(
  providerOutput: unknown,
  input: RemediationInput,
): RemediationOutput {
  const output = remediationWorkerOutputSchema.parse(providerOutput)
  assertExactFindingResolution(output, input)

  const validated = validateLearningPracticeTarget(input, output)
    ?? validateMarkingPackTarget(input, output)
    ?? validateAssessmentItemTarget(input, output)
  if (!validated) {
    throw new Error(`Unsupported remediation target kind: ${(input.target as { kind?: unknown }).kind ?? 'unknown'}`)
  }
  return output
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createIndependentReviewHardenedWorkers(config)

  return {
    ...workers,
    async remediate(input) {
      const execution = await workers.remediate(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: compileProviderRemediation(execution.output, input),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: remediation_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
