import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {MARKER,IDS,PSY_IDS,BUS_IDS,founderHead,blobHash,parseAllCandidates,parseScenarioVariants,CONTEXT_VARIANT_IDS,blind,rejectBadReview,authoringSharedGuidance} from './lf05-pr834-all37-a3-review.mjs'
const HEAD='a'.repeat(40)
const trusted={issue:{number:834,pull_request:{}},comment:{user:{login:'lhanson-dev'},author_association:'OWNER',body:MARKER+'\nhead_sha: '+HEAD}}
test('exact Founder-owned PR834 review, one immutable all37 SHA',()=>{
 assert.equal(founderHead(trusted),HEAD)
 for(const variant of [
   {...trusted,issue:{number:846,pull_request:{}}},
   {...trusted,issue:{number:834}},
   {...trusted,comment:{...trusted.comment,user:{login:'other'}}},
   {...trusted,comment:{...trusted.comment,body:MARKER+'\nhead_sha: '+HEAD+'\nmerge now'}},
   {...trusted,comment:{...trusted.comment,body:'review all'}},
 ])assert.throws(()=>founderHead(variant))
 assert.match(blobHash('original'),/^[0-9a-f]{40}$/)
})
function psychFixture(){
 return PSY_IDS.map((id,i)=>{
  let q='Original independent subject evaluation prompt for topic '+i+'? [16 marks]'
  let guide='**Indicative marking guidance — not exhaustive**\n'
   +'**AO1 — accurate knowledge:** '+('Scientific explanation appropriate to this exact question. '.repeat(8))+'\n'
   +'**AO3 — supported analysis:** '+('Study evaluation and limits. '.repeat(10))+'\n'
   +'**Alternative valid answer routes:** '+('Accept justified alternatives and not a single predicted answer. '.repeat(5))+'\n'
   +'**Higher-band discrimination:** '+('Holistic level differentiators and judgement. '.repeat(6))
  return '### '+id+' — Topic '+i+'\n- **Paper/option:** 1; **exact source:** AQA Psychology 7182 v1.4 §4.1.1\n- **Original question:** '+q+'\n- **Provisional AO allocation:** AO1 6 / AO2 0 / AO3 10\n'+guide+'\n'
 }).join('\n')
}
function bizFixture(){
 return BUS_IDS.map(id=>{
  const mark=Number(id.split('-').at(-1))
  const number=id.split('-')[2]
  const context=mark===16?'**Original stimulus (the learner must see it with this question):** A truly original invented business stimulus has turnover and profit figures, staff changes and supplier concerns across five years, for applied evaluation.\n':''
  const ao=mark===16?'AO1 2, AO2 3, AO3 4, AO4 7':'AO1 5, AO2 4, AO3 6, AO4 10'
  const guide='**Indicative marking guide**\n'
   +('An accurate subject fact applied to a credible business decision and discussion of uncertainty. '.repeat(7))
   +'\n**Valid alternatives:** '+('A defensible alternative argument may receive credit. '.repeat(5))
   +'\n**Level discriminator:** '+('Distinguish detailed applied evaluation from a list of knowledge points. '.repeat(6))
  return '### BUS-LF05-'+number+' — Business area '+number+'\n#### '+id+' — candidate essay\n'
   +context+'**Original question:** Should this original business use this method? ['+mark+' marks]\n'
   +'**Provisional AO model:** '+ao+'\n'+guide+'\n'
 }).join('\n')
}
test('all 37 exact authored IDs; immutable guide and scenario fields; reject broken mark sums',()=>{
 const ps=psychFixture(),bs=bizFixture()
 const items=parseAllCandidates(ps,bs)
 assert.equal(items.length,37)
 assert.deepEqual(items.map(x=>x.id),IDS)
 assert.equal(items.filter(x=>x.qualification.startsWith('Psychology')).length,17)
 assert.equal(items.filter(x=>x.originalContext).length,10)
 assert.equal(items.filter(x=>x.trainingOnly).length,1)
 assert.equal(items.every(x=>x.authoredGuide.length>=450),true)
 assert.throws(()=>parseAllCandidates(ps.replace('AO3 10','AO3 9'),bs))
 assert.throws(()=>parseAllCandidates(ps,bs.replace('BUS-LF05-01-16','BUS-LF05-99-16')))
})
test('blind Stage A excludes authored AO and authored marking guides',()=>{
 const q=parseAllCandidates(psychFixture(),bizFixture())
 const prompts=blind(q)
 assert.equal(prompts.length,37)
 assert.equal(JSON.stringify(prompts).includes('authoredGuide'),false)
 assert.equal(JSON.stringify(prompts).includes('Provisional AO model'),false)
 assert.equal(JSON.stringify(prompts).includes('Level discriminator'),false)
 assert.equal(prompts.find(x=>x.id==='BUS-LF05-01-16').originalContext.length>50,true)
})
test('independent A3 must return every item and fails closed on missing or material findings',()=>{
 const ids=IDS.slice(0,6)
 for(const stage of ['blind','guided']){
   const fields=stage==='blind'
    ? ['specAndCohortFit','questionDemand','scenarioIntegrity','independentStrongAnswer','independentWeakAnswer','validAlternativeRoutes','AOAndTariffRisk','specificFix']
    : ['guideTruthAndCompleteness','markingAOAndLevelLogic','creditableAlternatives','distinguishesStrongAndWeak','misleadingFeedbackRisks','specificFix']
   const items=ids.map(id=>({id,verdict:'pass',...Object.fromEntries(fields.map(f=>[f,'Substantive distinct item-specific response with enough explanation of alternatives and assessment risk.']))}))
   const result={items,overallVerdict:'pass',limitations:['No examiner calibration.']}
   assert.equal(rejectBadReview(result,ids,stage).verdict,'pass')
   assert.equal(rejectBadReview({...result,items:items.map((x,i)=>i?x:{...x,verdict:'material'})},ids,stage).verdict,'hold')
   assert.throws(()=>rejectBadReview({...result,items:items.slice(1)},ids,stage))
   assert.throws(()=>rejectBadReview({...result,items:items.map((x,i)=>i?x:{...x,id:'different'})},ids,stage))
   assert.throws(()=>rejectBadReview({...result,items:items.map((x,i)=>i?x:{...x,[fields[0]]:'x'})},ids,stage))
 }
})
test('fail closed on missing credentials or untrusted content and bound provider expense',()=>{
 const source=readFileSync(new URL('./lf05-pr834-all37-a3-review.mjs',import.meta.url),'utf8')
 for(const x of ['MAX_CALLS=14','MAX_ESTIMATED_USD=6','store:false','publicationAuthorised:false','officialAQA2027MarkTariffsVerified:false','source_use:','blobHash(content)!==data.sha','pr.head?.sha!==sha'])
  assert.equal(source.includes(x),true,'missing security bound '+x)
 assert.equal(source.includes('eval('),false)
 assert.equal(source.includes('child_process'),false)
})

