/**
 * LF-05 full original 37-item assessment question and marking-guide review.
 * Trusted-main executable, inert exact-head research PR #834 inputs, owner-trigger only.
 * A fresh AI A3 challenge is NOT examiner calibration, official 2027 tariff or publication.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'

export const REVIEW_PR = 834
export const MARKER = 'revision-run-lf05-pr834-all37-a3:v1'
export const PSY_IDS = Array.from({length:17},(_,i)=>'PSY-LF05-'+String(i+1).padStart(2,'0'))
export const BUS_IDS = Array.from({length:10},(_,i)=>['BUS-LF05-'+String(i+1).padStart(2,'0')+'-16','BUS-LF05-'+String(i+1).padStart(2,'0')+'-25']).flat()
export const IDS = [...PSY_IDS,...BUS_IDS]
export const CONTEXT_VARIANT_IDS=['PSY-LF05-01-S1','PSY-LF05-02-S1']
const REPO='lhanson-dev/revision'
const MODEL='gpt-5.6-terra'
const OUTPUT='.artifacts/lf05-pr834-all37-a3'
const BATCH_SIZE=6
const MAX_CALLS=14
const MAX_OUTPUT_TOKENS=7500
const MAX_ESTIMATED_USD=6
const SOURCE='research/lf05-extended-response/'
const FILES=[
  SOURCE+'psychology-7182-2027-17-topic-original-16-mark-candidates.md',
  SOURCE+'business-7132-2027-10-area-original-16-and-25-mark-candidates.md',
  SOURCE+'learner-review/psychology-scenario-questions-proposed-v1.md',
  SOURCE+'learner-review/psychology-scenario-marking-guidance-proposed-v1.md',
]
const SOURCE_FACTS={
  source_use:'REFERENCE_ONLY: do not reproduce protected AQA text or official mark schemes',
  psychology:{code:'7182',version:'1.4',cohort:'A-level summer 2027',pdf_sha256:'db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d',
    components:'Paper 1 compulsory Social Influence, Memory, Attachment, Clinical Psychology and Mental Health; Paper 2 compulsory Approaches, Biopsychology, Research Methods; Paper 3 compulsory Issues and Debates plus one chosen topic per each of three option groups; each paper totals 96 marks',
    AOs:'AO1 knowledge; AO2 apply to theoretical/practical/data contexts; AO3 analyse/interpret/evaluate',
    topic_sources:['4.1.1 Social influence','4.1.2 Memory','4.1.3 Attachment','4.1.4 Clinical Psychology and Mental Health','4.2.1 Approaches','4.2.2 Biopsychology','4.2.3 Research Methods','4.3.1 Issues and Debates','4.3.2 Relationships','4.3.3 Gender','4.3.4 Cognition and Development','4.3.5 Schizophrenia','4.3.6 Eating Behaviour','4.3.7 Stress','4.3.8 Aggression','4.3.9 Forensic Psychology','4.3.10 Addiction'],
    verifiedGranularExamples:{
      socialInfluence:'7182 v1.4 §4.1.1: resistance to social influence includes social support and locus of control; a scenario can illustrate these without proving a personality trait.',
      memory:'7182 v1.4 §4.1.2: working-memory model includes central executive, phonological loop, visuo-spatial sketchpad and episodic buffer.',
      eatingBehaviour:'7182 v1.4 §4.3.6: anorexia nervosa has genetic/neural biological explanations and family systems, social learning and cognitive psychological explanations.',
      aggression:'7182 v1.4 §4.3.8: social psychological explanations include frustration-aggression, social learning and de-individuation.',
      forensic:'7182 v1.4 §4.3.9: offender profiling includes typology (organised/disorganised), investigative psychology (data-driven) and geographical profiling; these are distinct, not interchangeable.',
      addiction:'7182 v1.4 §4.3.10: gambling addiction involves learning accounts (partial/variable reinforcement) and cognitive accounts (biases); 16-mark topic tariff remains unverified.'
    },
    source_limitation:'2027 Set 3 specimen mark schemes not inspected; 16 marks per topic is NOT a specification guarantee'},
  business:{code:'7132',version:'2.0',cohort:'A-level summer 2027; outgoing qualification',pdf_sha256:'3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332',
    components:'Paper 1 two optional-choice essay sections at 25 marks each; Paper 2 data response; Paper 3 case study; each paper totals 100 marks',
    AOs:'AO1 knowledge; AO2 business-context application; AO3 causal analysis; AO4 evidenced evaluative judgement',
    topic_sources:['3.1 What is business?','3.2 Managers, leadership and decision making','3.3 Marketing management','3.4 Operational management','3.5 Financial management','3.6 Human resource management','3.7 Analysing strategic position','3.8 Choosing strategic direction','3.9 Strategic methods','3.10 Managing strategic change'],
    verifiedGranularExamples:{organisationCulture:'7132 v2.0 §3.10.2 covers organisational culture, influences and reasons/problems of changing it; Handy cultural models.',marketing:'§3.3 includes market research and marketing mix; Finance §3.5 includes profitability, cash flow and sources of finance.'},
    paper1StandaloneRule:'Official 7132 v2.0 scheme: Paper 1 Sections C/D require a choice between two 25-mark essays in each section. An attached case study is not mandatory for a broad Paper 1 essay. A source reviewer must assess whether the stem permits credible contextual application without manufacturing compulsory case facts.',
    source_limitation:'A question labelled 16- or 25-mark style is original training, not an official AQA item or guaranteed per-item AO distribution'},
}

export function founderHead(event) {
  if (event?.issue?.number!==REVIEW_PR || !event.issue.pull_request ||
      event?.comment?.user?.login!=='lhanson-dev' || event?.comment?.author_association!=='OWNER')
    throw Error('Only Founder-owned exact PR #834 comments authorise provider spend')
  const found=new RegExp('^'+MARKER+'(?:\\r\\n|\\n)head_sha: ([a-f0-9]{40})(?:\\r\\n|\\n)?$').exec(event.comment.body||'')
  if(!found)throw Error('Invalid exact all-37 review marker or immutable head')
  return found[1]
}
export function blobHash(text) {
  const data=Buffer.from(text,'utf8')
  return createHash('sha1').update('blob '+data.length).update(Buffer.from([0])).update(data).digest('hex')
}
function paragraphs(section) {
  return section.split('\n').map(s=>s.trim())
}
function matched(text,key) {
  const line=paragraphs(text).find(s=>s.startsWith(key))
  if(!line)throw Error('Missing '+key)
  return line.slice(key.length).trim()
}
function regions(source,re) {
  const m=[...source.matchAll(re)]
  return m.map((x,i)=>({id:x[1],title:x[2],text:source.slice(x.index,m[i+1]?.index||source.length)}))
}
function required(x,need){if(!x)throw Error(need);return x}
export function parseAllCandidates(psychSource,businessSource) {
  const psych=regions(psychSource,/^### (PSY-LF05-\d{2}) — ([^\n]+)/gm)
  const business=regions(businessSource,/^#### (BUS-LF05-\d{2}-(?:16|25)) — ([^\n]+)/gm)
  if(psych.length!==17||business.length!==20)throw Error('Full 37 original question denominator changed')
  const items=[]
  for(let i=0;i<psych.length;i++){
    const p=psych[i];if(p.id!==PSY_IDS[i])throw Error('Unexpected Psychology item identity/order')
    const line=matched(p.text,'- **Original question:** ')
    const source=matched(p.text,'- **Paper/option:** ')
    const ao=matched(p.text,'- **Provisional AO allocation:** ')
    const match=/AO1 (\d+) \/ AO2 (\d+) \/ AO3 (\d+)/.exec(ao)
    if(!match||match.slice(1).map(Number).reduce((a,b)=>a+b,0)!==16)throw Error('Psychology proposed AO arithmetic HOLD '+p.id)
    const guide=p.text.slice(p.text.indexOf('**Indicative marking guidance'))
      .split('**Fresh response variant')[0].split('**Fresh response')[0].trim()
    if(guide.length<450||!/Alternative valid answer routes/.test(guide)||!/Higher-band discrimination/.test(guide)||!/\[16 marks/.test(line))
      throw Error('Psychology guide missing question / alternatives / bands '+p.id)
    items.push({id:p.id,qualification:'Psychology 7182 v1.4',topic:p.title,
      sourceClaim:source,question:line,originalContext:null,tariffStyle:16,trainingOnly:p.id==='PSY-LF05-07',
      authoredAO:ao,authoredGuide:guide})
  }
  const bizAreas=[...businessSource.matchAll(/^### BUS-LF05-(\d{2}) — ([^\n]+)/gm)]
  const areaMap=Object.fromEntries(bizAreas.map(m=>[m[1],m[2]]))
  for(let i=0;i<business.length;i++){
    const p=business[i];if(p.id!==BUS_IDS[i])throw Error('Unexpected Business item identity/order')
    const question=matched(p.text,'**Original question:** ')
    const ao=matched(p.text,'**Provisional AO model:** ')
    const m=/AO1 (\d+), AO2 (\d+), AO3 (\d+), AO4 (\d+)/.exec(ao)
    const marks=Number(p.id.split('-').at(-1))
    if(!m||m.slice(1).map(Number).reduce((a,b)=>a+b,0)!==marks)throw Error('Business provisional AO arithmetic HOLD '+p.id)
    const hasStimulus=p.id.endsWith('-16')
    const context=hasStimulus?matched(p.text,'**Original stimulus (the learner must see it with this question):** '):null
    const guideStart=p.text.indexOf('**Indicative marking guide')
    const guide=guideStart<0?'':p.text.slice(guideStart).split('**Next-content requirement')[0].trim()
    if(!new RegExp('\\['+marks+' marks').test(question)||guide.length<450||!/Valid alternatives/.test(guide)||!/Level discriminator/.test(guide)||hasStimulus&&(!context||context.length<50))
      throw Error('Business guide/question/context incomplete '+p.id)
    items.push({id:p.id,qualification:'Business 7132 v2.0',topic:required(areaMap[p.id.split('-')[2]],'missing business area'),
      sourceClaim:'AQA 7132 v2.0 §3.'+Number(p.id.split('-')[2]),question,originalContext:context,
      tariffStyle:marks,trainingOnly:false,authoredAO:ao,authoredGuide:guide})
  }
  if(items.length!==37||new Set(items.map(x=>x.id)).size!==37)throw Error('37 identity uniqueness failed')
  return items
}
export function parseScenarioVariants(questionFile,guideFile){
  const questionRegions=regions(questionFile,/^## (PSY-LF05-0[12]-S1) — ([^\n]+)/gm)
  const guideRegions=regions(guideFile,/^## (PSY-LF05-0[12]-S1) — ([^\n]+)/gm)
  if(questionRegions.length!==2||guideRegions.length!==2)throw Error('Contextual variant pair denominator changed')
  return questionRegions.map((q,i)=>{
    const g=guideRegions[i]
    if(q.id!==CONTEXT_VARIANT_IDS[i]||g.id!==q.id)throw Error('Contextual question/guide identity drift')
    const sourceClaim=matched(q.text,'**Course/source alignment candidate:** ')
    const question=matched(q.text,'**Question:** ')
    const contextKey=i===0?'**Original fictional scenario:** ':'**Original fictional scenario and illustrative results:** '
    const context=matched(q.text,contextKey)
    if(context.length<180||g.text.length<750||!g.text.includes('**Alternative credit:**')||!g.text.includes('**Qualitative differentiation'))
      throw Error('Unreviewed scenario missing actual context / alternatives '+q.id)
    if(!/\*\*\[16 marks/.test(q.text)||!/§4\.1\.[12]/.test(sourceClaim))throw Error('Context training tariff/source absent '+q.id)
    return {id:q.id,qualification:'Psychology 7182 v1.4',topic:q.title,sourceClaim,
      question:question+' [16 marks — original training format]',originalContext:context,tariffStyle:16,trainingOnly:true,
      authoredAO:'PROVISIONAL AO1 6 / AO2 4 / AO3 6; exact 2027 item profile not verified',authoredGuide:g.text.split('## Shared original Revision training level anchors')[0].trim()}
  })
}
export function authoringSharedGuidance(psychSource,businessSource,contextualGuideSource) {
  // The authoring files put their original Revision training-only holistic grids
  // BEFORE the individual item sections. Stage B must see those grids to assess
  // the actual complete guidance; Stage A must not see any authored marking text.
  function extract(source,start,end,label) {
    const from=source.indexOf(start),to=source.indexOf(end,from+start.length)
    if(from<0||to<0||to<=from)throw Error('Missing shared original training rubric: '+label)
    const part=source.slice(from,to).trim()
    if(part.length<500||part.length>12000)throw Error('Unexpected shared rubric size: '+label)
    return part
  }
  return {
    psychology:extract(psychSource,'## Assessment rules for these candidates','### Source-first editorial reconciliation','Psychology'),
    business:extract(businessSource,'## Provisional original Revision level guides','## Original source-to-response candidates','Business'),
    contextual:extract(contextualGuideSource,'## Shared original Revision training level anchors','**Assurance status:**','Psychology context')
  }
}
export function blind(items) {
  return items.map(({id,qualification,topic,sourceClaim,question,originalContext,tariffStyle,trainingOnly})=>({
    id,qualification,topic,candidateSourceClaimUntrusted:sourceClaim,question,originalContext,tariffStyle,
    trainingOnly,verifyApplicationAndAOsIndependently:true}))
}
export function rejectBadReview(json,expected,stage) {
  const fields=stage==='blind'
    ? ['specAndCohortFit','questionDemand','scenarioIntegrity','independentStrongAnswer','independentWeakAnswer','validAlternativeRoutes','AOAndTariffRisk','specificFix']
    : ['guideTruthAndCompleteness','markingAOAndLevelLogic','creditableAlternatives','distinguishesStrongAndWeak','misleadingFeedbackRisks','specificFix']
  if(!Array.isArray(json?.items)||json.items.length!==expected.length||!['pass','minor','material','blocking'].includes(json?.overallVerdict)||!Array.isArray(json?.limitations))
    throw Error(stage+' invalid reviewer structure/denominator')
  for(let i=0;i<expected.length;i++){
    const x=json.items[i]
    if(x?.id!==expected[i]||!['pass','minor','material','blocking'].includes(x.verdict)||
       fields.some(field=>typeof x[field]!=='string'||x[field].trim().length<35))
      throw Error(stage+' incomplete issue report '+expected[i])
  }
  return {verdict:json.items.every(x=>['pass','minor'].includes(x.verdict))&&['pass','minor'].includes(json.overallVerdict)?'pass':'hold',
    ...json}
}
function schema(stage,ids) {
  const text={type:'string'}
  const fields=stage==='blind'
    ? ['specAndCohortFit','questionDemand','scenarioIntegrity','independentStrongAnswer','independentWeakAnswer','validAlternativeRoutes','AOAndTariffRisk','specificFix']
    : ['guideTruthAndCompleteness','markingAOAndLevelLogic','creditableAlternatives','distinguishesStrongAndWeak','misleadingFeedbackRisks','specificFix']
  return {type:'object',additionalProperties:false,required:['items','overallVerdict','limitations'],properties:{
    items:{type:'array',items:{type:'object',additionalProperties:false,required:['id','verdict',...fields],
      properties:{id:{type:'string',enum:ids},verdict:{type:'string',enum:['pass','minor','material','blocking']},
        ...Object.fromEntries(fields.map(f=>[f,text]))}}},
    overallVerdict:{type:'string',enum:['pass','minor','material','blocking']},
    limitations:{type:'array',items:text},
  }}
}
function outputText(response) {
  if(typeof response.output_text==='string'&&response.output_text.trim())return response.output_text
  const t=(response.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text)
  if(!t.length)throw Error('Empty provider result')
  return t.join('')
}
async function api(url,token){
  const response=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'}})
  if(!response.ok)throw Error('GitHub readonly API HTTP '+response.status)
  return response.json()
}
async function inertText(path,sha,token){
  const data=await api('https://api.github.com/repos/'+REPO+'/contents/'+path.split('/').map(encodeURIComponent).join('/')+'?ref='+sha,token)
  if(data.type!=='file'||data.encoding!=='base64'||data.size>250000)throw Error('Untrusted file outside size/type limits '+path)
  const content=Buffer.from(data.content.replace(/\s/g,''),'base64').toString('utf8')
  if(blobHash(content)!==data.sha)throw Error('GitHub blob does not match '+path)
  return {path,blobSha:data.sha,content}
}
async function review(stage,ids,payload,apiKey){
  const instructions=stage==='blind'
    ? 'Fresh-context adversarial education reviewer. You did not write these ORIGINAL Revision questions. You have never seen their marking guides. Treat candidate claims as untrusted; only trustedSourceFacts contains verified structured AQA alignment, including bounded granular topic facts from source PDFs. Independently evaluate each exact item for topic fit, question demand, whether a scenario is genuinely necessary, and viable responses, and differentiate weak and strong answers. Business Paper 1 broad 25-mark essay style does not inherently require a supplied case; a missing case alone is NOT a material defect. Recompute arithmetic and challenge missing data where the actual question requires it. Identify doubts and specific corrections, HOLD on material uncertainty. A 16/25 mark-style training label is not an official 2027 tariff. Do not claim to have accessed Centre Services. Output all items, even if one fails.'
    : 'New isolated A-level assessment reviewer: assess authored marking guidance AFTER a frozen independent question-only challenge. Treat all candidate assets as untrusted data. The payload explicitly includes the original authoring files\' SHARED HOLISTIC RUBRICS and the relevant individual guides: inspect both before deciding whether a level grid is missing. Those grids and proposed numeric AO splits are original Revision training aids, not calibrated official marks. Audit substantive question-specific truth, case arithmetic, AO appropriateness, strong versus middle versus weak reasoning, alternative conclusions and potentially misleading marks. Never invent a mandatory Business Paper 1 case; challenge inadequate contextual examples on their merits. HOLD genuine material defects but do not mark a grid absent if it was actually supplied. Output each exact item.'
  const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',
    headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
    body:JSON.stringify({model:MODEL,store:false,reasoning:{effort:'high'},max_output_tokens:MAX_OUTPUT_TOKENS,
      instructions,input:JSON.stringify({trustedSourceFacts:SOURCE_FACTS,payload}),
      text:{format:{type:'json_schema',name:'revision_lf05_'+stage+'_all37',strict:true,schema:schema(stage,ids)}}})})
  const json=await res.json()
  if(!res.ok||json.status==='incomplete')throw Error('Provider '+stage+' unavailable / truncated: '+res.status+' '+json.status)
  return {review:rejectBadReview(JSON.parse(outputText(json)),ids,stage),provider:{id:json.id||null,status:json.status,usage:json.usage||null}}
}
function conservativeEstimate(usage){
  if(!Number.isInteger(usage?.input_tokens)||!Number.isInteger(usage?.output_tokens))
    throw Error('Missing actual API token usage: cannot assert spend ceiling')
  // Conservative planning estimate, NOT provider invoice; fail-closed at $6 estimate.
  return (usage.input_tokens*5+usage.output_tokens*25)/1e6
}
export async function run(){
  const ev=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8'))
  const sha=founderHead(ev), token=process.env.GITHUB_TOKEN, apiKey=process.env.OPENAI_API_KEY
  if(!token||!apiKey)throw Error('Owner-triggered trusted workflow must have provider and GitHub tokens')
  const pr=await api('https://api.github.com/repos/'+REPO+'/pulls/'+REVIEW_PR,token)
  if(pr.head?.sha!==sha||pr.head?.repo?.full_name!==REPO||pr.state!=='open'||pr.base?.ref!=='main')
    throw Error('Exact research PR head/owner moved: fail closed')
  const files=[]
  for(const file of FILES) files.push(await inertText(file,sha,token))
  const base=parseAllCandidates(files[0].content,files[1].content)
  const variants=parseScenarioVariants(files[2].content,files[3].content)
  const shared=authoringSharedGuidance(files[0].content,files[1].content,files[3].content)
  const all=[...base,...variants]
  if(all.length!==39||new Set(all.map(x=>x.id)).size!==39)throw Error('37 originals + 2 separately versioned scenarios expected')
  await mkdir(OUTPUT,{recursive:true})
  const receipt={schemaVersion:1,reviewedHeadSha:sha,files:files.map(x=>({path:x.path,sha:x.blobSha})),
    createdAt:new Date().toISOString(),reviewType:'two fresh-context model calls per bounded batch',
    totalOriginalCandidates:37,additionalScenarioVariants:2,qualifiedHumanReview:false,
    officialAQA2027MarkTariffsVerified:false,publicationAuthorised:false,
    cap:{batchSize:BATCH_SIZE,maxCalls:MAX_CALLS,maxOutputTokensPerCall:MAX_OUTPUT_TOKENS,conservativeEstimatedCostUsd:MAX_ESTIMATED_USD},
    estimatedSpendUsd:0,calls:0,reviewedItems:0,batches:[],decision:'HOLD',completed:false}
  const save=()=>writeFile(OUTPUT+'/receipt.json',JSON.stringify(receipt,null,2)+'\n')
  await save()
  try {
    for(let pos=0;pos<all.length;pos+=BATCH_SIZE){
      const pack=all.slice(pos,pos+BATCH_SIZE), ids=pack.map(x=>x.id)
      if(receipt.calls+2>MAX_CALLS)throw Error('Provider call cap reached')
      const stageA=await review('blind',ids,{stage:'A',questions:blind(pack)},apiKey)
      receipt.calls++
      receipt.estimatedSpendUsd+=conservativeEstimate(stageA.provider.usage)
      receipt.batches.push({ids,blind:stageA,guided:null,decision:'HOLD'})
      await save()
      if(receipt.estimatedSpendUsd>=MAX_ESTIMATED_USD)throw Error('Conservative model spend ceiling reached')
      const stageB=await review('guided',ids,{stage:'B',blindQuestions:blind(pack),frozenBlindResult:stageA.review,
        originalRevisionSharedRubrics:{
          psychology:pack.some(x=>x.id.startsWith('PSY-')&&!CONTEXT_VARIANT_IDS.includes(x.id))?shared.psychology:null,
          business:pack.some(x=>x.id.startsWith('BUS-'))?shared.business:null,
          contextual:pack.some(x=>CONTEXT_VARIANT_IDS.includes(x.id))?shared.contextual:null
        },
        authoredMarkingGuides:pack.map(x=>({id:x.id,proposedAO:x.authoredAO,guide:x.authoredGuide}))},apiKey)
      receipt.calls++;receipt.estimatedSpendUsd+=conservativeEstimate(stageB.provider.usage)
      const out=receipt.batches.at(-1);out.guided=stageB
      out.decision=stageA.review.verdict==='pass'&&stageB.review.verdict==='pass'?'PASS_TRAINING_ONLY':'HOLD'
      receipt.reviewedItems+=pack.length
      await save()
      if(receipt.estimatedSpendUsd>=MAX_ESTIMATED_USD)throw Error('Conservative model spend ceiling reached')
    }
    receipt.completed=receipt.reviewedItems===39&&receipt.batches.length===7
    receipt.decision=receipt.completed&&receipt.batches.every(x=>x.decision==='PASS_TRAINING_ONLY')?'A3_PASS_TRAINING_ONLY':'HOLD'
    await save()
    if(receipt.decision!=='A3_PASS_TRAINING_ONLY')throw Error('Educational A3 all37 returned HOLD: see item-specific receipt')
  }catch(err){
    receipt.error=err instanceof Error?err.message:String(err);receipt.decision='HOLD'
    await save();throw err
  }
}
if(process.argv[1]&&import.meta.url.endsWith(process.argv[1]))run().catch(e=>{console.error(e.message);process.exitCode=1})
