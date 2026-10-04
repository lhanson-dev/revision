import { describe, expect, it } from 'vitest'
import { learn } from './learn'
import { fastPathFlashcards } from './fast-path-flashcards'
import { aqaBusinessQuestionBank } from './fast-path-questions'

describe('AQA Business 7132 Fast-Path learner release', () => {
  it('publishes every exact-course Fast-Path teaching asset through Learn', () => {
    const pages = learn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
    expect(pages).toHaveLength(79)
    expect(new Set(pages.map((page) => page.id)).size).toBe(79)
    expect(pages.every((page) => page.blocks.length > 0)).toBe(true)
  })

  it('publishes the Foundation-native guided-practice set without duplicate ids', () => {
    expect(fastPathFlashcards.length).toBeGreaterThan(600)
    expect(new Set(fastPathFlashcards.map((card) => card.id)).size).toBe(fastPathFlashcards.length)
  })

  it('publishes the complete accepted AQA-style question bank', () => {
    expect(aqaBusinessQuestionBank).toHaveLength(245)
    expect(new Set(aqaBusinessQuestionBank.map((item) => `${item.batch}:${item.id}`)).size).toBe(245)
    expect(aqaBusinessQuestionBank.every((item) => item.label.includes('Revision-authored'))).toBe(true)
    expect(aqaBusinessQuestionBank.every((item) => item.question.marks > 0)).toBe(true)
  })
})
