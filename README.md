# Ingeniería del Software 3 — App del semestre
Repositorio único de la práctica de ISW3 (UCC 2026) — alumno: **Joaquín Lista**.
Cada TP agrega una capa sobre la misma aplicación.

| TP | Capa | Tag |
|----|------|-----|
| TP1 | Git colaborativo + protecciones de rama | `v1.0.0` |
| TP2 | Contenedores: Dockerfiles multi-stage + Compose + registry | `v2.0.0` |

Decisiones y evidencias, acumuladas TP a TP: [`decisiones.md`](decisiones.md) · [`evidencias.md`](evidencias.md).
Definición funcional (visión, personas, épicas, historias de usuario): [`producto/`](producto/).

---

## La aplicación — Red de Panaderías · Gestión Interna

Sistema cliente-servidor para la gestión interna de una red de panaderías
(4 sucursales de venta/fábrica + 1 depósito central): pedidos de productos entre
sucursales y control de stock de insumos.

| Servicio | Tecnología | Puerto | Rol |
|----------|------------|--------|-----|
| `db` | PostgreSQL 15-alpine (imagen propia con schema + seed) | interno | Persistencia |
| `backend` | Node 22 + Express (ES Modules), 3 capas | 3000 | API REST |
| `frontend` | React 18 + Vite → Nginx alpine | 80 | SPA + proxy `/api` |

```
navegador ─▶ frontend (Nginx :80) ──/api/──▶ backend (Express :3000) ──▶ db (Postgres :5432)
```

---

## Arranque desde cero (máquina limpia)

Requisitos: Docker + Docker Compose.

```bash
git clone https://github.com/JoaquinLista/insgsoft3-tp01.git
cd insgsoft3-tp01
cp .env.example .env          # 1) editá POSTGRES_PASSWORD con un valor local
docker compose up -d --build  # 2) construye y levanta db + backend + frontend
```

Abrir **http://localhost**.

Son **dos pasos** a propósito: la contraseña de la base es el único dato que no
viaja en el repo (`.env` está en `.gitignore`), así que hay que crearla a mano.

### Verificar

```bash
docker compose ps                       # db y backend en "healthy", frontend "running"
curl -s http://localhost/api/health     # {"status":"ok","db":"up"}
```

### Prueba de persistencia

```bash
docker compose down        # apaga; el volumen postgres_data queda
docker compose up -d
curl -s http://localhost/api/pedidos    # los pedidos siguen ahí

docker compose down -v     # apaga Y borra el volumen
docker compose up -d
curl -s http://localhost/api/pedidos    # vacío: se perdió todo
```

### Levantar desde las imágenes publicadas (sin construir)

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

Baja `panaderias-db`, `panaderias-backend` y `panaderias-frontend` de
`ghcr.io/joaquinlista/*` y levanta el sistema sin el código fuente.

---

## API

Base `/api` — todas las llamadas del frontend son rutas relativas (proxy de Nginx).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio y de la base |
| GET | `/api/sucursales` | Lista de sucursales |
| GET | `/api/productos` | Catálogo de productos |
| GET | `/api/insumos` | Insumos con flag `bajo_stock` |
| POST | `/api/insumos` | Alta o actualización de stock (upsert por nombre) |
| GET | `/api/pedidos` | Pedidos con su detalle |
| POST | `/api/pedidos` | Alta de pedido con detalle (transaccional) |

---

## Desarrollo fuera de Docker

```bash
# Backend  (necesita un Postgres en localhost:5432)
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (proxy de /api a http://localhost:3000)
cd frontend && npm install && npm run dev
```
