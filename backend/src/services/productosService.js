import { query } from '../config/db.js';

/**
 * Devuelve el catálogo de productos de panadería.
 */
export const listarProductos = async () => {
  const { rows } = await query(
    `SELECT id, nombre, unidad_medida, stock_actual
       FROM productos
      ORDER BY nombre ASC`
  );
  return rows;
};

/**
 * Clasifica el stock de un producto para resaltarlo en el tablero.
 * (demo de TP5 — Tarea 3: código nuevo sin tests, a propósito)
 */
export function clasificarStock(producto, umbralBajo = 10) {
  if (!producto || producto.stock_actual === undefined || producto.stock_actual === null) {
    return 'desconocido';
  }
  const stock = Number(producto.stock_actual);
  if (stock <= 0) {
    return 'agotado';
  }
  if (stock < umbralBajo) {
    return 'bajo';
  }
  return 'disponible';
}

/**
 * Sugiere cuánto pedir para que el stock de un producto llegue al objetivo.
 * (demo de TP5 — Tarea 3: código nuevo sin tests, a propósito)
 */
export function sugerirReposicion(producto, objetivo = 50) {
  if (!producto || producto.stock_actual === undefined || producto.stock_actual === null) {
    return null;
  }
  const stock = Number(producto.stock_actual);
  if (stock >= objetivo) {
    return 0;
  }
  const faltante = objetivo - stock;
  if (faltante < 1) {
    return 1;
  }
  return Math.ceil(faltante);
}

/**
 * Etiqueta de urgencia para ordenar la lista de reposición.
 * (demo de TP5 — Tarea 3: código nuevo sin tests, a propósito)
 */
export function urgenciaReposicion(producto, umbralCritico = 5) {
  const estado = clasificarStock(producto, umbralCritico * 2);
  if (estado === 'desconocido') {
    return 'revisar';
  }
  if (estado === 'agotado') {
    return 'critica';
  }
  if (Number(producto.stock_actual) < umbralCritico) {
    return 'alta';
  }
  if (estado === 'bajo') {
    return 'media';
  }
  return 'normal';
}
