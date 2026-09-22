import { z } from 'zod'
import { validateFoundationAtomicLearningEvidenceLocations } from './foundation-course-learning-atomic-obligations'
import type { FoundationLearnTreatment } from './foundation-course-learning-blueprint'
import type { ProviderLearningTeachingPointEvidence } from './provider-coverage-evidence'

const nonEmptyStringSchema = z.string().min(1)

export type FoundationLearningEvidenceArea =
  | 'introduction'
  | 'section_explanation'
  | 'section_key_point'
  | 'worked_example_setup'
  | 'worked_example_step'
  | 'worked_example_conclusion'
  | 'misconception_correction'
  | 'next_action'

export type FoundationLearningTreatmentObligation = {
  nodeId: string
  treatment: FoundationLearnTreatment
}

export type ProviderFoundationLearningEvidenceField = {
  text: string
  evidenceIds: string[]
}

type ProviderFoundationLearningContent = {
  title: string
  introduction: ProviderFoundationLearningEvidenceField
  sections?: Array<{
    title: string
    explanation: ProviderFoundationLearningEvidenceField
    keyPoints: ProviderFoundationLearningEvidenceField[]
  }>
  workedExamples?: Array<{
    title: string
    setup: ProviderFoundationLearningEvidenceField
    steps: ProviderFoundationLearningEvidenceField[]
    conclusion: ProviderFoundationLearningEvidenceField
  }>
  misconceptions: Array<{
    misconception: string
    correction: ProviderFoundationLearningEvidenceField
  }>
  nextAction: ProviderFoundationLearningEvidenceField
}

type EvidenceDefinition = {
  id: string
  kind: 'coverage' | 'treatment'
  teachingPoint?: string
  nodeId?: string
  treatment?: FoundationLearnTreatment
}

type EvidenceOccurrence = EvidenceDefinition & {
  area: FoundationLearningEvidenceArea
  evidence: string
}

function coverageEvidenceId(index: number) {
  return `coverage_${index + 1}`
}

function treatmentEvidenceId(index: number) {
  return `treatment_${index + 1}`
}

function evidenceDefinitions(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  return [
    ...requiredTeachingPoints.map((teachingPoint, index): EvidenceDefinition => ({
      id: coverageEvidenceId(index),
      kind: 'coverage',
      teachingPoint,
    })),
    ...treatmentObligations.map((obligation, index): EvidenceDefinition => ({
      id: treatmentEvidenceId(index),
      kind: 'treatment',
      nodeId: obligation.nodeId,
      treatment: obligation.treatment,
    })),
  ]
}

function exactEvidenceIdSchema(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const ids = evidenceDefinitions(requiredTeachingPoints, treatmentObligations).map((definition) => definition.id)
  if (ids.length === 0) throw new Error('Foundation Learn evidence contract requires at least one obligation')
  return z.enum(ids as [string, ...string[]])
}

export function providerFoundationLearningEvidenceFieldSchema(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  return z.strictObject({
    text: nonEmptyStringSchema,
    evidenceIds: z.array(exactEvidenceIdSchema(requiredTeachingPoints, treatmentObligations)),
  })
}

export function providerFoundationLearningTypedEvidenceGuidance(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const coverage = requiredTeachingPoints
    .map((teachingPoint, index) => `${coverageEvidenceId(index)} = ${teachingPoint}`)
    .join('; ')
  const treatments = treatmentObligations
    .map((obligation, index) => `${treatmentEvidenceId(index)} = ${obligation.nodeId}::${obligation.treatment}`)
    .join('; ')

  return [
    'Learn evidence is typed metadata owned by each generated learner-content field.',
    'Every learner-content field object has text plus evidenceIds. Write only learner-facing prose in text. Put each supplied evidence ID exactly once in the evidenceIds array of the exact field whose text genuinely proves that obligation. Use an empty evidenceIds array when a field proves no supplied obligation. A field may own more than one compatible evidence ID when its text genuinely proves each one.',
    'Do not put evidence IDs, machine markers, indexes, copied evidence text or positional references inside learner-facing text. Do not invent evidence IDs. The schema restricts evidenceIds to the supplied identifiers and the resolver fails closed unless every supplied identifier is owned exactly once.',
    `Coverage evidence IDs: ${coverage}.`,
    `Treatment evidence IDs: ${treatments}.`,
  ].join(' ')
}

