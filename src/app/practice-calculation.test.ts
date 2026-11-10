import { describe, expect, it } from 'vitest'
import { acceptedValuesFor, checkCalculation, formatAnswer, parseAnswer, unitScale } from './practice-calculation'

const check = (typed: string, expected: number, unit: string, entries: string[] = []) =>
  checkCalculation(typed, acceptedValuesFor(expected, unit, entries), unit).status

describe('reading what the student typed', () => {
  it('reads plain numbers, money, percentages and commas', () => {
    expect(parseAnswer('450')).toEqual({ value: 450, factor: null })
    expect(parseAnswer('£15,150')).toEqual({ value: 15150, factor: null })
    expect(parseAnswer('12.5%')).toEqual({ value: 12.5, factor: null })
    expect(parseAnswer('-£80,000')).toEqual({ value: -80000, factor: null })
    expect(parseAnswer('about 36.5 days')).toEqual({ value: 36.5, factor: null })
  })
  it('reads million, m, k and thousand', () => {
    expect(parseAnswer('£24.2m')).toEqual({ value: 24.2, factor: 1e6 })
    expect(parseAnswer('24.2 million')).toEqual({ value: 24.2, factor: 1e6 })
    expect(parseAnswer('5k')).toEqual({ value: 5, factor: 1e3 })
  })
  it('gives up on text with no number', () => {
    expect(parseAnswer('')).toBeNull()
    expect(parseAnswer('no idea')).toBeNull()
    expect(parseAnswer('£')).toBeNull()
  })
})

describe('units', () => {
  it('knows when the answer is in millions or thousands', () => {
    expect(unitScale('£m')).toBe(1e6)
    expect(unitScale('£')).toBe(1)
    expect(unitScale('percent')).toBe(1)
    expect(unitScale('£k')).toBe(1e3)
  })
})

