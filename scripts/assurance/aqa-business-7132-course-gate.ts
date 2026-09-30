// AQA 7132 exact-course gate (T8) under the fast-path rules (ADR-0029).
// One review unit per specification section. Software checks run first; the AI reviewer only answers
// the fixed checklist for sections software has not already blocked.
import { createHash } from 'node:crypto'
import type { Checklist, ClassifiedFinding } from '../../src/content-factory/fast-path-review'

export const COURSE_GATE_CHECKLIST: Checklist = {
  stage: 'aqa-7132-course-gate',
  version: 'course-gate-v1',
  checks: [
    {
      id: 'mapping_sense',
      question: 'For each named item listed for this section, does a mapped node actually teach it, rather than only sharing a topic with it?',
    },
    {
      id: 'depth',
      question: 'Is the teaching for this section at A-level depth: not too shallow for the named items, and not beyond what the course requires?',
    },
    {
      id: 'accuracy',
      question: 'For nodes marked changed_since_last_assurance only: is each definition, fact, formula and causal claim correct? Cite a supplied source id that confirms or contradicts it.',
      requiresContradictingSource: true,
    },
  ],
}

type Json = Record<string, unknown>
export type BundleNode = { subject_id: string; prerequisites?: string[]; promotion_truth_source_ids?: string[] } & Json
export type BundleRequirement = { requirement_id: string; source_section: string; title: string; rights_safe_requirement_summary: string; mapped_subject_node_ids: string[] } & Json
export type CourseGateBundle = {
  exact_course_foundation_identity: { subject_foundation_fingerprint: string; selected_subject_node_ids: string[] } & Json
  course_truth: { requirements: BundleRequirement[] } & Json
  selected_subject_foundation_nodes: BundleNode[]
  subject_truth_sources: Array<{ id: string; title?: string; url?: string } & Json>
}
export type CoverageGap = { id: string; section: string; label: string; kind: string; status: string; fix: string }
export type CoverageReport = {
  foundation_fingerprint: string
  gaps: CoverageGap[]
  covered: Array<{ id: string; section: string; label: string; kind: string }>
}

export type CourseGateUnit = {
  unit_id: string
  fingerprint: string
  softwareFindings: ClassifiedFinding[]
  payload: Json
  sourceIds: Set<string>
}

const sha256 = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

// Software: nothing may depend on an outdated upstream version.
export function dependencyFreshness(bundle: CourseGateBundle, coverage: CoverageReport) {
  const bundleFingerprint = bundle.exact_course_foundation_identity.subject_foundation_fingerprint
  return bundleFingerprint === coverage.foundation_fingerprint
    ? { ok: true as const }
    : { ok: false as const, error: `T8 package uses Foundation ${bundleFingerprint} but item coverage was checked against ${coverage.foundation_fingerprint}; rebuild the T8 package on the current Foundation` }
}

function softwareFinding(checkId: string, affected: string[], finding: string, fix: string): ClassifiedFinding {
  return { check_id: checkId, category: 'missing_examinable_item', affected_ids: affected, finding, evidence: 'software check', contradicting_source_id: null, proposed_fix: fix, disposition: 'blocking', reason: `software check ${checkId} failed` }
}

export function buildCourseGateUnits(bundle: CourseGateBundle, coverage: CoverageReport, changedNodeIds: ReadonlySet<string>): CourseGateUnit[] {
  const nodes = new Map(bundle.selected_subject_foundation_nodes.map((node) => [node.subject_id, node]))
  const selected = new Set(bundle.exact_course_foundation_identity.selected_subject_node_ids)
  const sources = new Map(bundle.subject_truth_sources.map((source) => [source.id, source]))

  return bundle.course_truth.requirements.map((requirement) => {
    const section = requirement.source_section
    const software: ClassifiedFinding[] = []

    // Software: item-level coverage (NAMED_ITEMS.json via check-aqa-business-7132-item-coverage.mjs).
    for (const gap of coverage.gaps.filter((item) => item.section === section)) {
      software.push(softwareFinding('item_level_coverage', [gap.id], `${gap.label} (${gap.kind}): ${gap.status.replace(/_/g, ' ')}`, gap.fix))
    }
    // Software: every mapped node exists and its prerequisites are in the course.
    for (const nodeId of requirement.mapped_subject_node_ids) {
      const node = nodes.get(nodeId)
      if (!node) { software.push(softwareFinding('prerequisite_closure', [nodeId], `${nodeId} is mapped but not in the selected course nodes`, 'add the node to the exact-course selection')); continue }
      const missing = (node.prerequisites ?? []).filter((id) => !selected.has(id))
      if (missing.length) software.push(softwareFinding('prerequisite_closure', [nodeId, ...missing], `${nodeId} needs ${missing.join(', ')}, which the course does not include`, 'add the prerequisite node(s) to the exact-course selection'))
    }

    const mappedNodes = requirement.mapped_subject_node_ids.map((id) => nodes.get(id)).filter((node): node is BundleNode => Boolean(node))
    const nodeSources = [...new Set(mappedNodes.flatMap((node) => node.promotion_truth_source_ids ?? []))]
      .map((id) => sources.get(id)).filter((source): source is NonNullable<typeof source> => Boolean(source))
      .map((source) => ({ id: source.id, title: source.title ?? '', url: source.url ?? '' }))
    const payload = {
      unit_id: section,
      requirement: { section, title: requirement.title, summary: requirement.rights_safe_requirement_summary, required_course_facets: requirement.required_course_facets ?? [], required_quantitative_methods: requirement.required_quantitative_methods ?? [] },
      named_items: coverage.covered.filter((item) => item.section === section).map(({ id, label, kind }) => ({ id, label, kind })),
      mapped_nodes: mappedNodes.map((node) => ({ ...node, changed_since_last_assurance: changedNodeIds.has(node.subject_id) })),
      sources: nodeSources,
    }
    return {
      unit_id: section,
      fingerprint: sha256({ checklist: COURSE_GATE_CHECKLIST.version, payload, software }),
      softwareFindings: software,
      payload,
      sourceIds: new Set(nodeSources.map((source) => source.id)),
    }
  })
}

export const COURSE_GATE_INSTRUCTIONS = [
  'You are a fresh reviewer for one section of the AQA A-level Business 7132 (2027) course map.',
  'You receive: the section summary (Revision wording, not AQA text), the named items the section requires, the Subject Foundation nodes mapped to it, and the sources those nodes cite.',
  'Use only the supplied material. Do not browse and do not add awarding-body facts from memory.',
  'Set unit_id to the supplied unit_id.',
].join('\n')
