import { z } from 'zod'
import { contentPackSchema } from '../../content/schema'
import { foundationAssessmentBlueprintSchema, foundationCoverageModelSchema, fingerprintFoundationArtifact } from './foundation-compilation'
import { assertApprovedFoundationIntegrity, computeFoundationFingerprint } from './foundation-lifecycle'
import { validateFoundationExternalSourceChallenge } from './foundation-external-source-challenge'
import { foundationJobSchema } from './foundation-schema'
import { boardAlignmentSchema, courseKnowledgeModelSchema, sourceLicenceRegisterSchema } from './schema'
import {
  checkQualificationProjection,
  type QualificationProjectionCandidate,
  type QualificationProjectionProfile,
} from './qualification-projection-preflight'

/**
 * Stage 4: provider-free pre-publication integration, never a release approval.
 * All expected curriculum/assessment facts come from separately retained,
 * independently assured Foundation artifacts. Mapping IDs are compatibility
 * crosswalks, not an authority to invent qualification requirements.
 */
const id = z.string().min(1)
export const foundationLearnerProjectionMappingSchema = z.object({
  cohortId: id,
  subjectId: id,
  qualificationId: id,
  examBoardId: id,
  specificationCode: id,
  components: z.array(z.object({
    componentId: id,
    packId: id,
    paperId: id,
    paperNumber: z.number().int().positive(),
    /** Unsupported variants must still reach the Stage 3 HOLD check. */
    requiredVariantId: id.optional(),
    preReleaseContextRef: id.optional(),
    minimumPracticalMarks: z.number().int().nonnegative().optional(),
  })).min(1),
  requirementTopics: z.array(z.object({
    requirementId: id,
    skillIndex: z.number().int().nonnegative(),
    topicId: id,
  })).min(1),
  evidence: z.array(z.object({
    requirementId: id,
    skillIndex: z.number().int().nonnegative(),
    packId: id,
    topicId: id,
    kind: z.enum(['exam_question', 'practice_question', 'learn_page']),
    assetId: id,
    examId: id.optional(),
  })).min(1),
})

export type FoundationLearnerProjectionMapping = z.infer<typeof foundationLearnerProjectionMappingSchema>

export type FoundationLearnerProjectionResult = {
  status: 'pass' | 'hold'
  problems: Array<{ code: string; detail: string }>
  /** Structural proof only. Never conveys publication, educational or rights approval. */
  publicationEligible: false
}

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === new Set(a).size
    && b.length === new Set(b).size
    && a.length === b.length
    && a.every((value) => b.includes(value))
}

const sourceRightsMaterial = (source: z.infer<typeof sourceLicenceRegisterSchema>['sources'][number]) => ({
  id: source.id,
  issuer: source.issuer,
  urlOrReference: source.urlOrReference,
  sourceType: source.sourceType,
  educationalRole: source.educationalRole,
  versionOrDate: source.versionOrDate,
  useClass: source.useClass,
  permissionBasis: source.permissionBasis,
  aiInputPermitted: source.aiInputPermitted,
  derivedCommercialUsePermitted: source.derivedCommercialUsePermitted,
  attributionRequirements: source.attributionRequirements,
  restrictions: source.restrictions,
  checkerMethod: source.checkerMethod,
  sourceFingerprint: source.sourceFingerprint,
  revalidationConditions: source.revalidationConditions,
})

