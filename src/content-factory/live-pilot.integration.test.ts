import { afterAll, describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { GitHubIssueJobStore, type ContentFactoryIssueClient } from './github-issue-job-store'
import { runAqaAsBusiness7131LivePilot } from './live-pilot'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_LIVE_PILOT === '1'
const evidenceDirectory = '.artifacts/content-factory-live-pilot'
const livePilotTestTimeoutMs = 30 * 60 * 1000

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function githubHeaders(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function githubJson<T>(input: { token: string; url: string; method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(input.url, {
    method: input.method ?? 'GET',
    headers: githubHeaders(input.token),
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`GitHub API ${input.method ?? 'GET'} ${input.url} failed with HTTP ${response.status}: ${text.slice(0, 500)}`)
  return (text ? JSON.parse(text) : undefined) as T
}

function issueClient(repo: string, token: string): ContentFactoryIssueClient {
  const base = `https://api.github.com/repos/${repo}/issues`
  return {
    async createIssue(input) {
      return githubJson<{ number: number }>({ token, url: base, method: 'POST', body: input })
    },
    async getIssue(issueNumber) {
      return githubJson<{ number: number; body: string | null }>({ token, url: `${base}/${issueNumber}` })
    },
    async updateIssue(issueNumber, input) {
      await githubJson({ token, url: `${base}/${issueNumber}`, method: 'PATCH', body: input })
    },
  }
}

async function addIssueComment(repo: string, token: string, issueNumber: number, body: string) {
  await githubJson({ token, url: `https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, method: 'POST', body: { body } })
}

async function createConfigurationBlocker(repo: string, token: string, missing: string[]) {
  const issue = await githubJson<{ number: number }>({
    token,
    url: `https://api.github.com/repos/${repo}/issues`,
    method: 'POST',
    body: {
      title: 'Content Factory live pilot: configuration blocker',
      body: [
        '# Content Factory live adapter pilot blocker',
        '',
        'The manual live-pilot workflow stopped before model execution because required server-side runtime configuration is missing.',
        '',
        `Missing: ${missing.join(', ')}`,
        '',
        'No learner content was published and no source material was sent to a model.',
      ].join('\n'),
    },
  })
  await addIssueComment(repo, token, 169, `Live adapter pilot configuration blocker recorded in #${issue.number}: ${missing.join(', ')}.`)
  return issue.number
}

afterAll(async () => {
  if (liveEnabled) await mkdir(evidenceDirectory, { recursive: true })
})

describe('Content Factory v2 live adapter pilot', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('runs AQA AS Business 7131 to expert_review_ready with real provider provenance', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const headSha = requiredEnv('CONTENT_FACTORY_CONTENT_HEAD_SHA')
    const missing = ['OPENAI_API_KEY'].filter((name) => !env[name]?.trim())
    if (missing.length > 0) {
      await createConfigurationBlocker(repo, token, missing)
      throw new Error(`provider_secret_missing_or_runtime_config_missing:${missing.join(',')}`)
    }
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 20)
    const now = new Date().toISOString()
    const jobId = `aqa-as-business-7131-live-${headSha.slice(0, 12)}-${Date.now()}`

    const result = await runAqaAsBusiness7131LivePilot({
      jobId,
      contentHeadSha: headSha,
      now,
      openAI: {
        apiKey,
        maxSpendUsd,
        generation: {
          model: env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra',
          inputUsdPerMillion: 2,
          cachedInputUsdPerMillion: 0.2,
          outputUsdPerMillion: 12,
          cacheWriteMultiplier: 1.25,
          longContextThresholdTokens: 272_000,
          longContextInputMultiplier: 2,
          longContextOutputMultiplier: 1.5,
          reasoningEffort: 'medium',
          maxOutputTokens: 8_000,
        },
        independentReview: {
          model: env.CONTENT_FACTORY_REVIEW_MODEL?.trim() || 'gpt-5.6-sol',
          inputUsdPerMillion: 4,
          cachedInputUsdPerMillion: 0.4,
          outputUsdPerMillion: 20,
          cacheWriteMultiplier: 1.25,
          longContextThresholdTokens: 272_000,
          longContextInputMultiplier: 2,
          longContextOutputMultiplier: 1.5,
          reasoningEffort: 'high',
          maxOutputTokens: 12_000,
        },
        maxRetries: 2,
      },
    })

    const store = new GitHubIssueJobStore(issueClient(repo, token))
    const durable = await store.create(result.job)
    const evidence = {
      schemaVersion: 1,
      artifactType: 'content_factory_live_adapter_pilot_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      contentHeadSha: headSha,
      configuredMaxSpendUsd: maxSpendUsd,
      jobIssueNumber: durable.issueNumber,
      job: result.job,
      report: result.report,
      expertReviewPackage: result.package,
      artifacts: result.artifactStore.exportArtifacts(),
    }
    await mkdir(evidenceDirectory, { recursive: true })
    await writeFile(`${evidenceDirectory}/${jobId}.json`, JSON.stringify(evidence, null, 2), 'utf-8')

    const routes = result.report.providerRoutes.map((route) => `${route.provider}:${route.model ?? 'unversioned'} (${route.runCount} runs)`).join(', ')
    await addIssueComment(repo, token, 169, [
      'Content Factory v2 live adapter pilot completed.',
      '',
      `- Job issue: #${durable.issueNumber}`,
      `- Exact content head: \`${headSha}\``,
      `- Final state: \`${result.job.state}\``,
      `- Reached expert_review_ready: **${result.report.reachedExpertReviewReady ? 'yes' : 'no'}**`,
      `- Observed model cost: **$${result.report.observedUsageCost.toFixed(4)}**`,
      `- Configured per-course ceiling: **$${maxSpendUsd.toFixed(2)}**`,
      `- Total retries: **${result.report.totalRetries}**`,
      `- Human interventions: **${result.report.humanInterventionCount}**`,
      `- Provider routes: ${routes || 'none'}`,
      '',
      'The workflow does not publish learner content. AQA remained REFERENCE_ONLY throughout the run.',
    ].join('\n'))

    expect(result.report.proofMode).toBe('live_adapter')
    expect(result.report.reachedExpertReviewReady).toBe(true)
    expect(result.job.state).toBe('expert_review_ready')
    expect(result.report.providerRoutes.some((route) => route.provider === 'openai')).toBe(true)
    expect(result.report.observedUsageCost).toBeLessThanOrEqual(maxSpendUsd)
    expect(result.report.unpricedWorkerRunCount).toBeGreaterThanOrEqual(0)
    if (!result.report.reachedExpertReviewReady) {
      throw new Error(`Live pilot did not reach expert_review_ready; state=${result.job.state}; blockers=${result.job.blockers.map((blocker) => blocker.reason).join(' | ')}`)
    }
  }, livePilotTestTimeoutMs)
})