import { appendFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const pilotLabel = 'revision-autonomy-proof'

function allowedRun(run) {
  return run?.name === 'Revision CI'
    && run?.event === 'pull_request'
    && run?.status === 'completed'
}

export function classifyContinuation({ run, pr, latestRun, jobs = [], mainSha }) {
  if (!allowedRun(run)) return { state: 'ignored', reason: 'not_completed_pull_request_ci' }
  if (!pr || pr.state !== 'open') return { state: 'ignored', reason: 'pr_not_open' }
  if (!pr.labels?.some((label) => label?.name === pilotLabel)) {
    return { state: 'ignored', reason: 'pilot_label_missing' }
  }
  if (pr.head?.repo?.full_name !== pr.base?.repo?.full_name) {
    return { state: 'ignored', reason: 'fork_pr_not_in_pilot' }
  }
  if (pr.head?.sha !== run.head_sha) return { state: 'ignored', reason: 'stale_pr_head' }
  if (!latestRun || latestRun.id !== run.id || latestRun.run_attempt !== run.run_attempt) {
    return { state: 'ignored', reason: 'superseded_ci_attempt' }
  }

  const failedJobs = jobs
    .filter((job) => ['failure', 'timed_out', 'cancelled', 'action_required'].includes(job.conclusion))
    .map((job) => ({ name: job.name, conclusion: job.conclusion, url: job.html_url }))
  if (run.conclusion !== 'success') {
    return {
      state: 'diagnosis_required',
      reason: 'ci_non_success',
      failedJobs,
      safeToAutofix: false,
    }
  }
  if (!mainSha || pr.base?.sha !== mainSha) {
    return {
      state: 'integration_review_required',
      reason: 'base_not_current_main',
      failedJobs: [],
      safeToAutofix: false,
    }
  }
  return {
    state: 'final_integration_assurance_required',
    reason: 'ci_success_does_not_prove_merged_candidate',
    failedJobs: [],
    safeToAutofix: false,
  }
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) throw new Error('GitHub read failed (' + response.status + '): ' + url)
  return response.json()
}

export async function runProof(options = {}) {
  const repository = options.repository ?? process.env.GITHUB_REPOSITORY
  const token = options.token ?? process.env.GITHUB_TOKEN
  const runId = Number(options.runId ?? process.env.REVISION_WORKFLOW_RUN_ID)
  if (!repository || !token || !Number.isSafeInteger(runId) || runId <= 0) {
    throw new Error('Repository, read-only token and CI run ID are required')
  }

  const api = options.apiUrl ?? process.env.GITHUB_API_URL ?? 'https://api.github.com'
  const root = api + '/repos/' + repository
  const run = await fetchJson(root + '/actions/runs/' + runId, token)
  if (!allowedRun(run) || !run.pull_requests?.[0]?.number) {
    return { state: 'ignored', reason: 'not_supported_ci_event', runId }
  }

  const prNumber = run.pull_requests[0].number
  const pr = await fetchJson(root + '/pulls/' + prNumber, token)
  if (pr.head?.repo?.full_name !== repository) {
    return { state: 'ignored', reason: 'non_local_pr', runId, prNumber }
  }
  if (!pr.labels?.some((label) => label?.name === pilotLabel)) {
    return { state: 'ignored', reason: 'pilot_label_missing', runId, prNumber }
  }

  const [ciPayload, main, jobsPayload] = await Promise.all([
    fetchJson(root + '/actions/workflows/ci.yml/runs?event=pull_request&head_sha=' + encodeURIComponent(run.head_sha) + '&per_page=50', token),
    fetchJson(root + '/branches/main', token),
    fetchJson(root + '/actions/runs/' + runId + '/jobs?per_page=100', token),
  ])
  const candidates = ciPayload.workflow_runs ?? []
  const latestRun = [...candidates]
    .filter((candidate) => candidate.head_sha === run.head_sha)
    .sort((a, b) => (b.id - a.id) || (b.run_attempt - a.run_attempt))[0]

  const result = classifyContinuation({
    run, pr, latestRun, jobs: jobsPayload.jobs ?? [], mainSha: main?.commit?.sha,
  })
  const evidence = {
    ...result,
    prNumber,
    headSha: run.head_sha,
    mainSha: main?.commit?.sha ?? null,
    runId,
    runAttempt: run.run_attempt,
    ciUrl: run.html_url,
    prUrl: pr.html_url,
    observedAt: new Date().toISOString(),
    proofOnly: true,
    agentExecuted: false,
    approvalGiven: false,
  }
  writeFileSync('engineering-continuation-proof.json', JSON.stringify(evidence, null, 2) + '\n')
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '## Event-driven engineering proof\n\n' +
      '- PR: #' + prNumber + '\n' +
      '- Exact head: ' + run.head_sha + '\n' +
      '- Latest CI: ' + runId + '\n' +
      '- Decision: ' + result.state + '\n' +
      '- No PR code executed; no repository changes, approvals or notifications issued.\n')
  }
  return evidence
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runProof()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
