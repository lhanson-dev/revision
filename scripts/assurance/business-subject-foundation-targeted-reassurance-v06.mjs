import { execFileSync } from 'node:child_process'
import { appendFile, mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v06.mjs'

const OUT = '.artifacts/content-factory-business-subject-foundation-reassurance'
const MODEL = process.env.CONTENT_FACTORY_REASSURANCE_MODEL?.trim() || 'gpt-5.6-terra'
const MAX_SPEND = Number(process.env.CONTENT_FACTORY_MAX_SPEND_USD || 5)
const WEB_SEARCH_COST = 0.01
const MAX_PROVIDER_ATTEMPTS = 2
const RETRY_MIN_OUTPUT_TOKENS = 18000
const text = z.string().min(1)
const severity = z.enum(['blocking', 'material', 'minor'])
const status = z.enum(['pass', 'minor_issue', 'material_issue', 'blocking_issue'])
const completeness = z.enum(['complete', 'minor_gap', 'material_gap', 'blocking_gap'])
const integrationIssueType = z.enum(['major_domain_coverage', 'cross_domain_coherence', 'relationship_dependency', 'v06_contradiction_or_duplication'])
const evidence = z.object({ source_id: text, url: text, claim_checked: text, result: z.enum(['supports', 'partially_supports', 'does_not_support', 'contradicts']), summary: text })
const finding = z.object({ id: text, severity, issue_type: text, node_ids: z.array(text).min(1), evidence_source_ids: z.array(text).min(1), recommended_correction: text })
const assessment = z.object({
  subject_id: text,
  status,
  factual_accuracy: status,
  level3_scope: status,
  quantitative_accuracy: z.enum(['pass', 'not_applicable', 'minor_issue', 'material_issue', 'blocking_issue']),
  relationships_and_boundaries: status,
  source_support: status,
  evidence: z.array(evidence).min(1),
  summary: text,
  findings: z.array(finding),
})
const scopedSchema = z.object({
  review_group: text,
  reviewed_node_ids: z.array(text).min(1),
  decision: z.enum(['pass', 'fail_hold']),
  node_assessments: z.array(assessment).min(1),
  relationship_scope_status: completeness,
  relationship_scope_summary: text,
  group_findings: z.array(finding),
  known_limitations: z.array(text),
})
const integrationFinding = z.object({ id: text, severity, issue_type: integrationIssueType, node_ids: z.array(text).min(1), evidence_source_ids: z.array(text).min(1), recommended_correction: text })
const integrationSchema = z.object({
  reviewed_node_count: z.number().int(),
  reviewed_domains: z.array(text).min(1),
  decision: z.enum(['pass', 'fail_hold']),
  major_domain_coverage: completeness,
  cross_domain_coherence: status,
  relationship_dependency_consistency: status,
  v06_contradiction_or_duplication: status,
  evidence: z.array(evidence).min(1),
  findings: z.array(integrationFinding),
  known_limitations: z.array(text),
  summary: text,
})

const EXPECTED_FRESH_SCOPE = ['BUS-FND-002', 'BUS-FIN-003', 'BUS-EVI-006']
const REVIEW_GROUPS = [
  { name: 'Business Foundations final remediation', ids: ['BUS-FND-002'] },
  { name: 'Finance final remediation', ids: ['BUS-FIN-003'] },
  { name: 'Evidence cross-functional relationship remediation', ids: ['BUS-EVI-006'] },
]

const uniq = (values) => [...new Set(values)]
const materialStatus = (value) => ['material_issue', 'blocking_issue', 'material_gap', 'blocking_gap'].includes(value)
const materialFinding = (value) => ['material', 'blocking'].includes(value.severity)
const host = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./, '')

function pathSegments(url) {
  const pathname = new URL(url).pathname.replace(/\/+$/, '')
  if (!pathname || pathname === '/') return []
  return pathname.split('/').slice(1).map((segment) => {
    const decoded = decodeURIComponent(segment)
    if (!decoded || decoded === '.' || decoded === '..' || decoded.includes('/') || decoded.includes('\\')) throw new Error('Unsafe URL path segment')
    return decoded
  })
}

