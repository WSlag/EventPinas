import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('firebase')) return 'firebase-vendor'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router-vendor'
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
