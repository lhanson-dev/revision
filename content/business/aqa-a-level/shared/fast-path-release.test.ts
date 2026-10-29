import { describe, expect, it } from 'vitest'
import { learn } from './learn'
import { fastPathFlashcards } from './fast-path-flashcards'
import { aqaBusinessQuestionBank } from './fast-path-questions'

describe('AQA Business 7132 Fast-Path learner release', () => {
  it('publishes every exact-course Fast-Path teaching asset through Learn', () => {
    const pages = learn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
    const fastPathPages = pages.filter((page) => page.id.startsWith('bus-'))
    expect(fastPathPages).toHaveLength(79)
    expect(new Set(fastPathPages.map((page) => page.id)).size).toBe(79)
    expect(fastPathPages.every((page) => page.blocks.length > 0)).toBe(true)
    expect(pages.some((page) => page.id === 'limited-companies-and-shareholders')).toBe(true)
    expect(pages.some((page) => page.id === 'understanding-break-even')).toBe(true)
  })

  it('publishes the Foundation-native guided-practice set without duplicate ids', () => {
    expect(fastPathFlashcards.length).toBeGreaterThan(600)
    expect(new Set(fastPathFlashcards.map((card) => card.id)).size).toBe(fastPathFlashcards.length)
  })

  it('preserves all 261 previously published questions and adds four distinct original #698 retest opportunities', () => {
    // The approved release baseline remains 245 retained records plus sixteen
    // original #698 scored checks. New source-backed independent questions are
    // additive; do not hide an accidental removal behind an updated total.
    const retained = aqaBusinessQuestionBank.filter((item) => item.namespace !== 'rev7132-recheck')
    const added = aqaBusinessQuestionBank.filter((item) => item.namespace === 'rev7132-recheck')
    expect(retained).toHaveLength(261)
    expect(added).toHaveLength(4)
    expect(aqaBusinessQuestionBank).toHaveLength(265)
    expect(new Set(aqaBusinessQuestionBank.map((item) =>
      `${item.namespace ?? 'aqa7132'}:${item.batch}:${item.id}`)).size).toBe(265)
    expect(aqaBusinessQuestionBank.every((item) => item.label.includes('Revision-authored'))).toBe(true)
    expect(aqaBusinessQuestionBank.every((item) => item.question.marks > 0)).toBe(true)
  })
})
