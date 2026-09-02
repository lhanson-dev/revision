import { describe, expect, it } from 'vitest'
import requalificationText from '../../content-factory/reliability-post-pilot17-requalification.json?raw'
import historicalQ1Text from '../../content-factory/reliability-contract-inventory.json?raw'
import historicalQ2Text from '../../content-factory/reliability-q2-contract-matrix.json?raw'
import historicalQ3Text from '../../content-factory/reliability-q3-subject-shape-matrix.json?raw'
import historicalQ4Text from '../../content-factory/reliability-q4-deterministic-pipeline-simulation.json?raw'
import historicalQ5Text from '../../content-factory/reliability-q5-restart-reuse-invalidation.json?raw'
import historicalQ6Text from '../../content-factory/reliability-q6-repeated-stability.json?raw'
import { assessmentItemWorkerOutputSchema } from './assessment-and-marking'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
} from './durable-worker-dependencies'
import { normaliseAssessmentItemOptionalUnits } from './openai-assessment-item-provider-normalizer'
import {
  q3SubjectShapeFixtures,
  q3SubjectShapeIds,
  runQ3SubjectShape,
} from './q3-subject-shape-fixtures'
import { runQ4DeterministicPipelineSimulation } from './q4-deterministic-pipeline-fixture'
import { q6RepetitionCount } from './q6-repeated-qualification-fixture'

type GateStatus = {
  status: 'pass'
  currentEvidence: string[]
}

type RequalificationRecord = {
  schemaVersion: number
  authority: string
  status: string
  scope: string
  reviewedImplementationMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  globalQualificationRequiredState: string
  triggerEvidence: {
    pilot: number
    workflowRunId: number
    jobIssueNumber: number
    failedImplementationMainSha: string
    correctedImplementationMainSha: string
  }
  gates: {
    'Q1-worker-contract-inventory': GateStatus & {
      ownershipExtensions: Array<{ worker: string; fieldClass: string; ownership: string; evidence: string }>
    }
    'Q2-provider-free-contract-matrix': GateStatus & { currentCoverage: string[] }
    'Q3-subject-shape-matrix': GateStatus & { requiredShapes: string[]; crossSubjectRegression: string }
    'Q4-deterministic-pipeline-simulation': GateStatus & {
      providerCallsUsed: boolean
      correctedBoundaryAssertion: string
    }
    'Q5-restart-reuse-dependency-invalidation': GateStatus & {
      currentSemanticVersions: Record<string, string>
      invalidationRule: string
      providerCallsUsed: boolean
    }
    'Q6-repeated-qualification-stability': GateStatus & {
      repetitionCount: number
      subjectShapePipelineRuns: number
      deterministicPipelineRuns: number
      restartReuseScenarioSets: number
      providerCallsUsed: boolean
    }
  }
  limitations: string[]
}

const requalification = JSON.parse(requalificationText) as RequalificationRecord

const historical = {
  q1: JSON.parse(historicalQ1Text) as { status: string; q1Pass: boolean },
  q2: JSON.parse(historicalQ2Text) as { status: string; q2Pass: boolean },
  q3: JSON.parse(historicalQ3Text) as { status: string; q3Pass: boolean },
  q4: JSON.parse(historicalQ4Text) as { status: string; q4Pass: boolean },
  q5: JSON.parse(historicalQ5Text) as { status: string; q5Pass: boolean; providerCallsUsed: boolean },
  q6: JSON.parse(historicalQ6Text) as { status: string; q6Pass: boolean; providerCallsUsed: boolean; repetitionCount: number },
}

const expectedGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

function syntheticAssessmentItem(context?: {
  id: string
  title: string
  body: string
  dataPoints?: Array<{ label: string; value: string; unit?: unknown }>
}) {
  return {
    id: 'synthetic-item',
    version: '1',
    title: 'Synthetic assessment item',
    componentId: 'paper-1',
    questionFamilyId: 'synthetic-family',
    requirementIds: ['synthetic-requirement'],
    knowledgeNodeIds: ['synthetic-node'],
    format: 'written_question',
    command: 'Explain',
    maxMark: 4,
    questionWording: 'Explain the relevant idea using the supplied information where appropriate.',
    context,
  }
}

