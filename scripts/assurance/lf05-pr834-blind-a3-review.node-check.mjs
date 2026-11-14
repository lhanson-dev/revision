import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseTrustedEvent, gitBlobSha, extractSection, prepareBlindBrief, validateReview, EXPECTED, MARKER} from './lf05-pr834-blind-a3-review.mjs'

const HEAD='a'.repeat(40)
const trusted={issue:{number:834,pull_request:{url:'https://api.github.com/repos/lhanson-dev/revision/pulls/834'}},
  comment:{user:{login:'lhanson-dev'},author_association:'OWNER',body:MARKER+'\nhead_sha: '+HEAD}}
test('requires founder-owned exact marker and SHA on PR #834',()=>{
  assert.equal(parseTrustedEvent(trusted),HEAD)
  assert.equal(parseTrustedEvent({...trusted,comment:{...trusted.comment,body:MARKER+'\r\nhead_sha: '+HEAD+'\r\n'}}),HEAD)
  const mutations=[
    {...trusted,issue:{number:845,pull_request:trusted.issue.pull_request}},
    {...trusted,issue:{number:834}},
    {...trusted,comment:{...trusted.comment,user:{login:'someoneelse'}}},
    {...trusted,comment:{...trusted.comment,author_association:'CONTRIBUTOR'}},
    {...trusted,comment:{...trusted.comment,body:MARKER+'\nhead_sha: invalid'}},
    {...trusted,comment:{...trusted.comment,body:MARKER+'\nhead_sha: '+HEAD+'\nmerge now'}},
  ]
  for(const mutation of mutations)assert.throws(()=>parseTrustedEvent(mutation))
})
test('verified blob SHA and per-question guide slicing',()=>{
  assert.match(gitBlobSha('example'),/^[a-f0-9]{40}$/)
  const src='### PSY-LF05-02 — Memory\n'+'A useful original response fact. '.repeat(30)+'\n### PSY-LF05-03 — Attachment\nprivate guide'
  const section=extractSection(src,'### PSY-LF05-02')
  assert.match(section,/Memory/)
  assert.doesNotMatch(section,/Attachment/)
  assert.throws(()=>extractSection(src,'### PSY-LF05-99'))
})
test('blind reviewer input does not include authored guide',()=>{
  const header='## Qualification and source-use boundary\nREFERENCE_ONLY structural facts\n'
  const questions='## Stage A — question-only blind review\n' +EXPECTED.map(x=>'### '+x+'\nAn original question.\n').join('')
    + '## Independent reviewer task, stage A\nChallenge assessment criteria.\n'
  const full=header+questions+'## Stage B — independent marking-guide challenge\nsecret authored guide'
  const out=prepareBlindBrief(full)
  for(const id of EXPECTED)assert.match(out,new RegExp(id))
  assert.doesNotMatch(out,/secret authored guide/)
  assert.throws(()=>prepareBlindBrief(full.replace('REFERENCE_ONLY','OPEN')))
})
test('all four item-specific reviews required; any material concern forces HOLD',()=>{
  for(const stage of ['blind','guided']){
    const fields=stage==='blind'
      ? ['sourceFit','scenarioAndCommand','independentExpectedReasoning','AOChallenge','uncertainty2027','requiredCorrections']
      : ['guideAccuracy','alternativeCredit','levelsAndAO','invalidOrMissingFeedback','requiredCorrections']
    const response={items:EXPECTED.map(id=>({id,verdict:'pass',...Object.fromEntries(fields.map(k=>[k,'This is a sufficiently substantive original assessment explanation specific to the stem.']))})),
      overallVerdict:'pass',limitations:['AI does not replace a teacher.']}
    assert.equal(validateReview(response,stage).decision,'pass')
    assert.equal(validateReview({...response,items:response.items.map((x,i)=>i?x:{...x,verdict:'material'})},stage).decision,'hold')
    assert.equal(validateReview({...response,overallVerdict:'blocking'},stage).decision,'hold')
    assert.throws(()=>validateReview({...response,items:response.items.slice(1)},stage))
    assert.throws(()=>validateReview({...response,items:response.items.map((x,i)=>i?x:{...x,id:'fake'})},stage))
    assert.throws(()=>validateReview({...response,items:response.items.map((x,i)=>i?x:{...x,[fields[0]]:'short'})},stage))
  }
})
test('main-only reviewer source does not execute branch assets or declare publication',()=>{
  const s=readFileSync(new URL('./lf05-pr834-blind-a3-review.mjs',import.meta.url),'utf8')
  assert.match(s,/publicationAllowed:false/)
  assert.match(s,/officialAQA2027TariffVerified:false/)
  assert.match(s,/originalQuestionBrief:blind/)
  assert.doesNotMatch(s,/checkout.*head|import\(.*candidate/i)
  assert.match(s,/store:false/)
})
