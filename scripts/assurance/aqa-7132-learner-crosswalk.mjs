/**
 * Issue #698 — structural crosswalk between exact AQA 7132 named requirements
 * and the material actually imported into the canonical learner ContentPacks.
 *
 * DO NOT interpret this as semantic, source-rights, independent exam-quality,
 * live-site, marking-validity or qualified educational assurance.
 *
 * Usage: node scripts/assurance/aqa-7132-learner-crosswalk.mjs [--write] [--strict]
 */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const source = (path) => readFile(join(ROOT, path), 'utf8').then(JSON.parse)
const outputPath = 'research/specification-to-learner/aqa-7132-learner-crosswalk.json'

async function collect(directory, suffix = '.json') {
  const children = await readdir(join(ROOT, directory), { withFileTypes: true })
  return children.filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => directory + '/' + entry.name)
}

export async function evidenceCrosswalk() {
  const [register, manifest, retained] = await Promise.all([
    source('research/aqa-business-7132/2027/NAMED_ITEMS.json'),
    source('research/specification-to-learner/aqa-2027-source-manifest.json'),
    source('content/business/aqa-a-level/shared/fast-path-question-bank.json'),
  ])
  const business = manifest.courses.find((course) => course.specification_code === '7132')
  if (!business || business.pdf_sha256 !== '3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332') {
    throw new Error('Issue #698: exact AQA 7132 v2.0 source fingerprint missing or mismatched')
  }
  const root = 'content-factory/slices'
  const sliceDirs = (await readdir(join(ROOT, root), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('aqa-7132-'))
    .map((entry) => root + '/' + entry.name)
  const lessonPaths = []
  const originalQuestionPaths = []
  for (const dir of sliceDirs) {
    try { lessonPaths.push(...await collect(dir + '/learn-practice')) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    // Include every approved AQA 7132 section: 3.5 pilot and future additions
    // such as 3.10 use the same standard bank ingestion contract.
    try { originalQuestionPaths.push(...await collect(dir + '/questions')) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  lessonPaths.sort()
  originalQuestionPaths.sort()
  const [assets, originals] = await Promise.all([
    Promise.all(lessonPaths.map(async (path) => ({ path, data: await source(path) }))),
    Promise.all(originalQuestionPaths.map(async (path) => ({ path, data: await source(path) }))),
  ])
  const entries = new Map()
  const problems = []
  for (const item of register.items) {
    if (entries.has(item.id)) { problems.push('duplicate named item ' + item.id); continue }
    if (!business.sections[item.section]) problems.push('unknown exact-source section/page for ' + item.id)
    entries.set(item.id, {
      id:item.id, section:item.section, source_pdf_page:business.sections[item.section] ?? null,
      label:item.label, kind:item.kind, learn_blocks:[], self_check_cards:[],
      independently_scored_questions:[], marker_dependent_written_questions:[],
      not_currently_scored_bank_questions:[], semantic_review:'UNVERIFIED',
      demonstrated_learner_skill:'UNVERIFIED', live_site_verified:false,
    })
  }
  const bind = (id, field, evidence) => {
    const row = entries.get(id)
    if (!row) { problems.push('asset references unknown named item ' + id); return }
    row[field].push(evidence)
  }
  const nodes = new Set()
  let numberOfBlocks = 0
  let numberOfCards = 0
  for (const { path, data } of assets) {
    if (!data.node_id) { problems.push('missing lesson node id '+path); continue }
    if (nodes.has(data.node_id)) problems.push('duplicate lesson node '+data.node_id)
    nodes.add(data.node_id)
    const sections = data.learn?.sections ?? []
    for (const [index, block] of sections.entries()) {
      numberOfBlocks++
      if (!block.body?.trim()) problems.push('empty lesson explanation '+path+' '+index)
      for (const id of block.item_ids ?? []) {
        bind(id, 'learn_blocks', { page_id:data.node_id, block:index, heading:block.heading, path })
      }
    }
    for (const card of data.practice?.items ?? []) {
      numberOfCards++
      const cardId = (`fast-${data.node_id}-${card.id}`).replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
      if (!card.prompt?.trim() || !card.answer?.trim()) problems.push('empty self-check card '+cardId)
      for (const id of card.item_ids ?? []) {
        bind(id, 'self_check_cards', {
          card_id:cardId, declared_capability:card.capability ?? 'unspecified',
          evidence_mode:'answer_reveal_self_check_not_graded', path,
        })
      }
    }
  }
  const bank = [
    ...retained.questions.map((data) => ({ path:'content/business/aqa-a-level/shared/fast-path-question-bank.json', data })),
    ...originals.map(({ path, data }) => ({ path, data:{ ...data, batch:data.batch ?? '3.5' } })),
  ]
  const questionIds = new Set()
  const types = { scored:0, marker_dependent:0, not_scored:0 }
  for (const { path, data } of bank) {
    const id = `${data.namespace ?? 'aqa7132'}-${data.batch}-${data.id}`
    if (questionIds.has(id)) problems.push('duplicate bank question id '+id)
    questionIds.add(id)
    const question = data.question
    if (!question || !Number.isInteger(question.marks) || question.marks <= 0) problems.push('invalid marks for '+id)
    const family=question?.family
    const scheme=question?.mark_scheme
    const answers=(question?.options ?? []).map((option) => option.label)
    const isMCQ=family === 'MCQ' && scheme?.type === 'single_option' && answers.includes(scheme.correct_option)
    const isSingleCalculation=family === 'SHORT_ANSWER' && question.calcs?.length === 1 && !/\(a\)/i.test(question.stem ?? '')
    const markPoints=scheme?.type==='points' && Array.isArray(scheme.points) ? scheme.points : []
    const hasWrittenRubric=(family === 'SHORT_ANSWER' || family === 'DATA_RESPONSE')
      && scheme?.type === 'points' && question.marks <= 6 && markPoints.length > 0
      && markPoints.every((point) => Number.isInteger(point.marks) && point.marks>0 && point.descriptor && Array.isArray(point.accept))
      && markPoints.reduce((sum,point)=>sum+point.marks,0)===question.marks
    const field=isMCQ || isSingleCalculation && Number.isFinite(question.calcs[0].stated_answer)
      ? 'independently_scored_questions'
      : hasWrittenRubric ? 'marker_dependent_written_questions'
        : 'not_currently_scored_bank_questions'
    types[field==='independently_scored_questions'?'scored':field==='marker_dependent_written_questions'?'marker_dependent':'not_scored']++
    for (const namedId of data.target_item_ids ?? []) {
      bind(namedId, field, { question_id:id, family, marks:question.marks, path })
    }
  }
  const rows = [...entries.values()].sort((a,b)=>a.id.localeCompare(b.id))
  const noLearn = rows.filter((row)=>!row.learn_blocks.length).map((row)=>row.id)
  const noPractice = rows.filter((row)=>!row.self_check_cards.length && !row.independently_scored_questions.length
    && !row.marker_dependent_written_questions.length).map((row)=>row.id)
  const noScored = rows.filter((row)=>!row.independently_scored_questions.length
    && !row.marker_dependent_written_questions.length).map((row)=>row.id)
  const bySection = {}
  for (const row of rows) {
    const section = row.section.match(/^3\.(?:10|[1-9])/)?.[0] ?? row.section
    const summary=bySection[section] ?? { named_items:0, with_learn_link:0, with_practice_link:0, with_scored_or_marker_question:0 }
    summary.named_items++
    if (row.learn_blocks.length) summary.with_learn_link++
    if (row.self_check_cards.length || row.independently_scored_questions.length || row.marker_dependent_written_questions.length) summary.with_practice_link++
    if (row.independently_scored_questions.length || row.marker_dependent_written_questions.length) summary.with_scored_or_marker_question++
    bySection[section]=summary
  }
  return {
    schema_version:1, course_id:register.course_id, reference_spec_pdf_version:business.pdf_version,
    reference_spec_sha256:business.pdf_sha256, source_rights:'REFERENCE_ONLY',
    method:'actual asset item_id and question target_item_ids linkage, not keyword matching',
    scope:'published AQA Business generated Learn blocks, self-check cards and structured question bank',
    summary: {
      register_named_items:rows.length, generated_learning_nodes:nodes.size,
      generated_explanation_blocks:numberOfBlocks, self_check_cards:numberOfCards,
      structured_questions:bank.length, question_modes:types,
      items_with_learn_link:rows.length-noLearn.length,
      items_with_any_practice_link:rows.length-noPractice.length,
      items_with_scored_or_marker_question:rows.length-noScored.length,
      structural_problems:problems.length,
    }, by_section:bySection, lacking_learn_binding:noLearn,
    lacking_practice_binding:noPractice, lacking_scored_or_marker_question:noScored,
    structural_problems:problems, named_requirements:rows,
    not_proven:[
      '344-item named register has not been independently atomized and reconciled to every compound PDF demand',
      'Explicit item ID does not prove lesson truth, sufficiency, exam accuracy, active task suitability or marking quality',
      'Self-check card is an answer reveal, not an independently demonstrated student skill',
      'Written marking is dependent on the marker being connected; restricted cases are not active practice',
      'Authored legacy notes, mocks and other resources without an explicit item ID are excluded; a missing link is not proof of absent content',
      'This analysis does not execute authenticated browser journeys or verify production deployment',
      'No independent subject-expert acceptance follows from these numerical or structural checks',
    ],
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2))
  const report = await evidenceCrosswalk()
  if (args.has('--write')) {
    const file=join(ROOT,outputPath)
    await mkdir(dirname(file), { recursive:true })
    await writeFile(file,JSON.stringify(report,null,2)+'\n')
  }
  console.log(JSON.stringify({summary:report.summary,by_section:report.by_section,
    missing:report.lacking_learn_binding.length,missing_practice:report.lacking_practice_binding.length,
    no_scored_question:report.lacking_scored_or_marker_question.length,problems:report.structural_problems},null,2))
  if (report.structural_problems.length || args.has('--strict') && (report.lacking_learn_binding.length || report.lacking_practice_binding.length)) process.exitCode=1
}
