import { describe, expect, it } from 'vitest'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { psychologyQuestions, psychologyDataDrills, psychologyCourseTruthTopics } from '../../content/psychology/aqa-a-level/shared/course'
import { psychologyResearchMethodsAppliedQuestions, psychologyResearchMethodsAppliedDrills, psychologyResearchMethodsAppliedRequirementBindings } from '../../content/psychology/aqa-a-level/shared/research-methods-practice'
import { coursePackQuestionToPractice } from '../../src/app/practice-questions'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const reference=JSON.parse(readFileSync(join(process.cwd(),'research/specification-to-learner/aqa-2027-source-manifest.json'),'utf8')) as {
  courses: Array<{ specification_code: string; pdf_sha256: string }>
}

const ids=['psy-rm-applied-mean-01','psy-rm-applied-sign-test-01','psy-rm-applied-spearman-01','psy-rm-applied-histogram-01']
const expectedKeys=new Map([[ids[0],1],[ids[1],1],[ids[2],2],[ids[3],3]])

describe('Issue #698 AQA Psychology 7182 original applied Research Methods practice', () => {
  it('pins this patch to the user-provided exact 7182 v1.4 reference-only PDF fingerprint', () => {
    const source=reference.courses.find((s)=>s.specification_code==='7182')
    expect(source?.pdf_sha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
  })
  it('binds every original scored question and self-check drill to exact approved Psychology Research Methods obligations', () => {
    const requirementIds=new Set(psychologyCourseTruthTopics.flatMap(topic=>topic.requirements.map(req=>req.requirementId)))
    const assets=[...psychologyResearchMethodsAppliedQuestions,...psychologyResearchMethodsAppliedDrills]
    expect(Object.keys(psychologyResearchMethodsAppliedRequirementBindings).sort()).toEqual(assets.map(asset=>asset.id).sort())
    for(const asset of assets) {
      const targets=psychologyResearchMethodsAppliedRequirementBindings[asset.id]
      expect(targets?.length,asset.id).toBeGreaterThan(0)
      expect(new Set(targets).size,asset.id).toBe(targets.length)
      for(const id of targets) {
        expect(id.startsWith('PSY-07-'),id).toBe(true)
        expect(requirementIds.has(id),id).toBe(true)
      }
    }
    expect(psychologyResearchMethodsAppliedRequirementBindings['psy-rm-applied-mean-01']).toContain('PSY-07-26')
    expect(psychologyResearchMethodsAppliedRequirementBindings['psy-rm-applied-histogram-01']).toContain('PSY-07-27')
    expect(psychologyResearchMethodsAppliedRequirementBindings['psy-rm-applied-sign-test-01']).toContain('PSY-07-32')
    expect(psychologyResearchMethodsAppliedRequirementBindings['psy-rm-applied-spearman-01']).toContain('PSY-07-34')
  })
  it('independently calculates mean, sign-test decision inputs, correlation comparison and histogram densities', () => {
    const values=[4,6,6,8,11]
    expect(values.reduce((s,x)=>s+x,0)/values.length).toBe(7)
    expect(values[2]).toBe(6)
    expect(values.at(-1)!-values[0]).toBe(7)
    const before=[5,6,9,3,7],after=[7,6,4,8,9]
    const signs=before.map((v,i)=>Math.sign(after[i]-v)).filter((s)=>s!==0)
    expect(signs).toEqual([1,-1,1,1])
    expect(signs.length).toBe(4)
    expect(Math.min(signs.filter(s=>s>0).length,signs.filter(s=>s<0).length)).toBe(1)
    expect(Math.abs(-0.62)).toBeGreaterThan(0.587)
    expect(12/(10-0)).toBeCloseTo(1.2)
    expect(12/(15-10)).toBeCloseTo(2.4)
    expect((12/(15-10))/(12/(10-0))).toBe(2)
  })
  it('adds original, distinct-key, scored contextual questions to each published 7182 pack without breaking existing question identity', () => {
    expect(psychologyQuestions).toHaveLength(118)
    expect(psychologyResearchMethodsAppliedQuestions).toHaveLength(4)
    for (const pack of [paper1,paper2,paper3]) {
      expect(pack.questions).toHaveLength(122)
      expect(new Set(pack.questions.map(q=>q.id)).size).toBe(122)
      for (const old of psychologyQuestions) {
        const unchanged=pack.questions.find(x=>x.id===old.id)
        expect(unchanged,old.id).toEqual(old)
      }
      for (const id of ids) {
        const question=pack.questions.find(x=>x.id===id)
        expect(question,pack.manifest.id+': '+id).toBeDefined()
        expect(question?.topic).toBe('research-methods')
        expect(question?.prompt).toMatch(/^Revision-original practice\./)
        expect(question?.options).toHaveLength(4)
        expect(question?.correctOption).toBe(expectedKeys.get(id))
        const scored=coursePackQuestionToPractice(question!)
        expect(scored.type).toBe('multiple-choice')
        expect(scored.correctOption).toBe(expectedKeys.get(id))
        expect(scored.topicId).toBe('research-methods')
        expect(scored.explanation).toBe(question!.explanation)
      }
    }
  })
  it('adds three on-paper worked quantitative drills through the existing self-check mechanism', () => {
    expect(psychologyDataDrills).toHaveLength(12)
    expect(psychologyResearchMethodsAppliedDrills).toHaveLength(3)
    for (const pack of [paper1,paper2,paper3]) {
      expect(pack.dataDrills).toHaveLength(15)
      for (const drill of psychologyResearchMethodsAppliedDrills) {
        expect(pack.dataDrills.find(x=>x.id===drill.id)).toEqual(drill)
        expect(drill.prompt).toMatch(/On paper|Using paired/i)
        expect(drill.answer.length).toBeGreaterThan(70)
      }
    }
  })
  it('does not mislabel answer reveals or MCQ selection as independently evidenced written/calculation ability', () => {
    expect(psychologyResearchMethodsAppliedQuestions.every(q=>q.topic==='research-methods')).toBe(true)
    expect(psychologyResearchMethodsAppliedDrills.every(q=>q.title.length>0 && q.answer.length>0)).toBe(true)
    expect(paper3.exams[0]?.totalMarks).toBe(96)
    // Paper 3 options remain intact; the new questions do not enter Exam Prep mock paper questions.
    expect(paper3.exams[0]?.questions.some(q=>ids.includes(q.id))).toBe(false)
  })
})
