import { describe, expect, it } from 'vitest'
import review from './data/aqa-business-7132-sections-33-36-atomic-review.json'
import source from './data/aqa-business-7132-official-source-baseline.json'
import legacy from '../../research/aqa-business-7132/2027/NAMED_ITEMS.json'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { bankRecordToPractice, bankQuestionId } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const
const reviewAtoms = review.sections.flatMap(s => s.atoms)
const sectionsInBaseline = new Map(source.sections.map(s => [s.section_id, s]))

function sectionSupply(pack: (typeof packs)[number]) {
  const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
  const pageIds = new Set(pages.map(page => page.id))
  return review.sections.map(section => {
    const historicalCandidates = legacy.items.filter(row => row.section === section.section_id)
    const legacyIds = new Set(historicalCandidates.map(row => row.id))
    const records = pack.practiceBank!.filter(record => record.target_item_ids.some(id => legacyIds.has(id)))
    const taggedNodes = [...new Set(records.flatMap(record => record.target_node_ids))]
    const inPublishedLearn = taggedNodes.filter(id => pageIds.has(id)).sort()
    const scoreableBySection = records.flatMap(record => {
      if (record.target_item_ids.length !== 1) return []
      const q = bankRecordToPractice(record, record.topic_id ?? 'business')
      return q && (q.type === 'multiple-choice' || q.type === 'calculation')
        ? [q.id] : []
    })
    const otherBank = records.flatMap(record => {
      const q = bankRecordToPractice(record, record.topic_id ?? 'business')
      return !q || q.type === 'written' || record.target_item_ids.length !== 1
        ? [bankQuestionId(record)] : []
    })
    return {
      section_id: section.section_id,
      provisionalAtomCount: section.atoms.length,
      legacyKeywordRows: historicalCandidates.length,
      candidateLearnPageIds: inPublishedLearn,
      bankTaggedSourceSectionQuestionIds: [...new Set(records.map(bankQuestionId))].sort(),
      singleTargetSoftwareScoreableSectionQuestionIds: [...new Set(scoreableBySection)].sort(),
      unscoredOrMultiTargetSectionQuestionIds: [...new Set(otherBank)].sort(),
      // These IDs are not linked to the individual atomic skill by a
      // qualified source/evidence review. No per-atom credit is assigned.
      perAtomSkillAssessmentValidated: false as const,
      sourceCompletenessValidated: false as const,
      educationalAdequacyValidated: false as const,
      realSignedInLearnerAccepted: false as const,
    }
  })
}

