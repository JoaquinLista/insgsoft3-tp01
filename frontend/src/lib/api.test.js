import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiGet, apiPost } from './api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiPost', () => {
  it('llama a fetch con el método, los headers y el body correctos', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiPost('/pedidos', { sucursal_origen_id: 1 });

    expect(fetchMock).toHaveBeenCalledWith('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sucursal_origen_id: 1 }),
    });
  });
});

describe('apiGet', () => {
  it('ante una respuesta no-ok, rechaza con el mensaje de error del servidor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Stock insuficiente' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiGet('/pedidos')).rejects.toThrow('Stock insuficiente');
  });
});
