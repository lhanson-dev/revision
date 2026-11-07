import { describe, expect, it } from 'vitest'
import register from './data/aqa-business-7132-canonical-learner-assurance.json'
import base from './data/aqa-business-7132-official-source-baseline.json'
import first from './data/aqa-business-7132-sections-31-32-atomic-review.json'
import middle from './data/aqa-business-7132-sections-33-36-atomic-review.json'
import last from './data/aqa-business-7132-sections-37-310-atomic-review.json'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { bankRecordToPractice } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const
const previous = [first, middle, last].flatMap(input => input.sections.flatMap(section => section.atoms))
const rows371 = register.candidates.filter(row => row.section_id === '3.7.1')

describe('Issue #698 — one provisional Business source-to-learner register', () => {
  it('preserves every previous candidate without presenting the collection as the complete atom denominator', () => {
    expect(register.source.founder_uploaded_sha256).toBe(
      '3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332')
    expect(register.source.rights).toBe('REFERENCE_ONLY')
    expect(register.canonical_application).toBe('/revision/app/')
    expect(register.scope.qualified_full_course_atomic_denominator_verified).toBe(false)
    expect(register.scope.cross_cutting_annex_ao_and_three_papers_reconciled_into_independent_atoms).toBe(false)
    expect(register.sections).toHaveLength(42)
    expect(register.candidates).toHaveLength(504) // 501 prior *candidates*, 3 explicitly split §3.7.1 checks
    expect(previous).toHaveLength(501)
    const ids = register.candidates.map(row => row.requirement_candidate_id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const old of previous) {
      const row = register.candidates.find(candidate => candidate.requirement_candidate_id === old.id)
      expect(row?.observable_skill).toBe(old.observable_skill)
      expect(row?.section_id).toBe(old.source_section)
      expect(row?.printed_page).toBe(old.printed_page)
    }
    expect(register.sections.map(section => section.section_id))
      .toEqual(base.sections.map(section => section.section_id))
    for (const section of register.sections) {
      const sourceSection = base.sections.find(record => record.section_id === section.section_id)
      expect(section.printed_page).toBe(sourceSection?.printed_page)
      expect(section.candidate_ids.length).toBeGreaterThan(0)
      expect(section.whole_section_atomic_review).toBe('incomplete')
      expect(section.candidate_ids.every(id => ids.includes(id))).toBe(true)
    }
    expect(register.overlays.quantitative_annex).toHaveLength(9)
    expect(register.overlays.assessment_objectives).toHaveLength(4)
    expect(register.overlays.paper_demands).toHaveLength(3)
    expect(register.overlays.cross_cutting).toHaveLength(7)
    expect(register.status_summary.adequate_claims).toBe(0)
  })

  it('records the three separately missing source demands from printed §3.7.1 without inventing adequacy', () => {
    expect(register.scope.section_371_consulted_against_exact_pdf).toBe(true)
    expect(register.scope.section_371_independent_external_review_completed).toBe(false)
    expect(rows371).toHaveLength(14)
    expect(register.scope.section_371_newly_separated_skills).toEqual([
      'BUS7132-ATOM-3.7.1-012',
      'BUS7132-ATOM-3.7.1-013',
      'BUS7132-ATOM-3.7.1-014',
    ])
    const expected = [
      ['012', 'internal influences on functional objectives'],
      ['013', 'external influences on functional objectives'],
      ['014', 'corporate objectives guide the choice of business strategy'],
    ]
    for (const [suffix, phrase] of expected) {
      const row = rows371.find(item => item.requirement_candidate_id.endsWith('-' + suffix))
      expect(row?.observable_skill).toContain(phrase)
      expect(row?.printed_page).toBe(24)
      expect(row?.source_alignment_review).toContain('page-24')
    }
    for (const row of register.candidates) {
      expect(row.teaching_status).toBe('unverified')
      expect(row.practice_status).toBe('unverified')
      expect(row.exam_prep_status).toBe('unverified')
      expect(row.independent_skill_assessment_status).toBe('unverified')
      expect(row.learner_acceptance_status).toBe('unverified')
      expect(row.independent_reviewer_result).toBeNull()
    }
  })

  it('checks §3.7.1 candidate locators against the three REAL published Business ContentPacks', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      for (const row of rows371) {
        for (const evidence of row.learn_block_candidates) {
          const page = pages.find(page => page.id === evidence.page_id)
          expect(page, 'missing Learn page ' + evidence.page_id).toBeDefined()
          for (const index of evidence.block_indexes) {
            expect(page?.blocks[index], 'missing block ' + evidence.page_id + '/' + index).toBeDefined()
          }
          expect(evidence.adequacy).toBe('unverified')
        }
        for (const candidate of row.practice_bank_candidates) {
          const records = pack.practiceBank!.filter(
            item => item.batch === candidate.batch && item.id === candidate.id)
          expect(records, 'missing Practice ' + candidate.batch + ':' + candidate.id).toHaveLength(1)
          expect(records[0].question.family).toBe(candidate.family)
          expect(candidate.scored_atom_proof).toBe(false)
        }
        for (const sourcePrompt of row.source_factory_prompt_candidates_not_verified_published) {
          expect(sourcePrompt.published_in_standard_practice).toBe(false)
          expect(pack.practiceBank!.some(item => item.id === sourcePrompt.id)).toBe(false)
        }
      }
      const q21 = pack.practiceBank!.find(item => item.batch === '3.7' && item.id === 'q21')
      expect(q21?.question.family).toBe('MCQ')
      expect(bankRecordToPractice(q21!, 'strategic-position')?.type).toBe('multiple-choice')
      const written = pack.practiceBank!.find(item => item.batch === '3.7' && item.id === 'q31')
      expect(written?.question.family).toBe('DATA_RESPONSE')
      expect(written?.question.marks).toBe(9)
      expect(written?.target_item_ids).toContain('aqa-7132-3.7.1:swot-analysis')
    }
    const p1q7 = paper1.exams![0].questions.find(q => q.id === 'p1-q07')
    expect(p1q7?.marks).toBe(1)
    expect(p1q7?.prompt).toContain('external part of SWOT')
    const swot = rows371.find(row => row.requirement_candidate_id.endsWith('-011'))
    expect(swot?.exam_prep_candidates[0].scope).toContain('not-exam-competence-proof')
  })
})
