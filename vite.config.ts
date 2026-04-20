import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gps-tracking-app/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
