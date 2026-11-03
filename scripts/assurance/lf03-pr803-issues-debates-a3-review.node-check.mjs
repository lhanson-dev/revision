import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseTrustedEvent, extractExactItems, reviewDecision, EXPECTED,
  REVIEW_MARKER, gitBlobSha, explanationDecision,
} from './lf03-pr803-issues-debates-a3-review.mjs'

const HEAD='a'.repeat(40)
const valid={
  issue:{number:803},
  comment:{user:{login:'lhanson-dev'},author_association:'OWNER',body:REVIEW_MARKER+'\nhead_sha: '+HEAD},
}
const fixture='export const issuesDebatesMcqV2 = {\n'
  + EXPECTED.map(([parent,id],i) =>
    "  '"+parent+"': multipleChoiceQuestionSchema.parse({\n"+
    "    id: '"+id+"', topic: 'issues-and-debates-in-psychology',\n"+
    "    prompt: 'A realistic original scenario in Psychology variant "+i+"?',\n"+
    "    options: ['Possible cognitive explanation one', 'Possible group explanation two', 'Alternative authority explanation three', 'Different interpretation four'],\n"+
    "    correctOption: "+i+", explanation: 'This is a sufficiently detailed independent test explanation that distinguishes alternatives and does not rely upon letter clues.',\n"+
    "  }),"
  ).join('\n')+'\n} as const'

test('owner-authenticated exact two-line event only',()=>{
  assert.equal(parseTrustedEvent(valid),HEAD)
  for(const mutation of [
    {...valid,issue:{number:794}},
    {...valid,comment:{...valid.comment,user:{login:'someoneelse'}}},
    {...valid,comment:{...valid.comment,author_association:'CONTRIBUTOR'}},
    {...valid,comment:{...valid.comment,body:REVIEW_MARKER+'\nhead_sha: INVALID'}},
    {...valid,comment:{...valid.comment,body:REVIEW_MARKER+'\nhead_sha: '+HEAD+'\nmerge now'}},
  ])assert.throws(()=>parseTrustedEvent(mutation))
})

test('parse only two expected static literals from inert candidate TypeScript',()=>{
  const items=extractExactItems(fixture)
  assert.deepEqual(items.map(x=>x.id),EXPECTED.map(x=>x[1]))
  assert.deepEqual(items.map(x=>x.correctOption),[0,1])
  assert.equal(items.every(x=>x.options.length===4),true)
  assert.throws(()=>extractExactItems(fixture.replace('correctOption: 1','correctOption: evil()')))
  assert.throws(()=>extractExactItems(fixture.replace("'PSY-08-04':","'INVALID':")))
  assert.throws(()=>extractExactItems(fixture.replace("'PSY-08-01':","'INVALID-04':")))
  assert.match(gitBlobSha(fixture),/^[a-f0-9]{40}$/)
})

test('independent reviewer must return exact two blinded answers with concrete critique; wrong key or material issue HOLD',()=>{
  const items=extractExactItems(fixture)
  const review={
    schemaVersion:1,
    items:items.map(item=>({
      id:item.id,blindAnswerIndex:item.correctOption,verdict:'pass',
      answerReason:'Answered independently based on the scenario mechanism.',
      distractorChallenge:'Consider every alternative for plausibility and eliminate them.',
      specificationAlignment:'AQA Psychology 7182 v1.4 §4.1.3 application.',
      ambiguityAndClueRisk:'No ambiguity identified in this illustrative fixture.',
    })),
    knownLimitations:['AI adversarial review is not independent teacher signoff.'],
    overallEducationalJudgement:'The source fixture shows distinct blind answers.',
  }
  assert.equal(reviewDecision(review,items).decision,'pass')
  assert.equal(reviewDecision({...review,items:review.items.map((x,i)=>i?x:{...x,blindAnswerIndex:3})},items).decision,'fail_hold')
  assert.equal(reviewDecision({...review,items:review.items.map((x,i)=>i?x:{...x,verdict:'material'})},items).decision,'fail_hold')
  assert.throws(()=>reviewDecision({...review,items:review.items.slice(1)},items))
  assert.throws(()=>reviewDecision({...review,items:review.items.map((x,i)=>i?x:{...x,answerReason:''})},items))
})

test('separate fresh feedback pass requires correct item identity and substantive explanation critique',()=>{
  const items=extractExactItems(fixture)
  const assessment={items:items.map(x=>({
    id:x.id,verdict:'pass',
    keyAndExplanationConsistency:'The given key and explanation directly agree with the scenario and principle.',
    misconceptionAndDistractorFeedback:'Each alternative is reviewed as a separate misconception or application boundary.',
  })),overallFeedbackVerdict:'A bounded original-feedback review without full examination readiness claims.'}
  assert.equal(explanationDecision(assessment,items).decision,'pass')
  assert.equal(explanationDecision({...assessment,items:assessment.items.map((x,i)=>i?x:{...x,verdict:'material'})},items).decision,'fail_hold')
  assert.equal(explanationDecision({...assessment,items:assessment.items.map((x,i)=>i?x:{...x,id:'another-question'})},items).decision,'fail_hold')
  assert.equal(explanationDecision({...assessment,items:assessment.items.map((x,i)=>i?x:{...x,keyAndExplanationConsistency:''})},items).decision,'fail_hold')
})
