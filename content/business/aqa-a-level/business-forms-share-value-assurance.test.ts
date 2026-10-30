import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import scoped from '../../audits/2026-10-30-aqa-business-7132-section-312-source-to-live.json'

const packs = [paper1, paper2, paper3] as const
const page = (pack: (typeof packs)[number], id: string) => pack.learn!.chapters
  .flatMap(chapter => chapter.groups.flatMap(group => group.pages))
  .find(candidate => candidate.id === id)

describe('Issue #698: AQA 7132 v2.0 §3.1.2 source-scoped ownership and share-price teaching', () => {
  it('keeps an honest, section-only independently enumerated reference inventory', () => {
    expect(scoped.source_section).toBe('3.1.2')
    expect(scoped.source_printed_page).toBe(12)
    expect(scoped.count).toBe(scoped.items.length)
    expect(scoped.count).toBe(19)
    expect(new Set(scoped.items.map(x => x.atomic_id)).size).toBe(19)
    expect(scoped.source_rights).toBe('REFERENCE_ONLY')
    expect(scoped.original_uploaded_sha_verified).toBe(false)
    expect(scoped.items.every(x => x.teaching_adequacy === 'unverified'
      && x.independently_scored_assessment === 'unverified'
      && x.authenticated_learner_acceptance === 'unverified')).toBe(true)
  })

  it('publishes explicit share-value, investor-return and share-price reasoning in the actual Business Learn packs', () => {
    for (const pack of packs) {
      const forms = page(pack, 'bus-fnd-003')
      const price = page(pack, 'bus-fnd-004')
      expect(forms?.topicId).toBe('business')
      expect(price?.topicId).toBe('business')
      const marketBlock = forms?.blocks.find(block => block.type === 'explanation'
        && block.heading === 'Ordinary shares, dividends and market capitalisation')
      const causes = price?.blocks.find(block => block.type === 'explanation'
        && block.heading === 'Why quoted share prices change')
      const effects = price?.blocks.find(block => block.type === 'explanation'
        && block.heading === 'What a share-price change means for a business')
      expect(marketBlock?.type).toBe('explanation')
      expect(causes?.type).toBe('explanation')
      expect(effects?.type).toBe('explanation')
      if (marketBlock?.type !== 'explanation' || causes?.type !== 'explanation'
          || effects?.type !== 'explanation') continue
      expect(marketBlock.paragraphs.join(' ')).toContain('£7 million')
      expect(marketBlock.paragraphs.join(' ')).toContain('£120')
      expect(causes.paragraphs.join(' ')).toContain('interest rates')
      expect(causes.paragraphs.join(' ')).toContain('rising costs')
      expect(effects.paragraphs.join(' ')).toContain('has not itself paid out £2 million')
      expect(effects.paragraphs.join(' ')).toContain('takeover vulnerability')
      expect(forms?.blocks.some(block => block.type === 'key-idea'
        && block.definitions.some(t => t.term === 'market capitalisation'
          && t.definition.includes('not the company')))).toBe(true)
    }
  })

  it('checks each independent original numerical illustration without treating it as scored assessment', () => {
    expect(2_000_000 * 3.5).toBe(7_000_000)
    expect(2_000_000 * 2.8).toBe(5_600_000)
    expect(1_000 * 0.12).toBe(120)
    expect(4_000_000 * 5).toBe(20_000_000)
    expect(4_000_000 * 4.5).toBe(18_000_000)
    expect(scoped.items.find(x => x.atomic_id.endsWith('share-price-significance'))
      ?.independently_scored_assessment).toBe('unverified')
  })
})
