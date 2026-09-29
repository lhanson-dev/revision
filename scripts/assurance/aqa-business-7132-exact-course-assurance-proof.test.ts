import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createOpenAIFoundationLiveProvider } from '../../src/content-factory/foundation-live-adapter'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_EXACT_COURSE_ASSURANCE_PROOF === '1'
const INPUT = '.artifacts/content-factory-aqa-business-7132-exact-course-assurance'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-exact-course-assurance-proof'
const expectedCourseId = 'aqa:aqa-a-level:7132'
const expectedExamYear = 2027
const maxReferenceBytes = 30 * 1024 * 1024
const allowedAqaHosts = new Set(['www.aqa.org.uk'])

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

const findingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor', 'no_issue']),
  issue_type: z.enum([
    'factual_accuracy',
    'subject_scope_depth',
    'specification_mapping',
    'quantitative_accuracy',
    'relationships_and_boundaries',
    'assessment_truth',
    'rights_and_provenance',
    'unsupported_extrapolation',
  ]),
  affected_layer: z.enum(['subject_foundation', 'course_truth', 'exam_truth', 'runtime_handoff']),
  affected_ids: z.array(z.string().min(1)).min(1),
  evidence_refs: z.array(z.string().min(1)).min(1),
  finding: z.string().min(1),
  recommended_correction: z.string().min(1),
  resolution_status: z.enum(['open', 'not_applicable']),
}).superRefine((finding, context) => {
  if (finding.severity === 'no_issue' && finding.resolution_status !== 'not_applicable') {
    context.addIssue({ code: 'custom', path: ['resolution_status'], message: 'no_issue findings must be not_applicable' })
  }
  if (finding.severity !== 'no_issue' && finding.resolution_status !== 'open') {
    context.addIssue({ code: 'custom', path: ['resolution_status'], message: 'accuracy findings must enter the register as open' })
  }
})

const reviewOutputSchema = z.object({
  reviewed_commit: commitShaSchema,
  exact_course_foundation_fingerprint: sha256Schema,
  decision: z.enum(['pass', 'fail_hold']),
  findings: z.array(findingSchema).default([]),
  known_limitations: z.array(z.string().min(1)).default([]),
}).superRefine((review, context) => {
  const material = review.findings.some(
    (finding) => finding.resolution_status === 'open' && ['blocking', 'material'].includes(finding.severity),
  )
  if (material && review.decision !== 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'blocking/material findings require fail_hold' })
  }
  if (!material && review.decision !== 'pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'review without blocking/material findings must pass' })
  }
})

const reviewBundleSchema = z.object({
  schema_version: z.literal(1),
  artifact_type: z.literal('aqa_7132_exact_course_review_bundle'),
  exact_course_foundation_identity: z.object({
    course_id: z.literal(expectedCourseId),
    exam_year: z.literal(expectedExamYear),
    subject_foundation_fingerprint: sha256Schema,
    specification_mapping_id: z.string().min(1),
    specification_mapping_fingerprint: sha256Schema,
    reassurance_fingerprint: sha256Schema,
    course_truth_fingerprint: sha256Schema,
    exam_truth_fingerprint: sha256Schema,
    selected_subject_node_ids: z.array(z.string().min(1)).min(1),
  }).passthrough(),
  exact_course_foundation_fingerprint: sha256Schema,
  rights_boundary: z.object({
    reusable_subject_truth: z.string().min(1),
    awarding_body_material: z.string().min(1),
    protected_aqa_source_body_for_ai_review: z.literal(false),
  }),
  course_truth: z.record(z.string(), z.unknown()),
  exam_truth: z.object({
    course_id: z.literal(expectedCourseId),
    exam_year: z.literal(expectedExamYear),
    sources: z.array(z.object({
      source_id: z.string().min(1),
      source_type: z.string().min(1),
      url: z.string().url(),
      rights_classification: z.literal('REFERENCE_ONLY'),
      supports: z.array(z.string().min(1)).min(1),
    }).passthrough()).min(1),
  }).passthrough(),
  selected_subject_foundation_nodes: z.array(z.unknown()).min(1),
  subject_truth_sources: z.array(z.unknown()).min(1),
  runtime_handoff_evidence: z.record(z.string(), z.unknown()),
  deterministic_assurance: z.object({
    decision: z.literal('pass'),
    unresolved_blocking_or_material_findings: z.literal(0),
  }).passthrough(),
  deliberate_boundaries: z.array(z.string().min(1)).min(1),
}).passthrough()

