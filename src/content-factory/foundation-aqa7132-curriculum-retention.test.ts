import { describe, expect, it } from 'vitest'
import type { CourseKnowledgeModel } from './schema'
import {
  aqaAlevelBusiness7132SemanticCoverageItems,
  assertAqaAlevelBusiness7132CourseTruthRetention,
} from './foundation-aqa7132-curriculum-retention'
import { canonicalKnowledgeNodeId } from './requirement-led-coverage'

function model(): CourseKnowledgeModel {
  const nodes = aqaAlevelBusiness7132SemanticCoverageItems().map((item) => ({
    id: canonicalKnowledgeNodeId(item),
    kind: 'concept' as const,
    summary: item.text,
    prerequisiteIds: [],
    relatedIds: [],
    formulas: [],
    misconceptions: [],
    applicationContexts: [],
    depth: 'core' as const,
    sourceRefs: ['revision-aqa-7132-2027-course-truth-seed'],
    boardAlignmentRefs: ['paper-1'],
    evidenceTypes: ['explain'],
  }))
  return {
    schemaVersion: 1,
    jobId: 'aqa-7132-retention-test',
    fingerprint: 'test-fingerprint',
    nodes,
  }
}

describe('AQA 7132 final Course Truth semantic retention', () => {
  it('accepts Course Truth that retains the complete reconciled named scope', () => {
    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(model())).not.toThrow()
  })

  it('accepts the exact retained live-proof wording for the course-wide context requirement', () => {
    const liveWording = model()
    liveWording.nodes = liveWording.nodes.map((node) => node.id === 'aqa-3-0-course-context.k01'
      ? {
          ...node,
          summary: node.summary
            .replace(
              'Across the course, apply business ideas to varied business contexts',
              'Business analysis applies ideas across varied contexts',
            )
            .replace(
              'analyse interrelated functional decisions rather than isolated silos',
              'connects functional decisions rather than treating functions as isolated',
            ),
        }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(liveWording)).not.toThrow()
  })

  it('still rejects Course Truth that drops the varied-context requirement', () => {
    const narrowed = model()
    narrowed.nodes = narrowed.nodes.map((node) => node.id === 'aqa-3-0-course-context.k01'
      ? { ...node, summary: node.summary.replace('varied business contexts', 'one fixed context') }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(narrowed))
      .toThrow('missing_required_course_truth_scope:aqa-3-0-course-context:varied contexts')
  })

  it('still rejects Course Truth that drops the interrelated-functions requirement', () => {
    const narrowed = model()
    narrowed.nodes = narrowed.nodes.map((node) => node.id === 'aqa-3-0-course-context.k01'
      ? {
          ...node,
          summary: node.summary.replace(
            'analyse interrelated functional decisions rather than isolated silos',
            'consider each functional decision independently',
          ),
        }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(narrowed))
      .toThrow('missing_required_course_truth_scope:aqa-3-0-course-context:connects functional decisions')
  })

  it('rejects wording that mentions connection but reverses the required interrelationship', () => {
    const contradicted = model()
    contradicted.nodes = contradicted.nodes.map((node) => node.id === 'aqa-3-0-course-context.k01'
      ? {
          ...node,
          summary: node.summary.replace(
            'analyse interrelated functional decisions rather than isolated silos',
            'connects functional decisions but treats functions as isolated',
          ),
        }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(contradicted))
      .toThrow('missing_required_course_truth_scope:aqa-3-0-course-context:rather than treating functions as isolated')
  })

  it('rejects the historical 3.3.4 silent-narrowing failure mode', () => {
    const narrowed = model()
    narrowed.nodes = narrowed.nodes.map((node) => node.id === 'aqa-3-3-4.k01'
      ? {
          ...node,
          summary: node.summary
            .replace('social media and viral marketing', 'promotion channels')
            .replace('multi-channel distribution', 'distribution'),
        }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(narrowed))
      .toThrow('missing_required_course_truth_scope:aqa-3-3-4:social media')
  })

  it('rejects a newly reconciled requirement being dropped after generation', () => {
    const narrowed = model()
    narrowed.nodes = narrowed.nodes.map((node) => node.id === 'aqa-3-6-1.k01'
      ? { ...node, summary: node.summary.replace('alignment of employee and employer values', 'workforce alignment') }
      : node)

    expect(() => assertAqaAlevelBusiness7132CourseTruthRetention(narrowed))
      .toThrow('missing_required_course_truth_scope:aqa-3-6-1:employee and employer values')
  })
})