export async function checkFoundationLearnerProjection(input: {
  job: unknown
  sourceLicenceRegister: unknown
  boardAlignment: unknown
  coverageModel: unknown
  courseKnowledgeModel: unknown
  assessmentBlueprint: unknown
  mapping: unknown
  candidates: readonly QualificationProjectionCandidate[]
}): Promise<FoundationLearnerProjectionResult> {
  const problems: FoundationLearnerProjectionResult['problems'] = []
  const hold = (code: string, detail: string) => { problems.push({ code, detail }) }
  const result = (): FoundationLearnerProjectionResult => ({
    status: problems.length ? 'hold' : 'pass', problems, publicationEligible: false,
  })

  const parsed = z.object({
    job: foundationJobSchema,
    sourceLicenceRegister: sourceLicenceRegisterSchema,
    boardAlignment: boardAlignmentSchema,
    coverageModel: foundationCoverageModelSchema,
    courseKnowledgeModel: courseKnowledgeModelSchema,
    assessmentBlueprint: foundationAssessmentBlueprintSchema,
    mapping: foundationLearnerProjectionMappingSchema,
    candidates: z.array(z.object({
      pack: contentPackSchema,
      cohortId: id,
      qualificationWeightPercent: z.number().optional(),
      preReleaseContextRef: id.optional(),
      practicalQuestionIds: z.array(id).optional(),
    })),
  }).safeParse(input)
  if (!parsed.success) {
    hold('invalid_input', parsed.error.issues.map((entry) => entry.path.join('.') + ': ' + entry.message).join('; '))
    return result()
  }

  const { job, sourceLicenceRegister: register, boardAlignment: alignment, coverageModel: coverage,
    courseKnowledgeModel: knowledge, assessmentBlueprint: exam, mapping, candidates } = parsed.data
  const candidate = job.state === 'foundation_approved'
    ? job.approvedFoundation?.candidate : job.candidate
  if (!candidate || !['ai_assured', 'expert_review', 'foundation_approved'].includes(job.state)) {
    hold('foundation_gate', 'Complete AI-assured or human-approved Foundation required before internal projection')
    return result()
  }
  if (job.blockers.some((blocker) => !blocker.resolvedAt) || candidate.unresolvedBlockers.length) {
    hold('foundation_blockers', 'Unresolved Foundation blocker')
  }
  const foundationFingerprint = await computeFoundationFingerprint(candidate)
  if (job.state === 'foundation_approved') {
    try { await assertApprovedFoundationIntegrity(job.approvedFoundation!) }
    catch { hold('foundation_approval_stale', 'Qualified-human approval fingerprint or evidence is invalid') }
  }
  for (const [name, assurance] of [
    ['deterministic', candidate.deterministicAssurance],
    ['independent', candidate.independentReview],
  ] as const) {
    if (assurance.status !== 'pass' || !assurance.evidenceRefs.length
      || assurance.foundationFingerprint !== foundationFingerprint) {
      hold('foundation_review_missing_or_stale', name + ' review is absent or not bound to the exact Foundation')
    }
  }
  const challenge = candidate.externalSourceChallenge
  if (!challenge || challenge.decision !== 'pass' || !challenge.evidenceRefs.length
    || challenge.foundationFingerprint !== foundationFingerprint
    || challenge.jobId !== job.jobId || challenge.candidateId !== candidate.candidateId) {
    hold('foundation_external_review_missing_or_stale', 'Fresh external-source challenge is missing or stale')
  }

  if (register.jobId !== job.jobId || alignment.jobId !== job.jobId
    || coverage.jobId !== job.jobId || knowledge.jobId !== job.jobId || exam.jobId !== job.jobId) {
    hold('foundation_job_mismatch', 'Independent artifacts must belong to the same Foundation job')
  }
  if (candidate.sourceRightsStatus !== 'approved' || candidate.boardAlignmentStatus !== 'verified'
    || candidate.coverageCompleteness !== 'complete' || candidate.courseTruthCompleteness !== 'complete'
    || candidate.examTruthCompleteness !== 'complete' || alignment.verificationStatus !== 'verified'
    || candidate.cohortValidity.status === 'unknown' || candidate.cohortValidity.status === 'withdrawn') {
    hold('foundation_truth_unverified', 'Exact source, course, cohort or assessment requirements are not verified')
  }

  if (register.fingerprint !== candidate.sourceLicenceRegister.fingerprint
    || coverage.sourceSetFingerprint !== register.fingerprint
    || candidate.provenance.sourceSetFingerprint !== register.fingerprint
    || await fingerprintFoundationArtifact(register.sources.map(sourceRightsMaterial)) !== register.fingerprint) {
    hold('source_rights_fingerprint', 'Source rights artifact differs from assured Foundation')
  }
  const alignmentBody = Object.fromEntries(Object.entries(alignment).filter(([key]) => key !== 'fingerprint'))
  if (alignment.fingerprint !== candidate.boardAlignment.fingerprint
    || await fingerprintFoundationArtifact(alignmentBody) !== alignment.fingerprint
    || !sameSet(alignment.components.map((component) => component.id), exam.components.map((component) => component.componentId))) {
    hold('board_alignment_mismatch', 'Board Alignment differs from approved components/Exam Truth')
  }
  const knowledgeBody = Object.fromEntries(Object.entries(knowledge).filter(([key]) => key !== 'fingerprint'))
  if (knowledge.fingerprint !== candidate.courseKnowledgeModel.fingerprint
    || await fingerprintFoundationArtifact(knowledgeBody) !== knowledge.fingerprint
    || !sameSet(knowledge.nodes.map((node) => node.id), coverage.requirements.flatMap((req) => req.knowledgeNodeIds).filter((id, i, all) => all.indexOf(id) === i))) {
    hold('course_truth_mismatch', 'Course Knowledge Model differs from Foundation coverage/approved fingerprint')
  }
  if (await fingerprintFoundationArtifact(coverage) !== candidate.coverageModel.fingerprint
    || await fingerprintFoundationArtifact(exam) !== candidate.assessmentBlueprint.fingerprint
    || exam.boardAlignmentFingerprint !== alignment.fingerprint
    || exam.courseKnowledgeModelFingerprint !== knowledge.fingerprint) {
    hold('exam_or_coverage_fingerprint', 'Exam/Course Truth artifact is stale or not linked to governing sources')
  }
  if (JSON.stringify(alignment.courseIdentity) !== JSON.stringify(candidate.courseIdentity)
    || JSON.stringify(alignment.cohortValidity) !== JSON.stringify(candidate.cohortValidity)) {
    hold('qualification_identity', 'Board identity/cohort differs from assured Foundation')
  }

  // Fail closed rather than accepting unverified identity aliases supplied by a
  // candidate pack. This bounded adapter handles only a single assessment-year
  // cohort; broader validity windows require an independent cohort crosswalk.
  const slug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (mapping.subjectId !== slug(candidate.courseIdentity.subject)
    || mapping.qualificationId !== slug(candidate.courseIdentity.qualification)
    || mapping.examBoardId !== slug(candidate.courseIdentity.awardingBody)
    || mapping.specificationCode !== candidate.courseIdentity.specificationId) {
    hold('unverified_manifest_identity', 'Learner identity crosswalk does not match assured course identity')
  }
  const cohort = candidate.cohortValidity
  if (!cohort.firstAssessment || !cohort.lastAssessment
    || cohort.firstAssessment !== cohort.lastAssessment || mapping.cohortId !== cohort.firstAssessment) {
    hold('unverified_cohort', 'Exact learner cohort is not proven by the independently retained Foundation')
  }

  const sourceById = new Map(register.sources.map((source) => [source.id, source]))
  for (const source of register.sources) {
    if (['UNKNOWN', 'PROHIBITED'].includes(source.useClass)) {
      hold('source_rights_hold', 'Foundation source has unresolved or prohibited rights: ' + source.id)
    }
  }
  const sourceRefs = [
    ...alignment.sourceRefs,
    ...alignment.assessmentObjectives.flatMap((objective) => objective.sourceRefs),
    ...alignment.assessmentRequirements.flatMap((requirement) => requirement.sourceRefs),
  ]
  if (!candidate.provenance.implementationHeadSha
    || !candidate.provenance.generationContextIds.length
    || !candidate.provenance.assuranceContextIds.length
    || candidate.provenance.generationContextIds.some((contextId) =>
      candidate.provenance.assuranceContextIds.includes(contextId))) {
    hold('foundation_review_provenance', 'Foundation review context or implementation commit lacks provenance')
  }
  if (challenge && candidate.provenance.implementationHeadSha) {
    try {
      validateFoundationExternalSourceChallenge({
        report: challenge, jobId: job.jobId, candidateId: candidate.candidateId,
        reviewedCommit: candidate.provenance.implementationHeadSha,
        foundationFingerprint,
        forbiddenContextIds: [
          ...candidate.provenance.generationContextIds,
          ...candidate.provenance.assuranceContextIds,
        ],
        requiredSourceIds: [...new Set(sourceRefs)],
      })
    } catch (error) {
      hold('foundation_challenge_provenance', error instanceof Error ? error.message : String(error))
    }
  }
  for (const sourceId of sourceRefs) {
    const source = sourceById.get(sourceId)
    if (!source || ['UNKNOWN', 'PROHIBITED'].includes(source.useClass)) {
      hold('source_rights_hold', 'Uncleared Board/Exam source ' + sourceId)
    }
  }
  for (const requirement of coverage.requirements) {
    for (const sourceId of requirement.sourceRefs) {
      const source = sourceById.get(sourceId)
      if (!source || !['OPEN', 'LICENSED', 'REVISION_OWNED'].includes(source.useClass)
        || !source.derivedCommercialUsePermitted) {
        hold('source_rights_hold', 'Uncleared curriculum source ' + sourceId)
      }
    }
  }

  // Unprojectable Exam Truth obligations cannot disappear behind otherwise
  // correct component marks, timings, topic IDs and qualification weights.
  if (exam.assessmentRequirements.length || exam.assessmentObjectives.length
    || exam.commandDemands.length || exam.evidenceExpectations.length
    || exam.quantitativeRequirements.length || exam.synopticRequirements.length
    || exam.quantitativeCoveragePlan || exam.assessmentObjectiveCoveragePlan) {
    hold('unprojected_exam_obligations', 'Exam Truth requirements beyond component facts need independently validated learner mapping')
  }

  const componentById = new Map(alignment.components.map((component) => [component.id, component]))
  const examById = new Map(exam.components.map((component) => [component.componentId, component]))
  if (!sameSet(alignment.components.map((component) => component.id),
    mapping.components.map((component) => component.componentId))) {
    hold('component_mapping_incomplete', 'Expected components not mapped one-to-one to learner packs')
  }
  const expectedSkillKeys = coverage.requirements.flatMap((requirement) =>
    requirement.skillsOrKnowledge.map((_, skillIndex) => requirement.requirementId + ':' + skillIndex))
  if (!sameSet(expectedSkillKeys,
    mapping.requirementTopics.map((record) => record.requirementId + ':' + record.skillIndex))) {
    hold('requirement_mapping_incomplete', 'Every independently established curriculum skill must be mapped exactly once')
  }
  const requirementTopics = new Map(mapping.requirementTopics.map((record) =>
    [record.requirementId + ':' + record.skillIndex, record.topicId]))
  const candidatesByPack = new Map(candidates.map((entry) => [entry.pack.manifest.id, entry.pack]))
  const componentPapers: QualificationProjectionProfile['components'][number][] = []
  for (const component of mapping.components) {
    const componentIndex = alignment.components.findIndex((entry) => entry.id === component.componentId)
    if (component.paperId !== component.componentId || component.paperNumber !== componentIndex + 1) {
      hold('unverified_component_crosswalk', 'Paper identity/number lacks independent Board Alignment support')
    }
    const governed = componentById.get(component.componentId)
    const blueprint = examById.get(component.componentId)
    if (!governed || !blueprint) continue
    if (!governed.compulsory || !governed.marks || !governed.durationMinutes
      || !governed.weightingPercent || blueprint.markTotal !== governed.marks
      || blueprint.timingMinutes !== governed.durationMinutes) {
      hold('assessment_contract_incomplete', 'Missing/contradictory Exam Truth on ' + component.componentId)
      continue
    }
    // The present Foundation Exam Truth schema has no verified machine-readable
    // field for exact pre-release references or mock practical-mark minima.
    // A self-authored mapping must never be able to certify either.
    if (component.preReleaseContextRef || component.minimumPracticalMarks !== undefined) {
      hold('special_rule_requires_authority', 'Special assessment rule lacks independently structured Exam Truth')
    }
    const scoped = coverage.requirements.filter((req) => req.componentScope.includes(component.componentId))
    if (!scoped.length || coverage.requirements.some((req) => !req.componentScope.length
      || req.componentScope.some((scope) => !componentById.has(scope)))) {
      hold('unresolved_paper_scope', 'Curriculum-to-component eligibility cannot be safely inferred')
    }
    const eligibleTopics = [...new Set(scoped.flatMap((req) =>
      req.skillsOrKnowledge.map((_, index) => requirementTopics.get(req.requirementId + ':' + index))).filter(
      (topic): topic is string => Boolean(topic),
    ))]
    const pack = candidatesByPack.get(component.packId)
    if (pack?.manifest.status !== 'planned') {
      hold('not_candidate', 'Stage 4 accepts only non-publishing planned assets: ' + component.packId)
    }
    if (pack && eligibleTopics.some((topic) => !pack.manifest.topicIds.includes(topic))) {
      hold('learner_topic_missing', 'Mapped Course Truth topic absent from ' + component.packId)
    }
    componentPapers.push({
      packId: component.packId,
      paperId: component.paperId,
      paperNumber: component.paperNumber,
      totalMarks: governed.marks,
      durationMinutes: governed.durationMinutes,
      qualificationWeightPercent: governed.weightingPercent,
      eligibleExamTopicIds: eligibleTopics,
      ...(component.requiredVariantId ? { requiredVariantId: component.requiredVariantId } : {}),
      ...(component.preReleaseContextRef ? { preReleaseContextRef: component.preReleaseContextRef } : {}),
      ...(component.minimumPracticalMarks !== undefined
        ? { minimumPracticalMarks: component.minimumPracticalMarks } : {}),
    })
  }

  // Every governed in-scope requirement must retain a concrete Learn,
  // Practice and representative Exam Prep locator. A Learn page is coverage
  // only, never proof of mastery; scored evidence is handled by learner runtime.
  // This is intentionally conservative until a separately governed per-mode
  // Learning Blueprint requirement contract is available.
  const kinds = ['learn_page', 'practice_question', 'exam_question'] as const
  const expectedEvidence = new Set<string>()
  for (const req of coverage.requirements) {
    for (const component of mapping.components) {
      if (req.componentScope.includes(component.componentId)) {
        for (const [skillIndex] of req.skillsOrKnowledge.entries()) {
          for (const kind of kinds) {
            expectedEvidence.add(req.requirementId + ':' + skillIndex + ':' + component.packId + ':' + kind)
          }
        }
      }
    }
  }
  const seenEvidence = new Set<string>()
  for (const binding of mapping.evidence) {
    const skillKey = binding.requirementId + ':' + binding.skillIndex
    const key = skillKey + ':' + binding.packId + ':' + binding.kind
    if (seenEvidence.has(key) || !expectedEvidence.has(key)
      || requirementTopics.get(skillKey) !== binding.topicId) {
      hold('evidence_mapping_invalid', 'Unexpected, repeated or wrongly scoped evidence binding ' + key)
    }
    seenEvidence.add(key)
    const pack = candidatesByPack.get(binding.packId)
    if (!pack) {
      hold('evidence_asset_missing', 'Missing pack for ' + key)
      continue
    }
    const exists = binding.kind === 'practice_question'
      ? pack.questions.some((question) => question.id === binding.assetId && question.topic === binding.topicId)
      : binding.kind === 'exam_question'
        ? pack.exams.some((mock) => mock.id === binding.examId
          && mock.questions.some((question) => question.id === binding.assetId && question.topic === binding.topicId))
        : pack.learn?.chapters.some((chapter) => chapter.groups.some((group) =>
          group.pages.some((page) => page.id === binding.assetId && page.topicId === binding.topicId)))
    if (!exists) hold('evidence_asset_missing', 'Exact learner evidence locator cannot be resolved: ' + key)
  }
  for (const key of expectedEvidence) {
    if (!seenEvidence.has(key)) hold('evidence_mapping_missing', 'No learner asset identity for ' + key)
  }
  const expected: QualificationProjectionProfile = {
    cohortId: mapping.cohortId,
    subjectId: mapping.subjectId,
    qualificationId: mapping.qualificationId,
    examBoardId: mapping.examBoardId,
    specificationCode: mapping.specificationCode,
    components: componentPapers,
  }
  const projection = checkQualificationProjection({ expected, candidates })
  for (const problem of projection.problems) hold('projection_' + problem.code, problem.componentId + ': ' + problem.detail)
  return result()
}