describe('Content Factory post-Pilot-17 provider-free requalification', () => {
  it('records all Q1-Q6 gates against the corrected approved-main implementation without itself granting paid execution', () => {
    expect(requalification.schemaVersion).toBe(1)
    expect(requalification.authority).toBe('80-company-workflows/Content Factory Reliability Qualification Standard.md')
    expect(requalification.status).toBe('complete')
    expect(requalification.scope).toBe('post_pilot_17_provider_free_requalification')
    expect(requalification.reviewedImplementationMainSha).toBe('d5fe9e8bc2eee82f0236711361739abe129e782a')
    expect(requalification.triggerEvidence).toEqual({
      pilot: 17,
      workflowRunId: 33221401966,
      jobIssueNumber: 230,
      failedImplementationMainSha: 'f9a9cde3e98faca3b1e17b5d575d4282677f06cc',
      correctedImplementationMainSha: 'd5fe9e8bc2eee82f0236711361739abe129e782a',
    })
    expect(requalification.verificationMode).toBe('exact_head_ci')
    expect(requalification.providerCallsUsed).toBe(false)
    expect(requalification.paidPilotEligible).toBe(false)
    expect(requalification.globalQualificationRequiredState).toBe('paused')
    expect(Object.keys(requalification.gates)).toEqual(expectedGates)
    expect(Object.values(requalification.gates).every((gate) => gate.status === 'pass')).toBe(true)
  })

  it('preserves historical Q1-Q6 evidence instead of rewriting it', () => {
    expect(historical.q1).toMatchObject({ status: 'complete', q1Pass: true })
    expect(historical.q2).toMatchObject({ status: 'complete', q2Pass: true })
    expect(historical.q3).toMatchObject({ status: 'complete', q3Pass: true })
    expect(historical.q4).toMatchObject({ status: 'complete', q4Pass: true })
    expect(historical.q5).toMatchObject({ status: 'complete', q5Pass: true, providerCallsUsed: false })
    expect(historical.q6).toMatchObject({ status: 'complete', q6Pass: true, providerCallsUsed: false, repetitionCount: 3 })
    for (const gate of Object.values(requalification.gates)) {
      expect(gate.currentEvidence.length).toBeGreaterThan(0)
    }
  })

  it('classifies the Pilot 17 assessment boundary using the governed ownership vocabulary', () => {
    const ownership = requalification.gates['Q1-worker-contract-inventory'].ownershipExtensions
    expect(ownership.map((entry) => entry.ownership)).toEqual([
      'deterministically_derived',
      'generative_judgement',
      'fail_closed',
    ])
    expect(ownership.every((entry) => entry.worker === 'assessment_item_generation')).toBe(true)
    expect(ownership.every((entry) => entry.fieldClass.length > 0 && entry.evidence.length > 0)).toBe(true)
  })

  it('normalizes only semantically empty optional units and leaves the strict worker schema in control', () => {
    const raw = syntheticAssessmentItem({
      id: 'quantitative-context',
      title: 'Synthetic quantitative context',
      body: 'Synthetic values for reliability qualification.',
      dataPoints: [
        { label: 'unitless-index', value: '110', unit: '' },
        { label: 'growth', value: '8', unit: '%' },
        { label: 'cost', value: '120', unit: '£' },
        { label: 'mass', value: '4', unit: 'kg' },
        { label: 'turnover', value: '250', unit: '£000' },
      ],
    })

    const normalized = normaliseAssessmentItemOptionalUnits(raw)
    const parsed = assessmentItemWorkerOutputSchema.parse(normalized)

    expect(parsed.context?.dataPoints).toEqual([
      { label: 'unitless-index', value: '110' },
      { label: 'growth', value: '8', unit: '%' },
      { label: 'cost', value: '120', unit: '£' },
      { label: 'mass', value: '4', unit: 'kg' },
      { label: 'turnover', value: '250', unit: '£000' },
    ])

    expect(() => assessmentItemWorkerOutputSchema.parse(normaliseAssessmentItemOptionalUnits(
      syntheticAssessmentItem({
        id: 'invalid-required-value',
        title: 'Invalid required value',
        body: 'Synthetic invalid contract case.',
        dataPoints: [{ label: 'required-value', value: '', unit: '' }],
      }),
    ))).toThrow()

    expect(() => assessmentItemWorkerOutputSchema.parse(normaliseAssessmentItemOptionalUnits(
      syntheticAssessmentItem({
        id: 'invalid-unit-type',
        title: 'Invalid unit type',
        body: 'Synthetic invalid contract case.',
        dataPoints: [{ label: 'value', value: '10', unit: 123 }],
      }),
    ))).toThrow()
  })

  it.each(q3SubjectShapeFixtures)('keeps $subjectShape compatible with the shared provider-free pipeline without fabricating unit metadata', async (fixture) => {
    const result = await runQ3SubjectShape(fixture)
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.observedUsageCost).toBe(0)

    const shapeProbe = fixture.subjectShape === 'quantitative_business_economics'
      ? syntheticAssessmentItem({
          id: 'shape-quantitative',
          title: 'Quantitative shape',
          body: 'Synthetic quantitative shape probe.',
          dataPoints: [{ label: 'index', value: '100', unit: '   ' }],
        })
      : fixture.subjectShape === 'science'
        ? syntheticAssessmentItem({
            id: 'shape-science',
            title: 'Science shape',
            body: 'Synthetic science shape probe.',
            dataPoints: [{ label: 'measurement', value: '42', unit: 'kg' }],
          })
        : fixture.subjectShape === 'mathematics'
          ? syntheticAssessmentItem()
          : syntheticAssessmentItem({
              id: `shape-${fixture.subjectShape}`,
              title: 'Non-quantitative shape',
              body: 'Synthetic non-quantitative material with no required unit metadata.',
              dataPoints: [],
            })

    const normalized = assessmentItemWorkerOutputSchema.parse(normaliseAssessmentItemOptionalUnits(shapeProbe))
    if (fixture.subjectShape === 'quantitative_business_economics') {
      expect(normalized.context?.dataPoints[0]).toEqual({ label: 'index', value: '100' })
    }
    if (fixture.subjectShape === 'science') {
      expect(normalized.context?.dataPoints[0]).toEqual({ label: 'measurement', value: '42', unit: 'kg' })
    }
    if (fixture.subjectShape === 'mathematics') {
      expect(normalized.context).toBeUndefined()
    }
    if (fixture.subjectShape === 'essay_humanities' || fixture.subjectShape === 'language_prescribed_text') {
      expect(normalized.context?.dataPoints).toEqual([])
    }
  })

  it('composes the corrected optional-unit boundary with the full Q4 deterministic pipeline simulation', async () => {
    const normalized = assessmentItemWorkerOutputSchema.parse(normaliseAssessmentItemOptionalUnits(
      syntheticAssessmentItem({
        id: 'q4-boundary-probe',
        title: 'Q4 boundary probe',
        body: 'Synthetic deterministic-pipeline boundary probe.',
        dataPoints: [
          { label: 'unitless-a', value: '20', unit: '' },
          { label: 'unitless-b', value: '5' },
        ],
      }),
    ))
    expect(normalized.context?.dataPoints).toEqual([
      { label: 'unitless-a', value: '20' },
      { label: 'unitless-b', value: '5' },
    ])

    const result = await runQ4DeterministicPipelineSimulation()
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.report.observedUsageCost).toBe(0)
    expect(result.latestManifest.publicationStatus).toBe('factory_generated_unassured')
  })

  it('preserves the historical Pilot 17 v2 semantic record while current Assessment Item recovery semantics advance independently', () => {
    const q5 = requalification.gates['Q5-restart-reuse-dependency-invalidation']
    expect(q5.currentSemanticVersions).toEqual({ generateAssessmentItem: '2+output-integrity-v2' })
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('3+output-integrity-v7')
    expect(q5.providerCallsUsed).toBe(false)

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')

    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
  })

  it('binds Q6 to the governed three-repeat current qualification suites with zero provider calls', () => {
    const q6 = requalification.gates['Q6-repeated-qualification-stability']
    expect(q6RepetitionCount).toBe(3)
    expect(q6.repetitionCount).toBe(q6RepetitionCount)
    expect(q6.subjectShapePipelineRuns).toBe(q3SubjectShapeIds.length * q6RepetitionCount)
    expect(q6.deterministicPipelineRuns).toBe(q6RepetitionCount)
    expect(q6.restartReuseScenarioSets).toBe(q6RepetitionCount)
    expect(q6.providerCallsUsed).toBe(false)
    expect(requalification.limitations.join(' ')).toContain('does not prove live external-provider behaviour')
  })
})
