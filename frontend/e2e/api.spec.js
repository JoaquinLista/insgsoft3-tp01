import { expect, test } from '@playwright/test'

// La api tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:3000'

// Pide las sucursales y los productos reales (nada hardcodeado: los ids de la semilla
// cambian de entorno a entorno, y acá hablamos siempre con la base de verdad).
async function obtenerDosSucursales(request) {
  const r = await request.get(`${API}/api/sucursales`)
  expect(r.status()).toBe(200)
  const sucursales = await r.json()
  expect(sucursales.length).toBeGreaterThanOrEqual(2)
  return [sucursales[0], sucursales[1]]
}

async function obtenerUnProducto(request) {
  const r = await request.get(`${API}/api/productos`)
  expect(r.status()).toBe(200)
  const productos = await r.json()
  expect(productos.length).toBeGreaterThanOrEqual(1)
  return productos[0]
}

async function buscarPedido(request, id) {
  const r = await request.get(`${API}/api/pedidos`)
  expect(r.status()).toBe(200)
  const pedidos = await r.json()
  return pedidos.find((p) => p.id === id)
}

test.describe('integración: la api de pedidos contra su base de verdad en QA', () => {
  test('el alta guarda en la base, y cancelarlo cambia su estado persistido', async ({ request }) => {
    const [origen, destino] = await obtenerDosSucursales(request)
    const producto = await obtenerUnProducto(request)

    const alta = await request.post(`${API}/api/pedidos`, {
      data: {
        sucursal_origen_id: origen.id,
        sucursal_destino_id: destino.id,
        detalles: [{ producto_id: producto.id, cantidad: 1 }],
      },
    })
    expect(alta.status()).toBe(201) // la api dice "creado"
    const creado = await alta.json()
    expect(creado.estado).toBe('PENDIENTE')

    const encontrado = await buscarPedido(request, creado.id) // y la BASE lo devuelve: no es un doble
    expect(encontrado?.estado).toBe('PENDIENTE')

    // El dominio de pedidos es de auditoría: no hay DELETE, un pedido llega a un estado
    // terminal. La "limpieza" de lo que este test crea es cancelarlo, comprobando que
    // el cambio quedó en la base y no en un mock.
    const cancelado = await request.patch(`${API}/api/pedidos/${creado.id}`, {
      data: { estado: 'CANCELADO' },
    })
    expect(cancelado.status()).toBe(200)

    const final = await buscarPedido(request, creado.id)
    expect(final?.estado).toBe('CANCELADO')
  })

  test('un pedido sin detalles lo rechaza la api, y no crea nada', async ({ request }) => {
    const [origen, destino] = await obtenerDosSucursales(request)

    const antes = await request.get(`${API}/api/pedidos`)
    const cantidadAntes = (await antes.json()).length

    const alta = await request.post(`${API}/api/pedidos`, {
      data: { sucursal_origen_id: origen.id, sucursal_destino_id: destino.id, detalles: [] },
    })
    expect(alta.status()).toBe(400) // el contrato del error

    const despues = await request.get(`${API}/api/pedidos`)
    expect((await despues.json()).length).toBe(cantidadAntes) // de verdad no se creó nada
  })

  // La tercera prueba, a elección: la máquina de estados (HU-08/HU-10) vive en la base,
  // no en un doble. Un unitario con mock daría verde igual aunque el `cambiarEstado` real
  // estuviera roto, porque un doble no conoce la tabla de transiciones real.
  test('saltar un estado (PENDIENTE -> ENTREGADO) lo rechaza la base', async ({ request }) => {
    const [origen, destino] = await obtenerDosSucursales(request)
    const producto = await obtenerUnProducto(request)

    const alta = await request.post(`${API}/api/pedidos`, {
      data: {
        sucursal_origen_id: origen.id,
        sucursal_destino_id: destino.id,
        detalles: [{ producto_id: producto.id, cantidad: 1 }],
      },
    })
    const creado = await alta.json()

    const salto = await request.patch(`${API}/api/pedidos/${creado.id}`, {
      data: { estado: 'ENTREGADO' },
    })
    expect(salto.status()).toBe(409) // la transición no está en el diagrama de estados

    const sigue = await buscarPedido(request, creado.id)
    expect(sigue?.estado).toBe('PENDIENTE') // el intento rechazado no cambió nada

    await request.patch(`${API}/api/pedidos/${creado.id}`, { data: { estado: 'CANCELADO' } }) // limpieza
  })
})
