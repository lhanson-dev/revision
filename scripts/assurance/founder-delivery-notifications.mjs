import { pathToFileURL } from 'node:url'
import { latestApprovalForHead, latestCiRunForHead } from './release-lineage.mjs'

const notificationKinds = {
  founderAction: 'revision-founder-action:v1',
  integrationAttention: 'revision-integration-attention:v1',
  ciAttention: 'revision-ci-attention:v1',
  productionReady: 'revision-production-ready:v1',
  productionAttention: 'revision-production-attention:v1',
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

function hiddenMarker(kind, fields) {
  const renderedFields = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ')
  return `<!-- ${kind} ${renderedFields} -->`
}

export function hasValidFounderApprovalAfterRun({ comments, founderLogin, headSha, runCompletedAt }) {
  const approval = latestApprovalForHead(comments, founderLogin, headSha)
  if (!approval) return false

  const completedAt = timestamp(runCompletedAt)
  const approvalAt = timestamp(approval.created_at)
  if (completedAt === null || approvalAt === null) return false
  return approvalAt >= completedAt
}

export function findExistingNotification(comments, dedupeMarker) {
  return comments.find((comment) => typeof comment?.body === 'string' && comment.body.includes(dedupeMarker)) ?? null
}

export function planCiNotification({
  run,
  latestRun,
  pr,
  comments,
  founderLogin,
  currentBaseSha,
  ciBaseSha,
}) {
  if (run?.name !== 'Revision CI' || run?.event !== 'pull_request') {
    return { type: 'skip', reason: 'not_pull_request_revision_ci' }
  }
  if (!pr || pr.state !== 'open' || pr.draft) {
    return { type: 'skip', reason: 'pr_not_open_and_ready' }
  }
  if (pr.head?.sha !== run.head_sha) {
    return { type: 'skip', reason: 'stale_pr_head' }
  }
  if (!latestRun || latestRun.id !== run.id) {
    return { type: 'skip', reason: 'not_latest_exact_head_ci' }
  }
  if (run.status !== 'completed') {
    return { type: 'skip', reason: 'ci_not_completed' }
  }

  const headSha = run.head_sha
  const prNumber = pr.number
  const prUrl = pr.html_url ?? `https://github.com/${pr.base?.repo?.full_name ?? ''}/pull/${prNumber}`

  if (!currentBaseSha || !ciBaseSha || currentBaseSha !== ciBaseSha) {
    const marker = `${notificationKinds.integrationAttention} head_sha=${headSha} current_base=${currentBaseSha ?? 'unknown'}`
    return {
      type: 'comment',
      kind: 'integration_attention',
      dedupeMarker: marker,
      body: [
        hiddenMarker(notificationKinds.integrationAttention, {
          head_sha: headSha,
          current_base: currentBaseSha ?? 'unknown',
        }),
        `@${founderLogin} **Delivery integration refresh needed**`,
        '',
        `PR #${prNumber} — **${pr.title ?? 'Revision change'}** — has CI evidence, but that run is not proven against the current \`main\` baseline.`,
        '',
        `Next action in ChatGPT: \`Check PR #${prNumber}\``,
        '',
        `Exact head: \`${headSha}\`  `,
        `CI base: \`${ciBaseSha ?? 'unknown'}\`  `,
        `Current main: \`${currentBaseSha ?? 'unknown'}\`  `,
        `PR: ${prUrl}`,
        '',
        'Founder merge approval is not being requested until current-main integration and fresh assurance are established.',
      ].join('\n'),
    }
  }

  if (run.conclusion === 'success') {
    if (hasValidFounderApprovalAfterRun({
      comments,
      founderLogin,
      headSha,
      runCompletedAt: run.updated_at,
    })) {
      return { type: 'skip', reason: 'valid_founder_approval_already_exists' }
    }

    const marker = `${notificationKinds.founderAction} head_sha=${headSha}`
    return {
      type: 'comment',
      kind: 'founder_action',
      dedupeMarker: marker,
      body: [
        hiddenMarker(notificationKinds.founderAction, { head_sha: headSha }),
        `@${founderLogin} **Founder action required**`,
        '',
        `PR #${prNumber} — **${pr.title ?? 'Revision change'}** — has passed the latest exact-head Revision CI against current \`main\` and is ready for your production decision.`,
        '',
        `Next action in ChatGPT: \`Approve merge PR #${prNumber}\``,
        '',
        `Exact head: \`${headSha}\`  `,
        `CI: ${run.html_url ?? 'Revision CI'}  `,
        `PR: ${prUrl}`,
        '',
        'This notification is informational only. It does not approve or merge the PR, and the existing Founder approval gate remains mandatory.',
      ].join('\n'),
    }
  }

  const marker = `${notificationKinds.ciAttention} head_sha=${headSha} run_id=${run.id}`
  return {
    type: 'comment',
    kind: 'ci_attention',
    dedupeMarker: marker,
    body: [
      hiddenMarker(notificationKinds.ciAttention, { head_sha: headSha, run_id: run.id }),
      `@${founderLogin} **Delivery attention needed**`,
      '',
      `PR #${prNumber} — **${pr.title ?? 'Revision change'}** — did not pass the latest exact-head Revision CI.`,
      '',
      `Next action in ChatGPT: \`Check PR #${prNumber}\``,
      '',
      `Exact head: \`${headSha}\`  `,
      `CI conclusion: \`${run.conclusion ?? 'unknown'}\`  `,
      `CI: ${run.html_url ?? 'Revision CI'}`,
      '',
      'No merge approval is being requested while assurance is not green.',
    ].join('\n'),
  }
}

function pathToLiveState(statusPayload) {
  const statuses = Array.isArray(statusPayload) ? statusPayload : statusPayload?.statuses
  if (!Array.isArray(statuses)) return null
  return statuses.find((status) => status?.context === 'revision/path-to-live')?.state ?? null
}

export function planProductionNotification({ run, pr, statusPayload, founderLogin }) {
  if (run?.name !== 'Deploy Revision to Pages' || run?.event !== 'push' || run?.head_branch !== 'main') {
    return { type: 'skip', reason: 'not_main_production_deploy' }
  }
  if (!pr || !pr.merged_at || pr.merge_commit_sha !== run.head_sha) {
    return { type: 'skip', reason: 'no_exact_merged_pr' }
  }

  const mergeSha = run.head_sha
  const prNumber = pr.number
  const pathState = pathToLiveState(statusPayload)

  if (run.conclusion === 'success' && pathState === 'success') {
    const marker = `${notificationKinds.productionReady} merge_sha=${mergeSha}`
    return {
      type: 'comment',
      kind: 'production_ready',
      dedupeMarker: marker,
      body: [
        hiddenMarker(notificationKinds.productionReady, { merge_sha: mergeSha }),
        `@${founderLogin} **Production verified — ready to continue**`,
        '',
        `PR #${prNumber} — **${pr.title ?? 'Revision change'}** — has completed the governed production path successfully.`,
        '',
        'All encoded machine-only release steps have finished. If this workstream has a next governed step, it is now ready to continue without polling GitHub.',
        '',
        `Merge commit: \`${mergeSha}\`  `,
        `Production workflow: ${run.html_url ?? 'Deploy Revision to Pages'}`,
        '',
        'No new Founder approval is implied by this notification. Any later PR still requires its own explicit approval.',
      ].join('\n'),
    }
  }

  const marker = `${notificationKinds.productionAttention} merge_sha=${mergeSha} run_id=${run.id}`
  return {
    type: 'comment',
    kind: 'production_attention',
    dedupeMarker: marker,
    body: [
      hiddenMarker(notificationKinds.productionAttention, { merge_sha: mergeSha, run_id: run.id }),
      `@${founderLogin} **Production attention needed**`,
      '',
      `PR #${prNumber} — **${pr.title ?? 'Revision change'}** — did not complete the governed production path successfully.`,
      '',
      `Next action in ChatGPT: \`Check PR #${prNumber}\``,
      '',
      `Merge commit: \`${mergeSha}\`  `,
      `Workflow conclusion: \`${run.conclusion ?? 'unknown'}\`  `,
      `revision/path-to-live: \`${pathState ?? 'unknown'}\`  `,
      `Production workflow: ${run.html_url ?? 'Deploy Revision to Pages'}`,
    ].join('\n'),
  }
}

async function postNotification({ apiUrl, repository, token, prNumber, plan, comments }) {
  if (plan.type !== 'comment') return { ...plan, posted: false }
  if (findExistingNotification(comments, plan.dedupeMarker)) {
    return { ...plan, posted: false, duplicate: true }
  }

  const comment = await githubJson(`${apiUrl}/repos/${repository}/issues/${prNumber}/comments`, token, {
    method: 'POST',
    body: JSON.stringify({ body: plan.body }),
  })

  return {
    ...plan,
    posted: true,
    commentId: comment?.id ?? null,
  }
}

async function exactMergedPrForCommit({ apiUrl, repository, token, sha }) {
  const pulls = await githubJson(`${apiUrl}/repos/${repository}/commits/${sha}/pulls?per_page=100`, token)
  if (!Array.isArray(pulls)) return null
  return pulls.find((pr) => pr?.merged_at && pr?.merge_commit_sha === sha) ?? null
}

export async function publishFounderDeliveryNotification(options = {}) {
  const apiUrl = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const repository = requireValue(options.repository ?? process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY')
  const runId = Number(requireValue(options.runId ?? process.env.REVISION_WORKFLOW_RUN_ID, 'REVISION_WORKFLOW_RUN_ID'))
  const token = requireValue(options.token ?? process.env.GITHUB_TOKEN, 'GITHUB_TOKEN')
  const founderLogin = requireValue(options.founderLogin ?? process.env.REVISION_FOUNDER_GITHUB_LOGIN, 'REVISION_FOUNDER_GITHUB_LOGIN')

  const run = await githubJson(`${apiUrl}/repos/${repository}/actions/runs/${runId}`, token)

  if (run.name === 'Revision CI' && run.event === 'pull_request') {
    const prNumber = run.pull_requests?.[0]?.number
    if (!prNumber) return { type: 'skip', reason: 'ci_run_has_no_pull_request' }

    const pr = await githubJson(`${apiUrl}/repos/${repository}/pulls/${prNumber}`, token)
    const headSha = pr?.head?.sha
    if (!headSha) return { type: 'skip', reason: 'pr_head_unavailable' }

    const ciPayload = await githubJson(
      `${apiUrl}/repos/${repository}/actions/workflows/ci.yml/runs?event=pull_request&head_sha=${headSha}&per_page=50`,
      token,
    )
    const latestRun = latestCiRunForHead(ciPayload?.workflow_runs, headSha)
    const comments = await githubJson(`${apiUrl}/repos/${repository}/issues/${prNumber}/comments?per_page=100`, token)
    const baseRef = pr?.base?.ref
    const baseBranch = baseRef
      ? await githubJson(`${apiUrl}/repos/${repository}/branches/${encodeURIComponent(baseRef)}`, token)
      : null
    const currentBaseSha = baseBranch?.commit?.sha ?? null
    const ciBaseSha = run.pull_requests?.[0]?.base?.sha ?? null
    const plan = planCiNotification({
      run,
      latestRun,
      pr,
      comments,
      founderLogin,
      currentBaseSha,
      ciBaseSha,
    })
    return postNotification({ apiUrl, repository, token, prNumber, plan, comments })
  }

  if (run.name === 'Deploy Revision to Pages' && run.event === 'push' && run.head_branch === 'main') {
    const pr = await exactMergedPrForCommit({ apiUrl, repository, token, sha: run.head_sha })
    if (!pr) return { type: 'skip', reason: 'production_run_has_no_exact_merged_pr' }

    const comments = await githubJson(`${apiUrl}/repos/${repository}/issues/${pr.number}/comments?per_page=100`, token)
    const statusPayload = await githubJson(`${apiUrl}/repos/${repository}/commits/${run.head_sha}/status`, token)
    const plan = planProductionNotification({ run, pr, statusPayload, founderLogin })
    return postNotification({ apiUrl, repository, token, prNumber: pr.number, plan, comments })
  }

  return { type: 'skip', reason: 'unsupported_workflow_run' }
}

export { notificationKinds }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await publishFounderDeliveryNotification()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