function exactSet(actual, expected, label) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  if (a.length !== e.length || a.some((value, index) => value !== e[index])) throw new Error(`${label} mismatch`)
}

function schemaJson(schema) {
  const value = z.toJSONSchema(schema)
  delete value.$schema
  return value
}

function assertProviderSchemaCompatible(schema, label) {
  function visit(value, path = '$') {
    if (Array.isArray(value)) return value.forEach((item, index) => visit(item, `${path}[${index}]`))
    if (!value || typeof value !== 'object') return
    if (Object.hasOwn(value, 'format')) throw new Error(`${label} uses unsupported JSON Schema format at ${path}: ${value.format}`)
    for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`)
  }
  visit(schema)
}

function responseText(body) {
  if (typeof body.output_text === 'string' && body.output_text.trim()) return body.output_text
  const chunks = []
  for (const item of body.output || []) for (const part of item.content || []) {
    if (part.type === 'refusal' && part.refusal) throw new Error(`Provider refusal: ${part.refusal}`)
    if (part.type === 'output_text' && typeof part.text === 'string') chunks.push(part.text)
  }
  if (!chunks.length) throw new Error('Provider returned no structured output text')
  return chunks.join('')
}

const searchCount = (body) => (body.output || []).filter((item) => item.type === 'web_search_call').length
function observedCost(usage, searches) {
  const input = Math.max(0, usage?.input_tokens || 0)
  const output = Math.max(0, usage?.output_tokens || 0)
  const cached = Math.min(input, Math.max(0, usage?.input_tokens_details?.cached_tokens || 0))
  const uncached = input - cached
  const long = input > 272000
  return Number(((uncached * 2 * (long ? 2 : 1) + cached * .2 * (long ? 2 : 1) + output * 12 * (long ? 1.5 : 1)) / 1e6 + searches * WEB_SEARCH_COST).toFixed(8))
}
function reserve(payload, outputTokens, searches) {
  const input = Math.ceil(JSON.stringify(payload).length / 3)
  const long = input > 272000
  return Number(((input * 2 * (long ? 2 : 1) + outputTokens * 12 * (long ? 1.5 : 1)) / 1e6 + searches * WEB_SEARCH_COST + .1).toFixed(8))
}
const sourceMeta = (source) => ({ id: source.id, issuer: source.issuer, title: source.title, url: source.url, date_version: source.date_version, educational_role: source.educational_role, licence_profile: source.licence_profile, restrictions: source.restrictions, promotion_eligible: source.promotion_eligible })
function reviewNode(candidate, node) {
  const { sources: _legacySources, ...content } = node
  return { ...content, promotion_truth_source_ids: candidate.rows.get(node.subject_id).subject_truth_sources }
}
function urlAllowed(item, sourceById) {
  try {
    const source = sourceById.get(item.source_id)
    if (!source?.promotion_eligible || host(item.url) !== host(source.url)) return false
    const registered = pathSegments(source.url)
    const actual = pathSegments(item.url)
    return registered.length === 0 || (actual.length >= registered.length && registered.every((segment, index) => segment === actual[index]))
  } catch {
    return false
  }
}
function validateFindingSources(findings, allowed, label) {
  for (const item of findings) for (const id of item.evidence_source_ids) if (!allowed.has(id)) throw new Error(`${label} finding ${item.id} uses unpermitted ${id}`)
}

async function loadCandidate() {
  const candidate = await loadBusinessSubjectFoundationCandidate()
  if (candidate.index.candidate_version !== 'v0.6-final-targeted-remediation' || candidate.nodes.size !== 81) throw new Error('Unexpected Business v0.6 candidate identity/count')
  exactSet(candidate.freshNodeScope, EXPECTED_FRESH_SCOPE, 'v0.6 fresh scope')
  exactSet(REVIEW_GROUPS.flatMap((group) => group.ids), EXPECTED_FRESH_SCOPE, 'review-group union')
  return candidate
}

function scopedPayload(candidate, group) {
  const nodes = group.ids.map((id) => candidate.nodes.get(id))
  const sourceIds = uniq(nodes.flatMap((node) => candidate.rows.get(node.subject_id).subject_truth_sources))
  const contextIds = uniq(nodes.flatMap((node) => [...(node.prerequisites || []), ...(node.related_nodes || [])]))
  return {
    review_identity: { candidate_version: candidate.index.candidate_version, candidate_fingerprint: candidate.fingerprint, review_group: group.name, scope: 'three_changed_nodes_only' },
    preserved_assurance: { workflow_run_id: candidate.v06Overlay.triggering_assurance.workflow_run_id, artifact_id: candidate.v06Overlay.triggering_assurance.artifact_id, reviewed_candidate_fingerprint: candidate.v06Overlay.triggering_assurance.reviewed_candidate_fingerprint, unchanged_nodes_outside_scope_must_not_be_reopened: true },
    rights_boundary: { permitted_subject_truth_sources: sourceIds.map((id) => sourceMeta(candidate.sourceById.get(id))), prohibited_for_subject_truth: candidate.sources.legacy_promotion_exclusions, board_material_must_not_be_used: true, historical_node_sources_supplied_to_reviewer: false },
    context_catalog: contextIds.map((id) => candidate.nodes.get(id)).filter(Boolean).map((node) => ({ subject_id: node.subject_id, title: node.title, domain: node.domain })),
    nodes: nodes.map((node) => reviewNode(candidate, node)),
  }
}

const scopedInstructions = (group) => [
  `Freshly and independently review only this final governed Business Foundation remediation scope: ${group.name}.`,
  `Return exactly these node IDs once each and no others: ${group.ids.join(', ')}.`,
  'Prior accepted assurance for all unchanged nodes outside this scope is preserved. Do not reopen them as standalone findings.',
  'Context-catalog nodes exist only to test relationships/dependencies with the target node.',
  'Use web search only against supplied promotion-permitted source publications. Never use awarding-body/prohibited material.',
  'Check factual correctness, definitions/boundaries, quantitative methods, causal claims, assumptions/limitations, misconceptions, Level 3 depth, source support and affected relationships.',
  'Every target node must include evidence from at least one of its own promotion_truth_source_ids. Recompute formulas and worked examples where applicable.',
  'Do not make style findings. Any blocking/material finding => fail_hold.',
].join('\n')

function validateScoped(candidate, group, output) {
  if (output.review_group !== group.name) throw new Error(`${group.name} review-group mismatch`)
  exactSet(output.reviewed_node_ids, group.ids, `${group.name} reviewed IDs`)
  exactSet(output.node_assessments.map((item) => item.subject_id), group.ids, `${group.name} assessment IDs`)
  const allowed = new Set(group.ids.flatMap((id) => candidate.rows.get(id).subject_truth_sources))
  let material = false
  for (const item of output.node_assessments) {
    const mapped = new Set(candidate.rows.get(item.subject_id).subject_truth_sources)
    for (const itemEvidence of item.evidence) if (!allowed.has(itemEvidence.source_id) || !urlAllowed(itemEvidence, candidate.sourceById)) throw new Error(`${item.subject_id} returned invalid evidence ${itemEvidence.source_id} ${itemEvidence.url}`)
    if (!item.evidence.some((itemEvidence) => mapped.has(itemEvidence.source_id))) throw new Error(`${item.subject_id} returned no evidence from its mapped promotion truth sources`)
    validateFindingSources(item.findings, allowed, item.subject_id)
    if ([item.status, item.factual_accuracy, item.level3_scope, item.quantitative_accuracy, item.relationships_and_boundaries, item.source_support].some(materialStatus) || item.findings.some(materialFinding)) material = true
  }
  validateFindingSources(output.group_findings, allowed, group.name)
  if (materialStatus(output.relationship_scope_status) || output.group_findings.some(materialFinding)) material = true
  if (output.decision !== (material ? 'fail_hold' : 'pass')) throw new Error(`${group.name} decision inconsistent with findings`)
}

function integrationPayload(candidate, scopedReviews) {
  return {
    review_identity: { candidate_version: candidate.index.candidate_version, candidate_fingerprint: candidate.fingerprint, purpose: 'final integration-only T3 check' },
    preserved_assurance: { workflow_run_id: candidate.v06Overlay.triggering_assurance.workflow_run_id, artifact_id: candidate.v06Overlay.triggering_assurance.artifact_id, preserved_unchanged_node_count: 78, standalone_unchanged_node_reassessment_prohibited: true },
    allowed_finding_types: ['major_domain_coverage', 'cross_domain_coherence', 'relationship_dependency', 'v06_contradiction_or_duplication'],
    rights_boundary: { permitted_subject_truth_sources: candidate.sources.sources.filter((source) => source.promotion_eligible).map(sourceMeta), prohibited_for_subject_truth: candidate.sources.legacy_promotion_exclusions, board_material_must_not_be_used: true },
    domain_index: candidate.index.domains.map((domain) => ({ domain: domain.domain, ids: domain.ids })),
    nodes: candidate.domains.flatMap((domain) => domain.nodes.map((node) => ({ subject_id: node.subject_id, title: node.title, domain: node.domain, scope_classification: node.scope_classification, prerequisites: node.prerequisites, related_nodes: node.related_nodes, core_explanation: node.teaching_content?.core_explanation, important_boundaries: node.teaching_content?.important_boundaries, quantitative_methods: node.quantitative_content?.methods, models_frameworks: node.models_frameworks, evidence_of_understanding: node.evidence_of_understanding }))),
    fresh_scope: EXPECTED_FRESH_SCOPE,
    scoped_review_summaries: scopedReviews.map((review) => ({ review_group: review.output.review_group, decision: review.output.decision, relationship_scope_status: review.output.relationship_scope_status, group_findings: review.output.group_findings, known_limitations: review.output.known_limitations })),
  }
}

const integrationInstructions = (candidate) => [
  'Perform the final whole-subject integration-only check for this reusable UK Level 3/A-level Business Foundation.',
  `Return reviewed_node_count=81 and every expected domain exactly once: ${candidate.index.domains.map((domain) => domain.domain).join(', ')}.`,
  'This is not another standalone 81-node factual/source review. Prior accepted assurance for unchanged nodes is preserved.',
  'Findings are permitted only for a genuinely missing major Level 3 Business area, cross-domain contradiction/incoherence, broken prerequisite/relationship dependency, or contradiction/duplication introduced by v0.6.',
  'Do not reopen unchanged individual nodes for stronger sources, wording preferences, more examples, model treatment or depth unless that creates one of the allowed whole-subject failures.',
  'Use web search only against supplied promotion-permitted publications; never use awarding-body/prohibited sources.',
  'Any blocking/material allowed integration finding => fail_hold.',
].join('\n')

function validateIntegration(candidate, output) {
  if (output.reviewed_node_count !== 81) throw new Error(`Integration reviewed_node_count ${output.reviewed_node_count}, expected 81`)
  exactSet(output.reviewed_domains, candidate.index.domains.map((domain) => domain.domain), 'integration domains')
  const allowed = new Set(candidate.sources.sources.filter((source) => source.promotion_eligible).map((source) => source.id))
  for (const itemEvidence of output.evidence) if (!allowed.has(itemEvidence.source_id) || !urlAllowed(itemEvidence, candidate.sourceById)) throw new Error(`Integration returned invalid evidence ${itemEvidence.source_id} ${itemEvidence.url}`)
  validateFindingSources(output.findings, allowed, 'integration')
  const knownIds = new Set(candidate.nodes.keys())
  for (const item of output.findings) for (const id of item.node_ids) if (!knownIds.has(id)) throw new Error(`Integration finding ${item.id} references unknown node ${id}`)
  const material = materialStatus(output.major_domain_coverage) || [output.cross_domain_coherence, output.relationship_dependency_consistency, output.v06_contradiction_or_duplication].some(materialStatus) || output.findings.some(materialFinding)
  if (output.decision !== (material ? 'fail_hold' : 'pass')) throw new Error('Integration decision inconsistent with findings')
}

async function reviewCall({ apiKey, label, schema, instructions, payload, domains, maxOutput, searchReserve, budget, contexts, providerAttempts, rejectedOutputs, validateOutput }) {
  let outputLimit = maxOutput
  let correction = ''
  for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
    const reserved = reserve(payload, outputLimit, searchReserve)
    if (budget.cost + reserved > MAX_SPEND) throw new Error(`content_factory_spend_ceiling_reached:${label}`)
    const body = { model: MODEL, store: false, reasoning: { context: 'current_turn', effort: 'high' }, max_output_tokens: outputLimit, instructions: ['You are a bounded fresh-context assurance worker inside Revision Content Factory.', 'The supplied repository material is the candidate under challenge, not authority to defend.', 'Use web search only in allowed promotion-source domains. Return only the requested JSON.', instructions, correction].filter(Boolean).join('\n'), input: JSON.stringify(payload), tools: [{ type: 'web_search', search_context_size: 'medium', filters: { allowed_domains: domains } }], tool_choice: 'required', text: { format: { type: 'json_schema', name: `revision-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`, strict: true, schema: schemaJson(schema) } } }
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const raw = await response.json().catch(() => ({}))
    const searches = searchCount(raw)
    const usageAvailable = Boolean(raw?.usage)
    const cost = usageAvailable ? observedCost(raw.usage, searches) : 0
    budget.cost = Number((budget.cost + cost).toFixed(8)); budget.searches += searches; if (!usageAvailable) budget.usageUnavailable = true
    if (raw?.id) { if (contexts.has(raw.id)) throw new Error(`Reused reviewer context ${raw.id}`); contexts.add(raw.id) }
    const record = { label, attempt, responseId: raw?.id || null, providerStatus: raw?.status || null, httpStatus: response.status, incompleteDetails: raw?.incomplete_details || null, usage: raw?.usage || null, usageAvailable, webSearchCalls: searches, observedCostUsd: cost, maxOutputTokens: outputLimit, outputContractAccepted: null, outputContractError: null }
    providerAttempts.push(record)
    if (budget.cost > MAX_SPEND) throw new Error(`${label} observed spend ${budget.cost} exceeds ${MAX_SPEND}`)
    if (!response.ok) throw new Error(`${label} HTTP ${response.status}: ${JSON.stringify(raw).slice(0, 1000)}`)
    if (raw.status === 'completed') {
      let output
      try {
        output = schema.parse(JSON.parse(responseText(raw))); validateOutput(output); record.outputContractAccepted = true
        return { responseId: raw.id, output, usage: raw.usage || null, webSearchCalls: searches, observedCostUsd: cost, providerAttempts: providerAttempts.filter((item) => item.label === label) }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        record.outputContractAccepted = false; record.outputContractError = message
        rejectedOutputs.push({ label, attempt, responseId: raw?.id || null, recordedAt: new Date().toISOString(), error: message, output: output ?? null })
        if (attempt >= MAX_PROVIDER_ATTEMPTS) throw new Error(`${label} output contract invalid after ${attempt} attempts: ${message}`)
        correction = `The prior fresh attempt was rejected by deterministic output validation: ${message}. Produce a complete replacement within the same governed scope.`
        continue
      }
    }
    const retryable = attempt < MAX_PROVIDER_ATTEMPTS && raw?.status === 'incomplete' && raw?.incomplete_details?.reason === 'max_output_tokens' && usageAvailable
    if (!retryable) throw new Error(`${label} provider status ${raw?.status || 'unknown'}`)
    outputLimit = Math.max(outputLimit * 2, RETRY_MIN_OUTPUT_TOKENS)
    correction = 'The prior fresh attempt reached only the provider output-token limit. Produce the complete requested replacement review.'
  }
  throw new Error(`${label} exhausted provider attempts`)
}

async function write(name, value) { await mkdir(OUT, { recursive: true }); await writeFile(`${OUT}/${name}`, `${JSON.stringify(value, null, 2)}\n`) }
async function summary(value) { if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${value}\n`) }
function uniqueMaterialFindings(reviews) {
  const map = new Map()
  for (const item of reviews.flatMap((review) => [...review.output.node_assessments.flatMap((assessmentItem) => assessmentItem.findings), ...review.output.group_findings].filter(materialFinding))) {
    const key = `${[...item.node_ids].sort().join(',')}|${item.issue_type}|${[...item.evidence_source_ids].sort().join(',')}`
    if (!map.has(key)) map.set(key, item)
  }
  return [...map.values()]
}
function baseEvidence({ sha, candidate, budget, contexts, providerAttempts, rejectedOutputs, scopedReviews, startedAt }) {
  return { schemaVersion: 1, recordedAt: new Date().toISOString(), startedAt, reviewedMainSha: sha, candidateVersion: candidate.index.candidate_version, candidateFingerprint: candidate.fingerprint, previousCandidateFingerprint: candidate.previousCandidateFingerprint, model: MODEL, configuredMaxSpendUsd: MAX_SPEND, observedSpendUsd: budget.cost, spendMeasurement: budget.usageUnavailable ? 'partial_provider_usage_unavailable' : 'provider_usage_estimate', webSearchCalls: budget.searches, reviewerContextIds: [...contexts], providerAttempts, rejectedOutputs, preservedAssurance: { workflowRunId: candidate.v06Overlay.triggering_assurance.workflow_run_id, artifactId: candidate.v06Overlay.triggering_assurance.artifact_id, artifactDigest: candidate.v06Overlay.triggering_assurance.artifact_digest, reviewedCandidateFingerprint: candidate.v06Overlay.triggering_assurance.reviewed_candidate_fingerprint, preservedUnchangedNodeCount: 78 }, freshNodeScope: EXPECTED_FRESH_SCOPE, scopedReviews }
}

