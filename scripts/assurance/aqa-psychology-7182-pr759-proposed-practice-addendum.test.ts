import { describe, expect, it } from 'vitest'
import originalMaths from './data/aqa-psychology-7182-maths-annex-source-review.json'
import originalScope from './data/aqa-psychology-7182-source-first-review.json'
import proposed from './data/aqa-psychology-7182-pr759-proposed-practice-addendum.json'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { bankQuestionId, bankRecordToPractice } from '../../src/app/practice-questions'

describe('Issue #698 PR759 — proposed source-to-Practice addendum without rewriting original audit baselines', () => {
  it('keeps earlier source first and maths annex audit snapshots historically unverified', () => {
    expect(originalMaths.atoms.find(a => a.id === 'PSY-MATH-72-24')?.publishedCandidateAssets).toEqual([])
    expect(originalMaths.atoms.find(a => a.id === 'PSY-MATH-72-32')?.publishedCandidateAssets).toEqual([])
    expect(originalScope.inferential_review.atoms.find(a => a.id === 'PSY-SRC-4233-IT05')?.candidate_practice_question_ids).toEqual([])
    expect(proposed.status).toContain('NOT_LIVE')
    expect(proposed.qualification.pdfSha256).toBe(originalMaths.qualification.pdfSha256)
    expect(proposed.qualification.rights).toBe('REFERENCE_ONLY')
    expect(proposed.mapping.every(x => x.assurance === 'unverified' && x.liveAcceptance === false)).toBe(true)
  })
  it('identifies each proposed asset actually assembled in all three content packs without claiming skill mastery', () => {
    expect(proposed.mapping).toHaveLength(3)
    for(const pack of [paper1,paper2,paper3]){
      const scored = new Map((pack.practiceBank ?? []).map(record => [bankQuestionId(record),record]))
      const drills = new Set(pack.dataDrills.map(drill => drill.id))
      for(const entry of proposed.mapping){
        for(const id of entry.candidateIds){
          if(entry.evidenceMode.startsWith('scored')){
            const item=scored.get(id)
            expect(item,id).toBeDefined()
            expect(item?.target_item_ids).toEqual([entry.sourceAtom])
            const practice=bankRecordToPractice(item!,'research-methods')
            expect(practice?.type).toBe('calculation')
            if(practice?.type === 'calculation') expect(practice.marks).toBe(1)
          }else{
            expect(drills.has(id),id).toBe(true)
            expect(scored.has(id),id).toBe(false)
          }
        }
      }
    }
  })
})
