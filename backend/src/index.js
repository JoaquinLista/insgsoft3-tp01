import './instrument.js';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

import pool from './config/db.js';
import sucursalesRoutes from './routes/sucursalesRoutes.js';
import insumosRoutes from './routes/insumosRoutes.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import productosRoutes from './routes/productosRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ---- Middlewares globales ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Healthcheck ----
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'degraded', db: 'down', error: error.message });
  }
});

// ---- Rutas de negocio ----
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Reporta a Sentry antes del manejador propio — tiene que ir despues de las
// rutas y antes de cualquier otro error handler, sino no ve el error.
Sentry.setupExpressErrorHandler(app);

// ---- Manejo global de errores ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error('[error]', err);
    // setupExpressErrorHandler depende de instrumentacion automatica que en
    // ESM necesita arrancar node con --import; sin eso no es confiable, asi
    // que ademas se reporta a mano, que es lo que sabemos que funciona.
    const eventId = Sentry.captureException(err);
    console.log('[sentry] eventId:', eventId, '| client activo:', !!Sentry.getClient(), '| dsn seteado:', !!process.env.SENTRY_DSN);
    Sentry.flush(3000).then((ok) => console.log('[sentry] flush ok:', ok));
  }
  res.status(status).json({
    error: err.message ?? 'Error interno del servidor',
  });
});

/**
 * Espera a que la base de datos esté disponible antes de aceptar tráfico.
 */
const esperarBaseDeDatos = async (reintentos = 15, esperaMs = 2000) => {
  for (let intento = 1; intento <= reintentos; intento += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('[db] Conexión establecida.');
      return;
    } catch (error) {
      console.warn(
        `[db] Intento ${intento}/${reintentos} fallido (${error.message}). Reintentando en ${esperaMs} ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }
  throw new Error('No se pudo conectar a la base de datos tras múltiples intentos.');
};

const iniciar = async () => {
  await esperarBaseDeDatos();
  app.listen(PORT, () => {
    console.log(`[server] API escuchando en http://0.0.0.0:${PORT}`);
  });
};

iniciar().catch((error) => {
  console.error('[server] Error fatal durante el arranque:', error);
  process.exit(1);
});

// ---- Apagado ordenado ----
const cerrar = async (signal) => {
  console.log(`[server] Señal ${signal} recibida. Cerrando pool de conexiones...`);
  try {
    await pool.end();
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => cerrar('SIGINT'));
process.on('SIGTERM', () => cerrar('SIGTERM'));

export default app;
