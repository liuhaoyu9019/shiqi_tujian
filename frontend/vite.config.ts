import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import devServerPlugin from './dev-server'

export default defineConfig({
  plugins: [react(), devServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
