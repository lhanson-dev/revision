import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.111.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const githubRepo = "lhanson-dev/revision"
const learnerAppUrl = "https://lhanson-dev.github.io/revision/app/"

type HealthStatus = "Healthy" | "Attention needed" | "Unknown"

type HealthCheck = {
  id: string
  label: string
  status: HealthStatus
  detail: string
  action?: string
}

type FactoryJob = {
  jobId: string
  issueNumber: number
  issueUrl: string
  state: string
  blockers: number
  updatedAt: string
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function healthOverall(checks: HealthCheck[]): HealthStatus {
  if (checks.some((check) => check.status === "Attention needed")) return "Attention needed"
  if (checks.some((check) => check.status === "Unknown")) return "Unknown"
  return "Healthy"
}

function parseFactoryJob(issue: { number?: number; html_url?: string; body?: string | null; updated_at?: string }): FactoryJob | null {
  if (!issue.number || !issue.html_url || !issue.body?.includes("revision-content-factory-job:v1")) return null
  const match = issue.body.match(/```json\s*([\s\S]*?)```/)
  if (!match) return null

  try {
    const payload = JSON.parse(match[1]) as {
      jobId?: unknown
      state?: unknown
      blockers?: unknown
      updatedAt?: unknown
    }
    if (typeof payload.jobId !== "string" || typeof payload.state !== "string") return null
    return {
      jobId: payload.jobId,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      state: payload.state,
      blockers: Array.isArray(payload.blockers) ? payload.blockers.length : 0,
      updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : issue.updated_at ?? new Date(0).toISOString(),
    }
  } catch {
    return null
  }
}

async function loadFactoryJobs() {
  const githubToken = Deno.env.get("GITHUB_CONTENT_FACTORY_TOKEN")
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`

  const jobs: FactoryJob[] = []
  for (let page = 1; page <= 3; page += 1) {
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues?state=all&per_page=100&page=${page}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error(`GitHub issue visibility returned ${response.status}`)
    const issues = await response.json() as Array<{ number?: number; html_url?: string; body?: string | null; updated_at?: string; pull_request?: unknown }>
    for (const issue of issues) {
      if (issue.pull_request) continue
      const job = parseFactoryJob(issue)
      if (job) jobs.push(job)
    }
    if (issues.length < 100) break
  }

  jobs.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  return jobs
}

async function checkLearnerApp(): Promise<HealthCheck> {
  try {
    const response = await fetch(learnerAppUrl, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
      return { id: "learner-app", label: "Learner app", status: "Attention needed", detail: `Production /app/ returned HTTP ${response.status}.`, action: "Check the latest Pages deployment." }
    }
    const html = await response.text()
    if (!html.includes('<div id="root"></div>')) {
      return { id: "learner-app", label: "Learner app", status: "Attention needed", detail: "Production responded, but the canonical React app marker was not found.", action: "Check the Pages production artifact." }
    }
    return { id: "learner-app", label: "Learner app", status: "Healthy", detail: "The canonical production /app/ route is reachable." }
  } catch {
    return { id: "learner-app", label: "Learner app", status: "Unknown", detail: "Production reachability could not be checked from the operations service." }
  }
}

async function checkDeployment(): Promise<HealthCheck> {
  try {
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/actions/workflows/deploy-pages.yml/runs?branch=main&per_page=1`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return { id: "deployment", label: "Deployment", status: "Unknown", detail: "Latest deployment evidence could not be read from GitHub." }

    const payload = await response.json() as {
      workflow_runs?: Array<{ status?: string; conclusion?: string | null; head_sha?: string; updated_at?: string }>
    }
    const run = payload.workflow_runs?.[0]
    if (!run) return { id: "deployment", label: "Deployment", status: "Unknown", detail: "No main deployment run was available." }
    if (run.status !== "completed") return { id: "deployment", label: "Deployment", status: "Unknown", detail: "The latest main deployment is still running." }
    if (run.conclusion !== "success") {
      return { id: "deployment", label: "Deployment", status: "Attention needed", detail: `The latest main deployment finished with ${run.conclusion ?? "an unknown result"}.`, action: "Open the latest Pages workflow and diagnose the failed stage." }
    }
    const revision = run.head_sha?.slice(0, 7)
    return { id: "deployment", label: "Deployment", status: "Healthy", detail: `Latest main deployment and production smoke passed${revision ? ` for ${revision}` : ""}.` }
  } catch {
    return { id: "deployment", label: "Deployment", status: "Unknown", detail: "Latest deployment evidence could not be checked from the operations service." }
  }
}

