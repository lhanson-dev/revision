import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/revision/',
  build: {
    rollupOptions: {
      // learn-fixtures.html is a dev-only page: it is built only when a test run asks for it.
      input: [
        'app/index.html',
        'foundation.html',
        'design-lab.html',
        ...(mode === 'learn-fixtures' ? ['learn-fixtures.html'] : []),
      ],
    },
  },
}))
