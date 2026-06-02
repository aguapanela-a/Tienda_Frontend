import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/clientes': 'http://localhost:8087',
      '/montos': 'http://localhost:8087',
    },
  },
})
