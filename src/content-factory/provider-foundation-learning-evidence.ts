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

export type ProviderFoundationLearningContent = {
  title: string
  introduction: string
  sections?: Array<{
    title: string
    explanation: string
    keyPoints: string[]
  }>
  workedExamples?: Array<{
    title: string
    setup: string
    steps: string[]
    conclusion: string
  }>
  misconceptions: Array<{
    misconception: string
    correction: string
  }>
  nextAction: string
}

export type ProviderFoundationLearningField = {
  fieldId: string
  area: FoundationLearningEvidenceArea
  text: string
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

function cleanText(value: string, area: FoundationLearningEvidenceArea) {
  const text = nonEmptyStringSchema.parse(value).trim()
  if (!text) throw new Error(`Learn field ${area} is empty`)
  if (text.includes('[[REV-')) {
    throw new Error(`Learn field ${area} contains legacy inline evidence marker text`)
  }
  return text
}

function cleanContent(content: ProviderFoundationLearningContent) {
  return {
    title: nonEmptyStringSchema.parse(content.title).trim(),
    introduction: cleanText(content.introduction, 'introduction'),
    sections: (content.sections ?? []).map((section) => ({
      title: nonEmptyStringSchema.parse(section.title).trim(),
      explanation: cleanText(section.explanation, 'section_explanation'),
      keyPoints: section.keyPoints.map((keyPoint) => cleanText(keyPoint, 'section_key_point')),
    })),
    workedExamples: (content.workedExamples ?? []).map((example) => ({
      title: nonEmptyStringSchema.parse(example.title).trim(),
      setup: cleanText(example.setup, 'worked_example_setup'),
      steps: example.steps.map((step) => cleanText(step, 'worked_example_step')),
      conclusion: cleanText(example.conclusion, 'worked_example_conclusion'),
    })),
    misconceptions: content.misconceptions.map((misconception) => ({
      misconception: nonEmptyStringSchema.parse(misconception.misconception).trim(),
      correction: cleanText(misconception.correction, 'misconception_correction'),
    })),
    nextAction: cleanText(content.nextAction, 'next_action'),
  }
}

export function enumerateFoundationLearningFields(
  contentInput: ProviderFoundationLearningContent,
): ProviderFoundationLearningField[] {
  const content = cleanContent(contentInput)
  return [
    { fieldId: 'introduction', area: 'introduction' as const, text: content.introduction },
    ...content.sections.flatMap((section, sectionIndex) => [
      {
        fieldId: `section_${sectionIndex + 1}_explanation`,
        area: 'section_explanation' as const,
        text: section.explanation,
      },
      ...section.keyPoints.map((keyPoint, keyPointIndex) => ({
        fieldId: `section_${sectionIndex + 1}_key_point_${keyPointIndex + 1}`,
        area: 'section_key_point' as const,
        text: keyPoint,
      })),
    ]),
    ...content.workedExamples.flatMap((example, exampleIndex) => [
      {
        fieldId: `worked_example_${exampleIndex + 1}_setup`,
        area: 'worked_example_setup' as const,
        text: example.setup,
      },
      ...example.steps.map((step, stepIndex) => ({
        fieldId: `worked_example_${exampleIndex + 1}_step_${stepIndex + 1}`,
        area: 'worked_example_step' as const,
        text: step,
      })),
      {
        fieldId: `worked_example_${exampleIndex + 1}_conclusion`,
        area: 'worked_example_conclusion' as const,
        text: example.conclusion,
      },
    ]),
    ...content.misconceptions.map((misconception, misconceptionIndex) => ({
      fieldId: `misconception_${misconceptionIndex + 1}_correction`,
      area: 'misconception_correction' as const,
      text: misconception.correction,
    })),
    { fieldId: 'next_action', area: 'next_action' as const, text: content.nextAction },
  ]
}

function exactFieldIdSchema(fields: ProviderFoundationLearningField[]) {
  const fieldIds = fields.map((field) => field.fieldId)
  if (fieldIds.length === 0) throw new Error('Foundation Learn evidence binding requires at least one generated field')
  return z.enum(fieldIds as [string, ...string[]])
}

export function providerFoundationLearningBindingSchema(
  content: ProviderFoundationLearningContent,
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const fieldId = exactFieldIdSchema(enumerateFoundationLearningFields(content))
  const shape: Record<string, typeof fieldId> = {}
  for (const definition of evidenceDefinitions(requiredTeachingPoints, treatmentObligations)) {
    shape[definition.id] = fieldId
  }
  if (Object.keys(shape).length === 0) throw new Error('Foundation Learn evidence contract requires at least one obligation')
  return z.strictObject(shape)
}

export function providerFoundationLearningBindingGuidance(
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
    'Bind evidence only after the Learn content is final.',
    'The payload supplies the finalized generated fields with deterministic fieldId, area and text values.',
    'Return exactly the required evidence-binding object. every required evidence ID is a mandatory property in the response schema, and each property value must be one of the exact supplied fieldIds.',
    'Choose the field whose existing text genuinely proves the obligation. Multiple compatible obligations may point to the same field when that single field genuinely proves each one.',
    'Do not copy or rewrite learner text, invent fieldIds, create positional indexes, or add machine markers.',
    `Coverage evidence IDs: ${coverage}.`,
    `Treatment evidence IDs: ${treatments}.`,
  ].join(' ')
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

export function resolveFoundationLearningBoundEvidence(
  contentInput: ProviderFoundationLearningContent,
  bindingsInput: Record<string, string>,
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const content = cleanContent(contentInput)
  const fields = enumerateFoundationLearningFields(content)
  const fieldsById = new Map(fields.map((field) => [field.fieldId, field]))
  const definitions = evidenceDefinitions(requiredTeachingPoints, treatmentObligations)
  const expectedIds = definitions.map((definition) => definition.id)
  const actualIds = Object.keys(bindingsInput)
  const missing = expectedIds.filter((id) => !actualIds.includes(id))
  const unexpected = actualIds.filter((id) => !expectedIds.includes(id))
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(`Learn evidence bindings do not match deterministic obligations; missing=${missing.join(', ') || 'none'} unexpected=${unexpected.join(', ') || 'none'}`)
  }

  const occurrences = definitions.map((definition): EvidenceOccurrence => {
    const fieldId = bindingsInput[definition.id]
    const selectedField = fieldsById.get(fieldId)
    if (!selectedField) throw new Error(`Learn evidence binding ${definition.id} references unknown field ${fieldId}`)
    return {
      ...definition,
      area: selectedField.area,
      evidence: selectedField.text,
    }
  })

  validateCoveragePlacement(occurrences)
  validateTreatmentPlacement(occurrences)

  const occurrenceById = new Map(occurrences.map((occurrence) => [occurrence.id, occurrence]))
  return {
    content,
    coverageEvidence: requiredTeachingPoints.map((teachingPoint, index) => ({
      teachingPoint,
      evidence: occurrenceById.get(coverageEvidenceId(index))!.evidence,
    })),
  }
}
