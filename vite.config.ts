import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests to the data endpoint
      // This will redirect requests like /2025/03/20/volume_profile_strategy.json
      // to https://result.strat.nileverest.co/strategy/2025/03/20/volume_profile_strategy.json
      '^/(\\d{4}/\\d{2}/\\d{2}/.*\\.json)$': {
        target: 'https://result.strat.nileverest.co',
        changeOrigin: true,
        rewrite: (path) => `/strategy${path}`,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
