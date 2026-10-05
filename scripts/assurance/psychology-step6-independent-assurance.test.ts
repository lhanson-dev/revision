import { describe, expect, test } from 'vitest'

import { derivePsychologyMarkingPacks } from '../content/derive-psychology-marking-packs'
import {
  buildPsychologyStep6Packets,
  runPsychologyStep6IndependentAssurance,
  validateStep6MaxSpend,
} from './psychology-step6-independent-assurance'

const COURSE_TRUTH_DIR = 'research/source-first-course-prototype/psychology-course-truth'
const EXAM_TRUTH_PATH = 'research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'

const unique = <T>(values: T[]): T[] => [...new Set(values)]
const sorted = (values: string[]): string[] => [...values].sort()

describe('Psychology Step 6 independent assurance packets', () => {
  const packets = buildPsychologyStep6Packets(COURSE_TRUTH_DIR, EXAM_TRUTH_PATH)
  const marking = derivePsychologyMarkingPacks(COURSE_TRUTH_DIR, EXAM_TRUTH_PATH)

  test('covers all 17 topics and 118 requirements exactly once in bounded educational review', () => {
    expect(packets.summary.educationalPacketCount).toBe(12)
    expect(packets.summary.topicCount).toBe(17)
    expect(packets.summary.requirementCount).toBe(118)
    expect(packets.summary.educationalRequirementCoverageCount).toBe(118)

    const topicNumbers = unique(packets.educational.flatMap((packet) => packet.topicNumbers))
    expect(topicNumbers).toEqual(Array.from({ length: 17 }, (_, index) => index + 1))

    const researchMethodsPackets = packets.educational.filter((packet) => packet.topicNumbers.length === 1 && packet.topicNumbers[0] === 7)
    expect(researchMethodsPackets.map((packet) => packet.packetId)).toEqual(['EDU-04A', 'EDU-04B', 'EDU-04C', 'EDU-04D'])
    expect(researchMethodsPackets.flatMap((packet) => packet.requirementIds)).toHaveLength(34)

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

  test('covers all topic and full-paper scored assessment items by paper', () => {
    expect(packets.summary.assessmentPacketCount).toBe(3)
    expect(packets.assessment.map((packet) => packet.paperId)).toEqual(['7182/1', '7182/2', '7182/3'])
    expect(packets.summary.assessmentContentCoverageCount).toBeGreaterThan(0)

    const expectedTopicPackIds = marking.examPrep.topicMarkingPacks.map((pack) => pack.itemId)
    const expectedPaperPackIds = marking.examPrep.fullPaperQuestionMarkingPacks.map((pack) => pack.itemId)
    const actualIds = packets.assessment.flatMap((packet) => packet.reviewedContentIds)
    expect(sorted(unique(actualIds))).toEqual(sorted(unique([...expectedTopicPackIds, ...expectedPaperPackIds])))
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
})
