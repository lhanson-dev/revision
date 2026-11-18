import test from 'node:test';import assert from 'node:assert/strict';
import {MARKER,eventHead,blobSha,sections,verifyFiles,verifyReview,parseSqlCandidateRow} from './lf05-pr854-all33-a3-review.mjs';
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
