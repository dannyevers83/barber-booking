// ─── Imports ────────────────────────────────────────────────────────────
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// ─── Vite configuration ────────────────────────────────────────────────
export default defineConfig({
  // ─── Plugins ──────────────────────────────────────────────────────────
  plugins: [react(), tailwindcss()],
  // ─── Source alias ─────────────────────────────────────────────────────
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // ─── Development API proxy ────────────────────────────────────────────
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
