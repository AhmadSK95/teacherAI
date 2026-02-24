import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@teachassist/schemas': path.resolve(__dirname, '../../packages/schemas/src/index.ts'),
      '@teachassist/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@teachassist/prompts': path.resolve(__dirname, '../../packages/prompts/src/index.ts'),
      '@teachassist/worker': path.resolve(__dirname, '../worker/src/index.ts'),
    },
  },
});
