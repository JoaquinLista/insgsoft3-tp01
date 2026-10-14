import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/controllers/**', 'src/routes/**', 'src/services/**'],
      // src/index.js: arranque de Express (equivalente a Program.cs), sin reglas de negocio.
      // src/config/db.js: conexión a Postgres, infraestructura sin reglas de negocio.
      thresholds: { lines: 30, branches: 25 },
    },
  },
});
