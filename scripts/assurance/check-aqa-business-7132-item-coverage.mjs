// Item-level coverage check for AQA A-level Business 7132 (2027) — fast-path step 2 (ADR-0029).
// Software-proven: for every named item in NAMED_ITEMS.json, is it taught by a Subject Foundation node
// mapped to its specification section? No AI calls.
//
//   node scripts/assurance/check-aqa-business-7132-item-coverage.mjs           check structure + committed report is current
//   node scripts/assurance/check-aqa-business-7132-item-coverage.mjs --write   regenerate the committed report
//   node scripts/assurance/check-aqa-business-7132-item-coverage.mjs --gate    also fail unless every item is covered (T8 gate)
import { readFile, writeFile } from 'node:fs/promises'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const ITEMS_PATH = 'research/aqa-business-7132/2027/NAMED_ITEMS.json'
const REPORT_PATH = 'research/aqa-business-7132/2027/ITEM_COVERAGE_REPORT.json'
const KINDS = new Set(['concept', 'formula', 'model', 'skill'])
// Node fields that are metadata rather than teaching.
const NON_TEACHING_KEYS = new Set(['subject_id', 'sources', 'uncertainties', 'confidence', 'related_nodes', 'prerequisites', 'candidate_version', 'domain', 'scope_classification', 'node_types', 'recommended_depth'])

