import { createServer } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import {
  approvalMatches,
  findSuccessfulCiRun,
  latestReleaseStatus,
  publishReleaseStatus,
  releaseStatusContext,
  selectMergedPull,
  verifyReleaseLineage,
} from './release-lineage.mjs'

const servers = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))))
})

async function fakeGithub(handler) {
  const server = createServer(async (request, response) => {
    try {
      await handler(request, response)
    } catch (error) {
      response.statusCode = 500
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
    }
  })
  servers.push(server)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  return `http://127.0.0.1:${address.port}`
}

function json(response, body, status = 200) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

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

describe('governed release lineage API contract', () => {
  it('verifies the full bootstrap PR/CI/Founder lineage through GitHub API calls', async () => {
    const headSha = 'a'.repeat(40)
    const mergeSha = 'b'.repeat(40)
    const bootstrapParent = 'c'.repeat(40)
    const seen = []

    const apiUrl = await fakeGithub(async (request, response) => {
      seen.push(request.url)
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) {
        return json(response, { parents: [{ sha: bootstrapParent }] })
      }
      if (request.url === `/repos/owner/repo/commits/${mergeSha}/pulls`) {
        return json(response, [{ number: 68, merged_at: '2026-08-19T21:00:00Z', merge_commit_sha: mergeSha, head: { sha: headSha } }])
      }
      if (request.url?.startsWith('/repos/owner/repo/actions/workflows/ci.yml/runs?')) {
        return json(response, { workflow_runs: [{ id: 405, head_sha: headSha, status: 'completed', conclusion: 'success' }] })
      }
      if (request.url === '/repos/owner/repo/issues/68/comments?per_page=100') {
        return json(response, [{ id: 9001, user: { login: 'lhanson-dev' }, body: `revision-founder-approval:v1\nhead_sha: ${headSha}` }])
      }
      return json(response, { error: 'unexpected request' }, 404)
    })

    const evidence = await verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent,
    })

    expect(evidence).toMatchObject({
      mergeSha,
      parentSha: bootstrapParent,
      priorRelease: 'bootstrap',
      prNumber: 68,
      headSha,
      ciRunId: 405,
      approvalCommentId: 9001,
    })
    expect(seen.some((url) => url?.includes(`head_sha=${headSha}`))).toBe(true)
  })

  it('fails closed when the previous main revision has no successful release status', async () => {
    const mergeSha = 'd'.repeat(40)
    const parentSha = 'e'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) return json(response, { parents: [{ sha: parentSha }] })
      if (request.url === `/repos/owner/repo/commits/${parentSha}/status`) {
        return json(response, { statuses: [{ context: releaseStatusContext, state: 'failure', updated_at: '2026-08-19T21:00:00Z' }] })
      }
      return json(response, { error: 'unexpected request' }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent: 'not-the-parent',
    })).rejects.toThrow(`${releaseStatusContext}=failure`)
  })

  it('publishes the durable path-to-live status on the exact main revision', async () => {
    const sha = 'f'.repeat(40)
    let posted

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url !== `/repos/owner/repo/statuses/${sha}` || request.method !== 'POST') {
        return json(response, { error: 'unexpected request' }, 404)
      }
      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      posted = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      return json(response, { ...posted, sha })
    })

    const result = await publishReleaseStatus({
      apiUrl,
      repository: 'owner/repo',
      sha,
      token: 'test-token',
      state: 'success',
      targetUrl: 'https://example.test/run/1',
    })

    expect(posted).toMatchObject({
      state: 'success',
      context: releaseStatusContext,
      target_url: 'https://example.test/run/1',
    })
    expect(result.sha).toBe(sha)
  })
})
