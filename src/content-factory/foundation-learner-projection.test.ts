import { beforeAll, describe, expect, it } from 'vitest'
import { contentPackSchema, type ContentPack } from '../../content/schema'
import {
  classifyFoundationSourcesWithApprovedRules, foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema, fingerprintFoundationArtifact,
} from './foundation-compilation'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { boardAlignmentSchema, courseKnowledgeModelSchema } from './schema'
import {
  checkFoundationLearnerProjection, type FoundationLearnerProjectionMapping,
} from './foundation-learner-projection'
import type { QualificationProjectionCandidate } from './qualification-projection-preflight'

const jobId = 'fictional-course'
const now = '2026-10-22T20:00:00Z'
const sha = 'a'.repeat(40)
const identity = {
  subject: 'Synthetic Business', qualification: 'Synthetic Level Three',
  awardingBody: 'Synthetic Board', specificationId: 'SYN-01',
}
const cohort = { status: 'current' as const, firstAssessment: '2027', lastAssessment: '2027', notes: [] }
const ids = ['paper-one', 'paper-two'] as const

function pack(packId: string, number: number): ContentPack {
  return contentPackSchema.parse({
    manifest: {
      id: packId, schemaVersion: 1, status: 'planned',
      subject: { id: 'synthetic-business', name: identity.subject },
      qualification: { id: 'synthetic-level-three', name: identity.qualification },
      examBoard: { id: 'synthetic-board', name: identity.awardingBody },
      specificationCode: identity.specificationId,
      paper: { id: packId, name: packId, number, totalMarks: 100, durationMinutes: 120 },
      learnerExperience: {
        title: 'Fictional mock', what_is_this: 'Synthetic only', why_it_matters: 'Prove a mapping',
        what_you_are_trying_to_do: 'Test retention', how_results_are_worked_out: 'No scores stored',
        what_to_do_next: 'Do not publish',
      },
      topicIds: ['topic-one', 'topic-two'],
    },
    topics: ['topic-one', 'topic-two'].map((topic, i) => ({
      id: topic, order: i + 1, title: topic, shortTitle: topic,
      sections: [{ id: 'section', title: 'Synthetic chapter', points: ['Fictional teaching example.'] }],
    })),
    formulas: [], topicLinks: [], flashcards: [], questions: [], caseStudies: [], dataDrills: [],
    exams: [{
      id: 'synthetic-exam', title: 'Synthetic test', subtitle: 'Not an examination',
      totalMarks: 100, durationMinutes: 120, caseHtml: '<p>Fictional context</p>',
      questions: ['topic-one', 'topic-two'].map((topic, i) => ({
        id: i === 0 ? 'question-one' : 'question-two', topic, marks: 50,
        assessmentObjectives: { ao1: 50, ao2: 0, ao3: 0, ao4: 0 },
        prompt: 'Explain the fictional concept.', markingGuidance: ['Synthetic marking only'],
      })),
    }],
  })
}

