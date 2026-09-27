import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'

const ROOT = 'research/business-subject-foundation/v0.2-post-board-candidate'
const OUT = '.artifacts/content-factory-business-subject-foundation-reassurance'
const MODEL = process.env.CONTENT_FACTORY_REASSURANCE_MODEL?.trim() || 'gpt-5.6-terra'
const MAX_SPEND = Number(process.env.CONTENT_FACTORY_MAX_SPEND_USD || 5)
const WEB_SEARCH_COST = 0.01
const MAX_PROVIDER_ATTEMPTS = 2
const RETRY_MIN_OUTPUT_TOKENS = 25000

const text = z.string().min(1)
const severity = z.enum(['blocking', 'material', 'minor'])
const status = z.enum(['pass', 'minor_issue', 'material_issue', 'blocking_issue'])
const completeness = z.enum(['complete', 'minor_gap', 'material_gap', 'blocking_gap'])
const evidence = z.object({ source_id: text, url: text, claim_checked: text, result: z.enum(['supports','partially_supports','does_not_support','contradicts']), summary: text })
const finding = z.object({ id: text, severity, issue_type: text, node_ids: z.array(text), finding: text, evidence_source_ids: z.array(text).min(1), recommended_correction: text })
const nodeAssessment = z.object({
  subject_id: text, status, factual_accuracy: status, level3_scope: status,
  quantitative_accuracy: z.enum(['pass','not_applicable','minor_issue','material_issue','blocking_issue']),
  relationships_and_boundaries: status, source_support: status,
  evidence: z.array(evidence).min(1), summary: text, findings: z.array(finding),
})
const domainSchema = z.object({
  domain: text, reviewed_node_ids: z.array(text).min(1), decision: z.enum(['pass','fail_hold']),
  node_assessments: z.array(nodeAssessment).min(1), domain_completeness: completeness,
  domain_completeness_summary: text, domain_findings: z.array(finding), known_limitations: z.array(text),
})
const subjectSchema = z.object({
  reviewed_domains: z.array(text).min(1), decision: z.enum(['pass','fail_hold']), coverage_status: completeness,
  cross_domain_coherence: status, quantitative_register_status: status, models_frameworks_status: status,
  misconception_boundary_status: status, transfer_interdependency_status: status,
  evidence: z.array(evidence).min(1), findings: z.array(finding), known_limitations: z.array(text), summary: text,
})

const uniq = (values) => [...new Set(values)]
const materialStatus = (value) => ['material_issue','blocking_issue','material_gap','blocking_gap'].includes(value)
const materialFinding = (value) => ['material','blocking'].includes(value.severity)
const host = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./,'')
const pathName = (url) => new URL(url).pathname.replace(/\/+$/,'') || '/'

