import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {blobSha, verifyFiles, verifyReview} from './lf05-pr854-all33-a3-review.mjs';

// This is deliberately a NO-NETWORK, NO-API, READ-ONLY evidence checker.
// Educational correctness and fresh-chat independence are NOT proven by JSON structure.
export const SOURCE_PATHS=[
 'supabase/migrations/20261117212000_stage_lf05_next_six_review_candidates.sql',
 'supabase/migrations/20261117222000_stage_lf05_remaining_27_review_candidates.sql',
 'audits/2026-11-17-lf05-33-blind-question-review-packet.md',
 'audits/2026-11-17-lf05-33-guided-review-packet.md'
];
const BATCH_ROOT='audits/lf05-fresh-chat-review';
const hex40=/^[a-f0-9]{40}$/;
function assert(value,msg){if(!value)throw Error(msg)}
function date(value){const x=typeof value==='string'?Date.parse(value):NaN;assert(Number.isFinite(x),'Missing/invalid dated review stage');return x}
export function checkManualReviewReceipt(receipt,sourceText,batchFiles){
 assert(receipt?.reviewMethod==='fresh-chat-outside-authoring-project','Fresh-chat method declaration missing');
 assert(hex40.test(receipt?.reviewedSourceCommit),'Exact candidate source commit SHA missing');
 assert(typeof receipt.sourceRightsBasis==='string'&&receipt.sourceRightsBasis.trim().length>=20,'Source-rights basis missing');
 assert(Array.isArray(sourceText)&&sourceText.length===4,'Four authoritative source files required');
 const sourceBlobs=sourceText.map(blobSha);
 assert(JSON.stringify(receipt.sourceBlobs)===JSON.stringify(sourceBlobs),'Source changed since review; invalidate evidence');
 const {blind,guided}=verifyFiles(sourceText);
 assert(Array.isArray(receipt.batches)&&receipt.batches.length===11,'Exactly eleven review batches required');
 const allIds=new Set();
 let material=0,minor=0;
 for(let k=0;k<11;k++){
  const row=receipt.batches[k],ids=blind.slice(k*3,k*3+3).map(x=>x.id),n=String(k+1).padStart(2,'0');
  assert(row?.batch===n,'Incorrect batch order '+n);
  assert(row?.session?.outsideAuthoringProject===true,'Fresh context not attested for batch '+n);
  assert(typeof row.session.reference==='string'&&row.session.reference.length>=12,'Missing reviewer session reference '+n);
  assert(date(row.blindFrozenAt)<=date(row.guideRevealedAt),'Guidance disclosed before blind freeze in '+n);
  const b=batchFiles[2*k],g=batchFiles[2*k+1];
  assert(typeof b==='string'&&typeof g==='string','Both sealed packets required for '+n);
  for(let h=0;h<3;h++){
   const original=blind[k*3+h],id=original.id,guide=guided.get(id);
   const foundGuide=sourceText[3].match(new RegExp('^## '+id+' —[\\s\\S]*?(?=^## (?:BUS|PSY)-LF05-|$)','m'))?.[0];
   assert(b.includes(original.text.split('\n').filter(x=>!/^(\\*\\*Historical finding:|\\*\\*Source metadata:)/.test(x)).join('\n').trim()),
    'Blind batch source text differs from trusted source '+id);
   assert(g.includes(guide.split('\n').filter(x=>!/^(\\*\\*Historical finding:|\\*\\*Source metadata:)/.test(x)).join('\n').trim()),
    'Guided batch source differs from trusted source '+id);
   assert(!b.includes('Authored indicative guidance'),'Guidance leaked into blind packet '+id);
   assert(!allIds.has(id),'Duplicate reviewed identity '+id);allIds.add(id);
   assert(guide.includes('**Question:**'),'Guided source mismatch '+id);
  }
  const bv=verifyReview(row.blind,ids).items;
  const gv=verifyReview(row.guided,ids).items;
  for(const item of [...bv,...gv]) {
   if(['material','blocking'].includes(item.verdict))material++;
   if(item.verdict==='minor')minor++;
  }
 }
 assert(allIds.size===33,'Missing candidate ID(s)');
 return {reviewedItems:33,questionVerdicts:33,guideVerdicts:33,materialOrBlocking:material,minor,
  structuralResult:'COMPLETE_STRUCTURED',publicationDecision:'HOLD_PENDING_INDEPENDENCE_AND_SOURCE_ADJUDICATION',
  note:'Format/hash checks cannot independently verify AI review quality, conversation separation or source rights. No automatic approval or publication.'};
}
export async function main(argv=process.argv.slice(2)){
 const receiptPath=argv[0];if(!receiptPath)throw Error('Usage: node scripts/assurance/lf05-pr854-fresh-chat-check.mjs <receipt.json>');
 const receipt=JSON.parse(await readFile(receiptPath,'utf8'));
 const texts=await Promise.all(SOURCE_PATHS.map(p=>readFile(p,'utf8')));
 const batches=[];for(let i=1;i<=11;i++){const z=String(i).padStart(2,'0');
  batches.push(await readFile(BATCH_ROOT+'/batch-'+z+'-blind.md','utf8'),await readFile(BATCH_ROOT+'/batch-'+z+'-guided.md','utf8'));
 }
 console.log(JSON.stringify(checkManualReviewReceipt(receipt,texts,batches),null,2));
}
if(process.argv[1]===fileURLToPath(import.meta.url))main().catch(e=>{console.error('LF-05 manual review evidence HOLD: '+e.message);process.exitCode=1});
