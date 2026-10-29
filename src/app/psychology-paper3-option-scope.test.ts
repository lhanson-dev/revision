import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { scopeTopicIds } from './planner-model'
import { isAqaPsychologyPaper3, psychologyPaper3OptionContract, psychologyPaper3TopicScope } from './psychology-paper3-option-scope'

const courses=allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const psychology=courses.find((course)=>course.course.id==='aqa:aqa-a-level:7182')!.course
const business=courses.find((course)=>course.course.id==='aqa:aqa-a-level:7132')!.course
const paper3=psychology.modules.find((module)=>module.manifest.paper.number===3)!
const contract=psychologyPaper3OptionContract(paper3)

describe('Issue #698 — Psychology Paper 3 option selection for the real learner Plan', () => {
  it('uses existing published paper metadata, not a new hardcoded curriculum', () => {
    expect(isAqaPsychologyPaper3(paper3)).toBe(true)
    expect(isAqaPsychologyPaper3(business.modules[2])).toBe(false)
    expect(psychologyPaper3OptionContract(business.modules[2])).toBeNull()
    expect(contract?.compulsoryTopicIds).toEqual(['issues-and-debates-in-psychology'])
    expect(contract?.groups.map(group=>group.id)).toEqual(['section-b','section-c','section-d'])
    expect(contract?.groups.map(group=>group.options.length)).toEqual([3,3,3])
    expect(contract?.groups[0].options.map(option=>option.topicId)).toEqual(['relationships','gender','cognition-and-development'])
    expect(contract?.groups[1].options.map(option=>option.topicId)).toEqual(['schizophrenia','eating-behaviour','stress'])
    expect(contract?.groups[2].options.map(option=>option.topicId)).toEqual(['aggression','forensic-psychology','addiction'])
    for(const group of contract!.groups) expect(group.options.every(option=>option.label.length>0)).toBe(true)
  })

  it('supports all 27 and only 27 legal combinations and sends exact chosen paper scope to FI-001 planner', () => {
    const state=createCourseLearningState(psychology,[])
    let count=0
    for(const b of contract!.groups[0].options) for(const c of contract!.groups[1].options) for(const d of contract!.groups[2].options) {
      const selected={'section-b':b.topicId,'section-c':c.topicId,'section-d':d.topicId}
      const scope=psychologyPaper3TopicScope(contract,selected)
      expect(scope).toEqual({topicIds:['issues-and-debates-in-psychology',b.topicId,c.topicId,d.topicId]})
      expect(new Set(scope!.topicIds).size).toBe(4)
      const eligible=scopeTopicIds({moduleId:paper3.manifest.id,scope:scope!},state)
      expect(eligible).toEqual(scope!.topicIds)
      for(const group of contract!.groups) {
        const unselected=group.options.filter(option=>!scope!.topicIds.includes(option.topicId))
        for(const option of unselected) expect(eligible).not.toContain(option.topicId)
      }
      count++
    }
    expect(count).toBe(27)
  })

  it('fails closed for absent, incomplete, unknown and extra optional selections', () => {
    const valid={'section-b':'relationships','section-c':'schizophrenia','section-d':'aggression'}
    expect(psychologyPaper3TopicScope(null,valid)).toBeNull()
    expect(psychologyPaper3TopicScope(contract,{})).toBeNull()
    expect(psychologyPaper3TopicScope(contract,{'section-b':'relationships'})).toBeNull()
    expect(psychologyPaper3TopicScope(contract,{...valid,'section-b':'unknown-topic'})).toBeNull()
    expect(psychologyPaper3TopicScope(contract,{...valid,'invalid-group':'extra'})).toBeNull()
    const original=psychologyPaper3TopicScope(contract,valid)
    expect(original).toEqual({topicIds:['issues-and-debates-in-psychology','relationships','schizophrenia','aggression']})
    expect(psychologyPaper3TopicScope(contract,{...valid})).toEqual(original)
    // Missing selection cannot be upgraded into exam-practice evidence by the planner.
    const state=createCourseLearningState(psychology,[])
    const noSelection=scopeTopicIds({moduleId:paper3.manifest.id,scope:{}},state)
    for(const group of contract!.groups) for(const option of group.options) expect(noSelection).not.toContain(option.topicId)
  })
})
