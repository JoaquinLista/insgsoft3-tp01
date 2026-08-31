# Evidencias

Documento acumulativo. Cada TP agrega su sección con salidas de comandos y capturas.

> Las salidas de abajo son reales, tomadas en una corrida limpia. Para la defensa
> conviene además agregar capturas de pantalla del navegador (carpeta `evidencias/`).

---

## TP1 — Git colaborativo

El enunciado pide **cuatro capturas**: (1) push directo rechazado, (2) aviso de conflicto
en el PR, (3) marcadores del conflicto, (4) release publicada.

### 1. Push directo a `main` rechazado

![Push directo rechazado](evidencias/Evidencia3.png)

```
! [remote rejected] main -> main (protected branch hook declined)
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: Changes must be made through a pull request.
```

La protección de rama (con *Include administrators* activado) impide el push directo. El
cambio tuvo que entrar por una rama + Pull Request.

### 2. Configuración de la protección de rama

![Branch protection](evidencias/Evidencia1.png)

*Require a pull request before merging* activado, sobre el patrón `main`.

### 3. Aviso de conflicto en el Pull Request

> ⚠️ **Pendiente.** El conflicto (PR #5, `feature/titulo-b`) se resolvió en su momento
> desde el editor de conflictos de la web de GitHub, pero no se capturó la pantalla del
> aviso *"This branch has conflicts that must be resolved"*. Para recuperarlo: hacer un
> conflicto chico en una rama descartable (cambiar la misma línea que `main`), abrir el PR,
> capturar el aviso y el editor con los marcadores `<<<<<<<`, y después borrar la rama.
>
> Evidencia disponible mientras tanto — el merge commit que resolvió el conflicto real:
>
> ```
> $ git show 311ef36
> commit 311ef369703f203ad78121c024187619951d36b8
> Merge: f6ca4eb 1608421
>     Merge branch 'main' into feature/titulo-b
>
> diff --cc README.md
> @@@ -1,9 -1,9 +1,6 @@@
> - # IngenieriaSoftware3 - version B      (lo que traía feature/titulo-b)
> + # IngenieriaSoftware3 - version A      (lo que ya estaba en main, vía PR #4)
> ```
>
> Git marcó el choque en la línea 1 (dos ramas cambiaron el título); la resolución
> eligió "version A".

### 4. Marcadores del conflicto (`<<<<<<<`)

> ⚠️ **Pendiente** — misma captura que el punto 3 (el editor de conflictos de GitHub
> muestra los marcadores `<<<<<<< HEAD` / `=======` / `>>>>>>>` sobre la línea del título).

### 5. Release publicada

![Release v1.0.0](evidencias/Evidencia4.png)

Tag anotado `v1.0.0` + release, en la página del repositorio. Versionado semántico
(ver `decisiones.md` §TP1.4).

### 6. Pull Request mergeado (apoyo)

![PR mergeado](evidencias/Evidencia2.png)

PR #5 (`feature/titulo-b`) mergeado a `main` — incluye el commit de resolución del conflicto.

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

Capturas del navegador en `http://localhost` (stack levantado con `docker compose up -d`):

| Pestaña | Archivo |
|---|---|
| Tablero de Pedidos | ![Tablero de Pedidos](evidencias/tp2-app-pedidos.png) |
| Stock e Insumos | ![Stock e Insumos](evidencias/tp2-app-insumos.png) |
| Red de Sucursales | ![Red de Sucursales](evidencias/tp2-app-red.png) |

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

Las tres imágenes en `ghcr.io/joaquinlista/*`, tag `v0.1.0`, visibilidad **pública**
(`github.com/JoaquinLista?tab=packages`):

```
$ docker compose push
 ghcr.io/joaquinlista/panaderias-db:v0.1.0        Pushed
 ghcr.io/joaquinlista/panaderias-backend:v0.1.0   Pushed
 ghcr.io/joaquinlista/panaderias-frontend:v0.1.0  Pushed
```

Digests publicados:

```
ghcr.io/joaquinlista/panaderias-db:v0.1.0        sha256:d6a47b38866b20aa2173889787231dc43586d0501f9cb53c4968f39565f7e821
ghcr.io/joaquinlista/panaderias-backend:v0.1.0   sha256:e966ade863778afa8176ad2516563a7a1437ff09a50a3f6f21f3408f984caef9
ghcr.io/joaquinlista/panaderias-frontend:v0.1.0  sha256:5995d84e09058ed1381c134d7573ec45950dc4a1f1f713d008b23536bc89638a
```

**Checkpoint del enunciado — levantar sin credenciales y sin el código:**

```
$ docker compose down
$ docker rmi ghcr.io/joaquinlista/panaderias-{db,backend,frontend}:v0.1.0   # borra las locales
$ docker logout ghcr.io                                                      # sin sesión

$ docker compose -f docker-compose.registry.yml pull
 Image ghcr.io/joaquinlista/panaderias-backend:v0.1.0   Pulled
 Image ghcr.io/joaquinlista/panaderias-frontend:v0.1.0  Pulled
 Image ghcr.io/joaquinlista/panaderias-db:v0.1.0        Pulled

$ docker compose -f docker-compose.registry.yml up -d
$ docker compose -f docker-compose.registry.yml ps
NAME                  IMAGE                                            STATUS
panaderias_backend    ghcr.io/joaquinlista/panaderias-backend:v0.1.0   Up (healthy)
panaderias_db         ghcr.io/joaquinlista/panaderias-db:v0.1.0        Up (healthy)
panaderias_frontend   ghcr.io/joaquinlista/panaderias-frontend:v0.1.0  Up

$ curl -s http://localhost/api/health
{"status":"ok","db":"up","timestamp":"2026-08-27T18:35:33.444Z"}
```

Descargó las imágenes públicas estando deslogueado y el sistema quedó funcionando
end-to-end.

![Packages públicos en GitHub](evidencias/tp2-packages.png)

> Nota de arquitectura: las imágenes se construyeron en una PC Intel/AMD (linux/amd64).
> Multi-arch se resuelve en el TP7 con `docker buildx`.
