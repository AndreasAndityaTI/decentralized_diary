import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/nmkr': {
        target: 'https://studio-api.preprod.nmkr.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nmkr/, ''),
        secure: true
      }
    }
  },
  define: {
    'process.env': {}
  },
})