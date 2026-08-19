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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" })

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const authorization = req.headers.get("Authorization")

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(503, { error: "Planner operations environment is incomplete" })
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
  const { data: planner, error: plannerError } = await adminClient.rpc("admin_planner_metrics")
  if (plannerError || !planner) {
    console.error("Planner metrics query failed", plannerError?.message)
    return jsonResponse(503, { error: "Planner operations metrics are not available" })
  }

  return jsonResponse(200, {
    generatedAt: new Date().toISOString(),
    planner,
  })
})
