import {
  independentReviewFindingSchema,
  type AssuranceAndRemediationWorkers,
} from './assurance-and-remediation'
import {
  createOpenAIModelAssistedWorkers as createQuestionFamilyHardenedWorkers,
} from './openai-question-family-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

type IndependentReviewInput = Parameters<AssuranceAndRemediationWorkers['independentReview']>[0]
type IndependentReviewOutput = {
  reviewedCommit: string
  contentFingerprint: string
  decision: 'pass' | 'conditional_pass' | 'fail_hold'
  findings: Array<ReturnType<typeof independentReviewFindingSchema.parse>>
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown independent-review compilation error'
}

function assertNoDuplicates(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function knownArtifactRefs(
  input: IndependentReviewInput,
  resolver?: (value: unknown) => string | undefined,
) {
  const refs = new Set<string>()
  if (!resolver) return refs
  const add = (value: unknown) => {
    const ref = resolver(value)
    if (ref) refs.add(ref)
  }

  add(input.boardAlignment)
  add(input.coverageMap)
  add(input.courseKnowledgeModel)
  add(input.learningBlueprint)
  add(input.assessmentBlueprint)
  input.questionFamilies.forEach(add)
  input.learningArtifacts.forEach(add)
  input.practiceArtifacts.forEach(add)
  input.assessmentItems.forEach(add)
  input.markingPacks.forEach(add)
  return refs
}

export function compileProviderIndependentReview(
  providerOutput: unknown,
  input: IndependentReviewInput,
  resolver?: (value: unknown) => string | undefined,
): IndependentReviewOutput {
  if (typeof providerOutput !== 'object' || providerOutput === null) {
    throw new Error('Independent review output must be an object')
  }

  const output = providerOutput as Partial<IndependentReviewOutput>
  if (output.reviewedCommit !== input.reviewedCommit) {
    throw new Error('Independent review commit does not match governed compiler input')
  }
  if (output.contentFingerprint !== input.contentFingerprint) {
    throw new Error('Independent review content fingerprint does not match governed compiler input')
  }
  if (!['pass', 'conditional_pass', 'fail_hold'].includes(String(output.decision))) {
    throw new Error('Independent review decision is invalid')
  }
  if (!Array.isArray(output.findings)) {
    throw new Error('Independent review findings are required')
  }

  const findings = output.findings.map((finding) => independentReviewFindingSchema.parse(finding))
  assertNoDuplicates(findings.map((finding) => finding.id), 'independent-review finding id')

  const artifactRefs = knownArtifactRefs(input, resolver)
  for (const finding of findings) {
    if (!artifactRefs.has(finding.artifactRef)) {
      throw new Error(`Independent review finding ${finding.id} references unknown artifact ${finding.artifactRef}`)
    }
  }

  const blockingOrMaterial = findings.some((finding) =>
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity),
  )
  const minor = findings.some((finding) => finding.resolutionStatus === 'open' && finding.severity === 'minor')
  if (blockingOrMaterial && output.decision !== 'fail_hold') {
    throw new Error('Blocking/material independent-review findings require fail_hold')
  }
  if (!blockingOrMaterial && output.decision === 'fail_hold') {
    throw new Error('Independent-review fail_hold requires a blocking/material finding')
  }
  if (minor && output.decision === 'pass') {
    throw new Error('Open minor independent-review findings require conditional_pass')
  }

  return {
    reviewedCommit: output.reviewedCommit,
    contentFingerprint: output.contentFingerprint,
    decision: output.decision as IndependentReviewOutput['decision'],
    findings,
  }
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createQuestionFamilyHardenedWorkers(config)

  return {
    ...workers,
    async independentReview(input) {
      const execution = await workers.independentReview(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: compileProviderIndependentReview(execution.output, input, config.resolveArtifactRef),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: independent_review_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
