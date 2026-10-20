import { expect, test } from '@playwright/test'

// La api de pedidos tiene su propia dirección (API_BASE_URL); el front, la suya
// (baseURL, de playwright.config.js). Las dos e2e usan `request` solo para leer datos
// reales de la base (sucursales/productos) y para la limpieza — nunca para mockear nada.
const API = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('e2e: la app de verdad, como la usa una persona', () => {
  test('crear un pedido lo muestra arriba de la lista, con origen, destino y producto correctos', async ({
    page,
    request,
  }) => {
    const sucursales = await (await request.get(`${API}/api/sucursales`)).json()
    const productos = await (await request.get(`${API}/api/productos`)).json()
    const [origen, destino] = sucursales
    const [producto] = productos

    await page.goto('/')
    await page.getByRole('button', { name: 'Tablero de Pedidos' }).click()

    await page.getByLabel('Sucursal de origen').selectOption(String(origen.id))
    await page.getByLabel('Sucursal de destino').selectOption(String(destino.id))
    await page.getByLabel('Producto').selectOption(String(producto.id))
    await page.getByLabel('Cantidad').fill('1')
    await page.getByRole('button', { name: 'Registrar pedido' }).click()

    await expect(page.getByText('Pedido registrado correctamente.')).toBeVisible()

    // La lista ordena por fecha de creación descendente: el que este test creó queda arriba.
    const filaNueva = page.locator('table tbody tr').first()
    await expect(filaNueva).toContainText(origen.nombre)
    await expect(filaNueva).toContainText(destino.nombre)
    await expect(filaNueva).toContainText(producto.nombre)

    // Limpieza: no hay botón de borrar (el dominio es de auditoría, TP7 §api.spec.js), así
    // que se cancela por api el pedido que este test creó, y se comprueba que valió.
    const id = (await filaNueva.locator('td').first().textContent())?.trim()
    const cancelado = await request.patch(`${API}/api/pedidos/${id}`, { data: { estado: 'CANCELADO' } })
    expect(cancelado.status()).toBe(200)
  })

  test('elegir la misma sucursal de origen y destino muestra el error, y no crea nada', async ({
    page,
    request,
  }) => {
    const sucursales = await (await request.get(`${API}/api/sucursales`)).json()
    const productos = await (await request.get(`${API}/api/productos`)).json()
    const [sucursal] = sucursales
    const [producto] = productos

    const antes = await (await request.get(`${API}/api/pedidos`)).json()

    await page.goto('/')
    await page.getByRole('button', { name: 'Tablero de Pedidos' }).click()

    await page.getByLabel('Sucursal de origen').selectOption(String(sucursal.id))
    await page.getByLabel('Sucursal de destino').selectOption(String(sucursal.id)) // la MISMA
    await page.getByLabel('Producto').selectOption(String(producto.id))
    await page.getByLabel('Cantidad').fill('1')
    await page.getByRole('button', { name: 'Registrar pedido' }).click()

    await expect(page.getByRole('alert')).toContainText('distintos') // el usuario ve el error…

    const despues = await (await request.get(`${API}/api/pedidos`)).json()
    expect(despues.length).toBe(antes.length) // …y la validación del front frenó ANTES de pegarle a la api
  })

  // La tercera, a elección: el flujo de todos los días del otro lado de la app — cargar
  // stock — y el que más toca la base (upsert real, no un alta descartable).
  test('cargar un insumo lo guarda con su stock, y se refleja en el estado de stock', async ({ page }) => {
    const nombre = `E2E ${Date.now()}` // único: no pisa otra corrida compartiendo QA

    await page.goto('/')
    await page.getByRole('button', { name: 'Stock e Insumos' }).click()

    await page.getByLabel('Nombre').fill(nombre)
    await page.getByLabel('Stock actual').fill('100')
    await page.getByLabel('Stock mínimo').fill('10')
    await page.getByLabel('Unidad de medida').fill('kg')
    await page.getByRole('button', { name: 'Guardar insumo' }).click()

    await expect(page.getByText('Insumo guardado correctamente.')).toBeVisible()

    const fila = page.locator('table tbody tr', { hasText: nombre })
    await expect(fila).toContainText('100')
    await expect(fila.locator('.badge-ok')).toBeVisible() // 100 > 10: por encima del mínimo
  })
})
