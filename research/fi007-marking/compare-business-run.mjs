// Research only; no API or release. Usage: node compare-business-run.mjs packet-envelope.json result.json
// Envelope sourcePacketBlob must match pinned run input; provenance must be checked externally.
import {readFileSync} from 'node:fs';
function compare(packet, run) {
 const errors=[], groups={}, seen=new Set();
 if(!packet.sourcePacketBlob||run.sourcePacketBlob!==packet.sourcePacketBlob)errors.push("packet identity mismatch");
 for(const r of run.results??[]){
  if(seen.has(r.reviewId)){errors.push("duplicate "+r.reviewId);continue;}
  seen.add(r.reviewId);
  const c=packet.cases.find(x=>x.reviewId===r.reviewId),p=c&&packet.packs.find(x=>x.id===c.questionId);
  const band=p&&Number.isInteger(r.level)&&p.candidateBands[r.level];
  if(!band||!Number.isInteger(r.mark)||r.mark<band[0]||r.mark>band[1]||!r.quote?.trim()||!c.response.includes(r.quote)||!r.rationale?.trim()||!r.improvement?.trim()){errors.push("invalid result "+r.reviewId);continue;}
  const g=groups[p.id]??={count:0,paired:0,absolute:0,signed:0,exact:0,withinOne:0,levelAgreement:0};g.count++;
  const b=Number.isInteger(c.referenceLevel)&&p.candidateBands[c.referenceLevel];
  if(c.reviewState!=="independent_human_confirmed"||!c.referenceReviewerId||!c.referenceRationale?.trim()||!b||!Number.isInteger(c.referenceMark)||c.referenceMark<b[0]||c.referenceMark>b[1])continue;
  const d=r.mark-c.referenceMark;g.paired++;g.absolute+=Math.abs(d);g.signed+=d;g.exact+=Number(d===0);g.withinOne+=Number(Math.abs(d)<=1);g.levelAgreement+=Number(r.level===c.referenceLevel);
 }
 for(const c of packet.cases)if(!seen.has(c.reviewId))errors.push("missing "+c.reviewId);
 const independent=run.status==="independent_model_run"&&!!run.modelVersion?.trim()&&!!run.runId?.trim();
 const families=Object.entries(groups).map(([id,g])=>({id,count:g.count,paired:g.paired,metrics:independent&&!errors.length&&g.paired===g.count&&g.paired>0?{meanAbsoluteError:g.absolute/g.paired,meanSignedError:g.signed/g.paired,exactAgreement:g.exact/g.paired,withinOne:g.withinOne/g.paired,levelAgreement:g.levelAgreement/g.paired}:null}));
 return {status:"HOLD",reason:"Research only: external provenance, thresholds and release validation not established",independentRunDeclared:independent,errors,families};
}
const [p,r]=process.argv.slice(2);if(!p||!r)throw Error('Provide packet and run JSON paths');console.log(JSON.stringify(compare(JSON.parse(readFileSync(p,'utf8')),JSON.parse(readFileSync(r,'utf8'))),null,2));
