import {
  approvedCourseFoundationSchema,
  foundationCandidateSchema,
  foundationJobSchema,
  type ApprovedCourseFoundation,
  type FoundationApprovalEvidence,
  type FoundationCandidate,
  type FoundationJob,
  type FoundationState,
  type FoundationWorkingState,
} from './foundation-schema'

const transitionMap: Record<FoundationState, readonly FoundationState[]> = {
  requested: ['compiling', 'superseded'],
  compiling: ['assuring', 'superseded'],
  assuring: ['expert_review', 'superseded'],
  expert_review: ['foundation_approved', 'superseded'],
  foundation_approved: ['superseded'],
  blocked: ['superseded'],
  superseded: [],
}

function unresolvedOperationalBlockers(job: FoundationJob) {
  return job.blockers.filter((blocker) => !blocker.resolvedAt)
}

function candidateApprovalProblems(candidate: FoundationCandidate) {
  return [
    candidate.deterministicAssurance.status !== 'pass'
      ? 'Deterministic Foundation assurance must pass before expert approval'
      : null,
    candidate.independentReview.status !== 'pass'
      ? 'Independent Foundation review must pass before expert approval'
      : null,
    candidate.unresolvedBlockers.length > 0
      ? 'Foundation Candidate has unresolved blockers'
      : null,
  ].filter((problem): problem is string => Boolean(problem))
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(',')}}`
  }

  throw new Error(`Unsupported Foundation fingerprint value: ${typeof value}`)
}

function fingerprintPayload(candidateInput: FoundationCandidate) {
  const candidate = foundationCandidateSchema.parse(candidateInput)
  return {
    schemaVersion: candidate.schemaVersion,
    courseIdentity: candidate.courseIdentity,
    cohortValidity: candidate.cohortValidity,
    sourceLicenceRegister: candidate.sourceLicenceRegister,
    boardAlignment: candidate.boardAlignment,
    coverageModel: candidate.coverageModel,
    courseKnowledgeModel: candidate.courseKnowledgeModel,
    assessmentBlueprint: candidate.assessmentBlueprint,
    questionFamilies: [...candidate.questionFamilies]
      .sort((left, right) => `${left.ref}:${left.fingerprint}`.localeCompare(`${right.ref}:${right.fingerprint}`)),
    sourceSetFingerprint: candidate.provenance.sourceSetFingerprint,
  }
}

export async function computeFoundationFingerprint(candidateInput: FoundationCandidate) {
  const bytes = new TextEncoder().encode(canonicalJson(fingerprintPayload(candidateInput)))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createFoundationJob(input: {
  jobId: string
  createdAt: string
}): FoundationJob {
  return foundationJobSchema.parse({
    schemaVersion: 1,
    jobId: input.jobId,
    state: 'requested',
    blockers: [],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  })
}

export function setFoundationCandidate(
  jobInput: FoundationJob,
  candidateInput: FoundationCandidate,
  updatedAt: string,
): FoundationJob {
  const job = foundationJobSchema.parse(jobInput)
  const candidate = foundationCandidateSchema.parse(candidateInput)

  if (!['compiling', 'assuring'].includes(job.state)) {
    throw new Error('Foundation Candidate may be changed only while compiling or assuring')
  }
  if (unresolvedOperationalBlockers(job).length > 0) throw new Error('Resolve all Foundation job blockers before changing the candidate')

  return foundationJobSchema.parse({
    ...job,
    candidate,
    updatedAt,
  })
}

export function getFoundationTransitionProblems(
  jobInput: FoundationJob,
  target: FoundationState,
): string[] {
  const job = foundationJobSchema.parse(jobInput)

  if (job.state === 'blocked' && target !== 'superseded') {
    return ['Blocked Foundation jobs must be resumed before advancing']
  }
  if (!transitionMap[job.state].includes(target)) {
    return [`Foundation transition ${job.state} -> ${target} is not allowed`]
  }
  if (target !== 'superseded' && unresolvedOperationalBlockers(job).length > 0) {
    return ['Resolve all Foundation job blockers before advancing']
  }

  switch (target) {
    case 'assuring':
      return job.candidate ? [] : ['A complete Foundation Candidate is required before assurance']
    case 'expert_review':
      return job.candidate
        ? candidateApprovalProblems(job.candidate)
        : ['A complete Foundation Candidate is required before expert review']
    case 'foundation_approved':
      return ['Use approveFoundation to enter foundation_approved with exact approval evidence']
    default:
      return []
  }
}

export function advanceFoundationJob(
  jobInput: FoundationJob,
  target: Exclude<FoundationState, 'foundation_approved' | 'blocked'>,
  updatedAt: string,
): FoundationJob {
  const job = foundationJobSchema.parse(jobInput)
  const problems = getFoundationTransitionProblems(job, target)
  if (problems.length > 0) throw new Error(problems.join('; '))

  return foundationJobSchema.parse({
    ...job,
    state: target,
    blockedFromState: target === 'superseded' ? undefined : job.blockedFromState,
    updatedAt,
  })
}

export function blockFoundationJob(
  jobInput: FoundationJob,
  blocker: { id: string; reason: string; createdAt: string },
): FoundationJob {
  const job = foundationJobSchema.parse(jobInput)
  if (!['requested', 'compiling', 'assuring', 'expert_review'].includes(job.state)) {
    throw new Error(`Foundation state ${job.state} cannot be blocked`)
  }

  const blockedFromState = job.state as FoundationWorkingState
  return foundationJobSchema.parse({
    ...job,
    state: 'blocked',
    blockedFromState,
    blockers: [
      ...job.blockers,
      {
        ...blocker,
        stage: blockedFromState,
      },
    ],
    updatedAt: blocker.createdAt,
  })
}

export function resumeFoundationJob(
  jobInput: FoundationJob,
  blockerId: string,
  updatedAt: string,
): FoundationJob {
  const job = foundationJobSchema.parse(jobInput)
  if (job.state !== 'blocked' || !job.blockedFromState) {
    throw new Error('Only blocked Foundation jobs can be resumed')
  }

  let found = false
  const blockers = job.blockers.map((blocker) => {
    if (blocker.id !== blockerId || blocker.resolvedAt) return blocker
    found = true
    return { ...blocker, resolvedAt: updatedAt }
  })

  if (!found) throw new Error(`Unresolved Foundation blocker ${blockerId} was not found`)
  if (blockers.some((blocker) => !blocker.resolvedAt)) {
    throw new Error('All Foundation blockers must be resolved before the job can resume')
  }

  return foundationJobSchema.parse({
    ...job,
    state: job.blockedFromState,
    blockedFromState: undefined,
    blockers,
    updatedAt,
  })
}

export async function approveFoundation(
  jobInput: FoundationJob,
  input: {
    foundationId: string
    foundationVersion: number
    approval: FoundationApprovalEvidence
    knownLimitations?: string[]
  },
): Promise<FoundationJob> {
  const job = foundationJobSchema.parse(jobInput)
  if (job.state !== 'expert_review') {
    throw new Error('Foundation approval is allowed only from expert_review')
  }
  if (!job.candidate) throw new Error('A complete Foundation Candidate is required for approval')
  if (unresolvedOperationalBlockers(job).length > 0) {
    throw new Error('Resolve all Foundation job blockers before approval')
  }

  const problems = candidateApprovalProblems(job.candidate)
  if (problems.length > 0) throw new Error(problems.join('; '))

  const approvedFoundation = approvedCourseFoundationSchema.parse({
    schemaVersion: 1,
    foundationId: input.foundationId,
    foundationVersion: input.foundationVersion,
    foundationFingerprint: await computeFoundationFingerprint(job.candidate),
    candidate: job.candidate,
    approval: input.approval,
    knownLimitations: input.knownLimitations ?? job.candidate.knownLimitations,
  })

  return foundationJobSchema.parse({
    ...job,
    state: 'foundation_approved',
    candidate: undefined,
    approvedFoundation,
    updatedAt: input.approval.approvedAt,
  })
}

export async function assertApprovedFoundationIntegrity(foundationInput: ApprovedCourseFoundation) {
  const foundation = approvedCourseFoundationSchema.parse(foundationInput)
  const expectedFingerprint = await computeFoundationFingerprint(foundation.candidate)
  if (foundation.foundationFingerprint !== expectedFingerprint) {
    throw new Error('Approved Course Foundation fingerprint does not match its exact Foundation Candidate')
  }
  return foundation
}

export function assertFoundationVersionInvariant(
  previousInput: ApprovedCourseFoundation,
  nextInput: ApprovedCourseFoundation,
) {
  const previous = approvedCourseFoundationSchema.parse(previousInput)
  const next = approvedCourseFoundationSchema.parse(nextInput)

  if (previous.foundationId !== next.foundationId) {
    throw new Error('Foundation version comparison requires the same foundationId')
  }

  if (previous.foundationFingerprint === next.foundationFingerprint) {
    if (previous.foundationVersion !== next.foundationVersion) {
      throw new Error('Unchanged Foundation inputs must retain the same foundationVersion')
    }
    return
  }

  if (next.foundationVersion <= previous.foundationVersion) {
    throw new Error('Changed Foundation inputs require a newer foundationVersion')
  }
}
