import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/iframe/',
  build: {
    outDir: '../../cirai-extension/iframe',
    emptyOutDir: true,
    assetsDir: '',
  },
  server: {
    port: 5173,
  },
})
