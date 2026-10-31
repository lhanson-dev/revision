import { describe, expect, it } from 'vitest'
import review from './data/aqa-psychology-7182-source-first-review.json'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { bankQuestionId } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3]

describe('Issue #698 — source-first AQA Psychology 7182 v1.4 review baseline', () => {
  it('retains original Founder source identity and 8 compulsory/9 optional section map', () => {
    expect(review.source.sha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(review.source.version).toBe('1.4, 1 September 2025')
    expect(review.source.rights).toBe('REFERENCE_ONLY')
    expect(review.source.pdf_pages).toBe(38)
    expect(review.scope.topic_sections).toHaveLength(17)
    expect(new Set(review.scope.topic_sections.map(x=>x.section)).size).toBe(17)
    expect(review.scope.topic_sections.filter(x=>x.group==='compulsory')).toHaveLength(8)
    for (const g of ['group-1','group-2','group-3']) expect(review.scope.topic_sections.filter(x=>x.group===g)).toHaveLength(3)
    expect(review.paper_3.valid_combinations).toBe(27)
    for(const pack of packs) {
      const published=new Set(pack.topics.map(x=>x.id))
      expect(published.size).toBe(17)
      expect(review.scope.topic_sections.every(section=>published.has(section.topicId))).toBe(true)
    }
  })

  it('separates the 17 first-pass inferential capabilities instead of treating three prototype records as a verified denominator', () => {
    const atoms=review.inferential_review.atoms
    expect(review.inferential_review.section).toBe('4.2.3.3')
    expect(review.inferential_review.printedPage).toBe(21)
    expect(atoms).toHaveLength(17)
    expect(new Set(atoms.map(x=>x.id)).size).toBe(17)
    expect(new Set(atoms.map(x=>x.learner_requirement_candidate_id))).toEqual(new Set(['PSY-07-32','PSY-07-33','PSY-07-34']))
    const actualPages=new Set(paper2.learn!.chapters.flatMap(ch=>ch.groups.flatMap(g=>g.pages)).map(p=>p.id))
    const publishedQuestions=new Set([...paper2.questions.map(x=>x.id), ...(paper2.practiceBank ?? []).map(bankQuestionId)])
    for(const atom of atoms){
      expect(actualPages.has(atom.candidate_learn_page_id),atom.id).toBe(true)
      for(const id of atom.candidate_practice_question_ids) expect(publishedQuestions.has(id),atom.id+':'+id).toBe(true)
      expect(atom.individual_requirement_scoring_verified).toBe(false)
      expect(atom.teaching_adequacy).toBe('unverified')
      expect(atom.practice_adequacy).toBe('unverified')
      expect(atom.exam_prep_adequacy).toBe('unverified')
      expect(atom.signed_in_learner_accepted).toBe(false)
    }
  })

  it('does not convert source sections or topic-level MCQs into educational or learner acceptance passes', () => {
    expect(review.scope.full_independent_atomic_inventory_complete).toBe(false)
    expect(review.scope.assessment_annex_reconciled).toBe(false)
    expect(Object.values(review.acceptance).every(v=>v===false)).toBe(true)
    expect(review.paper_3.real_selection_and_persistence_acceptance).toBe('unverified')
    const signChoice=review.inferential_review.atoms.find(x=>x.id==='PSY-SRC-4233-IT02')
    const probability=review.inferential_review.atoms.find(x=>x.id==='PSY-SRC-4233-IT04')
    // A question that specifies a sign test does not test independent test
    // selection, and a supplied-critical-value decision does not prove a
    // learner can explain probability and a significance threshold.
    expect(signChoice?.candidate_practice_question_ids).toEqual([])
    expect(probability?.candidate_practice_question_ids).toEqual([])
    const sign = review.inferential_review.atoms.find(x=>x.id==='PSY-SRC-4233-IT03')
    expect(sign?.required_independent_evidence_mode).toBe('typed-numeric-original')
    expect(sign?.candidate_practice_question_ids).toEqual([
      'psy-rm-applied-sign-test-01', 'rev7182-4.2.3-sign-test-01', 'rev7182-4.2.3-sign-test-02',
    ])
    for (const question of (paper2.practiceBank ?? []).filter(q=>q.id.startsWith('sign-test-'))) {
      expect(question.target_item_ids).toEqual(['PSY-SRC-4233-IT03'])
      expect(question.target_node_ids).toEqual(['research-methods-psy0732'])
    }
    // This original topic MCQ checks recognition of a statistical result; it
    // is not proof that written method or the new independent calculations
    // have actually been completed by an authenticated learner.
    expect(paper2.questions.find(x=>x.id==='psy-rm-applied-sign-test-01')).toBeDefined()
  })
})
