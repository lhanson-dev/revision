import { z } from 'zod'
import {
  foundationCourseLearningDesignSchema,
  type FoundationPracticeCapability,
} from './foundation-course-learning-blueprint'
import {
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
  type ExecutableLearningWorkUnit,
  type LearningPracticeWorkers,
} from './learning-and-practice'
import {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
} from './openai-provider-adapter'
import {
  providerPracticeEvidenceLocationGuidance,
  providerPracticeTeachingPointEvidenceSchema,
  resolvePracticeCoverageEvidence,
  type ProviderPracticeTeachingPointEvidence,
} from './provider-coverage-evidence'
import {
  enumerateFoundationLearningFields,
  providerFoundationLearningBindingGuidance,
  providerFoundationLearningBindingSchema,
  resolveFoundationLearningBoundEvidence,
  type FoundationLearningTreatmentObligation,
  type ProviderFoundationLearningContent,
} from './provider-foundation-learning-evidence'
import {
  foundationAtomicLearningEvidenceGuidance,
  foundationAtomicPracticeEvidenceGuidance,
} from './foundation-course-learning-atomic-obligations'

const nonEmptyStringSchema = z.string().min(1)
const practiceModeValues = ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'] as const

type PracticeMode = typeof practiceModeValues[number]
type FoundationWorkUnit = ExecutableLearningWorkUnit & { learningDesign?: unknown }
type ProviderExecution = Awaited<ReturnType<OpenAIStructuredWorkerClient['run']>>

type ProviderRunRecord = {
  status: ProviderExecution['status']
  error?: string
  id: string
  contextId: string
  contractVersion: string
  provider?: string
  model?: string
  retryCount?: number
  usageCost?: number
}

type ProviderRunAwareProvenance = ProviderExecution['provenance'] & {
  providerRuns?: ProviderRunRecord[]
}

const providerPracticeActivitySchema = z.strictObject({
  prompt: nonEmptyStringSchema,
  expectedResponse: nonEmptyStringSchema,
  explanation: nonEmptyStringSchema,
  improvementAction: nonEmptyStringSchema,
})

type ProviderPracticeActivity = z.infer<typeof providerPracticeActivitySchema>

type PracticeCapabilityEvidence = {
  nodeId: string
  capability: FoundationPracticeCapability
  location: z.infer<typeof providerPracticeTeachingPointEvidenceSchema>['location']
}

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function exactEnum(values: string[], label: string) {
  const uniqueValues = unique(values.map((value) => value.trim()).filter(Boolean))
  if (uniqueValues.length === 0) throw new Error(`${label} must contain at least one value`)
  return z.enum(uniqueValues as [string, ...string[]])
}

function requiredLearningDesign(unit: ExecutableLearningWorkUnit) {
  const parsed = foundationCourseLearningDesignSchema.safeParse((unit as FoundationWorkUnit).learningDesign)
  if (!parsed.success) {
    throw new Error(`Foundation Course Learning Blueprint v2 work unit ${unit.id} is missing valid learningDesign metadata`)
  }
  return parsed.data
}

function selectedPracticeModes(unit: ExecutableLearningWorkUnit): PracticeMode[] {
  return practiceModeValues.filter((mode) => unit.learningModes.includes(mode))
}

function exactStringSet(actual: string[], expected: string[], label: string) {
  const actualUnique = unique(actual)
  const expectedUnique = unique(expected)
  if (actualUnique.length !== actual.length) throw new Error(`${label} must not contain duplicate obligations`)
  const missing = expectedUnique.filter((value) => !actualUnique.includes(value))
  const unexpected = actualUnique.filter((value) => !expectedUnique.includes(value))
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(`${label} does not match the deterministic Blueprint; missing=${missing.join(', ') || 'none'} unexpected=${unexpected.join(', ') || 'none'}`)
  }
}

function practiceCapabilityObligationKey(nodeId: string, capability: string) {
  return `${nodeId}::${capability}`
}

function learningTreatmentObligations(
  design: z.infer<typeof foundationCourseLearningDesignSchema>,
): FoundationLearningTreatmentObligation[] {
  return design.nodes.flatMap((node) => node.learnTreatments.map((treatment) => ({
    nodeId: node.nodeId,
    treatment,
  })))
}

