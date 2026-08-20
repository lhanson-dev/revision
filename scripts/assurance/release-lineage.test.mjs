import { createServer } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import {
  approvalMatches,
  latestApprovalForHead,
  latestCiRunForHead,
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

function governedPull({ number, mergeSha, headSha }) {
  return { number, merged_at: '2026-08-20T20:00:00Z', merge_commit_sha: mergeSha, head: { sha: headSha } }
}

function successfulCi(headSha, id = 405) {
  return {
    id,
    run_number: id,
    head_sha: headSha,
    status: 'completed',
    conclusion: 'success',
    updated_at: '2026-08-20T20:05:00Z',
  }
}

function approval(headSha, id = 9001) {
  return {
    id,
    created_at: '2026-08-20T20:06:00Z',
    user: { login: 'lhanson-dev' },
    body: `revision-founder-approval:v1\nhead_sha: ${headSha}`,
  }
}

describe('governed release lineage helpers', () => {
  it('selects only the PR whose merge commit matches the deployed main SHA', () => {
    const pulls = [
      { number: 10, merged_at: '2026-08-19T10:00:00Z', merge_commit_sha: 'other', head: { sha: 'head-a' } },
      { number: 11, merged_at: '2026-08-19T11:00:00Z', merge_commit_sha: 'merge-b', head: { sha: 'head-b' } },
    ]
    expect(selectMergedPull(pulls, 'merge-b')?.number).toBe(11)
    expect(selectMergedPull(pulls, 'unknown')).toBeNull()
  })

  it('matches Founder approval only for the exact head and selects the latest matching marker', () => {
    const headSha = 'a'.repeat(40)
    const oldApproval = {
      id: 1,
      created_at: '2026-08-19T21:01:00Z',
      user: { login: 'lhanson-dev' },
      body: `revision-founder-approval:v1\nhead_sha: ${headSha}`,
    }
    const newApproval = {
      id: 2,
      created_at: '2026-08-19T21:02:00Z',
      user: { login: 'lhanson-dev' },
      body: `revision-founder-approval:v1\nhead_sha: ${headSha}`,
    }
    expect(approvalMatches(oldApproval, 'lhanson-dev', headSha)).toBe(true)
    expect(approvalMatches(oldApproval, 'lhanson-dev', 'b'.repeat(40))).toBe(false)
    expect(approvalMatches(oldApproval, 'someone-else', headSha)).toBe(false)
    expect(latestApprovalForHead([oldApproval, newApproval], 'lhanson-dev', headSha)?.id).toBe(2)
  })

  it('uses the latest exact-head CI run rather than an older green run', () => {
    const headSha = 'a'.repeat(40)
    const runs = [
      { id: 1, run_number: 10, head_sha: headSha, status: 'completed', conclusion: 'success' },
      { id: 2, run_number: 11, head_sha: headSha, status: 'completed', conclusion: 'failure' },
      { id: 3, run_number: 12, head_sha: 'other', status: 'completed', conclusion: 'success' },
    ]
    expect(latestCiRunForHead(runs, headSha)?.id).toBe(2)
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
        return json(response, [governedPull({ number: 68, mergeSha, headSha })])
      }
      if (request.url?.startsWith('/repos/owner/repo/actions/workflows/ci.yml/runs?')) {
        return json(response, { workflow_runs: [successfulCi(headSha)] })
      }
      if (request.url === '/repos/owner/repo/issues/68/comments?per_page=100') {
        return json(response, [approval(headSha)])
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
      recoveredGovernedFailures: [],
    })
    expect(seen.some((url) => url?.includes(`head_sha=${headSha}`))).toBe(true)
  })

  it('recovers across a failed prior release only when that prior commit is independently proven governed', async () => {
    const currentHead = '1'.repeat(40)
    const currentMerge = '2'.repeat(40)
    const priorHead = '3'.repeat(40)
    const priorMerge = '4'.repeat(40)
    const bootstrapParent = '5'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${currentMerge}`) return json(response, { parents: [{ sha: priorMerge }] })
      if (request.url === `/repos/owner/repo/commits/${currentMerge}/pulls`) return json(response, [governedPull({ number: 79, mergeSha: currentMerge, headSha: currentHead })])
      if (request.url === `/repos/owner/repo/commits/${priorMerge}/status`) {
        return json(response, { statuses: [{ context: releaseStatusContext, state: 'failure', updated_at: '2026-08-20T20:10:00Z' }] })
      }
      if (request.url === `/repos/owner/repo/commits/${priorMerge}`) return json(response, { parents: [{ sha: bootstrapParent }] })
      if (request.url === `/repos/owner/repo/commits/${priorMerge}/pulls`) return json(response, [governedPull({ number: 78, mergeSha: priorMerge, headSha: priorHead })])
      if (request.url?.includes(`head_sha=${currentHead}`)) return json(response, { workflow_runs: [successfulCi(currentHead, 478)] })
      if (request.url?.includes(`head_sha=${priorHead}`)) return json(response, { workflow_runs: [successfulCi(priorHead, 477)] })
      if (request.url === '/repos/owner/repo/issues/79/comments?per_page=100') return json(response, [approval(currentHead, 9079)])
      if (request.url === '/repos/owner/repo/issues/78/comments?per_page=100') return json(response, [approval(priorHead, 9078)])
      return json(response, { error: `unexpected request ${request.url}` }, 404)
    })

    const evidence = await verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha: currentMerge,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent,
    })

    expect(evidence.priorRelease).toBe('recovered-to-bootstrap')
    expect(evidence.recoveredGovernedFailures).toEqual([
      expect.objectContaining({ mergeSha: priorMerge, releaseState: 'failure', prNumber: 78, headSha: priorHead }),
    ])
  })

  it('fails closed when a failed prior release cannot be proven as a governed merge', async () => {
    const currentHead = '6'.repeat(40)
    const currentMerge = '7'.repeat(40)
    const priorMerge = '8'.repeat(40)
    const bootstrapParent = '9'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${currentMerge}`) return json(response, { parents: [{ sha: priorMerge }] })
      if (request.url === `/repos/owner/repo/commits/${currentMerge}/pulls`) return json(response, [governedPull({ number: 80, mergeSha: currentMerge, headSha: currentHead })])
      if (request.url?.includes(`head_sha=${currentHead}`)) return json(response, { workflow_runs: [successfulCi(currentHead, 480)] })
      if (request.url === '/repos/owner/repo/issues/80/comments?per_page=100') return json(response, [approval(currentHead, 9080)])
      if (request.url === `/repos/owner/repo/commits/${priorMerge}/status`) {
        return json(response, { statuses: [{ context: releaseStatusContext, state: 'failure', updated_at: '2026-08-20T20:10:00Z' }] })
      }
      if (request.url === `/repos/owner/repo/commits/${priorMerge}`) return json(response, { parents: [{ sha: bootstrapParent }] })
      if (request.url === `/repos/owner/repo/commits/${priorMerge}/pulls`) return json(response, [])
      return json(response, { error: `unexpected request ${request.url}` }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha: currentMerge,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent,
    })).rejects.toThrow('cannot be proven as a governed merge')
  })

  it('fails closed when the previous main revision has no durable path-to-live status', async () => {
    const headSha = 'a'.repeat(40)
    const mergeSha = 'b'.repeat(40)
    const parentSha = 'c'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) return json(response, { parents: [{ sha: parentSha }] })
      if (request.url === `/repos/owner/repo/commits/${mergeSha}/pulls`) return json(response, [governedPull({ number: 81, mergeSha, headSha })])
      if (request.url?.includes(`head_sha=${headSha}`)) return json(response, { workflow_runs: [successfulCi(headSha, 481)] })
      if (request.url === '/repos/owner/repo/issues/81/comments?per_page=100') return json(response, [approval(headSha, 9081)])
      if (request.url === `/repos/owner/repo/commits/${parentSha}/status`) return json(response, { statuses: [] })
      return json(response, { error: `unexpected request ${request.url}` }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent: 'not-the-parent',
    })).rejects.toThrow(`has no ${releaseStatusContext} status`)
  })

  it('fails closed while a prior release is still pending', async () => {
    const headSha = 'd'.repeat(40)
    const mergeSha = 'e'.repeat(40)
    const parentSha = 'f'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) return json(response, { parents: [{ sha: parentSha }] })
      if (request.url === `/repos/owner/repo/commits/${mergeSha}/pulls`) return json(response, [governedPull({ number: 82, mergeSha, headSha })])
      if (request.url?.includes(`head_sha=${headSha}`)) return json(response, { workflow_runs: [successfulCi(headSha, 482)] })
      if (request.url === '/repos/owner/repo/issues/82/comments?per_page=100') return json(response, [approval(headSha, 9082)])
      if (request.url === `/repos/owner/repo/commits/${parentSha}/status`) {
        return json(response, { statuses: [{ context: releaseStatusContext, state: 'pending', updated_at: '2026-08-20T20:10:00Z' }] })
      }
      return json(response, { error: `unexpected request ${request.url}` }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent: 'not-the-parent',
    })).rejects.toThrow('release chain fails closed while that release is unresolved')
  })

  it('fails closed when the latest exact-head CI is not successful even if an older run passed', async () => {
    const headSha = '1'.repeat(40)
    const mergeSha = '2'.repeat(40)
    const bootstrapParent = '3'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) return json(response, { parents: [{ sha: bootstrapParent }] })
      if (request.url === `/repos/owner/repo/commits/${mergeSha}/pulls`) {
        return json(response, [governedPull({ number: 68, mergeSha, headSha })])
      }
      if (request.url?.startsWith('/repos/owner/repo/actions/workflows/ci.yml/runs?')) {
        return json(response, {
          workflow_runs: [
            { id: 2, run_number: 12, head_sha: headSha, status: 'completed', conclusion: 'failure', updated_at: '2026-08-19T21:05:00Z' },
            { id: 1, run_number: 11, head_sha: headSha, status: 'completed', conclusion: 'success', updated_at: '2026-08-19T21:04:00Z' },
          ],
        })
      }
      return json(response, { error: 'unexpected request' }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent,
    })).rejects.toThrow('Latest exact-head Revision CI')
  })

  it('fails closed if Founder approval predates completion of the latest exact-head CI', async () => {
    const headSha = '4'.repeat(40)
    const mergeSha = '5'.repeat(40)
    const bootstrapParent = '6'.repeat(40)

    const apiUrl = await fakeGithub(async (request, response) => {
      if (request.url === `/repos/owner/repo/commits/${mergeSha}`) return json(response, { parents: [{ sha: bootstrapParent }] })
      if (request.url === `/repos/owner/repo/commits/${mergeSha}/pulls`) {
        return json(response, [governedPull({ number: 68, mergeSha, headSha })])
      }
      if (request.url?.startsWith('/repos/owner/repo/actions/workflows/ci.yml/runs?')) {
        return json(response, { workflow_runs: [{ id: 7, run_number: 7, head_sha: headSha, status: 'completed', conclusion: 'success', updated_at: '2026-08-19T21:05:00Z' }] })
      }
      if (request.url === '/repos/owner/repo/issues/68/comments?per_page=100') {
        return json(response, [{ id: 8, created_at: '2026-08-19T21:04:00Z', user: { login: 'lhanson-dev' }, body: `revision-founder-approval:v1\nhead_sha: ${headSha}` }])
      }
      return json(response, { error: 'unexpected request' }, 404)
    })

    await expect(verifyReleaseLineage({
      apiUrl,
      repository: 'owner/repo',
      mergeSha,
      token: 'test-token',
      founderLogin: 'lhanson-dev',
      bootstrapParent,
    })).rejects.toThrow('approval marker predates completion')
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
