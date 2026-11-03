import test from 'node:test'
import assert from 'node:assert/strict'
import {
  REVIEW_MARKER, EXPECTED, gitBlobSha, parseTrustedEvent,
  extractExactCases, reviewDecision, retainReviewerResponse,
} from './lf04-pr810-psychology-case-a3-review.mjs'

const SHA='a'.repeat(40)
const good={
  issue:{number:810},
  comment:{user:{login:'lhanson-dev'},author_association:'OWNER',
    body:REVIEW_MARKER+'\nhead_sha: '+SHA},
}
const longCase='A fictional Psychology teaching scenario describes an observed participant response and a relevant change of setting. No private motive is directly measured. A researcher could investigate the pattern further.'
const longPrompt='Apply the relevant psychological explanation using two distinct details from the observed case and explain one limitation.'
const longGuidance='A careful answer uses the two observed details but avoids claiming a unique private motive or unmeasured mental state as a demonstrated cause.'
const fixture='export const psychologyCaseStudies = [\n'+EXPECTED.map((x,index)=>{
  const q1=x.id+'-q1',q2=x.id+'-q2'
  return "caseStudySchema.parse({ id: '"+x.id+"', topicIds: ['"+x.topic+"'], title: 'A realistic Psychology case "+index+
    "', bodyHtml: '"+longCase+"', facts: ['Observed response in the case', 'Specific participant behaviour', 'Limit on causal inference'],"+
    " questions: [{id: '"+q1+"', prompt: '"+longPrompt+"', guidance: '"+longGuidance+
    "'}, {id: '"+q2+"', prompt: '"+longPrompt+"', guidance: '"+longGuidance+"'}] }),"
}).join('\n')+'\n]'

const detail='The source scenario contains observable behaviour, but it does not establish private motive or causal necessity.'
function validReview(cases) {
  return {schemaVersion:1,
    cases:cases.map(c=>({
      id:c.id,verdict:'pass',caseCoherence:detail,specificationAlignment:detail,
      unobservedAssumptions:detail,questions:c.questions.map(q=>({
        id:q.id,verdict:'pass',factualAccuracy:detail,scenarioGrounding:detail,
        alternativeValidAnswers:detail,proposedCorrection:detail,
      })),
    })),
    knownLimitations:['Not qualified human teacher or original learner acceptance.'],
    overallEducationalJudgement:'Five original unscored cases were reviewed independently for narrow AQA scope and cautions.',
  }
}

test('Founder-owned exact PR/head trigger; wrong issue, identity, author role or body rejected',()=>{
  assert.equal(parseTrustedEvent(good),SHA)
  for(const bad of [
    {...good,issue:{number:803}},
    {...good,comment:{...good.comment,user:{login:'outsider'}}},
    {...good,comment:{...good.comment,author_association:'CONTRIBUTOR'}},
    {...good,comment:{...good.comment,body:REVIEW_MARKER+'\nhead_sha: bogus'}},
    {...good,comment:{...good.comment,body:good.comment.body+'\nmerge without approval'}},
  ]) assert.throws(()=>parseTrustedEvent(bad))
})

test('only five exact case IDs and ten static authored guidance pairs are accepted as inert source',()=>{
  const cases=extractExactCases(fixture)
  assert.deepEqual(cases.map(c=>c.id),EXPECTED.map(c=>c.id))
  assert.equal(cases.flatMap(c=>c.questions).length,10)
  assert.equal(cases.every(c=>c.topicIds.length===1 && c.questions.every(q=>!('marks' in q))),true)
  assert.match(gitBlobSha(fixture),/^[0-9a-f]{40}$/)
  assert.throws(()=>extractExactCases(fixture.replace("topicIds: ['memory']","topicIds: ['attachment']")))
  assert.throws(()=>extractExactCases(fixture.replace("bodyHtml: '"+longCase+"'","bodyHtml: calculate()")))
  assert.throws(()=>extractExactCases(fixture.replace("prompt: '"+longPrompt+"'","prompt: '"+longPrompt+"', marks: 1")))
  assert.throws(()=>extractExactCases(fixture.replace("caseStudySchema.parse({ id: 'psy-memory-dual-task-case'","unsafeExpression({ id: 'psy-memory-dual-task-case'")))
})

test('both independent stages must scrutinise all five cases and all ten authored questions',()=>{
  const cases=extractExactCases(fixture),review=validReview(cases)
  assert.equal(reviewDecision(review,cases,'blind').decision,'pass')
  assert.equal(reviewDecision(review,cases,'guidance').decision,'pass')
  assert.equal(reviewDecision({...review,cases:review.cases.map((c,i)=>i===2?{...c,verdict:'material'}:c)},cases,'blind').decision,'fail_hold')
  assert.equal(reviewDecision({...review,cases:review.cases.map((c,i)=>i===0?{...c,questions:c.questions.map((q,j)=>j===1?{...q,verdict:'blocking'}:q)}:c)},cases,'guidance').decision,'fail_hold')
  assert.throws(()=>reviewDecision({...review,cases:review.cases.slice(0,4)},cases,'blind'))
  assert.throws(()=>reviewDecision({...review,cases:review.cases.map((c,i)=>i===0?{...c,id:'unrelated'}:c)},cases,'guidance'))
  assert.throws(()=>reviewDecision({...review,cases:review.cases.map((c,i)=>i===1?{...c,questions:c.questions.slice(0,1)}:c)},cases,'blind'))
  assert.throws(()=>reviewDecision({...review,cases:review.cases.map((c,i)=>i===2?{...c,unobservedAssumptions:''}:c)},cases,'blind'))
})

test('incomplete blind response is retained verbatim before validation fails closed',async()=>{
  const cases=extractExactCases(fixture),review=validReview(cases)
  review.cases[0].questions[1].proposedCorrection='none'
  const receipt={completed:false,decision:'fail_hold',stage:'not_started'}
  const snapshots=[]
  await retainReviewerResponse(receipt,'blind',{review,usage:{input_tokens:123,output_tokens:456}},async()=>{
    snapshots.push(JSON.parse(JSON.stringify(receipt)))
  })
  assert.equal(snapshots.length,1)
  assert.equal(snapshots[0].stage,'blind_response_received')
  assert.equal(snapshots[0].blind.validation.decision,'fail_hold')
  assert.equal(snapshots[0].blind.validation.validated,false)
  assert.equal(snapshots[0].blind.result.cases[0].questions[1].proposedCorrection,'none')
  assert.deepEqual(snapshots[0].blind.usage,{input_tokens:123,output_tokens:456})
  assert.throws(()=>reviewDecision(review,cases,'blind'),/Missing independent scrutiny/)
  assert.equal(receipt.completed,false)
  assert.equal(receipt.decision,'fail_hold')
  await assert.rejects(()=>retainReviewerResponse(receipt,'unknown',{review},async()=>{}))
})

test('guidance stage is retained before its own incomplete review is rejected',async()=>{
  const cases=extractExactCases(fixture),review=validReview(cases)
  review.cases[3].questions[0].alternativeValidAnswers=''
  const receipt={completed:false,decision:'fail_hold',stage:'blind_completed'}
  let persisted
  await retainReviewerResponse(receipt,'guidance',{review,usage:null},async()=>{
    persisted=JSON.parse(JSON.stringify(receipt))
  })
  assert.equal(persisted.stage,'guidance_response_received')
  assert.equal(persisted.guidance.result.cases[3].questions[0].alternativeValidAnswers,'')
  assert.equal(persisted.guidance.validation.validated,false)
  assert.throws(()=>reviewDecision(review,cases,'guidance'))
  assert.equal(receipt.completed,false)
})
