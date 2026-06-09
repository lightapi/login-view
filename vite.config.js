import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const apiBaseUrl = 'https://localhost'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    https: {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.pem'),
    },
    proxy: {
      '/api': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/portal/command': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/portal/query': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/google': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/facebook': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/github': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
        }
      }
    }
  }
})
