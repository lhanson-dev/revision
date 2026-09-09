import { describe, expect, it } from 'vitest'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  createAqaAlevelBusiness7132FoundationLiveWorkers,
  type FoundationStructuredProviderClient,
} from './foundation-live-adapter'
import { courseKnowledgeModelSchema } from './schema'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'

const jobId = 'aqa-7132-canonical-summary-test'

class NarrowingProvider implements FoundationStructuredProviderClient {
  async run(input: Parameters<FoundationStructuredProviderClient['run']>[0]) {
    const payload = input.payload as {
      canonicalKnowledgeNodes: Array<{ id: string; knowledgeItem: string }>
    }
    return {
      status: 'success' as const,
      output: {
        nodes: payload.canonicalKnowledgeNodes.map((node) => ({
          id: node.id,
          kind: 'concept' as const,
          summary: node.id === 'aqa-3-2-2.k01'
            ? 'Decision making considers competition.'
            : `Provider paraphrase for ${node.id}.`,
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [`Provider enrichment for ${node.id}.`],
          applicationContexts: [],
          depth: 'core' as const,
          evidenceTypes: ['explain'],
        })),
      },
      provenance: {
        id: 'narrowing-provider-run',
        contextId: 'narrowing-provider-context',
        contractVersion: '1',
        provider: 'fixture',
      },
    }
  }
}

function canonicalNodeIds(requirementId: string, itemCount: number) {
  return Array.from({ length: itemCount }, (_, index) =>
    `${requirementId}.k${String(index + 1).padStart(2, '0')}`,
  )
}

describe('Foundation live Course Truth canonical summaries', () => {
  it('binds canonical summaries to the governed Revision-owned seed even when provider wording narrows scope', async () => {
    const requirements = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements
    const coverageModel = foundationCoverageModelSchema.parse({
      schemaVersion: 2,
      jobId,
      sourceSetFingerprint: 'source-set-fixture',
      requirements: requirements.map((requirement) => ({
        ...requirement,
        knowledgeNodeIds: canonicalNodeIds(requirement.requirementId, requirement.skillsOrKnowledge.length),
        coverageStatus: 'complete',
      })),
    })
    const workers = createAqaAlevelBusiness7132FoundationLiveWorkers({ provider: new NarrowingProvider() })

    const result = await workers.compileCourseTruth({
      jobId,
      identity: {} as never,
      sourceLicenceRegister: {} as never,
      boardAlignment: {} as never,
      coverageModel,
      requirements,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)

    const model = courseKnowledgeModelSchema.parse(result.output)
    const decisionMaking = model.nodes.find((node) => node.id === 'aqa-3-2-2.k01')
    const governedDecisionMaking = requirements.find((requirement) => requirement.requirementId === 'aqa-3-2-2')!
      .skillsOrKnowledge[0]

    expect(decisionMaking?.summary).toBe(governedDecisionMaking)
    expect(decisionMaking?.summary).toContain('external environment including competition')
    expect(decisionMaking?.summary).not.toBe('Decision making considers competition.')
    expect(decisionMaking?.misconceptions).toEqual(['Provider enrichment for aqa-3-2-2.k01.'])

    for (const requirement of requirements) {
      requirement.skillsOrKnowledge.forEach((knowledgeItem, index) => {
        const id = `${requirement.requirementId}.k${String(index + 1).padStart(2, '0')}`
        expect(model.nodes.find((node) => node.id === id)?.summary).toBe(knowledgeItem)
      })
    }
  })
})
