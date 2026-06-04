import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  sourcemap: true,
  minify: false,
  noExternal: [/@repo\/shared/], // Bundle internal workspace packages
  shims: true, // Enable shims for __dirname and __filename in ESM
});
