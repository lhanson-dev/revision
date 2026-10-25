/**
 * Private-family admission proof, not an entitlement or an account flag.
 * The shared high-entropy code stays on-device. Supabase's Before User
 * Created hook validates the HMAC against a server-only secret. The derived
 * proof is bound to this email and a minute, becoming unusable very quickly.
 */
export async function privateSignupProof(code: string, email: string, nowMs: number = Date.now()):
  Promise<{ minute: number; signature: string }> {
  const normalizedCode = code.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[a-f0-9]{32}$/.test(normalizedCode) || !normalizedEmail.includes('@')) {
    throw new Error('Invalid private test signup inputs.')
  }
  const minute = Math.floor(nowMs / 60_000)
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(normalizedCode),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const input = new TextEncoder().encode(`revision:private-signup:v1:${normalizedEmail}:${minute}`)
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, input))
  return { minute, signature: [...digest].map((b) => b.toString(16).padStart(2, '0')).join('') }
}
