import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export function validateFoundationInternalLearningPriorReviewerContexts(input) {
  const contextIds = input?.remediationRecord?.priorReviewerContextIds
  if (!Array.isArray(contextIds) || contextIds.length === 0) {
    throw new Error('priorReviewerContextIds must be a non-empty array')
  }
  if (contextIds.some((contextId) => typeof contextId !== 'string' || contextId.trim().length === 0)) {
    throw new Error('priorReviewerContextIds must contain only non-empty strings')
  }
  if (new Set(contextIds).size !== contextIds.length) {
    throw new Error('priorReviewerContextIds must be unique')
  }
  return contextIds
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const proofPath = process.argv[2]
    if (!proofPath) throw new Error('remediation proof path is required')
    const proof = JSON.parse(readFileSync(proofPath, 'utf8'))
    const contextIds = validateFoundationInternalLearningPriorReviewerContexts(proof)
    console.log(JSON.stringify({ priorReviewerContextCount: contextIds.length }))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
