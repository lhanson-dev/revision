import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  foundationInternalLearningWorkUnitSchema,
  planFoundationInternalLearningWorkUnits,
} from './foundation-internal-learning-assets'
import { courseKnowledgeModelSchema } from './schema'

const coverageModel = foundationCoverageModelSchema.parse({
  schemaVersion: 2,
  jobId: 'course-1',
  sourceSetFingerprint: 'source-set-1',
  requirements: [{
    requirementId: 'requirement-1',
    officialReference: '1.1',
    requirementSummary: 'Use quantitative evidence in context.',
    skillsOrKnowledge: ['Use quantitative evidence in context.'],
    componentScope: ['component-1'],
    revisionArea: 'Quantitative evidence',
    sourceRefs: ['source-1'],
    knowledgeNodeIds: ['node-1'],
    coverageStatus: 'complete',
  }],
})

const courseKnowledgeModel = courseKnowledgeModelSchema.parse({
  schemaVersion: 1,
  jobId: 'course-1',
  fingerprint: 'knowledge-1',
  nodes: [{
    id: 'node-1',
    kind: 'skill',
    summary: 'Calculate and interpret a percentage measure.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: [],
    misconceptions: ['A percentage can be interpreted without considering its context.'],
    applicationContexts: ['percentage comparison'],
    depth: 'core',
    sourceRefs: ['source-1'],
    boardAlignmentRefs: [],
    evidenceTypes: ['quantitative calculation', 'contextual decision making'],
  }],
})

describe('Foundation-native Course Learning Blueprint migration', () => {
  it('emits Blueprint-v1 work units with atomic Course Truth obligations and required active modes', () => {
    const [plan] = planFoundationInternalLearningWorkUnits({ coverageModel, courseKnowledgeModel })

    expect(plan.planningModel).toBe('course_learning_blueprint_v1')
    expect(plan.nodePlans).toHaveLength(1)
    expect(plan.learningModes).toEqual(expect.arrayContaining([
      'explanation',
      'worked_example',
      'retrieval',
      'quantitative',
      'application',
    ]))
    expect(plan.requiredTeachingPoints).toEqual(expect.arrayContaining([
      'Use quantitative evidence in context.',
      'Course Truth [node-1]: Calculate and interpret a percentage measure.',
      'Misconception to diagnose and repair [node-1]: A percentage can be interpreted without considering its context.',
      'Required application context [node-1]: percentage comparison',
      'Required evidence demand [node-1]: quantitative calculation',
      'Required evidence demand [node-1]: contextual decision making',
    ]))
  })

  it('continues to parse historical work-unit evidence without rewriting it as Blueprint v1', () => {
    const historical = foundationInternalLearningWorkUnitSchema.parse({
      id: 'foundation-historical-area',
      title: 'Historical area',
      revisionArea: 'Historical area',
      requirementIds: ['requirement-1'],
      knowledgeNodeIds: ['node-1'],
      learningModes: ['explanation', 'retrieval'],
      requiredOutputs: ['learning', 'practice'],
      scope: 'course',
      componentIds: [],
      sourceRefs: ['source-1'],
      requiredTeachingPoints: ['Historical governed teaching point.'],
    })

    expect(historical.planningModel).toBe('legacy_v1')
    expect(historical.nodePlans).toEqual([])
  })
})
