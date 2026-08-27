import { describe, expect, it, vi } from 'vitest'
import { classifySourcesWithApprovedRules, identityResolutionOutputSchema } from './intake-to-knowledge-model'
import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
  AQA_AS_BUSINESS_7131_URLS,
  LivePilotArtifactStore,
  createAqaAsBusiness7131LivePilotWorkers,
  preflightAqaAsBusiness7131Sources,
} from './live-pilot'

const route = { model: 'test-model', inputUsdPerMillion: 1, cachedInputUsdPerMillion: 0.1, outputUsdPerMillion: 5 }

function sourcePage(url: string) {
  if (url === AQA_AS_BUSINESS_7131_URLS.dfeSubjectContent) return 'GCE AS and A level subject content for business. Open Government Licence.'
  if (url === AQA_AS_BUSINESS_7131_URLS.ofqualAssessmentObjectives) return 'Assessment objectives for Business. Open Government Licence.'
  if (url === AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness) return 'Bus 300 Business Fundamentals. CC BY 4.0. Marketing. Accounting and Finance. Operations. Human Resources.'
  if (url === AQA_AS_BUSINESS_7131_URLS.libreTextsTerms) return 'Content can be downloaded or copied consistent with the licensing of the material.'
  if (url === AQA_AS_BUSINESS_7131_URLS.specification) return 'AQA AS Business 7131 specification for 2026.'
  if (url === AQA_AS_BUSINESS_7131_URLS.assessment) return 'Paper 1 and Paper 2. 10 multiple choice questions. Short answer questions. Two data response stimuli. One compulsory case study. 80 marks each.'
  if (url === AQA_AS_BUSINESS_7131_URLS.subjectContent) return 'What is business? Marketing management. Financial management.'
  return 'unexpected source'
}

function preflightFetch(): typeof fetch {
  return vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    return new Response(sourcePage(url), { status: 200 })
  }) as typeof fetch
}

function liveWorkers(fetchImpl = preflightFetch()) {
  return createAqaAsBusiness7131LivePilotWorkers({
    openAI: { apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 0 },
    artifactStore: new LivePilotArtifactStore(),
    fetchImpl,
  })
}

const identity = identityResolutionOutputSchema.parse({
  courseIdentity: { subject: 'Business', qualification: 'AS Level', awardingBody: 'AQA', specificationId: '7131' },
  cohortValidity: { status: 'outgoing', lastAssessment: '2026', notes: [] },
  components: [
    { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
    { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
  ],
  unresolvedChoices: [],
})

describe('AQA AS Business 7131 live pilot profile', () => {
  it('admits only explicitly permitted curriculum sources and keeps AQA reference-only', async () => {
    const workers = liveWorkers()
    const sourceExecution = await workers.discoverSources({ jobId: 'live-pilot-test', officialUrls: [AQA_AS_BUSINESS_7131_URLS.specification], identity })
    expect(sourceExecution.status).toBe('success')
    if (sourceExecution.status !== 'success') throw new Error(sourceExecution.error)

    const rights = await classifySourcesWithApprovedRules({
      jobId: 'live-pilot-test',
      sources: sourceExecution.output as never[],
      rules: AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
      checkedAt: '2026-08-26T05:00:00Z',
    })

    expect(rights.status).toBe('approved')
    const aqa = rights.register.sources.filter((source) => source.issuer === 'AQA')
    expect(aqa).toHaveLength(3)
    expect(aqa.every((source) => source.useClass === 'REFERENCE_ONLY' && !source.aiInputPermitted && !source.derivedCommercialUsePermitted)).toBe(true)

    const curriculum = rights.register.sources.filter((source) => ['Department for Education', 'LibreTexts'].includes(source.issuer))
    expect(curriculum).toHaveLength(2)
    expect(curriculum.every((source) => source.useClass === 'OPEN' && source.aiInputPermitted && source.derivedCommercialUsePermitted)).toBe(true)
    expect(rights.register.sources.some((source) => source.issuer === 'OpenStax')).toBe(false)
  })

  it('keeps curriculum requirements on permitted sources and AQA only in structured alignment facts', async () => {
    const workers = liveWorkers()
    const evidenceExecution = await workers.resolveStructuredEvidence({
      jobId: 'live-pilot-test',
      officialUrls: [AQA_AS_BUSINESS_7131_URLS.specification],
      identity,
      sourceLicenceRegister: { schemaVersion: 2, jobId: 'live-pilot-test', fingerprint: 'test', checkedAt: '2026-08-26T05:00:00Z', sources: [] },
    })
    expect(evidenceExecution.status).toBe('success')
    if (evidenceExecution.status !== 'success') throw new Error(evidenceExecution.error)
    const evidence = evidenceExecution.output as {
      boardAlignmentFacts: Array<{ sourceRef: string }>
      curriculumRequirements: Array<{ requirementId: string; sourceRefs: string[] }>
    }
    expect(evidence.curriculumRequirements).toHaveLength(13)
    for (const requirement of evidence.curriculumRequirements) {
      expect(requirement.sourceRefs).toEqual(['dfe-business-subject-content', 'libretexts-business-fundamentals'])
      expect(requirement.sourceRefs.some((ref) => ref.startsWith('aqa-'))).toBe(false)
    }
    expect(evidence.boardAlignmentFacts.some((fact) => fact.sourceRef.startsWith('aqa-'))).toBe(true)
  })

  it('covers every live-pilot curriculum requirement in the governed assessment target set', () => {
    const covered = new Set(Object.values(AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES).flatMap((policy) => policy.requirementIds))
    expect(covered).toEqual(new Set([
      'business-foundations',
      'leadership-and-management',
      'decision-making-and-stakeholders',
      'marketing-research',
      'marketing-demand-and-positioning',
      'marketing-mix-and-digital',
      'operations-performance',
      'operations-quality-and-supply',
      'finance-profit-cash-budgeting',
      'finance-analysis-and-funding',
      'people-performance-and-structure',
      'motivation-and-employee-relations',
      'quantitative-business-skills',
    ]))
  })

  it('fails closed if a live source licence marker disappears', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const text = url === AQA_AS_BUSINESS_7131_URLS.libreTextsBusiness
        ? 'Business Fundamentals without a licence marker'
        : sourcePage(url)
      return new Response(text, { status: 200 })
    }) as typeof fetch

    await expect(preflightAqaAsBusiness7131Sources(fetchImpl)).rejects.toThrow(/CC BY 4\.0/i)
  })
})
