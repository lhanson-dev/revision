import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { listAvailableContentAdapters } from '../src/engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from '../src/app/catalogue-model'
import { allCatalogueCourses } from '../src/app/learner-programme'
import * as planner from '../src/app/planner-model'
import type { LearningEvidence } from '../src/engine/evidence/evidence'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../src/services/planning/planner-service'
import type { PlannedSession } from '../src/services/planning/planned-session-service'

/** Copied unchanged into baseline fd856583 and PR head. Evidence, not educational acceptance. */
const all=allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business=all.find(x=>x.course.id==='aqa:aqa-a-level:7132')!.course
const psychology=all.find(x=>x.course.id==='aqa:aqa-a-level:7182')!.course
const courses={business,psychology}
type Key=keyof typeof courses
type Week=RevisionAvailabilityProfile['weeklyMinutes']
const normal:Week={monday:60,tuesday:45,wednesday:60,thursday:30,friday:45,saturday:90,sunday:0}
const scarce:Week={monday:30,tuesday:0,wednesday:0,thursday:0,friday:0,saturday:0,sunday:0}
const zero:Week={monday:0,tuesday:0,wednesday:0,thursday:0,friday:0,saturday:0,sunday:0}
const availability=(w:Week):RevisionAvailabilityProfile=>({userId:'fixture',timezone:'Europe/London',weeklyMinutes:w,weekdayMinutes:0,weekendMinutes:0})
function exam(k:Key,n:number,day:string,active=true):RevisionAssessment {
 const c=courses[k],m=c.modules.find(x=>x.manifest.paper.number===n)
 if(!m)throw Error('Missing published paper: '+k+n)
 return {assessmentId:c.id+':paper-'+n,userId:'fixture',courseId:c.id,subjectId:c.subjectId,
 moduleId:m.manifest.id,assessmentType:'public_exam',title:k+' paper '+n,
 assessmentDate:day,relativeImportance:'high',scope:{},isActive:active}
}
const papers=()=>[exam('business',1,'2027-05-18'),exam('business',2,'2027-06-02'),exam('business',3,'2027-06-11')]
const shared=[exam('business',1,'2027-05-18'),exam('psychology',1,'2027-05-25')]
const near=[exam('business',1,'2026-11-03'),exam('psychology',1,'2026-11-17')]
const both:Key[]=['business','psychology']
const [b1,b2]=business.learningAdapter.listTopics().slice(0,2).map(x=>x.id)
const p1=psychology.learningAdapter.listTopics()[0]!.id
function scored(k:Key,topic:string,good:boolean,day:string):LearningEvidence[]{
 const moduleId=courses[k].learningAdapter.manifest.id,results:LearningEvidence[]=[]
 for(let i=0;i<3;i++){
 results.push({id:k+topic+day+'f'+i,moduleId,topicId:topic,contentId:topic+'f'+i,
  source:'flashcard',schemaVersion:1,rating:good?2:0,occurredAt:day})
 results.push({id:k+topic+day+'q'+i,moduleId,topicId:topic,contentId:topic+'q'+i,
  source:'multiple_choice',schemaVersion:1,correct:good,selectedOption:good?0:1,correctOption:0,occurredAt:day})
 }
 return results
}
const weak=scored('business',b1!,false,'2026-10-01T09:00:00Z')
const strong=scored('business',b1!,true,'2026-10-01T09:00:00Z')
const strong2=scored('business',b2!,true,'2026-10-01T09:00:00Z')
const weak2=scored('business',b2!,false,'2026-10-01T09:00:00Z')
const improved=scored('business',b1!,true,'2026-10-15T09:00:00Z')
const worsened=scored('business',b1!,false,'2026-10-15T09:00:00Z')
const psychWeak=scored('psychology',p1,false,'2026-10-01T09:00:00Z')
function session(status:PlannedSession['status']='planned'):PlannedSession {
 return {sessionId:'saved',userId:'fixture',courseId:business.id,topicId:b1!,plannedDate:'2026-10-20',
 status,activityType:'practice',minutes:20,addedBy:'student',recommendationId:null,
 createdAt:'2026-10-01T12:00:00Z',updatedAt:'2026-10-01T12:00:00Z'}
}
type Input={selected:Key[];papers:RevisionAssessment[];weekly:Week|null;
 evidence:LearningEvidence[];today:string;sessions:PlannedSession[]}
const basic=(patch:Partial<Input>={}):Input=>({selected:['business'],papers:papers(),weekly:normal,
 evidence:[],today:'2026-10-15',sessions:[],...patch})
