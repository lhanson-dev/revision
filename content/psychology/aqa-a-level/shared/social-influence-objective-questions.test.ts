import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { psychologyQuestions } from './course'
import { socialInfluenceObjectiveQuestions } from './social-influence-objective-questions'
import { coursePackQuestionToPractice } from '../../../../src/app/practice-questions'

const sectionIds = ['PSY-01-01', 'PSY-01-02', 'PSY-01-03', 'PSY-01-04'] as const
const packs = [paper1, paper2, paper3]

describe('LF-03 — Psychology Social Influence question integrity', () => {
  it('publishes four distinct source-relevant cases with an independently valid key', () => {
    const actual = psychologyQuestions.filter((q) => q.topic === 'social-influence')
    expect(actual).toHaveLength(4)
    expect(Object.keys(socialInfluenceObjectiveQuestions).sort()).toEqual([...sectionIds].sort())

    const seenAnswers = new Set<string>()
    const seenOptions = new Set<string>()
    for (const [index, sectionId] of sectionIds.entries()) {
      const q = actual[index]
      const authored = socialInfluenceObjectiveQuestions[sectionId]
      const base = sectionId.toLowerCase().replaceAll('-', '')
      expect(q.id).toBe(`psy-${base}-check-v2`)
      expect(q.prompt).toBe(authored.prompt)
      expect(q.prompt).not.toContain('_____')
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options.map(o => o.toLowerCase().trim())).size).toBe(4)
      expect(q.correctOption).toBe(authored.correctOption)
      expect(q.options[q.correctOption]).toBe(authored.options[authored.correctOption])
      expect(q.explanation).toBe(authored.explanation)
      expect(q.explanation.length).toBeGreaterThan(70)
      expect(seenAnswers.has(q.options[q.correctOption])).toBe(false)
      seenAnswers.add(q.options[q.correctOption])
      for (const option of q.options) {
        expect(seenOptions.has(option)).toBe(false)
        seenOptions.add(option)
      }
    }
    // Deliberate correct-answer distribution, not a shared position repeated four times.
    expect(actual.map(q => q.correctOption)).toEqual([1, 3, 0, 2])
  })

  it('replaces only the affected item identities across the three canonical Psychology packs', () => {
    const ids = psychologyQuestions.filter(q => q.topic === 'social-influence').map(q => q.id)
    for (const pack of packs) {
      const actual = pack.questions.filter(q => q.topic === 'social-influence')
      expect(actual.map(q => q.id)).toEqual(ids)
      expect(actual.map(q => q.correctOption)).toEqual([1, 3, 0, 2])
      expect(pack.questions).toHaveLength(psychologyQuestions.length + pack.questions.filter(q => q.id.startsWith('psy-rm-') || q.id.startsWith('psy-inference-')).length)
      expect(pack.questions.some(q => /^psy-psy010[1-4]-check$/.test(q.id))).toBe(false)
    }
  })

  it('retains the course-pack Practice contract while keeping legacy evidence addresses distinct', () => {
    for (const q of psychologyQuestions.filter(q => q.topic === 'social-influence')) {
      const projection = coursePackQuestionToPractice(q)
      expect(projection.id).toBe(q.id)
      expect(projection.correctOption).toBe(q.correctOption)
      expect(projection.options.map(o => o.text)).toEqual(q.options)
      expect(projection.source).toBe('course-pack')
      expect(projection.specItemIds).toEqual([])
      expect(projection.nodeIds).toEqual([])
      // The previous four question IDs are not reused with changed marks or answers.
      expect(projection.id).not.toMatch(/^psy-psy010[1-4]-check$/)
    }
  })
})
