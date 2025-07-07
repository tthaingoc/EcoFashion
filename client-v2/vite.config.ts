import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Development configuration for EcoFashion v2
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    open: true,
    cors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/api': path.resolve(__dirname, './src/api'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
