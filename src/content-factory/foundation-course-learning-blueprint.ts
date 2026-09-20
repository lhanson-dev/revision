import { z } from 'zod'
import { courseKnowledgeModelSchema } from './schema'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)

export const foundationLearningClassificationSchema = z.enum([
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

export const foundationLearnTreatmentSchema = z.enum([
  'core_explanation',
  'definition_in_context',
  'example_non_example',
  'comparison',
  'relationship_causal_chain',
  'process_sequence',
  'purposeful_visual',
  'worked_example',
  'guided_example',
  'misconception_repair',
  'connection_synoptic_link',
  'self_explanation_prompt',
  'memory_anchor',
])

export const foundationPracticeCapabilitySchema = z.enum([
  'retrieval',
  'discrimination',
  'short_constructed_response',
  'calculation',
  'interpretation',
  'procedure_execution',
  'construction',
  'graph_data_interpretation',
  'contextual_application',
  'reasoning_chain',
  'compare_justify',
  'framework_application',
  'contextual_judgement',
  'misconception_diagnostic',
  'mixed_synoptic_selection',
])

export const foundationCourseLearningNodeDesignSchema = z.object({
  nodeId: identifierSchema,
  classifications: z.array(foundationLearningClassificationSchema).min(1),
  learnTreatments: z.array(foundationLearnTreatmentSchema).min(1),
  practiceCapabilities: z.array(foundationPracticeCapabilitySchema).min(1),
})

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function sameStringSet(left: string[], right: string[]) {
  const a = [...new Set(left)].sort()
  const b = [...new Set(right)].sort()
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export const foundationCourseLearningDesignSchema = z.object({
  schemaVersion: z.literal(1),
  nodes: z.array(foundationCourseLearningNodeDesignSchema).min(1),
  classifications: z.array(foundationLearningClassificationSchema).min(1),
  learnTreatments: z.array(foundationLearnTreatmentSchema).min(1),
  practiceCapabilities: z.array(foundationPracticeCapabilitySchema).min(1),
  sourceNodeIds: z.array(identifierSchema).min(1),
}).superRefine((design, context) => {
  const nodeIds = design.nodes.map((node) => node.nodeId)
  if (new Set(nodeIds).size !== nodeIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['nodes'],
      message: 'Course Learning Blueprint must contain exactly one design record per source node',
    })
  }
  if (!sameStringSet(nodeIds, design.sourceNodeIds)) {
    context.addIssue({
      code: 'custom',
      path: ['sourceNodeIds'],
      message: 'Course Learning Blueprint sourceNodeIds must exactly match node-level design IDs',
    })
  }

  const expectedClassifications = unique(design.nodes.flatMap((node) => node.classifications))
  const expectedTreatments = unique(design.nodes.flatMap((node) => node.learnTreatments))
  const expectedCapabilities = unique(design.nodes.flatMap((node) => node.practiceCapabilities))
  if (!sameStringSet(expectedClassifications, design.classifications)) {
    context.addIssue({
      code: 'custom',
      path: ['classifications'],
      message: 'Work-unit classifications must equal the union of node-level classifications',
    })
  }
  if (!sameStringSet(expectedTreatments, design.learnTreatments)) {
    context.addIssue({
      code: 'custom',
      path: ['learnTreatments'],
      message: 'Work-unit Learn treatments must equal the union of node-level treatments',
    })
  }
  if (!sameStringSet(expectedCapabilities, design.practiceCapabilities)) {
    context.addIssue({
      code: 'custom',
      path: ['practiceCapabilities'],
      message: 'Work-unit Practice capabilities must equal the union of node-level capabilities',
    })
  }
})

export type FoundationCourseLearningDesign = z.infer<typeof foundationCourseLearningDesignSchema>
export type FoundationCourseLearningNodeDesign = z.infer<typeof foundationCourseLearningNodeDesignSchema>
export type FoundationLearningClassification = z.infer<typeof foundationLearningClassificationSchema>
export type FoundationLearnTreatment = z.infer<typeof foundationLearnTreatmentSchema>
export type FoundationPracticeCapability = z.infer<typeof foundationPracticeCapabilitySchema>

type KnowledgeNode = z.infer<typeof courseKnowledgeModelSchema>['nodes'][number]

function hasEvidence(evidence: string[], ...terms: string[]) {
  return evidence.some((value) => terms.some((term) => value.includes(term)))
}

function deriveFoundationCourseLearningNodeDesign(node: KnowledgeNode): FoundationCourseLearningNodeDesign {
  const evidence = node.evidenceTypes.map((value) => value.trim().toLowerCase())
  const classifications: FoundationLearningClassification[] = []
  const learnTreatments: FoundationLearnTreatment[] = ['core_explanation']
  const practiceCapabilities: FoundationPracticeCapability[] = ['retrieval']

  const hasFormula = node.kind === 'formula' || node.formulas.length > 0
    || hasEvidence(evidence, 'quantitative', 'calculation', 'ratio', 'numerical')
  const hasProcedure = node.kind === 'skill'
    || hasEvidence(evidence, 'procedure', 'method', 'construction')
  const hasApplication = node.applicationContexts.length > 0
    || hasEvidence(evidence, 'application', 'contextual', 'case')
  const hasMisconception = node.misconceptions.length > 0
  const hasComparison = hasEvidence(evidence, 'compare', 'comparison', 'discriminat', 'distinguish')
  const hasAnalysis = hasEvidence(evidence, 'analysis', 'analyse', 'reasoning', 'diagnosis', 'diagnostic')
  const hasEvaluation = hasEvidence(evidence, 'evaluation', 'evaluate', 'judgement', 'judgment', 'decision making')
  const hasFramework = hasEvidence(evidence, 'framework', 'model application')
  const hasConstruction = hasEvidence(evidence, 'construction', 'construct', 'completion')
  const hasGraphInterpretation = hasEvidence(evidence, 'graph', 'chart', 'data interpretation', 'graphical interpretation')
  const hasInterpretation = hasEvidence(evidence, 'interpretation', 'interpret', 'data-quality', 'data quality')
  const hasCausal = hasEvidence(evidence, 'causal', 'cause', 'consequence', 'mechanism')
  const hasProcess = hasEvidence(evidence, 'sequence', 'process', 'ordered stages')
  const hasSynoptic = hasEvidence(evidence, 'synoptic', 'cross-topic', 'cross topic', 'integrat', 'mixed-topic', 'mixed topic')
  const hasExamResponse = hasEvidence(evidence, 'exam response', 'extended response', 'essay', 'source response')

  if (node.kind === 'concept') classifications.push('concept')
  if (hasComparison) classifications.push('comparison_discrimination')
  if (hasCausal) classifications.push('relationship_causal')
  if (hasProcess) classifications.push('process_sequence')
  if (hasFormula) classifications.push('formula_quantitative')
  if (hasFramework) classifications.push('model_framework')
  if (hasProcedure) classifications.push('procedure_skill')
  if (hasApplication) classifications.push('application_context')
  if (hasAnalysis) classifications.push('analysis_reasoning')
  if (hasEvaluation) classifications.push('evaluation_judgement')
  if (hasMisconception) classifications.push('misconception_risk')
  if (hasSynoptic) classifications.push('synoptic_connection')
  if (hasExamResponse) classifications.push('exam_response_skill')

  if (hasComparison) {
    learnTreatments.push('comparison')
    practiceCapabilities.push('discrimination', 'compare_justify')
  }
  if (hasCausal) {
    learnTreatments.push('relationship_causal_chain')
    practiceCapabilities.push('reasoning_chain')
  }
  if (hasProcess) {
    learnTreatments.push('process_sequence')
    practiceCapabilities.push('procedure_execution')
  }
  if (hasFormula) {
    learnTreatments.push('worked_example', 'guided_example')
    practiceCapabilities.push('calculation', 'interpretation')
  }
  if (hasProcedure) {
    learnTreatments.push('worked_example', 'guided_example')
    practiceCapabilities.push('procedure_execution')
  }
  if (hasApplication) {
    learnTreatments.push('example_non_example')
    practiceCapabilities.push('contextual_application')
  }
  if (hasAnalysis) {
    learnTreatments.push('self_explanation_prompt')
    practiceCapabilities.push('reasoning_chain')
  }
  if (hasEvaluation) {
    learnTreatments.push('self_explanation_prompt')
    practiceCapabilities.push('contextual_judgement')
  }
  if (hasFramework) {
    learnTreatments.push('purposeful_visual', 'example_non_example')
    practiceCapabilities.push('framework_application')
  }
  if (hasConstruction) practiceCapabilities.push('construction')
  if (hasGraphInterpretation) {
    learnTreatments.push('purposeful_visual')
    practiceCapabilities.push('graph_data_interpretation')
  }
  if (hasInterpretation) practiceCapabilities.push('interpretation')
  if (hasMisconception) {
    learnTreatments.push('misconception_repair')
    practiceCapabilities.push('misconception_diagnostic')
  }
  if (hasSynoptic) {
    learnTreatments.push('connection_synoptic_link')
    practiceCapabilities.push('mixed_synoptic_selection')
  }
  if (hasExamResponse) practiceCapabilities.push('short_constructed_response')

  if (classifications.length === 0) classifications.push('concept')

  return foundationCourseLearningNodeDesignSchema.parse({
    nodeId: node.id,
    classifications: unique(classifications),
    learnTreatments: unique(learnTreatments),
    practiceCapabilities: unique(practiceCapabilities),
  })
}

export function deriveFoundationCourseLearningDesign(nodesInput: unknown): FoundationCourseLearningDesign {
  const nodes = z.array(courseKnowledgeModelSchema.shape.nodes.element).min(1).parse(nodesInput)
  const nodeDesigns = nodes.map(deriveFoundationCourseLearningNodeDesign)

  return foundationCourseLearningDesignSchema.parse({
    schemaVersion: 1,
    nodes: nodeDesigns,
    classifications: unique(nodeDesigns.flatMap((node) => node.classifications)),
    learnTreatments: unique(nodeDesigns.flatMap((node) => node.learnTreatments)),
    practiceCapabilities: unique(nodeDesigns.flatMap((node) => node.practiceCapabilities)),
    sourceNodeIds: nodes.map((node) => node.id),
  })
}

export function learningModesForFoundationCourseLearningDesign(design: FoundationCourseLearningDesign) {
  const modes: Array<'explanation' | 'worked_example' | 'retrieval' | 'flashcard' | 'short_answer' | 'application' | 'quantitative'> = [
    'explanation',
  ]
  const capabilities = new Set(design.practiceCapabilities)
  const treatments = new Set(design.learnTreatments)

  if (treatments.has('worked_example') || treatments.has('guided_example')) modes.push('worked_example')
  if (capabilities.has('retrieval')) modes.push('retrieval')
  if ([
    'discrimination',
    'short_constructed_response',
    'procedure_execution',
    'construction',
    'reasoning_chain',
    'compare_justify',
  ].some((capability) => capabilities.has(capability as FoundationPracticeCapability))) modes.push('short_answer')
  if ([
    'graph_data_interpretation',
    'contextual_application',
    'framework_application',
    'contextual_judgement',
    'mixed_synoptic_selection',
  ].some((capability) => capabilities.has(capability as FoundationPracticeCapability))) modes.push('application')
  if (capabilities.has('calculation')) modes.push('quantitative')

  return unique(modes)
}
