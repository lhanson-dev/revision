/** Durable raw exam drafts are a separately authorised pilot capability.
 * Caller MUST supply the user returned by Supabase Auth getUser(), not local
 * or browser-supplied metadata. Signed JWT app_metadata is also checked by RLS.
 */
export function verifiedRec10PilotUserId(
  user: { id: string; app_metadata?: Record<string, unknown> } | null | undefined,
  expectedUserId: string,
): string | null {
  return user?.id === expectedUserId && user.app_metadata?.revision_rec10_pilot === true
    ? user.id : null
}
