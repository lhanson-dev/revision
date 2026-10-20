/**
 * FI-001 controlled rollout: an Auth-service verified account with an
 * administrator-managed app_metadata claim may receive the new programme.
 * This is feature exposure, not a bypass of Supabase owner RLS or a credential.
 */
export function verifiedFi001PilotUserId(
  user: { id: string; app_metadata?: Record<string, unknown> } | null | undefined,
  expectedUserId: string,
): string | null {
  if (!user || user.id !== expectedUserId || user.app_metadata?.revision_fi001_pilot !== true) return null
  return user.id
}