describe('checking a calculation', () => {
  it('accepts an answer in millions however it is typed', () => {
    for (const typed of ['24.2', '£24.2m', '24.2 million', '24,200,000', '£24,200,000']) expect(check(typed, 24.2, '£m'), typed).toBe('right')
  })
  it('accepts percentages with or without the sign, and a trailing zero', () => {
    for (const typed of ['12.5', '12.5%', '12.50%', ' 12.5 percent']) expect(check(typed, 12.5, 'percent'), typed).toBe('right')
  })
  it('does not accept the percentage as a decimal fraction', () => {
    expect(check('0.125', 12.5, 'percent')).toBe('wrong')
  })
  it('rejects a wrong number, and says so when nothing could be read', () => {
    expect(check('24', 24.2, '£m')).toBe('wrong')
    expect(check('450 loaves', 450, 'units per employee per month')).toBe('right')
    expect(check('four fifty', 450, 'units per employee per month')).toBe('unreadable')
  })
  it('does not let a large number be a little out', () => {
    expect(check('15157', 15150, '£')).toBe('wrong')
    expect(check('15,150', 15150, '£')).toBe('right')
    expect(check('450.4', 450, 'units per employee per month')).toBe('right')
    expect(check('452', 450, 'units per employee per month')).toBe('wrong')
  })
  it('allows for the last decimal place only', () => {
    expect(check('2.67', 2.67, 'years')).toBe('right')
    expect(check('2.675', 2.67, 'years')).toBe('right')
    expect(check('2.8', 2.67, 'years')).toBe('wrong')
  })
  it('requires exact integer input for opt-in discrete statistics without changing other calculations', () => {
    const values = acceptedValuesFor(2, null, ['2'])
    for (const answer of ['2', '2.0', ' 2 ']) expect(checkCalculation(answer, values, null, true).status).toBe('right')
    for (const answer of ['1.5', '1.6', '2.4', '2.5']) expect(checkCalculation(answer, values, null, true).status).toBe('unreadable')
    for (const answer of ['-2', '3']) expect(checkCalculation(answer, values, null, true).status).toBe('wrong')
    expect(checkCalculation('1.6', values, null).status).toBe('right') // historical rounded-number behavior remains available
  })
  it('rejects trailing expressions and prose in exact-integer mode without changing ordinary calculations', () => {
    const accepted = acceptedValuesFor(2, null, ['2'])
    for (const valid of ['2', '+2', '2.0', '2.00', ' 2 ']) {
      expect(checkCalculation(valid, accepted, null, true).status, valid).toBe('right')
    }
    for (const invalid of ['2+1', '2-1', '2 * 1', '2 apples', 'about 2', '2%', '2e0', '2,0', '2.0+1', '2.1', '+ 2']) {
      expect(checkCalculation(invalid, accepted, null, true).status, invalid).toBe('unreadable')
    }
    expect(checkCalculation('2 apples', accepted, null).status).toBe('right') // existing permissive generic parser unaffected
    expect(checkCalculation('2+1', accepted, null).status).toBe('right') // non-discrete legacy mode unchanged
  })
  it('accepts only a complete negative integer when an exact numeric source requires one', () => {
    const accepted = acceptedValuesFor(-2, null, ['-2'])
    expect(checkCalculation('-2', accepted, null, true).status).toBe('right')
    expect(checkCalculation('-2.00', accepted, null, true).status).toBe('right')
    expect(checkCalculation('-2-1', accepted, null, true).status).toBe('unreadable')
  })
  it('has an opt-in exact-number rule for whole and decimal final answers, without weakening discrete integer or changing legacy rounding', () => {
    const whole = acceptedValuesFor(20, '%', ['20'])
    for (const typed of ['20', '20.0', '+20', '020', ' 20 ']) {
      expect(checkCalculation(typed, whole, '%', false, true).status, typed).toBe('right')
    }
    for (const typed of ['19.5', '20.5', '19.999', '20.01', '21']) {
      expect(checkCalculation(typed, whole, '%', false, true).status, typed).toBe('wrong')
    }
    for (const typed of ['20%', '20+1', '20 days', 'about 20', '20e0', '20:1']) {
      expect(checkCalculation(typed, whole, '%', false, true).status, typed).toBe('unreadable')
    }
    expect(checkCalculation('19.5', whole, '%').status).toBe('right') // Historical tolerance retained.
    const ratio = acceptedValuesFor(1.5, 'ratio', ['1.5'])
    for (const typed of ['1.5', '1.50', '01.500']) {
      expect(checkCalculation(typed, ratio, 'ratio', false, true).status, typed).toBe('right')
    }
    for (const typed of ['1.45', '1.55', '1.499', '1.51']) {
      expect(checkCalculation(typed, ratio, 'ratio', false, true).status, typed).toBe('wrong')
    }
    expect(checkCalculation('1.45', ratio, 'ratio').status).toBe('right')
    expect(checkCalculation('1.5:1', ratio, 'ratio', false, true).status).toBe('unreadable')
    expect(checkCalculation('1.5', ratio, 'ratio', true).status).toBe('unreadable') // Original exact-integer rule unchanged.
  })

  it('accepts the rounded answers the mark scheme itself accepts', () => {
    expect(check('2.7', 2.67, 'years', ['2.67 years', '2 years 8 months', '2.7 years if rounded to one decimal place.'])).toBe('right')
    expect(check('37', 36.5, 'days', ['36.5 days', '36.50 days', 'approximately 37 days if rounded to a whole day'])).toBe('right')
    expect(check('2.7', 2.67, 'years')).toBe('wrong')
  })
  it('never accepts an unrelated number from a mark point', () => {
    expect(acceptedValuesFor(7850, '£', ['£27,300 + £29,050 + £31,500 - £80,000 = £7,850', 'NPV = +£7,850', '£7,850'])).toEqual([7850])
  })
  it('reads a negative answer', () => {
    expect(check('-£7,850', -7850, '£')).toBe('right')
    expect(check('7850', -7850, '£')).toBe('wrong')
  })
})

describe('writing an answer for the student', () => {
  it('uses the unit the way the exam does', () => {
    expect(formatAnswer(24.2, '£m')).toBe('£24.2m')
    expect(formatAnswer(15150, '£')).toBe('£15,150')
    expect(formatAnswer(12.5, 'percent')).toBe('12.5%')
    expect(formatAnswer(1.5, 'ratio')).toBe('1.5:1')
    expect(formatAnswer(36.5, 'days')).toBe('36.5 days')
  })
})
