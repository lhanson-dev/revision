import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const assessmentResponseDemandSchema = z.enum([
  'selection',
  'knowledge',
  'application',
  'calculation',
  'interpretation',
  'analysis',
  'evaluation',
])

export type AssessmentResponseDemand = z.infer<typeof assessmentResponseDemandSchema>

export const assessmentResponseDemandCommandEvidence = {
  selection: ['select', 'choose', 'which'],
  knowledge: ['state', 'identify', 'define', 'give', 'outline', 'explain', 'analyse', 'analyze', 'evaluate', 'assess', 'justify', 'recommend'],
  application: ['apply', 'explain', 'analyse', 'analyze', 'evaluate', 'assess', 'justify', 'recommend', 'calculate'],
  calculation: ['calculate', 'work out', 'determine'],
  interpretation: ['interpret', 'comment', 'explain', 'analyse', 'analyze'],
  analysis: ['analyse', 'analyze', 'explain'],
  evaluation: ['evaluate', 'assess', 'justify', 'recommend'],
} as const satisfies Record<AssessmentResponseDemand, readonly string[]>

export const assessmentOptionSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D']),
  text: nonEmptyStringSchema,
  correct: z.boolean(),
  misconceptionBasis: nonEmptyStringSchema.optional(),
})

export const assessmentSubquestionSchema = z.object({
  id: identifierSchema,
  command: nonEmptyStringSchema,
  wording: nonEmptyStringSchema,
  maxMark: z.number().int().positive(),
  requirementIds: z.array(identifierSchema).min(1),
  responseDemands: z.array(assessmentResponseDemandSchema).min(1),
  coverageEvidence: z.array(z.object({
    requirementId: identifierSchema,
    evidence: nonEmptyStringSchema,
  })).min(1),
  options: z.array(assessmentOptionSchema).optional(),
})

export const markingSubquestionGuidanceSchema = z.object({
  subquestionId: identifierSchema,
  maxMark: z.number().int().positive(),
  rewardedDemands: z.array(assessmentResponseDemandSchema).min(1),
  assessmentObjectiveAllocation: z.array(z.object({
    objectiveId: identifierSchema,
    marks: z.number().int().nonnegative(),
  })).default([]),
  answerRequirements: z.array(nonEmptyStringSchema).min(1),
})

export type AssessmentSubquestion = z.infer<typeof assessmentSubquestionSchema>
export type MarkingSubquestionGuidance = z.infer<typeof markingSubquestionGuidanceSchema>