describe('Issue #698 AQA Business v2.0 source-first §§3.3–3.6 candidate atoms', () => {
  it('decomposes 18 real official subsections into 220 distinct separately observable tasks', () => {
    expect(review.version).toBe('2.0 14 June 2023')
    expect(review.rights).toBe('REFERENCE_ONLY')
    expect(review.pdf_actual_pages).toBe(42)
    expect(review.founder_upload_sha_verified).toBe(false)
    expect(source.sections).toHaveLength(42)
    expect(review.sections.map(s => s.section_id)).toEqual([
      '3.3.1','3.3.2','3.3.3','3.3.4',
      '3.4.1','3.4.2','3.4.3','3.4.4','3.4.5',
      '3.5.1','3.5.2','3.5.3','3.5.4',
      '3.6.1','3.6.2','3.6.3','3.6.4','3.6.5',
    ])
    expect(reviewAtoms).toHaveLength(220)
    expect(new Set(reviewAtoms.map(a => a.id)).size).toBe(220)
    for (const section of review.sections) {
      expect(sectionsInBaseline.has(section.section_id)).toBe(true)
      expect(section.printed_page).toBe(sectionsInBaseline.get(section.section_id)!.printed_page)
      expect(section.atomicity_status).toBe('candidate-not-complete')
      expect(section.atoms.length).toBeGreaterThan(0)
      for (const atom of section.atoms) {
        expect(atom.source_section).toBe(section.section_id)
        expect(atom.printed_page).toBe(section.printed_page)
        expect(atom.observable_skill).toMatch(/\w+ \w+/)
        expect(atom.legacy_candidate_mapping).toBe('unreviewed')
        expect(atom.teaching_adequacy).toBe('unverified')
        expect(atom.practice_adequacy).toBe('unverified')
        expect(atom.exam_adequacy).toBe('unverified')
        expect(atom.signed_in_acceptance).toBe('unverified')
      }
    }
  })

  it('separates calculate versus interpret, and graphical construction versus numeric final answer', () => {
    const sections = new Map(review.sections.map(s => [s.section_id, s.atoms]))
    const text = (id: string) => sections.get(id)!.map(a => a.observable_skill)
    expect(text('3.3.2')).toContain('interpret price elasticity values without calculating elasticity')
    expect(text('3.3.2')).toContain('interpret income elasticity values without calculating elasticity')
    expect(text('3.4.2')).toEqual(expect.arrayContaining([
      'calculate labour productivity','interpret labour productivity',
      'calculate capacity utilisation','interpret capacity utilisation',
    ]))
    expect(text('3.5.2')).toEqual(expect.arrayContaining([
      'construct break-even chart','interpret break-even chart',
      'calculate margin of safety','illustrate price change on break-even chart',
      'construct cash flow forecast','calculate gross profit margin',
    ]))
    expect(text('3.6.2')).toEqual(expect.arrayContaining([
      'calculate labour turnover','interpret labour turnover',
      'calculate labour cost per unit','interpret labour cost per unit',
    ]))
    expect(text('3.6.3')).toContain('evaluate decentralisation')
    expect(text('3.6.4')).toContain('apply Herzberg motivation')
  })

  it('observes the actual three Business paper ContentPacks without assigning unsupported atom mastery', () => {
    const first = sectionSupply(paper1)
    expect(first).toHaveLength(18)
    for (const pack of packs) {
      const actual = sectionSupply(pack)
      expect(actual).toEqual(first)
      expect(actual.every(row => row.perAtomSkillAssessmentValidated === false
        && row.educationalAdequacyValidated === false
        && row.realSignedInLearnerAccepted === false)).toBe(true)
    }
    expect(first.some(row => row.bankTaggedSourceSectionQuestionIds.length > 0)).toBe(true)
    expect(first.some(row => row.candidateLearnPageIds.length > 0)).toBe(true)
    const finance = first.find(row => row.section_id === '3.5.2')
    expect(finance?.legacyKeywordRows).toBeGreaterThan(10)
    // Original construction drills are DataDrills with answer reveal, so
    // they do not themselves demonstrate scored chart/table construction.
    expect(paper1.dataDrills!.some(x => x.id === 'rev7132-35-budget-construction-01')).toBe(true)
    expect(paper1.dataDrills!.some(x => x.id === 'rev7132-35-cashflow-construction-01')).toBe(true)
  })

  it('exports an explicitly incomplete, source-first 18-section candidate report', () => {
    const rows = sectionSupply(paper1)
    const report = {
      status: 'CANDIDATE 18 OF 42 SECTIONS; NOT COMPLETE ATOMIC SOURCE UNIVERSE',
      source: review.source_ref,
      officialSections: source.sections.length,
      reviewedSections: review.sections.length,
      candidateAtoms: reviewAtoms.length,
      exactFounderUploadedPdfShaVerified: false,
      sourceComplete: false,
      teachingAndAssessmentAdequate: false,
      authenticatedLearnerAcceptance: false,
      mappedIndividualAtomEvidence: false,
      urgentSkillsToAssessIndependently: reviewAtoms
        .filter(atom => atom.observable_mode === 'construct' || atom.observable_mode === 'illustrate')
        .map(atom => atom.id),
      sections: rows,
      atomicCandidates: reviewAtoms,
    }
    expect(report.candidateAtoms).toBe(220)
    expect(report.mappedIndividualAtomEvidence).toBe(false)
    expect(report.sections.every(row => !row.perAtomSkillAssessmentValidated)).toBe(true)
    console.info('REVISION_BUSINESS_33_36_SOURCE_REVIEW=' + JSON.stringify(report))
  })
})
