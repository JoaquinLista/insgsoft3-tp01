import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',                // junta las dos suites; cada job del pipeline corre la suya por nombre de archivo
  timeout: 60_000,                  // tope de CADA test: generoso para las e2e, de sobra para los pedidos a la api
  expect: { timeout: 15_000 },      // tope de CADA aserción: no lo hereda del de arriba (el default es 5 s)
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost',   // el FRONT (puerto 80 en el compose del TP2). La api tiene la suya: API_BASE_URL
    trace: 'on-first-retry',         // la traza se graba en el retry de un fallo (los verdes no la generan)
    screenshot: 'only-on-failure',   // screenshot standalone de cada fallo en el reporte
  },
  retries: 1,                       // absorbe una demora suelta del free tier; si pasa recién ahí, sale "flaky"
  reporter: [['html', { open: 'never' }], ['list']],
})