function exactSet(actual, expected, label) {
  const a = [...actual].sort(); const e = [...expected].sort()
  if (a.length !== e.length || a.some((v,i) => v !== e[i])) throw new Error(`${label} mismatch`)
}
function schemaJson(schema) { const value = z.toJSONSchema(schema); delete value.$schema; return value }
function assertProviderSchemaCompatible(schema, label) {
  function visit(value, path = '$') {
    if (Array.isArray(value)) { value.forEach((item,index) => visit(item,`${path}[${index}]`)); return }
    if (!value || typeof value !== 'object') return
    if (Object.hasOwn(value,'format')) throw new Error(`${label} uses unsupported JSON Schema format at ${path}: ${value.format}`)
    for (const [key,child] of Object.entries(value)) visit(child,`${path}.${key}`)
  }
  visit(schema)
}
function responseText(body) {
  if (typeof body.output_text === 'string' && body.output_text.trim()) return body.output_text
  const chunks=[]
  for (const item of body.output || []) for (const c of item.content || []) {
    if (c.type === 'refusal' && c.refusal) throw new Error(`Provider refusal: ${c.refusal}`)
    if (c.type === 'output_text' && typeof c.text === 'string') chunks.push(c.text)
  }
  if (!chunks.length) throw new Error('Provider returned no structured output text')
  return chunks.join('')
}
function searchCount(body) { return (body.output || []).filter((item) => item.type === 'web_search_call').length }
function observedCost(usage, searches) {
  const input = Math.max(0, usage?.input_tokens || 0); const output = Math.max(0, usage?.output_tokens || 0)
  const cached = Math.min(input, Math.max(0, usage?.input_tokens_details?.cached_tokens || 0)); const uncached = input - cached
  const long = input > 272000; const inputMultiplier = long ? 2 : 1; const outputMultiplier = long ? 1.5 : 1
  return Number(((uncached*2*inputMultiplier + cached*.2*inputMultiplier + output*12*outputMultiplier)/1e6 + searches*WEB_SEARCH_COST).toFixed(8))
}
function reserve(payload, outputTokens, searches) {
  const input = Math.ceil(JSON.stringify(payload).length/3); const long = input > 272000
  return Number(((input*2*(long?2:1)+outputTokens*12*(long?1.5:1))/1e6 + searches*WEB_SEARCH_COST + .1).toFixed(8))
}
function retryOutputLimit(current) { return Math.max(current * 2, RETRY_MIN_OUTPUT_TOKENS) }
function retryableIncomplete(raw, usageAvailable) {
  return raw?.status === 'incomplete' && raw?.incomplete_details?.reason === 'max_output_tokens' && usageAvailable
}
function recordProviderAttempt({raw,label,attempt,maxOutputTokens,budget,contexts,providerAttempts,httpStatus}) {
  const searches = searchCount(raw)
  const usageAvailable = Boolean(raw?.usage)
  const cost = usageAvailable ? observedCost(raw.usage, searches) : 0
  budget.cost = Number((budget.cost + cost).toFixed(8))
  budget.searches += searches
  if (!usageAvailable) budget.usageUnavailable = true
  if (raw?.id) {
    if (contexts.has(raw.id)) throw new Error(`Reused reviewer context ${raw.id}`)
    contexts.add(raw.id)
  }
  const record = {
    label,
    attempt,
    responseId: raw?.id || null,
    providerStatus: raw?.status || null,
    httpStatus,
    incompleteDetails: raw?.incomplete_details || null,
    usage: raw?.usage || null,
    usageAvailable,
    webSearchCalls: searches,
    observedCostUsd: cost,
    maxOutputTokens,
  }
  providerAttempts.push(record)
  if (budget.cost > MAX_SPEND) throw new Error(`${label} observed spend ${budget.cost} exceeds ${MAX_SPEND}`)
  return record
}

