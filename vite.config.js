import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Project Pages URL: https://al4576.github.io/dissecting-llm/ — assets must load under /dissecting-llm/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/dissecting-llm/' : '/',
}))
