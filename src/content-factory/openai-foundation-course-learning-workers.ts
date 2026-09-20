import { z } from 'zod'
import {
  foundationCourseLearningDesignSchema,
  type FoundationLearnTreatment,
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
  providerLearningTeachingPointEvidenceSchema,
  providerPracticeTeachingPointEvidenceSchema,
  resolveLearningCoverageEvidence,
  resolvePracticeCoverageEvidence,
  type ProviderLearningTeachingPointEvidence,
  type ProviderPracticeTeachingPointEvidence,
} from './provider-coverage-evidence'

const nonEmptyStringSchema = z.string().min(1)
const practiceModeValues = ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'] as const

type PracticeMode = typeof practiceModeValues[number]
type FoundationWorkUnit = ExecutableLearningWorkUnit & { learningDesign?: unknown }

const providerMisconceptionSchema = z.strictObject({
  misconception: nonEmptyStringSchema,
  correction: nonEmptyStringSchema,
})

const providerLearningSectionSchema = z.strictObject({
  title: nonEmptyStringSchema,
  explanation: nonEmptyStringSchema,
  keyPoints: z.array(nonEmptyStringSchema).min(1),
})

const providerWorkedExampleSchema = z.strictObject({
  title: nonEmptyStringSchema,
  setup: nonEmptyStringSchema,
  steps: z.array(nonEmptyStringSchema).min(1),
  conclusion: nonEmptyStringSchema,
})

const providerPracticeActivitySchema = z.strictObject({
  prompt: nonEmptyStringSchema,
  expectedResponse: nonEmptyStringSchema,
  explanation: nonEmptyStringSchema,
  improvementAction: nonEmptyStringSchema,
})

type ProviderPracticeActivity = z.infer<typeof providerPracticeActivitySchema>

type LearningTreatmentEvidence = {
  treatment: FoundationLearnTreatment
  location: z.infer<typeof providerLearningTeachingPointEvidenceSchema>['location']
}

