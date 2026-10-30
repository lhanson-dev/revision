import { describe, expect, it } from 'vitest'
import source from './data/aqa-business-7132-official-source-baseline.json'
import previous from '../../research/aqa-business-7132/2027/NAMED_ITEMS.json'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { bankRecordToPractice, bankQuestionId } from '../../src/app/practice-questions'

const papers = [paper1, paper2, paper3] as const
const sections = source.sections
const sectionIds = new Set(sections.map(x => x.section_id))
const checkpoints = sections.flatMap(x => x.checkpoints)
const previousRows = previous.items

type PreviousItem = (typeof previousRows)[number]

function sectionCandidateEvidence(section: string) {
  // Each published bank target is an *unassured* candidate for this SECTION;
  // one target may conflate several separately required cognitive abilities.
  const records = paper1.practiceBank!.filter(row => row.target_item_ids.some(id =>
    id.startsWith(`aqa-7132-${section}:`) || id.startsWith(`aqa-7132-${section}.`)))
  const allPages = paper1.learn!.chapters.flatMap(chapter =>
    chapter.groups.flatMap(group => group.pages))
  const indicatedNodes = new Set(records.flatMap(record => record.target_node_ids))
  const lessonPages = allPages.filter(page => indicatedNodes.has(page.id))
    .map(page => page.id)
  return {
    section_id: section,
    historicalNamedItems: previousRows.filter(row => row.section === section).length,
    sectionTaggedBankQuestions: records.map(row => bankQuestionId(row)),
    candidateLearnPagesFromBankNodeTags: [...new Set(lessonPages)].sort(),
    availableScoredQuestionIds: records.flatMap(row => {
      const q = bankRecordToPractice(row, row.topic_id ?? 'business')
      return q ? [q.id] : []
    }),
    // The same question can be present without independently marking each of
    // the section's source-first checkpoints or an examination response.
    sourceCheckpointAdequacy: 'unverified' as const,
    liveStudentAcceptance: 'unverified' as const,
  }
}

describe('Issue #698 — Business 7132 independent official-version section baseline', () => {
  it('retains 42 real source sections, 194 high-signal CHECKPOINTS without pretending complete atomisation', () => {
    expect(source.version).toBe('2.0 June 2023')
    expect(source.source_pages).toBe(42)
    expect(source.source_rights).toBe('REFERENCE_ONLY')
    expect(source.founder_uploaded_bytes_verified).toBe(false)
    expect(source.meaning).toContain('not fully atomic')
    expect(sections).toHaveLength(42)
    expect(sectionIds.size).toBe(42)
    expect(checkpoints).toHaveLength(194)
    expect(new Set(checkpoints.map(x => x.id)).size).toBe(checkpoints.length)
    expect(checkpoints.every(x => x.evidence === 'unverified')).toBe(true)
    for (const section of sections) {
      expect(section.printed_page).toBeGreaterThanOrEqual(11)
      expect(section.printed_page).toBeLessThanOrEqual(32)
      expect(section.pdf_page_index).toBe(section.printed_page - 1)
      expect(section.checkpoints.length).toBeGreaterThan(0)
      expect(section.checkpoints.every(x => x.parent_source_section === section.section_id)).toBe(true)
    }
    expect(source.annex_quantitative).toHaveLength(9)
    expect(source.assessment_objectives).toHaveLength(4)
    expect(source.a_level_exam_papers).toHaveLength(3)
    expect(source.cross_cutting).toHaveLength(7)
    expect(source.a_level_exam_papers.map(x => [x.paper, x.marks, x.minutes])).toEqual([
      [1, 100, 120], [2, 100, 120], [3, 100, 120],
    ])
  })

  it('compares the old 344 provisional keyword-matching records without accepting them as a new source denominator', () => {
    expect(previousRows).toHaveLength(344)
    const sectionsInPrevious = new Set(previousRows.map(row => row.section))
    expect([...sectionsInPrevious].sort()).toEqual([...sectionIds].sort())
    const conflated = previousRows.find(row =>
      row.id === 'aqa-7132-3.1.1:types-of-business-objective-profit-growth-survival-cash-flow')
    expect(conflated?.match).toEqual(['survival'])
    for (const label of ['profit objective', 'growth objective', 'survival objective', 'cash-flow objective']) {
      expect(sections.find(s => s.section_id === '3.1.1')?.checkpoints.some(c => c.description === label)).toBe(true)
    }
    // A count per legacy entry tells us nothing about teaching the separate
    // concepts or independently demonstrating competence.
    expect(source.annex_quantitative.every(item => item.assessment_adequacy === 'unverified')).toBe(true)
    expect(source.assessment_objectives.every(item => item.assessment_adequacy === 'unverified')).toBe(true)
  })

  it('observes exactly the same current standard Business packs and labels all section-level matching as candidates', () => {
    expect(papers).toHaveLength(3)
    for (const pack of papers) {
      expect(pack.practiceBank!.length).toBe(paper1.practiceBank!.length)
      expect(pack.learn!.chapters).toHaveLength(10)
    }
    const findings = sections.map(section => sectionCandidateEvidence(section.section_id))
    expect(findings).toHaveLength(42)
    expect(findings.every(row => row.sourceCheckpointAdequacy === 'unverified'
      && row.liveStudentAcceptance === 'unverified')).toBe(true)
    expect(findings.some(row => row.sectionTaggedBankQuestions.length > 0)).toBe(true)
    // No silent per-checkpoint match inferred from a whole-section question.
    const report = {
      status: 'SECTION-CHECKPOINT BASELINE ONLY — NOT EXHAUSTIVE ATOMIC SOURCE UNIVERSE',
      officialVersion: source.version,
      exactFounderUploadedPdfShaVerified: source.founder_uploaded_bytes_verified,
      historicKeywordMatchedNamedItems: previousRows.length,
      independentlySourceReviewedSections: sections.length,
      sourceFirstCheckpointsNeedingFullAtomicDecomposition: checkpoints.length,
      quantitativeAnnexChecks: source.annex_quantitative.length,
      assessmentObjectives: source.assessment_objectives.length,
      aLevelPaperShapes: source.a_level_exam_papers.length,
      crossCuttingChecks: source.cross_cutting.length,
      allAdequacyAndLiveAcceptanceUnverified: true,
      sections: findings,
    }
    console.info('REVISION_BUSINESS_SOURCE_FIRST_BASELINE=' + JSON.stringify(report))
  })
})
