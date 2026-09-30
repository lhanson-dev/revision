import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'
import {
  deriveFoundationCourseLearningDesign,
  type FoundationCourseLearningNodeDesign,
} from '../../src/content-factory/foundation-course-learning-blueprint'

// Step 5a (T9): derive the Learning Blueprint for one slice of AQA 7132 with software only (no AI, no spend).
// The blueprint says, per named item, which Learn treatments and Practice capabilities its teaching node gets,
// and flags any item whose treatment cannot carry what the item needs (formula -> worked example + calculation, etc.).
// Run with CONTENT_FACTORY_WRITE_SLICE_BLUEPRINT=1 to rewrite the committed file; otherwise the test checks it is current.

const SLICE_PREFIX = '3.5'
const OUT_PATH = 'content-factory/slices/aqa-7132-3.5/BLUEPRINT.json'
const CKM_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-knowledge-model.json'

// Item-level additions where the node-level derivation cannot see what the item needs. Each needs a reason.
const ITEM_ADDITIONS: Record<string, { learnTreatments: string[]; practiceCapabilities: string[]; reason: string }> = {
  'aqa-7132-3.5.2:cash-flow-forecast': {
    learnTreatments: ['worked_example', 'purposeful_visual'],
    practiceCapabilities: ['construction', 'calculation'],
    reason: 'A cash-flow forecast is a table students build and complete (opening balance, inflows, outflows, closing balance), so it needs a worked example, a visual layout and a construction task.',
  },
}

type NamedItem = { id: string; section: string; label: string; kind: 'concept' | 'formula' | 'model' | 'skill'; aqa_convention?: string; convention_status?: string }
type CoverageEntry = { id: string; taught_by?: Array<{ node: string }> }

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function union<T extends string>(lists: T[][]) {
  return [...new Set(lists.flat())].sort() as T[]
}

function buildBlueprint() {
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'], { stdio: 'pipe' })
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs'], { stdio: 'pipe' })

  const ckm = readJson<{ fingerprint: string; nodes: Array<{ id: string }> }>(CKM_PATH)
  const named = readJson<{ items: NamedItem[] }>('research/aqa-business-7132/2027/NAMED_ITEMS.json').items
    .filter((item) => item.section.startsWith(`${SLICE_PREFIX}.`))
  const coverage = readJson<{ covered: CoverageEntry[] }>('research/aqa-business-7132/2027/ITEM_COVERAGE_REPORT.json')
  const taughtBy = new Map(coverage.covered.map((entry) => [entry.id, (entry.taught_by ?? []).map((t) => t.node.toLowerCase())]))

  const sections = mapping.requirements.filter((r: { source_section: string }) => r.source_section.startsWith(`${SLICE_PREFIX}.`))
  const sliceNodeIds = [...new Set<string>(sections.flatMap((r: { mapped_subject_node_ids: string[] }) => r.mapped_subject_node_ids.map((id) => id.toLowerCase())))].sort()
  const ckmById = new Map(ckm.nodes.map((node) => [node.id, node]))
  const missingFromCourse = sliceNodeIds.filter((id) => !ckmById.has(id))
  const design = deriveFoundationCourseLearningDesign(sliceNodeIds.filter((id) => ckmById.has(id)).map((id) => ckmById.get(id)))
  const designById = new Map<string, FoundationCourseLearningNodeDesign>(design.nodes.map((node) => [node.nodeId, node]))

  const items = named.map((item) => {
    const nodes = (taughtBy.get(item.id) ?? []).filter((id) => designById.has(id))
    const designs = nodes.map((id) => designById.get(id)!)
    const addition = ITEM_ADDITIONS[item.id]
    const classifications = union(designs.map((d) => d.classifications))
    const learnTreatments = union([...designs.map((d) => d.learnTreatments), addition?.learnTreatments ?? []])
    const practiceCapabilities = union([...designs.map((d) => d.practiceCapabilities), addition?.practiceCapabilities ?? []])
    const has = (list: string[], ...values: string[]) => values.some((value) => list.includes(value))

    let gapReason: string | null = null
    if (nodes.length === 0) gapReason = 'no teaching node in this slice'
    else if (item.kind === 'formula' && !(has(classifications, 'formula_quantitative') && has(practiceCapabilities, 'calculation') && has(learnTreatments, 'worked_example'))) {
      gapReason = 'formula needs a worked example and a calculation task'
    } else if (item.kind === 'model' && !(has(classifications, 'model_framework') || has(learnTreatments, 'purposeful_visual') || has(practiceCapabilities, 'construction', 'framework_application'))) {
      gapReason = 'model needs a framework or visual treatment and a construction or application task'
    } else if (item.kind === 'skill' && !(has(classifications, 'procedure_skill', 'analysis_reasoning', 'evaluation_judgement', 'application_context')
      && has(practiceCapabilities, 'procedure_execution', 'reasoning_chain', 'contextual_judgement', 'contextual_application'))) {
      gapReason = 'skill needs a procedure, reasoning or judgement treatment and a matching task'
    }

    return {
      id: item.id,
      section: item.section,
      label: item.label,
      kind: item.kind,
      ...(item.aqa_convention ? { aqaConvention: item.aqa_convention, conventionStatus: item.convention_status } : {}),
      taughtBy: nodes,
      classifications,
      learnTreatments,
      practiceCapabilities,
      ...(addition ? { addedByBlueprint: addition.reason } : {}),
      status: gapReason ? 'gap' : 'treated',
      ...(gapReason ? { gapReason } : {}),
    }
  })

  return {
    schemaVersion: 1,
    slice: { courseId: 'aqa:aqa-a-level:7132', examYear: 2027, sectionPrefix: SLICE_PREFIX, sections: sections.map((r: { source_section: string }) => r.source_section) },
    courseKnowledgeModelFingerprint: ckm.fingerprint,
    nodes: design.nodes,
    items,
    summary: {
      nodes: design.nodes.length,
      items: items.length,
      treated: items.filter((i) => i.status === 'treated').length,
      gaps: items.filter((i) => i.status === 'gap').map((i) => ({ id: i.id, reason: (i as { gapReason?: string }).gapReason })),
      nodesMissingFromCourse: missingFromCourse,
      conventionsToConfirm: items.filter((i) => (i as { conventionStatus?: string }).conventionStatus === 'to_confirm_against_aqa_mark_scheme').map((i) => i.id),
    },
  }
}

describe('AQA 7132 slice blueprint (software only)', () => {
  const blueprint = buildBlueprint()

  it('gives every slice node exactly one design and finds every slice node in the course model', () => {
    expect(blueprint.summary.nodesMissingFromCourse).toEqual([])
    expect(new Set(blueprint.nodes.map((n) => n.nodeId)).size).toBe(blueprint.nodes.length)
    expect(blueprint.summary.items).toBeGreaterThan(0)
  })

  it('treats every named item in the slice, or names the gap', () => {
    const untreatedWithoutReason = blueprint.items.filter((i) => i.status === 'gap' && !(i as { gapReason?: string }).gapReason)
    expect(untreatedWithoutReason).toEqual([])
  })

  it('matches the committed blueprint file (run with CONTENT_FACTORY_WRITE_SLICE_BLUEPRINT=1 to update it)', () => {
    const text = `${JSON.stringify(blueprint, null, 2)}\n`
    if (process.env.CONTENT_FACTORY_WRITE_SLICE_BLUEPRINT === '1') {
      mkdirSync(dirname(OUT_PATH), { recursive: true })
      writeFileSync(OUT_PATH, text)
    }
    expect(readFileSync(OUT_PATH, 'utf8')).toBe(text)
  })
})
