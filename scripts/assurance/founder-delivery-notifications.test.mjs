import { describe, expect, it } from 'vitest'
import {
  findExistingNotification,
  planCiNotification,
  planProductionNotification,
} from './founder-delivery-notifications.mjs'

const headSha = 'a'.repeat(40)
const baseSha = 'c'.repeat(40)
const mergeSha = 'b'.repeat(40)

function ciRun(overrides = {}) {
  return {
    id: 1583,
    name: 'Revision CI',
    event: 'pull_request',
    head_sha: headSha,
    head_branch: 'feature/example',
    status: 'completed',
    conclusion: 'success',
    updated_at: '2026-09-05T10:00:00Z',
    html_url: 'https://github.com/lhanson-dev/revision/actions/runs/1583',
    ...overrides,
  }
}

function pr(overrides = {}) {
  return {
    number: 313,
    state: 'open',
    draft: false,
    title: 'Example governed change',
    html_url: 'https://github.com/lhanson-dev/revision/pull/313',
    head: { sha: headSha },
    base: { ref: 'main', repo: { full_name: 'lhanson-dev/revision' } },
    ...overrides,
  }
}

function approvalComment(overrides = {}) {
  return {
    id: 99,
    created_at: '2026-09-05T10:01:00Z',
    user: { login: 'lhanson-dev' },
    body: `revision-founder-approval:v1\nhead_sha: ${headSha}`,
    ...overrides,
  }
}

function deployRun(overrides = {}) {
  return {
    id: 244,
    name: 'Deploy Revision to Pages',
    event: 'push',
    head_branch: 'main',
    head_sha: mergeSha,
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/lhanson-dev/revision/actions/runs/244',
    ...overrides,
  }
}

function mergedPr(overrides = {}) {
  return {
    number: 313,
    title: 'Example governed change',
    merged_at: '2026-09-05T10:05:00Z',
    merge_commit_sha: mergeSha,
    ...overrides,
  }
}

function currentMain() {
  return {
    currentBaseSha: baseSha,
    ciBaseSha: baseSha,
  }
}

describe('Founder delivery notification planning', () => {
  it('notifies the Founder when exact-head CI is green against current main and approval is still required', () => {
    const run = ciRun()
    const result = planCiNotification({
      run,
      latestRun: run,
      pr: pr(),
      comments: [],
      founderLogin: 'lhanson-dev',
      ...currentMain(),
    })

    expect(result.type).toBe('comment')
    expect(result.kind).toBe('founder_action')
    expect(result.body).toContain('@lhanson-dev **Founder action required**')
    expect(result.body).toContain('Approve merge PR #313')
    expect(result.body).toContain(headSha)
  })

  it('does not notify for an older CI run after a newer exact-head run exists', () => {
    const result = planCiNotification({
      run: ciRun({ id: 1582 }),
      latestRun: ciRun({ id: 1583 }),
      pr: pr(),
      comments: [],
      founderLogin: 'lhanson-dev',
      ...currentMain(),
    })

    expect(result).toEqual({ type: 'skip', reason: 'not_latest_exact_head_ci' })
  })

  it('asks for integration attention instead of Founder approval when main moved after CI', () => {
    const run = ciRun()
    const newerMain = 'd'.repeat(40)
    const result = planCiNotification({
      run,
      latestRun: run,
      pr: pr(),
      comments: [],
      founderLogin: 'lhanson-dev',
      currentBaseSha: newerMain,
      ciBaseSha: baseSha,
    })

    expect(result.type).toBe('comment')
    expect(result.kind).toBe('integration_attention')
    expect(result.body).toContain('Delivery integration refresh needed')
    expect(result.body).toContain('Check PR #313')
    expect(result.body).not.toContain('Approve merge PR #313')
  })

  it('does not request approval when valid exact-head Founder evidence already follows CI', () => {
    const run = ciRun()
    const result = planCiNotification({
      run,
      latestRun: run,
      pr: pr(),
      comments: [approvalComment()],
      founderLogin: 'lhanson-dev',
      ...currentMain(),
    })

    expect(result).toEqual({ type: 'skip', reason: 'valid_founder_approval_already_exists' })
  })

  it('notifies on failed CI without requesting merge approval', () => {
    const run = ciRun({ conclusion: 'failure' })
    const result = planCiNotification({
      run,
      latestRun: run,
      pr: pr(),
      comments: [],
      founderLogin: 'lhanson-dev',
      ...currentMain(),
    })

    expect(result.type).toBe('comment')
    expect(result.kind).toBe('ci_attention')
    expect(result.body).toContain('Delivery attention needed')
    expect(result.body).toContain('Check PR #313')
    expect(result.body).not.toContain('Approve merge PR #313')
  })

  it('notifies when the exact merged commit is production verified', () => {
    const result = planProductionNotification({
      run: deployRun(),
      pr: mergedPr(),
      statusPayload: { statuses: [{ context: 'revision/path-to-live', state: 'success' }] },
      founderLogin: 'lhanson-dev',
    })

    expect(result.type).toBe('comment')
    expect(result.kind).toBe('production_ready')
    expect(result.body).toContain('@lhanson-dev **Production verified — ready to continue**')
    expect(result.body).toContain('without polling GitHub')
  })

  it('notifies on production failure or missing path-to-live success', () => {
    const result = planProductionNotification({
      run: deployRun({ conclusion: 'failure' }),
      pr: mergedPr(),
      statusPayload: { statuses: [{ context: 'revision/path-to-live', state: 'failure' }] },
      founderLogin: 'lhanson-dev',
    })

    expect(result.type).toBe('comment')
    expect(result.kind).toBe('production_attention')
    expect(result.body).toContain('Production attention needed')
    expect(result.body).toContain('Check PR #313')
  })

  it('suppresses duplicate notifications for the same durable marker', () => {
    const marker = `revision-founder-action:v1 head_sha=${headSha}`
    const existing = findExistingNotification([
      { body: `<!-- ${marker} -->\n@lhanson-dev Founder action required` },
    ], marker)

    expect(existing).not.toBeNull()
  })
})
