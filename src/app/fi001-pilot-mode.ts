/** Retained for compatibility while the former planner-pilot prop is removed.
 * All signed-in learners use the programme-first planner and supported Exam Prep.
 * Access to private data is enforced by Supabase owner RLS, not this UI helper.
 */
export function fi001RestrictedContent(_pilotEnabled: boolean): boolean {
  void _pilotEnabled
  return false
}
