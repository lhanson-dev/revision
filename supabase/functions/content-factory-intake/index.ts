import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.111.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function buildIssueBody(job: Record<string, unknown>) {
  return [
    "# Revision Content Factory job",
    "",
    `**Job:** ${job.jobId}`,
    "**Course:** Course identity pending",
    "**State:** `requested`",
    "",
    "This issue is the durable operational record for the Content Factory. It is not educational authority, publication approval or merge approval.",
    "",
    "<!-- revision-content-factory-job:v1 -->",
    "```json",
    JSON.stringify(job, null, 2),
    "```",
    "",
  ].join("\n")
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" })

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const githubToken = Deno.env.get("GITHUB_CONTENT_FACTORY_TOKEN")
  const githubRepo = Deno.env.get("GITHUB_CONTENT_FACTORY_REPO") ?? "lhanson-dev/revision"
  const authorization = req.headers.get("Authorization")

  if (!supabaseUrl || !supabaseAnonKey) return jsonResponse(503, { error: "Supabase function environment is incomplete" })
  if (!githubToken) return jsonResponse(503, { error: "Content Factory GitHub integration is not configured" })
  if (!authorization) return jsonResponse(401, { error: "Authentication required" })

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user
  if (userError || !user) return jsonResponse(401, { error: "Authentication required" })

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()

  if (profileError) return jsonResponse(500, { error: "Admin access could not be verified" })
  if (profile?.is_admin !== true) return jsonResponse(403, { error: "Admin access required" })

  let input: { officialUrl?: unknown; notes?: unknown }
  try {
    input = await req.json()
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" })
  }

  if (typeof input.officialUrl !== "string") return jsonResponse(400, { error: "Official awarding-body URL is required" })
  if (input.notes !== undefined && typeof input.notes !== "string") return jsonResponse(400, { error: "Optional instruction must be text" })

  let officialUrl: URL
  try {
    officialUrl = new URL(input.officialUrl)
  } catch {
    return jsonResponse(400, { error: "Official awarding-body URL is invalid" })
  }

  if (officialUrl.protocol !== "https:" || officialUrl.username || officialUrl.password) {
    return jsonResponse(400, { error: "Use a normal HTTPS awarding-body URL" })
  }

  const notes = typeof input.notes === "string" ? input.notes.trim() : ""
  if (notes.length > 2000) return jsonResponse(400, { error: "Optional instruction must be 2000 characters or fewer" })

  const timestamp = new Date().toISOString()
  const jobId = `cf-${crypto.randomUUID()}`
  const job = {
    schemaVersion: 1,
    jobId,
    officialUrls: [officialUrl.toString()],
    founderInstruction: notes || "Add this course to Revision using the approved content workflow.",
    state: "requested",
    components: [],
    unresolvedChoices: [],
    contentPackRefs: [],
    workUnits: [],
    workerRuns: [],
    blockers: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const githubResponse = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title: `Content Factory: ${jobId}`,
      body: buildIssueBody(job),
    }),
  })

  if (!githubResponse.ok) {
    console.error("GitHub issue creation failed", githubResponse.status, await githubResponse.text())
    return jsonResponse(502, { error: "Content Factory job could not be created in GitHub" })
  }

  const issue = await githubResponse.json() as { number?: number; html_url?: string }
  if (!issue.number || !issue.html_url) return jsonResponse(502, { error: "GitHub returned an incomplete job record" })

  return jsonResponse(201, {
    jobId,
    issueNumber: issue.number,
    issueUrl: issue.html_url,
  })
})
