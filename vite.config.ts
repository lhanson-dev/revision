import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/revision/',
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'app/index.html'),
        foundation: resolve(__dirname, 'foundation.html'),
      },
    },
  },
})
