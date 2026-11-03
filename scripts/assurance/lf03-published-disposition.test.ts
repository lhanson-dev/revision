import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import business1 from '../../content/business/aqa-a-level/paper-1'
import business2 from '../../content/business/aqa-a-level/paper-2'
import business3 from '../../content/business/aqa-a-level/paper-3'
import psychology1 from '../../content/psychology/aqa-a-level/paper-1'
import psychology2 from '../../content/psychology/aqa-a-level/paper-2'
import psychology3 from '../../content/psychology/aqa-a-level/paper-3'
import { bankQuestionId, bankRecordToPractice } from '../../src/app/practice-questions'
import retainedBusinessSource from '../../content/business/aqa-a-level/shared/fast-path-question-bank.json'
import signedCashFlowSource from '../../content-factory/slices/aqa-7132-3.5/questions/q17.json'
import { reviewMcqQuality, type McqQualityInput } from './lf03-mcq-quality'

/**
 * #787 current *published* catalogue and risk queue, not an educational pass.
 * The report intentionally contains no stems, answer wording or learner data.
 */
type Row = McqQualityInput & {
  course: 'business-7132' | 'psychology-7182'
  source: 'course-pack' | 'structured-practice-bank'
  topic: string
}
const publishedNarrowCorrections = new Set([
  ...[1, 2, 3, 4].map(i => `psy-psy010${i}-check-v2`),
  ...[1, 2, 3, 4].map(i => `psy-psy020${i}-check-v2`),
  'psy-psy0304-check-v2', 'psy-psy0305-check-v2',
  'psy-psy0801-check-v2', 'psy-psy0804-check-v2',
])

type Pack = typeof business1
type PsyPack = typeof psychology1
type AnyPack = Pack | PsyPack

function fromPack(pack: AnyPack, course: Row['course']): Row[] {
  const own = pack.questions.map(q => ({
    course, source: 'course-pack' as const, id: q.id,
    topic: q.topic, prompt: q.prompt, options: [...q.options],
    correctOption: q.correctOption, explanation: q.explanation,
  }))
  const bank = (pack.practiceBank ?? []).flatMap(record => {
    const q = bankRecordToPractice(record, 'audit-only')
    return q?.type === 'multiple-choice' ? [{
      course, source: 'structured-practice-bank' as const,
      id: q.id, topic: q.topicId, prompt: q.prompt,
      options: q.options.map(x => x.text), correctOption: q.correctOption,
      explanation: q.explanation,
    }] : []
  })
  return [...own, ...bank]
}

function allPublished(): Row[] {
  const rows = new Map<string, Row>()
  for (const [course, packs] of [
    ['business-7132', [business1, business2, business3]],
    ['psychology-7182', [psychology1, psychology2, psychology3]],
  ] as const) {
    for (const pack of packs) {
      for (const q of fromPack(pack, course)) {
        const key = course + ':' + q.id
        const earlier = rows.get(key)
        if (earlier && JSON.stringify(earlier) !== JSON.stringify(q)) {
          throw new Error('Published paper packs disagree on MCQ identity/content: ' + key)
        }
        if (!earlier) rows.set(key, q)
      }
    }
  }
  return [...rows.values()].sort((a, b) =>
    a.course.localeCompare(b.course) || a.source.localeCompare(b.source) || a.id.localeCompare(b.id))
}

function results() {
  const rows = allPublished()
  const flags = new Map<string, Set<string>>()
  const retainedIds = new Set(retainedBusinessSource.questions
    .filter(record => record.question.family === 'MCQ')
    .map(record => bankQuestionId(record)))
  const cohorts = [
    rows.filter(q => q.course === 'business-7132' && q.source === 'course-pack'),
    rows.filter(q => q.course === 'business-7132' && q.source === 'structured-practice-bank'),
    rows.filter(q => q.course === 'psychology-7182' && q.source === 'course-pack'),
    rows.filter(q => q.course === 'psychology-7182' && q.source === 'structured-practice-bank'),
  ]
  // The historical 59-item retained Business MCQ source is A=40/B=12/C=7/D=0.
  // Its skew must remain visible even when newer 7132 rechecks and slices dilute
  // a whole-integrated-bank >=60% heuristic below its normal warning threshold.
  cohorts.push(rows.filter(q => q.course === 'business-7132' && retainedIds.has(q.id)))
  for (const group of cohorts) {
    for (const f of reviewMcqQuality(group)) {
      for (const id of f.ids) {
        const list = flags.get(id) ?? new Set<string>()
        list.add(f.rule)
        flags.set(id, list)
      }
    }
  }
  const items = rows.map(q => ({
    course: q.course,
    source: q.source,
    id: q.id,
    topic: q.topic,
    correctOption: q.correctOption,
    reviewSignals: [...(flags.get(q.id) ?? [])].sort(),
    disposition: publishedNarrowCorrections.has(q.id)
      ? 'targeted-v2-released-original-learner-acceptance-open'
      : 'unresolved-independent-item-review-needed',
  }))
  const count = (course: Row['course'], source: Row['source']) =>
    items.filter(q => q.course === course && q.source === source).length
  return {
    provenance: {
      issue: 787,
      courseBaseline: 'actual imported AQA 7132 and 7182 paper 1/2/3 ContentPacks',
      evidence: 'static published source review only; no learner records or independent subject verdict',
      status: 'partial review, unresolved findings; never interpret no regex flag as an educational pass',
    },
    counts: {
      businessCoursePack: count('business-7132', 'course-pack'),
      businessBankMcq: count('business-7132', 'structured-practice-bank'),
      psychologyCoursePack: count('psychology-7182', 'course-pack'),
      psychologyBankMcq: count('psychology-7182', 'structured-practice-bank'),
      total: items.length,
      targetedReleasedButNotLearnerAccepted: items.filter(q => q.disposition.startsWith('targeted-v2')).length,
      independentItemReviewNeeded: items.filter(q => q.disposition.startsWith('unresolved')).length,
    },
    items,
  }
}

