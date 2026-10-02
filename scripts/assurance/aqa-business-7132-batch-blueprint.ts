// AQA 7132 course batches (step 6 of the plan): derive the Learning Blueprint for every batch by software, no AI and no spend.
// Each course node is owned by exactly one batch, and each named item is taught by exactly one owner node, so nothing is written twice.
import {
  deriveFoundationCourseLearningDesign,
  type FoundationCourseLearningNodeDesign,
} from '../../src/content-factory/foundation-course-learning-blueprint'
import type { Blueprint, BlueprintItem } from './aqa-business-7132-slice-learn-practice'

export type BatchConfig = {
  already_built: { id: string; sections: string[] }
  top_up: { id: string; extra_nodes?: string[] }
  batches: Array<{ id: string; sections: string[] }>
}
export type NamedItem = { id: string; section: string; label: string; kind: 'concept' | 'formula' | 'model' | 'skill'; aqa_convention?: string; convention_status?: string }
export type CoverageEntry = { id: string; taught_by?: Array<{ node: string }> }
export type Mapping = { requirements: Array<{ source_section: string; mapped_subject_node_ids: string[] }> }
export type CkmNode = { id: string }

const has = (list: readonly string[], ...values: string[]) => values.some((value) => list.includes(value))

// What each kind of item needs; when the node-level derivation cannot see it, the batch blueprint adds it (and records why).
const KIND_NEEDS = {
  formula: {
    met: (c: string[], t: string[], p: string[]) => has(c, 'formula_quantitative') && has(p, 'calculation') && has(t, 'worked_example'),
    add: { learnTreatments: ['worked_example', 'guided_example'], practiceCapabilities: ['calculation', 'interpretation'], reason: 'formula: needs a worked example and a calculation task' },
  },
  model: {
    met: (c: string[], t: string[], p: string[]) => has(c, 'model_framework') || has(t, 'purposeful_visual') || has(p, 'construction', 'framework_application'),
    add: { learnTreatments: ['purposeful_visual', 'worked_example'], practiceCapabilities: ['construction', 'framework_application'], reason: 'model: needs a visual or framework treatment and a construction or application task' },
  },
  skill: {
    met: (c: string[], _t: string[], p: string[]) => has(c, 'procedure_skill', 'analysis_reasoning', 'evaluation_judgement', 'application_context') && has(p, 'procedure_execution', 'reasoning_chain', 'contextual_judgement', 'contextual_application'),
    add: { learnTreatments: ['worked_example', 'guided_example'], practiceCapabilities: ['procedure_execution', 'reasoning_chain'], reason: 'skill: needs a procedure or reasoning treatment and a matching task' },
  },
  concept: { met: () => true, add: { learnTreatments: [] as string[], practiceCapabilities: [] as string[], reason: '' } },
} as const

const unique = <T extends string>(values: T[]) => [...new Set(values)].sort() as T[]

export type BatchBlueprint = Blueprint & {
  schemaVersion: 1
  slice: { courseId: string; examYear: number; batchId: string; sections: string[] }
  summary: {
    nodes: number
    items: number
    treated: number
    itemsNeedingAdditions: Array<{ id: string; reason: string }>
    nodesWithoutItems: string[]
  }
}

