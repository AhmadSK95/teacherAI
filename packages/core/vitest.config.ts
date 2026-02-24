import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@teachassist/schemas': path.resolve(__dirname, '../schemas/src/index.ts'),
      '@teachassist/prompts': path.resolve(__dirname, '../prompts/src/index.ts'),
    },
  },
});
