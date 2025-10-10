/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/front-embed/',
  plugins: [react()],
  resolve: {
    alias: {
      '@pages': '/src/pages',
      src: '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
