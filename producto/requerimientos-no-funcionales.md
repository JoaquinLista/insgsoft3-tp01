# Requerimientos no funcionales (RNF)

Un requerimiento no funcional es una **restricción sobre el sistema o su proceso de
producción**: no agrega una función, define con qué cualidad se prestan las funciones que
ya existen. En esta app la mayoría de los RNF ya están **implementados y decididos** en la
capa de contenedores del TP2 — este documento los nombra y dice **cómo se verifican**.

Clasificación (taxonomía de Sommerville): **de producto**, **de la organización** y
**externos**.

Convención: cada RNF tiene un identificador `RNF-NN`, un enunciado **cuantificado o
verificable** (nada de "rápido", "robusto", "eficiente" sueltos), la forma de comprobarlo y
el lugar donde vive la decisión.

---

## De producto

Restringen el comportamiento observable del software.

### Rendimiento

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-01 | El alta de un pedido de hasta 3 ítems se completa en **menos de 1 segundo** en la máquina de referencia (Docker local). | `curl -w '%{time_total}'` contra `POST /api/pedidos`. | `backend/src/services/pedidosService.js` (alta transaccional en una sola conexión). |
| RNF-02 | `GET /api/health` responde en **menos de 200 ms** cuando la base está `up`. | `curl -w '%{time_total}' http://localhost/api/health`. | Endpoint liviano; healthcheck del contenedor (`decisiones.md` §2, "Orden de arranque vs. disponibilidad"). |
| RNF-03 | El listado de pedidos usa **una consulta por tabla** (pedidos + detalles), no una por pedido (sin N+1). | Revisión de `listarPedidos` — `WHERE dp.pedido_id = ANY($1)`. | `backend/src/services/pedidosService.js`. |

### Fiabilidad y disponibilidad

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-04 | El sistema se recupera solo de un reinicio de cualquier contenedor **sin pérdida de datos** de la base. | `docker compose restart`; los pedidos siguen. Prueba de persistencia del `README`. | Volumen nombrado `postgres_data` (`decisiones.md` §2, "Qué persiste y qué no"). |
| RNF-05 | El backend **no acepta tráfico** hasta que la base acepta conexiones. | `docker compose up` desde cero: el backend queda `healthy` recién después de `db`. | `depends_on: condition: service_healthy` + reintento 15×2 s en `backend/src/index.js` (`decisiones.md` §2). |
| RNF-06 | El alta de pedido con su detalle es **atómica**: o se guardan pedido + todos los ítems, o no se guarda nada. | Test de rollback del TP5 (forzar error en un ítem → 0 filas nuevas). | `BEGIN` / `COMMIT` / `ROLLBACK` en `crearPedido`. |

### Usabilidad

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-07 | El frontend **no envía** un pedido con origen = destino, sin ítems, o con cantidad ≤ 0; muestra el motivo. | Prueba manual / test de front del TP5. | Validación en `frontend/src/App.jsx` (`TableroPedidos.enviar`) **y** en el backend (defensa en profundidad). |
| RNF-08 | Los insumos por debajo del mínimo se muestran **destacados** (badge + alerta) sin que el usuario tenga que calcular nada. | Cargar un insumo con `stock_actual < stock_minimo` y ver el badge. | Flag `bajo_stock` calculado en SQL (`insumosService.js`) + `GestionInsumos` en el front. |
| RNF-09 | La interfaz es **responsive** y usable desde una tablet (los encargados no siempre están en una PC). | Revisión visual a 768 px. | `frontend/src/index.css`. |

### Portabilidad

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-10 | El sistema completo levanta en **cualquier host con Docker + Docker Compose**, sin instalar Node ni Postgres. | `docker compose up -d --build` en una máquina limpia. | `docker-compose.yml` + Dockerfiles multi-stage. |
| RNF-11 | El sistema levanta **sin el código fuente**, solo con las imágenes publicadas. | `docker compose -f docker-compose.registry.yml up -d`. | Imagen propia de la base con `init.sql` adentro (`decisiones.md` §2, "Base de datos como imagen propia"). |
| RNF-12 | *(Limitación conocida)* Las imágenes son **`linux/amd64`**; un host ARM recibe `no matching manifest`. | `docker manifest inspect`. | Se resuelve en el **TP7** con `docker buildx` multi-arch (`decisiones.md` §2, "Arquitectura"). |

---

## De la organización

Derivan de cómo trabaja el equipo (acá, el alumno) y la cátedra.

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-13 | Todo cambio a `main` entra por **Pull Request**, nunca por push directo. | Branch protection del repo; historial de `main` (todos los commits vienen de PR). | Configurado en el TP1. |
| RNF-14 | Los builds son **reproducibles**: mismo commit → misma imagen. | `npm ci` (no `npm install`); `package-lock.json` versionado. | Dockerfiles (`decisiones.md` §3). |
| RNF-15 | Cada TP se cierra con **tag anotado + release**: TP1 `v1.0.0`, TP2 `v2.0.0`, … | `git tag -n`; releases de GitHub. | Reglamento de la cátedra ([[isw3-practica]]). |
| RNF-16 | El uso de IA está **declarado y es defendible** en `decisiones.md`. | Sección "Uso de IA" de `decisiones.md`. | Exigido por el reglamento §6. |
| RNF-17 | La lógica de negocio debe alcanzar para **8 tests de backend + 4 de frontend** en el TP5. | Suite de tests del TP5 (a construir). | Criterio 4 de `elegir-app.md`; ver `epicas.md` E2 y E4. |

---

## Externos

Derivan de factores fuera del sistema y su proceso.

| ID | Enunciado | Cómo se verifica | Dónde se decide / implementa |
|----|-----------|------------------|------------------------------|
| RNF-18 | La contraseña de la base **no viaja en el repositorio**. | `git log -p -- .env` (vacío); `.env` en `.gitignore`; el compose falla claro si falta (`${POSTGRES_PASSWORD:?...}`). | `docker-compose.yml` + `.gitignore` (`decisiones.md` §2, "Secretos"). |
| RNF-19 | El navegador y el backend son el **mismo origen**: no hay CORS que configurar ni tokens en el cliente. | Las llamadas del front son rutas relativas `/api/...`; Nginx hace `proxy_pass`. | `frontend/nginx.conf` (`decisiones.md` §2, "Red y descubrimiento de servicios"). |
| RNF-20 | La API habla **JSON sobre HTTP** con verbos REST, para poder integrarse con otros sistemas internos a futuro. | Contrato en el `README` (sección "API"). | `backend/src/routes/*`. |
| RNF-21 | *(Fuera de alcance de la P1, previsto)* Autenticación y control de acceso por rol. Hoy se asume **intranet de confianza**. | — | Se evaluará junto con el **TP9 (seguridad)**. Ver `personas.md`. |

---

## Relación con la defensa oral

Estos RNF son material directo para la defensa: cada uno tiene una **decisión técnica
detrás** que se puede explicar (por qué volumen y no bind mount, por qué `npm ci`, por qué
healthcheck, por qué rutas relativas). Si un RNF no se puede explicar, no está cerrado.
