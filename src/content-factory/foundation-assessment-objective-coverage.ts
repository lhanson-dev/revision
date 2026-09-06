import { z } from 'zod'
import type { FoundationAssessmentBlueprint } from './foundation-compilation'
import type { QuestionFamily } from './schema'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)

export const FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX = 'revision:ao-coverage-plan:v1:'

export const foundationAssessmentObjectiveCoveragePlanSchema = z.object({
  schemaVersion: z.literal(1),
  sourceAssessmentRequirementId: identifierSchema,
  scope: z.literal('qualification_total'),
  totalAssessmentMarks: z.number().int().positive(),
  objectives: z.array(z.object({
    assessmentObjectiveId: identifierSchema,
    minWeightingPercent: z.number().nonnegative().max(100),
    maxWeightingPercent: z.number().nonnegative().max(100),
  })).min(1),
  accountingBasis: z.literal('primary_assessment_objective_marks'),
  multiObjectiveTreatment: z.literal('each_mark_allocated_once_to_a_primary_objective'),
  generationValidation: z.literal('sum_assessment_objective_marks_within_ranges'),
  questionFamilyCoverageRequired: z.literal(true),
}).superRefine((plan, context) => {
  const ids = new Set<string>()
  let minimumTotal = 0
  let maximumTotal = 0

  for (const [index, objective] of plan.objectives.entries()) {
    if (ids.has(objective.assessmentObjectiveId)) {
      context.addIssue({
        code: 'custom',
        path: ['objectives', index, 'assessmentObjectiveId'],
        message: `Duplicate assessment objective ${objective.assessmentObjectiveId}`,
      })
    }
    ids.add(objective.assessmentObjectiveId)
    if (objective.minWeightingPercent > objective.maxWeightingPercent) {
      context.addIssue({
        code: 'custom',
        path: ['objectives', index],
        message: `Assessment objective ${objective.assessmentObjectiveId} minimum exceeds maximum`,
      })
    }
    minimumTotal += objective.minWeightingPercent
    maximumTotal += objective.maxWeightingPercent
  }

  if (minimumTotal > 100 || maximumTotal < 100) {
    context.addIssue({
      code: 'custom',
      path: ['objectives'],
      message: `Assessment objective ranges cannot account for 100% of qualification marks (${minimumTotal}-${maximumTotal}%)`,
    })
  }
})

export type FoundationAssessmentObjectiveCoveragePlan = z.infer<typeof foundationAssessmentObjectiveCoveragePlanSchema>

export function serializeFoundationAssessmentObjectiveCoveragePlan(
  input: FoundationAssessmentObjectiveCoveragePlan,
): string {
  const plan = foundationAssessmentObjectiveCoveragePlanSchema.parse(input)
  return `${FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX}${JSON.stringify(plan)}`
}

export function parseFoundationAssessmentObjectiveCoveragePlan(
  blueprint: FoundationAssessmentBlueprint,
): FoundationAssessmentObjectiveCoveragePlan {
  const contracts = blueprint.evidenceExpectations.filter((expectation) =>
    expectation.startsWith(FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX),
  )
  if (contracts.length !== 1) {
    throw new Error(`expected_one_assessment_objective_coverage_plan:found_${contracts.length}`)
  }

  const payload = contracts[0].slice(FOUNDATION_ASSESSMENT_OBJECTIVE_COVERAGE_PLAN_PREFIX.length)
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    throw new Error('invalid_assessment_objective_coverage_plan_json')
  }
  return foundationAssessmentObjectiveCoveragePlanSchema.parse(parsed)
}

export function assertFoundationAssessmentObjectiveCoveragePlan(input: {
  blueprint: FoundationAssessmentBlueprint
  questionFamilies: QuestionFamily[]
  expectedPlan: FoundationAssessmentObjectiveCoveragePlan
}) {
  const expected = foundationAssessmentObjectiveCoveragePlanSchema.parse(input.expectedPlan)
  const actual = parseFoundationAssessmentObjectiveCoveragePlan(input.blueprint)

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('assessment_objective_coverage_plan_mismatch')
  }

  if (!input.blueprint.assessmentRequirements.some((requirement) => requirement.id === actual.sourceAssessmentRequirementId)) {
    throw new Error(`assessment_objective_coverage_plan_missing_requirement:${actual.sourceAssessmentRequirementId}`)
  }

  const componentMarks = input.blueprint.components.map((component) => component.markTotal)
  if (!componentMarks.every((mark): mark is number => mark !== undefined)) {
    throw new Error('assessment_objective_coverage_plan_requires_component_mark_totals')
  }
  const qualificationMarks = componentMarks.reduce((sum, mark) => sum + mark, 0)
  if (qualificationMarks !== actual.totalAssessmentMarks) {
    throw new Error(`assessment_objective_coverage_plan_mark_total_mismatch:${qualificationMarks}`)
  }

  const declaredObjectiveIds = new Set(actual.objectives.map((objective) => objective.assessmentObjectiveId))
  const blueprintObjectiveIds = new Set(input.blueprint.assessmentObjectives.map((objective) => objective.id))
  for (const objectiveId of declaredObjectiveIds) {
    if (!blueprintObjectiveIds.has(objectiveId)) {
      throw new Error(`assessment_objective_coverage_plan_missing_blueprint_objective:${objectiveId}`)
    }
  }

  const coveredObjectiveIds = new Set<string>()
  for (const family of input.questionFamilies) {
    if (family.assessmentObjectiveIds.length === 0) {
      throw new Error(`question_family_missing_assessment_objective:${family.id}`)
    }
    for (const objectiveId of family.assessmentObjectiveIds) {
      if (!declaredObjectiveIds.has(objectiveId)) {
        throw new Error(`question_family_unknown_assessment_objective:${family.id}:${objectiveId}`)
      }
      coveredObjectiveIds.add(objectiveId)
    }
  }

  for (const objectiveId of declaredObjectiveIds) {
    if (!coveredObjectiveIds.has(objectiveId)) {
      throw new Error(`assessment_objective_not_covered_by_question_family:${objectiveId}`)
    }
  }
}
