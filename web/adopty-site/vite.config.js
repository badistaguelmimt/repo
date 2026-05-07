import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) exige une fonction pour manualChunks
        manualChunks(id) {
          if (id.includes('node_modules/@clerk')) return 'clerk'
          if (id.includes('node_modules/framer-motion')) return 'animations'
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'router'
          if (id.includes('node_modules/react-dom')) return 'react-dom-vendor'
          if (id.includes('node_modules/react/')) return 'react-vendor'
        },
      },
    },
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})