async function loadCandidate() {
  const read = async (name) => JSON.parse(await readFile(`${ROOT}/${name}`,'utf8'))
  index=await read('NODE_INDEX.json'), matrix=await read('PROMOTION_PROVENANCE_MATRIX.json'), sources=await read('SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json'), specialist=await read('SPECIALIST_REGISTERS.json')
  if (index.candidate_version !== 'v0.2-post-board-candidate' || index.candidate_node_count !== 81) throw new Error('Unexpected Business candidate identity/count')
  if (matrix.counts?.matrix_nodes !== 81) throw new Error('Promotion matrix is not 81 nodes')
  const sourceById=new Map(sources.sources.map(s=>[s.id,s])); const excluded=new Set((sources.legacy_promotion_exclusions||[]).map(s=>s.source_id))
  if (sourceById.size !== sources.sources.length) throw new Error('Duplicate promotion source IDs')
  for (const s of sources.sources) if (s.promotion_eligible !== true) throw new Error(`Promotion source ${s.id} is not explicitly eligible`)
  const rows=new Map(matrix.nodes.map(r=>[r.subject_id,r])); const domains=[]; const nodes=new Map(); const fingerprintParts=[]
  for (const name of ['NODE_INDEX.json','PROMOTION_PROVENANCE_MATRIX.json','SOURCE_REGISTER_PROMOTION_SUPPLEMENT.json',"SPECIALIST_REGISTERS.json']) fingerprintParts.push([name,await readFile(`${ROOT}/${name}`,'utf8')])
  for (const d of index.domains) {
    const raw=await readFile(`${ROOT}/${d.file}`,'utf8'); fingerprintParts.push([d.file,raw]); const file=JSON.parse(raw)
    exactSet(file.nodes.map(n=>n.subject_id),d.ids,`${d.domain} IDs`)
    for (const n of file.nodes) { if (nodes.has(n.subject_id)) throw new Error(`Duplicate node ${n.subject_id}`); nodes.set(n.subject_id,{...n,domain:d.domain}) }
    domains.push({...d,nodes:file.nodes})
  }
  if (nodes.size !== 81) throw new Error(`Loaded ${nodes.size} nodes, expected 81`)
  exactSet(rows.keys(),nodes.keys(),'matrix/index IDs')
  for (const [id,node] of nodes) {
    const row=rows.get(id); if (!row?.subject_truth_sources?.length) throw new Error(`No promotion truth sources for ${id}`)
    for (const sourceId of row.subject_truth_sources) { const s=sourceById.get(sourceId); if (!s?.promotion_eligible || excluded.has(sourceId)) throw new Error(`Invalid promotion truth source ${sourceId} for ${id}`) }
    if (!node.teaching_content?.core_explanation) throw new Error(`Missing teaching explanation for ${id}`)
  }
  fingerprintParts.sort(([a],[b])=>a.localeCompare(b)); const h=createHash('sha256'); for (const [name,value] of fingerprintParts) h.update(`${name}\0${value}\0`)
  return {index,matrix,rows,sources,sourceById,specialist,domains,nodes,fingerprint:h.digest('hex')}
}
function sourceMeta(s){return {id:s.id,issuer:s.issuer,title:s.title,url:s.url,date_version:s.date_version,educational_role:s.educational_role,licence_profile:s.licence_profile,restrictions:s.restrictions,promotion_eligible:s.promotion_eligible}}
function urlAllowed(item, sourceById) {
  try {
    const s=sourceById.get(item.source_id)
    if (!s?.promotion_eligible || host(item.url)!==host(s.url)) return false
    const p=pathName(s.url), e=pathName(item.url)
    return p==='/' || e===p || e.startsWith(`${p}/`)
  } catch { return false }
}
function validateFindingSources(findings,allowed,label){ for(const f of findings) for(const id of f.evidence_source_ids) if(!allowed.has(id)) throw new Error(`${label} finding ${f.id} uses unpermitted ${id}`) }

function domainPayload(c,d){
  const rows=d.nodes.map(n=>c.rows.get(n.subject_id)); const ids=uniq(rows.flatMap(r=>r.subject_truth_sources)); const sourceList=ids.map(id=>sourceMeta(c.sourceById.get(id))
  return { review_identity:{candidate_version:c.index.candidate_version,candidate_fingerprint:c.fingerprint,domain:d.domain}, rights_boundary:{permitted_subject_truth_sources:sourceList,prohibited_for_subject_truth:c.sources.legacy_promotion_exclusions,board_material_must_not_be_used:true}, provenance_rows:rows, related_node_catalog:uniq(d.nodes.flatMap(n=>n.related_nodes||[])).map(id=>c.nodes.get(id)).filter(Boolean).map(n=>({subject_id:n.subject_id,title:n.title,domain:n.domain})), nodes:d.nodes }
}
const domainInstructions=(d)=>[
  `Freshly and independently review the ${d.domain} domain of a reusable UK Level 3/A-level Business Subject Knowledge Foundation.`,
  'Do not rely on prior Revision assurance/remediation conclusions or exam-board specifications.',
  'Use web search only against supplied promotion-permitted source publications. Never search, cite or reconstruct awarding-board material.',
  'Check every node: factual correctness, definitions/boundaries, causal claims, applications, assumptions, limitations, misconceptions, relationships and Level 3 appropriateness.',
  'Recompute quantitative formulas/worked examples. Treat models as models rather than universal laws; check purpose, use, limitations and misuse.',
  'For every node return at least one evidence item whose source_id is in that node subject_truth_sources and whose URL is the actual registered source page or a child page.',
  'Do not make style findings. blocking=unsafe to promote; material=truth/depth needs correction; minor=non-blocking precision/limitation. Any blocking/material => fail_hold.',
].join('\n')

function validateDomain(c,d,o){
  if(o.domain!==d.domain) throw new Error(`Reviewer domain mismatch for ${d.domain}`); const ids=d.nodes.map(n=>n.subject_id); exactSet(o.reviewed_node_ids,ids,`${d.domain} reviewed IDs`); exactSet(o.node_assessments.map(a=>a.subject_id),ids,`${d.domain} assessment IDs`)
  let material=false
  for(const a of o.node_assessments){ const row=c.rows.get(a.subject_id), allowed=new Set(row.subject_truth_sources); for(const e of a.evidence){if(!allowed.has(e.source_id)||!urlAllowed(e,c.sourceById)) throw new Error(`${a.subject_id} returned invalid evidence ${e.source_id} ${e.url}`)}; validateFindingSources(a.findings,allowed,a.subject_id); if([a.status,a.factual_accuracy,a.level3_scope,a.quantitative_accuracy,a.relationships_and_boundaries,a.source_support].some(materialStatus)||a.findings.some(materialFinding)) material=true }
  const allowed=new Set(d.nodes.flatMap(n=>c.rows.get(n.subject_id).subject_truth_sources)); validateFindingSources(o.domain_findings,allowed,d.domain); if(materialStatus(o.domain_completeness)||o.domain_findings.some(materialFinding)) material=true
  if(o.decision!==(material?'fail_hold':'pass')) throw new Error(`${d.domain} decision inconsistent with findings`)
}

function subjectPayload(c,reviews){return {review_identity:{candidate_version:c.index.candidate_version,candidate_fingerprint:c.fingerprint,purpose:'deliberately independent whole-subject completeness/integration'},rights_boundary:{permitted_subject_truth_sources:c.sources.sources.filter(s=>s.promotion_eligible).map(sourceMeta),prohibited_for_subject_truth:c.sources.legacy_promotion_exclusions,board_material_must_not_be_used:true},domain_index:c.index.domains,nodes:c.domains.flatMap(d=>d.nodes.map(n=>({...n,domain:d.domain}))),specialist_registers:c.specialist,domain_review_summaries:reviews.map(r=>({domain:r.output.domain,decision:r.output.decision,domain_completeness:r.output.domain_completeness,domain_findings:r.output.domain_findings,known_limitations:r.output.known_limitations}))}}
const subjectInstructions=(c)=>[
  'Freshly and independently review the whole reusable UK Level 3/A-level Business Subject Knowledge Foundation.',
  'Do not rely on prior Revision research conclusions, remediation reports or exam-board taxonomies.',
  'Use web search only against supplied promotion-permitted source publications; never use awarding-board/prohibited sources.',
  `Ú[[™ÙHÚ]\ˆ[	ØËš[™^˜Ø[™Y]WÛ›ÙWØÛİ[H›Ù\ÈÛÛXİ]™[H›İšYHÛÚ\™[›İ[™Y]™[È\Ú[™\ÜÈ[™\œİ[™[™Ë˜ˆ	ĞÚXÚÈXZ›Ü‹YÛXZ[ˆÛİ™\˜YÙKÜ›ÜÜËY[˜İ[Û˜[™[][ÛœÚ\Ë™\™\]Z\Ú]\ËØ]\Ø[ÚZ[œË]X[]]]™HY]ÙË˜[YY[Ù[ËZ\ØÛÛ˜Ù\[Ûˆ›İ[™\šY\Ë™X[]ÛÜ›˜[œÙ™\ˆ[™]šY[˜ÙKÙXÚ\Ú[Ûˆ™X\ÛÛš[™Ë‰Ëˆ	ÓÛÚÈ›ÜˆX]\šX[ÛZ\ÜÚ[ÛœË›Ø\™\Ú\YÛÛ[Z[˜][Û‹ÛÛ˜YXİ[ÛœËÙ\XØ][Û‹İ™\‹XY˜[˜ÙYÛÛ[™\Ù[Y\ÈÛÜ™KÜˆZ\ÜÚ[™È[Z]][ÛœËˆÜ[Û˜[[œšXÚY[\È›İHX]\šX[Ø\‰Ëˆ	Ğ[H›ØÚÚ[™ËÛX]\šX[š[™[™ÈÜˆÛÛ\][™\ÜÈØ\Oˆ˜Z[ÚÛ‰Ë—Kš›Ú[Š	×‰ÊB™[˜İ[Ûˆ˜[Y]TİXš™Xİ
ËÊ^ÈÛÛœİÛXZ[œÏXËš[™^™ÛXZ[œË›X\
O™™ÛXZ[ŠNÈ^XİÙ]
Ëœ™]šY]ÙYÙÛXZ[œËÛXZ[œË	İÚÛK\İXš™XİÛXZ[œÉÊNÈÛÛœİ[İÙY[™]ÈÙ]
ËœÛİ\˜Ù\ËœÛİ\˜Ù\Ë™š[\ŠÏOœËœ›Û[İ[Û—Ù[YÚX›JK›X\
ÏOœËšY
JNÈ›ÜŠÛÛœİHÙˆË™]šY[˜ÙJHYŠX[İÙYš\ÊKœÛİ\˜ÙWÚY
_]\›[İÙY
KËœÛİ\˜ÙPRY
JH›İÈ™]È\œ›ÜŠÚÛK\İXš™Xİ[˜[Y]šY[˜ÙH	ÙKœÛİ\˜ÙWÚYX
NÈ˜[Y]Qš[™[™ÔÛİ\˜Ù\ÊË™š[™[™ÜË[İÙY	İÚÛK\İXš™Xİ	ÊNÈÛÛœİX]\šX[[X]\šX[İ]\ÊË˜Ûİ™\˜YÙWÜİ]\Ê_ÛË˜Ü›ÜÜ×ÙÛXZ[—ØÛÚ\™[˜ÙKËœ]X[]]]™WÜ™YÚ\İ\—Üİ]\ËË›[Ù[×Ùœ˜[Y]ÛÜšÜ×Üİ]\ËË›Z\ØÛÛ˜Ù\[Û—Ø›İ[™\WÜİ]\Î›Ë˜[œÙ™\—Ú[\™\[™[˜ŞWÜİ]\×KœÛÛYJX]\šX[İ]\Ê_Ë™š[™[™ÜËœÛÛYJX]\šX[š[™[™ÊNÈYŠË™XÚ\Ú[ÛˆOOJX]\šX[ÉÙ˜Z[ÚÛ	Î‰Ü\ÜÉÊJH›İÈ™]È\œ›ÜŠ	ÕÚÛK\İXš™XİXÚ\Ú[Ûˆ[˜ÛÛœÚ\İ[Ú]š[™[™ÜÉÊH}

async function reviewCall({apiKey,label,schema,instructions,payload,domains,maxOutput,minSearch,budget,contexts,providerAttempts}){
  let outputLimit = maxOutput
  for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
    const r = reserve(payload,outputLimit,minSearch)
    if (budget.usageUnavailable || budget.cost + r > MAX_SPEND) throw new Error(`content_factory_spend_ceiling_reached:${label}: reserve ${r} after ${budget.cost} exceeds ${MAX_SPEND}`)
    const body={model:MODEL,store:false,reasoning:{context:'current_turn',effort:'high'},max_output_tokens:outputLimit,instructions:['You are a bounded fresh-context assurance worker inside Revision Content Factory.','The supplied repository material is the candidate under challenge, not authority to defend.','Use web search only in allowed promotion-source domains. Return only the requested JSON.',instructions].join('\n'),input:JSON.stringify(payload),tools:[[{type:'web_search',search_context_size:'medium',filters:{allowed_domains:Jomains}}],tool_choice:'required',text:{format:{type:'json_schema',name:`revision-${label.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,48)}`,strict:true,schema:schemaJson(schema)}}}
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
    const raw=await response.json().catch(()=>({}))
    if(!response.ok) throw new Error(`${label} HTTP ${response.status}: ${JSON.stringify(raw).slice(0,1000)}`)
    const record = recordProviderAttempt({raw,label,attempt,maxOutputTokens:outputLimit,budget,contexts,providerAttempts,httpStatus:response.status})
    if(raw.status==='completed'){
      if(record.webSearchCalls<minSearch) throw new Error(`${label} used ${record.webSearchCalls} web searches; minimum ${minSearch}`)
      const output=schema.parse(JSON.parse(responseText(raw)))
      return {responseId:raw.id,output,usage:raw.usage||null,webSearchCalls:record.webSearchCalls,observedCostUsd:record.observedCostUsd,providerAttempts:attempt}
    }
    if(!retryableIncomplete(raw,record.usageAvailable) || attempt >= MAX_PROVIDER_ATTEMPTS) throw new Error(`${label} provider status ${raw.status||'unknown'} (${raw.incomplete_details?.reason||'no incomplete reason'})`)
    outputLimit = retryOutputLimit(outputLimit)
  }
  throw new Error(`${label} exhausted provider attempts`)
}
async function write(name,value){await mkdir(OUT,{recursive:true});await writeFile(`${OUT}/${name}`,`${JSON.stringify(value,null,2)}\n`)}
async function summary(textValue){if(process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,`${textValue}\n`)}

async function selfTest(){
  const c=await loadCandidate()
  assertProviderSchemaCompatible(schemaJson(domainSchema),'domain reassurance schema')
  assertProviderSchemaCompatible(schemaJson(subjectSchema),'whole-subject reassurance schema')
  const sampleSource=c.sources.sources.find(s=>s.promotion_eligible)
  if(!sampleSource) throw new Error('No promotion-eligible source available for URL alidation self-test')
  if(!urlAllowed({source_id:sampleSource.id,url:sampleSource.url},c.sourceById)) throw new Error('Registered promotion source URL failed runtime URL validation')
  if(urlAllowed({source_id:sampleSource.id,url:'not-a-url'},c.sourceById)) throw new Error('Invalid URL passed runtime URL validation')

  const incomplete={id:'resp_selftest_incomplete',status:'incomplete',incomplete_details:{reason:'max_output_tokens'},usage:{input_tokens:1000,output_tokens:150,input_tokens_details:{cached_tokens:100}},output:[]}
  const testBudget={cost:0,searches:0,usageUnavailable:false}, testContexts=new Set(), testAttempts=[]
  const incompleteRecord=recordProviderAttempt({raw:incomplete,label:'selftest-incomplete',attempt:1,maxOutputTokens:6000,budget:testBudget,contexts:testContexts,providerAttempts:testAttempts,httpStatus:200})
  if(!(testBudget.cost>0)) throw new Error('Incomplete response usage was not charged before retry handling')
  if(!retryableIncomplete(incomplete,incompleteRecord.usageAvailable)) throw new Error('max_output_tokens incomplete response was not classified retryable')
  if(incompleteRecord.incompleteDetails?.reason!=='max_output_tokens') throw new Error('Incomplete details were not retained')
  const filtered={id:'resp_selftest_filtered',status:'incomplete',incomplete_details:{reason:'content_filter'},usage:{input_tokens:100,output_tokens:10},output:[]}
  const filteredBudget={cost:0,searches:0,usageUnavailable:false}, filteredContexts=new Set(), filteredAttempts=[]
  const filteredRecord=recordProviderAttempt({raw:filtered,label:'selftest-filtered',attempt:1,maxOutputTokens:6000,budget:filteredBudget,contexts:filteredContexts,providerAttempts:filteredAttempts,httpStatus:200})
  if(retryableIncomplete(filtered,filteredRecord.usageAvaile)) throw new Error('Non-token incomplete response was incorrectly classified retryable')
  const missingUsage={id:'resp_selftest_no_usage',status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output:[]}
  if(retryableIncomplete(missingUsage,false)) throw new Error('Incomplete response without usage was incorrectly classified retryable')
  if(retryOutputLimit(6000)<RETRY_MIN_OUTPUT_TOKENS) throw new Error('Retry output allowance is below the governed reasoning buffer floor')

  console.log(JSON.stringify({status:'pass',candidateVersion:c.index.candidate_version,nodeCount:c.nodes.size,domainCount:c.domains.length,candidateFingerprint:c.fingerprint,promotionSourceCount:c.sources.sources.length,providerSchemaCompatibility:'pass',runtimeEvidenceUrlValidation:'pass',incompleteResponseAccounting:'pass',incompleteResponseEvidenceRetention:'pass',boundedIncompleteRetryPolicy:'pass'},null,2))
}
async function live(){
  if(process.env.CONTENT_FACTORY_BUSINESS_SUBJECT_REASSURANCE!=='1') throw new Error('CONTENT_FACTORY_BUSINESS_SUBJECT_REASSURANCE=1 required')
  const apiKey=process.env.OPENAI_API_KEY?.trim(); if(!apiKey) throw new Error('OPENAI_API_KEY required'); if(!Number.isFinite(MAX_SPEND)||MAX_SPEND<=0) throw new Error('CONTENT_FACTORY_MAX_SPEND_USD must be positive')
  const sha=process.env.REVISION_REVIEWED_MAIN_SHA?.trim(); if(!/^[0-9a-f]{40}$/.test(sha||'')) throw new Error('REVISION_REVIEWED_MAIN_SHA must be a SHA'); const actual=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(); if(actual!==sha) throw new Error(`Checked out ${actual}, expected ${sha}`)
  const c=await loadCandidate(), budget={cost:0,searches:0,usageUnavaile:false}, reviews=[], contexts=new Set(), providerAttempts=[], startedAt=new Date().toISOString()
  try{
    for(const d of c.domains){const payload=domainPayload(c,d), allowed=uniq(payload.rights_boundary.permitted_subject_truth_sources.map(s=>host(s.url)));const r=await reviewCall({apiKey,label:`business-subject-${d.domain}`,schema:domainSchema,instructions:domainInstructions(d),payload,domains:allowed,maxOutput:6000,minSearch:Math.min(4,d.nodes.length),budget,contexts,providerAttempts});validateDomain(c,d,r.output);reviews.push({domain:d.domain,...r})}
    const payload=subjectPayload(c,reviews), allowed=uniq(c.sources.sources.filter(s=>s.promotion_eligible).map(s=>host(s.url)));const whole=await reviewCall({apiKey,label:'business-subject-whole-foundation',schema:subjectSchema,instructions:subjectInstructions(c),payload,domains:allowed,maxOutput:8000,minSearch:5,budget,contexts,providerAttempts});validateSubject(c,whole.output)
    const material=[...reviews.flatMap(r=>r.output.node_assessments.flatMap(a=>a.findings.filter(materialFinding).map(f=>({domain:r.domain,subject_id:a.subject_id,...f}))).concat(r.output.domain_findings.filter(materialFinding).map(f=>({domain:r.domain,...f})))),...whole.output.findings.filter(materialFinding)];const decision=reviews.some(r=>r.output.decision==='fail_hold')||whole.output.decision==='fail_hold'?'fail_hold':'pass'
    const artifact={schemaVersion:2,artifactType:'business_subject_foundation_fresh_independent_reassurance_evidence',recordedAt:new Date().toISOString(),startedAt,repository:process.env.GITHUB_REPOSITORY||'lhanson-dev/revision',reviewedMainSha:sha,candidateVersion:c.index.candidate_version,candidateFingerprint:c.fingerprint,nodeCount:c.nodes.size,domainCount:c.domains.length,reviewMethod:'one successful fresh OpenAI Responses review per domain plus whole-subject integration; rights-limited web search; bounded fresh retry only for max_output_tokens incomplete responses when provider usage is available and the spend ceiling remains safe',model:MODEL,configuredMaxSpendUsd:MAX_SPEND,observedSpendUsd:budget.cost,spendMeasurement:budget.usageUnavailable?'partial_provider_usage_unavailable':'provider_usage_estimate',webSearchCalls:budget.searches,reviewerContextIds:[...contexts],providerAttemptCount:providerAttempts.length,providerAttempts,rightsBoundary:{promotionSourceCount:c.sources.sources.length,excludedSourceCount:c.sources.legacy_promotion_exclusions.length,boardMaterialUsedAsSubjectTruth:false},domainReviews:reviews,wholeSubjectReview:whole,materialFindings:material,finalDecision:decision,promotionEffect:'none; reassurance evidence does not itself promote the candidate',excludedScope:['exact AQA 7132 specification mapping and Course Truth projection','AQA Exam Truth','qualified human subject/assessment approval','learner-facing asset publication']}
    await write('business-subject-foundation-reassurance.json',artifact);await write('business-subject-foundation-reassurance-summary.json',{reviewedMainSha:sha,candidateFingerprint:c.fingerprint,finalDecision:decision,materialFindingCount:material.length,observedSpendUsd:budget.cost,spendMeasurement:artifact.spendMeasurement,webSearchCalls:budget.searches,reviewerContextCount:contexts.size,providerAttemptCount:providerAttempts.length});await summary(`## Business Subject Foundation fresh reassurance\n\n- Reviewed main: \`${sha}\`\n- Candidate fingerprint: \`${c.fingerprint}\`\n- Nodes: ${c.nodes.size}\n- Fresh reviewer contexts: ${contexts.size}\n- Provider attempts: ${providerAttempts.length}\n- Web searches: ${budget.searches}\n- Spend estimate: $${budget.cost.toFixed(4)} / $${MAX_SPEND.toFixed(2)}\n- Decision: **${decision.toUpperCase()}**\n- Blocking/material findings: ${material.length}`);if(decision!=='pass') throw new Error(`business_subject_foundation_reassurance_fail_hold:${material.length}_material_findings`)
  }catch(error){await write('business-subject-foundation-reassurance-failure.json',{schemaVersion:2,artifactType:'business_subject_foundation_fresh_independent_reassurance_failure',recordedAt:new Date().toISOString(),reviewedMainSha:sha,candidateVersion:c.index.candidate_version,candidateFingerprint:c.fingerprint,model:MODEL,configuredMaxSpendUsd:MAX_SPEND,observedSpendUsd:budget.cost,spendMeasurement:budget.usageUnavailable?'partial_provider_usage_unavailable':'provider_usage_estimate',webSearchCalls:budget.searches,reviewerContextIds:[...contexts],providerAttemptCount:providerAttempts.length,providerAttempts,completedDomainReviews:reviews.map(r=>({domain:r.domain,decision:r.output.decision,responseId:r.responseId})),error:error instanceof Error?error.message:String(error)});throw error}
}

try{if(process.argv[2]==='--self-test') await selfTest(); else await live()}catch(error){console.error(error instanceof Error?(error.stack||error.message):String(error));process.exit(1)}