function normalise(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function regexEscape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function assessmentCommandSupportsDemand(commandInput: string, demand: AssessmentResponseDemand) {
  const command = normalise(commandInput)
  const alternatives = assessmentResponseDemandCommandEvidence[demand].map(regexEscape).join('|')
  return new RegExp(`\\b(?:${alternatives})\\b`).test(command)
}

export function assessmentResponseDemandCommandContractText() {
  return (Object.entries(assessmentResponseDemandCommandEvidence) as Array<[AssessmentResponseDemand, readonly string[]]>)
    .map(([demand, commands]) => `${demand}: ${commands.join(', ')}`)
    .join('; ')
}

function validateMcqOptions(subquestion: AssessmentSubquestion, label: string) {
  const isSelection = subquestion.responseDemands.includes('selection')
  if (!isSelection && (subquestion.options?.length ?? 0) > 0) throw new Error(`${label} supplies MCQ options without selection demand`)
  if (!isSelection) return

  const options = subquestion.options ?? []
  if (options.length !== 4) throw new Error(`${label} must provide exactly four MCQ options`)
  if (!sameSet(options.map((option) => option.label), ['A', 'B', 'C', 'D'])) throw new Error(`${label} must provide unique options A-D`)
  if (new Set(options.map((option) => normalise(option.text))).size !== 4) throw new Error(`${label} MCQ option text must be distinct`)
  if (options.filter((option) => option.correct).length !== 1) throw new Error(`${label} must have exactly one correct MCQ option`)
  const weakDistractors = options.filter((option) => !option.correct && normalise(option.misconceptionBasis ?? '').length < 8)
  if (weakDistractors.length > 0) throw new Error(`${label} incorrect MCQ options must identify a plausible misconception basis`)
  const distractorBases = options.filter((option) => !option.correct).map((option) => normalise(option.misconceptionBasis!))
  if (new Set(distractorBases).size !== distractorBases.length) throw new Error(`${label} MCQ distractors must use distinct misconception bases`)
}

export function validateStructuredAssessment(input: {
  itemId: string
  maxMark: number
  governedRequirementIds: string[]
  subquestions: AssessmentSubquestion[]
}) {
  const subquestions = z.array(assessmentSubquestionSchema).min(1).parse(input.subquestions)
  if (new Set(subquestions.map((subquestion) => subquestion.id)).size !== subquestions.length) throw new Error(`Assessment item ${input.itemId} has duplicate subquestion IDs`)
  const totalMarks = subquestions.reduce((sum, subquestion) => sum + subquestion.maxMark, 0)
  if (totalMarks !== input.maxMark) throw new Error(`Assessment item ${input.itemId} subquestion marks total ${totalMarks}, expected ${input.maxMark}`)

  const claimedRequirements = new Set<string>()
  for (const subquestion of subquestions) {
    const label = `Assessment item ${input.itemId} subquestion ${subquestion.id}`
    for (const demand of subquestion.responseDemands) if (!assessmentCommandSupportsDemand(`${subquestion.command} ${subquestion.wording}`, demand)) {
      throw new Error(`${label} command does not ask for rewarded demand ${demand}`)
    }
    validateMcqOptions(subquestion, label)

    const evidenceByRequirement = new Map<string, string>()
    for (const entry of subquestion.coverageEvidence) {
      if (evidenceByRequirement.has(entry.requirementId)) throw new Error(`${label} repeats coverage evidence for ${entry.requirementId}`)
      evidenceByRequirement.set(entry.requirementId, entry.evidence)
    }
    if (!sameSet(subquestion.requirementIds, evidenceByRequirement.keys())) throw new Error(`${label} coverage evidence must match its requirement IDs exactly`)
    const searchable = normalise(subquestion.wording)
    for (const requirementId of subquestion.requirementIds) {
      claimedRequirements.add(requirementId)
      const excerpt = normalise(evidenceByRequirement.get(requirementId) ?? '')
      if (excerpt.length < 8 || !searchable.includes(excerpt)) throw new Error(`${label} coverage for ${requirementId} must cite an exact question excerpt`)
    }
  }

  if (!sameSet(claimedRequirements, input.governedRequirementIds)) {
    throw new Error(`Assessment item ${input.itemId} subquestions must evidence exactly the governed requirement IDs`)
  }
  return subquestions
}

export function validateStructuredMarkingGuidance(input: {
  itemId: string
  subquestions: AssessmentSubquestion[]
  guidance: MarkingSubquestionGuidance[]
  allowedObjectiveIds: string[]
  overallObjectiveAllocation: Array<{ objectiveId: string; marks: number }>
}) {
  const guidance = z.array(markingSubquestionGuidanceSchema).min(1).parse(input.guidance)
  const subquestionById = new Map(input.subquestions.map((subquestion) => [subquestion.id, subquestion]))
  if (!sameSet(guidance.map((entry) => entry.subquestionId), subquestionById.keys())) throw new Error(`Marking Pack for ${input.itemId} must guide every subquestion exactly once`)
  const allowedObjectives = new Set(input.allowedObjectiveIds)
  const objectiveTotals = new Map<string, number>()

  for (const entry of guidance) {
    const subquestion = subquestionById.get(entry.subquestionId)!
    if (entry.maxMark !== subquestion.maxMark) throw new Error(`Marking Pack guidance for ${entry.subquestionId} must preserve the subquestion mark value`)
    for (const demand of entry.rewardedDemands) if (!subquestion.responseDemands.includes(demand)) {
      throw new Error(`Marking Pack guidance for ${entry.subquestionId} rewards unasked demand ${demand}`)
    }
    const allocated = entry.assessmentObjectiveAllocation.reduce((sum, allocation) => sum + allocation.marks, 0)
    if (allocated !== entry.maxMark) throw new Error(`Marking Pack guidance AO allocation for ${entry.subquestionId} must total ${entry.maxMark}`)
    for (const allocation of entry.assessmentObjectiveAllocation) {
      if (!allowedObjectives.has(allocation.objectiveId)) throw new Error(`Marking Pack guidance for ${entry.subquestionId} uses unavailable objective ${allocation.objectiveId}`)
      objectiveTotals.set(allocation.objectiveId, (objectiveTotals.get(allocation.objectiveId) ?? 0) + allocation.marks)
    }
  }

  const derivedOverallObjectiveAllocation = input.allowedObjectiveIds.map((objectiveId) => ({
    objectiveId,
    marks: objectiveTotals.get(objectiveId) ?? 0,
  }))
  input.overallObjectiveAllocation.splice(
    0,
    input.overallObjectiveAllocation.length,
    ...derivedOverallObjectiveAllocation,
  )
  return guidance
}
