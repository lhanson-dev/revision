// Research prototype only. No runtime wiring, API, learner data or calibrated marks.
// Separate context IDs and run IDs are bookkeeping, not proof of actual independence.
// Candidate same-level/within-one rule is intentionally conservative, NOT validated.
// Exact quote presence is not semantic verification. A qualified reviewer has not approved this rubric.
export function provisionalDecision(pack,answer,runs,expectedPacketBlob){
 const hold=(reason)=>({status:"review_only",mark:null,range:null,reason,evidenceUse:"none",label:"AI estimate — not yet independently examiner-validated"});
 if(!pack||!Array.isArray(pack.candidateBands)||!answer?.trim()||!expectedPacketBlob||!Array.isArray(runs)||runs.length!==2)return hold("Missing assessment context or second assessment");
 if(runs[0].runId===runs[1].runId||runs[0].contextId===runs[1].contextId)return hold("Assessments are not separately identified");
 for(const r of runs){
  if(!r.runId?.trim()||!r.contextId?.trim()||!r.modelVersion?.trim()||r.packetBlob!==expectedPacketBlob||r.questionId!==pack.id||r.status!=="complete")return hold("Assessment provenance or completion invalid");
  const band=Number.isInteger(r.level)&&pack.candidateBands[r.level];
  if(!band||!Number.isInteger(r.mark)||r.mark<band[0]||r.mark>band[1]||typeof r.quote!=="string"||!r.quote.trim()||!answer.includes(r.quote)||!r.rationale?.trim()||!r.improvement?.trim())return hold("Assessment output failed integrity checks");
 }
 const [a,b]=runs, delta=Math.abs(a.mark-b.mark);
 if(delta>1||a.level!==b.level)return hold("The two assessments disagree; review guidance instead");
 return {status:"provisional_range",mark:null,range:[Math.min(a.mark,b.mark),Math.max(a.mark,b.mark)],reason:"Two structurally valid assessments are close; this is not evidence of examiner accuracy",evidenceUse:"none",label:"AI estimate — not yet independently examiner-validated"};
}
