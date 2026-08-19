import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthGate } from './app/AuthGate'
import { PlannerRuntime } from './app/PlannerRuntime'
import './app/app.css'
import './app/auth-entry.css'
import './app/guidance.css'
import './app/exam.css'
import './app/rev-home.css'
import './app/hierarchy.css'
import './app/course-exam.css'
import './app/content-operations.css'
import './app/admin-operations-responsive.css'
import './app/planner.css'
import './app/planner-runtime.css'
import './app/planner-today.css'
import './app/planner-rev.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Revision application root was not found.')
}

createRoot(root).render(
  <StrictMode>
    <AuthGate>
      <PlannerRuntime />
    </AuthGate>
  </StrictMode>,
)