function expectedPracticeCapabilityObligations(design: z.infer<typeof foundationCourseLearningDesignSchema>) {
  return design.nodes.flatMap((node) => node.practiceCapabilities.map((capability) => (
    practiceCapabilityObligationKey(node.nodeId, capability)
  )))
}

function expectedPracticeMode(
  capability: FoundationPracticeCapability,
  selectedModes: PracticeMode[],
): PracticeMode {
  const requireMode = (mode: PracticeMode) => {
    if (!selectedModes.includes(mode)) {
      throw new Error(`Blueprint capability ${capability} requires missing practice mode ${mode}`)
    }
    return mode
  }

  switch (capability) {
    case 'retrieval':
    case 'misconception_diagnostic':
      return requireMode('retrieval')
    case 'calculation':
      return requireMode('quantitative')
    case 'discrimination':
    case 'short_constructed_response':
    case 'procedure_execution':
    case 'construction':
    case 'reasoning_chain':
    case 'compare_justify':
      return requireMode('short_answer')
    case 'graph_data_interpretation':
    case 'contextual_application':
    case 'framework_application':
    case 'contextual_judgement':
    case 'mixed_synoptic_selection':
      return requireMode('application')
    case 'interpretation':
      if (selectedModes.includes('quantitative')) return 'quantitative'
      if (selectedModes.includes('application')) return 'application'
      if (selectedModes.includes('short_answer')) return 'short_answer'
      return requireMode('retrieval')
  }
}

function learningContentProviderOutputSchema(unit: ExecutableLearningWorkUnit) {
  const misconception = z.strictObject({
    misconception: nonEmptyStringSchema,
    correction: nonEmptyStringSchema,
  })
  const section = z.strictObject({
    title: nonEmptyStringSchema,
    explanation: nonEmptyStringSchema,
    keyPoints: z.array(nonEmptyStringSchema).min(1),
  })
  const workedExample = z.strictObject({
    title: nonEmptyStringSchema,
    setup: nonEmptyStringSchema,
    steps: z.array(nonEmptyStringSchema).min(1),
    conclusion: nonEmptyStringSchema,
  })
  const base = z.strictObject({
    title: nonEmptyStringSchema,
    introduction: nonEmptyStringSchema,
    misconceptions: z.array(misconception),
    nextAction: nonEmptyStringSchema,
  })

  const explanation = unit.learningModes.includes('explanation')
  const hasWorkedExample = unit.learningModes.includes('worked_example')
  if (explanation && hasWorkedExample) {
    return base.extend({
      sections: z.array(section).min(1),
      workedExamples: z.array(workedExample).min(1),
    })
  }
  if (explanation) return base.extend({ sections: z.array(section).min(1) })
  if (hasWorkedExample) return base.extend({ workedExamples: z.array(workedExample).min(1) })
  throw new Error(`Foundation Learning Blueprint work unit ${unit.id} selected no Learn mode`)
}

function parsedLearningContent(output: unknown, unit: ExecutableLearningWorkUnit): ProviderFoundationLearningContent {
  return learningContentProviderOutputSchema(unit).parse(output) as ProviderFoundationLearningContent
}

function normaliseLearningProviderOutput(
  content: ProviderFoundationLearningContent,
  bindings: Record<string, string>,
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const resolved = resolveFoundationLearningBoundEvidence(
    content,
    bindings,
    requiredTeachingPoints,
    learningTreatmentObligations(design),
  )

  return learningCollateralWorkerOutputSchema.parse({
    title: resolved.content.title,
    introduction: resolved.content.introduction,
    sections: resolved.content.sections.map((section, index) => ({
      id: `${unit.id}-section-${index + 1}`,
      ...section,
    })),
    workedExamples: resolved.content.workedExamples.map((example, index) => ({
      id: `${unit.id}-worked-example-${index + 1}`,
      ...example,
    })),
    misconceptions: resolved.content.misconceptions,
    nextAction: resolved.content.nextAction,
    coverageEvidence: resolved.coverageEvidence,
  })
}

function providerRunRecord(execution: ProviderExecution, errorOverride?: string): ProviderRunRecord {
  return {
    status: errorOverride ? 'failure' : execution.status,
    ...(errorOverride ? { error: errorOverride } : ('error' in execution ? { error: execution.error } : {})),
    id: execution.provenance.id,
    contextId: execution.provenance.contextId,
    contractVersion: execution.provenance.contractVersion,
    provider: execution.provenance.provider,
    model: execution.provenance.model,
    retryCount: execution.provenance.retryCount,
    usageCost: execution.provenance.usageCost,
  }
}

