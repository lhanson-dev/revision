import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { psychologyCourseTruthTopics, psychologyLearn, psychologyFlashcards, psychologyQuestions, psychologyTopics, psychologyDataDrills } from '../../content/psychology/aqa-a-level/shared/course'
import { psychologyResearchMethodsAppliedRequirementBindings } from '../../content/psychology/aqa-a-level/shared/research-methods-practice'
import { psychologyInferenceChoiceRequirementBindings } from '../../content/psychology/aqa-a-level/shared/inferential-choice-practice'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'

const source=JSON.parse(readFileSync('research/specification-to-learner/aqa-2027-source-manifest.json','utf8')) as {courses:Array<{specification_code:string,pdf_sha256:string}>}
const skills=JSON.parse(readFileSync('research/specification-to-learner/aqa-2027-cross-cutting-assurance-assertions.json','utf8')) as {
  sources:Record<string,{sha256:string}>, assertions:Array<{id:string,course:string,source_section:string,printed_page:number,capability:string,requirement:string,teaching_review:string,performance_review:string,production_learner_acceptance:string}>
}
const business=JSON.parse(readFileSync('research/aqa-business-7132/2027/NAMED_ITEMS.json','utf8')) as {items:Array<{id:string,section:string}>}

describe('Issue #698 full-course proof cannot be substituted by source ID or MCQ presence',()=>{
  it('pins independently transcribed cross-topic and mathematical performance demands to both exact AQA versions',()=>{
    for(const code of ['7132','7182']){
      expect(skills.sources[code]?.sha256).toBe(source.courses.find(c=>c.specification_code===code)?.pdf_sha256)
    }
    expect(skills.assertions).toHaveLength(53)
    expect(new Set(skills.assertions.map(s=>s.id)).size).toBe(53)
    expect(skills.assertions.filter(s=>s.course==='7132')).toHaveLength(22)
    expect(skills.assertions.filter(s=>s.course==='7182')).toHaveLength(31)
    expect(skills.assertions.filter(s=>s.capability==='mathematical_performance')).toHaveLength(25)
    for(const row of skills.assertions){
      expect(row.requirement.trim().length,row.id).toBeGreaterThan(15)
      expect(row.printed_page,row.id).toBeGreaterThan(0)
      expect(row.teaching_review,row.id).toBe('UNVERIFIED')
      expect(row.performance_review,row.id).toBe('UNVERIFIED')
      expect(row.production_learner_acceptance,row.id).toBe('UNVERIFIED')
    }
    expect(skills.assertions.find(s=>s.id==='P-M10')?.requirement).toMatch(/standard deviation/)
    expect(skills.assertions.find(s=>s.id==='B-Q03')?.requirement).toMatch(/Construct/)
  })

  it('treats the 344 Business register as candidate mapping, not an independent complete requirement denominator',()=>{
    expect(business.items).toHaveLength(344)
    expect(new Set(business.items.map(x=>x.id)).size).toBe(344)
    expect(new Set(business.items.map(x=>x.section)).size).toBe(42)
    const falsePositive=business.items.find(x=>x.id==='aqa-7132-3.1.1:types-of-business-objective-profit-growth-survival-cash-flow')
    expect(falsePositive).toBeDefined()
    // No keyword-only mapping may imply competency in all four objectives or real response quality.
    expect(skills.assertions.some(x=>x.id==='B-G01')).toBe(true)
  })

  it('tracks every currently published Psychology requirement to the ACTUAL Learn page, recognition MCQ and flashcard',()=>{
    const pages=psychologyLearn.chapters.flatMap(ch=>ch.groups.flatMap(g=>g.pages))
    const published=[paper1,paper2,paper3]
    const requirements=psychologyCourseTruthTopics.flatMap(t=>t.requirements.map(r=>({t,r})))
    expect(requirements).toHaveLength(118)
    expect(pages).toHaveLength(118)
    expect(psychologyFlashcards).toHaveLength(118)
    expect(psychologyQuestions).toHaveLength(118)
    const pageIds=new Set(pages.map(p=>p.id))
    const cardIds=new Set(psychologyFlashcards.map(q=>q.id))
    const mcqIds=new Set(psychologyQuestions.map(q=>q.id))
    for(const {t,r} of requirements){
      const topic=psychologyTopics.find(q=>q.order===t.topicNumber)
      expect(topic,r.requirementId).toBeDefined()
      const code=r.requirementId.toLowerCase().replaceAll('-','')
      const pid=`${topic!.id}-${code}`,card=`psy-${code}-card`,mcq=`psy-${code}-check`
      expect(pageIds.has(pid),r.requirementId).toBe(true)
      expect(cardIds.has(card),r.requirementId).toBe(true)
      expect(mcqIds.has(mcq),r.requirementId).toBe(true)
      expect(pages.find(x=>x.id===pid)?.sourceSectionIds,r.requirementId).toContain(code)
      for(const p of published){
        expect(p.learn.chapters.flatMap(ch=>ch.groups.flatMap(g=>g.pages)).some(x=>x.id===pid),p.manifest.id).toBe(true)
        expect(p.questions.some(q=>q.id===mcq),r.requirementId).toBe(true)
      }
    }
    // A student could recognise a concept while still being unable to write, calculate or construct it.
    expect(published.every(p=>p.questions.length===131 && p.dataDrills.length===16)).toBe(true)
  })

  it('checks separately bound Research Methods additions really enter published packs without promoting self-checks to scored skill evidence',()=>{
    const mapped={...psychologyResearchMethodsAppliedRequirementBindings,...psychologyInferenceChoiceRequirementBindings}
    const known=new Set(psychologyCourseTruthTopics.flatMap(t=>t.requirements.map(r=>r.requirementId)))
    const scored=new Set(paper1.questions.map(q=>q.id))
    const drills=new Set(paper1.dataDrills.map(q=>q.id))
    for(const [asset,ids] of Object.entries(mapped)){
      expect(scored.has(asset)||drills.has(asset),asset).toBe(true)
      for(const id of ids)expect(known.has(id),id).toBe(true)
    }
    expect(psychologyDataDrills).toHaveLength(12)
    expect(skills.assertions.find(s=>s.id==='P-M16')?.performance_review).toBe('UNVERIFIED')
  })
})
