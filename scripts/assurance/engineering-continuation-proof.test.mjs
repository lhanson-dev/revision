import { describe, expect, it } from 'vitest'
import { classifyContinuation, pilotLabel } from './engineering-continuation-proof.mjs'

const head = 'a'.repeat(40)
const main = 'b'.repeat(40)
const run = { id: 42, name: 'Revision CI', event: 'pull_request', status: 'completed', conclusion: 'success', head_sha: head, run_attempt: 1 }
const pr = {
  state: 'open', draft: true,
  head: { sha: head, repo: { full_name: 'lhanson-dev/revision' } },
  base: { sha: main, repo: { full_name: 'lhanson-dev/revision' } },
  labels: [{ name: pilotLabel }],
}
const evaluate = (overrides = {}) => classifyContinuation({
  run, pr, latestRun: run, jobs: [], mainSha: main, ...overrides,
})

describe('read-only event-driven engineering pilot', () => {
  it('includes draft PRs, without claiming merge readiness', () => {
    expect(evaluate()).toMatchObject({
      state: 'final_integration_assurance_required', safeToAutofix: false,
    })
  })
  it('captures failed jobs without issuing a repair', () => {
    expect(evaluate({
      run: { ...run, conclusion: 'failure' },
      jobs: [{ name: 'Foundation quality', conclusion: 'failure', html_url: 'https://github.com/example' }],
    })).toMatchObject({
      state: 'diagnosis_required',
      failedJobs: [{ name: 'Foundation quality', conclusion: 'failure' }],
      safeToAutofix: false,
    })
  })
  it('does not process a superseded SHA', () => {
    expect(evaluate({ pr: { ...pr, head: { ...pr.head, sha: main } } }).state).toBe('ignored')
  })
  it('does not process the older run for the same SHA', () => {
    expect(evaluate({ latestRun: { ...run, id: 43 } }).reason).toBe('superseded_ci_attempt')
  })
  it('does not process unlabelled PRs', () => {
    expect(evaluate({ pr: { ...pr, labels: [] } }).reason).toBe('pilot_label_missing')
  })
  it('does not process fork PRs', () => {
    expect(evaluate({ pr: { ...pr, head: { ...pr.head, repo: { full_name: 'untrusted/fork' } } } }).reason).toBe('fork_pr_not_in_pilot')
  })
  it('does not present CI on an older base as final-integrated', () => {
    expect(evaluate({ mainSha: 'c'.repeat(40) }).state).toBe('integration_review_required')
  })
  it('ignores a push workflow run', () => {
    expect(evaluate({ run: { ...run, event: 'push' } }).reason).toBe('not_completed_pull_request_ci')
  })
})
