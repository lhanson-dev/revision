import test from 'node:test';import assert from 'node:assert/strict';
import {MARKER,eventHead,blobSha,sections,verifyFiles,verifyReview,parseSqlCandidateRow,SOURCE_CONSTRAINTS,REVIEW_BATCH_SIZE,MAX_CALLS} from './lf05-pr854-all33-a3-review.mjs';
const event={repository:{full_name:'lhanson-dev/revision'},issue:{number:854,pull_request:{}},comment:{user:{login:'lhanson-dev'},author_association:'OWNER',body:MARKER+'\nhead_sha: '+'a'.repeat(40)}};
test('owner exact PR and immutable head only',()=>{assert.equal(eventHead(event),'a'.repeat(40));assert.throws(()=>eventHead({...event,issue:{number:834,pull_request:{}}}));assert.throws(()=>eventHead({...event,comment:{...event.comment,body:'approve'}}));});
test('real git blob checksum',()=>assert.equal(blobSha('hello\n'),'ce013625030ba8dba906f756967f9e9ca394464a'));
test('33 source rows and packets mandatory',()=>{assert.throws(()=>sections('## PSY-LF05-01 — only one'));assert.throws(()=>verifyFiles(['','','','']))});
test('review must include all exact identities and rationales',()=>{const v={items:[{id:'PSY-LF05-01',verdict:'pass',sourceFit:'Sufficient source alignment',reasoning:'Sufficient candidate reasoning',alternatives:'Clear alternative credit',corrections:'No material edits suggested'}]};assert.equal(verifyReview(v,['PSY-LF05-01']).items.length,1);assert.throws(()=>verifyReview(v,['BUS-LF05-01-16']))});

test('SQL candidates are parsed literally including escaped apostrophes and JSON guidance',()=>{
 const row="('BUS-LF05-TEST','aqa:aqa-a-level:7132',1,'finance','AQA 7132 §3.5','Example','Why isn''t profit cash?','A 50% sale.',16,'[\"Cash and profit differ.\"]'::jsonb,'source','held')";
 const x=parseSqlCandidateRow(row);
 assert.equal(x.question,"Why isn't profit cash?");
 assert.deepEqual(x.guide,['Cash and profit differ.']);
 assert.equal(x.style,16);
 assert.throws(()=>parseSqlCandidateRow("('invalid')"));
});

test('review batches fit complete 33 denominator with source-grounded questions',()=>{
 assert.equal(REVIEW_BATCH_SIZE,3);
 assert.ok(Math.ceil(33/REVIEW_BATCH_SIZE)*2<=MAX_CALLS);
 assert.match(SOURCE_CONSTRAINTS.business,/Sections C and D/);
 assert.match(SOURCE_CONSTRAINTS.business,/§3\.7\.8/);
 assert.match(SOURCE_CONSTRAINTS.psychology,/§4\.1\.4/);
 assert.match(SOURCE_CONSTRAINTS.psychology,/data-driven approach/);
});

test('review failure identifies the exact invalid item and field without approving it',()=>{
 const valid={id:'PSY-LF05-01',verdict:'pass',sourceFit:'Exact AQA source alignment',reasoning:'Consistent complete explanation',alternatives:'Accept supported alternatives',corrections:'No correction required.'};
 assert.equal(verifyReview({items:[valid]},[valid.id]).items.length,1);
 assert.throws(()=>verifyReview({items:[{...valid,corrections:'None'}]},[valid.id]),/Insufficient corrections for PSY-LF05-01/);
 assert.throws(()=>verifyReview({items:[{...valid,id:'UNKNOWN'}]},[valid.id]),/Unknown review ID/);
 assert.throws(()=>verifyReview({items:[valid,valid]},[valid.id, 'PSY-LF05-02']),/Duplicate review ID/);
 assert.throws(()=>verifyReview({items:[]},[valid.id]),/Incomplete review/);
 assert.throws(()=>verifyReview({items:[{...valid,verdict:'yes'}]},[valid.id]),/Invalid verdict/);
});
test('bounded retry budget allows eleven independent blind and guide batches without unbounded provider calls',()=>{
 assert.equal(REVIEW_BATCH_SIZE,3);
 assert.equal(Math.ceil(33/REVIEW_BATCH_SIZE)*2,22);
 assert.ok(MAX_CALLS>=22 && MAX_CALLS<=36);
});