export function buildBatchBlueprints(input: {
  config: BatchConfig
  ckm: { fingerprint: string; nodes: CkmNode[] }
  namedItems: NamedItem[]
  coverage: CoverageEntry[]
  mapping: Mapping
  courseId: string
  examYear: number
  // The blueprint already built for the first slice (3.5): its nodes are rebuilt in the top-up batch if they teach items from other sections.
  builtBlueprint: Blueprint
  // Preserve an existing committed item owner when it remains a valid current teaching candidate.
  // This prevents additive teaching improvements from reshuffling downstream question identities.
  previousBlueprints?: Map<string, Blueprint>
}) {
  const ckmIds = new Set(input.ckm.nodes.map((node) => node.id))
  const mappedBy = (prefixes: string[]) => unique(input.mapping.requirements
    .filter((r) => prefixes.some((prefix) => r.source_section === prefix || r.source_section.startsWith(`${prefix}.`)))
    .flatMap((r) => r.mapped_subject_node_ids.map((id) => id.toLowerCase()))
    .filter((id) => ckmIds.has(id)))

  // Node ownership: already-built first, then batches in order, leftovers to the last batch.
  const owner = new Map<string, string>()
  for (const id of mappedBy(input.config.already_built.sections)) owner.set(id, input.config.already_built.id)
  for (const batch of input.config.batches) for (const id of mappedBy(batch.sections)) if (!owner.has(id)) owner.set(id, batch.id)
  const lastBatch = input.config.batches[input.config.batches.length - 1].id
  const unmappedCourseNodes = [...ckmIds].filter((id) => !owner.has(id)).sort()
  for (const id of unmappedCourseNodes) owner.set(id, lastBatch)

  // Item ownership: the first node that teaches the item and is not already built.
  const builtId = input.config.already_built.id
  const builtSections = input.config.already_built.sections
  const taughtBy = new Map(input.coverage.map((entry) => [entry.id, (entry.taught_by ?? []).map((t) => t.node.toLowerCase()).filter((id) => ckmIds.has(id))]))
  const previousOwner = new Map<string, string>()
  for (const blueprint of input.previousBlueprints?.values() ?? []) {
    for (const item of blueprint.items) {
      const nodeId = item.taughtBy[0]
      if (nodeId) previousOwner.set(item.id, nodeId)
    }
  }
  const itemOwner = new Map<string, string>()
  const uncovered: Array<{ id: string; builtNodes: string[] }> = []
  for (const item of input.namedItems) {
    if (builtSections.some((prefix) => item.section.startsWith(`${prefix}.`))) continue
    const candidates = taughtBy.get(item.id) ?? []
    const previous = previousOwner.get(item.id)
    const stablePrevious = previous && candidates.includes(previous) ? previous : undefined
    const fresh = stablePrevious && owner.get(stablePrevious) !== builtId ? stablePrevious : candidates.find((id) => owner.get(id) !== builtId)
    if (fresh) itemOwner.set(item.id, fresh)
    else {
      const builtNodes = stablePrevious ? [stablePrevious, ...candidates.filter((id) => id !== stablePrevious)] : candidates
      uncovered.push({ id: item.id, builtNodes })
    }
  }

  const assemble = (batchId: string, sections: string[], nodeIds: string[], items: BlueprintItem[]): BatchBlueprint => {
    const nodes = input.ckm.nodes.filter((node) => nodeIds.includes(node.id))
    const design = deriveFoundationCourseLearningDesign(nodes)
    // Fold what each item needs into its owner node, so the run enforces it.
    const nodeDesigns = new Map<string, { nodeId: string; classifications: string[]; learnTreatments: string[]; practiceCapabilities: string[] }>(design.nodes.map((n: FoundationCourseLearningNodeDesign) => [n.nodeId, { nodeId: n.nodeId, classifications: [...n.classifications], learnTreatments: [...n.learnTreatments], practiceCapabilities: [...n.practiceCapabilities] }]))
    const needing: Array<{ id: string; reason: string }> = []
    for (const item of items) {
      const node = nodeDesigns.get(item.taughtBy[0])!
      const need = KIND_NEEDS[item.kind as keyof typeof KIND_NEEDS]
      if (!need.met(node.classifications, node.learnTreatments, node.practiceCapabilities)) {
        node.learnTreatments = unique([...node.learnTreatments, ...need.add.learnTreatments])
        node.practiceCapabilities = unique([...node.practiceCapabilities, ...need.add.practiceCapabilities])
        needing.push({ id: item.id, reason: need.add.reason })
      }
    }
    const sortedNodes = [...nodeDesigns.values()].sort((a, b) => a.nodeId.localeCompare(b.nodeId))
    return {
      schemaVersion: 1,
      slice: { courseId: input.courseId, examYear: input.examYear, batchId, sections },
      courseKnowledgeModelFingerprint: input.ckm.fingerprint,
      nodes: sortedNodes.map((node) => ({ ...node, learnTreatments: unique(node.learnTreatments), practiceCapabilities: unique(node.practiceCapabilities) })),
      items,
      summary: {
        nodes: sortedNodes.length,
        items: items.length,
        treated: items.length,
        itemsNeedingAdditions: needing,
        nodesWithoutItems: sortedNodes.filter((node) => !items.some((item) => item.taughtBy[0] === node.nodeId)).map((node) => node.nodeId),
      },
    }
  }
  const itemFor = (item: NamedItem, nodeId: string): BlueprintItem => ({ id: item.id, section: item.section, label: item.label, kind: item.kind, ...(item.aqa_convention ? { aqaConvention: item.aqa_convention, conventionStatus: item.convention_status } : {}), taughtBy: [nodeId] })

  const blueprints = new Map<string, BatchBlueprint>()
  for (const batch of input.config.batches) {
    const nodeIds = [...owner.entries()].filter(([, batchId]) => batchId === batch.id).map(([id]) => id).sort()
    const items = input.namedItems.filter((item) => nodeIds.includes(itemOwner.get(item.id) ?? '')).map((item) => itemFor(item, itemOwner.get(item.id)!))
    blueprints.set(batch.id, assemble(batch.id, batch.sections, nodeIds, items))
  }

  // Top-up: already-built nodes that also teach items from other sections are rebuilt with their original items plus the extra ones.
  const itemById = new Map(input.namedItems.map((item) => [item.id, item]))
  const topUpNodeOf = new Map(uncovered.map((entry) => [entry.id, entry.builtNodes[0]]))
  const topUpNodeIds = unique([...topUpNodeOf.values(), ...(input.config.top_up.extra_nodes ?? [])])
  const topUpItems: BlueprintItem[] = [
    ...input.builtBlueprint.items.filter((item) => topUpNodeIds.includes(item.taughtBy[0])),
    ...uncovered.map((entry) => itemFor(itemById.get(entry.id)!, topUpNodeOf.get(entry.id)!)),
  ]
  const topUp = topUpNodeIds.length ? assemble(input.config.top_up.id, ['3.5 nodes with items from other sections'], topUpNodeIds, topUpItems) : null

  return { blueprints, topUp, owner, uncovered, unmappedCourseNodes, itemOwner }
}