async function makeFixture() {
  const { register } = await classifyFoundationSourcesWithApprovedRules({
    jobId, checkedAt: now,
    sources: [{
      id: 'fictional-source', url: 'https://example.test/fictional-spec',
      title: 'Fictional reference', issuer: 'Fictional Publisher',
      sourceType: 'specification', educationalRole: ['curriculum', 'assessment'],
    }],
    rules: [{
      id: 'fictional-rights', issuer: 'Fictional Publisher', hostnames: ['example.test'],
      sourceTypes: ['specification'], useClass: 'OPEN', permissionBasis: 'Synthetic public-domain fixture',
      aiInputPermitted: true, derivedCommercialUsePermitted: true,
      attributionRequirements: [], restrictions: [], revalidationConditions: [],
    }],
  })
  const boardDraft = boardAlignmentSchema.parse({
    schemaVersion: 1, jobId, fingerprint: 'unhashed',
    courseIdentity: identity, cohortValidity: cohort,
    components: ids.map((id, i) => ({
      id, name: id, compulsory: true, marks: 100, durationMinutes: 120,
      weightingPercent: i === 0 ? 40 : 60,
    })),
    assessmentObjectives: [], assessmentRequirements: [],
    sourceRefs: ['fictional-source'], verificationStatus: 'verified',
  })
  const boardAlignment = {
    ...boardDraft,
    fingerprint: await fingerprintFoundationArtifact(Object.fromEntries(
      Object.entries(boardDraft).filter(([key]) => key !== 'fingerprint'),
    )),
  }
  const coverageModel = foundationCoverageModelSchema.parse({
    schemaVersion: 1, jobId, sourceSetFingerprint: register.fingerprint,
    requirements: ['one', 'two'].map((label) => ({
      requirementId: 'req-' + label, officialReference: 'SYN.' + label,
      requirementSummary: 'Fictional curriculum requirement ' + label,
      skillsOrKnowledge: ['Fictional skill ' + label], componentScope: [...ids],
      revisionArea: 'Fictional subject', sourceRefs: ['fictional-source'],
      knowledgeNodeIds: ['node-' + label], coverageStatus: 'complete',
    })),
  })
  const knowledgeDraft = courseKnowledgeModelSchema.parse({
    schemaVersion: 1, jobId, fingerprint: 'unhashed',
    nodes: ['one', 'two'].map((label) => ({
      id: 'node-' + label, kind: 'concept', summary: 'Fictional node ' + label,
      prerequisiteIds: [], relatedIds: [], formulas: [], misconceptions: [],
      applicationContexts: [], depth: 'core', sourceRefs: ['fictional-source'],
      boardAlignmentRefs: [...ids], evidenceTypes: ['explain'],
    })),
  })
  const courseKnowledgeModel = {
    ...knowledgeDraft,
    fingerprint: await fingerprintFoundationArtifact(Object.fromEntries(
      Object.entries(knowledgeDraft).filter(([key]) => key !== 'fingerprint'),
    )),
  }
  const assessmentBlueprint = foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 1, jobId,
    boardAlignmentFingerprint: boardAlignment.fingerprint,
    courseKnowledgeModelFingerprint: courseKnowledgeModel.fingerprint,
    components: ids.map((componentId) => ({
      componentId, questionFamilyIds: [], markTotal: 100, timingMinutes: 120,
    })),
  })
  const candidateDraft = foundationCandidateSchema.parse({
    schemaVersion: 1, candidateId: 'fictional-candidate',
    courseIdentity: identity, cohortValidity: cohort,
    sourceLicenceRegister: { ref: 'fixture/rights', fingerprint: register.fingerprint },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: 'fixture/alignment', fingerprint: boardAlignment.fingerprint },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: 'fixture/coverage', fingerprint: await fingerprintFoundationArtifact(coverageModel) },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: 'fixture/knowledge', fingerprint: courseKnowledgeModel.fingerprint },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: 'fixture/exam', fingerprint: await fingerprintFoundationArtifact(assessmentBlueprint) },
    examTruthCompleteness: 'complete',
    questionFamilies: [], deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [], knownLimitations: [],
    provenance: {
      createdAt: now, producerVersion: 'fictional-test',
      sourceSetFingerprint: register.fingerprint, implementationHeadSha: sha,
      generationContextIds: ['fictional-generation'], assuranceContextIds: ['fictional-assurance'],
    },
  })
  const fp = await computeFoundationFingerprint(candidateDraft)
  const candidate = foundationCandidateSchema.parse({
    ...candidateDraft,
    deterministicAssurance: { status: 'pass', foundationFingerprint: fp, evidenceRefs: ['fixture/deterministic'] },
    independentReview: { status: 'pass', foundationFingerprint: fp, evidenceRefs: ['fixture/independent'] },
    externalSourceChallenge: {
      schemaVersion: 1, artifactType: 'foundation_external_source_challenge_report',
      challengeId: 'fictional-challenge', jobId, candidateId: candidateDraft.candidateId,
      reviewedCommit: sha, foundationFingerprint: fp,
      sourceUniverseProfileId: 'fictional-source-universe', challengedSourceIds: ['fictional-source'],
      reviewerContextId: 'fictional-fresh-review',
      excludedContextIds: ['fictional-generation', 'fictional-assurance'], decision: 'pass',
      findings: [], evidenceRefs: ['fixture/source-review'], createdAt: now,
    },
  })
  const job = foundationJobSchema.parse({
    schemaVersion: 1, jobId, state: 'ai_assured', candidate,
    blockers: [], createdAt: now, updatedAt: now,
  })
  const mapping: FoundationLearnerProjectionMapping = {
    cohortId: '2027', subjectId: 'synthetic-business',
    qualificationId: 'synthetic-level-three', examBoardId: 'synthetic-board',
    specificationCode: 'SYN-01',
    components: ids.map((componentId, i) => ({
      componentId, paperId: componentId, packId: componentId, paperNumber: i + 1,
    })),
    requirementTopics: [
      { requirementId: 'req-one', topicId: 'topic-one' },
      { requirementId: 'req-two', topicId: 'topic-two' },
    ],
    evidence: ids.flatMap((packId) => ([
      { requirementId: 'req-one', packId, topicId: 'topic-one', kind: 'exam_question' as const,
        assetId: 'question-one', examId: 'synthetic-exam' },
      { requirementId: 'req-two', packId, topicId: 'topic-two', kind: 'exam_question' as const,
        assetId: 'question-two', examId: 'synthetic-exam' },
    ])),
  }
  const candidates: QualificationProjectionCandidate[] = ids.map((packId, i) => ({
    pack: pack(packId, i + 1), cohortId: '2027', qualificationWeightPercent: i === 0 ? 40 : 60,
  }))
  return { job, sourceLicenceRegister: register, boardAlignment, coverageModel,
    courseKnowledgeModel, assessmentBlueprint, mapping, candidates }
}