describe('#787 cross-course published MCQ identity/disposition inventory', () => {
  it('covers every actual live MCQ identity across all three Business/Psychology packs, without silent content differences', () => {
    const report = results()
    expect(report.counts.businessCoursePack).toBeGreaterThan(40)
    expect(report.counts.businessBankMcq).toBeGreaterThanOrEqual(79)
    expect(report.counts.psychologyCoursePack).toBeGreaterThanOrEqual(118)
    expect(report.counts.total).toBeGreaterThanOrEqual(247)
    expect(report.items.every(q => !!q.id && q.correctOption >= 0 && q.correctOption < 4)).toBe(true)
    expect(new Set(report.items.map(q => q.course + ':' + q.id)).size).toBe(report.items.length)
    expect(report.items.every(q => q.disposition && Array.isArray(q.reviewSignals))).toBe(true)
    // A source-level no-flag result is never evidence of factually valid options.
    const folder = join(process.cwd(), '.artifacts', 'lf03-bank-dispositions')
    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, 'published-qa-queue.json'), JSON.stringify(report, null, 2) + '\n')
  })

  it('distinguishes signed amounts in the actual Business cash-flow source without letting duplicated answers pass', () => {
    const q = signedCashFlowSource.question
    const sourceKey = q.options.findIndex(option => option.label === q.mark_scheme.correct_option)
    const candidate = { id: 'aqa7132-3.5-q17', prompt: q.stem,
      options: q.options.map(option => option.text), correctOption: sourceKey,
      explanation: q.mark_scheme.model_answer }
    expect(candidate.options).toContain('−£6,000')
    expect(candidate.options).toContain('+£6,000')
    expect(reviewMcqQuality([candidate]).filter(f => f.rule === 'duplicate-option')).toEqual([])
    const actuallyDuplicated = { ...candidate, options: ['−£6,000', '−£6,000', '+£7,000', '+£6,000'] }
    expect(reviewMcqQuality([actuallyDuplicated]).filter(f => f.rule === 'duplicate-option')).toHaveLength(1)
    // A positive/negative arithmetic sign changes the meaning. This is a
    // lexical QA correction, not independent assurance of the cash-flow method.
  })

  it('retains known unresolved Business key skew and Psychology repeated-set warnings as review requests', () => {
    const report = results()
    expect(report.counts.targetedReleasedButNotLearnerAccepted).toBe(12)
    expect(report.items.filter(q => q.course === 'psychology-7182' && q.reviewSignals.includes('repeated-option-set')).length).toBeGreaterThan(0)
    const remaining = report.items.filter(q => q.course === 'psychology-7182' && ['relationships', 'cognition-and-development', 'forensic-psychology'].includes(q.topic))
    expect(remaining.length).toBeGreaterThanOrEqual(12)
    expect(remaining.every(q => q.disposition === 'unresolved-independent-item-review-needed')).toBe(true)
    const businessBank = report.items.filter(q => q.course === 'business-7132' && q.source === 'structured-practice-bank')
    const counts = [0, 1, 2, 3].map(i => businessBank.filter(q => q.correctOption === i).length)
    expect(counts[0]).toBeGreaterThan(counts[3])
    expect(report.items.some(q => q.reviewSignals.includes('answer-position-bias'))).toBe(true)
    // Numerical distribution is a review warning, never a license to change an
    // old question's key, response options or retained historical evidence.
  })
})
