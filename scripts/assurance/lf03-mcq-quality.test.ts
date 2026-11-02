import { describe, expect, it } from 'vitest'
import psychology from '../../content/psychology/aqa-a-level/paper-1'
import business from '../../content/business/aqa-a-level/paper-1'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import retainedBusinessBank from '../../content/business/aqa-a-level/shared/fast-path-question-bank.json'
import { bankRecordToPractice } from '../../src/app/practice-questions'
import { reviewMcqQuality, type McqQualityInput } from './lf03-mcq-quality'

const fromPack = (items: typeof psychology.questions): McqQualityInput[] => items.map(q => ({
  id: q.id, prompt: q.prompt, options: q.options, correctOption: q.correctOption, explanation: q.explanation,
}))
const fromBank = aqaBusinessQuestionBank.flatMap(record => {
  const item = bankRecordToPractice(record, 'audit-only')
  return item?.type === 'multiple-choice' ? [{
    id: item.id, prompt: item.prompt, options: item.options.map(x => x.text),
    correctOption: item.correctOption, explanation: item.explanation,
  }] : []
})

describe('LF-03 bounded source-to-published AQA question-bank audit', () => {
  it('does not declare a single repeated letter or word a defect', () => {
    const sample = Array.from({ length: 3 }, (_, i) => ({
      id: `legitimate-${i}`, prompt: `Which separate detail best explains context ${i}?`,
      options: ['One possible explanation', 'Another explanation', 'Contextual detail', 'Neither of these'],
      correctOption: 1, explanation: 'This is a distinct educational context.',
    }))
    const flagged = reviewMcqQuality(sample)
    expect(flagged.some(x => x.rule === 'answer-position-bias' || x.rule === 'answer-position-run')).toBe(false)
    // Identical options are a review queue, not an automatic assessment verdict.
    expect(flagged.filter(x => x.rule === 'repeated-option-set')[0]?.disposition).toBe('review')
  })

  it('has no duplicate options or exploitable answer-option sets in corrected Social Influence', () => {
    const social = fromPack(psychology.questions).filter(q => q.id.startsWith('psy-psy01'))
    const findings = reviewMcqQuality(social)
    expect(social).toHaveLength(4)
    expect(findings.filter(x => ['invalid-key', 'duplicate-option', 'repeated-option-set', 'answer-position-run', 'answer-position-bias'].includes(x.rule))).toEqual([])
  })

  it('keeps the systemic Psychology 7182 review queue explicit rather than silently failing all content', () => {
    const findings = reviewMcqQuality(fromPack(psychology.questions))
    expect(psychology.questions).toHaveLength(118)
    expect(findings.filter(f => f.rule === 'repeated-option-set').length).toBeGreaterThanOrEqual(10)
    expect(findings.some(f => f.rule === 'generic-feedback')).toBe(true)
    expect(findings.every(f => f.ids.length > 0 && f.detail.length > 0)).toBe(true)
    expect(findings.filter(f => f.disposition === 'block')).toEqual([])
  })

  it('includes actual retained Business 7132 MCQs and provides answer-position bias review evidence', () => {
    const bankFindings = reviewMcqQuality(fromBank)
    expect(fromBank.length).toBeGreaterThanOrEqual(63)
    const retained = retainedBusinessBank.questions.filter(r => r.question.family === 'MCQ').map(r => ({
      id: r.id, prompt: r.question.stem, options: r.question.options.map(o => o.text),
      correctOption: r.question.options.findIndex(o => o.label === r.question.mark_scheme.correct_option),
      explanation: r.question.mark_scheme.option_rationale?.join(' ') ?? '',
    }))
    expect(retained).toHaveLength(59)
    expect(retained.filter(x => x.correctOption === 0)).toHaveLength(40)
    expect(reviewMcqQuality(retained).some(f => f.rule === 'answer-position-bias')).toBe(true)
    expect(bankFindings.every(f => f.ids.length > 0)).toBe(true)
    // Business course-pack and bank are separately authored; both sources must be reviewed.
    expect(business.questions.length).toBeGreaterThan(0)
    expect(reviewMcqQuality(fromPack(business.questions)).every(f => f.ids.length > 0)).toBe(true)
  })
})
