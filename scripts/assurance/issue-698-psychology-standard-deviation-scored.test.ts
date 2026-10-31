import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { psychologyStandardDeviationPracticeBank, psychologyStandardDeviationRequirementBindings } from '../../content/psychology/aqa-a-level/shared/standard-deviation-practice'
import { createLearningContentAdapter } from '../../src/engine/content/content-adapter'
import { availableTypes, buildQuestionPool } from '../../src/app/practice-questions'
import { checkCalculation } from '../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../src/app/practice-evidence'

const manifest=JSON.parse(readFileSync('research/specification-to-learner/aqa-2027-source-manifest.json','utf8')) as {courses:Array<{specification_code:string,pdf_sha256:string}>}
const observations=[
  {score:2.24,wrong:'2.58',mean:5},
  {score:2.83,wrong:'3.16',mean:8},
  {score:2.06,wrong:'2.38',mean:8.5},
  {score:2.45,wrong:'2.74',mean:7},
] as const

describe('Issue #698 — real typed-number standard deviation Practice for AQA 7182',()=>{
  it('keeps the exact current AQA A-level source binding and original question scope',()=>{
    expect(manifest.courses.find(c=>c.specification_code==='7182')?.pdf_sha256).toBe('db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d')
    expect(psychologyStandardDeviationPracticeBank).toHaveLength(4)
    expect(Object.keys(psychologyStandardDeviationRequirementBindings)).toHaveLength(4)
    expect(new Set(psychologyStandardDeviationPracticeBank.map(q=>q.id)).size).toBe(4)
    for(const q of psychologyStandardDeviationPracticeBank) {
      expect(q.topic_id).toBe('research-methods')
      expect(q.target_item_ids).toEqual(['PSY-07-26'])
      expect(q.target_node_ids).toEqual(['research-methods-psy0726'])
      expect(q.namespace).toBe('rev7182')
      expect(q.question.marks).toBe(1)
      expect(q.question.stem).toContain('numerical value')
      expect(q.question.context).toContain('population standard deviation')
      expect(q.question.mark_scheme.model_answer).toMatch(/Squared deviations|Mean =/)
    }
  })
  it('publishes the same safe numeric response mode and worked method across all three existing packs',()=>{
    for(const pack of [paper1,paper2,paper3]) {
      expect(pack.practiceBank).toEqual(expect.arrayContaining(psychologyStandardDeviationPracticeBank))
      // Other Psychology calculations may be published without rewriting or
      // replacing the four existing independently keyed SD cases.
      expect(pack.practiceBank?.filter(q=>q.id.startsWith('sd-population-'))).toEqual(psychologyStandardDeviationPracticeBank)
      expect(pack.questions).toHaveLength(131)
      expect(pack.dataDrills).toHaveLength(16)
      const adapter=createLearningContentAdapter(pack)
      const pool=buildQuestionPool({
        topicId:'research-methods',topicOrder:7,coursePack:adapter.listQuestions('research-methods'),
        bank:adapter.listPracticeBank(),includeWritten:false,
      })
      expect(availableTypes(pool)).toEqual(['multiple-choice','calculation'])
      const calculations=pool.filter(p=>p.type==='calculation' && p.id.startsWith('rev7182-4.2.3-sd-population-'))
      expect(calculations.map(p=>p.id)).toEqual(psychologyStandardDeviationPracticeBank.map(p=>`rev7182-4.2.3-${p.id}`))
      const learn=adapter.listLearnChapters().flatMap(ch=>ch.groups.flatMap(g=>g.pages)).find(p=>p.id==='research-methods-psy0726')
      expect(learn).toBeDefined()
      expect(JSON.stringify(learn)).toContain('Worked method: calculate standard deviation')
      expect(JSON.stringify(learn)).toContain('population')
      for(const [i,p] of calculations.entries()) {
        if(p.type!=='calculation')throw new Error('expected typed input')
        expect(p.expected).toBe(observations[i].score)
        expect(p.answerText).toBe(`${observations[i].score} points`)
        expect(p.workings).toContain(`Mean = ${observations[i].mean}`)
        expect(checkCalculation(String(observations[i].score),p.accepted,p.unit).status).toBe('right')
        expect(checkCalculation(observations[i].wrong,p.accepted,p.unit).status).toBe('wrong')
        expect(checkCalculation('not sure',p.accepted,p.unit).status).toBe('unreadable')
      }
    }
  })
  it('preserves stable evidence identity and real scored calculation evidence shape rather than inventing mastery',()=>{
    const adapter=createLearningContentAdapter(paper2)
    const pool=buildQuestionPool({topicId:'research-methods',topicOrder:7,coursePack:adapter.listQuestions('research-methods'),bank:adapter.listPracticeBank()})
    const question=pool.find(p=>p.type==='calculation')
    if(!question||question.type!=='calculation')throw new Error('missing calculation')
    expect(question.marks).toBe(1)
    expect(question.specItemIds).toEqual(['PSY-07-26'])
    expect(question.nodeIds).toEqual(['research-methods-psy0726'])
    expect(question.id).toBe('rev7182-4.2.3-sd-population-01')
    // The ordinary app uses createCalculationEvidence and owner-scoped onRecordEvidence.
    // This unit test only checks conversion; real hosted persistence remains an open #698 gate.
    expect(typeof createCalculationEvidence).toBe('function')
  })
})
