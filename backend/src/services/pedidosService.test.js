import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  esTransicionValida,
  calcularDescuentoStock,
  crearPedido,
  cambiarEstado,
  prioridadDespacho,
} from './pedidosService.js';

vi.mock('../config/db.js', () => ({
  query: vi.fn(),
  getClient: vi.fn(),
}));

import { getClient } from '../config/db.js';

describe('esTransicionValida (HU-08/HU-10: máquina de estados del pedido)', () => {
  it.each([
    ['PENDIENTE', 'EN_PREPARACION', true],
    ['PENDIENTE', 'CANCELADO', true],
    ['PENDIENTE', 'DESPACHADO', false], // salto de estado
    ['EN_PREPARACION', 'PENDIENTE', false], // retroceso
    ['ENTREGADO', 'PENDIENTE', false], // estado final: no admite ninguna transición
  ])('de "%s" a "%s" → %s', (actual, nuevo, esperado) => {
    expect(esTransicionValida(actual, nuevo)).toBe(esperado);
  });
});

describe('calcularDescuentoStock (HU-11: descuento de stock al despachar)', () => {
  it('descuenta cuando el stock alcanza', () => {
    const stocks = new Map([[1, 10]]);
    const resultado = calcularDescuentoStock(stocks, [{ producto_id: 1, cantidad: 4 }]);

    expect(resultado.ok).toBe(true);
    expect(resultado.nuevosStocks.get(1)).toBe(6);
  });

  it('rechaza cuando el stock no alcanza', () => {
    const stocks = new Map([[1, 3]]);
    const resultado = calcularDescuentoStock(stocks, [{ producto_id: 1, cantidad: 4 }]);

    expect(resultado.ok).toBe(false);
    expect(resultado.error).toMatch(/insuficiente/i);
  });

  it('rechaza un producto sin stock registrado', () => {
    const stocks = new Map();
    const resultado = calcularDescuentoStock(stocks, [{ producto_id: 99, cantidad: 1 }]);

    expect(resultado.ok).toBe(false);
    expect(resultado.error).toMatch(/no tiene stock registrado/i);
  });
});

describe('crearPedido — validaciones (se rechazan antes de tocar la base)', () => {
  it('rechaza origen y destino iguales', async () => {
    await expect(
      crearPedido({ sucursal_origen_id: 1, sucursal_destino_id: 1, detalles: [{ producto_id: 1, cantidad: 1 }] })
    ).rejects.toThrow(/origen.*destino/i);
  });

  it('rechaza un pedido sin detalles', async () => {
    await expect(
      crearPedido({ sucursal_origen_id: 1, sucursal_destino_id: 2, detalles: [] })
    ).rejects.toThrow(/al menos un detalle/i);
  });

  it('rechaza una cantidad menor o igual a 0', async () => {
    await expect(
      crearPedido({
        sucursal_origen_id: 1,
        sucursal_destino_id: 2,
        detalles: [{ producto_id: 1, cantidad: 0 }],
      })
    ).rejects.toThrow(/cantidad mayor a 0/i);
  });
});

describe('cambiarEstado — con mock de la base (HU-11 integrado a la transacción)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('si el stock no alcanza, no aplica ningún UPDATE y hace ROLLBACK', async () => {
    const client = {
      query: vi.fn((sql) => {
        const texto = sql.trim();
        if (texto.startsWith('SELECT estado FROM pedidos')) {
          return Promise.resolve({ rows: [{ estado: 'EN_PREPARACION' }] });
        }
        if (texto.startsWith('SELECT producto_id, cantidad FROM detalles_pedido')) {
          return Promise.resolve({ rows: [{ producto_id: 1, cantidad: 999 }] });
        }
        if (texto.startsWith('SELECT id, stock_actual FROM productos')) {
          return Promise.resolve({ rows: [{ id: 1, stock_actual: 30 }] });
        }
        return Promise.resolve({});
      }),
      release: vi.fn(),
    };
    getClient.mockResolvedValue(client);

    await expect(cambiarEstado(10, 'DESPACHADO')).rejects.toThrow(/insuficiente/i);

    const sqlLlamados = client.query.mock.calls.map(([sql]) => sql.trim());
    expect(sqlLlamados.some((s) => s.startsWith('UPDATE productos'))).toBe(false);
    expect(sqlLlamados.some((s) => s.startsWith('UPDATE pedidos'))).toBe(false);
    expect(sqlLlamados).toContain('ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});

describe('prioridadDespacho', () => {
  const ahora = new Date('2026-10-14T12:00:00Z');

  it('devuelve sin-fecha si el pedido no tiene fecha de creación', () => {
    expect(prioridadDespacho({}, ahora)).toBe('sin-fecha');
  });

  it('devuelve reciente dentro del primer día', () => {
    expect(prioridadDespacho({ fecha_creacion: '2026-10-14T06:00:00Z' }, ahora)).toBe('reciente');
  });

  it('devuelve esta-semana antes de los siete días', () => {
    expect(prioridadDespacho({ fecha_creacion: '2026-10-10T12:00:00Z' }, ahora)).toBe('esta-semana');
  });

  it('devuelve atrasado pasados los siete días', () => {
    expect(prioridadDespacho({ fecha_creacion: '2026-09-01T12:00:00Z' }, ahora)).toBe('atrasado');
  });
});
