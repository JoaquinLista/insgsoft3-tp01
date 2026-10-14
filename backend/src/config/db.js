import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  POSTGRES_HOST = 'db',
  POSTGRES_PORT = '5432',
  POSTGRES_DB = 'panaderias',
  POSTGRES_USER = 'panaderias',
  POSTGRES_PASSWORD = 'panaderias',
  // Neon (y la mayoría de los Postgres gestionados) exigen SSL; el Postgres del
  // docker-compose local no lo soporta. Misma imagen, dos configuraciones por entorno.
  POSTGRES_SSL = 'false',
} = process.env;

const pool = new pg.Pool({
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  database: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  ssl: POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  console.error('[db] Error inesperado en cliente inactivo del pool:', err);
});

/**
 * Ejecuta una query parametrizada contra el pool.
 * @param {string} text
 * @param {Array<unknown>} [params]
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Obtiene un cliente dedicado del pool (para transacciones).
 * Recordar siempre liberar el cliente con client.release().
 */
export const getClient = () => pool.connect();

export default pool;
