import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_OUTPUT_DIR = '.artifacts/psychology-step6-independent-assurance'
const MATERIAL_DIMENSION_STATUSES = new Set(['blocking_issue', 'material_issue'])
const MATERIAL_FINDING_SEVERITIES = new Set(['blocking', 'material'])

type ReviewDimension = {
  dimension?: string
  status?: string
  summary?: string
}

type ReviewFinding = {
  id?: string
  severity?: string
  affectedContentIds?: string[]
}

type Review = {
  packetId?: string
  decision?: string
  dimensions?: ReviewDimension[]
  findings?: ReviewFinding[]
}

type Receipt = Record<string, unknown> & {
  completionStatus?: string
  finalDecision?: string
  failureReason?: string | null
  packetCounts?: { required?: number; completed?: number }
}

export async function guardPsychologyStep6Receipt(outputDir = DEFAULT_OUTPUT_DIR): Promise<Receipt> {
  const receiptPath = join(outputDir, 'final-receipt.json')
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8')) as Receipt
  const filenames = (await readdir(outputDir)).filter((name) => name.endsWith('.review.json')).sort()
  const reviews = await Promise.all(filenames.map(async (name) => JSON.parse(await readFile(join(outputDir, name), 'utf8')) as Review))

  const failHoldPacketIds = reviews.filter((review) => review.decision === 'fail_hold').map((review) => review.packetId ?? 'unknown')
  const materialDimensions = reviews.flatMap((review) => (review.dimensions ?? [])
    .filter((dimension) => MATERIAL_DIMENSION_STATUSES.has(dimension.status ?? ''))
    .map((dimension) => ({
      packetId: review.packetId ?? 'unknown',
      dimension: dimension.dimension ?? 'unknown',
      status: dimension.status ?? 'unknown',
      summary: dimension.summary ?? '',
    })))
  const materialFindings = reviews.flatMap((review) => (review.findings ?? [])
    .filter((finding) => MATERIAL_FINDING_SEVERITIES.has(finding.severity ?? ''))
    .map((finding) => ({
      packetId: review.packetId ?? 'unknown',
      findingId: finding.id ?? 'unknown',
      severity: finding.severity ?? 'unknown',
      affectedContentIds: finding.affectedContentIds ?? [],
    })))

  const requiredPackets = Number(receipt.packetCounts?.required ?? 0)
  const completedPackets = Number(receipt.packetCounts?.completed ?? reviews.length)
  const allPacketsPresent = requiredPackets > 0 && completedPackets === requiredPackets && reviews.length === requiredPackets
  const shouldFailHold = !allPacketsPresent || failHoldPacketIds.length > 0 || materialDimensions.length > 0 || materialFindings.length > 0

  const guardedReceipt: Receipt = {
    ...receipt,
    finalDecision: shouldFailHold ? 'fail_hold' : receipt.finalDecision,
    failureReason: shouldFailHold
      ? receipt.failureReason ?? `receipt_guard: incomplete packets or unresolved blocking/material review state`
      : receipt.failureReason ?? null,
    receiptGuard: {
      checkedReviewFiles: reviews.length,
      requiredPackets,
      completedPackets,
      allPacketsPresent,
      failHoldPacketIds,
      materialDimensions,
      materialFindings,
      decision: shouldFailHold ? 'fail_hold' : 'pass',
    },
  }

  await writeFile(receiptPath, `${JSON.stringify(guardedReceipt, null, 2)}\n`)

  if (shouldFailHold || guardedReceipt.finalDecision !== 'pass' || guardedReceipt.completionStatus !== 'complete') {
    throw new Error('Psychology Step 6 receipt guard rejected the live assurance result')
  }
  return guardedReceipt
}

if (import.meta.url === `file://${process.argv[1]}`) {
  guardPsychologyStep6Receipt(process.env.PSYCHOLOGY_STEP6_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