const candidateSchema = z.object({
  schema_version: z.literal(1),
  artifact_type: z.literal('aqa_7132_exact_course_foundation_candidate'),
  status: z.literal('deterministic_pass_pending_fresh_review'),
  exact_course_foundation_fingerprint: sha256Schema,
  gates: z.object({
    ai_assured: z.literal(false),
    controlled_internal_asset_production_allowed: z.literal(false),
    foundation_approved: z.literal(false),
    learner_publication_eligible: z.literal(false),
  }),
  known_limitations: z.array(z.string().min(1)).default([]),
}).passthrough()

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function sha256(bytes: ArrayBuffer) {
  return createHash('sha256').update(Buffer.from(bytes)).digest('hex')
}

function expectedSourceMarkers(sourceId: string) {
  const markers: Record<string, string[]> = {
    'AQA-7132-SCHEME-OF-ASSESSMENT': ['assessment objectives'],
    'AQA-7132-SPECIFICATION-AT-A-GLANCE': ['paper 1', 'paper 2', 'paper 3'],
    'AQA-7132-QUANTITATIVE-SKILLS': ['quantitative skills'],
    'AQA-7132-ASSESSMENT-RESOURCES': ['assessment resources'],
  }
  const value = markers[sourceId]
  if (!value) throw new Error(`unrecognised_stable_exam_truth_source:${sourceId}`)
  return value
}

async function inspectOfficialAqaSource(source: z.infer<typeof reviewBundleSchema>['exam_truth']['sources'][number], checkedAt: string) {
  const requested = new URL(source.url)
  if (requested.protocol !== 'https:' || !allowedAqaHosts.has(requested.hostname)) {
    throw new Error(`unapproved_aqa_reference:${source.url}`)
  }

  const response = await fetch(requested, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'Revision-AQA-7132-Exact-Course-Assurance/1.0',
      Accept: 'text/html,application/xhtml+xml,*/*;q=0.5',
    },
  })
  if (!response.ok) throw new Error(`http_${response.status}`)

  const finalUrl = new URL(response.url || requested.toString())
  if (finalUrl.protocol !== 'https:' || !allowedAqaHosts.has(finalUrl.hostname)) {
    throw new Error(`redirected_outside_approved_aqa_hosts:${finalUrl.hostname}`)
  }

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0) throw new Error('empty_reference')
  if (bytes.byteLength > maxReferenceBytes) throw new Error(`reference_too_large:${bytes.byteLength}`)

  const body = new TextDecoder().decode(bytes).toLowerCase()
  const missingMarkers = expectedSourceMarkers(source.source_id).filter((marker) => !body.includes(marker.toLowerCase()))
  if (missingMarkers.length > 0) throw new Error(`expected_reference_markers_missing:${missingMarkers.join(',')}`)

  return {
    source_id: source.source_id,
    requested_url: requested.toString(),
    final_url: finalUrl.toString(),
    http_status: response.status,
    content_type: response.headers.get('content-type') ?? '',
    content_length_bytes: bytes.byteLength,
    content_sha256: sha256(bytes),
    etag: response.headers.get('etag') ?? null,
    last_modified: response.headers.get('last-modified') ?? null,
    checked_at: checkedAt,
    source_body_retained: false,
    source_body_sent_to_ai_reviewer: false,
  }
}

