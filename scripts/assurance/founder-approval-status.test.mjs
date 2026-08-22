import { describe, expect, it } from 'vitest'
import { evaluateFounderApprovalStatus } from './founder-approval-status.mjs'

const headSha = 'a'.repeat(40)

function pr() {
  return { head: { sha: headSha } }
}

function ci(overrides = {}) {
  return {
    id: 652,
    run_number: 652,
    head_sha: headSha,
    status: 'completed',
    conclusion: 'success',
    updated_at: '2026-08-22T08:10:00Z',
    ...overrides,
  }
}

function approval(overrides = {}) {
  return {
    id: 111,
    created_at: '2026-08-22T08:11:00Z',
    user: { login: 'lhanson-dev' },
    body: `revision-founder-approval:v1\nhead_sha: ${headSha}`,
    ...overrides,
  }
}

describe('Founder approval status gate', () => {
  it('passes only when exact-head CI succeeded and the exact marker followed it', () => {
    const result = evaluateFounderApprovalStatus({
      pr: pr(),
      runs: [ci()],
      comments: [approval()],
      founderLogin: 'lhanson-dev',
    })

    expect(result).toMatchObject({
      state: 'success',
      headSha,
      ciRunId: 652,
      approvalCommentId: 111,
    })
  })

  it('stays pending while the exact marker is missing', () => {
    const result = evaluateFounderApprovalStatus({
      pr: pr(),
      runs: [ci()],
      comments: [],
      founderLogin: 'lhanson-dev',
    })

    expect(result.state).toBe('pending')
    expect(result.description).toContain('machine-readable Founder approval')
  })

  it('does not accept prose approval as the machine-readable marker', () => {
    const result = evaluateFounderApprovalStatus({
      pr: pr(),
      runs: [ci()],
      comments: [{
        ...approval(),
        body: `Founder approval recorded for exact head ${headSha}`,
      }],
      founderLogin: 'lhanson-dev',
    })

    expect(result.state).toBe('pending')
  })

  it('requires approval evidence to follow the latest exact-head CI', () => {
    const result = evaluateFounderApprovalStatus({
      pr: pr(),
      runs: [ci()],
      comments: [approval({ created_at: '2026-08-22T08:09:00Z' })],
      founderLogin: 'lhanson-dev',
    })

    expect(result.state).toBe('pending')
    expect(result.description).toContain('follow the latest exact-head CI')
  })

  it('fails when the latest exact-head CI completed unsuccessfully', () => {
    const result = evaluateFounderApprovalStatus({
      pr: pr(),
      runs: [
        ci({ id: 651, run_number: 651, conclusion: 'success', updated_at: '2026-08-22T08:00:00Z' }),
        ci({ id: 652, run_number: 652, conclusion: 'failure' }),
      ],
      comments: [approval()],
      founderLogin: 'lhanson-dev',
    })

    expect(result.state).toBe('failure')
  })

  it('resets to pending when a new head has no exact-head CI yet', () => {
    const newHead = 'b'.repeat(40)
    const result = evaluateFounderApprovalStatus({
      pr: { head: { sha: newHead } },
      runs: [ci()],
      comments: [approval()],
      founderLogin: 'lhanson-dev',
    })

    expect(result.state).toBe('pending')
    expect(result.headSha).toBe(newHead)
  })
})
