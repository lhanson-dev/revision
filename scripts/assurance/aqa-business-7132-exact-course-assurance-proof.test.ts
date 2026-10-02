// T8 exact-course gate for AQA A-level Business 7132 (2027), run under the fast-path rules (ADR-0029):
// software checks first, then one fixed-checklist AI review per specification section, with the
// two-round limit, Founder escalation, fingerprint reuse and item-level failure handling.
// Live runs are post-merge only (workflow_dispatch on main); PR runs only load this contract.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { createOpenAIFoundationLiveProvider } from '../../src/content-factory/foundation-live-adapter'
import {
  MAX_AI_CALL_ATTEMPTS,
  checklistInstructions,
  escalationEntries,
  renderRunSummary,
  reviewOutputSchema,
  runReviewUnits,
  type Ledger,
} from '../../src/content-factory/fast-path-review'
import {
  COURSE_GATE_CHECKLIST,
  COURSE_GATE_INSTRUCTIONS,
  buildCourseGateUnits,
  dependencyFreshness,
  type CourseGateBundle,
  type CoverageReport,
} from './aqa-business-7132-course-gate'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_EXACT_COURSE_ASSURANCE_PROOF === '1'
const INPUT = '.artifacts/content-factory-aqa-business-7132-exact-course-assurance'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-exact-course-assurance-proof'
const COVERAGE_REPORT = 'research/aqa-business-7132/2027/ITEM_COVERAGE_REPORT.json'
// Committed between runs so unchanged sections are reused and review rounds are counted.
const LEDGER = 'content-factory/runs/aqa-7132-course-gate/ledger.json'
// Founder decisions are separate durable evidence so a two-round escalation can be closed without rewriting the retained failed-run ledger.
const FOUNDER_DECISIONS = 'content-factory/runs/aqa-7132-course-gate/founder-decisions.json'
const allowedAqaHosts = new Set(['www.aqa.org.uk'])
const expectedExamTruthSources: Record<string, string[]> = {
  'AQA-7132-SCHEME-OF-ASSESSMENT': ['assessment objectives'],
  'AQA-7132-SPECIFICATION-AT-A-GLANCE': ['paper 1', 'paper 2', 'paper 3'],
  'AQA-7132-QUANTITATIVE-SKILLS': ['quantitative skills'],
  'AQA-7132-ASSESSMENT-RESOURCES': ['assessment resources'],
}

type FounderDecisionRecord = {
  unit_id: string
  reviewed_run_id: number
  reviewed_commit: string
  reviewed_unit_fingerprint: string
  decision: 'accept' | 'fix' | 'remove'
  note: string
  decided_at: string
}

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

