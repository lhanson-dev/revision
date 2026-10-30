import { describe, expect, it } from 'vitest'
import audit from '../../../audits/2026-10-30-aqa-business-7132-section-313-source-to-live.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessExternalEnvironmentCases } from './shared/external-environment-practice'
import { bankQuestionId, buildQuestionPool } from '../../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const
const exactIds = businessExternalEnvironmentCases.map(item => `rev7132-3.1.3-${item.id}`)

describe('Issue #698 AQA Business §3.1.3 original external-environment assessment', () => {
  it('identifies seven distinct official factors without claiming educational adequacy', () => {
    expect(audit.qualification).toBe('AQA A-level Business 7132')
    expect(audit.official_version).toBe('v2.0 June 2023')
    expect(audit.source_section).toBe('3.1.3')
    expect(audit.source_printed_page).toBe(13)
    expect(audit.source_rights).toBe('REFERENCE_ONLY')
    expect(audit.original_uploaded_sha_verified).toBe(false)
    expect(audit.count).toBe(7)
    expect(audit.count).toBe(audit.items.length)
    expect(new Set(audit.items.map(item => item.atomic_id)).size).toBe(7)
    expect(new Set(audit.items.map(item => item.source_requirement)).size).toBe(7)
    expect(audit.items.every(item => item.identified_learn_page_ids.length > 0
      && item.independently_scored_response === 'single-option-MCQ'
      && item.teaching_adequacy === 'unverified'
      && item.assessment_adequacy === 'unverified'
      && item.authenticated_learner_acceptance === 'unverified')).toBe(true)
    expect(audit.items.map(item => item.linked_original_practice_id)).toEqual(exactIds)
  })

  it('publishes one precisely targeted scored question for each source factor in all three real Business packs', () => {
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(record => record.namespace === 'rev7132'
        && record.batch === '3.1.3')
      expect(records).toHaveLength(7)
      expect(records.map(bankQuestionId)).toEqual(exactIds)
      expect(records.every(record => record.topic_id === 'business'
        && record.target_item_ids.length === 1
        && record.target_node_ids.length === 1
        && record.target_node_ids[0] === 'bus-fnd-009'
        && record.question.family === 'MCQ'
        && record.question.marks === 1
        && record.question.ao_tags.includes('AO2'))).toBe(true)
      const pages = pack.learn!.chapters.flatMap(chapter =>
        chapter.groups.flatMap(group => group.pages))
      const lesson = pages.find(page => page.id === 'bus-fnd-009')
      expect(lesson?.topicId).toBe('business')
      expect(pages.filter(page => page.id === 'bus-fnd-009')).toHaveLength(1)
      const trade = lesson?.blocks.find(block => block.type === 'explanation'
        && block.heading === 'Fair trade, business costs and customer demand')
      expect(trade?.type).toBe('explanation')
      if (trade?.type === 'explanation') {
        expect(trade.paragraphs.join(' ')).toContain('higher purchase price')
        expect(trade.paragraphs.join(' ')).toContain('demand response is uncertain')
      }

      const pool = buildQuestionPool({
        topicId: 'business', topicOrder: 1, coursePack: pack.questions, bank: pack.practiceBank,
      })
      for (const [index, id] of exactIds.entries()) {
        const question = pool.find(item => item.id === id)
        expect(question, id).toBeDefined()
        expect(question?.type).toBe('multiple-choice')
        if (question?.type !== 'multiple-choice') continue
        const authored = businessExternalEnvironmentCases[index]!
        expect(question.specItemIds).toEqual([authored.target])
        expect(question.nodeIds).toEqual(['bus-fnd-009'])
        expect(question.correctOption).toBe('ABCD'.indexOf(authored.correct))
        expect(question.options[question.correctOption]!.text).toBe(authored.options[question.correctOption])
        expect(question.explanation).toBeTruthy()
        expect(question.options.filter((_, option) => option !== question.correctOption)
          .every(option => Boolean(option.why))).toBe(true)
      }
      // The previously issued names and one-number skill questions remain
      // available to learners after the new question family is appended.
      expect(pool.some(question => question.id === 'rev7132-3.1.1-profit-01')).toBe(true)
      expect(pool.some(question => question.id === 'a-level-mcq-005')).toBe(true)
    }
  })

  it('checks each original scenario has a correct option, three contrasting errors and independent exact mapping', () => {
    expect(businessExternalEnvironmentCases).toHaveLength(7)
    for (const item of businessExternalEnvironmentCases) {
      expect(item.options).toHaveLength(4)
      expect(item.why).toHaveLength(4)
      expect(item.target.startsWith('aqa-7132-3.1.3:')).toBe(true)
      expect(item.correct).toMatch(/^[ABCD]$/)
      expect(item.why['ABCD'.indexOf(item.correct)]).toMatch(/is correct:/)
      expect(item.why.filter((_, index) => index !== 'ABCD'.indexOf(item.correct))
        .every(rationale => rationale.includes('is incorrect:'))).toBe(true)
      expect(item.context.length).toBeGreaterThan(50)
      expect(item.stem.length).toBeGreaterThan(50)
    }
    expect(new Set(businessExternalEnvironmentCases.map(item => item.target)).size).toBe(7)
    expect(new Set(businessExternalEnvironmentCases.map(item => item.id)).size).toBe(7)
  })
})
