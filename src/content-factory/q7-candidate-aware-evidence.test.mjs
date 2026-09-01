import { describe, expect, it } from 'vitest'
import {
  buildCandidateAwareEvidence,
  classifyProviderInstructions,
  isValidCandidateRecoverySequence,
} from '../../scripts/content-factory-q7-evidence-lib.mjs'

const baseSample = {
  sampleId: 'science-assessment_item_generation-2',
  subjectShape: 'science',
  workerBoundary: 'assessment_item_generation',
  providerCallCount: 4,
  repairCount: 3,
  status: 'success',
  disposition: 'accepted',
  provider: 'openai',
  model: 'gpt-5.6-terra',
  contractVersion: '8',
  retryCount: 3,
  usageCostUsd: 0.04,
}

function rawEvidence(samples = [baseSample]) {
  return {
    schemaVersion: 2,
    artifactType: 'content_factory_reliability_v2_q7_live_worker_soak_evidence',
    automaticQ7PassCandidate: true,
    samples,
  }
}

function trace(callKind, requestName) {
  return {
    jobId: 'q7-science-assessment-2',
    callKind,
    requestName,
  }
}

describe('candidate-aware Q7 evidence instrumentation', () => {
  it('separates targeted repair from fresh candidate resampling', () => {
    const result = buildCandidateAwareEvidence(rawEvidence(), [
      trace('initial_generation', 'content-factory-assessment-item-v2'),
      trace('targeted_repair', 'content-factory-assessment-item-v2-repair'),
      trace('fresh_candidate_resample', 'content-factory-assessment-item-v2-resample'),
      trace('targeted_repair', 'content-factory-assessment-item-v2-repair'),
    ])

    expect(result.schemaVersion).toBe(3)
    expect(result.candidateRecoveryInstrumentation.complete).toBe(true)
    expect(result.targetedRepairsObserved).toBe(2)
    expect(result.freshCandidateResamplesObserved).toBe(1)
    expect(result.candidateRecoverySampleIds).toEqual(['science-assessment_item_generation-2'])
    expect(result.samples[0]).toMatchObject({
      rawLegacyRepairCount: 3,
      repairCount: 2,
      freshCandidateResampleCount: 1,
      providerCallClassificationComplete: true,
    })
    expect(result.automaticQ7PassCandidate).toBe(true)
  })

  it('fails classification when a sequence would imply a second repair without a fresh candidate', () => {
    const result = buildCandidateAwareEvidence(rawEvidence({
      ...rawEvidence(),
    }.samples), [
      trace('initial_generation', 'content-factory-assessment-item-v2'),
      trace('targeted_repair', 'content-factory-assessment-item-v2-repair'),
      trace('targeted_repair', 'content-factory-assessment-item-v2-repair'),
      trace('fresh_candidate_resample', 'content-factory-assessment-item-v2-resample'),
    ])

    expect(result.candidateRecoveryInstrumentation.complete).toBe(false)
    expect(result.automaticQ7PassCandidate).toBe(false)
  })

  it('recognises the governed Assessment and Marking recovery instruction markers', () => {
    expect(classifyProviderInstructions('TARGETED ASSESSMENT ITEM REPAIR REQUIRED.')).toBe('targeted_repair')
    expect(classifyProviderInstructions('TARGETED MARKING PACK REPAIR REQUIRED.')).toBe('targeted_repair')
    expect(classifyProviderInstructions('FRESH CANDIDATE RESAMPLE REQUIRED.')).toBe('fresh_candidate_resample')
    expect(classifyProviderInstructions('FRESH MARKING PACK CANDIDATE RESAMPLE REQUIRED.')).toBe('fresh_candidate_resample')
    expect(classifyProviderInstructions('ordinary generation')).toBe('initial_generation')
    expect(isValidCandidateRecoverySequence([
      'initial_generation',
      'targeted_repair',
      'fresh_candidate_resample',
      'targeted_repair',
    ])).toBe(true)
  })
})
