import { z } from 'zod'
import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
  sourceLicenceRegisterSchema,
  type BoardAlignment,
  type CourseKnowledgeModel,
  type QuestionFamily,
  type SourceLicenceRegister,
} from './schema'
import {
  fingerprintFoundationArtifact,
  fingerprintFoundationSourceLicenceRegister,
  foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema,
  type FoundationAssessmentBlueprint,
  type FoundationCoverageModel,
} from './foundation-compilation'
import {
  foundationJobSchema,
  type FoundationArtifactRef,
  type FoundationCandidate,
  type FoundationJob,
} from './foundation-schema'
import {
  computeFoundationFingerprint,
  recordDeterministicFoundationAssurance,
} from './foundation-lifecycle'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationDeterministicCheckSchema = z.object({
  checkId: identifierSchema,
  status: z.enum(['pass', 'fail', 'not_applicable']),
  severity: z.enum(['blocking', 'material', 'informational']),
  artifactRefs: z.array(nonEmptyStringSchema).default([]),
  message: nonEmptyStringSchema,
  evidence: z.array(nonEmptyStringSchema).default([]),
}).superRefine((check, context) => {
  if (check.status === 'fail' && check.severity === 'informational') {
    context.addIssue({
      code: 'custom',
      path: ['severity'],
      message: 'Failed Foundation deterministic checks must be blocking or material',
    })
  }
  if (check.status !== 'fail' && check.severity !== 'informational') {
    context.addIssue({
      code: 'custom',
      path: ['severity'],
      message: 'Passing/not-applicable Foundation deterministic checks are informational',
    })
  }
})

export const foundationDeterministicAssuranceReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_deterministic_assurance_report'),
  jobId: identifierSchema,
  candidateId: identifierSchema,
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  decision: z.enum(['pass', 'fail']),
  checks: z.array(foundationDeterministicCheckSchema).min(1),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const hasFailure = report.checks.some((check) => check.status === 'fail')
  if ((report.decision === 'fail') !== hasFailure) {
    context.addIssue({
      code: 'custom',
      path: ['decision'],
      message: 'Foundation deterministic assurance decision must match check failures',
    })
  }
})

export type FoundationDeterministicCheck = z.infer<typeof foundationDeterministicCheckSchema>
export type FoundationDeterministicAssuranceReport = z.infer<typeof foundationDeterministicAssuranceReportSchema>

