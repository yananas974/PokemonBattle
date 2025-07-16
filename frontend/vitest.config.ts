import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./app/tests/setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'app/tests/',
        '**/*.test.{ts,tsx}',
        'build/',
        'app/entry.client.tsx',
        'app/entry.server.tsx'
      ]
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  }
});