// Research-only full-bank marking contracts; not imported by learner runtime.
export function validateBank(bank){
 const errors=[],seen=new Set(),counts={};
 for(const p of bank.packs){const f=bank.families[p.family];if(seen.has(p.id))errors.push("duplicate "+p.id);seen.add(p.id);
 if(!f||p.maxMark!==f.max||!p.prompt?.trim()||!p.scope?.trim()||!p.sourceBlob||!Array.isArray(p.guide)||p.guide.length<5||p.guide.some(x=>typeof x!=="string"||!x.trim())||p.status!=="unvalidated_research")errors.push("invalid pack "+p.id);
 if(f){if(f.bands[0][0]!==0||f.bands.at(-1)[1]!==f.max||f.bands.some((b,i)=>b[0]>b[1]||(i&&b[0]!==f.bands[i-1][1]+1))||f.signals.length!==f.bands.length)errors.push("bad scale "+p.id);
 if(f.emphasis&&Object.values(f.emphasis).reduce((s,v)=>s+v,0)!==f.max)errors.push("bad emphasis "+p.id);
 if(p.family==="psychology-research-methods-training"&&f.emphasis!==null)errors.push("invented research tariff");}
 if(p.family?.includes("contextual")&&!p.stimulus)errors.push("missing stimulus "+p.id);
 if(p.family?.includes("standalone")&&p.stimulus)errors.push("unexpected stimulus "+p.id);
 counts[p.family]=(counts[p.family]??0)+1;
 }
 if(bank.packs.length!==39)errors.push("bank not 39");
 for(const [id,n] of Object.entries({"business-contextual-16":10,"business-standalone-25":10,"psychology-contextual-16":2,"psychology-standalone-16":16,"psychology-research-methods-training":1}))if(counts[id]!==n)errors.push("family count "+id);
 return {errors,counts};
}
export function buildRequest(bank,id,answer){
 const p=bank.packs.find(x=>x.id===id),f=p&&bank.families[p.family];if(!p||!f||typeof answer!=="string"||!answer.trim()||answer.length>30000)throw Error("invalid research input");
 return {questionId:p.id,packVersion:p.version,question:p.prompt,stimulus:p.stimulus,maximum:p.maxMark,levels:f.bands,assessmentEmphasis:f.emphasis,levelSignals:f.signals,markingRules:f.rules,questionSpecificGuide:p.guide,answer};
}
