import { z } from 'zod'
import { validateFoundationAtomicLearningEvidenceLocations } from './foundation-course-learning-atomic-obligations'

const nonEmptyStringSchema = z.string().min(1)

export const providerFoundationLearningTeachingPointEvidenceSchema = z.strictObject({
  teachingPoint: nonEmptyStringSchema,
  location: z.strictObject({
    area: z.enum([
      'introduction',
      'section_explanation',
      'section_key_point',
      'worked_example_setup',
      'worked_example_step',
      'worked_example_conclusion',
      'misconception_correction',
      'next_action',
    ]),
    evidenceText: nonEmptyStringSchema,
  }),
})

export type ProviderFoundationLearningTeachingPointEvidence = z.infer<typeof providerFoundationLearningTeachingPointEvidenceSchema>

export function providerFoundationLearningEvidenceLocationGuidance() {
  return 'For every Learn coverageEvidence or treatmentEvidence location, set area to the exact generated field type and copy evidenceText verbatim from that generated field. Do not paraphrase, summarise or reconstruct evidenceText. The copied evidenceText must occur exactly once among generated fields of the named area so the fail-closed resolver can bind it unambiguously.'
}

type ProviderFoundationLearningContent = {
  introduction: string
  sections?: Array<{ explanation: string; keyPoints: string[] }>
  workedExamples?: Array<{ setup: string; steps: string[]; conclusion: string }>
  misconceptions: Array<{ correction: string }>
  nextAction: string
}

function learningAreaValues(
  content: ProviderFoundationLearningContent,
  area: ProviderFoundationLearningTeachingPointEvidence['location']['area'],
) {
  switch (area) {
    case 'introduction':
      return [content.introduction]
    case 'section_explanation':
      return (content.sections ?? []).map((section) => section.explanation)
    case 'section_key_point':
      return (content.sections ?? []).flatMap((section) => section.keyPoints)
    case 'worked_example_setup':
      return (content.workedExamples ?? []).map((example) => example.setup)
    case 'worked_example_step':
      return (content.workedExamples ?? []).flatMap((example) => example.steps)
    case 'worked_example_conclusion':
      return (content.workedExamples ?? []).map((example) => example.conclusion)
    case 'misconception_correction':
      return content.misconceptions.map((misconception) => misconception.correction)
    case 'next_action':
      return [content.nextAction]
  }
}

function resolveFoundationLearningLocation(
  content: ProviderFoundationLearningContent,
  location: ProviderFoundationLearningTeachingPointEvidence['location'],
) {
  const matches = learningAreaValues(content, location.area)
    .filter((value) => value === location.evidenceText)
  if (matches.length === 0) {
    throw new Error(`Coverage evidence text does not exactly match generated ${location.area}`)
  }
  if (matches.length > 1) {
    throw new Error(`Coverage evidence text is ambiguous within generated ${location.area}`)
  }
  return matches[0]
}

export function resolveFoundationLearningCoverageEvidence(
  evidence: ProviderFoundationLearningTeachingPointEvidence[],
  content: ProviderFoundationLearningContent,
) {
  validateFoundationAtomicLearningEvidenceLocations(evidence)
  return evidence.map((entry) => ({
    teachingPoint: entry.teachingPoint,
    evidence: resolveFoundationLearningLocation(content, entry.location),
  }))
}
