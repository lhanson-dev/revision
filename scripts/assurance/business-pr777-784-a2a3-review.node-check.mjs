import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { MARKER, REPAIR_MARKER, SETTINGS, PACK_PATHS, DIMENSIONS, parseTrustedEvent, gitBlobSha, validateReview, verifiedCiReceipt } from './business-pr777-784-a2a3-review.mjs'

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
  it('accepts only allowed exact-head SHA comments from Owner on selected PRs',()=>{
    for(const id of [777,784,805,820]) {
      const parsed=parseTrustedEvent(event(id))
      assert.equal(parsed.id,id)
      assert.equal(parsed.head,head)
      assert.ok(parsed.settings.paths.length>0)
      assert.ok(parsed.settings.reviewedItemIds.length>=3)
    }
  })
  it('allows #809 only on its own exact-head owner marker and covers two distinct teaching methods', () => {
    const e=event(809,REPAIR_MARKER+'\nhead_sha: '+head)
    assert.equal(parseTrustedEvent(e).id,809)
    const c=SETTINGS[809]
    assert.equal(c.section,'3.2.2')
    assert.deepEqual(c.printedPages,[14])
    assert.deepEqual(c.questionIds,[])
    assert.deepEqual(c.reviewedItemIds,[
      'aqa-7132-3.2.2:expected-value','aqa-7132-3.2.2:net-gain','fi001-plan-to-learn-unscored-repair',
    ])
    assert.ok(c.paths.includes('src/app/practice-repair.ts'))
    assert.ok(c.paths.includes('src/app/GuidedMethodRepairView.tsx'))
    assert.ok(c.paths.includes('src/app/PlannerRuntime.tsx'))
    assert.ok(c.paths.includes('content/business/aqa-a-level/shared/decision-tree-numeric-practice.ts'))
    assert.ok(!c.paths.some(p=>p.toLowerCase().endsWith('.pdf')))
    assert.throws(()=>parseTrustedEvent(event(809)))
    assert.throws(()=>parseTrustedEvent(event(777,REPAIR_MARKER+'\nhead_sha: '+head)))
    assert.throws(()=>parseTrustedEvent(event(809,REPAIR_MARKER+'\nhead_sha: '+head+'\nmerge now')))
    assert.throws(()=>parseTrustedEvent({...e,comment:{...e.comment,user:{login:'not-owner'}}}))
  })
  it('scopes #805 to four Operations measures and nine original reviewed assets',()=>{
    const config=SETTINGS[805]
    assert.equal(config.section,'3.4.2')
    assert.deepEqual(config.printedPages,[18])
    assert.equal(config.questionBatch,'3.4')
    assert.deepEqual(config.questionIds,['q07','q08','q09'])
    assert.equal(config.reviewedItemIds.length,9)
    assert.ok(config.paths.includes('src/app/skill-recheck.ts'))
    assert.ok(config.paths.includes('content/business/aqa-a-level/shared/operations-performance-practice.ts'))
    assert.ok(!config.paths.some(p=>p.toLowerCase().endsWith('.pdf')))
    assert.ok(config.reviewedItemIds.every(id=>id==='operations-four-performance-measures'||id.startsWith('rev7132-3.4.2-')))
  })
  it('allowlists only bounded real-chart and final-number 820 materials, not generic course or source PDF',()=>{
    const cfg=SETTINGS[820]
    assert.equal(cfg.section,'3.4.5')
    assert.deepEqual(cfg.printedPages,[19])
    assert.equal(cfg.questionBatch,'3.4')
    assert.deepEqual(cfg.questionIds,['q13','q20','q43'])
    assert.equal(cfg.reviewedItemIds.length,5)
    assert.ok(cfg.paths.includes('content/business/aqa-a-level/shared/operations-inventory-chart-supplement.ts'))
    assert.ok(cfg.paths.includes('src/app/ui/learn/Quantitative.tsx'))
    assert.ok(!cfg.paths.some(p=>p.toLowerCase().endsWith('.pdf')))
    assert.ok(cfg.reviewedItemIds.every(id=>id==='operations-inventory-control-chart'||id.startsWith('rev7132-3.4.5-inventory-')))
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

describe('reviewer receives actual paper-pack sources and trusted CI evidence',()=>{
  it('requires each of the real three published Business paper pack definitions',()=>{
    assert.deepEqual(PACK_PATHS,[
      'content/business/aqa-a-level/paper-1/index.ts',
      'content/business/aqa-a-level/paper-2/index.ts',
      'content/business/aqa-a-level/paper-3/index.ts',
    ])
    const workflow=readFileSync('.github/workflows/business-pr777-784-independent-a2a3.yml','utf8')
    assert.match(workflow,/actions: read/)
    const code=readFileSync('scripts/assurance/business-pr777-784-a2a3-review.mjs','utf8')
    assert.match(code,/publishedPaperPackSources:packs/)
    assert.match(code,/verifiedGitHubCi:ci/)
  })
  it('requires exact head, all nine successful CI jobs and rejects newer failed CI',()=>{
    const labels=[
      'Assurance plan and secret scan','Foundation static, unit and build assurance',
      'Database, RLS and protected service assurance','Real Auth standard signup assurance',
      'Responsive browser assurance (phone, shard 1/1)',
      'Responsive browser assurance (tablet, shard 1/1)',
      'Responsive browser assurance (desktop, shard 1/2)',
      'Responsive browser assurance (desktop, shard 2/2)','Foundation quality',
    ]
    const jobs=labels.map(name=>({name,status:'completed',conclusion:'success'}))
    const good={id:123,head_sha:head,name:'Revision CI',status:'completed',conclusion:'success',
      event:'pull_request',created_at:'2026-11-02T12:00:00Z',html_url:'https://github.com/lhanson-dev/revision/actions/runs/123'}
    assert.equal(verifiedCiReceipt([good],jobs,head).runId,123)
    assert.throws(()=>verifiedCiReceipt([good],jobs,'b'.repeat(40)))
    assert.throws(()=>verifiedCiReceipt([good],jobs.slice(1),head))
    assert.throws(()=>verifiedCiReceipt([good],jobs.map((job,i)=>i===1?{...job,conclusion:'failure'}:job),head))
    assert.throws(()=>verifiedCiReceipt([good,{...good,id:124,conclusion:'failure',created_at:'2026-11-02T13:00:00Z'}],jobs,head))
    assert.throws(()=>verifiedCiReceipt([{...good,event:'push'}],jobs,head))
    assert.throws(()=>verifiedCiReceipt([good],[...jobs,jobs[0]],head))
  })
})
