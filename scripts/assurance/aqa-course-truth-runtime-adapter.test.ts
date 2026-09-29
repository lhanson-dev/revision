import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema,
} from '../../src/content-factory/foundation-compilation'
import { planFoundationInternalLearningWorkUnits } from '../../src/content-factory/foundation-internal-learning-assets'
import { boardAlignmentSchema, courseKnowledgeModelSchema } from '../../src/content-factory/schema'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const ADAPTER = `${OUT}/runtime-adapter.json`

function materialiseAdapter() {
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'], {
    encoding: 'utf8',
  })
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs'], {
    encoding: 'utf8',
  })
  return JSON.parse(readFileSync(ADAPTER, 'utf8')) as {
    adapter_id: string
    dependencies: {
      subject_foundation_fingerprint: string
      course_truth_fingerprint: string
      exam_truth_fingerprint: string
    }
    gates: {
      exact_course_assurance_required: boolean
      learner_asset_regeneration_allowed: boolean
      publication_allowed: boolean
    }
    board_alignment: unknown
    foundation_coverage_model: unknown
    course_knowledge_model: unknown
    assessment_blueprint_compatibility: unknown
    lineage: {
      node_crosswalk: Array<{
        runtime_node_id: string
        subject_foundation_node_id: string
      }>
    }
  }
}

describe('AQA 7132 Course Truth runtime adapter', () => {
  it('is accepted by current Content Factory schemas and the Foundation-native v2 learning planner without detaching from canonical Foundation nodes', () => {
    const adapter = materialiseAdapter()
    const boardAlignment = boardAlignmentSchema.parse(adapter.board_alignment)
    const coverage = foundationCoverageModelSchema.parse(adapter.foundation_coverage_model)
    const model = courseKnowledgeModelSchema.parse(adapter.course_knowledge_model)
    const assessmentBlueprint = foundationAssessmentBlueprintSchema.parse(adapter.assessment_blueprint_compatibility)

    expect(adapter.adapter_id).toBe('aqa-business-7132-2027-course-truth-runtime-adapter-v1')
    expect(adapter.dependencies.course_truth_fingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(adapter.dependencies.exam_truth_fingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(adapter.dependencies.subject_foundation_fingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(adapter.gates.exact_course_assurance_required).toBe(true)
    expect(adapter.gates.learner_asset_regeneration_allowed).toBe(false)
    expect(adapter.gates.publication_allowed).toBe(false)

    expect(boardAlignment.verificationStatus).toBe('verified')
    expect(coverage.requirements).toHaveLength(42)
    expect(model.nodes.length).toBeGreaterThan(0)
    expect(model.nodes.length).toBeLessThan(81)
    expect(assessmentBlueprint.courseKnowledgeModelFingerprint).toBe(model.fingerprint)
    expect(assessmentBlueprint.boardAlignmentFingerprint).toBe(boardAlignment.fingerprint)

    const plans = planFoundationInternalLearningWorkUnits(
      { coverageModel: coverage, courseKnowledgeModel: model },
      { plannerVersion: 2 },
    )

    expect(plans).toHaveLength(42)
    expect(plans.every((plan) => plan.learningDesign)).toBe(true)

    const plannedNodeIds = new Set(plans.flatMap((plan) => plan.knowledgeNodeIds))
    expect([...plannedNodeIds].sort()).toEqual(model.nodes.map((node) => node.id).sort())

    const canonicalByRuntimeId = new Map(
      adapter.lineage.node_crosswalk.map((entry) => [entry.runtime_node_id, entry.subject_foundation_node_id]),
    )
    expect(canonicalByRuntimeId.size).toBe(model.nodes.length)
    expect([...canonicalByRuntimeId.values()]).toContain('BUS-FIN-008')

    const shareMarketNode = model.nodes.find((node) => canonicalByRuntimeId.get(node.id) === 'BUS-FIN-008')
    expect(shareMarketNode).toBeDefined()
    expect(shareMarketNode?.formulas.join(' ')).toContain('shares in issue')
    expect(shareMarketNode?.summary).toContain('market capitalisation')
  })
})
