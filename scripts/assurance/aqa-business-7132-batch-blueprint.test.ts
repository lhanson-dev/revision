// AQA 7132 course batches: the Learning Blueprint for every batch, by software only (no AI, no spend).
// Run with CONTENT_FACTORY_WRITE_BATCH_BLUEPRINTS=1 to rewrite the committed files; otherwise the test checks they are current.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { describe, expect, it } from 'vitest'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'
import { buildBatchBlueprints, type BatchConfig, type CoverageEntry, type NamedItem } from './aqa-business-7132-batch-blueprint'
import type { Blueprint } from './aqa-business-7132-slice-learn-practice'

const CONFIG = 'content-factory/slices/aqa-7132-batches.json'
const CKM_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-knowledge-model.json'
const blueprintPath = (id: string) => `content-factory/slices/aqa-7132-${id}/BLUEPRINT.json`
const readJson = <T>(path: string) => JSON.parse(readFileSync(path, 'utf8')) as T

function build() {
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs'], { stdio: 'pipe' })
  execFileSync('node', ['scripts/assurance/materialise-aqa-business-7132-runtime-adapter.mjs'], { stdio: 'pipe' })
  const config = readJson<BatchConfig & { course_id: string }>(CONFIG)
  const ckm = readJson<{ fingerprint: string; nodes: Array<{ id: string }> }>(CKM_PATH)
  const namedItems = readJson<{ items: NamedItem[] }>('research/aqa-business-7132/2027/NAMED_ITEMS.json').items
  const coverage = readJson<{ covered: CoverageEntry[] }>('research/aqa-business-7132/2027/ITEM_COVERAGE_REPORT.json').covered
  const previousBlueprints = new Map<string, Blueprint>([
    ...config.batches.map((batch) => [batch.id, readJson<Blueprint>(blueprintPath(batch.id))] as const),
    [config.top_up.id, readJson<Blueprint>(blueprintPath(config.top_up.id))] as const,
  ])
  const result = buildBatchBlueprints({ config, ckm, namedItems, coverage, mapping, courseId: config.course_id, examYear: 2027, builtBlueprint: readJson<Blueprint>('content-factory/slices/aqa-7132-3.5/BLUEPRINT.json'), previousBlueprints })
  return { config, ckm, namedItems, coverage, previousBlueprints, ...result }
}

describe('AQA 7132 course batch blueprints (software only)', () => {
  const built = build()

  it('gives every course node to exactly one batch (the 3.5 nodes were built first)', () => {
    const allNodeIds = built.ckm.nodes.map((node) => node.id)
    expect([...built.owner.keys()].sort()).toEqual([...allNodeIds].sort())
    const inBatches = [...built.blueprints.values()].flatMap((blueprint) => blueprint.nodes.map((node) => node.nodeId))
    expect(new Set(inBatches).size).toBe(inBatches.length)
    const builtNodes = [...built.owner.entries()].filter(([, batch]) => batch === built.config.already_built.id).map(([id]) => id)
    expect(builtNodes.length).toBe(12)
    expect(inBatches.length + builtNodes.length).toBe(allNodeIds.length)
  })

  it('assigns every named item outside 3.5 to exactly one owner node, or lists it as uncovered', () => {
    const outside = built.namedItems.filter((item) => !item.section.startsWith('3.5.'))
    const assigned = [...built.blueprints.values()].flatMap((blueprint) => blueprint.items.map((item) => item.id))
    expect(new Set(assigned).size).toBe(assigned.length)
    expect(assigned.length + built.uncovered.length).toBe(outside.length)
  })

  it('preserves a committed item owner while it remains a valid current teaching candidate', () => {
    const candidatesByItem = new Map(built.coverage.map((entry) => [entry.id, (entry.taught_by ?? []).map((candidate) => candidate.node.toLowerCase())]))
    for (const previous of built.previousBlueprints.values()) {
      for (const item of previous.items) {
        if (built.config.already_built.sections.some((prefix) => item.section.startsWith(`${prefix}.`))) continue
        const owner = item.taughtBy[0]
        if (!owner || !(candidatesByItem.get(item.id) ?? []).includes(owner)) continue
        const currentOwner = built.itemOwner.get(item.id) ?? built.uncovered.find((entry) => entry.id === item.id)?.builtNodes[0]
        expect(currentOwner, item.id).toBe(owner)
      }
    }
  })

  it('rebuilds the already-built nodes that teach items from other sections, in a top-up batch', () => {
    expect(built.topUp).not.toBeNull()
    const topUpItems = built.topUp!.items.map((item) => item.id)
    for (const entry of built.uncovered) expect(topUpItems, entry.id).toContain(entry.id)
    const builtNodes = [...built.owner.entries()].filter(([, batch]) => batch === built.config.already_built.id).map(([id]) => id)
    for (const node of built.topUp!.nodes) expect(builtNodes).toContain(node.nodeId)
    expect(new Set(topUpItems).size).toBe(topUpItems.length)
  })

  it('treats every assigned item, and lists the items whose owner node had to be given extra treatments', () => {
    for (const blueprint of built.blueprints.values()) {
      expect(blueprint.summary.treated, blueprint.slice.batchId).toBe(blueprint.summary.items)
      expect(blueprint.nodes.length, blueprint.slice.batchId).toBeGreaterThan(0)
    }
  })

  it('matches the committed blueprint files (run with CONTENT_FACTORY_WRITE_BATCH_BLUEPRINTS=1 to update them)', () => {
    for (const [id, blueprint] of built.blueprints) {
      const text = `${JSON.stringify(blueprint, null, 2)}\n`
      if (process.env.CONTENT_FACTORY_WRITE_BATCH_BLUEPRINTS === '1') {
        mkdirSync(dirname(blueprintPath(id)), { recursive: true })
        writeFileSync(blueprintPath(id), text)
      }
      expect(readFileSync(blueprintPath(id), 'utf8'), id).toBe(text)
    }
    const topUpText = `${JSON.stringify(built.topUp, null, 2)}\n`
    if (process.env.CONTENT_FACTORY_WRITE_BATCH_BLUEPRINTS === '1') {
      mkdirSync(dirname(blueprintPath(built.config.top_up.id)), { recursive: true })
      writeFileSync(blueprintPath(built.config.top_up.id), topUpText)
    }
    expect(readFileSync(blueprintPath(built.config.top_up.id), 'utf8')).toBe(topUpText)
    if (process.env.CONTENT_FACTORY_WRITE_BATCH_BLUEPRINTS === '1') {
      const text = `${JSON.stringify({ uncoveredItems: built.uncovered, unmappedCourseNodes: built.unmappedCourseNodes }, null, 2)}\n`
      writeFileSync('content-factory/slices/aqa-7132-batches-report.json', text)
    }
    expect(readFileSync('content-factory/slices/aqa-7132-batches-report.json', 'utf8')).toBe(`${JSON.stringify({ uncoveredItems: built.uncovered, unmappedCourseNodes: built.unmappedCourseNodes }, null, 2)}\n`)
  })
})
