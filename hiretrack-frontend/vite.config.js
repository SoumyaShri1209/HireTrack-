import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env vars from .env / .env.local so they are available here at config time
  const env = loadEnv(mode, process.cwd(), '')

  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'
  // Extract just the hostname for cookieDomainRewrite
  const backendHost = new URL(backendUrl).hostname

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          // Rewrite cookie domain so refresh token cookie works through proxy
          cookieDomainRewrite: backendHost,
        },
      },
    },
  }
})
