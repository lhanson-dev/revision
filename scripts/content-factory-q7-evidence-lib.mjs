const FRESH_RESAMPLE_MARKERS = [
  'FRESH CANDIDATE RESAMPLE REQUIRED.',
  'FRESH MARKING PACK CANDIDATE RESAMPLE REQUIRED.',
]

const TARGETED_REPAIR_MARKERS = [
  'TARGETED ASSESSMENT ITEM REPAIR REQUIRED.',
  'TARGETED MARKING PACK REPAIR REQUIRED.',
]

const VALID_RECOVERY_SEQUENCES = new Set([
  'initial_generation',
  'initial_generation,targeted_repair',
  'initial_generation,fresh_candidate_resample',
  'initial_generation,targeted_repair,fresh_candidate_resample',
  'initial_generation,fresh_candidate_resample,targeted_repair',
  'initial_generation,targeted_repair,fresh_candidate_resample,targeted_repair',
])

export function classifyProviderInstructions(instructions) {
  const text = typeof instructions === 'string' ? instructions : ''
  if (FRESH_RESAMPLE_MARKERS.some((marker) => text.includes(marker))) return 'fresh_candidate_resample'
  if (TARGETED_REPAIR_MARKERS.some((marker) => text.includes(marker))) return 'targeted_repair'
  return 'initial_generation'
}

export function isValidCandidateRecoverySequence(callKinds) {
  return VALID_RECOVERY_SEQUENCES.has(callKinds.join(','))
}

function sampleNumber(sample) {
  const match = String(sample.sampleId ?? '').match(/-(\d+)$/)
  if (!match) throw new Error(`q7_candidate_aware_evidence_invalid_sample_id:${sample.sampleId}`)
  return Number(match[1])
}

export function expectedQ7JobId(sample) {
  const purpose = sample.workerBoundary === 'assessment_item_generation'
    ? 'assessment'
    : sample.workerBoundary === 'marking_pack_generation'
      ? 'marking'
      : undefined
  if (!purpose) throw new Error(`q7_candidate_aware_evidence_unknown_worker_boundary:${sample.workerBoundary}`)
  return `q7-${sample.subjectShape}-${purpose}-${sampleNumber(sample)}`
}

export function buildCandidateAwareEvidence(rawEvidence, traceEvents, options = {}) {
  const expectedJobIds = new Set(rawEvidence.samples.map(expectedQ7JobId))
  const unmatchedTraceEvents = traceEvents.filter((event) => !expectedJobIds.has(event.jobId))
  const byJobId = new Map()
  for (const event of traceEvents) {
    const events = byJobId.get(event.jobId) ?? []
    events.push(event)
    byJobId.set(event.jobId, events)
  }

  const samples = rawEvidence.samples.map((sample) => {
    const jobId = expectedQ7JobId(sample)
    const events = byJobId.get(jobId) ?? []
    const providerCallKinds = events.map((event) => event.callKind)
    const repairCount = providerCallKinds.filter((kind) => kind === 'targeted_repair').length
    const freshCandidateResampleCount = providerCallKinds.filter((kind) => kind === 'fresh_candidate_resample').length
    const providerCallClassificationComplete = events.length === sample.providerCallCount
      && providerCallKinds[0] === 'initial_generation'
      && isValidCandidateRecoverySequence(providerCallKinds)
      && freshCandidateResampleCount <= 1
      && repairCount <= 2

    return {
      ...sample,
      rawLegacyRepairCount: sample.repairCount,
      repairCount,
      freshCandidateResampleCount,
      providerCallKinds,
      providerRequestNames: events.map((event) => event.requestName),
      providerCallClassificationComplete,
    }
  })

  const classificationComplete = unmatchedTraceEvents.length === 0
    && samples.every((sample) => sample.providerCallClassificationComplete)
  const targetedRepairsObserved = samples.reduce((sum, sample) => sum + sample.repairCount, 0)
  const freshCandidateResamplesObserved = samples.reduce((sum, sample) => sum + sample.freshCandidateResampleCount, 0)

  return {
    ...rawEvidence,
    schemaVersion: 3,
    sourceRawEvidence: {
      schemaVersion: rawEvidence.schemaVersion,
      file: options.rawEvidenceFile ?? null,
      repairCountSemantics: 'legacy_provider_call_count_minus_one_not_sufficient_after_candidate_recovery',
    },
    targetedRepairsObserved,
    freshCandidateResamplesObserved,
    candidateRecoverySampleIds: samples
      .filter((sample) => sample.freshCandidateResampleCount > 0)
      .map((sample) => sample.sampleId),
    candidateRecoveryInstrumentation: {
      method: 'provider_request_instruction_trace',
      complete: classificationComplete,
      unmatchedTraceEventCount: unmatchedTraceEvents.length,
      unmatchedTraceEvents,
    },
    automaticQ7PassCandidate: Boolean(rawEvidence.automaticQ7PassCandidate) && classificationComplete,
    samples,
    limitations: [
      'Known usage cost is the sum of worker provenance where provider usage metadata is available; the production shared spend guard remains the hard US$5 control.',
      'Provider retries are disabled for Q7. Provider request instructions are traced so targeted repairs and fresh candidate resamples are counted separately under ADR-0019.',
      'A controlled fail-closed sample requires classification before Q7 can be called PASS because the Reliability Standard distinguishes genuine educational rejection from a new generic engineering contract class.',
      'The post-Pilot-20 matrix samples knowledge/application MCQs plus calculation, interpretation, analysis and evaluation demands across all five governed subject shapes.',
      'This soak is reliability evidence, not educational benchmark approval.',
    ],
  }
}