const cases:Record<string,Record<string,Input>>={
 'SV-01':{before:basic(),after:basic({evidence:improved})},
 'SV-02':{before:basic({weekly:scarce,evidence:[...strong2,...weak]}),
 after:basic({weekly:scarce,evidence:[...strong2,...weak,...improved]})},
 'SV-03':{before:basic({selected:both,papers:shared,weekly:scarce,evidence:[...strong,...psychWeak]}),
 after:basic({selected:both,papers:shared,weekly:scarce,evidence:[...strong,...psychWeak],today:'2027-05-19'})},
 'SV-04':{before:basic(),after:basic({papers:[exam('business',1,'2027-04-21',false),...papers().slice(1)]})},
 'SV-05':{before:basic({selected:both,papers:shared,weekly:scarce}),
 after:basic({selected:both,papers:shared,weekly:{...scarce,wednesday:30}})},
 'SV-06':{before:basic({selected:both,papers:near,weekly:scarce,evidence:[...weak,...strong2]}),
 after:basic({selected:both,papers:near,weekly:{...scarce,monday:0,thursday:20},evidence:[...weak,...strong2]})},
 'SV-07':{before:basic({selected:both,papers:shared,weekly:scarce,sessions:[session()]}),
 after:basic({selected:both,papers:shared,weekly:scarce,sessions:[session('skipped')],today:'2026-10-22'})},
 'SV-08':{before:basic({evidence:weak}),
 after:basic({evidence:[...weak,...improved],sessions:[session('done')]})},
 'SV-09':{before:basic({evidence:[...strong,...strong2]}),
 after:basic({evidence:[...strong,...strong2,...worsened]})},
 'SV-10':{before:basic({evidence:[...weak,...weak2]}),
 after:basic({evidence:[...weak,...weak2,...improved]})},
 'SV-11':{before:basic({sessions:[session()]}),
 after:basic({sessions:[session()],papers:[exam('business',1,'2027-04-21'),
 exam('business',2,'2027-06-23'),exam('business',3,'2027-06-11')]})},
 'SV-12':{before:basic({selected:both,papers:near,weekly:zero}),
 after:basic({selected:both,papers:near,weekly:{...zero,wednesday:30}})},
 'SV-13':{before:basic({papers:[],weekly:null}),
 dateOnly:basic({papers:[exam('business',1,'2027-05-18')],weekly:null}),
 timeOnly:basic({papers:[],weekly:scarce}),
 after:basic({papers:[exam('business',1,'2027-05-18')],weekly:scarce})}
}
type Goal={candidateId:string;courseId:string;topicId:string;treatment:string;estimatedMinutes:number;
 assessmentId:string;forecastDate?:string;purpose:string;reason:string}
type Program={finalKnownAssessment:string|null;allocatedMinutes:number;requiredMinutes:number;
 weeks:Array<{weekStart:string;availableMinutes:number|null;allocatedMinutes:number;objectives:Goal[]}>;
 unserved:Goal[];requirements:Array<{courseId:string;topicId:string;evidenceStatus:string;papers:unknown[]}>;
 paperResponseRequirements:unknown[];constraints:string[]}
function output(input:Input){
 const states=input.selected.map(x=>createCourseLearningState(courses[x],input.evidence))
 const args=[states,input.papers,input.weekly?availability(input.weekly):null,[],[],
 new Date(input.today+'T12:00:00'),input.sessions] as const
 const snapshot=planner.buildPlannerSnapshot(...args,14)
 const items=snapshot?.schedule.flatMap(day=>day.items.map(item=>({date:day.date,course:item.courseId,
  topic:item.topicId,activity:item.activityType,minutes:item.estimatedMinutes,
  assessmentTargets:item.assessmentTargets?.map(t=>t.assessmentId)??[],
  reasonCodes:item.reasons,
  purpose:'preparationPurpose' in item?item.preparationPurpose:null})))??[]
 const candidateBuilder:unknown=(planner as unknown as Record<string,unknown>).buildLearnerPreparationProgramme
 const built=typeof candidateBuilder==='function'?(candidateBuilder as (...a:unknown[])=>unknown)(...args):null
 const program=(built as {programme:Program}|null)?.programme
 return {
  input:{selected:input.selected.map(k=>courses[k].id),papers:input.papers,weekly:input.weekly,
   evidence:input.evidence,today:input.today,sessions:input.sessions},
  near:{first:items[0]??null,items,overCapacity:snapshot?.schedule.some(d=>
   d.items.reduce((s,i)=>s+i.estimatedMinutes,0)>d.availableMinutes)??false},
  programme:program?{finalPaper:program.finalKnownAssessment,allocated:program.allocatedMinutes,
   required:program.requiredMinutes,
   weeks:program.weeks.map(w=>({weekStart:w.weekStart,available:w.availableMinutes,allocated:w.allocatedMinutes,
    objectives:w.objectives.map(o=>({id:o.candidateId,course:o.courseId,topic:o.topicId,treatment:o.treatment,
     minutes:o.estimatedMinutes,exam:o.assessmentId,fitDate:o.forecastDate??null,purpose:o.purpose,reason:o.reason}))})),
   unserved:program.unserved.map(o=>({course:o.courseId,topic:o.topicId,treatment:o.treatment,exam:o.assessmentId})),
   requirements:program.requirements.map(r=>({course:r.courseId,topic:r.topicId,status:r.evidenceStatus,papers:r.papers.length})),
   responseDemands:program.paperResponseRequirements.length,constraints:program.constraints}:null
 }
}
describe('FI-001 fixed-baseline controlled outcomes, not educational acceptance',()=>{
 it.skipIf(!process.env.FI001_PROBE_OUTPUT)('emits identical inputs for the 13 approved scenarios',()=>{
  const ids=Object.keys(cases)
  expect(ids).toEqual(Array.from({length:13},(_,i)=>'SV-'+String(i+1).padStart(2,'0')))
  const entries=ids.map(id=>({id,variants:Object.fromEntries(
   Object.entries(cases[id]!).map(([k,v])=>[k,output(v)]))}))
  writeFileSync(process.env.FI001_PROBE_OUTPUT!,JSON.stringify({version:1,timezone:'Europe/London',entries},null,2))
  expect(entries).toHaveLength(13)
 })
})