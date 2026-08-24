import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.111.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const learnerPlanTiers = new Set(["free", "paid", "premium"])

type LearnerPlanTier = "free" | "paid" | "premium"

type RequestBody = {
  action?: unknown
  targetUserId?: unknown
  tier?: unknown
}

type PlanRow = {
  user_id: string
  tier: LearnerPlanTier
  assignment_source: string
  assigned_by: string | null
  created_at: string
  updated_at: string
}

type ProfileRow = {
  user_id: string
  is_admin: boolean
  is_test_user: boolean
}

type AssignmentEventRow = {
  user_id: string
  previous_tier: LearnerPlanTier | null
  tier: LearnerPlanTier
  assigned_by: string | null
  occurred_at: string
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function isUuid(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isLearnerPlanTier(value: unknown): value is LearnerPlanTier {
  return typeof value === "string" && learnerPlanTiers.has(value)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" })

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const authorization = req.headers.get("Authorization")

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(503, { error: "Learner plan operations environment is incomplete" })
  }
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

  let body: RequestBody = {}
  try {
    body = await req.json() as RequestBody
  } catch {
    body = {}
  }

  const action = typeof body.action === "string" ? body.action : "summary"

  if (action === "assign") {
    if (!isUuid(body.targetUserId)) return jsonResponse(400, { error: "A valid targetUserId is required" })
    if (!isLearnerPlanTier(body.tier)) return jsonResponse(400, { error: "Tier must be free, paid or premium" })

    const { data: targetUserData, error: targetUserError } = await adminClient.auth.admin.getUserById(body.targetUserId)
    if (targetUserError || !targetUserData.user) return jsonResponse(404, { error: "Target user was not found" })

    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("profiles")
      .select("user_id,is_admin")
      .eq("user_id", body.targetUserId)
      .single()

    if (targetProfileError || !targetProfile) return jsonResponse(409, { error: "Target user does not have a valid Revision profile" })
    if (targetProfile.is_admin === true) return jsonResponse(409, { error: "Admin accounts are not learner plan assignment targets" })

    const { data: assignmentRows, error: assignmentError } = await adminClient.rpc("assign_learner_plan", {
      p_user_id: body.targetUserId,
      p_tier: body.tier,
      p_assigned_by: user.id,
    })

    const assignment = Array.isArray(assignmentRows) ? assignmentRows[0] as PlanRow | undefined : undefined
    if (assignmentError || !assignment) {
      console.error("Learner plan assignment failed", assignmentError?.message)
      return jsonResponse(503, { error: "Learner plan assignment could not be completed" })
    }

    return jsonResponse(200, {
      action: "assign",
      assignment: {
        userId: assignment.user_id,
        tier: assignment.tier,
        assignmentSource: assignment.assignment_source,
        assignedBy: assignment.assigned_by,
        updatedAt: assignment.updated_at,
      },
    })
  }

  if (action !== "summary") return jsonResponse(400, { error: "Unsupported learner plan operation" })

  const [profilesResult, plansResult, eventsResult] = await Promise.all([
    adminClient.from("profiles").select("user_id,is_admin,is_test_user"),
    adminClient.from("learner_plan_state").select("user_id,tier,assignment_source,assigned_by,created_at,updated_at"),
    adminClient.from("learner_plan_assignment_events")
      .select("user_id,previous_tier,tier,assigned_by,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(20),
  ])

  if (profilesResult.error || plansResult.error || eventsResult.error) {
    console.error(
      "Learner plan summary failed",
      profilesResult.error?.message,
      plansResult.error?.message,
      eventsResult.error?.message,
    )
    return jsonResponse(503, { error: "Learner plan assurance is not available" })
  }

  const profiles = (profilesResult.data ?? []) as ProfileRow[]
  const plans = (plansResult.data ?? []) as PlanRow[]
  const events = (eventsResult.data ?? []) as AssignmentEventRow[]
  const learnerIds = new Set(
    profiles
      .filter((row) => row.is_admin !== true && row.is_test_user !== true)
      .map((row) => row.user_id),
  )
  const learnerPlans = plans.filter((row) => learnerIds.has(row.user_id))
  const plannedLearnerIds = new Set(learnerPlans.map((row) => row.user_id))
  const byTier = { free: 0, paid: 0, premium: 0 }
  for (const plan of learnerPlans) byTier[plan.tier] += 1

  return jsonResponse(200, {
    generatedAt: new Date().toISOString(),
    plans: {
      learners: learnerIds.size,
      byTier,
      missingOrInvalid: [...learnerIds].filter((id) => !plannedLearnerIds.has(id)).length,
      recentManualAssignments: events
        .filter((event) => learnerIds.has(event.user_id))
        .map((event) => ({
          userId: event.user_id,
          previousTier: event.previous_tier,
          tier: event.tier,
          assignedBy: event.assigned_by,
          occurredAt: event.occurred_at,
        })),
    },
  })
})
