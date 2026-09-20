import { z } from 'zod'
import { courseKnowledgeModelSchema, courseKnowledgeNodeSchema } from './schema'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const courseLearningClassificationSchema = z.enum([
  'fact_term',
  'concept',
  'comparison_discrimination',
  'relationship_causal',
  'process_sequence',
  'formula_quantitative',
  'model_framework',
  'procedure_skill',
  'application_context',
  'analysis_reasoning',
  'evaluation_judgement',
  'misconception_risk',
  'synoptic_connection',
  'exam_response_skill',
])

export const courseLearningLearnTreatmentSchema = z.enum([
  'core_explanation',
  'example_in_context',
  'structured_comparison',
  'causal_chain',
  'worked_example',
  'framework_application',
  'procedure_modelling',
  'modelled_reasoning',
  'justified_judgement',
  'misconception_repair',
  'synoptic_connection',
])

export const courseLearningPracticeModeSchema = z.enum([
  'retrieval',
  'short_answer',
  'application',
  'quantitative',
])

export const courseLearningNodePlanSchema = z.object({
  schemaVersion: z.literal(1),
  nodeId: identifierSchema,
  classifications: z.array(courseLearningClassificationSchema).min(1),
  learnTreatments: z.array(courseLearningLearnTreatmentSchema).min(1),
  practiceModes: z.array(courseLearningPracticeModeSchema).min(1),
  requiredTeachingPoints: z.array(nonEmptyStringSchema).min(1),
})

export type CourseLearningClassification = z.infer<typeof courseLearningClassificationSchema>
export type CourseLearningLearnTreatment = z.infer<typeof courseLearningLearnTreatmentSchema>
export type CourseLearningPracticeMode = z.infer<typeof courseLearningPracticeModeSchema>
export type CourseLearningNodePlan = z.infer<typeof courseLearningNodePlanSchema>

type KnowledgeNode = z.infer<typeof courseKnowledgeModelSchema>['nodes'][number]

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function evidenceIncludes(node: KnowledgeNode, signals: string[]) {
  const evidence = node.evidenceTypes.map((value) => value.toLowerCase())
  return evidence.some((value) => signals.some((signal) => value.includes(signal)))
}

function classificationsForNode(node: KnowledgeNode): CourseLearningClassification[] {
  const classifications: CourseLearningClassification[] = []

  if (node.kind === 'concept') classifications.push('concept')
  if (node.kind === 'skill') classifications.push('procedure_skill')
  if (
    node.kind === 'formula'
    || node.formulas.length > 0
    || evidenceIncludes(node, ['calculation', 'quantitative'])
  ) classifications.push('formula_quantitative')

  if (node.applicationContexts.length > 0 || evidenceIncludes(node, ['application', 'contextual', 'decision making'])) {
    classifications.push('application_context')
  }
  if (node.misconceptions.length > 0) classifications.push('misconception_risk')
  if (evidenceIncludes(node, ['comparison', 'comparative'])) classifications.push('comparison_discrimination')
  if (evidenceIncludes(node, ['causal', 'interrelationship'])) classifications.push('relationship_causal')
  if (evidenceIncludes(node, ['framework'])) classifications.push('model_framework')
  if (evidenceIncludes(node, ['analysis', 'diagnosis'])) classifications.push('analysis_reasoning')
  if (evidenceIncludes(node, ['evaluation', 'judgement', 'judgment', 'decision making'])) classifications.push('evaluation_judgement')
  if (evidenceIncludes(node, ['cross-functional', 'synoptic'])) classifications.push('synoptic_connection')

  return unique(classifications)
}

function learnTreatmentsFor(classifications: CourseLearningClassification[]) {
  const selected = new Set(classifications)
  const treatments: CourseLearningLearnTreatment[] = ['core_explanation']

  if (selected.has('concept')) treatments.push('example_in_context')
  if (selected.has('comparison_discrimination')) treatments.push('structured_comparison')
  if (selected.has('relationship_causal')) treatments.push('causal_chain')
  if (selected.has('formula_quantitative')) treatments.push('worked_example')
  if (selected.has('model_framework')) treatments.push('framework_application')
  if (selected.has('procedure_skill')) treatments.push('procedure_modelling')
  if (selected.has('analysis_reasoning')) treatments.push('modelled_reasoning')
  if (selected.has('evaluation_judgement')) treatments.push('justified_judgement')
  if (selected.has('misconception_risk')) treatments.push('misconception_repair')
  if (selected.has('synoptic_connection')) treatments.push('synoptic_connection')

  return unique(treatments)
}

function practiceModesFor(node: KnowledgeNode, classifications: CourseLearningClassification[]) {
  const selected = new Set(classifications)
  const modes: CourseLearningPracticeMode[] = ['retrieval']

  if (selected.has('formula_quantitative')) modes.push('quantitative')
  if (
    selected.has('application_context')
    || selected.has('analysis_reasoning')
    || selected.has('evaluation_judgement')
    || selected.has('model_framework')
    || selected.has('synoptic_connection')
  ) modes.push('application')

  const needsConstructedResponse = (
    selected.has('comparison_discrimination')
    || selected.has('analysis_reasoning')
    || selected.has('evaluation_judgement')
    || selected.has('misconception_risk')
    || selected.has('procedure_skill')
  )
  if (needsConstructedResponse && node.applicationContexts.length === 0) modes.push('short_answer')

  return unique(modes)
}

function requiredTeachingPointsForNode(node: KnowledgeNode) {
  const nodeMarker = `[${node.id}]`
  return unique([
    `Course Truth ${nodeMarker}: ${node.summary}`,
    ...node.formulas.map((formula) => `Formula or quantitative procedure ${nodeMarker}: ${formula}`),
    ...node.misconceptions.map((misconception) => `Misconception to diagnose and repair ${nodeMarker}: ${misconception}`),
    ...node.applicationContexts.map((context) => `Required application context ${nodeMarker}: ${context}`),
    ...node.evidenceTypes.map((evidenceType) => `Required evidence demand ${nodeMarker}: ${evidenceType}`),
  ])
}

/**
 * Deterministically derives the first governed Course Learning Blueprint node plan
 * from structured Course Truth only. It does not infer classifications from prose
 * keywords in the node summary and it does not let a generative worker omit a
 * mechanically visible formula, misconception, context or evidence demand.
 */
export function deriveCourseLearningNodePlan(nodeInput: unknown): CourseLearningNodePlan {
  const node = courseKnowledgeNodeSchema.parse(nodeInput)
  const classifications = classificationsForNode(node)

  return courseLearningNodePlanSchema.parse({
    schemaVersion: 1,
    nodeId: node.id,
    classifications,
    learnTreatments: learnTreatmentsFor(classifications),
    practiceModes: practiceModesFor(node, classifications),
    requiredTeachingPoints: requiredTeachingPointsForNode(node),
  })
}
