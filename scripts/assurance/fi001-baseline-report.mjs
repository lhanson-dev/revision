import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [aPath,bPath,dir]=process.argv.slice(2)
if(!aPath||!bPath||!dir)throw Error('Expected previous/candidate evidence files and output folder')
const a=JSON.parse(readFileSync(aPath,'utf8')),b=JSON.parse(readFileSync(bPath,'utf8'))
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
const report={baseline:'fd8565838db8fc27cbf359fc86d846e9ab11fda5',candidate:process.env.REVISION_HEAD_SHA??'unknown',scenarios:[]}
const lines=['# FI-001 frozen-baseline counterfactual comparison','','Identical inputs verified; **educational acceptance remains HOLD**.','','| Case | Previous near tasks | Candidate near tasks | Candidate weekly objectives | Unallocated | Verdict |','|---|---:|---:|---:|---:|---|']
for(let n=1;n<=13;n++){
 const id='SV-'+String(n).padStart(2,'0'),old=a.entries.find(x=>x.id===id),cur=b.entries.find(x=>x.id===id)
 if(!old||!cur)throw Error('Missing scenario '+id)
 if(JSON.stringify(Object.keys(old.variants))!==JSON.stringify(Object.keys(cur.variants)))throw Error('Variant mismatch '+id)
 const variants={}
 for(const k of Object.keys(old.variants)){
  const x=old.variants[k],y=cur.variants[k]
  if(hash(x.input)!==hash(y.input))throw Error('Different inputs '+id+'/'+k)
  variants[k]={inputHash:hash(x.input),oldFirst:x.near.first,newFirst:y.near.first,
   oldTasks:x.near.items.length,newTasks:y.near.items.length,
   oldOverCapacity:x.near.overCapacity,newOverCapacity:y.near.overCapacity,
   newObjectives:y.programme?.weeks.reduce((s,w)=>s+w.objectives.length,0)??null,
   newUnserved:y.programme?.unserved.length??null}
 }
 const v=variants.before
 const review = {}
 for (const [name,variant] of Object.entries(cur.variants)) {
  const programme=variant.programme, near=variant.near, input=variant.input
  const byDate=new Map(input.papers.filter(p=>p.isActive).map(p=>[p.assessmentId,p.assessmentDate]))
  if(near.overCapacity)throw Error('HARD FAIL: near-term capacity exceeded: '+id+'/'+name)
  for(const item of near.items) {
   for(const assessmentId of item.assessmentTargets) {
    const deadline=byDate.get(assessmentId)
    if(deadline&&item.date>=deadline)throw Error('HARD FAIL: post-paper near task: '+id+'/'+name+' '+assessmentId)
   }
  }
  for(const week of programme?.weeks??[]) {
   if(week.available!==null&&week.allocated>week.available)
    throw Error('HARD FAIL: weekly allocated minutes exceed available: '+id+'/'+name+' '+week.weekStart)
   for(const objective of week.objectives) {
    const deadline=byDate.get(objective.exam)
    if(objective.treatment==='exam-practice'&&deadline&&objective.fitDate&&objective.fitDate>=deadline)
      throw Error('HARD FAIL: scheduled paper practice on/after its paper: '+id+'/'+name)
   }
  }
  const objectives=(programme?.weeks??[]).flatMap(week=>week.objectives)
  const treatments={learn:0,check:0,repair:0,'exam-practice':0,other:0}
  const courses={}
  for(const objective of objectives){
   const treatment=objective.treatment in treatments?objective.treatment:'other'
   treatments[treatment]++
   courses[objective.course]=(courses[objective.course]??0)+1
  }
  const sections=(programme?.responseSections??[]).map(section=>({
   paper:section.exam, section:section.section, format:section.format,
   verified:section.verifiedPractice, allocated:section.allocatedPractice,
   objectives:section.assessmentObjectives,
  }))
  const verified=sections.filter(section=>section.verified>0).length
  const withAllocation=sections.filter(section=>section.allocated>0).length
  const signals=[]
  if(programme&&programme.unserved.length>0)
    signals.push(String(programme.unserved.length)+' unallocated supported objectives; check which educational obligations are displaced')
  if(verified>0&&withAllocation===0)
    signals.push('No verified paper-response section receives allocated practice; check whether this is justified by actual capacity and learning prerequisites')
  if(sections.some(section=>section.verified===0))
    signals.push('Some named paper-response sections have no verified source-backed practice')
  if(input.selected.length>1&&Object.keys(courses).length<input.selected.length&&objectives.length>0)
    signals.push('At least one active course has no allocated objectives; review course-share opportunity cost')
  if(input.papers.length>0&&input.weekly===null&&objectives.length>0)
    throw Error('HARD FAIL: allocated an invented timed programme without availability: '+id+'/'+name)
  if(!input.papers.length&&sections.length>0)
    throw Error('HARD FAIL: fabricated paper-specific preparation without exams: '+id+'/'+name)
  const next=near.first
  review[name]={
   first:next?{date:next.date,topic:next.topic,treatment:next.activity,course:next.course}:null,
   programmeMinutes:programme?.allocated??0,
   allocatedObjectives:objectives.length,unallocatedObjectives:programme?.unserved.length??0,
   treatments,courses,sections:{total:sections.length,verified,withAllocation,detail:sections},
   signals,educationalVerdict:'NOT ASSESSED',
  }
 }
 result.scenarios[result.scenarios.length-1].review=review
 lines.push('| '+id+' | '+v.oldTasks+' | '+v.newTasks+' | '+v.newObjectives+' | '+v.newUnserved+' | Expert judgement pending |')
 report.scenarios.push({id,variants,educationalVerdict:'NOT ASSESSED'})
}
writeFileSync(dir+'/comparison.json',JSON.stringify(report,null,2))
const reviewLines=['# FI-001 — Educational decision review queue (NOT acceptance)','',
 'Computed from the same input-verified candidate decisions as comparison.json. This is a review queue, not an automated judgement that chosen priorities are educationally optimal.',
 '',
 '| Case / variant | First work | Treatment mix (learn / check / repair / exam) | Response sections allocated / source-verified | Unallocated supported opportunities |',
 '|---|---|---|---|---:|']