async function runExternalSourceChallenge(bundle: z.infer<typeof reviewBundleSchema>) {
  const checkedAt = new Date().toISOString()
  const expectedIds = [
    'AQA-7132-SCHEME-OF-ASSESSMENT',
    'AQA-7132-SPECIFICATION-AT-A-GLANCE',
    'AQA-7132-QUANTITATIVE-SKILLS',
    'AQA-7132-ASSESSMENT-RESOURCES',
  ].sort()
  const actualIds = bundle.exam_truth.sources.map((source) => source.source_id).sort()
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    return {
      schema_version: 1,
      artifact_type: 'aqa_7132_exact_course_external_source_challenge',
      decision: 'fail_hold' as const,
      checked_at: checkedAt,
      source_checks: [],
      findings: [{
        id: 'stable-source-universe-mismatch',
        severity: 'blocking',
        finding: `Expected ${expectedIds.join(', ')}; got ${actualIds.join(', ')}`,
        required_correction: 'Restore and re-assure the governed stable Exam Truth source universe.',
      }],
      protected_source_body_retained: false,
      protected_source_body_sent_to_ai_reviewer: false,
    }
  }

  const sourceChecks: unknown[] = []
  const findings: Array<{ id: string; severity: 'material'; finding: string; required_correction: string }> = []
  for (const source of bundle.exam_truth.sources) {
    try {
      sourceChecks.push(await inspectOfficialAqaSource(source, checkedAt))
    } catch (error) {
      findings.push({
        id: `source-${source.source_id.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')}-fresh-check-failed`,
        severity: 'material',
        finding: `Fresh official-source retrieval failed for ${source.source_id}: ${error instanceof Error ? error.message : String(error)}`,
        required_correction: 'Resolve the current official AQA reference and rerun T8 exact-course assurance.',
      })
    }
  }

  return {
    schema_version: 1,
    artifact_type: 'aqa_7132_exact_course_external_source_challenge',
    decision: findings.length > 0 ? 'fail_hold' as const : 'pass' as const,
    checked_at: checkedAt,
    source_checks: sourceChecks,
    findings,
    protected_source_body_retained: false,
    protected_source_body_sent_to_ai_reviewer: false,
  }
}

