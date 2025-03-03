import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@styles': path.resolve(__dirname, './styles'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
  css: {
    devSourcemap: true,
  },
});
