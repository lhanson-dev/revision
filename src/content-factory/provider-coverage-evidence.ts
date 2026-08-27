import { z } from 'zod'

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
    itemIndex: oneBasedIndexSchema,
    detailIndex: oneBasedIndexSchema,
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

function requireScalarLocation(itemIndex: number, detailIndex: number, label: string) {
  if (itemIndex !== 1 || detailIndex !== 1) {
    throw new Error(`Coverage evidence location for ${label} must use itemIndex=1 and detailIndex=1`)
  }
}

function resolveLearningLocation(
  content: ProviderLearningContent,
  location: ProviderLearningTeachingPointEvidence['location'],
) {
  switch (location.area) {
    case 'introduction':
      requireScalarLocation(location.itemIndex, location.detailIndex, 'introduction')
      return content.introduction
    case 'section_explanation': {
      if (location.detailIndex !== 1) throw new Error('Section explanation coverage evidence must use detailIndex=1')
      return indexed(content.sections, location.itemIndex, 'section').explanation
    }
    case 'section_key_point':
      return indexed(
        indexed(content.sections, location.itemIndex, 'section').keyPoints,
        location.detailIndex,
        `key point in section ${location.itemIndex}`,
      )
    case 'worked_example_setup': {
      if (location.detailIndex !== 1) throw new Error('Worked-example setup coverage evidence must use detailIndex=1')
      return indexed(content.workedExamples, location.itemIndex, 'worked example').setup
    }
    case 'worked_example_step':
      return indexed(
        indexed(content.workedExamples, location.itemIndex, 'worked example').steps,
        location.detailIndex,
        `step in worked example ${location.itemIndex}`,
      )
    case 'worked_example_conclusion': {
      if (location.detailIndex !== 1) throw new Error('Worked-example conclusion coverage evidence must use detailIndex=1')
      return indexed(content.workedExamples, location.itemIndex, 'worked example').conclusion
    }
    case 'misconception_correction': {
      if (location.detailIndex !== 1) throw new Error('Misconception correction coverage evidence must use detailIndex=1')
      return indexed(content.misconceptions, location.itemIndex, 'misconception').correction
    }
    case 'next_action':
      requireScalarLocation(location.itemIndex, location.detailIndex, 'next action')
      return content.nextAction
  }
}

export function resolveLearningCoverageEvidence(
  evidence: ProviderLearningTeachingPointEvidence[],
  content: ProviderLearningContent,
) {
  return evidence.map((entry) => ({
    teachingPoint: entry.teachingPoint,
    evidence: resolveLearningLocation(content, entry.location),
  }))
}

export function resolvePracticeCoverageEvidence(
  evidence: ProviderPracticeTeachingPointEvidence[],
  content: ProviderPracticeContent,
) {
  return evidence.map((entry) => {
    const activities = content.activitiesByMode[entry.location.mode]
    const activity = indexed(activities, entry.location.activityIndex, `${entry.location.mode} activity`)
    return {
      teachingPoint: entry.teachingPoint,
      evidence: activity[entry.location.field],
    }
  })
}