function compositeLearningProvenance(
  executions: ProviderExecution[],
  records: ProviderRunRecord[],
): ProviderRunAwareProvenance {
  const first = executions[0]
  const usageCosts = executions
    .map((execution) => execution.provenance.usageCost)
    .filter((value): value is number => typeof value === 'number')
  const retryCounts = executions
    .map((execution) => execution.provenance.retryCount)
    .filter((value): value is number => typeof value === 'number')

  return {
    id: executions.map((execution) => execution.provenance.id).join('+'),
    contextId: first.provenance.contextId,
    contractVersion: '9',
    provider: first.provenance.provider,
    model: first.provenance.model,
    ...(retryCounts.length > 0 ? { retryCount: retryCounts.reduce((total, value) => total + value, 0) } : {}),
    ...(usageCosts.length > 0 ? { usageCost: Number(usageCosts.reduce((total, value) => total + value, 0).toFixed(8)) } : {}),
    providerRuns: records,
  }
}

function learningFailure(executions: ProviderExecution[], records: ProviderRunRecord[], error: string) {
  return {
    status: 'failure' as const,
    error: `provider_contract_failure: ${error}`,
    provenance: compositeLearningProvenance(executions, records) as ProviderExecution['provenance'],
  }
}

function practiceProviderOutputSchema(
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const selected = selectedPracticeModes(unit)
  if (selected.length === 0) throw new Error(`Foundation Practice work unit ${unit.id} selected no Practice mode`)
  const teachingPoint = exactEnum(requiredTeachingPoints, `Practice work unit ${unit.id} requiredTeachingPoints`)
  const nodeId = exactEnum(design.sourceNodeIds, `Practice work unit ${unit.id} sourceNodeIds`)
  const capability = exactEnum(design.practiceCapabilities, `Practice work unit ${unit.id} practiceCapabilities`)
  const activityShape: Record<string, z.ZodArray<typeof providerPracticeActivitySchema>> = {}
  for (const mode of selected) activityShape[mode] = z.array(providerPracticeActivitySchema).min(1)

  return z.strictObject({
    title: nonEmptyStringSchema,
    instructions: nonEmptyStringSchema,
    activitiesByMode: z.strictObject(activityShape),
    coverageEvidence: z.array(providerPracticeTeachingPointEvidenceSchema.extend({ teachingPoint }))
      .length(requiredTeachingPoints.length),
    capabilityEvidence: z.array(z.strictObject({
      nodeId,
      capability,
      location: providerPracticeTeachingPointEvidenceSchema.shape.location,
    })).length(expectedPracticeCapabilityObligations(design).length),
  })
}

function normalisePracticeProviderOutput(
  output: unknown,
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const selected = selectedPracticeModes(unit)
  const parsed = practiceProviderOutputSchema(unit, requiredTeachingPoints).parse(output) as {
    title: string
    instructions: string
    activitiesByMode: Record<string, ProviderPracticeActivity[]>
    coverageEvidence: ProviderPracticeTeachingPointEvidence[]
    capabilityEvidence: PracticeCapabilityEvidence[]
  }

  exactStringSet(parsed.coverageEvidence.map((entry) => entry.teachingPoint), requiredTeachingPoints, 'Practice coverageEvidence')
  exactStringSet(
    parsed.capabilityEvidence.map((entry) => practiceCapabilityObligationKey(entry.nodeId, entry.capability)),
    expectedPracticeCapabilityObligations(design),
    'Practice node capabilityEvidence',
  )

  for (const entry of parsed.capabilityEvidence) {
    const expectedMode = expectedPracticeMode(entry.capability, selected)
    if (entry.location.mode !== expectedMode) {
      throw new Error(`Blueprint capability ${entry.capability} for node ${entry.nodeId} must be exercised in ${expectedMode}, not ${entry.location.mode}`)
    }
  }

  resolvePracticeCoverageEvidence(
    parsed.capabilityEvidence.map((entry) => ({
      teachingPoint: practiceCapabilityObligationKey(entry.nodeId, entry.capability),
      location: entry.location,
    })),
    parsed,
  )

  const activities = selected.flatMap((mode) => (parsed.activitiesByMode[mode] ?? []).map((activity, index) => ({
    id: `${unit.id}-${mode}-${index + 1}`,
    mode,
    ...activity,
  })))

  return practiceCollateralWorkerOutputSchema.parse({
    title: parsed.title,
    instructions: parsed.instructions,
    activities,
    coverageEvidence: resolvePracticeCoverageEvidence(parsed.coverageEvidence, parsed),
  })
}

