import { describe, expect, it } from 'vitest'
import type { PracticeQuestion } from './practice-questions'
import { advanceQuestionSession, recordSessionAnswer, startQuestionSession, type QuestionSession } from './practice-session'
import { MAX_SKILL_TILES, summariseSession, type SummaryInput } from './practice-summary'

const mc = (id: string, over: Partial<Extract<PracticeQuestion, { type: 'multiple-choice' }>> = {}): PracticeQuestion => ({
  id, type: 'multiple-choice', level: 'Recall', topicId: 'finance', marks: 1, prompt: `Prompt ${id} about something specific here`, context: null, table: null,
  options: [{ text: 'Right', why: null }, { text: 'Tempting', why: 'it confuses revenue with profit.' }, { text: 'Other', why: 'it ignores costs.' }, { text: 'Last', why: null }],
  correctOption: 0, explanation: 'Profit is revenue minus costs.', specItemIds: [`aqa-7132-3.5.1:item-${id}`], nodeIds: [`bus-fin-00${id.length}`], source: 'aqa-bank', ...over,
})
const written = (id: string): PracticeQuestion => ({
  id, type: 'written', level: 'Apply', topicId: 'finance', marks: 2, prompt: 'Explain it', context: null, table: null, aoTags: ['AO2'],
  points: [{ marks: 1, descriptor: 'States the figure', accept: ['600'] }, { marks: 1, descriptor: 'Applies it to the café', accept: ['holidays'] }],
  specItemIds: ['aqa-7132-3.5.2:margin-of-safety'], nodeIds: ['bus-fin-009'], source: 'aqa-bank',
})

const calc = (id: string): PracticeQuestion => ({
  id, type: 'calculation', level: 'Apply', topicId: 'finance', marks: 3, prompt: 'Calculate the market size.', context: null, table: null,
  expected: 24.2, accepted: [24.2], unit: '£m', answerText: '£24.2m', workings: 'Market size = £8.4m + £6.7m + £5.9m + £3.2m\n= £24.2m',
  specItemIds: ['aqa-7132-3.5.1:market-size'], nodeIds: ['bus-fin-004'], source: 'aqa-bank',
})

const answerAs = (session: QuestionSession, partial: { correct: boolean; selected?: number; confidence?: 'guess' | 'fairly' | 'certain'; marks?: { got: number; available: number }; pointsGiven?: boolean[]; typed?: string }) =>
  recordSessionAnswer(session, { questionId: session.currentId!, correct: partial.correct, level: 'Recall', selectedOption: partial.selected ?? null, typedAnswer: partial.typed ?? null, confidence: partial.confidence ?? null, marks: partial.marks ?? null, pointsGiven: partial.pointsGiven ?? null })

const input = (session: QuestionSession, questions: PracticeQuestion[], over: Partial<SummaryInput> = {}): SummaryInput => ({
  session, questions, topicTitle: 'Finance', topicOrder: 5, startStatus: 'needswork', endStatus: 'nearly',
  skillLabel: (id) => id.split(':')[1].replace(/-/g, ' '), learnPage: () => null, nextTopic: null, ...over,
})

function run(questions: PracticeQuestion[], steps: Array<Parameters<typeof answerAs>[1]>): QuestionSession {
  let session = startQuestionSession(questions, steps.length)
  steps.forEach((step) => { session = advanceQuestionSession(answerAs(session, step), questions) })
  return session
}

