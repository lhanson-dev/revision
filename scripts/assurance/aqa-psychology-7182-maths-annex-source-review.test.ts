import { describe, expect, it } from 'vitest'
import annex from './data/aqa-psychology-7182-maths-annex-source-review.json'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import paper2 from '../../content/psychology/aqa-a-level/paper-2'
import paper3 from '../../content/psychology/aqa-a-level/paper-3'
import { bankQuestionId, bankRecordToPractice } from '../../src/app/practice-questions'

const packs = [paper1, paper2, paper3] as const

describe('Issue #698 — source-first AQA 7182 v1.4 mathematical annex §7.2 audit', () => {
  it('pins the actual Founder-supplied specification rather than an external or AS variant', () => {
    expect(annex.qualification).toMatchObject({
      board: 'AQA', level: 'A-level', code: '7182', specVersion: '1.4, 1 September 2025',
      pdfSha256: 'db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d',
      pageCount: 38, rights: 'REFERENCE_ONLY',
    })
    expect(annex.scope.section).toBe('7.2')
    expect(annex.scope.printedPages).toEqual([35, 36, 37])
    expect(annex.scope.mathsAssessmentMinimum).toContain('At least 10%')
    expect(annex.scope.denominatorCoverage).toContain('not all')
  })

  it('enumerates separately observable annex capabilities without claiming complete teaching or assessment', () => {
    const atoms = annex.atoms
    expect(atoms).toHaveLength(32)
    expect(new Set(atoms.map(x => x.id)).size).toBe(atoms.length)
    expect(atoms.map(x => x.id)).toEqual(
      Array.from({ length: 32 }, (_, i) => `PSY-MATH-72-${String(i + 1).padStart(2, '0')}`),
    )
    expect(atoms.filter(x => x.source.tableGroup === 'arithmetic')).toHaveLength(5)
    expect(atoms.filter(x => x.source.tableGroup === 'data')).toHaveLength(22)
    expect(atoms.filter(x => x.source.tableGroup === 'algebra')).toHaveLength(3)
    expect(atoms.filter(x => x.source.tableGroup === 'graphs')).toHaveLength(2)
    expect(atoms.every(x => x.source.section === '7.2' && [35, 36, 37].includes(x.source.printedPage))).toBe(true)
    expect(new Set(atoms.map(x => x.skill)).size).toBe(32)
    for (const atom of atoms) {
      expect(atom.capability.trim().length, atom.id).toBeGreaterThan(20)
      expect(atom.independentEvidenceRequired.trim().length, atom.id).toBeGreaterThan(4)
      expect(atom.teachingAdequacy, atom.id).toBe('unverified')
      expect(atom.practiceAdequacy, atom.id).toBe('unverified')
      expect(atom.examPrepAdequacy, atom.id).toBe('unverified')
      expect(atom.sourceToLiveAccepted, atom.id).toBe(false)
    }
    expect(Object.values(annex.acceptance).every(value => value === false)).toBe(true)
  })

  it('resolves every cited candidate to the right asset family in every published Psychology paper pack', () => {
    let count = 0
    for (const pack of packs) {
      const mcq = new Set(pack.questions.map(q => q.id))
      const drills = new Set((pack.dataDrills ?? []).map(d => d.id))
      const bank = new Map((pack.practiceBank ?? []).map(record => [bankQuestionId(record), record]))
      for (const atom of annex.atoms) {
        for (const candidate of atom.publishedCandidateAssets) {
          count++
          if (candidate.kind === 'scored-mcq-recognition') {
            expect(mcq.has(candidate.id), atom.id + ':' + candidate.id).toBe(true)
          } else if (candidate.kind === 'unscored-drill') {
            expect(drills.has(candidate.id), atom.id + ':' + candidate.id).toBe(true)
            expect(bank.has(candidate.id), 'A self-marked drill cannot masquerade as scored evidence').toBe(false)
          } else if (candidate.kind === 'scored-single-number') {
            const record = bank.get(candidate.id)
            expect(record, atom.id + ':' + candidate.id).toBeDefined()
            const task = bankRecordToPractice(record!, 'research-methods')
            expect(task?.type, atom.id + ':' + candidate.id).toBe('calculation')
            if (task?.type === 'calculation') {
              expect(task.marks).toBe(1)
              expect(Number.isFinite(task.expected)).toBe(true)
            }
          } else {
            throw new Error('Unrecognised candidate evidence mode')
          }
        }
      }
    }
    expect(count).toBeGreaterThan(20)
  })

  it('does not mistake recognitions or pre-supplied significance thresholds for constructed or independently retrieved results', () => {
    const map = new Map(annex.atoms.map(a => [a.skill, a]))
    expect(map.get('construct-histogram')?.publishedCandidateAssets.map(x => x.kind)).toEqual(['unscored-drill'])
    expect(map.get('interpret-histogram')?.publishedCandidateAssets.map(x => x.kind)).toEqual(['scored-mcq-recognition'])
    expect(map.get('calculate-standard-deviation')?.publishedCandidateAssets).toHaveLength(4)
    expect(map.get('use-statistical-test')?.publishedCandidateAssets.filter(x => x.kind === 'scored-single-number')).toHaveLength(2)
    expect(map.get('statistical-table-significance')?.publishedCandidateAssets).toEqual([])
    expect(map.get('plot-two-variables')?.publishedCandidateAssets).toEqual([])
    expect(map.get('substitute-into-equations')?.publishedCandidateAssets).toEqual([])
    expect(annex.scope.textRights).toContain('illustrative')
  })
})
