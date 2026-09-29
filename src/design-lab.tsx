import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthGate } from './app/AuthGate'
import { DesignLab } from './app/DesignLab'
import { supabase } from './services/supabase/browser-client'
import './app/brand-tokens.css'
import './app/app.css'
import './app/auth-entry.css'
import './app/interface-system.css'
import './app/ui/ui-components.css'
import './app/living-e.css'
import './app/living-e-accessibility.css'
import './app/learn-reading.css'
import './app/interactive-component-quality.css'
import './app/design-lab.css'

type AccessState = 'checking' | 'allowed' | 'denied' | 'error'

function DesignLabAccessGate() {
  const [access, setAccess] = useState<AccessState>('checking')

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const user = data.session?.user
      if (!user) {
        setAccess('denied')
        return
      }

      const { data: profile, error } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
      if (!active) return
      if (error) {
        setAccess('error')
        return
      }
      setAccess(profile?.is_admin === true ? 'allowed' : 'denied')
    })

    return () => { active = false }
  }, [])

  if (access === 'checking') return <main className="loading-shell">Checking Design Lab access…</main>

  if (access === 'error') {
    return (
      <main className="loading-shell">
        <section className="auth-card" aria-labelledby="design-lab-error-title">
          <p className="eyebrow">Design Lab</p>
          <h1 id="design-lab-error-title">Access could not be verified</h1>
          <p className="intro">Revision could not confirm the protected Admin role. Return to the learner app and try again.</p>
          <a className="secondary-link" href="/revision/app/#/home">Return to Revision</a>
        </section>
      </main>
    )
  }

  if (access === 'denied') {
    return (
      <main className="loading-shell">
        <section className="auth-card" aria-labelledby="design-lab-denied-title">
          <p className="eyebrow">Design Lab</p>
          <h1 id="design-lab-denied-title">Admin access required</h1>
          <p className="intro">This review surface is not part of the learner experience and is available only to an authorised Revision administrator.</p>
          <a className="secondary-link" href="/revision/app/#/home">Return to Revision</a>
        </section>
      </main>
    )
  }

  return <DesignLab />
}

const root = document.getElementById('root')

if (!root) throw new Error('Revision Design Lab root was not found.')

createRoot(root).render(
  <StrictMode>
    <AuthGate>
      <DesignLabAccessGate />
    </AuthGate>
  </StrictMode>,
)
