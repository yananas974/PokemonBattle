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
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'app/tests/',
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'build/',
        'app/entry.client.tsx',
        'app/entry.server.tsx',
        'app/tailwind.css',
        'app/styles/**',
        '**/types/**'
      ],
      include: [
        'app/**/*.{ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'app/hooks/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'app/services/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        'app/utils/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  }
});