describe('the headline', () => {
  const questions = [mc('a'), mc('b'), mc('c'), mc('d')]

  it('says how many were right out of how many were asked fresh', () => {
    const session = run(questions, [{ correct: true, selected: 0, confidence: 'fairly' }, { correct: false, selected: 1, confidence: 'fairly' }, { correct: true, selected: 0, confidence: 'certain' }, { correct: true, selected: 0, confidence: 'fairly' }])
    const summary = summariseSession(input(session, questions))
    expect(summary.heroLine).toBe('3 of 4 right')
    expect(summary.writtenLine).toBeNull()
  })

  it('does not count a second go in the headline', () => {
    let session = startQuestionSession(questions, 2)
    session = advanceQuestionSession(answerAs(session, { correct: false, selected: 1, confidence: 'fairly' }), questions)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'fairly' }), questions)
    // the missed one comes back at the end; answer it right
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'fairly' }), questions)
    expect(summariseSession(input(session, questions)).heroLine).toBe('1 of 2 right')
  })

  it('adds the written marks, and leads with marks when the session was only written answers', () => {
    const qs = [mc('a'), written('w')]
    let session = startQuestionSession(qs, 2)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'fairly' }), qs)
    session = advanceQuestionSession(answerAs(session, { correct: false, marks: { got: 1, available: 2 }, pointsGiven: [true, false] }), qs)
    const mixed = summariseSession(input(session, qs))
    expect(mixed.heroLine).toBe('1 of 1 right')
    expect(mixed.writtenLine).toBe('Plus 1 of 2 marks on the written answer.')

    const only = [written('w')]
    let solo = startQuestionSession(only, 1)
    solo = advanceQuestionSession(answerAs(solo, { correct: false, marks: { got: 1, available: 2 }, pointsGiven: [true, false] }), only)
    const summary = summariseSession(input(solo, only))
    expect(summary.heroLine).toBe('1 of 2 marks')
    expect(summary.writtenLine).toBeNull()
  })
})

describe('the status card line', () => {
  const questions = [mc('a')]
  const session = run(questions, [{ correct: true, selected: 0, confidence: 'fairly' }])
  const line = (start: SummaryInput['startStatus'], end: SummaryInput['endStatus']) => summariseSession(input(session, questions, { startStatus: start, endStatus: end })).status?.line

  it('says up, still or down, and what it is based on', () => {
    expect(line('needswork', 'nearly')).toBe('Up from Needs work to Nearly there. Based on this session and your earlier answers on this topic.')
    expect(line('nearly', 'nearly')).toBe('Still Nearly there. Based on this session and your earlier answers on this topic.')
    expect(line('gotit', 'nearly')).toBe('Down from Got it to Nearly there. Based on this session and your earlier answers on this topic.')
  })

  it('does not call a topic gaining its first evidence a move up', () => {
    expect(line('notstarted', 'started')).toBe('This topic now has its first evidence, so it reads Just started. Based on this session and your earlier answers on this topic.')
  })

  it('shows no status card when the status is not known', () => {
    expect(summariseSession(input(session, questions, { startStatus: undefined })).status).toBeNull()
  })
})

describe('the skills map', () => {
  it('shows this session’s result for skills it tested and "not tested" for the rest of the topic', () => {
    const questions = [mc('a'), mc('b'), mc('c'), mc('d', { specItemIds: ['aqa-7132-3.4.1:operations-item'] })]
    let session = startQuestionSession(questions, 2)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'fairly' }), questions)
    session = advanceQuestionSession(answerAs(session, { correct: false, selected: 1, confidence: 'fairly' }), questions)
    const skills = summariseSession(input(session, questions)).skills
    const byId = Object.fromEntries(skills.map((skill) => [skill.id, skill.status]))
    expect(byId['aqa-7132-3.5.1:item-a']).toBe('gotit')
    expect(byId['aqa-7132-3.5.1:item-b']).toBe('needswork')
    expect(byId['aqa-7132-3.5.1:item-c']).toBe('nottested')
    expect(byId['aqa-7132-3.4.1:operations-item']).toBeUndefined() // another topic's spec section
    expect(skills.map((skill) => skill.status).slice(0, 2)).toEqual(['gotit', 'needswork']) // tested first
  })

  it('counts a right guess as half, and uses the engine’s own score bands', () => {
    const questions = [mc('a'), mc('b')]
    let session = startQuestionSession(questions, 2)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'guess' }), questions)
    const skills = summariseSession(input(session, questions)).skills
    expect(skills.find((skill) => skill.id.endsWith('item-a'))?.status).toBe('nearly') // 50
  })

  it('has no map without a spec mapping, and never more tiles than fit', () => {
    const many = Array.from({ length: 14 }, (_, index) => mc(`q${index}`))
    const session = startQuestionSession(many, 1)
    expect(summariseSession(input(session, many, { topicOrder: null })).skills).toEqual([])
    expect(summariseSession(input(session, many)).skills.length).toBeLessThanOrEqual(MAX_SKILL_TILES)
  })
})