async function checkContentFactory(supabaseUrl: string, anonKey: string, authorization: string): Promise<HealthCheck> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/content-factory-intake`, {
      method: "GET",
      headers: {
        Authorization: authorization,
        apikey: anonKey,
      },
      signal: AbortSignal.timeout(5000),
    })
    if (response.status === 404) {
      return { id: "content-factory", label: "Content Factory", status: "Attention needed", detail: "The Content Factory intake function is not deployed.", action: "Deploy the approved content-factory-intake function." }
    }
    if (!response.ok) {
      return { id: "content-factory", label: "Content Factory", status: "Attention needed", detail: `Content Factory health returned HTTP ${response.status}.`, action: "Check the intake function deployment and configuration." }
    }
    const payload = await response.json() as { status?: string; githubConfigured?: boolean }
    if (payload.status !== "ready" || payload.githubConfigured !== true) {
      return { id: "content-factory", label: "Content Factory", status: "Attention needed", detail: "The intake function is deployed but its GitHub job integration is not configured.", action: "Configure the least-privilege Content Factory GitHub secret." }
    }
    return { id: "content-factory", label: "Content Factory", status: "Healthy", detail: "Course intake is deployed and the GitHub job integration is configured." }
  } catch {
    return { id: "content-factory", label: "Content Factory", status: "Unknown", detail: "Content Factory readiness could not be checked." }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" })

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const authorization = req.headers.get("Authorization")

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return jsonResponse(503, { error: "Operations environment is incomplete" })
  if (!authorization) return jsonResponse(401, { error: "Authentication required" })

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userError } = await userClient.auth.getUser()
  const user = userData.user
  if (userError || !user) return jsonResponse(401, { error: "Authentication required" })

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()

  if (profileError) return jsonResponse(500, { error: "Admin access could not be verified" })
  if (profile?.is_admin !== true) return jsonResponse(403, { error: "Admin access required" })

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: metrics, error: metricsError } = await adminClient.rpc("admin_operations_metrics")
  if (metricsError || !metrics) {
    console.error("Admin metrics query failed", metricsError?.message)
    return jsonResponse(503, { error: "Operations metrics are not available" })
  }

  const checks: HealthCheck[] = [
    { id: "authentication", label: "Authentication", status: "Healthy", detail: "Authenticated admin access was verified through Supabase Auth." },
    { id: "database", label: "Database", status: "Healthy", detail: "Operational metrics were read successfully from the production database." },
    { id: "learning-data", label: "Learning data", status: "Healthy", detail: "Learner evidence storage is readable by the protected operations service." },
  ]

  const [learnerApp, deployment, contentFactory, factoryResult] = await Promise.all([
    checkLearnerApp(),
    checkDeployment(),
    checkContentFactory(supabaseUrl, supabaseAnonKey, authorization),
    loadFactoryJobs().then((jobs) => ({ jobs, error: null as string | null })).catch((error: unknown) => ({ jobs: [] as FactoryJob[], error: error instanceof Error ? error.message : "GitHub job visibility failed" })),
  ])
  checks.push(learnerApp, deployment, contentFactory)

  const jobs = factoryResult.jobs
  const terminalStates = new Set(["benchmark_approved"])
  const blocked = jobs.filter((job) => job.state === "blocked" || job.blockers > 0).length
  const readyForFounderAction = jobs.filter((job) => job.state === "ready_for_founder_merge_approval").length
  const inProgress = jobs.filter((job) => !terminalStates.has(job.state)).length

  return jsonResponse(200, {
    generatedAt: new Date().toISOString(),
    users: (metrics as { users?: unknown }).users,
    activity: (metrics as { activity?: unknown }).activity,
    content: {
      jobsKnown: factoryResult.error === null,
      jobsTotal: jobs.length,
      jobsInProgress: inProgress,
      blockedJobs: blocked,
      readyForFounderAction,
      jobs: jobs.slice(0, 12),
      visibilityMessage: factoryResult.error,
    },
    health: {
      overall: healthOverall(checks),
      checks,
      needsAttention: checks.filter((check) => check.status === "Attention needed"),
      unknownCount: checks.filter((check) => check.status === "Unknown").length,
    },
  })
})