import { describe, expect, it } from 'vitest'
import review from './data/aqa-business-7132-sections-31-32-atomic-review.json'
import source from './data/aqa-business-7132-official-source-baseline.json'
import legacy from '../../research/aqa-business-7132/2027/NAMED_ITEMS.json'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { bankQuestionId, bankRecordToPractice } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const
const atoms = review.sections.flatMap(s => s.atoms)
const officialSectionIds = new Set(source.sections.map(s => s.section_id))
const sourceCheckpoints = new Set(source.sections.flatMap(s => s.checkpoints.map(c => c.id)))
const legacyIds = new Set(legacy.items.map(i => i.id))

function observedCandidateSupply(pack: (typeof packs)[number]) {
  const pages = new Set(pack.learn!.chapters.flatMap(ch => ch.groups.flatMap(g => g.pages.map(p => p.id))))
  return atoms.map(atom => {
    const target = atom.legacy_candidate_spec_item_id
    const tagged = target ? pack.practiceBank!.filter(record => record.target_item_ids.includes(target)) : []
    const scored = tagged.flatMap(record => {
      if (record.target_item_ids.length !== 1 || record.target_item_ids[0] !== target) return []
      const question = bankRecordToPractice(record, record.topic_id ?? 'business')
      return question && (question.type === 'multiple-choice' || question.type === 'calculation')
        ? [question.id] : []
    })
    return {
      atomId: atom.id,
      sourceSection: atom.source_section,
      referenceCheckpointId: atom.reference_checkpoint_id,
      legacyTag: target,
      candidateLearnPageId: atom.candidate_learn_page_id,
      candidatePageExistsInPublishedPack: atom.candidate_learn_page_id ? pages.has(atom.candidate_learn_page_id) : null,
      taggedPublishedQuestionIds: [...new Set(tagged.map(bankQuestionId))].sort(),
      independentlySoftwareScoredSingleTargetQuestionIds: [...new Set(scored)].sort(),
      evidenceClass: 'PUBLISHED-SUPPLY-ONLY' as const,
      sourceByteParity: false as const,
      teachingAdequacy: 'unverified' as const,
      examinationAdequacy: 'unverified' as const,
      realLearnerAcceptance: 'unverified' as const,
    }
  })
}

describe('Issue #698: source-first Business 7132 detailed review for §§3.1.1–3.2.3', () => {
  it('records independent, specifically bounded source-derived atoms with explicit unresolved obligations', () => {
    expect(review.version).toBe('AQA 7132 v2.0, 14 June 2023')
    expect(review.source_rights).toBe('REFERENCE_ONLY')
    expect(review.founder_upload_byte_parity_verified).toBe(false)
    expect(review.sections.map(s => s.section_id)).toEqual([
      '3.1.1','3.1.2','3.1.3','3.2.1','3.2.2','3.2.3',
    ])
    expect(atoms).toHaveLength(80)
    expect(new Set(atoms.map(a => a.id)).size).toBe(80)
    for (const section of review.sections) {
      expect(officialSectionIds.has(section.section_id)).toBe(true)
      expect(section.printed_page).toBe(source.sections.find(s => s.section_id === section.section_id)?.printed_page)
      for (const atom of section.atoms) {
        expect(atom.source_section).toBe(section.section_id)
        expect(atom.printed_page).toBe(section.printed_page)
        expect(atom.reference_checkpoint_id === null || sourceCheckpoints.has(atom.reference_checkpoint_id)).toBe(true)
        expect(atom.legacy_candidate_spec_item_id === null || legacyIds.has(atom.legacy_candidate_spec_item_id)).toBe(true)
        expect(atom.learner_adequacy).toBe('unverified')
        expect(atom.scored_practice_adequacy).toBe('unverified')
        expect(atom.exam_prep_adequacy).toBe('unverified')
        expect(atom.signed_in_learner_acceptance).toBe('unverified')
      }
    }
    expect(atoms.find(a => a.id === 'BUS7132-ATOM-3.1.2-ownership-mission')?.reference_checkpoint_id).toBeNull()
    expect(atoms.find(a => a.id === 'BUS7132-ATOM-3.1.1-importance-profit')?.legacy_candidate_spec_item_id).toBeNull()
    expect(source.sections).toHaveLength(42)
    expect(review.sections).toHaveLength(6) // NOT 42/42 or an independently reviewed whole course
  })

  it('tests the actual three published paper packs, not the unshipped source files', () => {
    const first = observedCandidateSupply(paper1)
    for (const pack of packs) {
      const current = observedCandidateSupply(pack)
      expect(current).toHaveLength(80)
      expect(current).toEqual(first)
      expect(current.every(r => r.evidenceClass === 'PUBLISHED-SUPPLY-ONLY'
        && r.teachingAdequacy === 'unverified' && r.examinationAdequacy === 'unverified'
        && r.realLearnerAcceptance === 'unverified')).toBe(true)
      expect(current.filter(r => r.candidateLearnPageId !== null)
        .every(r => r.candidatePageExistsInPublishedPack)).toBe(true)
      const expected = current.find(r => r.atomId === 'BUS7132-ATOM-3.2.2-expected-value')
      const net = current.find(r => r.atomId === 'BUS7132-ATOM-3.2.2-net-gain')
      expect(expected?.independentlySoftwareScoredSingleTargetQuestionIds)
        .toEqual(expect.arrayContaining([
          'rev7132-3.2.2-expected-value-01','rev7132-3.2.2-expected-value-02',
        ]))
      expect(net?.independentlySoftwareScoredSingleTargetQuestionIds)
        .toEqual(expect.arrayContaining([
          'rev7132-3.2.2-net-gain-01','rev7132-3.2.2-net-gain-02',
        ]))
      expect(current.find(r => r.atomId === 'BUS7132-ATOM-3.1.1-importance-profit')
        ?.independentlySoftwareScoredSingleTargetQuestionIds).toEqual([])
    }
  })

  it('emits a machine-readable source-first prioritisation queue with no pass rates or claimed mastery', () => {
    const rows = observedCandidateSupply(paper1)
    const report = {
      state: 'PARTIAL SIX-SECTION REVIEW; NOT WHOLE-COURSE ATOMIC COMPLETENESS OR EDUCATIONAL SIGN-OFF',
      version: review.version,
      totalOfficialSections: source.sections.length,
      sectionsReviewedInThisPackage: review.sections.length,
      candidateAtomsReviewedInThisPackage: rows.length,
      uploadedPdfHashVerified: false,
      teachingAndExamAdequacyVerified: false,
      authenticatedLearnerAcceptanceVerified: false,
      rows,
    }
    expect(report.totalOfficialSections).toBe(42)
    expect(report.sectionsReviewedInThisPackage).toBe(6)
    expect(report.teachingAndExamAdequacyVerified).toBe(false)
    expect(report.rows.every(r => r.sourceByteParity === false)).toBe(true)
    console.info('REVISION_BUSINESS_31_32_SOURCE_TO_PUBLISHED_CANDIDATES=' + JSON.stringify(report))
  })
})
