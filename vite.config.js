import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: true, // Automatically open browser
    host: true  // Allow external connections
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Enable @ imports
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true for debugging
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})