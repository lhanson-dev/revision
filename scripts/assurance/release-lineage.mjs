import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const founderApprovalMarker = 'revision-founder-approval:v1'
export const releaseStatusContext = 'revision/path-to-live'

export function selectMergedPull(pulls, mergeSha) {
  if (!Array.isArray(pulls)) return null
  return pulls.find((pull) => pull?.merged_at && pull?.merge_commit_sha === mergeSha) ?? null
}

export function approvalMatches(comment, founderLogin, headSha) {
  if (comment?.user?.login !== founderLogin || typeof comment?.body !== 'string') return false
  if (!comment.body.includes(founderApprovalMarker)) return false
  const match = comment.body.match(/head_sha:\s*([0-9a-f]{40})/i)
  return match?.[1]?.toLowerCase() === headSha.toLowerCase()
}

export function latestCiRunForHead(runs, headSha) {
  if (!Array.isArray(runs)) return null
  return runs
    .filter((run) => run?.head_sha === headSha)
    .sort((left, right) => {
      const runNumberDelta = Number(right?.run_number ?? 0) - Number(left?.run_number ?? 0)
      if (runNumberDelta !== 0) return runNumberDelta
      return String(right?.updated_at ?? right?.created_at ?? '').localeCompare(String(left?.updated_at ?? left?.created_at ?? ''))
    })[0] ?? null
}

export function latestReleaseStatus(statuses) {
  if (!Array.isArray(statuses)) return null
  return statuses
    .filter((status) => status?.context === releaseStatusContext)
    .sort((left, right) => String(right?.updated_at ?? '').localeCompare(String(left?.updated_at ?? '')))[0] ?? null
}

export function latestApprovalForHead(comments, founderLogin, headSha) {
  if (!Array.isArray(comments)) return null
  return comments
    .filter((comment) => approvalMatches(comment, founderLogin, headSha))
    .sort((left, right) => String(right?.created_at ?? '').localeCompare(String(left?.created_at ?? '')))[0] ?? null
}

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

function appendGithubFile(envName, text) {
  const path = process.env[envName]
  if (path) appendFileSync(path, `${text}\n`)
}

export async function verifyMergedCommitGovernance(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const mergeSha = requireValue(options.mergeSha, 'mergeSha')
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const founderLogin = requireValue(options.founderLogin ?? process.env.REVISION_FOUNDER_GITHUB_LOGIN, 'REVISION_FOUNDER_GITHUB_LOGIN')

  const commit = await githubJson(`${apiUrl}/repos/${repository}/commits/${mergeSha}`, token)
  const parentSha = commit?.parents?.[0]?.sha
  if (!parentSha) throw new Error(`Merge ${mergeSha} has no first parent; governed release ancestry cannot be established.`)

  const pulls = await githubJson(`${apiUrl}/repos/${repository}/commits/${mergeSha}/pulls`, token)
  const pull = selectMergedPull(pulls, mergeSha)
  const prNumber = pull?.number
  const headSha = pull?.head?.sha
  if (!prNumber || !headSha) {
    throw new Error(`Main commit ${mergeSha} cannot be correlated to the exact merged PR and proposed head.`)
  }

  const ciPayload = await githubJson(
    `${apiUrl}/repos/${repository}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${headSha}&per_page=50`,
    token,
  )
  const ciRun = latestCiRunForHead(ciPayload?.workflow_runs, headSha)
  if (!ciRun) {
    throw new Error(`PR #${prNumber} has no readable exact-head Revision CI run for ${headSha}.`)
  }
  if (ciRun.status !== 'completed' || ciRun.conclusion !== 'success') {
    throw new Error(`Latest exact-head Revision CI for PR #${prNumber} is ${ciRun.status ?? 'unknown'}/${ciRun.conclusion ?? 'unknown'}; release fails closed.`)
  }

  const comments = await githubJson(`${apiUrl}/repos/${repository}/issues/${prNumber}/comments?per_page=100`, token)
  const approval = latestApprovalForHead(comments, founderLogin, headSha)
  if (!approval) {
    throw new Error(`PR #${prNumber} has no Founder approval marker by ${founderLogin} for exact head ${headSha}.`)
  }

  const ciCompletedAt = timestamp(ciRun.updated_at)
  const approvalAt = timestamp(approval.created_at)
  if (ciCompletedAt !== null && (approvalAt === null || approvalAt < ciCompletedAt)) {
    throw new Error(`PR #${prNumber} latest Founder approval marker predates completion of the latest exact-head CI run; release fails closed.`)
  }

  return {
    mergeSha,
    parentSha,
    prNumber,
    headSha,
    ciRunId: ciRun.id,
    approvalCommentId: approval.id,
  }
}