async function selfTest() {
  const candidate = await loadCandidate()
  assertProviderSchemaCompatible(schemaJson(scopedSchema), 'scoped reassurance schema')
  assertProviderSchemaCompatible(schemaJson(integrationSchema), 'integration reassurance schema')
  for (const id of candidate.nodes.keys()) {
    const expected = EXPECTED_FRESH_SCOPE.includes(id) ? 'TARGETED_REMEDIATION_AWAITING_INDEPENDENT_REASSURANCE' : 'PRIOR_ASSURANCE_PRESERVED_UNCHANGED'
    if (candidate.rows.get(id)?.promotion_provenance_status !== expected) throw new Error(`Incremental assurance status mismatch for ${id}`)
  }
  const group = REVIEW_GROUPS[0]
  const payload = scopedPayload(candidate, group)
  if (payload.nodes.some((node) => Object.hasOwn(node, 'sources'))) throw new Error('Legacy node sources leaked into scoped reviewer payload')
  const id = group.ids[0], sourceId = candidate.rows.get(id).subject_truth_sources[0], source = candidate.sourceById.get(sourceId)
  const valid = { review_group: group.name, reviewed_node_ids: [id], decision: 'pass', node_assessments: [{ subject_id: id, status: 'pass', factual_accuracy: 'pass', level3_scope: 'pass', quantitative_accuracy: 'not_applicable', relationships_and_boundaries: 'pass', source_support: 'pass', evidence: [{ source_id: sourceId, url: source.url, claim_checked: 'self-test', result: 'supports', summary: 'self-test' }], summary: 'self-test', findings: [] }], relationship_scope_status: 'complete', relationship_scope_summary: 'self-test', group_findings: [], known_limitations: [] }
  validateScoped(candidate, group, valid)
  const encodedSource = candidate.sourceById.get('SRC-OER-LIBRETEXTS-COMMUNICATION-2023')
  const decoded = 'https://biz.libretexts.org/Courses/Lumen_Learning/Principles_of_Management_(Lumen)/14:_Communication/14.14:_Channels_of_Business_Communication'
  if (!urlAllowed({ source_id: encodedSource.id, url: decoded }, candidate.sourceById)) throw new Error('Encoded/decoded URL equivalence regression failed')
  if (urlAllowed({ source_id: encodedSource.id, url: `${decoded}/../Different_Page` }, candidate.sourceById)) throw new Error('Unsafe/sibling URL boundary accepted')
  if (integrationPayload(candidate, []).nodes.length !== 81) throw new Error('Integration payload must contain all 81 nodes')
  console.log(JSON.stringify({ status: 'pass', candidateVersion: candidate.index.candidate_version, nodeCount: candidate.nodes.size, candidateFingerprint: candidate.fingerprint, previousCandidateFingerprint: candidate.previousCandidateFingerprint, freshNodeScopeCount: 3, preservedNodeCount: 78, reviewGroupCount: 3, finalIntegrationReview: 'required', duplicateMaterialFindingReporting: 'deduplicated_by_node_issue_type_and_evidence', providerSchemaCompatibility: 'pass', encodedDecodedUrlEquivalence: 'pass', unrelatedStandaloneNodeReopening: 'prohibited_by_contract' }, null, 2))
}

