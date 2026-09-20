import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  deriveFoundationCourseLearningDesign,
  learningModesForFoundationCourseLearningDesign,
} from './foundation-course-learning-blueprint'
import { planFoundationInternalLearningWorkUnits } from './foundation-internal-learning-assets'
import { courseKnowledgeModelSchema } from './schema'

const jobId = 'learning-blueprint-test'

function knowledgeModel() {
  return courseKnowledgeModelSchema.parse({
    schemaVersion: 1,
    jobId,
    fingerprint: 'knowledge-model-v1',
    nodes: [
      {
        id: 'quantitative-construction-node',
        kind: 'skill',
        summary: 'Construct, calculate, interpret and evaluate quantitative business information.',
        prerequisiteIds: [],
        relatedIds: [],
        formulas: [],
        misconceptions: ['A calculated result is sufficient without interpretation.'],
        applicationContexts: ['cash-flow forecast', 'break-even chart'],
        depth: 'advanced',
        sourceRefs: ['governed-source'],
        boardAlignmentRefs: ['requirement-1'],
        evidenceTypes: [
          'quantitative calculation',
          'construction',
          'graph interpretation',
          'evaluation',
        ],
      },
    ],
  })
}

function coverageModel() {
  return foundationCoverageModelSchema.parse({
    schemaVersion: 2,
    jobId,
    sourceSetFingerprint: 'source-set-v1',
    requirements: [
      {
        requirementId: 'requirement-1',
        officialReference: '1.1',
        requirementSummary: 'Quantitative construction and interpretation',
        skillsOrKnowledge: ['construct, calculate, interpret and evaluate quantitative business information'],
        componentScope: ['paper-1'],
        revisionArea: 'Quantitative decisions',
        sourceRefs: ['governed-source'],
        knowledgeNodeIds: ['quantitative-construction-node'],
        coverageStatus: 'complete',
      },
    ],
  })
}

describe('Foundation Course Learning Blueprint v2', () => {
  it('derives mandatory treatments from structured educational evidence rather than formula presence alone', () => {
    const node = knowledgeModel().nodes[0]
    const design = deriveFoundationCourseLearningDesign([node])

    expect(design.nodes).toHaveLength(1)
    expect(design.nodes[0]).toMatchObject({ nodeId: 'quantitative-construction-node' })
    expect(design.classifications).toEqual(expect.arrayContaining([
      'formula_quantitative',
      'procedure_skill',
      'application_context',
      'evaluation_judgement',
      'misconception_risk',
    ]))
    expect(design.learnTreatments).toEqual(expect.arrayContaining([
      'core_explanation',
      'worked_example',
      'guided_example',
      'purposeful_visual',
      'misconception_repair',
    ]))
    expect(design.practiceCapabilities).toEqual(expect.arrayContaining([
      'calculation',
      'interpretation',
      'procedure_execution',
      'construction',
      'graph_data_interpretation',
      'contextual_application',
      'contextual_judgement',
      'misconception_diagnostic',
    ]))
    expect(learningModesForFoundationCourseLearningDesign(design)).toEqual(expect.arrayContaining([
      'explanation',
      'worked_example',
      'retrieval',
      'short_answer',
      'application',
      'quantitative',
    ]))
  })

  it('preserves the historical planner by default while v2 retains explicit learning design', () => {
    const coverage = coverageModel()
    const model = knowledgeModel()

    const legacy = planFoundationInternalLearningWorkUnits({
      coverageModel: coverage,
      courseKnowledgeModel: model,
    })
    const v2 = planFoundationInternalLearningWorkUnits({
      coverageModel: coverage,
      courseKnowledgeModel: model,
    }, { plannerVersion: 2 })

    expect(legacy[0].learningDesign).toBeUndefined()
    expect(legacy[0].learningModes).toEqual(['explanation', 'retrieval', 'application'])

    expect(v2[0].learningDesign?.nodes).toHaveLength(1)
    expect(v2[0].learningDesign?.practiceCapabilities).toEqual(expect.arrayContaining([
      'calculation',
      'construction',
      'graph_data_interpretation',
      'contextual_judgement',
    ]))
    expect(v2[0].learningModes).toEqual(expect.arrayContaining([
      'worked_example',
      'short_answer',
      'quantitative',
    ]))
  })

  it('recognises governed diagram-amendment and cross-functional evidence labels without Business-specific IDs', () => {
    const model = courseKnowledgeModelSchema.parse({
      schemaVersion: 1,
      jobId,
      fingerprint: 'diagram-and-synoptic-v1',
      nodes: [
        {
          id: 'diagram-skill',
          kind: 'skill',
          summary: 'Interpret and amend a governed diagram.',
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [],
          applicationContexts: ['project planning'],
          depth: 'advanced',
          sourceRefs: ['governed-source'],
          boardAlignmentRefs: [],
          evidenceTypes: ['diagram interpretation', 'diagram amendment', 'calculation'],
        },
        {
          id: 'cross-functional-concept',
          kind: 'concept',
          summary: 'Connect decisions across functions.',
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [],
          applicationContexts: ['integrated decision'],
          depth: 'advanced',
          sourceRefs: ['governed-source'],
          boardAlignmentRefs: [],
          evidenceTypes: ['interrelationship analysis', 'cross-functional evaluation'],
        },
      ],
    })

    const design = deriveFoundationCourseLearningDesign(model.nodes)
    const diagram = design.nodes.find((node) => node.nodeId === 'diagram-skill')
    const crossFunctional = design.nodes.find((node) => node.nodeId === 'cross-functional-concept')

    expect(diagram?.practiceCapabilities).toEqual(expect.arrayContaining([
      'calculation',
      'construction',
      'graph_data_interpretation',
      'procedure_execution',
    ]))
    expect(diagram?.learnTreatments).toEqual(expect.arrayContaining([
      'worked_example',
      'guided_example',
      'purposeful_visual',
    ]))
    expect(crossFunctional?.classifications).toEqual(expect.arrayContaining([
      'analysis_reasoning',
      'evaluation_judgement',
      'synoptic_connection',
    ]))
    expect(crossFunctional?.practiceCapabilities).toEqual(expect.arrayContaining([
      'reasoning_chain',
      'contextual_judgement',
      'mixed_synoptic_selection',
    ]))
  })
})