function downgradeSuccess(
  execution: ProviderExecution,
  normalise: (output: unknown) => unknown,
) {
  if (execution.status !== 'success') return execution
  try {
    return { ...execution, output: normalise(execution.output) }
  } catch (error) {
    return {
      status: 'failure' as const,
      error: `provider_contract_failure: ${error instanceof Error ? error.message : 'unknown Foundation learning contract error'}`,
      provenance: execution.provenance,
    }
  }
}

export function createOpenAIFoundationCourseLearningWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): Pick<LearningPracticeWorkers, 'generateLearningCollateral' | 'generatePracticeCollateral'> {
  const client = new OpenAIStructuredWorkerClient(config)

  return {
    async generateLearningCollateral(input) {
      const design = requiredLearningDesign(input.workUnit)
      const treatmentObligations = learningTreatmentObligations(design)
      const nodeTreatmentSummary = design.nodes
        .map((node) => `${node.nodeId}: ${node.learnTreatments.join(', ')}`)
        .join('; ')

      const contentExecution = await client.run({
        workerId: 'content-factory.learning-collateral',
        contractVersion: '9',
        routeKind: 'generation',
        outputSchema: learningContentProviderOutputSchema(input.workUnit),
        strictOutput: true,
        instructions: [
          'Create substantial student Learn content for the exact work unit and supplied course identity.',
          `The deterministic Course Learning Blueprint requires these node-level Learn treatments: ${nodeTreatmentSummary}. Implement every treatment for every named node; a treatment implemented for one node does not satisfy the same treatment on another node.`,
          'When purposeful_visual is selected, represent the relationship clearly in the text-only contract using a compact table, flow, matrix, labelled sequence or graph-style representation inside a section; do not claim that an image was rendered.',
          'When guided_example is selected, include a scaffolded or partially completed step/prompt that reduces support relative to the full worked example.',
          'When comparison, causal-chain, process, synoptic-link or self-explanation treatments are selected, make that thinking explicit rather than merely naming the concept.',
          'Explicitly teach every requiredTeachingPoint in learner content.',
          'Teach Course Truth summaries in section explanations or key points. Work explicit formulas or quantitative procedures through in worked-example fields. Put misconception repair in explicit misconception correction fields. Teach required application contexts and evidence demands in the learner content where they are actually explained or demonstrated.',
          'Do not include evidence IDs, field IDs, machine markers, numeric evidence pointers or copied evidence structures in learner-facing text. Evidence is bound in a separate second pass after this content is final.',
          'Use only supplied structured facts. Keep contexts subject-authentic. Do not mention source URLs, protected awarding-body wording, official mark schemes or endorsement.',
        ].join(' '),
        payload: input,
      })
      if (contentExecution.status !== 'success') return contentExecution

      let content: ProviderFoundationLearningContent
      let fields
      try {
        content = parsedLearningContent(contentExecution.output, input.workUnit)
        fields = enumerateFoundationLearningFields(content)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'invalid finalized Foundation Learn content'
        return learningFailure(
          [contentExecution],
          [providerRunRecord(contentExecution, `provider_contract_failure: ${message}`)],
          message,
        )
      }

      const bindingExecution = await client.run({
        workerId: 'content-factory.learning-evidence-binding',
        contractVersion: '9',
        routeKind: 'generation',
        outputSchema: providerFoundationLearningBindingSchema(content, input.requiredTeachingPoints, treatmentObligations),
        strictOutput: true,
        instructions: [
          providerFoundationLearningBindingGuidance(input.requiredTeachingPoints, treatmentObligations),
          foundationAtomicLearningEvidenceGuidance(),
          'For worked_example treatments, bind the treatment evidence ID to a worked-example field. For misconception_repair, bind the treatment evidence ID to a genuine misconception correction field.',
          'Do not alter the finalized learner content. Return only the required field-ID bindings.',
        ].join(' '),
        payload: {
          jobId: input.jobId,
          courseIdentity: input.courseIdentity,
          workUnitId: input.workUnit.id,
          learningDesign: design,
          requiredTeachingPoints: input.requiredTeachingPoints,
          treatmentObligations,
          fields,
        },
      })
      if (bindingExecution.status !== 'success') {
        return {
          status: bindingExecution.status,
          error: bindingExecution.error,
          provenance: compositeLearningProvenance(
            [contentExecution, bindingExecution],
            [providerRunRecord(contentExecution), providerRunRecord(bindingExecution)],
          ) as ProviderExecution['provenance'],
        }
      }

      try {
        const output = normaliseLearningProviderOutput(
          content,
          bindingExecution.output as Record<string, string>,
          input.workUnit,
          input.requiredTeachingPoints,
        )
        return {
          status: 'success' as const,
          output,
          provenance: compositeLearningProvenance(
            [contentExecution, bindingExecution],
            [providerRunRecord(contentExecution), providerRunRecord(bindingExecution)],
          ) as ProviderExecution['provenance'],
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown Foundation Learn evidence-binding contract error'
        return learningFailure(
          [contentExecution, bindingExecution],
          [
            providerRunRecord(contentExecution),
            providerRunRecord(bindingExecution, `provider_contract_failure: ${message}`),
          ],
          message,
        )
      }
    },

    async generatePracticeCollateral(input) {
      const design = requiredLearningDesign(input.workUnit)
      const selectedModes = selectedPracticeModes(input.workUnit)
      const capabilityModes = design.nodes
        .flatMap((node) => node.practiceCapabilities.map((capability) => (
          `${node.nodeId}:${capability}→${expectedPracticeMode(capability, selectedModes)}`
        )))
        .join(', ')
      const execution = await client.run({
        workerId: 'content-factory.practice-collateral',
        contractVersion: '5',
        routeKind: 'generation',
        outputSchema: practiceProviderOutputSchema(input.workUnit, input.requiredTeachingPoints),
        strictOutput: true,
        instructions: [
          `Create active Practice only in these deterministic mode buckets: ${selectedModes.join(', ')}.`,
          `The Course Learning Blueprint requires these node-level Practice capabilities and owned modes: ${capabilityModes}.`,
          'Implement every required capability for every named node. Return capabilityEvidence exactly once per nodeId+capability pair and point to the exact generated activity field where the learner genuinely has to perform it. A capability exercised for one node does not satisfy the same capability on another node.',
          'retrieval must require recall; discrimination must require distinguishing alternatives; calculation must require doing a calculation from supplied values; interpretation must require interpreting a result/data rather than naming it; procedure_execution must require performing the method; construction must require constructing or completing the relevant representation/output; graph_data_interpretation must provide enough chart/graph/data information to interpret; contextual_application must use a materially different concrete context; reasoning_chain must require linked mechanism/consequence reasoning; compare_justify must require a supported comparison; framework_application must provide facts that require applying the framework; contextual_judgement must provide defined competing evidence and require a supported conditional judgement; misconception_diagnostic must discriminate a plausible error from the correct idea; mixed_synoptic_selection must require selecting relevant knowledge across connected material.',
          'Provide at least one useful activity in every supplied mode bucket. One well-designed activity may satisfy multiple compatible node-level capabilities only when the capabilityEvidence locations genuinely demonstrate each one.',
          'Collectively exercise every requiredTeachingPoint. coverageEvidence must contain every requiredTeachingPoint exactly once. For non-atomic teaching points, evidence may point to an exact prompt, expectedResponse, explanation or improvementAction; atomic obligations follow the stricter rules below.',
          providerPracticeEvidenceLocationGuidance(),
          foundationAtomicPracticeEvidenceGuidance(input.requiredTeachingPoints),
          'Each activity must include an answer expectation, explanation and specific improvement action. Use only supplied structured facts and subject-authentic contexts. Do not imitate protected exam questions.',
        ].join(' '),
        payload: input,
      })
      return downgradeSuccess(execution, (output) => normalisePracticeProviderOutput(output, input.workUnit, input.requiredTeachingPoints))
    },
  }
}