async function runIndependentReview(bundle: z.infer<typeof reviewBundleSchema>, reviewedCommit: string) {
  const apiKey = requiredEnv('OPENAI_API_KEY')
  const model = env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra'
  const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 12)
  const provider = createOpenAIFoundationLiveProvider({
    apiKey,
    maxSpendUsd,
    generation: {
      model,
      inputUsdPerMillion: 2,
      cachedInputUsdPerMillion: 0.2,
      outputUsdPerMillion: 12,
      cacheWriteMultiplier: 1.25,
      longContextThresholdTokens: 272_000,
      longContextInputMultiplier: 2,
      longContextOutputMultiplier: 1.5,
      reasoningEffort: 'high',
      maxOutputTokens: 8_000,
    },
    independentReview: {
      model,
      inputUsdPerMillion: 2,
      cachedInputUsdPerMillion: 0.2,
      outputUsdPerMillion: 12,
      cacheWriteMultiplier: 1.25,
      longContextThresholdTokens: 272_000,
      longContextInputMultiplier: 2,
      longContextOutputMultiplier: 1.5,
      reasoningEffort: 'high',
      maxOutputTokens: 12_000,
    },
    maxRetries: 2,
  })

  const execution = await provider.run({
    workerId: 'content-factory.aqa-7132.exact-course-independent-review',
    contractVersion: '1',
    routeKind: 'independent_review',
    strictOutput: true,
    outputSchema: reviewOutputSchema,
    instructions: [
      'Act as a fresh independent educational and assessment reviewer of the exact AQA A-level Business 7132 — 2027 Course Foundation Candidate supplied.',
      'This is T8 exact-course assurance. Do not rewrite content for style and do not generate learner-facing Learn, Practice or Exam Prep assets.',
      'The reusable Business Subject Foundation is the source of subject teaching truth. AQA material is reference-only course/alignment evidence and must never be treated as reusable teaching prose.',
      'Challenge whether all supplied exact-course requirements map to sufficient subject knowledge/depth, whether the mapped subject nodes are educationally correct and coherent at UK Level 3, and whether the stable Exam Truth is internally complete and compatible with the exact course.',
      'Check definitions, formulas, methods, misconceptions, relationships, quantitative interpretation and course-specific facets. Do not demand university-level depth where it is not required for genuine A-level Business understanding.',
      'Treat the supplied stable assessment contract as the deliberate Exam Truth boundary. Future question-level mark allocations, indicative content, detailed mark-scheme wording and examiner preferences are variable and must not be invented as durable truth.',
      'Do not treat the absence of future exam predictions, exact future question mix or operational exam dates as an assurance defect.',
      'The runtime adapter is compatibility evidence only. Flag it only if it loses or contradicts authoritative Subject Foundation, Course Truth or Exam Truth dependencies.',
      'Use only the structured facts supplied in the payload. Do not browse and do not rely on model memory to add awarding-body facts. Protected AQA source bodies are intentionally not supplied.',
      'Classify a defect in reusable Business knowledge as affected_layer=subject_foundation. Classify an exact mapping/projection defect as course_truth. Classify stable assessment-contract defects as exam_truth.',
      'Blocking means progression is unsafe. Material means educational/assessment truth requires correction before AI assurance. Minor means a real precision or limitation issue that does not make downstream controlled derivation unsafe.',
      'Return fail_hold if any blocking/material finding exists. Otherwise return pass, retaining all minor findings and known limitations explicitly.',
      'Copy reviewed_commit and exact_course_foundation_fingerprint exactly from reviewIdentity.',
    ].join('\n'),
    payload: {
      reviewIdentity: {
        reviewed_commit: reviewedCommit,
        exact_course_foundation_fingerprint: bundle.exact_course_foundation_fingerprint,
      },
      rightsBoundary: bundle.rights_boundary,
      exactCourseFoundationIdentity: bundle.exact_course_foundation_identity,
      deterministicAssurance: bundle.deterministic_assurance,
      courseTruth: bundle.course_truth,
      examTruth: bundle.exam_truth,
      selectedSubjectFoundationNodes: bundle.selected_subject_foundation_nodes,
      subjectTruthSources: bundle.subject_truth_sources,
      runtimeHandoffEvidence: bundle.runtime_handoff_evidence,
      deliberateBoundaries: bundle.deliberate_boundaries,
    },
  })

  if (execution.status !== 'success') {
    throw new Error(`exact_course_independent_review_provider_failure:${execution.error}`)
  }
  const review = reviewOutputSchema.parse(execution.output)
  if (review.reviewed_commit !== reviewedCommit) throw new Error('independent_review_commit_mismatch')
  if (review.exact_course_foundation_fingerprint !== bundle.exact_course_foundation_fingerprint) {
    throw new Error('independent_review_foundation_fingerprint_mismatch')
  }
  return { review, provenance: execution.provenance, providerBudget: provider.budgetSnapshot?.() ?? null }
}