function field(
  area: FoundationLearningEvidenceArea,
  value: ProviderFoundationLearningEvidenceField,
  definitionsById: Map<string, EvidenceDefinition>,
  occurrences: EvidenceOccurrence[],
) {
  const evidence = value.text.trim()
  if (!evidence) throw new Error(`Learn field ${area} is empty`)
  if (evidence.includes('[[REV-')) {
    throw new Error(`Learn field ${area} contains legacy inline evidence marker text`)
  }

  for (const id of value.evidenceIds) {
    const definition = definitionsById.get(id)
    if (!definition) throw new Error(`Unexpected Learn evidence ID ${id}`)
    occurrences.push({ ...definition, area, evidence })
  }

  return evidence
}

function validateCoveragePlacement(occurrences: EvidenceOccurrence[]) {
  const evidence = occurrences
    .filter((occurrence) => occurrence.kind === 'coverage')
    .map((occurrence) => ({
      teachingPoint: occurrence.teachingPoint!,
      location: {
        area: occurrence.area,
        itemIndex: 1,
        detailIndex: 1,
      },
    }))
  validateFoundationAtomicLearningEvidenceLocations(evidence as ProviderLearningTeachingPointEvidence[])
}

function validateTreatmentPlacement(occurrences: EvidenceOccurrence[]) {
  for (const occurrence of occurrences.filter((entry) => entry.kind === 'treatment')) {
    if (occurrence.treatment === 'worked_example' && !occurrence.area.startsWith('worked_example_')) {
      throw new Error('worked_example treatment evidence must point to a worked-example field')
    }
    if (occurrence.treatment === 'misconception_repair' && occurrence.area !== 'misconception_correction') {
      throw new Error('misconception_repair treatment evidence must point to a misconception correction')
    }
  }
}

export function resolveFoundationLearningTypedEvidence(
  content: ProviderFoundationLearningContent,
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const definitions = evidenceDefinitions(requiredTeachingPoints, treatmentObligations)
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]))
  const occurrences: EvidenceOccurrence[] = []

  const cleaned = {
    title: content.title,
    introduction: field('introduction', content.introduction, definitionsById, occurrences),
    sections: (content.sections ?? []).map((section) => ({
      title: section.title,
      explanation: field('section_explanation', section.explanation, definitionsById, occurrences),
      keyPoints: section.keyPoints.map((keyPoint) => (
        field('section_key_point', keyPoint, definitionsById, occurrences)
      )),
    })),
    workedExamples: (content.workedExamples ?? []).map((example) => ({
      title: example.title,
      setup: field('worked_example_setup', example.setup, definitionsById, occurrences),
      steps: example.steps.map((step) => (
        field('worked_example_step', step, definitionsById, occurrences)
      )),
      conclusion: field('worked_example_conclusion', example.conclusion, definitionsById, occurrences),
    })),
    misconceptions: content.misconceptions.map((misconception) => ({
      misconception: misconception.misconception,
      correction: field('misconception_correction', misconception.correction, definitionsById, occurrences),
    })),
    nextAction: field('next_action', content.nextAction, definitionsById, occurrences),
  }

  for (const definition of definitions) {
    const matches = occurrences.filter((occurrence) => occurrence.id === definition.id)
    if (matches.length === 0) throw new Error(`Missing Learn evidence ID ${definition.id}`)
    if (matches.length > 1) throw new Error(`Learn evidence ID ${definition.id} must be owned exactly once`)
  }

  validateCoveragePlacement(occurrences)
  validateTreatmentPlacement(occurrences)

  const occurrenceById = new Map(occurrences.map((occurrence) => [occurrence.id, occurrence]))

  return {
    content: cleaned,
    coverageEvidence: requiredTeachingPoints.map((teachingPoint, index) => ({
      teachingPoint,
      evidence: occurrenceById.get(coverageEvidenceId(index))!.evidence,
    })),
  }
}
