import { query, getClient } from '../config/db.js';

const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_PREPARACION', 'DESPACHADO', 'ENTREGADO', 'CANCELADO'];

/**
 * Máquina de estados del pedido (HU-08). Cada clave es un estado de origen; el arreglo,
 * los estados a los que se puede pasar desde ahí. Un estado ausente o con arreglo vacío
 * es un estado final: no admite ninguna transición.
 */
const TRANSICIONES = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['DESPACHADO', 'CANCELADO'],
  DESPACHADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

/**
 * ¿Se puede pasar de `estadoActual` a `estadoNuevo`? Función pura: no toca la base,
 * solo consulta la tabla de transiciones. HU-10 se apoya en ella para rechazar saltos,
 * retrocesos y salidas de un estado final.
 */
export const esTransicionValida = (estadoActual, estadoNuevo) =>
  (TRANSICIONES[estadoActual] ?? []).includes(estadoNuevo);

/**
 * Calcula el descuento de stock de un pedido al despacharse (HU-11). Función pura:
 * recibe el stock actual de cada producto y los detalles a descontar, y devuelve el
 * resultado sin tocar la base — ni ejecuta la resta si algún producto no alcanza.
 * @param {Map<number, number>} stocksActuales  stock_actual de cada producto, por id
 * @param {Array<{ producto_id: number, cantidad: number }>} detalles
 * @returns {{ ok: true, nuevosStocks: Map<number, number> } | { ok: false, error: string }}
 */
export const calcularDescuentoStock = (stocksActuales, detalles) => {
  const nuevosStocks = new Map(stocksActuales);

  for (const { producto_id: productoId, cantidad } of detalles) {
    const stockActual = nuevosStocks.get(productoId);

    if (stockActual === undefined) {
      return { ok: false, error: `El producto ${productoId} no tiene stock registrado` };
    }
    if (stockActual < cantidad) {
      return {
        ok: false,
        error: `Stock insuficiente del producto ${productoId}: hay ${stockActual}, se necesitan ${cantidad}`,
      };
    }

    nuevosStocks.set(productoId, stockActual - cantidad);
  }

  return { ok: true, nuevosStocks };
};

/**
 * Lista todos los pedidos con la info de sus sucursales y el detalle de productos.
 */
export const listarPedidos = async () => {
  const { rows: pedidos } = await query(
    `SELECT p.id,
            p.estado,
            p.fecha_creacion,
            p.sucursal_origen_id,
            p.sucursal_destino_id,
            so.nombre AS sucursal_origen_nombre,
            sd.nombre AS sucursal_destino_nombre
       FROM pedidos p
       JOIN sucursales so ON so.id = p.sucursal_origen_id
       JOIN sucursales sd ON sd.id = p.sucursal_destino_id
      ORDER BY p.fecha_creacion DESC, p.id DESC`
  );

  if (pedidos.length === 0) return [];

  const ids = pedidos.map((p) => p.id);
  const { rows: detalles } = await query(
    `SELECT dp.id,
            dp.pedido_id,
            dp.producto_id,
            dp.cantidad,
            pr.nombre        AS producto_nombre,
            pr.unidad_medida AS producto_unidad
       FROM detalles_pedido dp
       JOIN productos pr ON pr.id = dp.producto_id
      WHERE dp.pedido_id = ANY($1::int[])
      ORDER BY dp.id ASC`,
    [ids]
  );

  const detallesPorPedido = new Map();
  for (const d of detalles) {
    if (!detallesPorPedido.has(d.pedido_id)) detallesPorPedido.set(d.pedido_id, []);
    detallesPorPedido.get(d.pedido_id).push(d);
  }

  return pedidos.map((p) => ({
    ...p,
    detalles: detallesPorPedido.get(p.id) ?? [],
  }));
};

/**
 * Crea un pedido junto con sus detalles dentro de una transacción.
 * @param {{
 *   sucursal_origen_id: number,
 *   sucursal_destino_id: number,
 *   estado?: string,
 *   detalles: Array<{ producto_id: number, cantidad: number }>
 * }} data
 */
