import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase/browser-client'
import { FirstUseGate } from './FirstUseGate'

/**
 * Accounts established before FI-021 was introduced must never be unexpectedly
 * forced through first-use onboarding. The migration durably seeds those
 * accounts as complete; this boundary is an additional compatibility guard so
 * the existing learner runtime does not acquire a new database dependency.
 *
 * Accounts created after this cutover are governed by account_experience_state
 * and must fail closed into the recoverable first-use experience if that state
 * cannot be loaded.
 */
export const FI_021_EXISTING_ACCOUNT_CUTOFF = '2026-08-24T21:23:00.000Z'

function predatesFirstUseOnboarding(user: User) {
  const createdAt = Date.parse(user.created_at)
  const cutoff = Date.parse(FI_021_EXISTING_ACCOUNT_CUTOFF)
  return Number.isFinite(createdAt) && createdAt < cutoff
}

export function FirstUseBoundary({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setResolved(true)
    })
    return () => { active = false }
  }, [])

  if (!resolved) return <main className="loading-shell">Loading Revision…</main>
  if (user && predatesFirstUseOnboarding(user)) return children
  return <FirstUseGate>{children}</FirstUseGate>
}