export async function verifyPriorReleaseChain(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const founderLogin = requireValue(options.founderLogin ?? process.env.REVISION_FOUNDER_GITHUB_LOGIN, 'REVISION_FOUNDER_GITHUB_LOGIN')
  const bootstrapParent = options.bootstrapParent ?? process.env.REVISION_RELEASE_BOOTSTRAP_PARENT ?? ''
  const startSha = requireValue(options.startSha, 'startSha')
  const maxDepth = options.maxDepth ?? 50

  if (!bootstrapParent) {
    throw new Error('No governed bootstrap parent is configured for release-status ancestry.')
  }

  let candidateSha = startSha
  const recoveredGovernedFailures = []

  for (let depth = 0; depth < maxDepth; depth += 1) {
    if (candidateSha === bootstrapParent) {
      return {
        priorRelease: recoveredGovernedFailures.length > 0 ? 'recovered-to-bootstrap' : 'bootstrap',
        recoveredGovernedFailures,
      }
    }

    const statusPayload = await githubJson(`${apiUrl}/repos/${repository}/commits/${candidateSha}/status`, token)
    const status = latestReleaseStatus(statusPayload?.statuses)
    if (!status) {
      throw new Error(`Previous main commit ${candidateSha} has no ${releaseStatusContext} status; release chain fails closed.`)
    }

    if (status.state === 'success') {
      return {
        priorRelease: recoveredGovernedFailures.length > 0 ? `recovered-to:${candidateSha}` : `verified:${candidateSha}`,
        recoveredGovernedFailures,
      }
    }

    if (status.state === 'pending') {
      throw new Error(`Previous main commit ${candidateSha} has ${releaseStatusContext}=pending; release chain fails closed while that release is unresolved.`)
    }

    if (!['failure', 'error'].includes(status.state)) {
      throw new Error(`Previous main commit ${candidateSha} has unsupported ${releaseStatusContext}=${status.state}; release chain fails closed.`)
    }

    let governance
    try {
      governance = await verifyMergedCommitGovernance({ apiUrl, repository, mergeSha: candidateSha, token, founderLogin })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`Previous main commit ${candidateSha} has ${releaseStatusContext}=${status.state} and cannot be proven as a governed merge: ${reason}`)
    }

    recoveredGovernedFailures.push({
      mergeSha: candidateSha,
      releaseState: status.state,
      prNumber: governance.prNumber,
      headSha: governance.headSha,
      ciRunId: governance.ciRunId,
      approvalCommentId: governance.approvalCommentId,
    })
    candidateSha = governance.parentSha
  }

  throw new Error(`Release ancestry exceeded ${maxDepth} commits without reaching a successful governed release or the configured bootstrap parent.`)
}

export async function verifyReleaseLineage(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const mergeSha = requireValue(options.mergeSha ?? process.env.GITHUB_SHA, 'GITHUB_SHA')
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const founderLogin = requireValue(options.founderLogin ?? process.env.REVISION_FOUNDER_GITHUB_LOGIN, 'REVISION_FOUNDER_GITHUB_LOGIN')
  const bootstrapParent = options.bootstrapParent ?? process.env.REVISION_RELEASE_BOOTSTRAP_PARENT ?? ''

  const governance = await verifyMergedCommitGovernance({ apiUrl, repository, mergeSha, token, founderLogin })
  const prior = await verifyPriorReleaseChain({
    apiUrl,
    repository,
    startSha: governance.parentSha,
    token,
    founderLogin,
    bootstrapParent,
    maxDepth: options.maxDepth,
  })

  return {
    ...governance,
    priorRelease: prior.priorRelease,
    recoveredGovernedFailures: prior.recoveredGovernedFailures,
  }
}

export async function publishReleaseStatus(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const sha = requireValue(options.sha ?? process.env.GITHUB_SHA, 'GITHUB_SHA')
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const state = requireValue(options.state ?? process.env.REVISION_RELEASE_STATE, 'REVISION_RELEASE_STATE')
  if (!['success', 'failure', 'error', 'pending'].includes(state)) throw new Error(`Unsupported release status: ${state}`)

  const targetUrl = options.targetUrl ?? process.env.REVISION_RELEASE_TARGET_URL
  const description = state === 'success'
    ? 'Governed PR, backend readiness, Pages deploy and production smoke passed.'
    : state === 'pending'
      ? 'Governed path-to-live verification is in progress.'
      : 'Governed path-to-live did not complete successfully.'

  return githubJson(`${apiUrl}/repos/${repository}/statuses/${sha}`, token, {
    method: 'POST',
    body: JSON.stringify({
      state,
      context: releaseStatusContext,
      description,
      target_url: targetUrl || undefined,
    }),
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2]
  try {
    if (command === 'verify') {
      const evidence = await verifyReleaseLineage()
      console.log(JSON.stringify(evidence, null, 2))
      const recovered = evidence.recoveredGovernedFailures.length > 0
        ? `\n- Governed failed releases traversed for recovery: ${evidence.recoveredGovernedFailures.map((item) => `${item.mergeSha} (PR #${item.prNumber})`).join(', ')}`
        : ''
      appendGithubFile('GITHUB_STEP_SUMMARY', `## Governed release lineage preflight\n\n- PR: #${evidence.prNumber}\n- Exact head: \`${evidence.headSha}\`\n- Merge: \`${evidence.mergeSha}\`\n- Previous release: ${evidence.priorRelease}${recovered}\n- Exact-head CI run: ${evidence.ciRunId}\n- Founder approval comment: ${evidence.approvalCommentId}`)
    } else if (command === 'publish-status') {
      const result = await publishReleaseStatus()
      console.log(`Published ${result.context}=${result.state} for ${result.sha}.`)
    } else {
      throw new Error('Expected command: verify | publish-status')
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
