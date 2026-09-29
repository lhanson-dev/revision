import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import { planFoundationInternalLearningWorkUnits } from './foundation-internal-learning-assets'
import { courseKnowledgeModelSchema } from './schema'

const OUT = '.artifacts/content-factory-aqa-business-7132-course-exam-truth'
const ADAPTER = `${OUT}/learning-adapter.json`

function materialiseAdapter() {
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'], {
    encoding: 'utf8',
  })
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-learning-adapter.mjs'], {
    encoding: 'utf8',
  })
  return JSON.parse(readFileSync(ADAPTER, 'utf8')) as {
    artifactType: string
    dependencies: {
      courseTruthFingerprint: string
      subjectFoundationFingerprint: string
    }
    identityBoundary: {
      subjectNodeAliases: Record<string, string>
    }
    coverageModel: unknown
    courseKnowledgeModel: unknown
    learnerAssetRegenerationAllowed: boolean
  }
}

describe('AQA 7132 Course Truth learning adapter', () => {
  it('is accepted by the existing Foundation-native v2 learning planner without detaching from canonical Foundation nodes', () => {
    const adapter = materialiseAdapter()
    const coverage = foundationCoverageModelSchema.parse(adapter.coverageModel)
    const model = courseKnowledgeModelSchema.parse(adapter.courseKnowledgeModel)

    expect(adapter.artifactType).toBe('course_truth_learning_adapter')
    expect(adapter.dependencies.courseTruthFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(adapter.dependencies.subjectFoundationFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(adapter.learnerAssetRegenerationAllowed).toBe(false)
    expect(coverage.requirements).toHaveLength(42)
    expect(model.nodes.length).toBeGreaterThan(0)
    expect(model.nodes.length).toBeLessThan(81)

    const plans = planFoundationInternalLearningWorkUnits(
      { coverageModel: coverage, courseKnowledgeModel: model },
      { plannerVersion: 2 },
    )

    expect(plans).toHaveLength(42)
    expect(plans.every((plan) => plan.learningDesign)).toBe(true)

    const plannedNodeIds = new Set(plans.flatMap((plan) => plan.knowledgeNodeIds))
    expect([...plannedNodeIds].sort()).toEqual(model.nodes.map((node) => node.id).sort())
    expect(Object.keys(adapter.identityBoundary.subjectNodeAliases).sort()).toEqual(model.nodes.map((node) => node.id).sort())
    expect(Object.values(adapter.identityBoundary.subjectNodeAliases)).toContain('BUS-FIN-008')

    const shareMarketNode = model.nodes.find((node) => adapter.identityBoundary.subjectNodeAliases[node.id] === 'BUS-FIN-008')
    expect(shareMarketNode).toBeDefined()
    expect(shareMarketNode?.formulas.join(' ')).toContain('shares in issue')
    expect(shareMarketNode?.summary).toContain('market capitalisation')
  })
})