async function live() {
  if (process.env.CONTENT_FACTORY_BUSINESS_SUBJECT_REASSURANCE !== '1') throw new Error('CONTENT_FACTORY_BUSINESS_SUBJECT_REASSURANCE=1 required')
  const apiKey = process.env.OPENAI_API_KEY?.trim(); if (!apiKey) throw new Error('OPENAI_API_KEY required')
  if (!Number.isFinite(MAX_SPEND) || MAX_SPEND <= 0) throw new Error('CONTENT_FACTORY_MAX_SPEND_USD must be positive')
  const sha = process.env.REVISION_REVIEWED_MAIN_SHA?.trim(); if (!/^[0-9a-f]{40}$/.test(sha || '')) throw new Error('REVISION_REVIEWED_MAIN_SHA must be a SHA')
  const actual = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); if (actual !== sha) throw new Error(`Checked out ${actual}, expected ${sha}`)
  const candidate = await loadCandidate(), budget = { cost: 0, searches: 0, usageUnavailable: false }, contexts = new Set(), providerAttempts = [], rejectedOutputs = [], scopedReviews = [], startedAt = new Date().toISOString()
  try {
    for (const group of REVIEW_GROUPS) {
      const payload = scopedPayload(candidate, group)
      const domains = uniq(payload.rights_boundary.permitted_subject_truth_sources.map((source) => host(source.url)))
      const review = await reviewCall({ apiKey, label: `business-v06-${group.name}`, schema: scopedSchema, instructions: scopedInstructions(group), payload, domains, maxOutput: 4500, searchReserve: 2, budget, contexts, providerAttempts, rejectedOutputs, validateOutput: (output) => validateScoped(candidate, group, output) })
      scopedReviews.push({ group: group.name, ...review })
      await write('business-subject-foundation-reassurance-partial.json', { ...baseEvidence({ sha, candidate, budget, contexts, providerAttempts, rejectedOutputs, scopedReviews, startedAt }), artifactType: 'business_subject_foundation_v06_reassurance_partial', status: 'in_progress', materialFindings: uniqueMaterialFindings(scopedReviews) })
    }
    const scopedMaterial = uniqueMaterialFindings(scopedReviews)
    if (scopedMaterial.length) {
      const artifact = { ...baseEvidence({ sha, candidate, budget, contexts, providerAttempts, rejectedOutputs, scopedReviews, startedAt }), artifactType: 'business_subject_foundation_v06_reassurance_evidence', integrationReview: null, materialFindings: scopedMaterial, finalDecision: 'fail_hold', promotionEffect: 'none' }
      await write('business-subject-foundation-reassurance.json', artifact)
      throw new Error(`business_subject_foundation_v06_targeted_fail_hold:${scopedMaterial.length}_unique_material_findings`)
    }
    const payload = integrationPayload(candidate, scopedReviews)
    const domains = uniq(payload.rights_boundary.permitted_subject_truth_sources.map((source) => host(source.url)))
    const integration = await reviewCall({ apiKey, label: 'business-v06-final-integration', schema: integrationSchema, instructions: integrationInstructions(candidate), payload, domains, maxOutput: 6500, searchReserve: 5, budget, contexts, providerAttempts, rejectedOutputs, validateOutput: (output) => validateIntegration(candidate, output) })
    const integrationMaterial = integration.output.findings.filter(materialFinding)
    const decision = integration.output.decision === 'pass' ? 'pass' : 'fail_hold'
    const artifact = { ...baseEvidence({ sha, candidate, budget, contexts, providerAttempts, rejectedOutputs, scopedReviews, startedAt }), artifactType: 'business_subject_foundation_v06_reassurance_evidence', reviewMethod: 'fresh review of exactly three remediated nodes plus one integration-only whole-subject check; all other accepted evidence preserved', integrationReview: integration, materialFindings: integrationMaterial, finalDecision: decision, promotionEffect: 'none; PASS closes automated subject-foundation T3 assurance only', excludedScope: ['AQA 7132 specification mapping and Course Truth projection', 'AQA Exam Truth', 'exact-course assurance', 'qualified human subject/assessment approval', 'learner-facing publication'] }
    await write('business-subject-foundation-reassurance.json', artifact)
    await write('business-subject-foundation-reassurance-summary.json', { reviewedMainSha: sha, candidateVersion: candidate.index.candidate_version, candidateFingerprint: candidate.fingerprint, previousCandidateFingerprint: candidate.previousCandidateFingerprint, freshNodeScopeCount: 3, preservedNodeCount: 78, finalDecision: decision, materialFindingCount: integrationMaterial.length, observedSpendUsd: budget.cost, webSearchCalls: budget.searches, reviewerContextCount: contexts.size, providerAttemptCount: providerAttempts.length, rejectedOutputCount: rejectedOutputs.length })
    await summary(`## Business Subject Foundation v0.6 reassurance\n\n- Reviewed main: \`${sha}\`\n- Candidate: **${candidate.index.candidate_version}**\n- Freshly reviewed nodes: 3\n- Preserved unchanged nodes: 78\n- Final integration-only review: completed\n- Decision: **${decision.toUpperCase()}**\n- Blocking/material integration findings: ${integrationMaterial.length}`)
    if (decision !== 'pass') throw new Error(`business_subject_foundation_v06_integration_fail_hold:${integrationMaterial.length}_material_findings`)
  } catch (error) {
    const failure = { ...baseEvidence({ sha, candidate, budget, contexts, providerAttempts, rejectedOutputs, scopedReviews, startedAt }), artifactType: 'business_subject_foundation_v06_reassurance_failure', error: error instanceof Error ? error.message : String(error) }
    await write('business-subject-foundation-reassurance-failure.json', failure)
    throw error
  }
}

try {
  if (process.argv[2] === '--self-test') await selfTest()
  else await live()
} catch (error) {
  console.error(error instanceof Error ? (error.stack || error.message) : String(error))
  process.exit(1)
}
