# Evidencias

Documento acumulativo. Cada TP agrega su sección con salidas de comandos y capturas.

> Las salidas de abajo son reales, tomadas en una corrida limpia. Para la defensa
> conviene además agregar capturas de pantalla del navegador (carpeta `evidencias/`).

---

## TP2 — Contenedores

### 1. `docker compose up -d --build` desde cero

```
$ docker compose up -d --build
 Image ghcr.io/joaquinlista/panaderias-db:v0.1.0 Built
 Image ghcr.io/joaquinlista/panaderias-backend:v0.1.0 Built
 Image ghcr.io/joaquinlista/panaderias-frontend:v0.1.0 Built
 Network insgsoft3-tp01_panaderias_net  Created
 Volume "insgsoft3-tp01_postgres_data"  Created
 Container panaderias_db        Started
 Container panaderias_db        Waiting
 Container panaderias_db        Healthy
 Container panaderias_backend   Started
 Container panaderias_backend   Waiting
 Container panaderias_backend   Healthy
 Container panaderias_frontend  Started
```

```
$ docker compose ps
NAME                  IMAGE                                            SERVICE   STATUS
panaderias_backend    ghcr.io/joaquinlista/panaderias-backend:v0.1.0   backend   Up (healthy)   0.0.0.0:3000->3000/tcp
panaderias_db         ghcr.io/joaquinlista/panaderias-db:v0.1.0        db        Up (healthy)   5432/tcp
panaderias_frontend   ghcr.io/joaquinlista/panaderias-frontend:v0.1.0  frontend  Up             0.0.0.0:80->80/tcp
```

### 2. Sistema funcionando end-to-end (navegador → nginx → backend → db)

```
$ curl -s http://localhost/api/health
{"status":"ok","db":"up","timestamp":"2026-08-27T18:11:06.425Z"}

$ curl -s http://localhost/api/sucursales
[{"id":5,"nombre":"Depósito Central","tipo":"DEPOSITO"},
 {"id":1,"nombre":"Panadería Viedma","tipo":"FABRICA"},
 {"id":4,"nombre":"Panadería El Café","tipo":"VENTA"},
 {"id":2,"nombre":"Panadería Estrada","tipo":"VENTA"},
 {"id":3,"nombre":"Panadería Patagónico","tipo":"VENTA"}]

# Alta de pedido (transaccional: cabecera + detalle)
$ curl -s -X POST http://localhost/api/pedidos -H 'Content-Type: application/json' \
    -d '{"sucursal_origen_id":5,"sucursal_destino_id":2,"detalles":[{"producto_id":1,"cantidad":12}]}'
{"id":1,"estado":"PENDIENTE","fecha_creacion":"2026-08-27T18:11:06.597Z",
 "sucursal_origen_nombre":"Depósito Central","sucursal_destino_nombre":"Panadería Estrada",
 "detalles":[{"id":1,"producto_id":1,"cantidad":"12.00","producto_nombre":"Medialunas","producto_unidad":"docena"}]}

$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
200
```

La llamada entra por `http://localhost/api/...` (puerto 80, nginx), nginx la
reenvía a `http://backend:3000` por la red interna, y el backend consulta `db`.
El navegador nunca ve el puerto 3000.

*(Agregar acá captura del navegador con las 3 pestañas: Pedidos, Stock e Insumos,
Red de Sucursales.)*

### 3. Prueba de persistencia

```
# Hay 1 pedido cargado.
$ docker compose down          # apaga; NO borra el volumen
$ docker compose up -d
$ curl -s http://localhost/api/pedidos
[{"id":1,"estado":"PENDIENTE","fecha_creacion":"2026-08-27T18:11:06.597Z", ...}]
                                                  ^ SIGUE: el volumen sobrevivió

$ docker compose down -v       # apaga Y borra el volumen postgres_data
 Volume insgsoft3-tp01_postgres_data  Removed
$ docker compose up -d
$ curl -s http://localhost/api/pedidos
[]                                                ^ VACÍO: -v se llevó los datos
```

`down` apaga; `down -v` además olvida.

### 4. Tamaño: imagen final vs imagen de build

```
$ docker images
REPOSITORY                                 TAG         SIZE
node:22-alpine                             -           232MB     (base de build)
ghcr.io/joaquinlista/panaderias-backend    v0.1.0      239MB     (final: base + deps prod + src)
panaderias-frontend  (etapa build)         -           314MB     (node + node_modules + fuente)
ghcr.io/joaquinlista/panaderias-frontend   v0.1.0       73.9MB   (final: nginx:alpine + dist/)
ghcr.io/joaquinlista/panaderias-db         v0.1.0      416MB     (postgres:15-alpine + init.sql)
```

- **Frontend:** la etapa de build pesa **314 MB**; la imagen final **73.9 MB**
  (−76%). Node y `node_modules` no viajan a producción — la sirve nginx.
- **Backend:** el multi-stage no achica tanto (el runtime necesita Node igual),
  pero la etapa `deps` usa `npm ci --omit=dev`: no viajan devDependencies, cache
  de npm ni herramientas de build.

### 5. Imágenes publicadas en el registry

*(Completar tras `docker compose push` — ver pasos en `decisiones.md` §2. Deben
quedar las tres en `github.com/JoaquinLista?tab=packages` con visibilidad
**pública**.)*

```
$ docker compose push
$ docker logout ghcr.io
$ docker compose -f docker-compose.registry.yml pull      # baja sin credenciales
$ docker compose -f docker-compose.registry.yml up -d     # levanta sin el código
```

*(Agregar captura de la pestaña Packages del perfil de GitHub con las 3 imágenes
públicas.)*
