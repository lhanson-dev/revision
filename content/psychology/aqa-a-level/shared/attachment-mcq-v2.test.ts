import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { reviewMcqQuality } from '../../../../scripts/assurance/lf03-mcq-quality'
import { buildQuestionPool } from '../../../../src/app/practice-questions'
import { createMultipleChoiceEvidence } from '../../../../src/app/practice-evidence'
import { psychologyLegacyAttachmentQuestions } from './course'

const packs = [paper1, paper2, paper3]
const legacyIds = [1, 2, 3, 4, 5].map(i => `psy-psy030${i}-check`)
const publishedIds = [...legacyIds.slice(0, 3), legacyIds[3] + '-v2', legacyIds[4] + '-v2']

describe('LF-03 #787 AQA 7182 §4.1.3 Attachment source-first two-item repair', () => {
  it('keeps five original source-bullet positions, changes only the two repetitive items in all shared Course Practice packs', () => {
    for (const pack of packs) {
      const topic = pack.questions.filter(q => q.topic === 'attachment')
      expect(topic.map(q => q.id)).toEqual(publishedIds)
      expect(topic[3]?.correctOption).toBe(2)
      expect(topic[4]?.correctOption).toBe(0)
      expect(topic[3]?.prompt).toContain('responsive care')
      expect(topic[4]?.prompt).toContain('supportive friendship')
      expect(topic.slice(3).every(q => q.explanation.length > 160 && q.options.length === 4)).toBe(true)
      expect(topic.slice(3).every(q => !q.prompt.startsWith('Which concept or approach'))).toBe(true)
      expect(reviewMcqQuality(topic).filter(f =>
        f.disposition === 'block' || ['repeated-option-set', 'generic-feedback'].includes(f.rule)
      )).toEqual([])
    }
  })

  it('preserves exact unchanged historical 5-item pool and all previous keyed indexes', () => {
    expect(psychologyLegacyAttachmentQuestions.map(q => q.id)).toEqual(legacyIds)
    const before = psychologyLegacyAttachmentQuestions.slice(3)
    expect(new Set(before.map(q => [...q.options].sort().join('|'))).size).toBe(1)
    expect(before.map(q => q.id)).toEqual(legacyIds.slice(3))
    expect(new Set([...legacyIds, ...publishedIds.slice(3)]).size).toBe(7)
  })

  it('uses current canonical Practice pool and item-specific software-selected evidence, not claims of written AO3', () => {
    const pool = buildQuestionPool({
      topicId: 'attachment', topicOrder: 3,
      coursePack: paper1.questions.filter(q => q.topic === 'attachment'),
      bank: paper1.practiceBank,
    })
    expect(pool.map(q => q.id)).toEqual(publishedIds)
    for (const [id, key] of [[publishedIds[3], 2], [publishedIds[4], 0]] as const) {
      const q = pool.find(x => x.id === id)
      if (!q || q.type !== 'multiple-choice') throw new Error('Missing revised Attachment MCQ')
      expect(q.correctOption).toBe(key)
      const right = createMultipleChoiceEvidence({
        id: 'right-' + id, moduleId: paper1.manifest.id, topicId: 'attachment',
        contentId: id, selectedOption: key, correctOption: key, confidence: 'certain',
      })
      const wrong = createMultipleChoiceEvidence({
        id: 'wrong-' + id, moduleId: paper1.manifest.id, topicId: 'attachment',
        contentId: id, selectedOption: (key + 1) % 4, correctOption: key, confidence: 'certain',
      })
      expect(right.correct).toBe(true)
      expect(wrong.correct).toBe(false)
    }
  })
})