type Fixture = Awaited<ReturnType<typeof makeFixture>>
let base: Fixture

async function run(change?: (fixture: Fixture) => void) {
  const fixture = structuredClone(base)
  change?.(fixture)
  return checkFoundationLearnerProjection(fixture)
}

function held(result: Awaited<ReturnType<typeof run>>, code: string) {
  expect(result.status).toBe('hold')
  expect(result.publicationEligible).toBe(false)
  expect(result.problems.some((problem) => problem.code === code)).toBe(true)
}

describe('Stage 4 independent Foundation to planned learner-pack proof (fictional, provider-free)', () => {
  beforeAll(async () => { base = await makeFixture() })

  it('retains two independent Board Alignment papers, unequal 40/60 weights, both atomic requirements and exact question identities', async () => {
    expect(await run()).toEqual({ status: 'pass', problems: [], publicationEligible: false })
  })
  it('holds when a required paper or requirement mapping disappears', async () => {
    held(await run((f) => { f.candidates.pop() }), 'projection_missing_component')
    held(await run((f) => { f.mapping.requirementTopics.pop() }), 'requirement_mapping_incomplete')
  })
  it('holds when evidence is omitted, duplicated, falsified or points at a missing learner question', async () => {
    held(await run((f) => { f.mapping.evidence.pop() }), 'evidence_mapping_missing')
    held(await run((f) => { f.mapping.evidence.push({ ...f.mapping.evidence[0]! }) }), 'evidence_mapping_invalid')
    held(await run((f) => { f.mapping.evidence[0]!.assetId = 'not-a-question' }), 'evidence_asset_missing')
    held(await run((f) => { f.mapping.evidence[0]!.topicId = 'topic-two' }), 'evidence_mapping_invalid')
  })
  it('holds false profile course/cohort/paper and wrong qualification weighting', async () => {
    held(await run((f) => { f.mapping.subjectId = 'invented' }), 'unverified_manifest_identity')
    held(await run((f) => { f.mapping.cohortId = '2028' }), 'unverified_cohort')
    held(await run((f) => { f.mapping.components[0]!.paperNumber = 2 }), 'unverified_component_crosswalk')
    held(await run((f) => { f.candidates[0]!.qualificationWeightPercent = 50 }), 'projection_qualification_weight_projection_mismatch')
  })
  it('holds tampered source rights, incomplete Foundation review or stale source/foundation fingerprint', async () => {
    held(await run((f) => { f.sourceLicenceRegister.sources[0]!.useClass = 'UNKNOWN' }), 'invalid_input')
    held(await run((f) => { f.job.candidate!.independentReview.evidenceRefs = [] }), 'invalid_input')
    held(await run((f) => { f.job.candidate!.coverageModel.fingerprint = 'f'.repeat(64) }), 'exam_or_coverage_fingerprint')
    held(await run((f) => { f.coverageModel.requirements.pop() }), 'requirement_mapping_incomplete')
  })
  it('holds unsupported variants, unsupported special-rule assertions and missing practical identity', async () => {
    held(await run((f) => { f.mapping.components[0]!.requiredVariantId = 'higher' }), 'projection_variant_projection_unsupported')
    held(await run((f) => { f.mapping.components[0]!.preReleaseContextRef = 'invented-ref' }), 'special_rule_requires_authority')
    held(await run((f) => { f.mapping.components[0]!.minimumPracticalMarks = 50 }), 'special_rule_requires_authority')
  })
  it('does not let a released or preview learner pack masquerade as a Stage 4 planned candidate', async () => {
    held(await run((f) => { f.candidates[0]!.pack.manifest.status = 'available' }), 'not_candidate')
  })
  it('holds incorrect independently retained Board Alignment even when candidate projection is internally consistent', async () => {
    held(await run((f) => { f.boardAlignment.components[0]!.weightingPercent = 50 }), 'board_alignment_mismatch')
  })
})
