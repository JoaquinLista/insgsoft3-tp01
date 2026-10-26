// Corrido por null_resource.schema_preprod (neon.tf) via local-exec — carga
// database/init.sql (schema + seed del TP2) en la base nueva de preprod.
// La connection string llega por env var (DATABASE_URL), nunca como argumento
// de la linea de comando, para que no quede pegada en un log de error.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlPath = path.join(__dirname, '..', '..', 'database', 'init.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => client.query(sql))
  .then(() => client.end())
  .then(() => {
    console.log('[apply-schema] schema + seed aplicados en preprod');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[apply-schema] fallo:', err.message);
    process.exit(1);
  });
