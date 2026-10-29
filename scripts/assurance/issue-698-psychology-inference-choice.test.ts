import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { psychologyCourseTruthTopics, psychologyQuestions } from '../../content/psychology/aqa-a-level/shared/course'
import { psychologyResearchMethodsAppliedQuestions, psychologyResearchMethodsAppliedDrills } from '../../content/psychology/aqa-a-level/shared/research-methods-practice'
import { psychologyInferenceChoiceQuestions, psychologyInferenceChoiceDrills, psychologyInferenceChoiceRequirementBindings } from '../../content/psychology/aqa-a-level/shared/inferential-choice-practice'
import { coursePackQuestionToPractice } from '../../src/app/practice-questions'

const specs=JSON.parse(readFileSync('research/specification-to-learner/aqa-2027-source-manifest.json','utf8')) as {courses:Array<{specification_code:string,pdf_sha256:string}>}
const expected={"psy-rm-select-spearman-01":1,"psy-rm-select-pearson-01":3,"psy-rm-select-wilcoxon-01":1,"psy-rm-select-mann-whitney-01":2,"psy-rm-select-related-t-01":1,"psy-rm-select-unrelated-t-01":2,"psy-rm-select-chi-squared-01":3,"psy-rm-type-i-error-01":0,"psy-rm-type-ii-error-01":0}

describe('Issue #698: original AQA 7182 inferential test-choice and error practice', () => {
  it('uses the existing pinned specification and actual 118 Course Truth obligations',()=>{
    expect(specs.courses.find(x=>x.specification_code==='7182')?.pdf_sha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    const known=new Set(psychologyCourseTruthTopics.flatMap(t=>t.requirements.map(r=>r.requirementId)))
    expect(known.has('PSY-07-33')).toBe(true)
    expect(known.has('PSY-07-34')).toBe(true)
    expect(Object.keys(psychologyInferenceChoiceRequirementBindings).sort()).toEqual(
      [...psychologyInferenceChoiceQuestions,...psychologyInferenceChoiceDrills].map(a=>a.id).sort(),
    )
    for(const ids of Object.values(psychologyInferenceChoiceRequirementBindings)) for(const id of ids) expect(known.has(id),id).toBe(true)
  })
  it('covers each of the seven named decision options plus both inference-error meanings with original distinct scored choices',()=>{
    expect(psychologyInferenceChoiceQuestions).toHaveLength(9)
    expect(new Set(psychologyInferenceChoiceQuestions.map(q=>q.id)).size).toBe(9)
    const choices=new Set<number>()
    for(const question of psychologyInferenceChoiceQuestions){
      expect(question.topic).toBe('research-methods')
      expect(question.prompt).toMatch(/^Revision-original practice\./)
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options).size).toBe(4)
      expect(question.explanation.length).toBeGreaterThan(70)
      expect(question.correctOption).toBe(expected[question.id as keyof typeof expected])
      choices.add(question.correctOption)
      const scored=coursePackQuestionToPractice(question)
      expect(scored.type).toBe('multiple-choice')
      expect(scored.correctOption).toBe(question.correctOption)
    }
    expect(choices).toEqual(new Set([0,1,2,3]))
  })
  it('reaches the real published three pack adapters without dropping previous identity or paper structure',()=>{
    expect(psychologyInferenceChoiceDrills).toHaveLength(1)
    for(const pack of [paper1,paper2,paper3]){
      expect(pack.questions).toHaveLength(131)
      expect(pack.dataDrills).toHaveLength(16)
      expect(new Set(pack.questions.map(q=>q.id)).size).toBe(131)
      for(const old of [...psychologyQuestions,...psychologyResearchMethodsAppliedQuestions]){
        expect(pack.questions.find(q=>q.id===old.id),old.id).toEqual(old)
      }
      for(const old of psychologyResearchMethodsAppliedDrills){
        expect(pack.dataDrills.find(q=>q.id===old.id),old.id).toEqual(old)
      }
      for(const q of psychologyInferenceChoiceQuestions) expect(pack.questions.find(x=>x.id===q.id),q.id).toEqual(q)
      for(const q of psychologyInferenceChoiceDrills) expect(pack.dataDrills.find(x=>x.id===q.id),q.id).toEqual(q)
      expect(pack.exams[0]?.totalMarks).toBe(pack.manifest.paper.totalMarks)
      expect(pack.exams[0]?.questions.some(q=>q.id.startsWith('psy-rm-select-'))).toBe(false)
    }
  })
  it('does not overstate written reasoning or independently marked skill',()=>{
    expect(psychologyInferenceChoiceDrills[0].prompt).toMatch(/On paper/)
    expect(psychologyInferenceChoiceDrills[0].answer).toContain('Only sign-test calculations')
    expect(psychologyInferenceChoiceRequirementBindings['psy-rm-type-i-error-01']).toEqual(['PSY-07-33'])
    expect(psychologyInferenceChoiceRequirementBindings['psy-rm-select-chi-squared-01']).toEqual(['PSY-07-34'])
  })
})
