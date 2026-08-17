import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './app/app.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Revision application root was not found.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
