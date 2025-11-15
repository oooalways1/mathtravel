import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProduction = process.env.NODE_ENV === 'production'
const isVercel = Boolean(process.env.VERCEL)

// GitHub Pages에서만 하위 경로 사용, Vercel 등 일반 호스팅은 루트(/)
const basePath = isProduction && !isVercel ? '/251106-vibe/' : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
