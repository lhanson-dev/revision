import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, test } from 'vitest'

import { guardPsychologyStep6Receipt } from './psychology-step6-receipt-guard'

async function makeOutputDir(review: Record<string, unknown>, receiptOverrides: Record<string, unknown> = {}): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'psychology-step6-guard-'))
  await writeFile(join(dir, 'EDU-01.review.json'), `${JSON.stringify(review, null, 2)}\n`)
  await writeFile(join(dir, 'final-receipt.json'), `${JSON.stringify({
    completionStatus: 'complete',
    finalDecision: 'pass',
    failureReason: null,
    packetCounts: { required: 1, completed: 1 },
    ...receiptOverrides,
  }, null, 2)}\n`)
  return dir
}

describe('Psychology Step 6 receipt guard', () => {
  test('accepts a complete pass with no blocking or material state', async () => {
    const dir = await makeOutputDir({
      packetId: 'EDU-01',
      decision: 'pass',
      dimensions: [{ dimension: 'factual_accuracy', status: 'pass', summary: 'No issue.' }],
      findings: [],
    })

    const receipt = await guardPsychologyStep6Receipt(dir)
    expect(receipt.finalDecision).toBe('pass')
    expect((receipt.receiptGuard as { decision: string }).decision).toBe('pass')
  })

  test('fails closed when a material dimension exists without a duplicate finding', async () => {
    const dir = await makeOutputDir({
      packetId: 'EDU-01',
      decision: 'fail_hold',
      dimensions: [{ dimension: 'pedagogical_accuracy', status: 'material_issue', summary: 'Material distortion.' }],
      findings: [],
    })

    await expect(guardPsychologyStep6Receipt(dir)).rejects.toThrow(/rejected/)
    const rewritten = JSON.parse(await readFile(join(dir, 'final-receipt.json'), 'utf8')) as {
      finalDecision: string
      receiptGuard: { materialDimensions: unknown[]; decision: string }
    }
    expect(rewritten.finalDecision).toBe('fail_hold')
    expect(rewritten.receiptGuard.materialDimensions).toHaveLength(1)
    expect(rewritten.receiptGuard.decision).toBe('fail_hold')
  })

  test('fails closed when packet coverage is incomplete', async () => {
    const dir = await makeOutputDir({
      packetId: 'EDU-01',
      decision: 'pass',
      dimensions: [{ dimension: 'factual_accuracy', status: 'pass', summary: 'No issue.' }],
      findings: [],
    }, { packetCounts: { required: 2, completed: 1 } })

    await expect(guardPsychologyStep6Receipt(dir)).rejects.toThrow(/rejected/)
  })
})
