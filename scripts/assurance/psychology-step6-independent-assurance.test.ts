import { readFileSync, rmSync } from 'node:fs'

import { describe, expect, test, vi } from 'vitest'

import { derivePsychologyMarkingPacks } from '../content/derive-psychology-marking-packs'
import {
  buildPsychologyStep6Packets,
  runPsychologyStep6IndependentAssurance,
  validateStep6MaxSpend,
} from './psychology-step6-independent-assurance'

const COURSE_TRUTH_DIR = 'research/source-first-course-prototype/psychology-course-truth'
const EXAM_TRUTH_PATH = 'research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'
const LIVE_ASSURANCE_TEST_TIMEOUT_MS = 40 * 60 * 1_000

const unique = <T>(values: T[]): T[] => [...new Set(values)]
const sorted = (values: string[]): string[] => [...values].sort()

describe('Psychology Step 6 independent assurance packets', () => {
  const packets = buildPsychologyStep6Packets(COURSE_TRUTH_DIR, EXAM_TRUTH_PATH)
  const marking = derivePsychologyMarkingPacks(COURSE_TRUTH_DIR, EXAM_TRUTH_PATH)

  test('covers all 17 topics and 118 requirements exactly once in bounded educational review', () => {
    expect(packets.summary.educationalPacketCount).toBe(13)
    expect(packets.summary.topicCount).toBe(17)
    expect(packets.summary.requirementCount).toBe(118)
    expect(packets.summary.educationalRequirementCoverageCount).toBe(118)

    const topicNumbers = unique(packets.educational.flatMap((packet) => packet.topicNumbers))
    expect(topicNumbers).toEqual(Array.from({ length: 17 }, (_, index) => index + 1))

    const researchMethodsPackets = packets.educational.filter((packet) => packet.topicNumbers.length === 1 && packet.topicNumbers[0] === 7)
    expect(researchMethodsPackets.map((packet) => packet.packetId)).toEqual(['EDU-04A', 'EDU-04B', 'EDU-04C', 'EDU-04D'])
    expect(researchMethodsPackets.flatMap((packet) => packet.requirementIds)).toHaveLength(34)

    const topicsTwelveThirteen = packets.educational.filter((packet) => packet.topicNumbers.some((topic) => topic === 12 || topic === 13))
    expect(topicsTwelveThirteen.map((packet) => packet.packetId)).toEqual(['EDU-07A', 'EDU-07B'])
    expect(topicsTwelveThirteen.map((packet) => packet.topicNumbers)).toEqual([[12], [13]])

    const requirementIds = packets.educational.flatMap((packet) => packet.requirementIds)
    expect(requirementIds).toHaveLength(118)
    expect(unique(requirementIds)).toHaveLength(118)
  })

  test('sends only reusable subject evidence to the educational reviewer', () => {
    for (const packet of packets.educational) {
      expect(packet.rightsBoundary.officialAqaSourceTextIncluded).toBe(false)
      expect(packet.permittedSourceDomains.length).toBeGreaterThan(0)
      const raw = JSON.stringify(packet)
      expect(raw).not.toContain('https://www.aqa.org.uk')
      for (const requirement of packet.requirements) {
        expect(requirement.boardAlignment.classification).toBe('REFERENCE_ONLY')
        expect(requirement.reusableSourceEvidence.length).toBeGreaterThan(0)
        for (const source of requirement.reusableSourceEvidence) {
          expect(['OPEN', 'LICENSED', 'REVISION_OWNED']).toContain(source.classification)
        }
      }
    }
  })

  test('challenges every scoreable Practice Marking Pack alongside its teaching context', () => {
    const expectedPracticePackIds = marking.practice.markingPacks.map((pack) => pack.id)
    const packetPracticePackIds = packets.educational.flatMap((packet) => packet.requirements.flatMap((requirement) =>
      requirement.practiceMarkingPacks.map((pack) => (pack as { id: string }).id),
    ))
    expect(sorted(unique(packetPracticePackIds))).toEqual(sorted(expectedPracticePackIds))
  })

  test('binds educational review scope to requirements and exact learner assets', () => {
    for (const packet of packets.educational) {
      const expectedScope = unique(packet.requirements.flatMap((requirement) => [
        requirement.requirementId,
        (requirement.learn as { id: string }).id,
        ...requirement.practice.map((activity) => (activity as { id: string }).id),
        ...requirement.practiceMarkingPacks.map((pack) => (pack as { id: string }).id),
      ]))
      expect(sorted(packet.reviewScopeIds)).toEqual(sorted(expectedScope))
      expect(packet.requirementIds.every((id) => packet.reviewScopeIds.includes(id))).toBe(true)
    }
  })

  test('covers all topic and full-paper scored assessment items by paper', () => {
    expect(packets.summary.assessmentPacketCount).toBe(3)
    expect(packets.assessment.map((packet) => packet.paperId)).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(packets.summary.assessmentContentCoverageCount).toBeGreaterThan(0)

    const expectedTopicPackIds = marking.examPrep.topicMarkingPacks.map((pack) => pack.itemId)
    const expectedPaperPackIds = marking.examPrep.fullPaperQuestionMarkingPacks.map((pack) => pack.itemId)
    const actualIds = packets.assessment.flatMap((packet) => packet.reviewedContentIds)
    expect(sorted(unique(actualIds))).toEqual(sorted(unique([...expectedTopicPackIds, ...expectedPaperPackIds])))
  })

  test('binds assessment review scope to questions, paper structures and Marking Packs', () => {
    for (const packet of packets.assessment) {
      expect(packet.reviewedContentIds.every((id) => packet.reviewScopeIds.includes(id))).toBe(true)
      for (const pack of packet.topicMarkingPacks) {
        expect(packet.reviewScopeIds).toContain((pack as { id: string }).id)
      }
      for (const pack of packet.fullPaperQuestionMarkingPacks) {
        expect(packet.reviewScopeIds).toContain((pack as { id: string }).id)
      }
      expect(packet.reviewScopeIds).toContain((packet.scoredPaperSimulation as { baseSimulationId: string }).baseSimulationId)
    }
  })

  test('keeps assessment review on structured Exam Truth without AQA source text or web search', () => {
    for (const packet of packets.assessment) {
      expect(packet.rightsBoundary.officialAqaSourceTextIncluded).toBe(false)
      expect(packet.rightsBoundary.webSearchPermitted).toBe(false)
      expect(packet.rightsBoundary.examTruthUse).toBe('structured_assessment_facts_only')
      expect(JSON.stringify(packet)).not.toContain('https://www.aqa.org.uk')
      expect((packet.structuredExamTruth.paper as { rawMarks: number }).rawMarks).toBe(96)
      expect((packet.structuredExamTruth.paper as { durationMinutes: number }).durationMinutes).toBe(120)
    }
  })

  test('keeps review packets bounded rather than replaying an unbounded whole-course dump', () => {
    expect(packets.summary.maximumPacketCharacters).toBeGreaterThan(0)
    expect(packets.summary.maximumPacketCharacters).toBeLessThanOrEqual(750_000)
  })

  test('enforces the experimental US$5 provider-spend ceiling', () => {
    expect(validateStep6MaxSpend(5)).toBe(5)
    expect(validateStep6MaxSpend(0.5)).toBe(0.5)
    expect(() => validateStep6MaxSpend(5.01)).toThrow(/<= US\$5/)
    expect(() => validateStep6MaxSpend(0)).toThrow(/> 0/)
    expect(() => validateStep6MaxSpend(Number.NaN)).toThrow()
  })

  test('retains provider attempts and observed spend when output exhaustion prevents packet completion', async () => {
    const outputDir = '.artifacts/psychology-step6-independent-assurance'
    rmSync(outputDir, { recursive: true, force: true })
    const provider = vi.fn(async () => new Response(JSON.stringify({
      status: 'incomplete',
      incomplete_details: { reason: 'max_output_tokens' },
      usage: {
        input_tokens: 1_000,
        output_tokens: 16_000,
        input_tokens_details: { cached_tokens: 0 },
      },
      output: [{ type: 'web_search_call' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', provider)

    try {
      await expect(runPsychologyStep6IndependentAssurance({
        courseTruthDir: COURSE_TRUTH_DIR,
        examTruthPath: EXAM_TRUTH_PATH,
        reviewedMainSha: 'a'.repeat(40),
        maxSpendUsd: 5,
        model: 'test-review-model',
        apiKey: 'test-key',
      })).rejects.toThrow(/max_output_tokens/)

      const receipt = JSON.parse(readFileSync(`${outputDir}/final-receipt.json`, 'utf8')) as {
        completionStatus: string
        finalDecision: string
        packetCounts: { completed: number }
        economics: { observedSpendUsd: number; providerAttempts: number; webSearchCalls: number }
      }
      expect(provider).toHaveBeenCalledTimes(2)
      expect(receipt.completionStatus).toBe('incomplete')
      expect(receipt.finalDecision).toBe('fail_hold')
      expect(receipt.packetCounts.completed).toBe(0)
      expect(receipt.economics.providerAttempts).toBe(2)
      expect(receipt.economics.webSearchCalls).toBe(2)
      expect(receipt.economics.observedSpendUsd).toBeGreaterThan(0)
    } finally {
      vi.unstubAllGlobals()
      rmSync(outputDir, { recursive: true, force: true })
    }
  })

  test('persists deterministic review scope without requiring the provider to echo a clerical ID list', async () => {
    const outputDir = '.artifacts/psychology-step6-independent-assurance'
    rmSync(outputDir, { recursive: true, force: true })
    const provider = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body ?? '{}')) as { input?: string }
      const packet = JSON.parse(request.input ?? '{}') as { packetId: string }
      return new Response(JSON.stringify({
        status: 'completed',
        usage: {
          input_tokens: 0,
          output_tokens: 0,
          input_tokens_details: { cached_tokens: 0 },
        },
        output: [{
          type: 'message',
          content: [{
            type: 'output_text',
            text: JSON.stringify({
              packetId: packet.packetId,
              decision: 'pass',
              dimensions: [{ dimension: 'independent_challenge', status: 'pass', summary: 'No material issue found in the bounded packet.' }],
              findings: [],
              knownLimitations: [],
              summary: 'Bounded independent review completed.',
            }),
          }],
        }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', provider)

    try {
      const receipt = await runPsychologyStep6IndependentAssurance({
        courseTruthDir: COURSE_TRUTH_DIR,
        examTruthPath: EXAM_TRUTH_PATH,
        reviewedMainSha: 'b'.repeat(40),
        maxSpendUsd: 5,
        model: 'test-review-model',
        apiKey: 'test-key',
      })
      const retained = JSON.parse(readFileSync(`${outputDir}/EDU-01.review.json`, 'utf8')) as {
        reviewedContentIds: string[]
        scopeBinding: string
      }
      expect(receipt.finalDecision).toBe('pass')
      expect(provider).toHaveBeenCalledTimes(16)
      expect(sorted(retained.reviewedContentIds)).toEqual(sorted(packets.educational[0].reviewScopeIds))
      expect(retained.scopeBinding).toBe('deterministic_packet_review_scope')
    } finally {
      vi.unstubAllGlobals()
      rmSync(outputDir, { recursive: true, force: true })
    }
  })
})

const live = process.env.PSYCHOLOGY_STEP6_LIVE === '1'

test.skipIf(!live)('runs fresh Psychology Step 6 independent assurance only when explicitly enabled', async () => {
  const reviewedMainSha = process.env.REVISION_REVIEWED_MAIN_SHA ?? ''
  const model = process.env.PSYCHOLOGY_STEP6_MODEL ?? 'gpt-5.6-terra'
  const maxSpendUsd = Number(process.env.PSYCHOLOGY_STEP6_MAX_SPEND_USD ?? '5')
  const apiKey = process.env.OPENAI_API_KEY ?? ''

  const receipt = await runPsychologyStep6IndependentAssurance({
    courseTruthDir: COURSE_TRUTH_DIR,
    examTruthPath: EXAM_TRUTH_PATH,
    reviewedMainSha,
    maxSpendUsd,
    model,
    apiKey,
  })

  expect(receipt.finalDecision).toBe('pass')
  expect(receipt.reviewedMainSha).toBe(reviewedMainSha)
}, LIVE_ASSURANCE_TEST_TIMEOUT_MS)
