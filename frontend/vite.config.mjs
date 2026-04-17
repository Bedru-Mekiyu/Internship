import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: backendTarget, changeOrigin: true },
      '/uploads': { target: backendTarget, changeOrigin: true },
      '/socket.io': { target: backendTarget, changeOrigin: true, ws: true },
    },
  },
});
