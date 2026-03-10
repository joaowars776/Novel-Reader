import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    }
  },
  build: {
    target: 'es2022',
  },
  worker: {
    format: 'es'
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
});
