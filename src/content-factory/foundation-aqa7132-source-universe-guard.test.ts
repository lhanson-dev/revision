import { describe, expect, it } from 'vitest'
import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  sourceLicenceRegisterSchema,
} from './schema'
import {
  foundationCoverageModelSchema,
  foundationIdentityResolutionSchema,
  foundationStructuredEvidenceSchema,
  type FoundationCompilationWorkers,
} from './foundation-compilation'
import { withAqa7132SourceUniverseGuard } from './foundation-aqa7132-source-universe-guard'

const identity = foundationIdentityResolutionSchema.parse({
  courseIdentity: { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' },
  cohortValidity: { status: 'outgoing', lastAssessment: '2027', notes: [] },
  components: [
    { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 100, durationMinutes: 120 },
    { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 100, durationMinutes: 120 },
    { id: 'paper-3', name: 'Business 3', compulsory: true, marks: 100, durationMinutes: 120 },
  ],
  unresolvedChoices: [],
})

const sourceLicenceRegister = sourceLicenceRegisterSchema.parse({
  schemaVersion: 2,
  jobId: 'test-job',
  fingerprint: 'source-set',
  checkedAt: '2026-09-06T12:00:00Z',
  sources: [
    {
      id: 'revision-seed', issuer: 'Revision', urlOrReference: 'https://example.com/revision-seed', sourceType: 'other_primary',
      educationalRole: ['curriculum truth'], useClass: 'REVISION_OWNED', permissionBasis: 'test', aiInputPermitted: true,
      derivedCommercialUsePermitted: true, attributionRequirements: [], restrictions: [], checkedAt: '2026-09-06T12:00:00Z',
      checkerMethod: 'test', sourceFingerprint: 'revision-seed-fingerprint', revalidationConditions: [],
    },
    {
      id: 'aqa-7132-subject-content', issuer: 'AQA', urlOrReference: 'https://www.aqa.org.uk/subjects/business', sourceType: 'subject_content',
      educationalRole: ['alignment only'], useClass: 'REFERENCE_ONLY', permissionBasis: 'test', aiInputPermitted: false,
      derivedCommercialUsePermitted: false, attributionRequirements: [], restrictions: ['alignment-facts-only'], checkedAt: '2026-09-06T12:00:00Z',
      checkerMethod: 'test', sourceFingerprint: 'aqa-subject-content-fingerprint', revalidationConditions: [],
    },
    {
      id: 'aqa-7132-scheme', issuer: 'AQA', urlOrReference: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/scheme-of-assessment', sourceType: 'assessment',
      educationalRole: ['alignment only'], useClass: 'REFERENCE_ONLY', permissionBasis: 'test', aiInputPermitted: false,
      derivedCommercialUsePermitted: false, attributionRequirements: [], restrictions: ['alignment-facts-only'], checkedAt: '2026-09-06T12:00:00Z',
      checkerMethod: 'test', sourceFingerprint: 'aqa-scheme-fingerprint', revalidationConditions: [],
    },
    {
      id: 'aqa-7131-7132-formulae-key-data', issuer: 'AQA', urlOrReference: 'https://filestore.aqa.org.uk/resources/business/AQA-7131-7132-FORMULAE.PDF', sourceType: 'quantitative_or_skills_annex',
      educationalRole: ['alignment only'], useClass: 'REFERENCE_ONLY', permissionBasis: 'test', aiInputPermitted: false,
      derivedCommercialUsePermitted: false, attributionRequirements: [], restrictions: ['alignment-facts-only'], checkedAt: '2026-09-06T12:00:00Z',
      checkerMethod: 'test', sourceFingerprint: 'aqa-formulae-fingerprint', revalidationConditions: [],
    },
  ],
})

const evidence = foundationStructuredEvidenceSchema.parse({
  boardAlignmentFacts: [
    { id: 'identity-7132', sourceRef: 'aqa-7132-subject-content', category: 'course_identity', value: 'AQA 7132', verificationStatus: 'verified' },
  ],
  curriculumRequirements: [
    {
      requirementId: 'aqa-3-5-2', officialReference: '3.5.2', requirementSummary: 'Financial performance',
      skillsOrKnowledge: ['Calculate and interpret financial performance measures and variance.'], componentScope: ['paper-1', 'paper-2', 'paper-3'],
      revisionArea: 'Finance', sourceRefs: ['revision-seed'],
    },
    {
      requirementId: 'aqa-3-10-3', officialReference: '3.10.3', requirementSummary: 'Network analysis',
      skillsOrKnowledge: ['Use network analysis to support operational decision making.'], componentScope: ['paper-1', 'paper-2', 'paper-3'],
      revisionArea: 'Operations', sourceRefs: ['revision-seed'],
    },
  ],
})

const baseAlignment = boardAlignmentSchema.parse({
  schemaVersion: 1,
  jobId: 'test-job',
  fingerprint: 'placeholder',
  courseIdentity: identity.courseIdentity,
  cohortValidity: identity.cohortValidity,
  components: identity.components,
  assessmentObjectives: [],
  assessmentRequirements: [],
  sourceRefs: ['aqa-7132-subject-content', 'aqa-7132-scheme'],
  verificationStatus: 'verified',
})

const coverageModel = foundationCoverageModelSchema.parse({
  schemaVersion: 2,
  jobId: 'test-job',
  sourceSetFingerprint: sourceLicenceRegister.fingerprint,
  requirements: [
    { ...evidence.curriculumRequirements[0], knowledgeNodeIds: ['aqa-3-5-2.k01'], coverageStatus: 'complete' },
    { ...evidence.curriculumRequirements[1], knowledgeNodeIds: ['aqa-3-10-3.k01'], coverageStatus: 'complete' },
  ],
})

const baseCourseTruth = courseKnowledgeModelSchema.parse({
  schemaVersion: 1,
  jobId: 'test-job',
  fingerprint: 'placeholder',
  nodes: [
    {
      id: 'aqa-3-5-2.k01', kind: 'formula', summary: 'Financial performance measures support interpretation of business performance.',
      prerequisiteIds: [], relatedIds: [], formulas: [], misconceptions: [], applicationContexts: [], depth: 'core',
      sourceRefs: ['revision-seed'], boardAlignmentRefs: ['paper-1'], evidenceTypes: ['calculation'],
    },
    {
      id: 'aqa-3-10-3.k01', kind: 'concept', summary: 'Network analysis supports project planning.',
      prerequisiteIds: [], relatedIds: [], formulas: [], misconceptions: [], applicationContexts: [], depth: 'core',
      sourceRefs: ['revision-seed'], boardAlignmentRefs: ['paper-1'], evidenceTypes: ['explanation'],
    },
  ],
})

function ok(output: unknown) {
  return {
    status: 'success' as const,
    output,
    provenance: { id: 'test-worker', contextId: 'test-context', contractVersion: '1', provider: 'test' },
  }
}

const baseWorkers: FoundationCompilationWorkers = {
  resolveIdentity: async () => ok(identity),
  discoverSources: async () => ok([]),
  resolveStructuredEvidence: async () => ok(evidence),
  compileBoardAlignment: async () => ok(baseAlignment),
  compileCoverage: async () => ok(coverageModel),
  compileCourseTruth: async () => ok(baseCourseTruth),
  compileExamTruth: async () => ok({}),
  compileQuestionFamilies: async () => ok([]),
}

describe('AQA 7132 REFERENCE_ONLY alignment boundary', () => {
  it('retains controlled curriculum and exam facts in Board Alignment without leaking AQA sources into Course Truth provenance', async () => {
    const workers = withAqa7132SourceUniverseGuard(baseWorkers)
    const structured = await workers.resolveStructuredEvidence({
      jobId: 'test-job', officialUrls: ['https://www.aqa.org.uk/subjects/business'], identity, sourceLicenceRegister,
    })
    expect(structured.status).toBe('success')
    if (structured.status !== 'success') throw new Error(structured.error)
    const resolvedEvidence = foundationStructuredEvidenceSchema.parse(structured.output)

    expect(resolvedEvidence.curriculumRequirements.flatMap((requirement) => requirement.sourceRefs))
      .not.toContain('aqa-7131-7132-formulae-key-data')
    expect(resolvedEvidence.boardAlignmentFacts.find((fact) => fact.id === 'aqa-quant-variance-convention')?.sourceRef)
      .toBe('aqa-7131-7132-formulae-key-data')
    expect(resolvedEvidence.boardAlignmentFacts.find((fact) => fact.id === 'aqa-exam-ao-weighting'))
      .toMatchObject({
        sourceRef: 'aqa-7132-scheme',
        category: 'assessment_requirement',
        value: 'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
        verificationStatus: 'verified',
      })

    const alignmentExecution = await workers.compileBoardAlignment({
      jobId: 'test-job', identity, sourceLicenceRegister, facts: resolvedEvidence.boardAlignmentFacts,
    })
    expect(alignmentExecution.status).toBe('success')
    if (alignmentExecution.status !== 'success') throw new Error(alignmentExecution.error)
    const alignment = boardAlignmentSchema.parse(alignmentExecution.output)

    expect(alignment.assessmentRequirements.find((requirement) => requirement.id === 'aqa-quant-variance-convention')?.sourceRefs)
      .toEqual(['aqa-7131-7132-formulae-key-data'])
    expect(alignment.assessmentRequirements.find((requirement) => requirement.id === 'aqa-exam-ao-weighting'))
      .toMatchObject({
        summary: 'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
        componentScope: ['paper-1', 'paper-2', 'paper-3'],
        sourceRefs: ['aqa-7132-scheme'],
      })

    const courseExecution = await workers.compileCourseTruth({
      jobId: 'test-job', identity, sourceLicenceRegister, boardAlignment: alignment, coverageModel, requirements: evidence.curriculumRequirements,
    })
    expect(courseExecution.status).toBe('success')
    if (courseExecution.status !== 'success') throw new Error(courseExecution.error)
    const courseTruth = courseKnowledgeModelSchema.parse(courseExecution.output)
    const financeNode = courseTruth.nodes.find((node) => node.id === 'aqa-3-5-2.k01')!
    const criticalPathNode = courseTruth.nodes.find((node) => node.id === 'aqa-3-10-3.k01')!

    expect(financeNode.formulas).toContain('Variance = budgeted figure − actual figure')
    expect(financeNode.formulas).toContain('Gross profit margin (%) = gross profit ÷ revenue × 100')
    expect(financeNode.sourceRefs).toEqual(['revision-seed'])
    expect(financeNode.boardAlignmentRefs).toContain('aqa-quant-variance-convention')
    expect(criticalPathNode.summary).toContain('longest-duration start-to-finish route')
    expect(criticalPathNode.boardAlignmentRefs).toContain('aqa-method-critical-path')
    expect(courseTruth.nodes.flatMap((node) => node.boardAlignmentRefs)).not.toContain('aqa-exam-ao-weighting')
  })
})
