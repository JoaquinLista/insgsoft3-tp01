/**
 * Filtra los ítems del formulario de pedido que tienen producto y cantidad > 0,
 * y los normaliza a número. Los incompletos se descartan en silencio: el usuario
 * puede dejar una fila vacía mientras arma el pedido.
 */
export function armarDetallesValidos(items) {
  return items
    .filter((it) => it.producto_id && Number(it.cantidad) > 0)
    .map((it) => ({ producto_id: Number(it.producto_id), cantidad: Number(it.cantidad) }));
}

/**
 * Valida un nuevo pedido antes de enviarlo a la API. Función pura: no toca el DOM
 * ni el estado de React, solo decide si el formulario está en condiciones de enviarse.
 * @param {{ origen: string, destino: string, detalles: Array }} datos
 * @returns {{ valido: true } | { valido: false, error: string }}
 */
export function validarNuevoPedido({ origen, destino, detalles }) {
  if (!origen || !destino) {
    return { valido: false, error: 'Seleccioná sucursal de origen y destino.' };
  }
  if (origen === destino) {
    return { valido: false, error: 'El origen y el destino deben ser distintos.' };
  }
  if (detalles.length === 0) {
    return { valido: false, error: 'Agregá al menos un producto con cantidad mayor a 0.' };
  }
  return { valido: true };
}
