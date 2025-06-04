import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.ELECTRON ? './' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3001,
    strictPort: true,
    host: '127.0.0.1',
    hmr: {
      port: 3001
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'crypto',
        'stream',
        'http',
        'https',
        'zlib',
        'url',
        'util',
        'buffer',
        'os',
        'child_process',
        'net',
        'tls',
        'dns',
        'dgram',
        'cluster',
        'module',
        'assert',
        'constants',
        'events',
        'querystring',
        'string_decoder',
        'timers',
        'tty',
        'vm',
        'worker_threads',
        'googleapis',
        'electron-store',
        'open'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'electron',
      'googleapis',
      'path',
      'fs',
      'crypto',
      'stream',
      'http',
      'https',
      'zlib',
      'url',
      'util',
      'buffer',
      'electron-store',
      'open'
    ],
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material']
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      ELECTRON: JSON.stringify(process.env.ELECTRON),
      VITE_API_URL: JSON.stringify(process.env.VITE_API_URL),
      VITE_GOOGLE_CLIENT_ID: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
      VITE_GOOGLE_CLIENT_SECRET: JSON.stringify(process.env.VITE_GOOGLE_CLIENT_SECRET),
      VITE_REDIRECT_URI: JSON.stringify(process.env.VITE_REDIRECT_URI)
    },
    'global': 'globalThis'
  }
}); 