test('both separately proposed contextual Psychology variants remain independently versioned and held',()=>{
 const q=CONTEXT_VARIANT_IDS.map((id,i)=>'## '+id+' — contextual topic\n'
   +'**Course/source alignment candidate:** AQA Psychology §4.1.'+(i+1)+' 7182 v1.4\n'
   +'**Original fictional scenario'+(i?' and illustrative results':'')+':** '+('A sufficiently detailed original student classroom situation showing a clear reason to apply theory and some limitations. '.repeat(4))+'\n'
   +'**Question:** Discuss and evaluate using the situation above.\n'
   +'**[16 marks — provisional training format]**\n').join('')
 const g=CONTEXT_VARIANT_IDS.map(id=>'## '+id+' — guide\n'
   +'**AO1:** '+('Specific accurate core theory and context distinction. '.repeat(7))+'\n'
   +'**Alternative credit:** '+('Other valid reasoning can earn consideration. '.repeat(5))+'\n'
   +'**Qualitative differentiation:** '+('Holistic bands distinguish partial from nuanced answers. '.repeat(5))+'\n').join('')
 const v=parseScenarioVariants(q,g)
 assert.equal(v.length,2)
 assert.deepEqual(v.map(x=>x.id),CONTEXT_VARIANT_IDS)
 assert.equal(v.every(x=>x.originalContext.length>180&&x.trainingOnly===true),true)
 assert.equal(blind(v).every(x=>!('authoredGuide' in x)),true)
 assert.throws(()=>parseScenarioVariants(q.replace(CONTEXT_VARIANT_IDS[0],'BROKEN'),g))
})

test('shared original training-only rubrics are complete guide-stage inputs, not blind-stage inputs',()=>{
  const psych='## Assessment rules for these candidates\n'+('A provisional original training Psychology 4-level holistic rubric. '.repeat(12))+
    '\n### Source-first editorial reconciliation\nOther metadata'
  const business='## Provisional original Revision level guides\n'+('A provisional original Business 16 and 25 holistic quality descriptor. '.repeat(12))+
    '\n## Original source-to-response candidates\nIndividual items'
  const variants='## Shared original Revision training level anchors\n'+('A provisional context-first holistic guide, with defensible alternative credit. '.repeat(10))+
    '\n**Assurance status:** not examiner calibrated'
  const shared=authoringSharedGuidance(psych,business,variants)
  assert.match(shared.psychology,/training Psychology/)
  assert.match(shared.business,/Business 16 and 25/)
  assert.match(shared.contextual,/context-first/)
  const a=JSON.stringify(blind(parseAllCandidates(psychFixture(),bizFixture())))
  assert.equal(a.includes('training Psychology'),false)
  assert.equal(a.includes('originalRevisionSharedRubrics'),false)
  assert.throws(()=>authoringSharedGuidance(psych.replace('### Source-first editorial reconciliation','### MISSING'),business,variants))
  assert.throws(()=>authoringSharedGuidance(psych,business.replace('## Original source-to-response candidates','## MISSING'),variants))
  assert.throws(()=>authoringSharedGuidance(psych,business,variants.replace('**Assurance status:**','**MISSING:**')))
  const code=readFileSync(new URL('./lf05-pr834-all37-a3-review.mjs',import.meta.url),'utf8')
  assert.match(code,/originalRevisionSharedRubrics:/)
  assert.match(code,/authoredMarkingGuides:pack/)
  assert.match(code,/paper1StandaloneRule:/)
  assert.match(code,/verifiedGranularExamples:/)
})
