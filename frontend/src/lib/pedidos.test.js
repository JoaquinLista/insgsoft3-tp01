import { describe, it, expect } from 'vitest';
import { armarDetallesValidos, validarNuevoPedido } from './pedidos.js';

describe('armarDetallesValidos', () => {
  it('descarta ítems sin producto o con cantidad <= 0, y normaliza el resto a número', () => {
    const items = [
      { producto_id: '1', cantidad: '3' },
      { producto_id: '', cantidad: '5' }, // sin producto: se descarta
      { producto_id: '2', cantidad: '0' }, // cantidad inválida: se descarta
    ];

    expect(armarDetallesValidos(items)).toEqual([{ producto_id: 1, cantidad: 3 }]);
  });
});

describe('validarNuevoPedido', () => {
  it.each([
    [{ origen: '', destino: '2', detalles: [{ producto_id: 1, cantidad: 1 }] }, false],
    [{ origen: '1', destino: '', detalles: [{ producto_id: 1, cantidad: 1 }] }, false],
    [{ origen: '1', destino: '1', detalles: [{ producto_id: 1, cantidad: 1 }] }, false],
    [{ origen: '1', destino: '2', detalles: [] }, false],
    [{ origen: '1', destino: '2', detalles: [{ producto_id: 1, cantidad: 1 }] }, true],
  ])('%o → válido: %s', (datos, esperado) => {
    expect(validarNuevoPedido(datos).valido).toBe(esperado);
  });

  it('cuando origen y destino coinciden, el mensaje explica por qué se rechaza', () => {
    const resultado = validarNuevoPedido({ origen: '3', destino: '3', detalles: [{ producto_id: 1, cantidad: 1 }] });

    expect(resultado.valido).toBe(false);
    expect(resultado.error).toMatch(/distintos/i);
  });
});