export const crearPedido = async (data) => {
  const origenId = Number(data.sucursal_origen_id);
  const destinoId = Number(data.sucursal_destino_id);
  const estado = data.estado ? String(data.estado).toUpperCase() : 'PENDIENTE';
  const detalles = Array.isArray(data.detalles) ? data.detalles : [];

  if (!Number.isInteger(origenId) || !Number.isInteger(destinoId)) {
    const err = new Error('sucursal_origen_id y sucursal_destino_id son obligatorios y numéricos');
    err.status = 400;
    throw err;
  }
  if (origenId === destinoId) {
    const err = new Error('La sucursal de origen y destino no pueden ser la misma');
    err.status = 400;
    throw err;
  }
  if (!ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error(`Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  if (detalles.length === 0) {
    const err = new Error('El pedido debe incluir al menos un detalle (producto_id + cantidad)');
    err.status = 400;
    throw err;
  }
  for (const d of detalles) {
    if (!Number.isInteger(Number(d.producto_id)) || Number(d.cantidad) <= 0) {
      const err = new Error('Cada detalle requiere producto_id válido y cantidad mayor a 0');
      err.status = 400;
      throw err;
    }
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: sucursalesRows } = await client.query(
      'SELECT id FROM sucursales WHERE id = ANY($1::int[])',
      [[origenId, destinoId]]
    );
    if (sucursalesRows.length !== 2) {
      const err = new Error('Alguna de las sucursales indicadas no existe');
      err.status = 400;
      throw err;
    }

    const { rows: pedidoRows } = await client.query(
      `INSERT INTO pedidos (sucursal_origen_id, sucursal_destino_id, estado)
       VALUES ($1, $2, $3)
       RETURNING id, estado, fecha_creacion, sucursal_origen_id, sucursal_destino_id`,
      [origenId, destinoId, estado]
    );
    const pedido = pedidoRows[0];

    for (const d of detalles) {
      await client.query(
        `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad)
         VALUES ($1, $2, $3)`,
        [pedido.id, Number(d.producto_id), Number(d.cantidad)]
      );
    }

    await client.query('COMMIT');

    const [creado] = (await listarPedidosPorIds([pedido.id]));
    return creado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Mueve un pedido al siguiente estado de su ciclo de vida (HU-08), rechazando
 * transiciones que no están en el diagrama de estados (HU-09/HU-10).
 * @param {number} id
 * @param {string} estadoNuevo
 */
export const cambiarEstado = async (id, estadoNuevo) => {
  const estado = String(estadoNuevo ?? '').toUpperCase();

  if (!ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error(`Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
    if (rows.length === 0) {
      const err = new Error(`No existe el pedido ${id}`);
      err.status = 404;
      throw err;
    }
    const estadoActual = rows[0].estado;

    if (!esTransicionValida(estadoActual, estado)) {
      const err = new Error(`No se puede pasar de "${estadoActual}" a "${estado}"`);
      err.status = 409;
      throw err;
    }

    if (estado === 'DESPACHADO') {
      await descontarStockDelPedido(client, id);
    }

    await client.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const [actualizado] = await listarPedidosPorIds([id]);
  return actualizado;
};

/**
 * Descuenta el stock de los productos de un pedido al despacharse (HU-11), dentro de
 * la misma transacción que `cambiarEstado`: si el stock no alcanza, lanza y el caller
 * hace ROLLBACK — el pedido no llega a quedar en DESPACHADO a medio descontar.
 * `FOR UPDATE` bloquea las filas de producto leídas para que dos despachos concurrentes
 * del mismo producto no lean el mismo stock y lo descuenten los dos sin verse.
 */
const descontarStockDelPedido = async (client, pedidoId) => {
  const { rows: detalles } = await client.query(
    'SELECT producto_id, cantidad FROM detalles_pedido WHERE pedido_id = $1',
    [pedidoId]
  );

  const productoIds = detalles.map((d) => d.producto_id);
  const { rows: stocks } = await client.query(
    'SELECT id, stock_actual FROM productos WHERE id = ANY($1::int[]) FOR UPDATE',
    [productoIds]
  );
  const stocksActuales = new Map(stocks.map((p) => [p.id, Number(p.stock_actual)]));

  const resultado = calcularDescuentoStock(stocksActuales, detalles);
  if (!resultado.ok) {
    const err = new Error(resultado.error);
    err.status = 409;
    throw err;
  }

  for (const [productoId, nuevoStock] of resultado.nuevosStocks) {
    await client.query('UPDATE productos SET stock_actual = $1 WHERE id = $2', [nuevoStock, productoId]);
  }
};

/**
 * Clasifica hace cuánto espera un pedido para priorizar la cola de despacho.
 * Función pura: recibe `ahora` por parámetro para no depender del reloj del sistema.
 */
export function prioridadDespacho(pedido, ahora = new Date()) {
  if (!pedido || !pedido.fecha_creacion) {
    return 'sin-fecha';
  }
  const dias = (ahora - new Date(pedido.fecha_creacion)) / 86400000;
  if (dias < 1) {
    return 'reciente';
  }
  if (dias < 7) {
    return 'esta-semana';
  }
  return 'atrasado';
}

/**
 * Helper interno: recupera pedidos completos por un conjunto de ids.
 * @param {number[]} ids
 */
const listarPedidosPorIds = async (ids) => {
  const { rows: pedidos } = await query(
    `SELECT p.id,
            p.estado,
            p.fecha_creacion,
            p.sucursal_origen_id,
            p.sucursal_destino_id,
            so.nombre AS sucursal_origen_nombre,
            sd.nombre AS sucursal_destino_nombre
       FROM pedidos p
       JOIN sucursales so ON so.id = p.sucursal_origen_id
       JOIN sucursales sd ON sd.id = p.sucursal_destino_id
      WHERE p.id = ANY($1::int[])
      ORDER BY p.id DESC`,
    [ids]
  );

  const { rows: detalles } = await query(
    `SELECT dp.id,
            dp.pedido_id,
            dp.producto_id,
            dp.cantidad,
            pr.nombre        AS producto_nombre,
            pr.unidad_medida AS producto_unidad
       FROM detalles_pedido dp
       JOIN productos pr ON pr.id = dp.producto_id
      WHERE dp.pedido_id = ANY($1::int[])
      ORDER BY dp.id ASC`,
    [ids]
  );

  const detallesPorPedido = new Map();
  for (const d of detalles) {
    if (!detallesPorPedido.has(d.pedido_id)) detallesPorPedido.set(d.pedido_id, []);
    detallesPorPedido.get(d.pedido_id).push(d);
  }

  return pedidos.map((p) => ({
    ...p,
    detalles: detallesPorPedido.get(p.id) ?? [],
  }));
};
