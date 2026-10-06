import { describe, expect, it } from 'vitest'
import { MarkingError, normaliseText, numbersExpected, resolveChallenge, verifyMarking, type MarkPoint, type MarkerOutput } from './rev-marking'

const points: MarkPoint[] = [
  { marks: 1, descriptor: 'Takes break-even away from forecast sales', accept: ['2,600 − 2,000', 'forecast minus break-even'] },
  { marks: 1, descriptor: 'States the margin of safety: 600 cups', accept: ['600 cups', '600'] },
  { marks: 1, descriptor: 'Explains that sales could fall by that much before a loss', accept: ['sales can fall by 600 cups before a loss', 'sales could fall that far before losing money'] },
  { marks: 1, descriptor: 'Applies it to the café', accept: ['college holidays could cut sales', 'term time changes'] },
]
const answer = 'Margin of safety is 2,600 − 2,000 = 600 cups. So sales could fall by 600 cups before a loss.'
const output = (given: boolean[], quotes: Array<string | undefined>, note = 'Add how the café’s own situation could change sales.'): MarkerOutput => ({
  points: given.map((value, index) => ({ given: value, quote: quotes[index] })),
  note,
  modelVersion: 'marker-test-1',
})

describe('checking REV’s marking against the mark scheme', () => {
  it('keeps a mark the marker backs with words that are in the answer', () => {
    const marked = verifyMarking(points, answer, output([true, true, true, false], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', undefined]))
    expect(marked.given).toEqual([true, true, true, false])
    expect(marked.got).toBe(3)
    expect(marked.available).toBe(4)
    expect(marked.takenBack).toEqual([])
    expect(marked.modelVersion).toBe('marker-test-1')
  })

  it('takes back a mark whose quote is not in the answer, and says so', () => {
    const marked = verifyMarking(points, answer, output([true, true, true, true], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', 'college holidays could cut sales']))
    expect(marked.given).toEqual([true, true, true, false])
    expect(marked.takenBack).toEqual([3])
    expect(marked.note).toContain('I couldn’t find them')
  })

  it('takes back a mark given without any quote', () => {
    const marked = verifyMarking(points, answer, output([true, false, false, false], [undefined, undefined, undefined, undefined]))
    expect(marked.given).toEqual([false, false, false, false])
    expect(marked.takenBack).toEqual([0])
  })

  it('needs the number the mark scheme expects, even when the quote is in the answer', () => {
    const vague = 'The café can sell fewer cups than forecast before a loss.'
    const marked = verifyMarking(points, vague, output([false, true, false, false], [undefined, 'The café can sell fewer cups than forecast', undefined, undefined]))
    expect(marked.given[1]).toBe(false)
    expect(marked.takenBack).toEqual([1])
  })

  it('does not check numbers for a point described only in words', () => {
    expect(numbersExpected(points[3])).toBeNull()
    expect(numbersExpected(points[1])).toEqual(['600'])
    const marked = verifyMarking(points, `${answer} College holidays could cut sales.`, output([false, false, false, true], [undefined, undefined, undefined, 'College holidays could cut sales']))
    expect(marked.given[3]).toBe(true)
  })

  it('never adds a mark the marker did not give', () => {
    const marked = verifyMarking(points, answer, output([false, false, false, false], [undefined, undefined, undefined, undefined]))
    expect(marked.got).toBe(0)
  })

  it('compares quotes and numbers ignoring case, pound signs and thousands commas', () => {
    expect(normaliseText('  £2,600  Cups ')).toBe('2600 cups')
  })

  it('rejects output that is not one verdict per point, or has no model version', () => {
    expect(() => verifyMarking(points, answer, { ...output([true], ['x']) })).toThrow(MarkingError)
    expect(() => verifyMarking(points, answer, { ...output([true, true, true, true], ['a', 'b', 'c', 'd']), modelVersion: ' ' })).toThrow(MarkingError)
  })
})

describe('challenging a mark', () => {
  const first = verifyMarking(points, answer, output([true, true, true, false], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', undefined]))
  const withReply = (given: boolean[], quotes: Array<string | undefined>, reply: string) => ({ ...output(given, quotes), reply })

  it('says "changed" when a checked verdict differs, and "unchanged" when the mark stays', () => {
    const extended = `${answer} If college holidays cut sales, that could matter.`
    const changed = resolveChallenge(points, extended, first, withReply([true, true, true, true], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', 'college holidays cut sales'], 'You’re right, that applies it to the café.'))
    expect(changed.outcome).toBe('changed')
    expect(changed.marked.got).toBe(4)

    const unchanged = resolveChallenge(points, answer, first, withReply([true, true, true, false], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', undefined], 'The mark stays: nothing in your answer links it to the café.'))
    expect(unchanged.outcome).toBe('unchanged')
    expect(unchanged.reply).toContain('stays')
  })

  it('cannot talk a mark into the answer: an unsupported extra mark is taken back, so the outcome is unchanged', () => {
    const result = resolveChallenge(points, answer, first, withReply([true, true, true, true], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', 'college holidays'], 'Fair point, mark added.'))
    expect(result.marked.given).toEqual([true, true, true, false])
    expect(result.outcome).toBe('unchanged')
  })

  it('needs a reply', () => {
    expect(() => resolveChallenge(points, answer, first, withReply([true, true, true, false], ['2,600 − 2,000', '600 cups', 'sales could fall by 600 cups before a loss', undefined], '  '))).toThrow(MarkingError)
  })
})
