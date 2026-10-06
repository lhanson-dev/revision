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
