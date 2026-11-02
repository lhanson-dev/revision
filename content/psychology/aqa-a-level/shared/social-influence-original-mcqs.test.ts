import { describe, expect, it } from 'vitest'
import { coursePackQuestionToPractice } from '../../../../src/app/practice-questions'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'

const original = [
  { id: 'psy-psy0101-check', label: 'Conformity', correctOption: 1 },
  { id: 'psy-psy0102-check', label: 'Obedience', correctOption: 3 },
  { id: 'psy-psy0103-check', label: 'Locus of control', correctOption: 0 },
  { id: 'psy-psy0104-check', label: 'Minority influence', correctOption: 2 },
] as const

describe('LF-03 original Psychology Social Influence concept-check validity', () => {
  it('preserves four original question IDs and correct concepts while removing repeated option sets and answer positions in every live pack', () => {
    for (const pack of [paper1, paper2, paper3]) {
      const questions = original.map(({ id, label, correctOption }) => {
        const question = pack.questions.find((candidate) => candidate.id === id)
        expect(question, id).toBeDefined()
        if (!question) throw new Error(`Original Social Influence question not published: ${id}`)
        expect(question.topic).toBe('social-influence')
        expect(question.prompt).toMatch(/^Which concept or approach completes this definition\? _____ /)
        expect(question.options).toHaveLength(4)
        expect(new Set(question.options).size).toBe(4)
        expect(question.correctOption).toBe(correctOption)
        expect(question.options[question.correctOption]).toBe(label)

        const practice = coursePackQuestionToPractice(question)
        expect(practice.id).toBe(id)
        expect(practice.correctOption).toBe(correctOption)
        expect(practice.source).toBe('course-pack')
        expect(practice.specItemIds).toEqual([])
        expect(practice.nodeIds).toEqual([])
        expect(practice.marks).toBe(1)
        return question
      })

      // The learner's original four questions must not recycle one four-concept
      // option menu or an easily guessed identical answer-letter pattern.
      const optionMenus = questions.map((question) => [...question.options].sort().join('|'))
      expect(new Set(optionMenus).size).toBe(4)
      expect(new Set(questions.flatMap((question) => question.options)).size).toBe(16)
      expect(questions.map((question) => question.correctOption)).toEqual([1, 3, 0, 2])
      expect(pack.questions.filter((question) => question.id.startsWith('psy-psy01') && question.id.endsWith('-check'))).toHaveLength(4)
    }
  })
})
