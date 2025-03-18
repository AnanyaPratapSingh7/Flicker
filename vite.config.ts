import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// Get proxy target from environment or default to localhost:3006 for Integration API
const proxyTarget = process.env.VITE_SERVER_PROXY_TARGET || 'http://localhost:3006';
console.log(`Vite proxy target: ${proxyTarget}`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
  ],
  server: {
    port: 3004,
    open: true,
    hmr: {
      overlay: false // Disable error overlay to prevent issues with URI errors
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Don't remove the /api prefix since the backend expects it
          return path;
        }
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