describe('go over these', () => {
  const page = { id: 'bus-fin-001', title: 'Break-even', minutes: 4 }

  it('lists every wrong answer with what was picked and why, every right guess, and every missed written mark point', () => {
    const qs = [mc('a'), mc('b'), mc('c'), written('w')]
    let session = startQuestionSession(qs, 4)
    session = advanceQuestionSession(answerAs(session, { correct: false, selected: 1, confidence: 'fairly' }), qs)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'guess' }), qs)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'certain' }), qs)
    session = advanceQuestionSession(answerAs(session, { correct: false, marks: { got: 1, available: 2 }, pointsGiven: [true, false] }), qs)
    const { goOver } = summariseSession(input(session, qs, { learnPage: () => page }))
    expect(goOver.map((item) => item.tone)).toEqual(['needswork', 'nearly', 'needswork'])
    expect(goOver[0].title).toMatch(/^Question \d · /)
    expect(goOver[0].reason).toContain('You picked B: it confuses revenue with profit.')
    expect(goOver[0].reason).toContain('Profit is revenue minus costs.')
    expect(goOver[1].reason).toContain('you said you were guessing')
    expect(goOver[2].reason).toBe('A mark point is missing: Applies it to the café')
    expect(goOver[0].learn).toEqual(page)
  })

  it('still lists a miss that was got right on the second go, and says nothing when everything was right and sure', () => {
    const qs = [mc('a')]
    let session = startQuestionSession(qs, 1)
    session = advanceQuestionSession(answerAs(session, { correct: false, selected: 1, confidence: 'fairly' }), qs)
    session = advanceQuestionSession(answerAs(session, { correct: true, selected: 0, confidence: 'fairly' }), qs)
    expect(summariseSession(input(session, qs)).goOver.map((item) => item.number)).toEqual([1])

    let clean = startQuestionSession(qs, 1)
    clean = advanceQuestionSession(answerAs(clean, { correct: true, selected: 0, confidence: 'certain' }), qs)
    expect(summariseSession(input(clean, qs)).goOver).toEqual([])
  })
})

describe('calculations in the summary', () => {
  it('counts a calculation in "n of m right" and says what was typed and what the answer is, with the working kept line by line', () => {
    const qs = [calc('c1'), mc('a')]
    let session = startQuestionSession(qs, 2)
    // The session chooses the order, so each answer depends on which question is on screen.
    for (let step = 0; step < 2; step += 1) {
      const onScreen = session.currentId
      session = advanceQuestionSession(answerAs(session, onScreen === 'c1' ? { correct: false, typed: '24', confidence: 'fairly' } : { correct: true, selected: 0, confidence: 'certain' }), qs)
    }
    const model = summariseSession(input(session, qs))
    expect(model.heroLine).toBe('1 of 2 right')
    const item = model.goOver.find((entry) => entry.key === 'c1')!
    expect(item.reason).toBe('You answered 24. The answer is £24.2m.\nMarket size = £8.4m + £6.7m + £5.9m + £3.2m\n= £24.2m')
    expect(item.tone).toBe('needswork')
  })

  it('lists a right calculation that was a guess, and a certain wrong calculation is the next step', () => {
    const qs = [calc('c1'), calc('c2')]
    let session = startQuestionSession(qs, 2)
    for (let step = 0; step < 2; step += 1) {
      const onScreen = session.currentId
      session = advanceQuestionSession(answerAs(session, onScreen === 'c1' ? { correct: true, typed: '24.2', confidence: 'guess' } : { correct: false, typed: '12', confidence: 'certain' }), qs)
    }
    const model = summariseSession(input(session, qs))
    expect(model.goOver.map((entry) => `${entry.key}:${entry.tone}`).sort()).toEqual(['c1:nearly', 'c2:needswork'])
    expect(model.goOver.find((entry) => entry.key === 'c1')!.reason).toContain('you said you were guessing')
    expect(model.next.reason).toMatch(/certain/i)
  })
})

