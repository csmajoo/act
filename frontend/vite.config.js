import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/act/',
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: ['react-is'],
      output: {
        globals: {
          'react-is': 'ReactIs'
        }
      }
    }
  }
})