for(const scenario of report.scenarios){
 for(const [name,r] of Object.entries(scenario.review)){
  const first=r.first?r.first.course.split(':').at(-1)+' / '+r.first.topic+' / '+r.first.treatment:'No timed next task'
  const t=r.treatments,s=r.sections
  reviewLines.push('| '+scenario.id+' / '+name+' | '+first+' | '+[t.learn,t.check,t.repair,t['exam-practice']].join(' / ')+
   ' | '+s.withAllocation+' / '+s.verified+' ('+s.total+' published) | '+r.unallocatedObjectives+' |')
 }
}
reviewLines.push('','## High-priority expert adjudication','')
for(const id of ['SV-03','SV-05','SV-06','SV-07','SV-09','SV-10','SV-11','SV-12','SV-13']){
 const scenario=report.scenarios.find(item=>item.id===id)
 reviewLines.push('### '+id)
 for(const [name,r] of Object.entries(scenario.review)){
  reviewLines.push('- **'+name+'**: '+(r.signals.length?r.signals.join('; '):'No automated safety signal; educational suitability still unassessed')+'.')
 }
}
reviewLines.push('','## Limits of this reviewer queue','',
 'Response-section allocation counts distinct verified sections with a scheduled exact activity, not learner mastery, a grade, or a substitute for source/marking assurance.',
 'All activity and section counts depend on the fixed synthetic evidence fixtures and published content available at this exact head.',
 'Zero paper practice in scarce time is a question for qualified review, not automatic proof that learning-first is wrong.',
 'The thirteen scenarios still need the full Month/Week/Day/Home/REV adjudication, real persisted learner paths and genuine student comprehension.',
 'No Founder Ready/merge/educational approval is supplied or inferred by this script.')
writeFileSync(dir+'/educational-review.json',JSON.stringify(report.scenarios.map(x=>({id:x.id,review:x.review})),null,2))
writeFileSync(dir+'/educational-review.md',reviewLines.join('\n')+'\n')

lines.push('','This compares the same published Business 7132/Psychology 7182 scenario fixtures using each revision’s real code. The previous planner has no programme-first objectives; absent baseline objectives are not evidence of efficacy. Synthetic scored evidence is not a human study. Full five-view explanation, educational prioritisation, actual persisted learner events, exam-skill completeness and student comprehension still require separate acceptance.')
const markdown=lines.join('\n')+'\n'
writeFileSync(dir+'/comparison.md',markdown)
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown)
console.log('13 input-verified scenario comparisons recorded; educational acceptance is NOT assessed.')