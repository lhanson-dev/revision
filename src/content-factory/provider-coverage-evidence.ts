import { z } from 'zod'
import {
  validateFoundationAtomicLearningEvidenceLocations,
  validateFoundationAtomicPracticeEvidenceLocations,
} from './foundation-course-learning-atomic-obligations'

const nonEmptyStringSchema = z.string().min(1)
const oneBasedIndexSchema = z.number().int().min(1)
const practiceModeSchema = z.enum(['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'])

export const providerLearningTeachingPointEvidenceSchema = z.strictObject({
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

export const providerPracticeTeachingPointEvidenceSchema = z.strictObject({
  teachingPoint: nonEmptyStringSchema,
  location: z.strictObject({
    mode: practiceModeSchema,
    activityIndex: oneBasedIndexSchema,
    field: z.enum(['prompt', 'expectedResponse', 'explanation', 'improvementAction']),
  }),
})

export type ProviderLearningTeachingPointEvidence = z.infer<typeof providerLearningTeachingPointEvidenceSchema>
export type ProviderPracticeTeachingPointEvidence = z.infer<typeof providerPracticeTeachingPointEvidenceSchema>

export function providerLearningEvidenceLocationGuidance() {
  return 'For every Learn coverageEvidence or treatmentEvidence location, set area to the exact generated field type and copy evidenceText verbatim from that generated field. Do not paraphrase, summarise or reconstruct evidenceText. The copied evidenceText must occur exactly once among generated fields of the named area so the fail-closed resolver can bind it unambiguously.'
}

export function providerPracticeEvidenceLocationGuidance() {
  return 'Use 1-based Practice evidence activityIndex values. Each coverageEvidence or capabilityEvidence location must reference an activity that actually exists in the named activitiesByMode bucket; if that bucket contains one activity, use activityIndex=1.'
}

type ProviderLearningContent = {
  introduction: string
  sections?: Array<{ explanation: string; keyPoints: string[] }>
  workedExamples?: Array<{ setup: string; steps: string[]; conclusion: string }>
  misconceptions: Array<{ correction: string }>
  nextAction: string
}

type ProviderPracticeActivity = {
  prompt: string
  expectedResponse: string
  explanation: string
  improvementAction: string
}

type ProviderPracticeContent = {
  activitiesByMode: Record<string, ProviderPracticeActivity[]>
}

function indexed<T>(values: T[] | undefined, oneBasedIndex: number, label: string) {
  const value = values?.[oneBasedIndex - 1]
  if (value === undefined) throw new Error(`Coverage evidence location references missing ${label} ${oneBasedIndex}`)
  return value
}

function learningAreaValues(
  content: ProviderLearningContent,
  area: ProviderLearningTeachingPointEvidence['location']['area'],
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

function resolveLearningLocation(
  content: ProviderLearningContent,
  location: ProviderLearningTeachingPointEvidence['location'],
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

export function resolveLearningCoverageEvidence(
  evidence: ProviderLearningTeachingPointEvidence[],
  content: ProviderLearningContent,
) {
  validateFoundationAtomicLearningEvidenceLocations(evidence)
  return evidence.map((entry) => ({
    teachingPoint: entry.teachingPoint,
    evidence: resolveLearningLocation(content, entry.location),
  }))
}

export function resolvePracticeCoverageEvidence(
  evidence: ProviderPracticeTeachingPointEvidence[],
  content: ProviderPracticeContent,
) {
  validateFoundationAtomicPracticeEvidenceLocations(evidence)
  return evidence.map((entry) => {
    const activities = content.activitiesByMode[entry.location.mode]
    const activity = indexed(activities, entry.location.activityIndex, `${entry.location.mode} activity`)
    return {
      teachingPoint: entry.teachingPoint,
      evidence: activity[entry.location.field],
    }
  })
}