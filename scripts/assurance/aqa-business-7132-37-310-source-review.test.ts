import { describe, expect, it } from 'vitest'
import review from './data/aqa-business-7132-sections-37-310-atomic-review.json'
import source from './data/aqa-business-7132-official-source-baseline.json'
import legacy from '../../research/aqa-business-7132/2027/NAMED_ITEMS.json'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { bankRecordToPractice, bankQuestionId } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const
const atoms = review.sections.flatMap(s => s.atoms)
const official = new Map(source.sections.map(s => [s.section_id, s]))

function publishedSectionSupply(pack: (typeof packs)[number]) {
  const pageIds = new Set(pack.learn!.chapters.flatMap(ch => ch.groups.flatMap(g => g.pages.map(page => page.id))))
  return review.sections.map(section => {
    const candidates = legacy.items.filter(row => row.section === section.section_id)
    const ids = new Set(candidates.map(row => row.id))
    const bank = pack.practiceBank!.filter(row => row.target_item_ids.some(id => ids.has(id)))
    const oneTargetScored = bank.flatMap(row => {
      if (row.target_item_ids.length !== 1) return []
      const question = bankRecordToPractice(row, row.topic_id ?? 'business')
      return question && (question.type === 'multiple-choice' || question.type === 'calculation')
        ? [question.id] : []
    })
    return {
      section: section.section_id,
      aLevelOnly: true as const,
      candidateAtoms: section.atoms.length,
      oldKeywordRows: candidates.length,
      candidateLearnNodes: [...new Set(bank.flatMap(row => row.target_node_ids)
        .filter(id => pageIds.has(id)))].sort(),
      candidateBankQuestionIds: [...new Set(bank.map(bankQuestionId))].sort(),
      oneTargetSoftwareScoredQuestionIds: [...new Set(oneTargetScored)].sort(),
      atomToScoredAnswerVerified: false as const,
      independentEducationAdequacy: 'unverified' as const,
      realSiteLearnerAcceptance: 'unverified' as const,
    }
  })
}

describe('Issue #698 AQA 7132 A-level-only §3.7–3.10 source-first candidate review', () => {
  it('keeps 18 correct A-level-only source subsections and distinct skill needs', () => {
    expect(review.rights).toBe('REFERENCE_ONLY')
    expect(review.founder_upload_sha_parity_verified).toBe(false)
    expect(review.sections).toHaveLength(18)
    expect(atoms).toHaveLength(201)
    expect(new Set(atoms.map(a => a.id)).size).toBe(atoms.length)
    for (const section of review.sections) {
      expect(section.a_level_only).toBe(true)
      expect(official.get(section.section_id)?.printed_page).toBe(section.printed_page)
      expect(section.atomicity_status).toBe('candidate-not-complete')
      expect(section.atoms.length).toBeGreaterThan(0)
      for (const atom of section.atoms) {
        expect(atom.source_section).toBe(section.section_id)
        expect(atom.legacy_candidate_mapping).toBe('unreviewed')
        expect(atom.teaching_adequacy).toBe('unverified')
        expect(atom.practice_adequacy).toBe('unverified')
        expect(atom.exam_adequacy).toBe('unverified')
        expect(atom.signed_in_acceptance).toBe('unverified')
      }
    }
    expect(source.sections.length).toBe(42)
  })

  it('separates money calculations from appraisal and unmarked diagram construction', () => {
    const text=(section: string) => review.sections.find(s => s.section_id === section)?.atoms.map(a=>a.observable_skill) ?? []
    for (const skill of ['calculate payback period','interpret payback period','calculate average rate of return',
      'interpret average rate of return','calculate net present value','interpret net present value']) {
      expect(text('3.7.8')).toContain(skill)
    }
    for (const skill of ['interpret network diagram','amend network diagram',
      'identify critical path','calculate total float']) {
      expect(text('3.10.3')).toContain(skill)
    }
    for (const skill of ['evaluate forward vertical integration','evaluate backward vertical integration',
      'evaluate horizontal integration','evaluate conglomerate integration']) {
      expect(text('3.9.1')).toContain(skill)
    }
  })

  it('reads actual three published packs and preserves non-attributable candidate supply boundaries', () => {
    const first=publishedSectionSupply(paper1)
    expect(first).toHaveLength(18)
    for (const pack of packs) {
      const rows=publishedSectionSupply(pack)
      expect(rows).toEqual(first)
      expect(rows.every(row => row.aLevelOnly && !row.atomToScoredAnswerVerified
        && row.independentEducationAdequacy === 'unverified'
        && row.realSiteLearnerAcceptance === 'unverified')).toBe(true)
    }
    expect(first.some(s=>s.candidateLearnNodes.length>0)).toBe(true)
    expect(first.some(s=>s.candidateBankQuestionIds.length>0)).toBe(true)
  })

  it('exports conditional source-to-published candidate report with no full-course mastery claims', () => {
    const report={
      state:'A-LEVEL-ONLY 18 SOURCE SECTIONS: CANDIDATES ONLY — NOT FINISHED ATOMIC AUDIT',
      source:review.source,
      sourceSections:source.sections.length,
      reviewedInThisPackage:review.sections.length,
      candidateSkills:atoms.length,
      totalAqaSkillDenominatorVerified:false,
      exactUploadedSourceHashVerified:false,
      liveSkillAdequacyEstablished:false,
      realLearnerAcceptanceEstablished:false,
      sections:publishedSectionSupply(paper1),
      atomicCandidates:atoms,
    }
    expect(report.sourceSections).toBe(42)
    expect(report.candidateSkills).toBe(201)
    expect(report.totalAqaSkillDenominatorVerified).toBe(false)
    console.info('REVISION_BUSINESS_ALEVEL_SOURCE_REVIEW='+JSON.stringify(report))
  })
})