export function normalise(text) {
  return ` ${String(text).toLowerCase().replace(/[’'`]/g, '').replace(/[-‐‑–—_/]/g, ' ').replace(/\s+/g, ' ').trim()} `
}

export function matches(text, phrase) {
  const p = normalise(phrase).trim()
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Short phrases (abbreviations such as ROCE, ARR) must be whole words; longer ones may be stems (e.g. "franchis").
  const pattern = p.length <= 4 ? new RegExp(`(?<![a-z0-9])${escaped}s?(?![a-z0-9])`) : new RegExp(`(?<![a-z0-9])${escaped}`)
  return pattern.test(text)
}

function teachingText(node) {
  const parts = []
  const walk = (value) => { if (typeof value === 'string') parts.push(value); else if (Array.isArray(value)) value.forEach(walk); else if (value && typeof value === 'object') Object.values(value).forEach(walk) }
  for (const [key, value] of Object.entries(node)) if (!NON_TEACHING_KEYS.has(key)) walk(value)
  return normalise(parts.join(' \n '))
}

// Places where a formula or named model is explicitly taught, not just mentioned.
// Methods are stored either as { name, formula } or as a plain "name = formula" line.
function methodEntries(node) {
  return (node.quantitative_content?.methods || []).map((method) => {
    if (typeof method === 'string') { const [name, ...rest] = method.split('='); return { name, formula: rest.join('=') } }
    return { name: method.name, formula: method.formula }
  })
}
function formulaEntries(node) {
  return methodEntries(node).filter((method) => String(method.formula || '').trim() && String(method.name || '').trim()).map((method) => normalise(method.name))
}
function modelEntries(node) {
  const tc = node.teaching_content || {}
  return [
    ...(node.models_frameworks || []).map((model) => (typeof model === 'string' ? model : `${model.name || ''}`)),
    ...(tc.course_relevant_named_facets || []).map((facet) => facet.name),
    ...(tc.definitions || []).map((definition) => String(definition).split(':')[0]),
    ...methodEntries(node).map((method) => method.name || ''),
  ].map(normalise)
}

function evidenceIn(node, item) {
  const hit = (texts) => item.match.find((phrase) => texts.some((text) => matches(text, phrase)))
  if (item.kind === 'formula') { const phrase = hit(formulaEntries(node)); return phrase ? { taught: true, phrase } : { taught: false, mentioned: Boolean(hit([teachingText(node)])) } }
  if (item.kind === 'model') { const phrase = hit(modelEntries(node)); return phrase ? { taught: true, phrase } : { taught: false, mentioned: Boolean(hit([teachingText(node)])) } }
  const phrase = hit([teachingText(node)])
  return phrase ? { taught: true, phrase } : { taught: false, mentioned: false }
}

export function checkCoverage({ items, requirements, nodes }) {
  const bySection = new Map(requirements.map((row) => [row.source_section, row]))
  return items.map((item) => withConvention(item, (() => {
    const row = bySection.get(item.section)
    const mapped = row.mapped_subject_node_ids
    const taughtBy = mapped.map((id) => ({ id, ...evidenceIn(nodes.get(id), item) })).filter((result) => result.taught)
    if (taughtBy.length) return { id: item.id, section: item.section, label: item.label, kind: item.kind, status: 'covered', taught_by: taughtBy.map(({ id, phrase }) => ({ node: id, matched: phrase })) }
    const elsewhere = [...nodes.values()].filter((node) => !mapped.includes(node.subject_id) && evidenceIn(node, item).taught).map((node) => node.subject_id)
    if (elsewhere.length) return { id: item.id, section: item.section, label: item.label, kind: item.kind, status: 'found_in_unmapped_node', fix: 'check whether one of these nodes really teaches it; if so add that node to the section mapping, otherwise teach it in a mapped node', found_in: elsewhere }
    const mentionedIn = mapped.filter((id) => evidenceIn(nodes.get(id), item).mentioned)
    if (mentionedIn.length) return { id: item.id, section: item.section, label: item.label, kind: item.kind, status: 'mentioned_not_taught', fix: item.kind === 'formula' ? 'add a quantitative method with the formula' : 'add the named model/definition', mentioned_in: mentionedIn }
    return { id: item.id, section: item.section, label: item.label, kind: item.kind, status: 'missing', fix: 'teach the item in a mapped node (or extend the Foundation)' }
  })()))
}

// Carries AQA's calculation convention (Course Truth fact) through to the report and the T8 reviewer.
function withConvention(item, result) {
  return item.aqa_convention ? { ...result, aqa_convention: item.aqa_convention, convention_status: item.convention_status } : result
}

export function validateItems(doc, requirements, nodes) {
  const errors = []
  const sections = new Set(requirements.map((row) => row.source_section))
  if (requirements.length !== 42) errors.push(`expected 42 mapped AQA sections, got ${requirements.length}`)
  const ids = new Set()
  for (const item of doc.items || []) {
    if (ids.has(item.id)) errors.push(`duplicate item id ${item.id}`)
    ids.add(item.id)
    if (!sections.has(item.section)) errors.push(`${item.id} refers to unknown section ${item.section}`)
    if (!KINDS.has(item.kind)) errors.push(`${item.id} has invalid kind ${item.kind}`)
    if (!String(item.label || '').trim()) errors.push(`${item.id} has no label`)
    if (!Array.isArray(item.match) || !item.match.length || item.match.some((phrase) => !String(phrase).trim())) errors.push(`${item.id} needs at least one match phrase`)
    if (item.kind === 'formula' && !String(item.aqa_convention || '').trim()) errors.push(`${item.id} is a formula without an AQA convention`)
    if (item.aqa_convention && !['confirmed', 'to_confirm_against_aqa_mark_scheme'].includes(item.convention_status)) errors.push(`${item.id} has an invalid convention_status`)
  }
  for (const section of sections) if (!(doc.items || []).some((item) => item.section === section)) errors.push(`section ${section} has no named items`)
  for (const row of requirements) for (const id of row.mapped_subject_node_ids || []) if (!nodes.has(id)) errors.push(`${row.source_section} maps to unknown node ${id}`)
  return errors
}

function buildReport(doc, candidate, results) {
  const count = (status) => results.filter((result) => result.status === status).length
  return {
    schema_version: 1,
    generated_by: 'scripts/assurance/check-aqa-business-7132-item-coverage.mjs',
    course_id: doc.course_id,
    exam_year: doc.exam_year,
    foundation_candidate_version: candidate.index.candidate_version,
    foundation_fingerprint: candidate.fingerprint,
    mapping_id: mapping.mapping_id,
    summary: { items: results.length, conventions_to_confirm: results.filter((result) => result.convention_status === 'to_confirm_against_aqa_mark_scheme').map((result) => result.id), covered: count('covered'), found_in_unmapped_node: count('found_in_unmapped_node'), mentioned_not_taught: count('mentioned_not_taught'), missing: count('missing') },
    gaps: results.filter((result) => result.status !== 'covered'),
    covered: results.filter((result) => result.status === 'covered'),
  }
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const doc = JSON.parse(await readFile(ITEMS_PATH, 'utf8'))
  const candidate = await loadBusinessSubjectFoundationCandidate()
  const errors = validateItems(doc, mapping.requirements, candidate.nodes)
  if (errors.length) { console.error(`Named-item file is invalid:\n- ${errors.join('\n- ')}`); process.exitCode = 1; return }

  const report = buildReport(doc, candidate, checkCoverage({ items: doc.items, requirements: mapping.requirements, nodes: candidate.nodes }))
  const serialised = `${JSON.stringify(report, null, 2)}\n`
  if (args.has('--write')) await writeFile(REPORT_PATH, serialised)
  else {
    const committed = await readFile(REPORT_PATH, 'utf8').catch(() => '')
    if (committed !== serialised) { console.error(`${REPORT_PATH} is out of date with the Foundation, mapping or named items. Run with --write and commit the result.`); process.exitCode = 1 }
  }

  const { summary } = report
  console.log(`AQA 7132 item-level coverage: ${summary.covered}/${summary.items} items covered`)
  console.log(`  found only in a node not mapped to its section: ${summary.found_in_unmapped_node}`)
  console.log(`  mentioned but formula/model not taught:        ${summary.mentioned_not_taught}`)
  console.log(`  missing:                                       ${summary.missing}`)
  if (args.has('--gate') && summary.covered !== summary.items) { console.error('Item-level coverage gate: FAIL (see gaps in the report)'); process.exitCode = 1 }
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
