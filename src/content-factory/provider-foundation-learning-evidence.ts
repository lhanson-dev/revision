import { validateFoundationAtomicLearningEvidenceLocations } from './foundation-course-learning-atomic-obligations'
import type { FoundationLearnTreatment } from './foundation-course-learning-blueprint'
import type { ProviderLearningTeachingPointEvidence } from './provider-coverage-evidence'

const markerPattern = /\[\[REV-(C|T)(\d+)\]\]/g
const markerLikePattern = /\[\[REV-[^\]]+\]\]/g

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

type ProviderFoundationLearningContent = {
  title: string
  introduction: string
  sections?: Array<{ title: string; explanation: string; keyPoints: string[] }>
  workedExamples?: Array<{ title: string; setup: string; steps: string[]; conclusion: string }>
  misconceptions: Array<{ misconception: string; correction: string }>
  nextAction: string
}

type MarkerDefinition = {
  token: string
  kind: 'coverage' | 'treatment'
  teachingPoint?: string
  nodeId?: string
  treatment?: FoundationLearnTreatment
}

type MarkerOccurrence = MarkerDefinition & {
  area: FoundationLearningEvidenceArea
  evidence: string
}

function coverageToken(index: number) {
  return `[[REV-C${index + 1}]]`
}

function treatmentToken(index: number) {
  return `[[REV-T${index + 1}]]`
}

function markerDefinitions(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  return [
    ...requiredTeachingPoints.map((teachingPoint, index): MarkerDefinition => ({
      token: coverageToken(index),
      kind: 'coverage',
      teachingPoint,
    })),
    ...treatmentObligations.map((obligation, index): MarkerDefinition => ({
      token: treatmentToken(index),
      kind: 'treatment',
      nodeId: obligation.nodeId,
      treatment: obligation.treatment,
    })),
  ]
}

export function providerFoundationLearningInlineEvidenceGuidance(
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const coverage = requiredTeachingPoints
    .map((teachingPoint, index) => `${coverageToken(index)} = ${teachingPoint}`)
    .join('; ')
  const treatments = treatmentObligations
    .map((obligation, index) => `${treatmentToken(index)} = ${obligation.nodeId}::${obligation.treatment}`)
    .join('; ')

  return [
    'Learn evidence uses inline machine markers, not evidence arrays, copied text, indexes or positional references.',
    'Place each supplied marker exactly once inside the exact learner-content field that genuinely proves that obligation. Put the marker at the end of the relevant field text. A field may contain more than one marker when it genuinely satisfies more than one obligation.',
    'Do not place markers in titles or other metadata. Do not alter marker spelling, punctuation or numbering. The system removes all valid markers before learner content is retained.',
    `Coverage markers: ${coverage}.`,
    `Treatment markers: ${treatments}.`,
  ].join(' ')
}

function cleanText(value: string) {
  return value.replace(markerPattern, '').replace(/\s{2,}/g, ' ').trim()
}

function extractTokens(value: string) {
  return [...value.matchAll(markerLikePattern)].map((match) => match[0])
}

function field(
  area: FoundationLearningEvidenceArea,
  value: string,
  definitionsByToken: Map<string, MarkerDefinition>,
  occurrences: MarkerOccurrence[],
) {
  const evidence = cleanText(value)
  if (!evidence) throw new Error(`Learn field ${area} is empty after inline evidence markers are removed`)

  for (const token of extractTokens(value)) {
    const definition = definitionsByToken.get(token)
    if (!definition) throw new Error(`Unexpected Learn evidence marker ${token}`)
    occurrences.push({ ...definition, area, evidence })
  }

  return evidence
}

function validateCoveragePlacement(occurrences: MarkerOccurrence[]) {
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

function validateTreatmentPlacement(occurrences: MarkerOccurrence[]) {
  for (const occurrence of occurrences.filter((entry) => entry.kind === 'treatment')) {
    if (occurrence.treatment === 'worked_example' && !occurrence.area.startsWith('worked_example_')) {
      throw new Error('worked_example treatment evidence must point to a worked-example field')
    }
    if (occurrence.treatment === 'misconception_repair' && occurrence.area !== 'misconception_correction') {
      throw new Error('misconception_repair treatment evidence must point to a misconception correction')
    }
  }
}

export function resolveFoundationLearningInlineEvidence(
  content: ProviderFoundationLearningContent,
  requiredTeachingPoints: string[],
  treatmentObligations: FoundationLearningTreatmentObligation[],
) {
  const definitions = markerDefinitions(requiredTeachingPoints, treatmentObligations)
  const definitionsByToken = new Map(definitions.map((definition) => [definition.token, definition]))
  const occurrences: MarkerOccurrence[] = []

  const cleaned = {
    title: content.title,
    introduction: field('introduction', content.introduction, definitionsByToken, occurrences),
    sections: (content.sections ?? []).map((section) => ({
      title: section.title,
      explanation: field('section_explanation', section.explanation, definitionsByToken, occurrences),
      keyPoints: section.keyPoints.map((keyPoint) => (
        field('section_key_point', keyPoint, definitionsByToken, occurrences)
      )),
    })),
    workedExamples: (content.workedExamples ?? []).map((example) => ({
      title: example.title,
      setup: field('worked_example_setup', example.setup, definitionsByToken, occurrences),
      steps: example.steps.map((step) => (
        field('worked_example_step', step, definitionsByToken, occurrences)
      )),
      conclusion: field('worked_example_conclusion', example.conclusion, definitionsByToken, occurrences),
    })),
    misconceptions: content.misconceptions.map((misconception) => ({
      misconception: misconception.misconception,
      correction: field('misconception_correction', misconception.correction, definitionsByToken, occurrences),
    })),
    nextAction: field('next_action', content.nextAction, definitionsByToken, occurrences),
  }

  for (const definition of definitions) {
    const matches = occurrences.filter((occurrence) => occurrence.token === definition.token)
    if (matches.length === 0) throw new Error(`Missing Learn evidence marker ${definition.token}`)
    if (matches.length > 1) throw new Error(`Learn evidence marker ${definition.token} must appear exactly once`)
  }

  validateCoveragePlacement(occurrences)
  validateTreatmentPlacement(occurrences)

  const occurrenceByToken = new Map(occurrences.map((occurrence) => [occurrence.token, occurrence]))

  return {
    content: cleaned,
    coverageEvidence: requiredTeachingPoints.map((teachingPoint, index) => ({
      teachingPoint,
      evidence: occurrenceByToken.get(coverageToken(index))!.evidence,
    })),
  }
}