describe('AQA Business 7132 T8 exact-course assurance proof', () => {
  const proofIt = proofEnabled ? it : it.skip

  proofIt('runs a fresh independent review plus reference-only official-source challenge without unlocking learner publication', async () => {
    const reviewedCommit = requiredEnv('CONTENT_FACTORY_EXACT_COURSE_REVIEWED_COMMIT')
    const bundle = reviewBundleSchema.parse(JSON.parse(await readFile(`${INPUT}/review-bundle.json`, 'utf8')))
    const candidate = candidateSchema.parse(JSON.parse(await readFile(`${INPUT}/candidate.json`, 'utf8')))

    expect(candidate.exact_course_foundation_fingerprint).toBe(bundle.exact_course_foundation_fingerprint)
    expect(bundle.exact_course_foundation_identity.course_id).toBe(expectedCourseId)
    expect(bundle.exact_course_foundation_identity.exam_year).toBe(expectedExamYear)
    expect(bundle.deterministic_assurance.decision).toBe('pass')
    expect(bundle.rights_boundary.protected_aqa_source_body_for_ai_review).toBe(false)

    const independent = await runIndependentReview(bundle, reviewedCommit)
    const external = await runExternalSourceChallenge(bundle)
    expect(independent.provenance.contextId).toMatch(/^openai-content-factory\.aqa-7132\.exact-course-independent-review-/)

    const openBlockingOrMaterial = independent.review.findings.filter(
      (finding) => finding.resolution_status === 'open' && ['blocking', 'material'].includes(finding.severity),
    )
    const aiAssured = independent.review.decision === 'pass'
      && external.decision === 'pass'
      && openBlockingOrMaterial.length === 0

    const finalEvidence = {
      schema_version: 1,
      artifact_type: 'aqa_7132_exact_course_assurance_proof',
      recorded_at: new Date().toISOString(),
      reviewed_commit: reviewedCommit,
      course_id: expectedCourseId,
      exam_year: expectedExamYear,
      exact_course_foundation_fingerprint: bundle.exact_course_foundation_fingerprint,
      dependencies: bundle.exact_course_foundation_identity,
      deterministic_assurance: bundle.deterministic_assurance,
      independent_review: {
        ...independent.review,
        reviewer: independent.provenance,
        provider_budget: independent.providerBudget,
      },
      external_source_challenge: external,
      unresolved_blocking_or_material_findings: openBlockingOrMaterial.length + external.findings.length,
      known_limitations: [...new Set([
        ...candidate.known_limitations,
        ...independent.review.known_limitations,
        ...independent.review.findings
          .filter((finding) => finding.severity === 'minor')
          .map((finding) => `${finding.id}: ${finding.finding}`),
      ])],
      final_state: aiAssured ? 'ai_assured' : 'fail_hold',
      gates: {
        ai_assured: aiAssured,
        controlled_internal_asset_production_allowed: aiAssured,
        qualified_human_review_status: 'pending',
        foundation_approved: false,
        learner_publication_eligible: false,
      },
      remediation_rule: aiAssured
        ? 'No blocking/material remediation required before controlled internal derivation. Retain minor findings/limitations for human review and downstream design.'
        : 'Do not generate downstream assets. Remediate blocking/material findings at the smallest governing layer, create a new fingerprint where material truth changes, then rerun affected T8 assurance.',
    }

    await mkdir(OUTPUT, { recursive: true })
    await writeFile(`${OUTPUT}/exact-course-assurance-proof.json`, JSON.stringify(finalEvidence, null, 2), 'utf8')
    await writeFile(`${OUTPUT}/summary.json`, JSON.stringify({
      finalState: finalEvidence.final_state,
      exactCourseFoundationFingerprint: finalEvidence.exact_course_foundation_fingerprint,
      independentReviewDecision: independent.review.decision,
      independentReviewFindingCount: independent.review.findings.length,
      externalSourceChallengeDecision: external.decision,
      unresolvedBlockingOrMaterialFindings: finalEvidence.unresolved_blocking_or_material_findings,
      controlledInternalAssetProductionAllowed: finalEvidence.gates.controlled_internal_asset_production_allowed,
      qualifiedHumanReviewStatus: finalEvidence.gates.qualified_human_review_status,
      foundationApproved: false,
      learnerPublicationEligible: false,
    }, null, 2), 'utf8')

    expect(finalEvidence.gates.foundation_approved).toBe(false)
    expect(finalEvidence.gates.learner_publication_eligible).toBe(false)
    expect(external.protected_source_body_retained).toBe(false)
    expect(external.protected_source_body_sent_to_ai_reviewer).toBe(false)

    if (!aiAssured) {
      throw new Error(`exact_course_assurance_fail_hold:${JSON.stringify({
        independentReviewDecision: independent.review.decision,
        independentReviewFindings: independent.review.findings,
        externalSourceFindings: external.findings,
      })}`)
    }
  }, 30 * 60 * 1000)
})
