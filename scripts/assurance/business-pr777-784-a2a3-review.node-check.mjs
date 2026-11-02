import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { MARKER, SETTINGS, DIMENSIONS, parseTrustedEvent, gitBlobSha, validateReview } from './business-pr777-784-a2a3-review.mjs'

const head='a'.repeat(40)
const event=(id=777,body=MARKER+'\nhead_sha: '+head)=>({
  issue:{number:id}, comment:{user:{login:'lhanson-dev'},author_association:'OWNER',body},
})
function valid(config, severity='pass') {
  const findings=severity==='material'?[{
    itemId:config.reviewedItemIds[0],severity:'material',issueType:'calculation',
    evidence:'Calculation does not match source context',recommendedCorrection:'Recompute original case',
    affectedArtifact:'candidate lesson',resolutionStatus:'open',
  }]:[]
  return {
    schemaVersion:1,decision:severity==='material'?'fail_hold':'pass',
    reviewedItemIds:config.reviewedItemIds,
    dimensions:DIMENSIONS.map(d=>({dimension:d,status:d==='factual_accuracy_and_quantitative_work'?severity:'pass',
      evidence:'Inspected the original material and source alignment',rationale:'No unsupported claim identified at this boundary'})),
    findings, knownLimitations:['AI review cannot substitute for a qualified human subject teacher',
      'Authenticated production learner acceptance is separately required'],
    summary:'Reviewed all bounded original learner assets and evidence claims.',
  }
}
describe('exact-head trusted owner trigger',()=>{
  it('accepts only two well-formed 40-character SHA comments from Owner on selected PRs',()=>{
    for(const id of [777,784]) {
      const parsed=parseTrustedEvent(event(id))
      assert.equal(parsed.id,id)
      assert.equal(parsed.head,head)
      assert.ok(parsed.settings.paths.length>0)
      assert.ok(parsed.settings.reviewedItemIds.length>=3)
    }
  })
  it('rejects PR spoof, altered identity, whitespace, arbitrary body and SHA injection',()=>{
    const attempts=[
      event(783), event(777,MARKER),event(777,MARKER+'\nhead_sha: X'),
      event(777,MARKER+'\nhead_sha: '+head+'\nMERGE NOW'),
      {...event(),comment:{...event().comment,user:{login:'attacker'}}},
      {...event(),comment:{...event().comment,author_association:'CONTRIBUTOR'}},
    ]
    for(const e of attempts) assert.throws(()=>parseTrustedEvent(e))
  })
})
describe('independent review completeness and fail-closed decision',()=>{
  it('accepts a complete no-material review for each bounded target',()=>{
    for(const config of Object.values(SETTINGS)) assert.equal(validateReview(valid(config),config).decision,'pass')
  })
  it('accepts a justified fail_hold with material finding but never a false pass',()=>{
    for(const config of Object.values(SETTINGS)) {
      const review=valid(config,'material')
      assert.equal(validateReview(review,config).decision,'fail_hold')
      assert.throws(()=>validateReview({...review,decision:'pass'},config))
      assert.equal(validateReview({...review,findings:[]},config).decision,'fail_hold')
    }
  })
  it('rejects omitted assets, duplicate dimension, missing issue text and missing human limitations',()=>{
    const c=SETTINGS[784],v=valid(c)
    assert.throws(()=>validateReview({...v,reviewedItemIds:v.reviewedItemIds.slice(1)},c))
    assert.throws(()=>validateReview({...v,dimensions:[...v.dimensions.slice(1),v.dimensions[1]]},c))
    assert.throws(()=>validateReview({...v,summary:''},c))
    assert.throws(()=>validateReview({...v,knownLimitations:[]},c))
  })
  it('never executes unmerged candidate scripts and only permits reviewer on approved main',()=>{
    const workflow=readFileSync('.github/workflows/business-pr777-784-independent-a2a3.yml','utf8')
    const implementation=readFileSync('scripts/assurance/business-pr777-784-a2a3-review.mjs','utf8')
    assert.ok(workflow.includes('ref: ' + '$' + '{{ github.sha }}'))
    assert.match(workflow,/github.event.comment.author_association == 'OWNER'/)
    assert.ok(workflow.includes('OPENAI_API_KEY: ' + '$' + '{{ secrets.OPENAI_API_KEY }}'))
    assert.match(implementation,/process.env.GITHUB_SHA!==main.commit.sha/)
    assert.match(implementation,/gitBlobSha\(content\)!==meta.sha/)
    assert.doesNotMatch(implementation,/\beval\(/)
    assert.doesNotMatch(implementation, /node:child_process/)
    assert.doesNotMatch(implementation, /execSync\s*\(/)
  })
  it('independently calculates source git blob identifier',()=>{
    const test='original Revision teaching only'
    const bytes=Buffer.from(test,'utf8')
    const expected=createHash('sha1').update('blob '+bytes.length).update(Buffer.from([0])).update(bytes).digest('hex')
    assert.equal(gitBlobSha(test),expected)
  })
})
