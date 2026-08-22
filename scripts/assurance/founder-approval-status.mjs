import { pathToFileURL } from 'node:url'
import { latestApprovalForHead, latestCiRunForHead } from './release-lineage.mjs'

export const founderApprovalStatusContext = 'revision/founder-approval'

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function timestamp(value) {
  const parsed = Date.parse(value ?? '')
  return Number.isFinite(parsed) ? parsed : null
}

async function githubJson(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API ${response.status} for ${url}: ${body.slice(0, 500)}`)
  }

  return response.json()
}

export function evaluateFounderApprovalStatus({ pr, runs, comments, founderLogin }) {
  const headSha = pr?.head?.sha
  if (!headSha) {
    return {
      state: 'failure',
      description: 'PR head SHA is unavailable; Founder approval cannot be proven.',
      headSha: null,
      ciRunId: null,
      approvalCommentId: null,
    }
  }

  const ciRun = latestCiRunForHead(runs, headSha)
  if (!ciRun) {
    return {
      state: 'pending',
      description: 'Waiting for exact-head Revision CI.',
      headSha,
      ciRunId: null,
      approvalCommentId: null,
    }
  }

  if (ciRun.status !== 'completed') {
    return {
      state: 'pending',
      description: 'Exact-head Revision CI is still running.',
      headSha,
      ciRunId: ciRun.id ?? null,
      approvalCommentId: null,
    }
  }

  if (ciRun.conclusion !== 'success') {
    return {
      state: 'failure',
      description: 'Latest exact-head Revision CI did not pass.',
      headSha,
      ciRunId: ciRun.id ?? null,
      approvalCommentId: null,
    }
  }

  const approval = latestApprovalForHead(comments, founderLogin, headSha)
  if (!approval) {
    return {
      state: 'pending',
      description: 'Waiting for exact machine-readable Founder approval.',
      headSha,
      ciRunId: ciRun.id ?? null,
      approvalCommentId: null,
    }
  }

  const ciCompletedAt = timestamp(ciRun.updated_at)
  const approvalAt = timestamp(approval.created_at)
  if (ciCompletedAt !== null && (approvalAt === null || approvalAt < ciCompletedAt)) {
    return {
      state: 'pending',
      description: 'Founder approval must follow the latest exact-head CI.',
      headSha,
      ciRunId: ciRun.id ?? null,
      approvalCommentId: approval.id ?? null,
    }
  }

  return {
    state: 'success',
    description: 'Exact-head CI and Founder approval evidence are valid.',
    headSha,
    ciRunId: ciRun.id ?? null,
    approvalCommentId: approval.id ?? null,
  }
}

export async function publishFounderApprovalStatus(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const prNumber = Number(requireValue(options.prNumber ?? process.env.REVISION_PR_NUMBER, 'REVISION_PR_NUMBER'))
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const founderLogin = requireValue(options.founderLogin ?? process.env.REVISION_FOUNDER_GITHUB_LOGIN, 'REVISION_FOUNDER_GITHUB_LOGIN')

  const pr = await githubJson(`${apiUrl}/repos/${repository}/pulls/${prNumber}`, token)
  const headSha = requireValue(pr?.head?.sha, 'PR head SHA')
  const ciPayload = await githubJson(
    `${apiUrl}/repos/${repository}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${headSha}&per_page=50`,
    token,
  )
  const comments = await githubJson(`${apiUrl}/repos/${repository}/issues/${prNumber}/comments?per_page=100`, token)

  const result = evaluateFounderApprovalStatus({
    pr,
    runs: ciPayload?.workflow_runs,
    comments,
    founderLogin,
  })

  const targetUrl = options.targetUrl
    ?? process.env.REVISION_APPROVAL_TARGET_URL
    ?? pr?.html_url

  await githubJson(`${apiUrl}/repos/${repository}/statuses/${headSha}`, token, {
    method: 'POST',
    body: JSON.stringify({
      state: result.state,
      context: founderApprovalStatusContext,
      description: result.description.slice(0, 140),
      target_url: targetUrl || undefined,
    }),
  })

  return {
    prNumber,
    ...result,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await publishFounderApprovalStatus()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
