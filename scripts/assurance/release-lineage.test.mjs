import { describe, expect, it } from 'vitest'
import {
  approvalMatches,
  findSuccessfulCiRun,
  latestReleaseStatus,
  releaseStatusContext,
  selectMergedPull,
} from './release-lineage.mjs'

describe('governed release lineage helpers', () => {
  it('selects the PR whose merge commit matches the deployed main SHA', () => {
    const pulls = [
      { number: 10, merged_at: '2026-08-19T10:00:00Z', merge_commit_sha: 'other', head: { sha: 'head-a' } },
      { number: 11, merged_at: '2026-08-19T11:00:00Z', merge_commit_sha: 'merge-b', head: { sha: 'head-b' } },
    ]
    expect(selectMergedPull(pulls, 'merge-b')?.number).toBe(11)
  })

  it('matches Founder approval only for the exact head', () => {
    const comment = {
      user: { login: 'lhanson-dev' },
      body: `revision-founder-approval:v1\nhead_sha: ${'a'.repeat(40)}`,
    }
    expect(approvalMatches(comment, 'lhanson-dev', 'a'.repeat(40))).toBe(true)
    expect(approvalMatches(comment, 'lhanson-dev', 'b'.repeat(40))).toBe(false)
    expect(approvalMatches(comment, 'someone-else', 'a'.repeat(40))).toBe(false)
  })

  it('requires a completed successful CI run for the exact proposed head', () => {
    const runs = [
      { id: 1, head_sha: 'head-a', status: 'completed', conclusion: 'failure' },
      { id: 2, head_sha: 'head-b', status: 'completed', conclusion: 'success' },
    ]
    expect(findSuccessfulCiRun(runs, 'head-b')?.id).toBe(2)
    expect(findSuccessfulCiRun(runs, 'head-a')).toBeNull()
  })

  it('uses the latest path-to-live status for prior-release chaining', () => {
    const statuses = [
      { context: releaseStatusContext, state: 'failure', updated_at: '2026-08-19T10:00:00Z' },
      { context: 'another/check', state: 'success', updated_at: '2026-08-19T12:00:00Z' },
      { context: releaseStatusContext, state: 'success', updated_at: '2026-08-19T11:00:00Z' },
    ]
    expect(latestReleaseStatus(statuses)?.state).toBe('success')
  })
})
