import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import {
  buildSliceUnit,
  expectationsFromBlueprint,
  nodeOutputSchema,
  type Blueprint,
  type SliceTeaching,
} from './aqa-business-7132-slice-learn-practice'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import type { Ledger } from '../../src/content-factory/fast-path-review'

describe('AQA 7132 Learn + Practice targeted refresh scope', () => {
  it('proves every affected-batch node is reusable after the targeted refresh is committed', async () => {
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    const teachingFor = (nodeId: string): SliceTeaching => {
      const subjectId = nodeId.toUpperCase()
      const node = candidate.nodes.get(subjectId)
      if (!node) throw new Error(`foundation_node_missing:${subjectId}`)
      return {
        subject_id: subjectId,
        title: node.title ?? null,
        teaching_content: node.teaching_content ?? {},
        quantitative_content: node.quantitative_content ?? {},
        source_ids: rows.get(subjectId)?.subject_truth_sources ?? [],
      }
    }

    const cases = [
      {
        batch: '3.8-3.9',
        reusable: ['bus-fnd-002', 'bus-fnd-007', 'bus-fnd-008', 'bus-str-004', 'bus-str-007'],
      },
      {
        batch: '3.10',
        reusable: ['bus-evi-008', 'bus-ext-007', 'bus-mkt-001', 'bus-mod-005', 'bus-str-009'],
      },
    ] as const

    for (const testCase of cases) {
      const blueprint = JSON.parse(await readFile(`content-factory/slices/aqa-7132-${testCase.batch}/BLUEPRINT.json`, 'utf8')) as Blueprint
      const ledger = JSON.parse(await readFile(`content-factory/runs/aqa-7132-slice-${testCase.batch}/ledger.json`, 'utf8')) as Ledger
      const reusable: string[] = []
      const stale: string[] = []

      for (const expectation of expectationsFromBlueprint(blueprint)) {
        const output = nodeOutputSchema.parse(JSON.parse(await readFile(`content-factory/slices/aqa-7132-${testCase.batch}/learn-practice/${expectation.nodeId}.json`, 'utf8')))
        const unit = buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching: teachingFor(expectation.nodeId), output })!
        const previous = ledger.units[expectation.nodeId]
        const exactMatch = Boolean(previous && ['passed', 'logged'].includes(previous.outcome) && previous.fingerprint === unit.fingerprint && unit.softwareFindings.length === 0)
        ;(exactMatch ? reusable : stale).push(expectation.nodeId)
      }

      expect(reusable.sort(), `${testCase.batch} reusable`).toEqual([...testCase.reusable].sort())
      expect(stale, `${testCase.batch} stale`).toEqual([])
    }
  })
})
