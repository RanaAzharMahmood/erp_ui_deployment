/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Enable globals (describe, it, expect, etc.) without imports
    globals: true,
    // Use jsdom for DOM testing (React components)
    environment: 'jsdom',
    // Setup file for React Testing Library and other test utilities
    setupFiles: ['./src/test/setup.ts'],
    // Include test files patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.config.{js,ts}',
        'src/generated/**',
      ],
    },
    // CSS modules handling
    css: true,
    // Reporter configuration
    reporters: ['verbose'],
    // Watch mode settings
    watch: false,
    // Pool options for running tests
    pool: 'forks',
  },
  server: {
    port: 3000,
    open: true,
  },
})
