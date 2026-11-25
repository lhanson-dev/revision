import test from 'node:test';import assert from 'node:assert/strict';
import {checkManualReviewReceipt,SOURCE_PATHS} from './lf05-pr854-fresh-chat-check.mjs';
test('portable review never approves absent, incomplete or fake source and stage evidence',()=>{
 assert.equal(SOURCE_PATHS.length,4);
 assert.throws(()=>checkManualReviewReceipt({},[],[]),/Fresh-chat method/);
 assert.throws(()=>checkManualReviewReceipt({reviewMethod:'fresh-chat-outside-authoring-project',reviewedSourceCommit:'f'.repeat(40),sourceRightsBasis:'Allowed structured references only'},[],[]),/Four authoritative source files/);
 assert.throws(()=>checkManualReviewReceipt({reviewMethod:'fresh-chat-outside-authoring-project',reviewedSourceCommit:'f'.repeat(40),sourceRightsBasis:'Allowed structured references only',sourceBlobs:['a']},['a','b','c','d'],[]),/Source changed/);
});
test('manual receipt checker has no network calls, external model requests or publication side effects',async()=>{
 const {readFile}=await import('node:fs/promises');
 const text=await readFile(new URL('./lf05-pr854-fresh-chat-check.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(text, /fetch\(|api\.openai\.com|SUPABASE_SERVICE_ROLE_KEY|update\s+public\.lf05_written_questions/i);
 assert.match(text,/publicationDecision:'HOLD_PENDING_INDEPENDENCE_AND_SOURCE_ADJUDICATION'/);
 assert.match(text,/blindFrozenAt/);
 assert.match(text,/guideRevealedAt/);
 assert.match(text,/verifyFiles\(sourceText\)/);
 assert.match(text,/verifyReview\(row\.blind,ids\)/);
 assert.match(text,/verifyReview\(row\.guided,ids\)/);
});