export interface FoundationAssuranceArtifactStore {
  readJson(ref: string): Promise<unknown>
  writeJson(input: {
    jobId: string
    kind: 'foundation_deterministic_assurance_report'
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
}

type LoadedFoundationArtifacts = {
  sourceLicenceRegister?: SourceLicenceRegister
  boardAlignment?: BoardAlignment
  coverageModel?: FoundationCoverageModel
  courseKnowledgeModel?: CourseKnowledgeModel
  assessmentBlueprint?: FoundationAssessmentBlueprint
  questionFamilies: Array<{ artifact: FoundationArtifactRef; value: QuestionFamily }>
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function unique(values: Iterable<string>) {
  return [...new Set(values)]
}

function check(
  checkId: string,
  status: FoundationDeterministicCheck['status'],
  message: string,
  artifactRefs: string[] = [],
  evidence: string[] = [],
  severity: FoundationDeterministicCheck['severity'] = status === 'fail' ? 'blocking' : 'informational',
) {
  return foundationDeterministicCheckSchema.parse({
    checkId,
    status,
    severity,
    artifactRefs,
    message,
    evidence,
  })
}

function issueText(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`).join('; ')
  }
  return error instanceof Error ? error.message : String(error)
}

async function loadArtifact<T>(input: {
  store: FoundationAssuranceArtifactStore
  ref: FoundationArtifactRef
  label: string
  schema: z.ZodType<T>
}) {
  try {
    const value = input.schema.parse(await input.store.readJson(input.ref.ref))
    return {
      value,
      loadCheck: check(
        `load-${input.label}`,
        'pass',
        `${input.label} is readable and schema-valid.`,
        [input.ref.ref],
      ),
    }
  } catch (error) {
    return {
      value: undefined,
      loadCheck: check(
        `load-${input.label}`,
        'fail',
        `${input.label} could not be read and validated.`,
        [input.ref.ref],
        [issueText(error)],
      ),
    }
  }
}

async function loadFoundationArtifacts(candidate: FoundationCandidate, store: FoundationAssuranceArtifactStore) {
  const source = await loadArtifact({
    store,
    ref: candidate.sourceLicenceRegister,
    label: 'source-licence-register',
    schema: sourceLicenceRegisterSchema,
  })
  const board = await loadArtifact({
    store,
    ref: candidate.boardAlignment,
    label: 'board-alignment',
    schema: boardAlignmentSchema,
  })
  const coverage = await loadArtifact({
    store,
    ref: candidate.coverageModel,
    label: 'coverage-model',
    schema: foundationCoverageModelSchema,
  })
  const course = await loadArtifact({
    store,
    ref: candidate.courseKnowledgeModel,
    label: 'course-knowledge-model',
    schema: courseKnowledgeModelSchema,
  })
  const exam = await loadArtifact({
    store,
    ref: candidate.assessmentBlueprint,
    label: 'assessment-blueprint',
    schema: foundationAssessmentBlueprintSchema,
  })

  const familyLoads = await Promise.all(candidate.questionFamilies.map(async (artifact, index) => {
    const loaded = await loadArtifact({
      store,
      ref: artifact,
      label: `question-family-${index + 1}`,
      schema: questionFamilySchema,
    })
    return { artifact, ...loaded }
  }))

  return {
    artifacts: {
      sourceLicenceRegister: source.value,
      boardAlignment: board.value,
      coverageModel: coverage.value,
      courseKnowledgeModel: course.value,
      assessmentBlueprint: exam.value,
      questionFamilies: familyLoads
        .filter((loaded): loaded is typeof loaded & { value: QuestionFamily } => loaded.value !== undefined)
        .map(({ artifact, value }) => ({ artifact, value })),
    } satisfies LoadedFoundationArtifacts,
    checks: [
      source.loadCheck,
      board.loadCheck,
      coverage.loadCheck,
      course.loadCheck,
      exam.loadCheck,
      ...familyLoads.map((loaded) => loaded.loadCheck),
    ],
  }
}

async function artifactFingerprintProblems(candidate: FoundationCandidate, bundle: LoadedFoundationArtifacts) {
  const problems: string[] = []

  if (bundle.sourceLicenceRegister) {
    const fingerprint = await fingerprintFoundationSourceLicenceRegister(bundle.sourceLicenceRegister)
    if (fingerprint !== bundle.sourceLicenceRegister.fingerprint) {
      problems.push('Source Licence Register material fingerprint does not match its embedded fingerprint')
    }
    if (fingerprint !== candidate.sourceLicenceRegister.fingerprint) {
      problems.push('Source Licence Register material fingerprint does not match the Foundation Candidate reference')
    }
  }

  if (bundle.boardAlignment) {
    const fingerprint = await fingerprintFoundationArtifact({ ...bundle.boardAlignment, fingerprint: undefined })
    if (fingerprint !== bundle.boardAlignment.fingerprint) {
      problems.push('Board Alignment material fingerprint does not match its embedded fingerprint')
    }
    if (fingerprint !== candidate.boardAlignment.fingerprint) {
      problems.push('Board Alignment material fingerprint does not match the Foundation Candidate reference')
    }
  }

  if (bundle.coverageModel) {
    const fingerprint = await fingerprintFoundationArtifact(bundle.coverageModel)
    if (fingerprint !== candidate.coverageModel.fingerprint) {
      problems.push('Foundation coverage material fingerprint does not match the Foundation Candidate reference')
    }
  }

  if (bundle.courseKnowledgeModel) {
    const fingerprint = await fingerprintFoundationArtifact({ ...bundle.courseKnowledgeModel, fingerprint: undefined })
    if (fingerprint !== bundle.courseKnowledgeModel.fingerprint) {
      problems.push('Course Truth material fingerprint does not match its embedded fingerprint')
    }
    if (fingerprint !== candidate.courseKnowledgeModel.fingerprint) {
      problems.push('Course Truth material fingerprint does not match the Foundation Candidate reference')
    }
  }

  if (bundle.assessmentBlueprint) {
    const fingerprint = await fingerprintFoundationArtifact(bundle.assessmentBlueprint)
    if (fingerprint !== candidate.assessmentBlueprint.fingerprint) {
      problems.push('Exam Truth material fingerprint does not match the Foundation Candidate reference')
    }
  }

  for (const family of bundle.questionFamilies) {
    const fingerprint = await fingerprintFoundationArtifact(family.value)
    if (fingerprint !== family.artifact.fingerprint) {
      problems.push(`Question Family ${family.value.id} material fingerprint does not match the Foundation Candidate reference`)
    }
  }

  return problems
}

function candidateIntegrityProblems(candidate: FoundationCandidate) {
  const problems: string[] = []
  const refs = [
    candidate.sourceLicenceRegister.ref,
    candidate.boardAlignment.ref,
    candidate.coverageModel.ref,
    candidate.courseKnowledgeModel.ref,
    candidate.assessmentBlueprint.ref,
    ...candidate.questionFamilies.map((family) => family.ref),
  ]
  if (new Set(refs).size !== refs.length) problems.push('Foundation Candidate reuses an artifact reference across distinct Foundation responsibilities')
  if (candidate.provenance.sourceSetFingerprint !== candidate.sourceLicenceRegister.fingerprint) {
    problems.push('Foundation Candidate provenance source-set fingerprint does not match the Source Licence Register fingerprint')
  }
  if (candidate.unresolvedBlockers.length > 0) {
    problems.push(`Foundation Candidate retains unresolved blockers: ${candidate.unresolvedBlockers.map((blocker) => blocker.id).join(', ')}`)
  }
  return problems
}

function sourceRightsProblems(bundle: LoadedFoundationArtifacts) {
  const register = bundle.sourceLicenceRegister
  if (!register) return []
  const problems: string[] = []
  for (const source of register.sources) {
    if (source.useClass === 'PROHIBITED' || source.useClass === 'UNKNOWN') {
      problems.push(`${source.id}: ${source.useClass} source cannot clear Foundation assurance`)
    }
    if (source.useClass === 'REFERENCE_ONLY' && source.aiInputPermitted) {
      problems.push(`${source.id}: REFERENCE_ONLY source text is incorrectly permitted for AI input`)
    }
  }
  return problems
}

function boardAlignmentProblems(jobId: string, candidate: FoundationCandidate, bundle: LoadedFoundationArtifacts) {
  const alignment = bundle.boardAlignment
  const register = bundle.sourceLicenceRegister
  if (!alignment || !register) return []
  const problems: string[] = []
  if (alignment.jobId !== jobId) problems.push('Board Alignment job ID does not match the Foundation job')
  if (!sameJson(alignment.courseIdentity, candidate.courseIdentity)) problems.push('Board Alignment course identity does not match the Foundation Candidate')
  if (!sameJson(alignment.cohortValidity, candidate.cohortValidity)) problems.push('Board Alignment cohort validity does not match the Foundation Candidate')
  if (alignment.verificationStatus !== 'verified') problems.push('Board Alignment is not verified')

  const sourceIds = new Set(register.sources
    .filter((source) => !['PROHIBITED', 'UNKNOWN'].includes(source.useClass))
    .map((source) => source.id))
  const componentIds = alignment.components.map((component) => component.id)
  if (new Set(componentIds).size !== componentIds.length) problems.push('Board Alignment contains duplicate component IDs')

  const allSourceRefs = [
    ...alignment.sourceRefs,
    ...alignment.assessmentObjectives.flatMap((objective) => objective.sourceRefs),
    ...alignment.assessmentRequirements.flatMap((requirement) => requirement.sourceRefs),
  ]
  for (const sourceRef of unique(allSourceRefs)) {
    if (!sourceIds.has(sourceRef)) problems.push(`Board Alignment references unavailable source ${sourceRef}`)
  }
  const components = new Set(componentIds)
  for (const requirement of alignment.assessmentRequirements) {
    for (const componentId of requirement.componentScope) {
      if (!components.has(componentId)) problems.push(`Board Alignment assessment requirement ${requirement.id} references unknown component ${componentId}`)
    }
  }
  return problems
}

function coverageProblems(jobId: string, candidate: FoundationCandidate, bundle: LoadedFoundationArtifacts) {
  const coverage = bundle.coverageModel
  const register = bundle.sourceLicenceRegister
  const alignment = bundle.boardAlignment
  if (!coverage || !register || !alignment) return []
  const problems: string[] = []
  if (coverage.jobId !== jobId) problems.push('Foundation coverage job ID does not match the Foundation job')
  if (coverage.sourceSetFingerprint !== candidate.sourceLicenceRegister.fingerprint) problems.push('Foundation coverage source-set fingerprint does not match the assured Source Licence Register')

  const permittedCurriculumSources = new Set(register.sources
    .filter((source) => ['OPEN', 'REVISION_OWNED', 'LICENSED'].includes(source.useClass) && source.derivedCommercialUsePermitted)
    .map((source) => source.id))
  const componentIds = new Set(alignment.components.map((component) => component.id))
  const requirementIds = coverage.requirements.map((requirement) => requirement.requirementId)
  if (new Set(requirementIds).size !== requirementIds.length) problems.push('Foundation coverage contains duplicate requirement IDs')

  for (const requirement of coverage.requirements) {
    if (requirement.coverageStatus !== 'complete') problems.push(`Coverage requirement ${requirement.requirementId} is not complete`)
    if (requirement.knowledgeNodeIds.length === 0) problems.push(`Coverage requirement ${requirement.requirementId} has no canonical knowledge/skill node`)
    for (const sourceRef of requirement.sourceRefs) {
      if (!permittedCurriculumSources.has(sourceRef)) problems.push(`Coverage requirement ${requirement.requirementId} uses source ${sourceRef} without permitted curriculum derivation rights`)
    }
    for (const componentId of requirement.componentScope) {
      if (!componentIds.has(componentId)) problems.push(`Coverage requirement ${requirement.requirementId} references unknown component ${componentId}`)
    }
  }
  return problems
}

function courseTruthProblems(jobId: string, bundle: LoadedFoundationArtifacts) {
  const coverage = bundle.coverageModel
  const model = bundle.courseKnowledgeModel
  const register = bundle.sourceLicenceRegister
  const alignment = bundle.boardAlignment
  if (!coverage || !model || !register || !alignment) return []
  const problems: string[] = []
  if (model.jobId !== jobId) problems.push('Course Truth job ID does not match the Foundation job')

  const expectedNodeIds = coverage.requirements.flatMap((requirement) => requirement.knowledgeNodeIds)
  if (!sameSet(model.nodes.map((node) => node.id), expectedNodeIds)) {
    problems.push('Course Truth node IDs do not exactly match canonical Foundation coverage')
  }

  const permittedCurriculumSources = new Set(register.sources
    .filter((source) => ['OPEN', 'REVISION_OWNED', 'LICENSED'].includes(source.useClass) && source.derivedCommercialUsePermitted)
    .map((source) => source.id))
  const alignmentIds = new Set([
    ...alignment.components.map((component) => component.id),
    ...alignment.assessmentObjectives.map((objective) => objective.id),
    ...alignment.assessmentRequirements.map((requirement) => requirement.id),
  ])
  const requirementsByNode = new Map<string, FoundationCoverageModel['requirements']>()
  for (const requirement of coverage.requirements) {
    for (const nodeId of requirement.knowledgeNodeIds) {
      requirementsByNode.set(nodeId, [...(requirementsByNode.get(nodeId) ?? []), requirement])
    }
  }

  for (const node of model.nodes) {
    const governingRequirements = requirementsByNode.get(node.id) ?? []
    const governedSources = new Set(governingRequirements.flatMap((requirement) => requirement.sourceRefs))
    if (node.boardAlignmentRefs.length === 0) problems.push(`Course Truth node ${node.id} has no Board Alignment relevance`) 
    for (const sourceRef of node.sourceRefs) {
      if (!permittedCurriculumSources.has(sourceRef) || !governedSources.has(sourceRef)) {
        problems.push(`Course Truth node ${node.id} uses source ${sourceRef} outside its governed coverage/right boundary`)
      }
    }
    for (const requirement of governingRequirements) {
      if (!requirement.sourceRefs.some((sourceRef) => node.sourceRefs.includes(sourceRef))) {
        problems.push(`Course Truth node ${node.id} has no source trace to coverage requirement ${requirement.requirementId}`)
      }
    }
    for (const alignmentRef of node.boardAlignmentRefs) {
      if (!alignmentIds.has(alignmentRef)) problems.push(`Course Truth node ${node.id} references unknown Board Alignment item ${alignmentRef}`)
    }
  }
  return problems
}

function examTruthProblems(jobId: string, candidate: FoundationCandidate, bundle: LoadedFoundationArtifacts) {
  const blueprint = bundle.assessmentBlueprint
  const alignment = bundle.boardAlignment
  if (!blueprint || !alignment) return []
  const problems: string[] = []
  if (blueprint.jobId !== jobId) problems.push('Exam Truth job ID does not match the Foundation job')
  if (blueprint.boardAlignmentFingerprint !== candidate.boardAlignment.fingerprint) problems.push('Exam Truth does not bind to the assured Board Alignment fingerprint')
  if (blueprint.courseKnowledgeModelFingerprint !== candidate.courseKnowledgeModel.fingerprint) problems.push('Exam Truth does not bind to the assured Course Truth fingerprint')

  if (!sameSet(blueprint.components.map((component) => component.componentId), alignment.components.map((component) => component.id))) {
    problems.push('Exam Truth components do not exactly match Board Alignment')
  }
  if (!sameSet(blueprint.assessmentObjectives.map((objective) => objective.id), alignment.assessmentObjectives.map((objective) => objective.id))) {
    problems.push('Exam Truth assessment objectives do not exactly match Board Alignment')
  }
  if (!sameSet(blueprint.assessmentRequirements.map((requirement) => requirement.id), alignment.assessmentRequirements.map((requirement) => requirement.id))) {
    problems.push('Exam Truth assessment requirements do not exactly match Board Alignment')
  }

  const alignedComponents = new Map(alignment.components.map((component) => [component.id, component]))
  for (const component of blueprint.components) {
    const aligned = alignedComponents.get(component.componentId)
    if (!aligned) continue
    if (aligned.marks !== undefined && component.markTotal !== aligned.marks) problems.push(`Exam Truth marks for ${component.componentId} do not match Board Alignment`)
    if (aligned.durationMinutes !== undefined && component.timingMinutes !== aligned.durationMinutes) problems.push(`Exam Truth timing for ${component.componentId} does not match Board Alignment`)
  }

  const alignedObjectives = new Map(alignment.assessmentObjectives.map((objective) => [objective.id, objective]))
  for (const objective of blueprint.assessmentObjectives) {
    const aligned = alignedObjectives.get(objective.id)
    if (aligned && aligned.weightingPercent !== objective.weightingPercent) problems.push(`Exam Truth weighting for ${objective.id} does not match Board Alignment`)
  }

  const alignedRequirements = new Map(alignment.assessmentRequirements.map((requirement) => [requirement.id, requirement]))
  for (const requirement of blueprint.assessmentRequirements) {
    const aligned = alignedRequirements.get(requirement.id)
    if (!aligned) continue
    if (aligned.summary !== requirement.summary || !sameSet(aligned.componentScope, requirement.componentScope)) {
      problems.push(`Exam Truth assessment requirement ${requirement.id} does not preserve Board Alignment meaning/scope`)
    }
  }
  return problems
}

function questionFamilyProblems(candidate: FoundationCandidate, bundle: LoadedFoundationArtifacts) {
  const blueprint = bundle.assessmentBlueprint
  const alignment = bundle.boardAlignment
  if (!blueprint || !alignment) return []
  const problems: string[] = []
  const requestedFamilyIds = unique(blueprint.components.flatMap((component) => component.questionFamilyIds))
  const loadedFamilyIds = bundle.questionFamilies.map((family) => family.value.id)
  if (!sameSet(loadedFamilyIds, requestedFamilyIds)) problems.push('Persisted Question Family IDs do not exactly match Exam Truth')
  if (bundle.questionFamilies.length !== candidate.questionFamilies.length) problems.push('One or more Foundation Candidate Question Family artifacts could not be validated')
  if (new Set(loadedFamilyIds).size !== loadedFamilyIds.length) problems.push('Persisted Question Families contain duplicate IDs')

  const componentIds = new Set(alignment.components.map((component) => component.id))
  const objectiveIds = new Set(alignment.assessmentObjectives.map((objective) => objective.id))
  for (const family of bundle.questionFamilies.map((entry) => entry.value)) {
    for (const componentId of family.componentScope) {
      if (!componentIds.has(componentId)) problems.push(`Question Family ${family.id} references unknown component ${componentId}`)
    }
    for (const objectiveId of family.assessmentObjectiveIds) {
      if (!objectiveIds.has(objectiveId)) problems.push(`Question Family ${family.id} references unknown assessment objective ${objectiveId}`)
    }
  }
  return problems
}

export async function runDeterministicFoundationAssurance(input: {
  job: FoundationJob
  artifactStore: FoundationAssuranceArtifactStore
  reviewedCommit: string
  now: string
}): Promise<{
  job: FoundationJob
  report: FoundationDeterministicAssuranceReport
  reportRef: string
}> {
  const job = foundationJobSchema.parse(input.job)
  const reviewedCommit = commitShaSchema.parse(input.reviewedCommit)
  if (job.state !== 'assuring' || !job.candidate) {
    throw new Error('Foundation deterministic assurance requires a complete Foundation Candidate in assuring state')
  }
  if (job.blockers.some((blocker) => !blocker.resolvedAt)) {
    throw new Error('Resolve all Foundation operational blockers before deterministic assurance')
  }

  const candidate = job.candidate
  const foundationFingerprint = await computeFoundationFingerprint(candidate)
  const loaded = await loadFoundationArtifacts(candidate, input.artifactStore)
  const bundle = loaded.artifacts

  const candidateProblems = candidateIntegrityProblems(candidate)
  const fingerprintProblems = await artifactFingerprintProblems(candidate, bundle)
  const rightsProblems = sourceRightsProblems(bundle)
  const alignmentProblems = boardAlignmentProblems(job.jobId, candidate, bundle)
  const coverageIssues = coverageProblems(job.jobId, candidate, bundle)
  const courseIssues = courseTruthProblems(job.jobId, bundle)
  const examIssues = examTruthProblems(job.jobId, candidate, bundle)
  const familyIssues = questionFamilyProblems(candidate, bundle)

  const checks = [
    ...loaded.checks,
    check(
      'candidate-integrity',
      candidateProblems.length === 0 ? 'pass' : 'fail',
      candidateProblems.length === 0 ? 'Foundation Candidate identity, refs and blockers are internally consistent.' : candidateProblems.join('; '),
      [],
      candidateProblems,
    ),
    check(
      'artifact-fingerprints',
      fingerprintProblems.length === 0 ? 'pass' : 'fail',
      fingerprintProblems.length === 0 ? 'All persisted Foundation artifacts match the exact fingerprints recorded by the candidate.' : fingerprintProblems.join('; '),
      [candidate.sourceLicenceRegister.ref, candidate.boardAlignment.ref, candidate.coverageModel.ref, candidate.courseKnowledgeModel.ref, candidate.assessmentBlueprint.ref, ...candidate.questionFamilies.map((family) => family.ref)],
      fingerprintProblems,
    ),
    check(
      'source-rights',
      bundle.sourceLicenceRegister ? (rightsProblems.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.sourceLicenceRegister ? 'Source-rights check cannot run because the Source Licence Register is unavailable.' : rightsProblems.length === 0 ? 'Source-rights records remain admissible for Foundation assurance.' : rightsProblems.join('; '),
      [candidate.sourceLicenceRegister.ref],
      rightsProblems,
      rightsProblems.length > 0 ? 'blocking' : 'informational',
    ),
    check(
      'board-alignment-integrity',
      bundle.boardAlignment && bundle.sourceLicenceRegister ? (alignmentProblems.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.boardAlignment || !bundle.sourceLicenceRegister ? 'Board Alignment integrity cannot run because required artifacts are unavailable.' : alignmentProblems.length === 0 ? 'Board Alignment matches the exact Foundation identity, cohort, components and admissible evidence.' : alignmentProblems.join('; '),
      [candidate.boardAlignment.ref],
      alignmentProblems,
    ),
    check(
      'coverage-integrity',
      bundle.coverageModel && bundle.sourceLicenceRegister && bundle.boardAlignment ? (coverageIssues.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.coverageModel || !bundle.sourceLicenceRegister || !bundle.boardAlignment ? 'Foundation coverage integrity cannot run because required artifacts are unavailable.' : coverageIssues.length === 0 ? 'Foundation coverage is complete, rights-safe and aligned to the exact source/component set.' : coverageIssues.join('; '),
      [candidate.coverageModel.ref],
      coverageIssues,
    ),
    check(
      'course-truth-integrity',
      bundle.coverageModel && bundle.courseKnowledgeModel && bundle.sourceLicenceRegister && bundle.boardAlignment ? (courseIssues.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.coverageModel || !bundle.courseKnowledgeModel || !bundle.sourceLicenceRegister || !bundle.boardAlignment ? 'Course Truth integrity cannot run because required artifacts are unavailable.' : courseIssues.length === 0 ? 'Course Truth exactly covers canonical Foundation nodes with governed source and Board Alignment traceability.' : courseIssues.join('; '),
      [candidate.courseKnowledgeModel.ref, candidate.coverageModel.ref],
      courseIssues,
    ),
    check(
      'exam-truth-integrity',
      bundle.assessmentBlueprint && bundle.boardAlignment ? (examIssues.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.assessmentBlueprint || !bundle.boardAlignment ? 'Exam Truth integrity cannot run because required artifacts are unavailable.' : examIssues.length === 0 ? 'Exam Truth is bound to exact Course Truth/Board Alignment and preserves governed assessment structure.' : examIssues.join('; '),
      [candidate.assessmentBlueprint.ref, candidate.boardAlignment.ref],
      examIssues,
    ),
    check(
      'question-family-integrity',
      bundle.assessmentBlueprint && bundle.boardAlignment ? (familyIssues.length === 0 ? 'pass' : 'fail') : 'not_applicable',
      !bundle.assessmentBlueprint || !bundle.boardAlignment ? 'Question Family integrity cannot run because required artifacts are unavailable.' : familyIssues.length === 0 ? 'Question Families exactly satisfy Exam Truth component and assessment-objective contracts.' : familyIssues.join('; '),
      candidate.questionFamilies.map((family) => family.ref),
      familyIssues,
    ),
  ]

  const report = foundationDeterministicAssuranceReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_deterministic_assurance_report',
    jobId: job.jobId,
    candidateId: candidate.candidateId,
    reviewedCommit,
    foundationFingerprint,
    decision: checks.some((item) => item.status === 'fail') ? 'fail' : 'pass',
    checks,
    createdAt: input.now,
  })
  const reportFingerprint = await fingerprintFoundationArtifact(report)
  const reportWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'foundation_deterministic_assurance_report',
    fingerprint: reportFingerprint,
    value: report,
  })
  const nextJob = await recordDeterministicFoundationAssurance(job, {
    status: report.decision,
    foundationFingerprint,
    evidenceRefs: [reportWrite.ref],
  }, input.now)

  return { job: nextJob, report, reportRef: reportWrite.ref }
}
