import { readFileSync, rmSync } from 'node:fs'
import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  buildPsychologyLaunchPackets,
  estimateLaunchAttemptReserveUsd,
  runPsychologyLaunchAssurance,
  validateLaunchAssuranceMaxSpend,
} from './psychology-launch-assurance'

const COURSE_TRUTH_DIR = 'research/source-first-course-prototype/psychology-course-truth'
const EXAM_TRUTH_PATH = 'research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'
const OUTPUT_DIR = '.artifacts/psychology-launch-assurance'
const LIVE_TIMEOUT_MS = 40 * 60 * 1_000
const live = process.env.PSYCHOLOGY_LAUNCH_ASSURANCE_LIVE === '1'

afterEach(() => {
  vi.unstubAllGlobals()
  if (!live) rmSync(OUTPUT_DIR, { recursive: true, force: true })
})

describe('Psychology launch assurance', () => {
  const packets = buildPsychologyLaunchPackets(COURSE_TRUTH_DIR, EXAM_TRUTH_PATH)

  test('covers all 17 topics and all 118 requirements exactly once', () => {
    expect(packets.summary.educationalPacketCount).toBe(7)
    expect(packets.summary.assessmentPacketCount).toBe(3)
    expect(packets.summary.topicCount).toBe(17)
    expect(packets.summary.requirementCount).toBe(118)
    expect(packets.summary.requirementCoverageCount).toBe(118)

    const ids = packets.educational.flatMap((packet) => packet.requirementIds)
    expect(ids).toHaveLength(118)
    expect(new Set(ids).size).toBe(118)
    expect(new Set(packets.educational.flatMap((packet) => packet.topicNumbers)).size).toBe(17)
  })

  test('keeps split Research Methods packets scoped to the requirements they review', () => {
    const first = packets.educational.find((packet) => packet.packetId === 'LAUNCH-EDU-03A')
    const second = packets.educational.find((packet) => packet.packetId === 'LAUNCH-EDU-03B')
    expect(first).toBeDefined()
    expect(second).toBeDefined()

    const firstTopic = first?.topics[0]
    const secondTopic = second?.topics[0]
    const firstSections = ((firstTopic?.productionTopic as { sections?: Array<{ id: string }> })?.sections ?? []).map((section) => section.id)
    const secondSections = ((secondTopic?.productionTopic as { sections?: Array<{ id: string }> })?.sections ?? []).map((section) => section.id)
    const expectedFirst = first?.requirementIds.map((id) => id.toLowerCase().replaceAll('-', '')) ?? []
    const expectedSecond = second?.requirementIds.map((id) => id.toLowerCase().replaceAll('-', '')) ?? []

    expect(firstSections).toEqual(expectedFirst)
    expect(secondSections).toEqual(expectedSecond)
    expect(new Set([...firstSections, ...secondSections]).size).toBe(34)
  })

  test('gives assessment review approved Course Truth for learner-facing psychology claims', () => {
    const paper3 = packets.assessment.find((packet) => packet.paperId === '7182/3')
    expect(paper3).toBeDefined()
    expect(paper3?.rightsBoundary.referenceBasis).toBe('approved_structured_exam_truth_and_course_truth')

    const forensic = paper3?.approvedCourseTruth.find((topic) => topic.topicNumber === 16)
    const custody = forensic?.requirements.find((requirement) => requirement.requirementId === 'PSY-16-04')
    expect(custody).toBeDefined()
    expect(custody?.subjectTruth.evaluationAndLimits?.join(' ')).toContain('2024 token-economy review')
    expect(custody?.sourceEvidence.some((source) => String(source.url).includes('10.5812/mejrh-142886'))).toBe(true)
  })

  test('reviews exact production Learn, flashcard and objective Practice against Course Truth', () => {
    for (const packet of packets.educational) {
      expect(packet.rightsBoundary.officialAqaSourceTextIncluded).toBe(false)
      expect(packet.rightsBoundary.webSearchPermitted).toBe(false)
      expect(JSON.stringify(packet)).not.toContain('https://www.aqa.org.uk')
      for (const topic of packet.topics) {
        for (const requirement of topic.requirements) {
          expect((requirement.learnPage as { id?: string }).id).toBeTruthy()
          expect((requirement.flashcard as { id?: string }).id).toBeTruthy()
          expect((requirement.objectivePractice as { id?: string }).id).toBeTruthy()
          expect(packet.reviewScopeIds).toContain(requirement.requirementId)
        }
      }
    }
  })

  test('keeps launch assurance separate from FI-007 Marking Pack assurance', () => {
    const raw = JSON.stringify(packets)
    expect(raw).not.toContain('markingPack')
    expect(raw).not.toContain('satisfiedCriteria')
    expect(raw).not.toContain('expectedMark')
  })

  test('reviews all three exact production mocks against structured Exam Truth', () => {
    expect(packets.assessment.map((packet) => packet.paperId)).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(packets.summary.assessmentQuestionCount).toBeGreaterThan(0)
    for (const packet of packets.assessment) {
      expect(packet.rightsBoundary.webSearchPermitted).toBe(false)
      expect(packet.rightsBoundary.officialAqaSourceTextIncluded).toBe(false)
      expect((packet.structuredExamTruth.paper as { rawMarks: number }).rawMarks).toBe(96)
      expect((packet.structuredExamTruth.paper as { durationMinutes: number }).durationMinutes).toBe(120)
      expect((packet.productionMock as { totalMarks: number }).totalMarks).toBe(96)
      expect((packet.productionMock as { durationMinutes: number }).durationMinutes).toBe(120)
    }
  })

  test('keeps every packet bounded and the provider spend ceiling hard-capped', () => {
    expect(packets.summary.maximumPacketCharacters).toBeGreaterThan(0)
    expect(packets.summary.maximumPacketCharacters).toBeLessThanOrEqual(500_000)
    expect(validateLaunchAssuranceMaxSpend(5)).toBe(5)
    expect(validateLaunchAssuranceMaxSpend(0.5)).toBe(0.5)
    expect(() => validateLaunchAssuranceMaxSpend(5.01)).toThrow(/<= US\$5/)
    expect(estimateLaunchAttemptReserveUsd(packets.educational[0])).toBeGreaterThan(0)
  })

  test('retains deterministic scope and reaches pass only when every packet passes', async () => {
    const provider = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body ?? '{}')) as { input?: string }
      const packet = JSON.parse(request.input ?? '{}') as { packetId: string }
      return new Response(JSON.stringify({
        status: 'completed',
        usage: { input_tokens: 0, output_tokens: 0, input_tokens_details: { cached_tokens: 0 } },
        output: [{
          type: 'message',
          content: [{
            type: 'output_text',
            text: JSON.stringify({
              packetId: packet.packetId,
              decision: 'pass',
              dimensions: [{ dimension: 'independent_challenge', status: 'pass', summary: 'No blocking or material issue found.' }],
              findings: [],
              knownLimitations: [],
              summary: 'Production launch packet passed bounded independent challenge.',
            }),
          }],
        }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', provider)

    const receipt = await runPsychologyLaunchAssurance({
      courseTruthDir: COURSE_TRUTH_DIR,
      examTruthPath: EXAM_TRUTH_PATH,
      reviewedMainSha: 'a'.repeat(40),
      maxSpendUsd: 5,
      model: 'test-review-model',
      apiKey: 'test-key',
    })

    expect(receipt.finalDecision).toBe('pass')
    expect(provider).toHaveBeenCalledTimes(10)

    const retained = JSON.parse(readFileSync(`${OUTPUT_DIR}/LAUNCH-EDU-01.review.json`, 'utf8')) as {
      reviewedContentIds: string[]
      scopeBinding: string
    }
    expect(retained.reviewedContentIds).toEqual(packets.educational[0].reviewScopeIds)
    expect(retained.scopeBinding).toBe('deterministic_packet_review_scope')
  })

  test('retains fail-hold evidence before throwing on material findings', async () => {
    const provider = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body ?? '{}')) as { input?: string }
      const packet = JSON.parse(request.input ?? '{}') as { packetId: string; reviewScopeIds: string[] }
      const affectedId = packet.reviewScopeIds[0]
      return new Response(JSON.stringify({
        status: 'completed',
        usage: { input_tokens: 0, output_tokens: 0, input_tokens_details: { cached_tokens: 0 } },
        output: [{
          type: 'message',
          content: [{
            type: 'output_text',
            text: JSON.stringify({
              packetId: packet.packetId,
              decision: 'fail_hold',
              dimensions: [{ dimension: 'independent_challenge', status: 'material_issue', summary: 'Material issue found.' }],
              findings: [{
                id: `${packet.packetId}-M1`,
                severity: 'material',
                issueType: 'test_material_issue',
                affectedContentIds: [affectedId],
                evidence: 'A material learner-facing defect is present in the test fixture.',
                recommendedCorrection: 'Correct the affected production content.',
                affectedArtifact: affectedId,
                resolutionStatus: 'open',
              }],
              knownLimitations: [],
              summary: 'Packet held by the independent challenge.',
            }),
          }],
        }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })
    vi.stubGlobal('fetch', provider)

    await expect(runPsychologyLaunchAssurance({
      courseTruthDir: COURSE_TRUTH_DIR,
      examTruthPath: EXAM_TRUTH_PATH,
      reviewedMainSha: 'b'.repeat(40),
      maxSpendUsd: 5,
      model: 'test-review-model',
      apiKey: 'test-key',
    })).rejects.toThrow(/fail-closed/)

    const receipt = JSON.parse(readFileSync(`${OUTPUT_DIR}/final-receipt.json`, 'utf8')) as {
      finalDecision: string
      packetCounts: { completed: number }
      unresolvedFindings: unknown[]
    }
    expect(receipt.finalDecision).toBe('fail_hold')
    expect(receipt.packetCounts.completed).toBe(10)
    expect(receipt.unresolvedFindings).toHaveLength(10)
    expect(readFileSync(`${OUTPUT_DIR}/LAUNCH-EDU-01.review.json`, 'utf8')).toContain('material_issue')
  })
})

test.skipIf(!live)('runs fresh Psychology production launch assurance only when explicitly enabled', async () => {
  const reviewedMainSha = process.env.REVISION_REVIEWED_MAIN_SHA ?? ''
  const model = process.env.PSYCHOLOGY_LAUNCH_ASSURANCE_MODEL ?? 'gpt-5.6-terra'
  const maxSpendUsd = Number(process.env.PSYCHOLOGY_LAUNCH_ASSURANCE_MAX_SPEND_USD ?? '5')
  const apiKey = process.env.OPENAI_API_KEY ?? ''

  const receipt = await runPsychologyLaunchAssurance({
    courseTruthDir: COURSE_TRUTH_DIR,
    examTruthPath: EXAM_TRUTH_PATH,
    reviewedMainSha,
    maxSpendUsd,
    model,
    apiKey,
  })

  expect(receipt.finalDecision).toBe('pass')
  expect(receipt.reviewedMainSha).toBe(reviewedMainSha)
}, LIVE_TIMEOUT_MS)
