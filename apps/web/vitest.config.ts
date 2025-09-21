import { defineConfig } from 'vitest/config';
import path from 'node:path';

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'], 
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      // Allow "@/..." style imports
      '@': r('./'),
      '@/components': r('./components'),
      '@/lib': r('./lib'),
      '@/app': r('./app'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