// Software provenance check: the official AQA reference pages behind Exam Truth are still where we say.
// Each page is retried; a page that still cannot be read is listed as failed, not treated as a teaching defect.
async function checkOfficialAqaSources(sources: Array<{ source_id: string; url: string }>) {
  const checked: unknown[] = []
  const failed: Array<{ source_id: string; error: string }> = []
  for (const source of sources) {
    const markers = expectedExamTruthSources[source.source_id]
    let lastError = markers ? '' : `unrecognised Exam Truth source ${source.source_id}`
    for (let attempt = 1; markers && attempt <= MAX_AI_CALL_ATTEMPTS; attempt++) {
      try {
        const requested = new URL(source.url)
        if (requested.protocol !== 'https:' || !allowedAqaHosts.has(requested.hostname)) throw new Error(`unapproved_aqa_reference:${source.url}`)
        const response = await fetch(requested, { redirect: 'follow', headers: { 'User-Agent': 'Revision-AQA-7132-Exact-Course-Assurance/2.0' } })
        if (!response.ok) throw new Error(`http_${response.status}`)
        const finalUrl = new URL(response.url || requested.toString())
        if (!allowedAqaHosts.has(finalUrl.hostname)) throw new Error(`redirected_outside_approved_aqa_hosts:${finalUrl.hostname}`)
        const bytes = await response.arrayBuffer()
        const body = new TextDecoder().decode(bytes).toLowerCase()
        const missing = markers.filter((marker) => !body.includes(marker))
        if (missing.length) throw new Error(`expected_reference_markers_missing:${missing.join(',')}`)
        checked.push({ source_id: source.source_id, final_url: finalUrl.toString(), content_sha256: createHash('sha256').update(Buffer.from(bytes)).digest('hex'), source_body_retained: false, source_body_sent_to_ai_reviewer: false })
        lastError = ''
        break
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }
    if (lastError) failed.push({ source_id: source.source_id, error: lastError })
  }
  const missingIds = Object.keys(expectedExamTruthSources).filter((id) => !sources.some((source) => source.source_id === id))
  return { checked, failed, missing_expected_sources: missingIds, ok: failed.length === 0 && missingIds.length === 0 }
}

async function readLedger(): Promise<Ledger> {
  const raw = await readFile(LEDGER, 'utf8').catch(() => '')
  const empty: Ledger = { schema_version: 1, stage: COURSE_GATE_CHECKLIST.stage, checklist_version: COURSE_GATE_CHECKLIST.version, units: {} }
  if (!raw) return empty
  const ledger = JSON.parse(raw) as Ledger
  // A new checklist means every section is reviewed afresh.
  if (ledger.checklist_version !== COURSE_GATE_CHECKLIST.version) return empty

  const decisionRaw = await readFile(FOUNDER_DECISIONS, 'utf8').catch(() => '')
  if (!decisionRaw) return ledger
  const decisionFile = JSON.parse(decisionRaw) as { schema_version: number; stage: string; decisions: FounderDecisionRecord[] }
  if (decisionFile.schema_version !== 1 || decisionFile.stage !== COURSE_GATE_CHECKLIST.stage) throw new Error('invalid_course_gate_founder_decisions_identity')
  for (const decision of decisionFile.decisions ?? []) {
    const entry = ledger.units[decision.unit_id]
    if (!entry) throw new Error(`course_gate_founder_decision_missing_ledger_unit:${decision.unit_id}`)
    if (entry.fingerprint !== decision.reviewed_unit_fingerprint) throw new Error(`course_gate_founder_decision_fingerprint_mismatch:${decision.unit_id}`)
    entry.founder_decision = { decision: decision.decision, note: decision.note, decided_at: decision.decided_at }
  }
  return ledger
}

describe('AQA Business 7132 T8 exact-course gate (fast path)', () => {
  it('loads the fixed checklist and review contract without provider spend', () => {
    const schema = reviewOutputSchema(COURSE_GATE_CHECKLIST)
    expect(COURSE_GATE_CHECKLIST.checks.map((check) => check.id)).toEqual(['mapping_sense', 'depth', 'calculation_convention', 'accuracy'])
    expect(schema.safeParse({ unit_id: '3.5.3', answers: COURSE_GATE_CHECKLIST.checks.map((check) => ({ check_id: check.id, answer: 'yes', note: '' })), findings: [] }).success).toBe(true)
    expect(checklistInstructions(COURSE_GATE_CHECKLIST)).toContain('Do not look for other problems')
  })

  it('loads the exact-fingerprint Founder decision that closes the second 3.10.3 blocking round before changed-input review', async () => {
    const ledger = await readLedger()
    expect(ledger.units['3.10.3']?.fingerprint).toBe('2a7e73795a939bd8724409616f26a7bcec03c20dfe64d4d4bc4752d8353d811e')
    expect(ledger.units['3.10.3']?.founder_decision?.decision).toBe('fix')
    expect(ledger.units['3.10.3']?.founder_decision?.note).toContain('effective exact-course projection')
  })

  const proofIt = proofEnabled ? it : it.skip

  proofIt('runs software checks, then one fixed-checklist review per section, without unlocking learner publication', async () => {
    const reviewedCommit = requiredEnv('CONTENT_FACTORY_EXACT_COURSE_REVIEWED_COMMIT')
    const bundle = JSON.parse(await readFile(`${INPUT}/review-bundle.json`, 'utf8')) as CourseGateBundle & { exact_course_foundation_fingerprint: string; exam_truth: { sources: Array<{ source_id: string; url: string }> } }
    const coverage = JSON.parse(await readFile(COVERAGE_REPORT, 'utf8')) as CoverageReport
    const candidate = await loadBusinessSubjectFoundationCandidate()
    await mkdir(OUTPUT, { recursive: true })

    // Software: dependency freshness. Nothing is reviewed against an outdated upstream version.
    const freshness = dependencyFreshness(bundle, coverage)
    if (!freshness.ok) {
      await writeFile(`${OUTPUT}/summary.json`, JSON.stringify({ finalState: 'fail_hold', reason: freshness.error }, null, 2))
      throw new Error(`exact_course_gate_dependency_not_fresh:${freshness.error}`)
    }

    const units = buildCourseGateUnits(bundle, coverage, new Set<string>(candidate.changedSinceAssurance ?? candidate.freshNodeScope))
    const provider = createOpenAIFoundationLiveProvider({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd: positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 12),
      generation: reviewerModel(8_000),
      independentReview: reviewerModel(6_000),
      // Retries are counted by runReviewUnits (3 attempts per section), not inside the provider.
      maxRetries: 0,
    })
    const outputSchema = reviewOutputSchema(COURSE_GATE_CHECKLIST)
    const instructions = `${COURSE_GATE_INSTRUCTIONS}\n${checklistInstructions(COURSE_GATE_CHECKLIST)}`

    const run = await runReviewUnits({
      units,
      ledger: await readLedger(),
      checklist: COURSE_GATE_CHECKLIST,
      knownSourceIds: (unit) => unit.sourceIds,
      concurrency: 6,
      review: async (unit) => {
        const execution = await provider.run({
          workerId: 'content-factory.aqa-7132.course-gate-section-review',
          contractVersion: COURSE_GATE_CHECKLIST.version,
          routeKind: 'independent_review',
          strictOutput: true,
          outputSchema,
          instructions,
          payload: unit.payload,
        })
        return execution.status === 'success' ? { ok: true, output: execution.output } : { ok: false, error: `${execution.status}: ${'error' in execution ? execution.error : ''}` }
      },
    })
    const sourceCheck = await checkOfficialAqaSources(bundle.exam_truth.sources)
    const aiAssured = run.summary.can_progress && sourceCheck.ok

    await writeFile(`${OUTPUT}/ledger.json`, `${JSON.stringify(run.ledger, null, 2)}\n`)
    await writeFile(`${OUTPUT}/escalations.json`, `${JSON.stringify(escalationEntries(run.ledger), null, 2)}\n`)
    await writeFile(`${OUTPUT}/SUMMARY.md`, renderRunSummary('AQA 7132 exact-course gate (T8)', run.outcomes, run.ledger)
      + (sourceCheck.ok ? '' : `\n## Official AQA reference check failed\n${[...sourceCheck.failed.map((item) => `- ${item.source_id}: ${item.error}`), ...sourceCheck.missing_expected_sources.map((id) => `- ${id}: missing from Exam Truth`)].join('\n')}\n`))
    const evidence = {
      schema_version: 2,
      artifact_type: 'aqa_7132_exact_course_gate_fast_path',
      recorded_at: new Date().toISOString(),
      reviewed_commit: reviewedCommit,
      exact_course_foundation_fingerprint: bundle.exact_course_foundation_fingerprint,
      checklist: COURSE_GATE_CHECKLIST,
      summary: run.summary,
      outcomes: run.outcomes,
      official_source_check: sourceCheck,
      provider_budget: provider.budgetSnapshot?.() ?? null,
      final_state: aiAssured ? 'ai_assured' : 'fail_hold',
      gates: {
        ai_assured: aiAssured,
        controlled_internal_asset_production_allowed: aiAssured,
        qualified_human_review_status: 'pending',
        foundation_approved: false,
        learner_publication_eligible: false,
      },
    }
    await writeFile(`${OUTPUT}/exact-course-assurance-proof.json`, `${JSON.stringify(evidence, null, 2)}\n`)
    await writeFile(`${OUTPUT}/summary.json`, `${JSON.stringify({ finalState: evidence.final_state, ...run.summary, officialSourceCheckOk: sourceCheck.ok }, null, 2)}\n`)

    expect(evidence.gates.foundation_approved).toBe(false)
    expect(evidence.gates.learner_publication_eligible).toBe(false)
    if (!aiAssured) throw new Error(`exact_course_gate_fail_hold: see ${OUTPUT}/SUMMARY.md`)
  }, 45 * 60 * 1000)
})

function reviewerModel(maxOutputTokens: number) {
  return {
    model: env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra',
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 12,
    cacheWriteMultiplier: 1.25,
    longContextThresholdTokens: 272_000,
    longContextInputMultiplier: 2,
    longContextOutputMultiplier: 1.5,
    reasoningEffort: 'high' as const,
    maxOutputTokens,
  }
}
