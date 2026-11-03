import { describe, expect, it } from 'vitest'
import paper1 from '../paper-1'
import paper2 from '../paper-2'
import paper3 from '../paper-3'
import { bankRecordToPractice, objectiveItemMappingForPractice } from '../../../../src/app/practice-questions'
import crosswalk from '../../../../scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json'
import atomic from '../../../../scripts/assurance/data/aqa-psychology-7182-social-influence-atomic-review.json'
import { psychologySocialInfluenceAppliedPracticeBank as scored, psychologySocialInfluenceWrittenDrills as written, psychologySocialInfluencePracticeCandidateBindings as bindings } from './social-influence-practice'
import { psychologyLegacySocialInfluenceQuestions } from './course'

const packs = [paper1, paper2, paper3]
const liveTopic = 'social-influence'
const expectedTargets = [
  'PSY-SRC-411-SI06',
  'PSY-SRC-411-SI07',
  'PSY-SRC-411-SI13',
  'PSY-SRC-411-SI14',
  'PSY-SRC-411-SI15',
  'PSY-SRC-411-SI17',
  'PSY-SRC-411-SI18',
  'PSY-SRC-411-SI21',
]
const questionIds = scored.map(row => `${row.namespace}-${row.batch}-${row.id}`)

describe('Issue #698 AQA Psychology Social Influence scoped applied/evaluation Practice', () => {
  it('retains the exact Founder specification, four source parent bullets and bounded target list', () => {
    expect(crosswalk.qualification.pdfSha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(crosswalk.qualification.rights).toBe('REFERENCE_ONLY')
    expect(crosswalk.rows.filter(row => row.sourceSection === '4.1.1')).toHaveLength(4)
    expect(atomic.rows.filter(row => row.sourceSection === '4.1.1')).toHaveLength(21)
    expect(scored).toHaveLength(8)
    expect(written).toHaveLength(4)
    expect(scored.map(row => row.target_item_ids[0])).toEqual(expectedTargets)
    expect(new Set(questionIds).size).toBe(8)
    expect(new Set(written.map(row => row.id)).size).toBe(4)
    const known = new Set(atomic.rows.map(row => row.id))
    expect(expectedTargets.every(target => known.has(target))).toBe(true)
  })

  it('keeps each scored response a single credible scenario judgement with attributable one-item evidence', () => {
    for (const row of scored) {
      expect(row.topic_id).toBe(liveTopic)
      expect(row.namespace).toBe('rev7182')
      expect(row.batch).toBe('4.1.1')
      expect(row.target_item_ids).toHaveLength(1)
      expect(row.target_node_ids).toHaveLength(1)
      expect(row.question.family).toBe('MCQ')
      expect(row.question.marks).toBe(1)
      expect(row.question.ao_tags.length).toBe(1)
      expect(['AO2', 'AO3']).toContain(row.question.ao_tags[0])
      expect(row.question.context.length).toBeGreaterThan(100)
      expect(row.question.options.map(x => x.label)).toEqual(['A','B','C','D'])
      expect(row.question.mark_scheme.type).toBe('single_option')
      expect(row.question.mark_scheme.option_rationale).toHaveLength(4)
      expect(row.question.mark_scheme.option_rationale?.every(x => x.length > 30)).toBe(true)
      const normalized = bankRecordToPractice(row, liveTopic)
      expect(normalized?.type).toBe('multiple-choice')
      if (!normalized || normalized.type !== 'multiple-choice') throw new Error('Expected scored MCQ')
      expect(normalized.id).toBe(`rev7182-4.1.1-${row.id}`)
      expect(normalized.options).toHaveLength(4)
      const mapping = objectiveItemMappingForPractice(normalized)
      expect(mapping?.singleTargetSpecItemId).toBe(row.target_item_ids[0])
      expect(mapping?.targetNodeIds).toEqual(row.target_node_ids)
      expect(normalized.level).toBeTruthy()
      expect(normalized.explanation.length).toBeGreaterThan(30)
    }
    expect(scored.filter(row => row.question.ao_tags.includes('AO2'))).toHaveLength(5)
    expect(scored.filter(row => row.question.ao_tags.includes('AO3'))).toHaveLength(3)
  })

  it('supplies original applied items through every shared Course Practice pack and preserves separately versioned LF-03 history', () => {
    for (const pack of packs) {
      expect(pack.manifest.status).toBe('available')
      const candidates = (pack.practiceBank ?? []).filter(row => row.topic_id === liveTopic)
      expect(candidates.map(row => row.id)).toEqual(scored.map(row => row.id))
      for (const candidate of candidates) {
        expect(candidate.target_item_ids).toHaveLength(1)
        expect(candidate.target_node_ids[0]).toMatch(/^social-influence-psy010[1-4]$/)
      }
      const existing = pack.questions.filter(item => item.topic === liveTopic)
      const historicalIds = psychologyLegacySocialInfluenceQuestions.map(item => item.id)
      const liveIds = historicalIds.map(id => id + '-v2')
      expect(historicalIds).toEqual([
        'psy-psy0101-check', 'psy-psy0102-check', 'psy-psy0103-check', 'psy-psy0104-check',
      ])
      // The original LF-03 scored questions are immutable history, not republished
      // or overwritten by the eight independently source-targeted #698 cases.
      expect(existing.map(x => x.id).sort()).toEqual([...liveIds].sort())
      expect(existing.every(item => !historicalIds.includes(item.id))).toBe(true)
      expect(questionIds.every(id => !liveIds.includes(id))).toBe(true)
      const drills = pack.dataDrills.filter(item => item.topic === liveTopic)
      expect(drills.map(item => item.id)).toEqual(written.map(item => item.id))
    }
  })

  it('keeps original written transfer tasks as unscored learner self-checks, not fabricated AO2/AO3 attainment', () => {
    for (const [index, row] of written.entries()) {
      expect(row.topic).toBe(liveTopic)
      expect(row.prompt).toContain('SELF-CHECKED')
      expect(row.answer.length).toBeGreaterThan(280)
      expect(bindings[row.id].kind).toBe('self-check-no-mark')
      expect(bindings[row.id].targets).toEqual([`PSY-7182-411-B0${index + 1}`])
    }
    for (const row of scored) {
      const id = `rev7182-4.1.1-${row.id}`
      expect(bindings[id].kind).toBe('single-option-objective')
      expect(bindings[id].targets).toEqual(row.target_item_ids)
    }
    expect(written.every(row => !('marks' in row))).toBe(true)
  })
})
