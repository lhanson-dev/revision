import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './app/app.css'
import './app/guidance.css'
import './app/exam.css'
import './app/rev-home.css'
import './app/hierarchy.css'
import './app/course-exam.css'
import './app/content-operations.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Revision application root was not found.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
