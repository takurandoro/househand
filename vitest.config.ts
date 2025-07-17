import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // Resolving alias '@' to 'src' directory
    },
  },
  test: {
    environment: 'jsdom',  // Set the test environment to jsdom for React tests
    setupFiles: ['./src/tests/setup.ts'],  // Optional setup file for global imports
    globals: true,  // Enable globals like describe, it, expect, etc.
    include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx'],  // Ensure test files are included
  },
});
