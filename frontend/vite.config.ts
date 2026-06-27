import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Proxy : toutes les routes API → backend-siege
    // En Docker : VITE_API_URL est injecté, proxy inutile
    // En dev local : proxy vers localhost:8000
    proxy: {
      '/auth':          { target: 'http://localhost:8000', changeOrigin: true },
      '/consolidated':  { target: 'http://localhost:8000', changeOrigin: true },
      '/warehouses':    { target: 'http://localhost:8000', changeOrigin: true },
      '/exploitations': { target: 'http://localhost:8000', changeOrigin: true },
      '/stats':         { target: 'http://localhost:8000', changeOrigin: true },
      '/health':        { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})