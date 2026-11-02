import { describe, expect, it } from 'vitest'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { supportsLearningInference } from '../engine/evidence/evidence'
import { assessReadiness, recentActivity, unresolvedConfidentMisses, recommendNextActivity } from '../engine/readiness/readiness'
import { assessTopicKnowledge } from '../engine/knowledge/topic-knowledge'

const moduleId = 'psychology-aqa-a-level-7182-paper-1'
const topicId = 'social-influence'
function answer(id: string, contentId: string, selectedOption: number, correctOption: number, module = moduleId) {
  return createMultipleChoiceEvidence({
    id, moduleId: module, topicId, contentId,
    selectedOption, correctOption, confidence: 'certain',
    occurredAt: '2026-11-01T12:00:00.000Z',
  })
}

describe('LF-03 recorded answers versus trustworthy learning inference', () => {
  const oldRight = answer('historical-original', 'psy-psy0101-check', 3, 3)
  const oldWrong = answer('historical-missed', 'psy-psy0102-check', 0, 3)
  const newRight = answer('verified-v2', 'psy-psy0101-check-v2', 1, 1)

  it('preserves the exact historical scored evidence and recent activity, without silently rekeying', () => {
    expect(oldRight).toMatchObject({ correct: true, selectedOption: 3, correctOption: 3, contentId: 'psy-psy0101-check' })
    const activity = recentActivity([oldRight, oldWrong, newRight])
    expect(activity.map(item => item.evidenceId)).toContain('historical-original')
    expect(activity.find(item => item.evidenceId === 'historical-original')?.percentage).toBe(100)
    expect(supportsLearningInference(oldRight)).toBe(false)
    expect(supportsLearningInference(newRight)).toBe(true)
    expect(supportsLearningInference(answer('unrelated-business', 'psy-psy0101-check', 3, 3, 'business-aqa-a-level-7132-paper-1'))).toBe(true)
  })

  it('does not let invalid source MCQs inflate knowledge scores, readiness or future planning', () => {
    const original = [oldRight, oldWrong, newRight]
    expect(assessReadiness(original).evidenceCount).toBe(1)
    expect(assessTopicKnowledge(moduleId, topicId, original).distinctContentItems).toBe(1)
    expect(unresolvedConfidentMisses(original)).toEqual([])
    const recommended = recommendNextActivity(moduleId, [topicId], original)
    expect(recommended?.evidenceCount).toBe(1)
    expect(recommended?.readinessScore).toBeNull()
  })
})

describe('LF-03 #787 previously guessable Memory MCQs cannot raise readiness', () => {
  const memoryModule = 'psychology-aqa-a-level-7182-paper-1'
  const original = createMultipleChoiceEvidence({
    id: 'historical-memory', moduleId: memoryModule, topicId: 'memory',
    contentId: 'psy-psy0201-check', selectedOption: 0, correctOption: 0,
    confidence: 'certain', occurredAt: '2026-11-01T12:00:00.000Z',
  })
  const revised = createMultipleChoiceEvidence({
    id: 'new-memory', moduleId: memoryModule, topicId: 'memory',
    contentId: 'psy-psy0201-check-v2', selectedOption: 2, correctOption: 2,
    confidence: 'certain', occurredAt: '2026-11-02T12:00:00.000Z',
  })

  it('keeps historical answers and original marks in the activity record without counting them as knowledge', () => {
    expect(original).toMatchObject({ correct: true, selectedOption: 0, correctOption: 0 })
    expect(recentActivity([original, revised]).map(item => item.evidenceId)).toContain('historical-memory')
    expect(supportsLearningInference(original)).toBe(false)
    expect(supportsLearningInference(revised)).toBe(true)
    const items = [original, revised]
    expect(assessTopicKnowledge(memoryModule, 'memory', items).distinctContentItems).toBe(1)
    expect(assessReadiness(items).evidenceCount).toBe(1)
    expect(recommendNextActivity(memoryModule, ['memory'], items)?.evidenceCount).toBe(1)
  })

  it('retired ids are strictly limited to original Psychology V1 MCQs, not other courses or evidence families', () => {
    for (let i = 1; i <= 4; i++) {
      const old = createMultipleChoiceEvidence({
        id: 'memory-' + i, moduleId: memoryModule, topicId: 'memory',
        contentId: 'psy-psy020' + i + '-check', selectedOption: 0, correctOption: 0,
      })
      expect(supportsLearningInference(old)).toBe(false)
    }
    const otherCourse = createMultipleChoiceEvidence({
      id: 'business-historical', moduleId: 'business-aqa-a-level-7132-paper-1',
      topicId: 'memory', contentId: 'psy-psy0201-check', selectedOption: 0, correctOption: 0,
    })
    expect(supportsLearningInference(otherCourse)).toBe(true)
  })
})
