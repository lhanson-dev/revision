import { describe, expect, it } from 'vitest'
import matrixText from '../../content-factory/reliability-q3-subject-shape-matrix.json?raw'
import fixtureSourceText from './q3-subject-shape-fixtures.ts?raw'
import {
  q3SubjectShapeFixtures,
  q3SubjectShapeIds,
  runQ3SubjectShape,
  type Q3SubjectShapeId,
} from './q3-subject-shape-fixtures'

type MatrixShape = {
  shape: Q3SubjectShapeId
  fixtureId: string
  status: 'pass' | 'fail'
  characteristics: string[]
  evidence: string[]
}

type Q3Matrix = {
  schemaVersion: number
  status: string
  scope: string
  baseMainSha: string
  pipelineHarness: string
  fixtureHarness: string
  requiredShapes: Q3SubjectShapeId[]
  shapes: MatrixShape[]
  harnessAssertions: string[]
  limitations: string[]
  q3Pass: boolean
  paidPilotEligible: boolean
}

const matrix = JSON.parse(matrixText) as Q3Matrix

describe('Content Factory Q3 subject-shape matrix', () => {
  it('locks the five governed course shapes to one shared contract-integration harness', () => {
    expect(matrix.schemaVersion).toBe(1)
    expect(matrix.status).toBe('complete')
    expect(matrix.scope).toBe('course_agnostic_subject_shapes')
    expect(matrix.baseMainSha).toBe('d71d175ccef06fbfa9a9197de32e721578e69852')
    expect(matrix.pipelineHarness).toBe('src/content-factory/end-to-end-proof.ts')
    expect(matrix.fixtureHarness).toBe('src/content-factory/q3-subject-shape-fixtures.ts')
    expect(new Set(matrix.requiredShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(new Set(matrix.shapes.map((shape) => shape.shape))).toEqual(new Set(q3SubjectShapeIds))
    expect(new Set(matrix.shapes.map((shape) => shape.fixtureId)).size).toBe(q3SubjectShapeIds.length)
    expect(matrix.shapes.every((shape) => shape.status === 'pass')).toBe(true)
    expect(matrix.q3Pass).toBe(true)
    expect(matrix.paidPilotEligible).toBe(false)
  })

  it('keeps machine evidence aligned with the executable fixtures', () => {
    for (const fixture of q3SubjectShapeFixtures) {
      const record = matrix.shapes.find((candidate) => candidate.shape === fixture.subjectShape)
      expect(record, `missing Q3 record for ${fixture.subjectShape}`).toBeDefined()
      expect(record?.fixtureId).toBe(fixture.id)
      expect(record?.characteristics).toEqual(fixture.characteristics)
      expect(record?.evidence).toContain('src/content-factory/q3-subject-shape-matrix.test.ts')
      expect(record?.evidence).toContain('src/content-factory/q3-subject-shape-fixtures.ts')
      expect(record?.evidence).toContain('src/content-factory/end-to-end-proof.ts')
    }
  })

  it.each(q3SubjectShapeFixtures)('runs $subjectShape through the same pipeline to expert_review_ready', async (fixture) => {
    const result = await runQ3SubjectShape(fixture)

    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.proofMode).toBe('contract_integration')
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.report.totalRetries).toBe(0)
    expect(result.report.humanInterventionCount).toBe(0)
    expect(result.report.workerRunCount).toBeGreaterThan(0)
    expect(result.report.workUnitCount).toBe(fixture.requirements.length)
    expect(result.report.markableAssessmentItemCount).toBeGreaterThan(0)
    expect(result.report.markingPackCoverageCount).toBe(result.report.markableAssessmentItemCount)
    expect(result.report.providerRoutes.length).toBe(1)
    expect(result.report.providerRoutes[0].provider).toBe('controlled-fixture')
    expect(result.report.providerRoutes[0].model).toBe('q3-subject-shape-v1')
    expect(result.report.providerRoutes[0].observedUsageCost).toBe(0)
    expect(result.report.providerRoutes[0].unpricedRuns).toBe(0)

    const unpricedRuns = result.job.workerRuns.filter((run) => run.usageCost === undefined)
    expect(unpricedRuns.every((run) => !run.provider)).toBe(true)

    const exercisedModes = new Set(fixture.requirements.flatMap((requirement) => requirement.learningModes))
    expect(exercisedModes.size).toBeGreaterThan(0)

    expect(result.package?.reviewedCommit).toBe(fixture.syntheticCommitSha)
  })

  it('does not bind Q3 to the historical Business pilot or overstate educational/live-adapter proof', () => {
    expect(fixtureSourceText).not.toContain('aqa-as-business-7131')
    expect(fixtureSourceText).not.toContain('marketing-research')
    expect(matrix.limitations.join(' ')).toContain('process compatibility')
    expect(matrix.limitations.join(' ')).toContain('does not prove live-adapter behaviour')
    expect(matrix.harnessAssertions.join(' ')).toContain('same runRequestedContentFactoryToExpertReviewReady')
  })
})