type PracticeCapabilityEvidence = {
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

function learningProviderOutputSchema(
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const teachingPoint = exactEnum(requiredTeachingPoints, `Learning work unit ${unit.id} requiredTeachingPoints`)
  const treatment = exactEnum(design.learnTreatments, `Learning work unit ${unit.id} learnTreatments`)
  const base = z.strictObject({
    title: nonEmptyStringSchema,
    introduction: nonEmptyStringSchema,
    misconceptions: z.array(providerMisconceptionSchema),
    nextAction: nonEmptyStringSchema,
    coverageEvidence: z.array(providerLearningTeachingPointEvidenceSchema.extend({ teachingPoint }))
      .length(requiredTeachingPoints.length),
    treatmentEvidence: z.array(z.strictObject({
      treatment,
      location: providerLearningTeachingPointEvidenceSchema.shape.location,
    })).length(design.learnTreatments.length),
  })

  const explanation = unit.learningModes.includes('explanation')
  const workedExample = unit.learningModes.includes('worked_example')
  if (explanation && workedExample) {
    return base.extend({
      sections: z.array(providerLearningSectionSchema).min(1),
      workedExamples: z.array(providerWorkedExampleSchema).min(1),
    })
  }
  if (explanation) return base.extend({ sections: z.array(providerLearningSectionSchema).min(1) })
  if (workedExample) return base.extend({ workedExamples: z.array(providerWorkedExampleSchema).min(1) })
  throw new Error(`Foundation Learning Blueprint work unit ${unit.id} selected no Learn mode`)
}

function validateLearningTreatmentLocations(evidence: LearningTreatmentEvidence[]) {
  for (const entry of evidence) {
    if (entry.treatment === 'worked_example' && !entry.location.area.startsWith('worked_example_')) {
      throw new Error('worked_example treatment evidence must point to a worked-example field')
    }
    if (entry.treatment === 'misconception_repair' && entry.location.area !== 'misconception_correction') {
      throw new Error('misconception_repair treatment evidence must point to a misconception correction')
    }
  }
}

function normaliseLearningProviderOutput(
  output: unknown,
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const parsed = learningProviderOutputSchema(unit, requiredTeachingPoints).parse(output) as {
    title: string
    introduction: string
    misconceptions: Array<{ misconception: string; correction: string }>
    nextAction: string
    coverageEvidence: ProviderLearningTeachingPointEvidence[]
    treatmentEvidence: LearningTreatmentEvidence[]
    sections?: Array<{ title: string; explanation: string; keyPoints: string[] }>
    workedExamples?: Array<{ title: string; setup: string; steps: string[]; conclusion: string }>
  }

  exactStringSet(parsed.coverageEvidence.map((entry) => entry.teachingPoint), requiredTeachingPoints, 'Learning coverageEvidence')
  exactStringSet(parsed.treatmentEvidence.map((entry) => entry.treatment), design.learnTreatments, 'Learning treatmentEvidence')
  validateLearningTreatmentLocations(parsed.treatmentEvidence)

  // Resolve every declared treatment to an exact field in the generated content.
  // The independent asset reviewer still owns the semantic judgement about whether
  // that field genuinely satisfies the treatment rather than merely naming it.
  resolveLearningCoverageEvidence(
    parsed.treatmentEvidence.map((entry) => ({ teachingPoint: entry.treatment, location: entry.location })),
    parsed,
  )

  return learningCollateralWorkerOutputSchema.parse({
    title: parsed.title,
    introduction: parsed.introduction,
    sections: (parsed.sections ?? []).map((section, index) => ({
      id: `${unit.id}-section-${index + 1}`,
      ...section,
    })),
    workedExamples: (parsed.workedExamples ?? []).map((example, index) => ({
      id: `${unit.id}-worked-example-${index + 1}`,
      ...example,
    })),
    misconceptions: parsed.misconceptions,
    nextAction: parsed.nextAction,
    coverageEvidence: resolveLearningCoverageEvidence(parsed.coverageEvidence, parsed),
  })
}

function practiceProviderOutputSchema(
  unit: ExecutableLearningWorkUnit,
  requiredTeachingPoints: string[],
) {
  const design = requiredLearningDesign(unit)
  const selected = selectedPracticeModes(unit)
  if (selected.length === 0) throw new Error(`Foundation Practice work unit ${unit.id} selected no Practice mode`)
  const teachingPoint = exactEnum(requiredTeachingPoints, `Practice work unit ${unit.id} requiredTeachingPoints`)
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
      capability,
      location: providerPracticeTeachingPointEvidenceSchema.shape.location,
    })).length(design.practiceCapabilities.length),
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
  exactStringSet(parsed.capabilityEvidence.map((entry) => entry.capability), design.practiceCapabilities, 'Practice capabilityEvidence')

  for (const entry of parsed.capabilityEvidence) {
    const expectedMode = expectedPracticeMode(entry.capability, selected)
    if (entry.location.mode !== expectedMode) {
      throw new Error(`Blueprint capability ${entry.capability} must be exercised in ${expectedMode}, not ${entry.location.mode}`)
    }
  }

  // Resolve every capability to exact generated Practice content. Independent
  // review remains responsible for judging whether the task genuinely exercises
  // the capability at the required educational depth.
  resolvePracticeCoverageEvidence(
    parsed.capabilityEvidence.map((entry) => ({ teachingPoint: entry.capability, location: entry.location })),
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
  execution: Awaited<ReturnType<OpenAIStructuredWorkerClient['run']>>,
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
      const execution = await client.run({
        workerId: 'content-factory.learning-collateral',
        contractVersion: '5',
        routeKind: 'generation',
        outputSchema: learningProviderOutputSchema(input.workUnit, input.requiredTeachingPoints),
        strictOutput: true,
        instructions: [
          'Create substantial student Learn content for the exact work unit and supplied course identity.',
          `The deterministic Course Learning Blueprint requires these Learn treatments: ${design.learnTreatments.join(', ')}. Implement every treatment; do not silently substitute a generic explanation for a selected treatment.`,
          'Return treatmentEvidence exactly once for every required Learn treatment, pointing to the exact generated field where that treatment is implemented.',
          'For worked_example, treatmentEvidence must point to a worked-example field. For misconception_repair, it must point to the correction of a genuine plausible misconception.',
          'When purposeful_visual is selected, represent the relationship clearly in the text-only contract using a compact table, flow, matrix, labelled sequence or graph-style representation inside a section; do not claim that an image was rendered.',
          'When guided_example is selected, include a scaffolded or partially completed step/prompt that reduces support relative to the full worked example.',
          'When comparison, causal-chain, process, synoptic-link or self-explanation treatments are selected, make that thinking explicit rather than merely naming the concept.',
          'Explicitly teach every requiredTeachingPoint in learner content. coverageEvidence must contain every requiredTeachingPoint exactly once and point to an exact generated field.',
          'Use 1-based evidence indexes. Scalar introduction and next_action use itemIndex=1/detailIndex=1; section explanations use detailIndex=1; section key points use section itemIndex and key-point detailIndex; worked-example setup/conclusion use detailIndex=1; worked-example steps use the step detailIndex; misconception corrections use misconception itemIndex/detailIndex=1.',
          'Use only supplied structured facts. Keep contexts subject-authentic. Do not mention source URLs, protected awarding-body wording, official mark schemes or endorsement.',
        ].join(' '),
        payload: input,
      })
      return downgradeSuccess(execution, (output) => normaliseLearningProviderOutput(output, input.workUnit, input.requiredTeachingPoints))
    },

    async generatePracticeCollateral(input) {
      const design = requiredLearningDesign(input.workUnit)
      const selectedModes = selectedPracticeModes(input.workUnit)
      const capabilityModes = design.practiceCapabilities
        .map((capability) => `${capability}→${expectedPracticeMode(capability, selectedModes)}`)
        .join(', ')
      const execution = await client.run({
        workerId: 'content-factory.practice-collateral',
        contractVersion: '5',
        routeKind: 'generation',
        outputSchema: practiceProviderOutputSchema(input.workUnit, input.requiredTeachingPoints),
        strictOutput: true,
        instructions: [
          `Create active Practice only in these deterministic mode buckets: ${selectedModes.join(', ')}.`,
          `The Course Learning Blueprint requires these Practice capabilities and their owned modes: ${capabilityModes}.`,
          'Implement every required capability. Return capabilityEvidence exactly once per capability and point to the exact generated activity field where the learner genuinely has to perform it.',
          'retrieval must require recall; discrimination must require distinguishing alternatives; calculation must require doing a calculation from supplied values; interpretation must require interpreting a result/data rather than naming it; procedure_execution must require performing the method; construction must require constructing or completing the relevant representation/output; graph_data_interpretation must provide enough chart/graph/data information to interpret; contextual_application must use a materially different concrete context; reasoning_chain must require linked mechanism/consequence reasoning; compare_justify must require a supported comparison; framework_application must provide facts that require applying the framework; contextual_judgement must provide defined competing evidence and require a supported conditional judgement; misconception_diagnostic must discriminate a plausible error from the correct idea; mixed_synoptic_selection must require selecting relevant knowledge across connected material.',
          'Provide at least one useful activity in every supplied mode bucket. One well-designed activity may satisfy multiple compatible capabilities only when the capabilityEvidence locations genuinely demonstrate each one.',
          'Collectively exercise every requiredTeachingPoint. coverageEvidence must contain every requiredTeachingPoint exactly once and point to an exact prompt, expectedResponse, explanation or improvementAction.',
          'Each activity must include an answer expectation, explanation and specific improvement action. Use only supplied structured facts and subject-authentic contexts. Do not imitate protected exam questions.',
        ].join(' '),
        payload: input,
      })
      return downgradeSuccess(execution, (output) => normalisePracticeProviderOutput(output, input.workUnit, input.requiredTeachingPoints))
    },
  }
}
