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
 lines.push('| '+id+' | '+v.oldTasks+' | '+v.newTasks+' | '+v.newObjectives+' | '+v.newUnserved+' | Expert judgement pending |')
 report.scenarios.push({id,variants,educationalVerdict:'NOT ASSESSED'})
}
writeFileSync(dir+'/comparison.json',JSON.stringify(report,null,2))
lines.push('','This compares the same published Business 7132/Psychology 7182 scenario fixtures using each revision’s real code. The previous planner has no programme-first objectives; absent baseline objectives are not evidence of efficacy. Synthetic scored evidence is not a human study. Full five-view explanation, educational prioritisation, actual persisted learner events, exam-skill completeness and student comprehension still require separate acceptance.')
const markdown=lines.join('\n')+'\n'
writeFileSync(dir+'/comparison.md',markdown)
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown)
console.log('13 input-verified scenario comparisons recorded; educational acceptance is NOT assessed.')