import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import source from '../../../audits/2026-10-30-aqa-business-7132-section-313-source-to-live.json'
import { businessExternalEnvironmentCases } from './shared/external-environment-mcq-practice'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'

const packs = [paper1, paper2, paper3]
const ids = businessExternalEnvironmentCases.map(item => `rev7132-3.1.3-${item.id}`)

describe('Issue #698 Business §3.1.3 real published external-environment Practice', () => {
  it('preserves a bounded source inventory and never promotes tagged content to full adequacy', () => {
    expect(source.source_section).toBe('3.1.3')
    expect(source.printed_page).toBe(13)
    expect(source.pdf_page_index).toBe(12)
    expect(source.source_rights).toBe('REFERENCE_ONLY')
    expect(source.original_uploaded_sha256_parity_verified).toBe(false)
    expect(source.items).toHaveLength(14)
    expect(new Set(source.items.map(item => item.atomic_id)).size).toBe(14)
    expect(source.items.every(item => item.teaching_adequacy === 'unverified'
      && item.written_application_assessment === 'unverified'
      && item.real_signed_in_acceptance === 'unverified')).toBe(true)
    expect(source.items.filter(item => item.atomic_id.includes('fair-trade'))).toHaveLength(2)
  })

  it('publishes explicit fair-trade cost-versus-demand teaching in the existing lesson on all three paper packs', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(g => g.pages))
      const matches = pages.filter(page => page.id === 'bus-fnd-009')
      expect(matches).toHaveLength(1)
      const page = matches[0]!
      expect(page.topicId).toBe('business')
      const section = page.blocks.find(b => b.type === 'explanation'
        && b.heading === 'Environmental issues and fair trade: costs and demand are different questions')
      expect(section?.type).toBe('explanation')
      if (section?.type === 'explanation') {
        const body = section.paragraphs.join(' ')
        expect(body).toContain('Fair trade concerns producer terms')
        expect(body).toContain('may fall unless')
        expect(body).toContain('price-sensitive customers')
      }
      expect(page.blocks.some(b => b.type === 'key-idea' && b.definitions.some(t => t.term === 'fair trade'))).toBe(true)
    }
  })

  it('scores six distinct original, source-attributed single-option questions from the actual Practice pool', () => {
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(q => q.namespace === 'rev7132' && q.batch === '3.1.3')
      expect(records).toHaveLength(6)
      expect(records.map(bankQuestionId)).toEqual(ids)
      expect(new Set(ids).size).toBe(6)
      const pool = buildQuestionPool({ topicId: 'business', topicOrder: 1, coursePack: pack.questions, bank: pack.practiceBank })
      for (const [i, id] of ids.entries()) {
        const q = pool.find(item => item.id === id)
        expect(q?.type).toBe('multiple-choice')
        if (!q || q.type !== 'multiple-choice') continue
        const sourceCase = businessExternalEnvironmentCases[i]!
        expect(q.correctOption).toBe(sourceCase.correct)
        expect(q.options.map(o => o.text)).toEqual([...sourceCase.choices])
        expect(q.options.every((o, idx) => idx === q.correctOption || (o.why?.length ?? 0) > 10)).toBe(true)
        expect(q.specItemIds).toEqual([sourceCase.target])
        expect(q.nodeIds).toEqual(['bus-fnd-009'])
        const mapping = objectiveItemMappingForPractice(q)
        expect(mapping?.singleTargetSpecItemId).toBe(sourceCase.target)
        expect(mapping?.targetNodeIds).toEqual(['bus-fnd-009'])
      }
    }
  })

  it('keeps two environmental/fair-trade cases independent while not claiming full written reasoning', () => {
    const first = businessExternalEnvironmentCases[0]!
    const second = businessExternalEnvironmentCases[1]!
    expect(first.context).not.toBe(second.context)
    expect(first.prompt).not.toBe(second.prompt)
    expect(first.correct).not.toBe(second.correct)
    expect(first.target).toBe(second.target)
    expect(source.items.find(x => x.atomic_id === 'aqa7132-313-fair-trade-demand')?.written_application_assessment).toBe('unverified')
    expect(source.items.find(x => x.atomic_id === 'aqa7132-313-environmental-issues-costs')?.real_signed_in_acceptance).toBe('unverified')
  })
})
