# Decisiones

Documento acumulativo de la práctica de ISW3. Cada TP agrega su sección.

> **Cómo se escribió este documento (y `evidencias.md`).** Las secciones no son una salida
> de IA pegada sin revisar. El método fue iterativo: el alumno aportó las notas, las
> decisiones y las correcciones de cada TP; **Claude Code** las reformuló y las ordenó para
> dejar el procedimiento formal y alineado con las buenas prácticas que pide la materia, y a
> lo largo del trabajo fue haciendo preguntas para ajustar el texto al enfoque que el alumno
> eligió. Cada sección se revisó antes de entrar por Pull Request. El apartado **"Uso de
> IA"** de cada TP detalla qué parte fue asistida y cómo se verificó.

---

## TP1 — Git colaborativo

> Reconstruido a partir del historial del repo (commits, PRs #1–#6, tag `v1.0.0`).
> El trabajo se hizo **en solitario**, simulando el flujo de un equipo con varias ramas.

### 1. Protección de la rama `main`

Configurada en Settings → Branches (aplicada por la API de GitHub, es decir **declarada**,
no a mano). Estado actual:

| Regla | Valor | Por qué |
|---|---|---|
| Require a pull request before merging | ✅ | Nada entra a `main` sin PR; obliga a leer el diff antes de integrar. |
| Required approving reviews | **0** | Trabajo individual: no hay quién apruebe. La revisión la hace el propio autor leyendo su diff. |
| Dismiss stale approvals / require code owners | ❌ | No aplican sin revisores. |
| **Include administrators** (`enforce_admins`) | ✅ | Ni el dueño del repo puede saltarse la regla. Es lo que hace que la protección sea real y no decorativa. |
| Allow force pushes | ❌ | No se puede reescribir la historia de `main`. |
| Allow deletions | ❌ | No se puede borrar `main`. |

**Evidencia:** `evidencias/Evidencia1.png` (configuración) y `evidencias/Evidencia3.png`
(un `git push` directo a `main` **rechazado** por el hook: `GH006: Protected branch update
failed for refs/heads/main` → `Changes must be made through a pull request`).

### 2. Flujo de trabajo

Rama corta por cambio → `push` → Pull Request → merge por la web → `git pull` en local.
**Nunca** `push` directo a `main`. Ramas usadas en el TP:

| Rama | PR | Qué hizo |
|---|---|---|
| `feature/seccion-instalacion` | #1 | Agrega sección "Instalación" al README. |
| `revert-1-feature/seccion-instalacion` | #2 | PR de *revert* de #1. **Se abrió y se cerró sin mergear** — se usó para practicar el mecanismo de revert de GitHub, después se descartó. |
| `feature/seccion-instalacion-1` | #3 | Versión definitiva de la sección "Instalación". |
| `feature/titulo-a` | #4 | Cambia el título del README a "version A". |
| `feature/titulo-b` | #5 | Cambia el título del README a "version B" → **genera el conflicto** (ver §3). |
| `feature/add-folder` | #6 | Agrega la carpeta `evidencias/` con el material del TP1. |

Cada PR tiene descripción con *qué cambia* y *por qué*.

### 3. El conflicto de merge y por qué Git no lo pudo resolver solo

`feature/titulo-a` y `feature/titulo-b` cambiaron **la misma línea 1 del README** de forma
divergente: una la dejó en `# IngenieriaSoftware3 - version A`, la otra en `- version B`.
`feature/titulo-a` se mergeó primero (PR #4). Al querer integrar `feature/titulo-b`, Git se
encontró con que esa línea ya no era la que la rama esperaba.

**Por qué Git no puede resolverlo automáticamente:** Git hace merge a nivel de **línea**.
Cuando dos ramas modifican la misma línea partiendo del mismo ancestro, no hay ninguna
regla que le diga a Git cuál de las dos versiones vale — elegir sería inventar. Entonces
marca el choque con `<<<<<<<`, `=======`, `>>>>>>>` y **deja la decisión a una persona**.
La resolución quedó registrada en el merge commit `311ef36` (`Merge branch 'main' into
feature/titulo-b`): se eligió "version A" y se reordenó la sección de instalación.

**Qué habría hecho que el conflicto nunca apareciera:**
- Que una sola rama fuera "dueña" de esa línea (no dos ramas tocando el título en paralelo).
- Ramas más chicas y de vida más corta, mergeadas seguido: menos ventana para pisarse.
- Coordinación previa ("yo toco el título, vos no") — que en un equipo es una conversación,
  no una herramienta.
- El conflicto **no es un error**: es Git pidiendo una decisión humana que Git no puede tomar.

### 4. Versionado

Tag anotado **`v1.0.0`** + release, siguiendo **versionado semántico** (`MAJOR.MINOR.PATCH`):
`1.0.0` = primera versión estable y completa del TP1. `MAJOR` sube con cambios
incompatibles, `MINOR` con funcionalidad nueva compatible, `PATCH` con correcciones.
**Evidencia:** `evidencias/Evidencia4.png` (release publicada).

### 5. Convención de commits

Arrancó informal (`Se agrego un read.me`) y se pasó a **Conventional Commits**
(`docs:`, `chore:`, `feat:`) a partir de `dcf25f7`. De TP2 en adelante todos los commits
siguen esa convención. El historial temprano se dejó como está — refleja el aprendizaje.

### 6. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| `git push` a `main` rechazado (`GH006`) | La protección de rama exige PR. | Se creó una rama, se pusheó esa, y se integró por PR. Es el comportamiento buscado. |
| El merge hecho en la web no aparecía en local | El merge ocurrió en el servidor de GitHub, no en la copia local. | `git pull` para traer el commit de merge y sincronizar `main`. |
| Conflicto en el título del README | Dos ramas cambiaron la misma línea (§3). | Resuelto en la web eligiendo "version A"; merge commit `311ef36`. |
| PR de revert (#2) abierto y sin usar | Se probó el botón *Revert* de GitHub sobre el PR #1 para ver cómo funciona (genera una rama y un PR que deshacen el merge). | No hacía falta revertir: se cerró el PR #2 sin mergear y la sección de instalación se rehízo limpia en el PR #3. |

### 7. Uso de IA

- **Qué se hizo con IA:** esta sección de `decisiones.md` y la del TP1 en `evidencias.md` se
  **reconstruyeron con Claude Code a partir del historial del repositorio** (commits, PRs,
  configuración de protección de rama vía API de GitHub), porque el TP1 no se documentó en
  el momento. El alumno contrastó cada afirmación contra lo que recordaba de haber cursado
  el TP y corrigió lo que no coincidía (ver el método al principio del documento y §6, fila
  del PR #2).
- **Qué NO se hizo con IA:** la configuración de la protección de rama, la creación de las
  ramas y PRs, la resolución del conflicto y la publicación del tag/release — todo eso lo
  hizo el alumno cuando cursó el TP1.
- **Cómo se verificó:** cada afirmación de esta sección se contrastó contra el historial
  real (`git log`, `git show 311ef36`, `gh pr view`, `gh api .../branches/main/protection`).
  El alumno tiene que poder explicar en la defensa cada punto de §1 a §4 sin leerlos.

Las cuatro capturas que pide el enunciado están en `evidencias.md` §TP1. Las dos del
conflicto (aviso en el PR + marcadores) se obtuvieron **recreando** un conflicto idéntico
(`demo-conflicto-a` / `demo-conflicto-b`), porque el conflicto original (PR #5) no se había
capturado; el original queda registrado en el merge commit `311ef36`.

---

## TP2 — Contenedores

### 1. Elección de la app del semestre

**App elegida:** *Red de Panaderías · Gestión Interna* — sistema cliente-servidor
para una red de panaderías (4 sucursales de venta/fábrica + 1 depósito central):
pedidos de productos entre sucursales y control de stock de insumos.

- **Backend:** Node 22 + Express (ES Modules), arquitectura en 3 capas
  (rutas → controladores → servicios → consultas SQL).
- **Frontend:** React 18 + Vite (SPA), servida por Nginx en producción.
- **Base:** PostgreSQL 15.

**Verificación previa (checklist de `elegir-app.md`) — a confirmar en la defensa:**

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Corre localmente hoy | ✅ `docker compose up -d --build` levanta el sistema end-to-end (ver `evidencias.md`). |
| 2 | Comandos de build/arranque conocidos | ✅ backend `npm ci` / `node src/index.js`; frontend `npm ci` / `npm run build` (lo sirve Nginx). |
| 3 | Configuración de la base por variable de entorno | ✅ `backend/src/config/db.js` lee `POSTGRES_HOST/PORT/DB/USER/PASSWORD`; nada hardcodeado. |
| 4 | Lógica para testear (TP5: 8 back + 4 front) | ⚠️ **Pendiente de reforzar.** Reglas actuales: origen ≠ destino en un pedido, cantidad > 0 por ítem, upsert de insumo por nombre, cálculo de `bajo_stock` (`stock_actual < stock_minimo`), validación de estado del pedido contra la lista permitida. Son ~4. **Antes del TP5 hay que agregar** (previsto para TP2/TP3): máquina de estados del pedido (`PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO`, transiciones válidas/ inválidas) y descuento de stock al despachar (incluye el caso "stock insuficiente"). Frontend: el form de pedido no envía con datos inválidos, y el badge de bajo stock. |
| 5 | Se entiende lo suficiente para modificarla | ⚠️ **A cargo del alumno.** Ver sección "Uso de IA". |

**Tamaño:** 3 vistas (Pedidos, Stock/Insumos, Red de Sucursales), 7 endpoints.
Chico a propósito — la guía dice que más grande solo suma fricción.

### 2. Decisiones de contenerización

**Imágenes base**

| Servicio | Base | Por qué |
|----------|------|---------|
| backend build + runtime | `node:22-alpine` | Alpine = imagen chica; Node 22 = LTS actual, el que la app declara en `engines`. |
| frontend build | `node:22-alpine` | Misma toolchain para compilar la SPA. |
| frontend runtime | `nginx:1.27-alpine` | Servir estáticos + proxy `/api`. No hace falta Node en runtime. |
| db | `postgres:15-alpine` | Versión estable; imagen propia encima (ver abajo). |

**Multi-stage**

- **Backend:** etapa `deps` instala dependencias con `npm ci --omit=dev`; la etapa
  `runtime` solo copia `node_modules` + `src`. No viajan ni el cache de npm ni
  herramientas de build.
- **Frontend:** etapa `build` compila con Vite (`npm run build`); la etapa final es
  Nginx con el `dist/` copiado. **Node no llega a producción** — la imagen final es
  Nginx + estáticos, varias veces más chica y sin superficie de ataque de la toolchain.
- Orden de instrucciones: primero `COPY package*.json` + install, después `COPY` del
  código. Así, cambiar una línea de código no reinstala dependencias (cache de capas).

**Qué persiste y qué no**

- **Persiste:** los datos de Postgres, en el volumen nombrado `postgres_data`
  (`/var/lib/postgresql/data`). Sobrevive a `docker compose down`.
- **No persiste:** todo lo demás. Los contenedores son efímeros; se recrean sin pérdida.
- `docker compose down -v` borra también el volumen → la base vuelve a cero y se
  re-ejecuta el seed.

**Base de datos como imagen propia (`database/Dockerfile`)**

El schema + los datos semilla están en `database/init.sql`, que corre vía el
mecanismo `/docker-entrypoint-initdb.d` de la imagen oficial (solo la primera vez que
se inicializa el volumen, y es idempotente igual: `CREATE TABLE IF NOT EXISTS` +
`INSERT ... ON CONFLICT DO NOTHING`).

Se empaqueta en una **imagen propia** (`FROM postgres:15-alpine` + `COPY init.sql`)
en vez de montarlo como bind mount. Motivo: `docker-compose.registry.yml` tiene que
poder levantar el sistema **sin el código del repo**; si el `init.sql` fuera un bind
mount, el repo seguiría siendo necesario.

**Red y descubrimiento de servicios**

- Red bridge propia (`panaderias_net`). Los servicios se resuelven por nombre vía el
  DNS de compose: el backend usa `POSTGRES_HOST=db`, Nginx hace `proxy_pass` a
  `http://backend:3000`.
- **La SPA no puede usar el nombre `backend`**: el JS corre en el navegador, que está
  fuera de la red de compose. Por eso el frontend llama a rutas **relativas**
  (`/api/...`) y **Nginx** traduce ese prefijo hacia el backend. Ventaja extra: para
  el navegador todo es el mismo origen → no hay CORS que configurar.
- En `nginx.conf` el upstream va en una **variable** (`set $backend_api ...`) con
  `resolver 127.0.0.11`: así Nginx resuelve el nombre en cada request y no al
  arrancar. Con el nombre directo, el contenedor del frontend no puede levantar solo
  si el backend todavía no existe (`host not found in upstream`).

**Orden de arranque vs. disponibilidad**

- `depends_on` solo garantiza el **orden de arranque**, no que el servicio esté listo.
- `db` tiene `healthcheck` (`pg_isready`) y el backend depende de él con
  `condition: service_healthy` → espera a que Postgres **acepte conexiones** (y a que
  terminen los scripts de init).
- El backend también tiene `healthcheck` (`fetch` a `/api/health`) y el frontend
  depende de él como `service_healthy`.
- Defensa en profundidad: `backend/src/index.js` además reintenta la conexión al
  arrancar (15 intentos × 2 s) antes de escuchar.

**Secretos**

- `docker-compose.yml` **no** contiene la contraseña. Usa
  `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?...}` → si `.env` no está, compose falla
  con un mensaje claro en vez de arrancar con la variable vacía.
- `POSTGRES_DB` y `POSTGRES_USER` van literales: no son secretos.
- `.env` está en `.gitignore`; se commitea `.env.example` con un valor placeholder.
- En el TP4 estos secretos migran a la plataforma de CI.

**Puerto del backend:** 3000 (no 8080 como el sample .NET de la cátedra). Es el
puerto que escucha Express; el frontend nunca lo sabe (rutas relativas).

**Registry:** GitHub Container Registry (`ghcr.io`), imágenes públicas, tag `v0.1.0`.
Se eligió ghcr sobre Docker Hub porque la cuenta ya existe (la de GitHub del TP1),
las imágenes quedan junto al código, y en el TP7 Actions se autentica contra ghcr
sin secretos (con el `GITHUB_TOKEN` del workflow). Para publicar hizo falta un PAT
**classic** con `write:packages` (los fine-grained no funcionan con ghcr) y hacer
públicas las tres imágenes a mano (nacen privadas).

**Arquitectura:** las imágenes se construyeron en una PC Intel/AMD → sirven para
`linux/amd64`. Una máquina ARM recibiría `no matching manifest`. Se resuelve en el
TP7 con `docker buildx` (build multi-arch).

### 3. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|----------|-------|----------|
| `init.sql` no se re-ejecutaba al cambiarlo | Los scripts de `/docker-entrypoint-initdb.d` solo corren cuando el volumen se inicializa por primera vez. | Se asumió y se dejó el script **idempotente**. Para re-aplicar: `docker compose down -v`. |
| El registry compose necesitaba el repo | El `init.sql` estaba como bind mount. | Imagen propia de la base con el script adentro (`database/Dockerfile`). |
| Contraseña por defecto en el compose | `${POSTGRES_PASSWORD:-panaderias}` metía el secreto en el YAML. | Se cambió a `${POSTGRES_PASSWORD:?...}` (falla si falta). |
| `npm install` en el Dockerfile | No respeta el lockfile → builds no reproducibles. | `npm ci` (requiere `package-lock.json`, que se commitea). |
| La SPA no llegaba al backend con nombre de servicio | El JS corre en el navegador, fuera de la red de compose. | Rutas relativas `/api/` + `proxy_pass` de Nginx. |

### 4. Uso de IA

> Declaración exigida por el reglamento (§6) y el enunciado del TP2.

- **Qué se hizo con IA:** la **generación inicial completa** del código de la
  aplicación (backend Express con sus 3 capas, frontend React, `database/init.sql`),
  de los `Dockerfile` (backend, frontend, db), del `docker-compose.yml` /
  `docker-compose.registry.yml`, del `nginx.conf` y de la primera versión de este
  documento se hizo con **Claude (Claude Code)**, a partir de una especificación
  redactada por el alumno. Las versiones siguientes de esta sección se reformularon sobre
  las correcciones y notas del alumno (método al principio del documento).
- **Herramienta:** Claude Code (agente que además ejecuta comandos: corrió
  `docker compose up`, probó los endpoints con `curl` y verificó el frontend).
- **Cómo se verificó:**
  - Build y arranque reales: `docker compose up -d --build` con los 3 servicios en
    `healthy` / `running` (ver `evidencias.md`).
  - Prueba funcional de cada endpoint (`GET`/`POST` de sucursales, productos, insumos,
    pedidos) y de los casos de error (origen = destino, stock negativo).
  - Prueba de persistencia (`down` / `up` / `down -v`).
  - Revisión línea por línea de los Dockerfiles y del compose contra la guía del TP2.
- **Pendiente del alumno antes de la defensa** (la regla es "si no lo podés explicar,
  no se aprueba"). Material de estudio: [`evidencias/guia-defensa-tp2.md`](evidencias/guia-defensa-tp2.md)
  responde una por una las preguntas de abajo con referencia al archivo del repo.
  - [ ] Poder explicar cada línea de los dos Dockerfiles y del compose.
  - [ ] Rehacer a mano el checklist de `elegir-app.md` (los 5 pasos, 20 min).
  - [ ] Agregar las reglas de negocio del criterio 4 (o dejar por escrito cuáles y en
        qué archivo van) — idealmente en el TP2/TP3.
  - [ ] Repasar las preguntas de ejemplo de la defensa (imagen vs contenedor, `CMD`
        vs `ENTRYPOINT`, `down` vs `down -v`, por qué multi-stage, por qué el
        healthcheck).

---

## TP3 — Planificación DevOps

**Tablero:** https://github.com/users/JoaquinLista/projects/1 (público)

### 0. Qué se montó

Sobre el mismo repo del TP1/TP2, en **GitHub Projects (v2)**:

| Item | # | Label | Estado | Sprint |
|---|---|---|---|---|
| Épica — *Pipeline DevOps completo para mi app* | #15 | `epic` | abierta | — |
| Historia — *CI: build y tests automáticos en cada PR* | #16 | `story` | abierta | Sprint 1 |
| Tarea — *Escribir el workflow de build y tests* | #17 | `task` | **cerrada** (PR #20) | Sprint 1 |
| Tarea — *Publicar el reporte de tests como artefacto* | #18 | `task` | abierta | Sprint 1 |
| Bug — *El front carga sin la lista cuando el back todavía no responde* | #19 | `bug` | abierto | — |

Jerarquía navegable con **sub-issues**: #15 → #16 → (#17, #18). El bug #19 va **al
costado**: es un defecto de algo ya construido (TP2), no era parte del plan, así que no
cuelga del árbol. La épica no lleva criterios de aceptación (no se verifica sola; se cierra
cuando cierran sus historias); los cuatro criterios están en la historia #16.

**Trazabilidad (la vuelta completa):** desde la tarea cerrada #17 se navega al PR #20
(`Closes #17` en la descripción → cerró el issue al mergear a `main`, con las protecciones
del TP1 activas) → al commit del `ci.yml` → y hacia arriba a la historia #16 y la épica #15.
Solo #17 se cerró: un PR implementa **una tarea concreta**. La historia y la otra tarea
quedan abiertas porque el trabajo sigue en el TP4.

### 1. Duración del sprint: 2 semanas

Se eligió **2 semanas** porque:
- Es el largo estándar en la industria (el rango habitual es 1–4) y el punto de equilibrio
  entre tener un objetivo comprometido estable y no demorar el feedback.
- **Se alinea con el ritmo de entregas de la materia** (aproximadamente un TP cada dos
  semanas): cada iteración cierra junto a una entrega, que es la recomendación explícita
  del enunciado.
- Con una sola persona, un ciclo más corto (1 semana) gasta demasiada proporción del
  tiempo en la ceremonia de planificar/cerrar; uno más largo (3–4) diluye el objetivo.

### 2. Límite de trabajo en progreso (WIP): 2

Configurado en la columna *In Progress* del board. Se eligió **2** siguiendo la regla de
arranque **cantidad de personas + 1**: trabajando solo, `1 + 1 = 2`.

- El `+1` es la válvula para cuando una tarjeta queda **esperando algo** (una revisión, una
  respuesta, que termine un pipeline) y hace falta avanzar en otra cosa sin dejar la
  primera de lado.
- La idea de fondo es **empezar menos y terminar más**: el trabajo empezado y no terminado
  no es productividad, es inventario (más cambio de contexto, más ramas viejas, más
  conflictos al integrar).
- GitHub no lo impide: cuando la columna se llena pone el contador en **rojo**. Es un
  acuerdo de trabajo, no un candado.
- **Señal para ajustarlo:** si nunca se alcanza, está demasiado alto y no está limitando
  nada. Si trabajara en equipo, el número subiría a `personas + 1`.

### 3. Diagnóstico de la historia mal escrita

> *"Como desarrollador quiero crear la tabla usuarios para guardar los datos."*

**Por qué está mal:** es una **tarea disfrazada de historia**. "Crear una tabla" es trabajo
técnico interno, no una capacidad que alguien *quiera* — nadie se beneficia de una tabla en
sí. Falla INVEST en **Valiosa** (no entrega valor observable), el "rol" está forzado
(*desarrollador* no es el usuario del sistema) y el "para" no es un beneficio real. Y no es
**Testeable** como valor: ¿cómo demostrás que "guardar los datos" está hecho para un
usuario?

**Cómo la reescribiría:** subir un nivel, a la capacidad del usuario final —
*"Como visitante quiero registrarme con email y contraseña para tener una cuenta y
guardar mis pedidos"* — con criterios de aceptación verificables (se puede crear una
cuenta, no se permite email repetido, la sesión persiste). "Crear la tabla usuarios"
pasa a ser **una tarea** debajo de esa historia.

### 4. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| Elegir dónde configurar el Project (web vs. `gh`) | El token empezó sin el scope `project`, y además el enunciado recomienda la web para todo lo visual ("para uno, la web; para varios, el comando"). | Los issues y el PR se crearon por CLI (`gh issue create`, `gh pr create`); la configuración del Project (visibilidad, board, campo Iteration, límite de WIP, jerarquía de sub-issues) se hizo a mano en la web. Después se agregó el scope con `gh auth refresh -s project` para poder **inspeccionar** el tablero desde la terminal (`gh project item-list`, la API GraphQL) al verificar la entrega. |
| La historia #16 quedó con una sola sub-issue (1/1) | En el primer intento se vinculó #17 pero no #18. La barra de progreso mentía. | Se agregó #18 como sub-issue → la historia pasó a 1/2, que es lo correcto (una tarea hecha, una pendiente). |
| Los Projects de usuario nacen privados | Comportamiento por defecto de GitHub; el entregable exige URL pública. | Settings → Visibility → *Public*, verificado abriendo la URL en una ventana de incógnito. |

### 5. Uso de IA

- **Qué se hizo con IA:** con **Claude (Claude Code)** se crearon los cinco issues
  (títulos y cuerpos tomados textualmente del enunciado y el video), el esqueleto de
  `.github/workflows/ci.yml` y su PR (#20, `Closes #17`), y la redacción de esta sección
  sobre las decisiones y notas del alumno (método al principio del documento).
- **Qué hizo el alumno a mano:** toda la configuración del Project — crearlo, hacerlo
  público, armar la jerarquía de sub-issues, el board, el campo Sprint (2 semanas), la
  asignación de la historia y sus tareas al Sprint 1, el límite de WIP y el merge del PR #20.
- **Qué decidió el alumno (y tiene que poder defender):** la duración del sprint, el
  número del límite de WIP y el diagnóstico de §3.
- **Cómo se verificó:** la jerarquía y los estados se contrastaron contra la API de GitHub
  (`gh api .../issues/NN/sub_issues`, `gh issue view`, `gh project item-list`); la
  trazabilidad #17 → PR #20 se confirmó (issue cerrado con `stateReason: COMPLETED`,
  `closedBy: [20]`). En esa pasada de verificación (asistida por Claude) se asignó la tarea
  #18 al Sprint 1, que había quedado sin sprint, y se cerraron dos épicas duplicadas (#23 y
  #24) creadas mientras se practicaban los comandos `gh issue create`.

## TP4 — CI: Pipelines as Code

**Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) ·
**Corridas:** pestaña *Actions* del repo · **Badge:** al principio del `README.md`

### 0. Qué se montó

Un pipeline de **integración continua** en GitHub Actions que, en **cada Pull Request a
`main` y cada push a `main`**, construye las dos imágenes de la app (backend y frontend) con
los Dockerfiles del TP2. El pipeline es **requisito de merge**: sin sus dos checks en verde,
`main` no acepta el PR (se suma a la protección de rama del TP1).

| Pieza | Cómo quedó |
|---|---|
| Disparadores | `pull_request` y `push`, ambos filtrados a `branches: [main]` |
| Jobs | `build-backend` y `build-frontend`, en paralelo (runners separados) |
| Build | `docker/build-push-action@v7` con `push: false` — construye, no publica |
| Cache | capas de la imagen en el cache de GitHub Actions (`type=gha`), un `scope` por job |
| Gate | `required_status_checks` sobre `main`: `build-backend` + `build-frontend`, `strict: true` |
| Visibilidad | status badge del workflow en el README |

### 1. Estructura del pipeline: por qué esos jobs y por qué en paralelo

- **Dos jobs, uno por imagen.** La app tiene dos Dockerfiles independientes
  (`backend/Dockerfile` y `frontend/Dockerfile`); construir cada uno en su propio job
  refleja esa separación real. No es "dos por llegar a dos": si la app tuviera un solo
  Dockerfile sería un solo job y no se perdería nada.
- **En paralelo** porque los jobs de GitHub Actions corren en runners distintos y **no
  comparten filesystem ni dependen uno del otro**: el build del frontend no necesita nada
  del backend. Ponerlos en serie (`needs:`) solo sumaría espera sin ningún beneficio. El
  feedback del PR llega en el tiempo del job más lento, no en la suma de los dos.
- El primer step de cada job (`echo "Rama … · commit …"`) es solo diagnóstico: deja escrito
  en el log **qué** se está verificando. Se arma la variable `RAMA` con `github.head_ref`
  porque en un PR `GITHUB_REF_NAME` vale `<n>/merge` (GitHub verifica la *mezcla* de la rama
  con `main`), no el nombre de la rama.

### 2. Qué cachea el pipeline y qué pasa si el cache desaparece

- **Qué se cachea:** las **capas de la imagen Docker**. El `docker build` produce una capa
  por cada instrucción que toca el filesystem (`FROM`, `COPY`, `RUN`). Con
  `cache-to: type=gha,mode=max` esas capas se suben al cache de GitHub Actions al terminar,
  y `cache-from: type=gha` las baja al empezar la corrida siguiente.
- **Cuáles se reutilizan:** las que no dependen de nada que haya cambiado. Los Dockerfiles
  del TP2 copian **primero** `package.json` + `package-lock.json` y corren `npm ci`, y
  **después** copian el código. Por eso, si un commit solo toca código, la capa cara
  (`npm ci`, que instala todas las dependencias) se toma del cache y no se rehace; solo se
  rehacen las capas desde el `COPY` del código en adelante. Si el commit cambia un
  `package.json`, esa capa y todas las siguientes se reconstruyen.
- **`mode=max`** guarda también las capas intermedias de las etapas de build (no solo las de
  la imagen final), que es lo que permite reutilizar el `npm ci` de una etapa `deps` /
  `build` multi-stage. Con el `min` por defecto se reutilizaría mucho menos.
- **Un `scope` distinto por job** (`scope=backend` / `scope=frontend`): sin eso los dos jobs
  escriben en el mismo estante del cache y **se pisan** — el último en terminar deja su cache
  y borra el del otro, y en cada corrida cambia cuál de los dos muestra `CACHED`. No da
  error: da un comportamiento errático que parece un Dockerfile roto y no lo es.
- **Si el cache desaparece** (GitHub lo desaloja cuando quiere; tiene límite de tamaño): el
  pipeline funciona **exactamente igual, solo más lento** — vuelve a construir todas las
  capas desde cero. El cache es una optimización, nunca una dependencia. Si el build
  *fallara* sin cache, no habría un cache: habría una dependencia escondida, y eso sería un
  bug del pipeline.
- Nota honesta: con una app de este tamaño la segunda corrida **no necesariamente tarda
  menos** (subir el cache también cuesta, y cada corrida cae en una máquina distinta). La
  evidencia de que el cache funciona es la palabra **`CACHED`** en el log del build, no el
  cronómetro. En la segunda corrida del PR del pipeline los dos jobs mostraron `CACHED` en
  todas las capas que no habían cambiado.

### 3. Por qué el pipeline construye con el Dockerfile y no compila por su cuenta

Si el workflow compilara la app por su lado (con `npm ci && npm run build` en el runner),
habría **dos definiciones de build**: la del workflow y la del Dockerfile. Tarde o temprano
divergen —una versión de Node distinta, una variable de entorno que está en un lado y no en
el otro— y entonces el pipeline estaría verificando una compilación **distinta** de la que
después se despliega. Construir con el Dockerfile del TP2 garantiza que **lo que se verifica
es exactamente lo que se despliega**. Ventaja lateral: el workflow no tiene una sola línea
de Node ni de ninguna tecnología concreta — el mismo `ci.yml` le sirve a cualquier stack,
porque "cómo se construye la app" vive en el Dockerfile, no en el pipeline.

### 4. El pipeline como gate y la demostración

- **Configuración del gate** (Settings → Branches → regla de `main`): *Require status checks
  to pass before merging* con `build-backend` y `build-frontend`, más *Require branches to be
  up to date before merging* (`strict: true`). Los approvals siguen en **0** (como en el
  TP1: GitHub no deja aprobar el PR propio; lo que bloquea el merge es el pipeline en verde,
  no una firma humana).
- **`strict: true`** significa que, además de los checks en verde, la rama del PR tiene que
  estar **actualizada con `main`**: si entre medio se mergeó otro PR, hay que apretar
  *Update branch* y volver a correr el pipeline sobre la mezcla nueva antes de poder
  mergear. Evita mergear algo que dio verde contra un `main` que ya no existe.
- **Demostración del gate actuando** ([PR #27](https://github.com/JoaquinLista/insgsoft3-tp01/pull/27),
  rama `demo/rompe-el-build`): en `frontend/src/main.jsx` se agregó un `import` a
  `./modulo-inexistente.js`. Vite/Rollup resuelve los imports *durante* `npm run build`
  (etapa `build` del Dockerfile del frontend), así que el `docker build` del job
  **`build-frontend` falló** ([corrida 33581643871](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/33581643871):
  `Could not resolve "./modulo-inexistente.js" from "src/main.jsx"`). **`build-backend` pasó
  en verde en la misma corrida** — prueba en vivo de que los dos jobs son independientes.
  Con `build-frontend` en rojo, GitHub reportó el PR como `BLOCKED` y el botón de merge quedó
  deshabilitado. Un segundo commit sacó el `import`; el pipeline volvió a correr solo sobre
  la mezcla con `main`, los dos checks pasaron a verde
  ([corrida 33582057303](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/33582057303)),
  el PR pasó a `CLEAN` y recién ahí se pudo mergear (squash, commit `63af595`). El PR queda
  en el historial con sus dos corridas, roja y verde — es la evidencia central del TP
  (índice navegable en [`evidencias.md`](evidencias.md) §TP4).

### 5. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| Para marcar `build-backend` / `build-frontend` como *Required*, el buscador de la regla de rama solo ofrece checks que corrieron en los últimos 7 días | Un check que nunca corrió no existe para GitHub todavía | No hizo falta ningún truco: el workflow ya venía corriendo desde el PR #22, así que los dos checks aparecían en el buscador. Si el gate se configurara junto con el primer workflow, habría que abrir un PR y dejarlo correr una vez antes. |
| Riesgo de configurar el gate por API y perder lo del TP1 | El `PUT .../branches/main/protection` **reescribe** la protección entera: todo campo omitido vuelve a su default. | El gate se configuró **por la web** (toca solo lo que se toca). Después se verificó por API que quedaron `strict: true` + los dos checks requeridos **y** que sobrevivieron los `0 approvals` y el `enforce_admins` del TP1. |
| La segunda corrida no mostraba `CACHED` | Los dos pushes salieron casi juntos y las corridas se solaparon: cuando la segunda empezó a construir, la primera todavía no había subido su cache. | Se esperó a que la primera corrida **terminara** (el cache se sube al final) y recién entonces se pushó un commit vacío (`git commit --allow-empty`) para disparar la segunda. |
| La demo del gate no se podía hacer hasta tener todo lo anterior en su lugar | Necesita tres cosas ya en `main`: el workflow real (no el esqueleto del TP3), los dos jobs habiendo corrido al menos una vez, y la regla de rama marcándolos como *Required*. | La demo (PR #27) se dejó para el final, después de mergear el workflow (PR #22) y activar el gate. Si se hiciera antes, la rama rota saldría de un `main` sin el `ci.yml` real y el check daría verde sobre código que no compila. |

### 6. Uso de IA

- **Qué se hizo con IA:** con **Claude (Claude Code)** se escribió el `ci.yml` (a partir del
  paso a paso del enunciado, adaptado al stack Node/Vite de la app), se verificaron las
  corridas y el `CACHED` en los logs vía `gh run view --log`, se corrió la demo del gate
  (PR #27) y se redactó esta sección a partir de las decisiones y correcciones del alumno
  (método al principio del documento).
- **Qué hizo el alumno a mano:** el merge de los PRs, la configuración del gate en Settings →
  Branches (marcar los dos checks como *Required* + *strict*), la ejecución de la
  demostración del gate (romper y arreglar el build), y el tag + release `v4.0.0`.
- **Qué decidió el alumno (y tiene que poder defender):** la estructura de dos jobs en
  paralelo, qué se cachea y por qué el pipeline no puede depender del cache, y por qué se
  construye con el Dockerfile en vez de compilar en el runner.
- **Cómo se verificó:** las corridas del workflow son públicas en la pestaña *Actions*; el
  `CACHED` de la segunda corrida se leyó del log real; el gate se comprobó en vivo con el
  PR #27 (con `build-frontend` en rojo el PR quedó en `BLOCKED` y el merge deshabilitado;
  con los dos checks en verde pasó a `CLEAN` y se pudo mergear); la configuración de la
  protección de rama se releyó por API para confirmar `strict: true` + los dos checks
  requeridos sin perder lo del TP1.

> **Pendiente del alumno antes de la defensa:** poder responder sin leer — qué es CI y si
> puede haber CI sin pipeline (y pipeline sin CI); por qué esos triggers; qué NO comparten
> dos jobs; qué produce el pipeline y dónde queda; qué es el cache y qué pasa si desaparece;
> qué dos condiciones exige hoy `main` para aceptar un merge; qué significa `strict: true`;
> y qué conceptos del workflow sobrevivirían a una migración a Azure Pipelines.

---

## TP5 — Testing y calidad

**Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (extendido sobre el del TP4) ·
**Suites:** [`backend/src/services/pedidosService.test.js`](backend/src/services/pedidosService.test.js) ·
[`frontend/src/lib/`](frontend/src/lib/) ·
**PRs:** [#32](https://github.com/JoaquinLista/insgsoft3-tp01/pull/32) (reglas de negocio) ·
[#33](https://github.com/JoaquinLista/insgsoft3-tp01/pull/33) (suite) ·
[#34](https://github.com/JoaquinLista/insgsoft3-tp01/pull/34) (coverage + gate) ·
[#35](https://github.com/JoaquinLista/insgsoft3-tp01/pull/35) (demo mergeada) ·
[#36](https://github.com/JoaquinLista/insgsoft3-tp01/pull/36) (demo vigente, **no mergear**)

El stack de la app es **Node/Express + React/Vite**, no el `.NET + vitest` del ejemplo de la
cátedra — pero el frontend de la cátedra también usa vitest, así que acá los **dos** lados
(backend incluido) usan el mismo mecanismo nativo de `vitest`/`@vitest/coverage-v8`: no hizo
falta nada de `coverlet` ni de ReportGenerator, que son específicos de .NET.

### 0. Qué se montó

| Pieza | Cómo quedó |
|---|---|
| Suite backend | `vitest`, 12 tests / 8 métodos, sobre `pedidosService.js` |
| Suite frontend | `vitest`, 9 tests / 5 métodos, sobre `frontend/src/lib/` |
| Coverage backend | `@vitest/coverage-v8`, provider v8, umbral `lines ≥ 30 / branches ≥ 25` |
| Coverage frontend | igual herramienta, umbral `lines ≥ 90 / branches ≥ 75` |
| Gate | corre **adentro** de `build-backend` / `build-frontend` (los *required checks* del TP4) — no se agregó ningún job ni ninguna protección nueva |
| Reporte | resumen en el *Summary* de cada corrida + reporte HTML descargable como artefacto (`coverage-backend`, `coverage-frontend`) |
| Demo del gate | 2 Pull Requests — uno cuenta la secuencia completa y está mergeado, el otro queda abierto y en rojo hasta la defensa |

### 1. Qué lógica se eligió testear y por qué

Antes de testear hubo que terminar de escribir la lógica: el PR #32 cierra la **máquina de
estados del pedido** (HU-08: `PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO`, con
`CANCELADO` como salida) y agrega el **descuento de stock al despachar** (HU-11). Son las dos
reglas elegidas para testear, y la razón es dónde duele un bug en esta app: si la máquina de
estados dejara pasar una transición inválida, un pedido podría llegar a `ENTREGADO` sin pasar
por `DESPACHADO` (sin descontar stock); si el descuento de stock tuviera un error de signo o
no chequeara que alcanza, un despacho real podría dejar el stock de un producto en negativo —
el `CHECK (stock_actual >= 0)` de la base lo frenaría igual, pero el pedido ya habría quedado a
medio camino. Son las dos reglas con más impacto operativo de todo lo que hay hoy en la app.

### 2. La suite del backend (Tarea 1)

8 métodos de test (12 casos contando los parametrizados), repartidos en **4 reglas distintas**:

| Regla | Técnica | Qué verifica |
|---|---|---|
| `esTransicionValida` (HU-08) | **parametrizado** (`it.each`, 5 casos) | transición válida, salto de estado, retroceso, estado final |
| `calcularDescuentoStock` (HU-11) | 3 tests | alcanza, no alcanza (**caso de error**), producto sin stock registrado |
| `crearPedido` | 3 tests | origen = destino, sin detalles, cantidad ≤ 0 — se rechazan **antes** de tocar la base, por eso no necesitan mock |
| `cambiarEstado` | **con mock** del módulo `config/db.js` | si el stock no alcanza, no se ejecuta ningún `UPDATE` y sí se ejecuta `ROLLBACK` — el assert mira la **interacción**, no un valor de retorno |

Antes de dar la suite por cerrada, se invirtió a mano una transición válida en `TRANSICIONES`
(se dejó pasar `PENDIENTE → DESPACHADO`) y se confirmó que el test parametrizado se ponía en
rojo — para no quedarse con asserts que no verifican nada. Se revirtió después.

### 3. El frontend: hubo que refactorizar para poder testear

`App.jsx` no tenía ninguna lógica separable del componente: todo vivía adentro de
`TableroPedidos`, que solo corre montando el DOM. Se extrajo a `frontend/src/lib/`:

- `pedidos.js` — `armarDetallesValidos` (filtra y normaliza los ítems del formulario) y
  `validarNuevoPedido` (las reglas de validación, que antes vivían como `if` sueltos dentro del
  handler de submit).
- `api.js` — `apiGet`/`apiPost`, que antes también vivían dentro de `App.jsx`.

El comportamiento no cambió — es el mismo código, movido. 5 tests, mismas 3 técnicas que el
backend: `it.each` parametrizado sobre `validarNuevoPedido`, un caso de error explícito (mensaje
de "origen y destino distintos"), y 2 con mock de `fetch` global (`vi.stubGlobal`) — uno
verifica la interacción (`apiPost` llama a `fetch` con el método/headers/body exactos, un mock
en el sentido estricto del término), el otro lo usa como stub para forzar una respuesta de error
del servidor y comprobar que `apiGet` la propaga.

No se testearon componentes React (`App.jsx`, `main.jsx`): requiere jsdom + Testing Library, y
la cátedra lo marca explícitamente como **opcional avanzado, no exigido por este TP** — la UI
completa se verifica *end-to-end* en el TP7, contra la app desplegada de verdad.

### 4. Coverage: qué entra en la cuenta y por qué el umbral es ese

**Backend — hoy: 33,82 % de líneas, 35,1 % de ramas** (umbral: `lines ≥ 30`, `branches ≥ 25`).
`include` cubre `controllers/`, `routes/` y los **4** servicios completos — no solo
`pedidosService`, que es el único que tiene tests. Se excluyeron solo dos archivos:
`src/index.js` (arranque de Express: cablea middlewares y rutas, sin ninguna regla de negocio —
equivalente al `Program.cs` del ejemplo de la cátedra) y `src/config/db.js` (conexión a
Postgres, infraestructura sin reglas). El número da bajo **a propósito**: `insumosService`,
`productosService`, `sucursalesService` y los controllers no tienen un solo test todavía, y
entran igual a la cuenta — excluirlos para que el número subiera habría sido exactamente la
trampa que el enunciado marca como tal. El umbral se puso un poco por debajo de la medición real
de hoy (no en el número exacto) para tener margen ante una fluctuación mínima sin dejar de
frenar una baja real.

**Frontend — hoy: 91,83 % de líneas, 80 % de ramas** (umbral: `lines ≥ 90`, `branches ≥ 75`).
`include: ['src/lib/**']` — ahí vive toda la lógica que tiene test. Quedan afuera `App.jsx` y
`main.jsx` por lo explicado en el punto 3: son componentes de React sin lógica propia después
del refactor, y testearlos pide herramientas que este TP no exige.

### 5. Por qué un coverage alto no prueba nada (con un ejemplo propio)

El test `descuenta cuando el stock alcanza` de `calcularDescuentoStock` pasa por `resultado.ok`
y `resultado.nuevosStocks.get(1)` — si alguien borrara esos dos `expect` y dejara solo la
llamada a la función, el archivo seguiría marcando esa línea como "ejecutada" (100 % de
cobertura de esa rama) sin comprobar absolutamente nada: ni que el resultado sea `true`, ni que
el número descontado sea el correcto. Es la misma trampa que el apunte de la materia muestra con
`Precios.ConDescuento`: coverage mide **ejecución**, no **verificación**. Por eso el número de
coverage sirve para encontrar agujeros (código que ningún test toca) y como tendencia, pero no
es una medida de que la lógica haga lo que tiene que hacer — eso lo custodian los asserts, no el
porcentaje.

### 6. El ejercicio de la rama sin cubrir

En `esTransicionValida` ([`pedidosService.js:24`](backend/src/services/pedidosService.js#L24)):

```js
export const esTransicionValida = (estadoActual, estadoNuevo) =>
  (TRANSICIONES[estadoActual] ?? []).includes(estadoNuevo);
```

El reporte de ReportGenerator-equivalente (HTML de v8) marca la rama del `?? []` como no
cubierta: en ningún test `estadoActual` es una clave ausente de `TRANSICIONES`.

1. **Qué línea es:** la del `??`, no hay ningún `if` visible — es exactamente el tipo de rama
   que abre un operador y no una instrucción (la pista de la guía).
2. **Qué entrada la recorrería:** un `estadoActual` que no sea ninguna de las 5 claves de
   `TRANSICIONES` (`PENDIENTE`, `EN_PREPARACION`, `DESPACHADO`, `ENTREGADO`, `CANCELADO`).
3. **Qué se decidió:** **no agregar un test.** El `CHECK (estado IN (...))` de la tabla
   `pedidos` en `database/init.sql` solo permite esas 5 claves, y las 5 están mapeadas en
   `TRANSICIONES` — hoy no hay ningún `estadoActual` real que pueda disparar esa rama. Agregar
   un test significaría inventar un estado que la base no puede producir, solo para subir el
   número. El `?? []` queda como una guarda defensiva para el día que alguien agregue un sexto
   estado al `CHECK` y se olvide de agregarlo a `TRANSICIONES` — ahí la rama pasaría a ser
   alcanzable, y recién ahí ameritaría un test.

### 7. El gate bloqueando un merge (Tarea 3)

Dos Pull Requests, a propósito:

- **[PR #35](https://github.com/JoaquinLista/insgsoft3-tp01/pull/35)** (mergeado) — primer
  commit agrega `prioridadDespacho` en `pedidosService.js`, sin un solo test: compila perfecto,
  no rompe ningún test existente, y la cobertura de **líneas** cae de 30,88 % a **29,9 %**
  contra el umbral de 30 %.
  [Corrida roja](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/38561494914):
  `ERROR: Coverage for lines (29.9%) does not meet global threshold (30%)` — `build-backend`
  falló, `build-frontend` siguió en verde (son independientes, igual que en el TP4). Un
  segundo commit agregó los 4 tests que faltaban, uno por camino de la función (sin fecha,
  reciente, de esta semana, atrasado):
  [corrida verde](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/38561781362). El
  PR quedó con su historial completo y se mergeó.
- **[PR #36](https://github.com/JoaquinLista/insgsoft3-tp01/pull/36)** (abierto, **no se
  mergea hasta la defensa**) — mismo tipo de problema, en `productosService.js`
  (`clasificarStock`, `sugerirReposicion`, `urgenciaReposicion`, sin tests): 29,87 % de líneas
  contra el mismo umbral de 30 %.
  [Corrida roja vigente](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/38562378273).
  `gh pr view 36` confirma `mergeStateStatus: BLOCKED` — el freno es real, no solo visual; el
  botón de merge está apagado.

### 8. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| `npm i -D vitest` falló con `ERESOLVE` en el frontend | `vitest@5` pide Vite 6/7/8; el proyecto usa Vite 5 | Se fijó `vitest@^3.2.7` (la última de la serie compatible con Vite 5) en vez de forzar con `--force`, tal como advierte la guía |
| `npm run test:ci` falla en Windows con `ENOENT: … \${COVERAGE_DIR:-coverage}` | Esa expansión es de `sh`; en Windows `npm run` usa `cmd.exe`, que no la interpreta | Es el comportamiento esperado fuera de Linux: localmente se corre `npm test -- --run --coverage`; `test:ci` es la receta que usa el contenedor del pipeline (Linux), donde sí expande bien |
| `docker run -v` no dejaba el reporte visible en el host al probarlo a mano en Windows | Git Bash (MSYS) reescribe argumentos que empiezan con `/`, y además los bind mounts de Docker Desktop sobre rutas de Git Bash no siempre se resuelven | No se insistió en reproducir el volumen en Windows: se verificó que la etapa de test compila y corre bien dentro del contenedor (Linux), y la prueba real se hizo en el pipeline (GitHub Actions, que corre en Linux) |
| El PR de cobertura (#34) se commiteó por error arriba de la rama ya mergeada del PR #33 | El repo mergea por *squash*: la rama vieja queda con una historia que diverge del `main` real una vez mergeada | Se movió el commit a una rama nueva (`feat/tp5-coverage-gate`), creada desde el `main` ya actualizado, con `git cherry-pick` |
| El segundo PR de la demo (#36) no bajaba la cobertura con una sola función | Después de mergear el PR #35 el margen real subió (33,8 % de líneas) | Se midió en la máquina después de cada cambio hasta encontrar el tamaño justo (3 funciones chicas sin tests), en vez de adivinar un número |

### 9. Uso de IA

- **Qué se hizo con IA:** con **Claude (Claude Code)** se escribió la lógica de negocio de
  HU-08/HU-11, la suite de tests de los dos lados, la configuración de coverage y el umbral,
  los 4 pasos nuevos del `ci.yml`, y la secuencia de los dos PRs de la demostración del gate.
  Se verificaron en vivo (corridas, logs, `mergeStateStatus`) antes de darlas por buenas, y se
  redactó esta sección a partir de las decisiones y correcciones del alumno (método al
  principio del documento).
- **Qué decidió el alumno (y tiene que poder defender):** agregar HU-11 (el descuento de stock
  no estaba pedido por ningún TP anterior, fue una decisión de reforzar las reglas de negocio
  antes de testear), los números de los dos umbrales, y qué queda afuera de la cuenta de
  coverage en cada lado.
- **Cómo se verificó:** cada número de este documento se corrió y se leyó de una corrida real
  (no se copió de la guía); el umbral se probó subiéndolo a mano por encima de lo real para
  confirmar que corta el build (`exit 1`) y devolviéndolo después; la demostración del gate se
  comprobó con `gh pr checks` y `gh pr view --json mergeStateStatus`, no solo mirando el color
  en la web.

> **Pendiente del alumno antes de la defensa:** dibujar la pirámide de testing y ubicar dónde
> está parada la suite hoy; señalar Arrange/Act/Assert en un test propio; explicar la
> diferencia entre el mock de `cambiarEstado` (verifica interacción) y el de `apiGet` (actúa
> como stub); explicar por qué branch coverage puede mentir más que line coverage con un
> ejemplo propio; defender el número de cada umbral y qué pasaría si se subiera diez puntos;
> mostrar el PR #35 y explicar por qué compilaba bien y tenía los tests en verde y aun así no se
> podía mergear; mostrar el PR #36 en vivo; y decir qué de un cambio **ninguno** de los tres
> guardianes de `main` (PR + build + cobertura) puede detectar, y qué de eso sí podría
> revisarte hoy un agente de IA.

---

## TP6 — CD: despliegue continuo (QA y producción)

**Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (extendido sobre el del TP4/TP5) ·
**Proxy parametrizado:** [`frontend/default.conf.template`](frontend/default.conf.template) ·
**Infra:** Render (back + front, QA y prod) + Neon (Postgres gestionado, una base por entorno) ·
**Corridas:** pestaña *Actions* del repo

### 0. Qué se montó

Sobre el pipeline de CI del TP4/TP5 se agregaron dos jobs de **CD** que despliegan la app de
verdad, encadenados con `needs` para que cada etapa dependa de que la anterior haya demostrado
que la app funciona — nunca se despliega sobre un commit que no pasó por el que viene antes:

| Pieza | Cómo quedó |
|---|---|
| Publicación de imágenes | `push: true` solo si el evento es `push` a `main` (nunca en PR), a `ghcr.io/joaquinlista/insgsoft3-tp01-{backend,frontend}:sha-<sha>` — la imagen que se publica es la que ya pasó build + tests + coverage en el mismo job |
| `deploy-qa` | `needs: [build-backend, build-frontend]`; dispara los *deploy hooks* de Render del commit ya verificado (`&ref=$GITHUB_SHA`, no la punta de la rama) y espera con un smoke test (`/api/health`, `/api/sucursales`, front `/`) hasta 10 minutos |
| `deploy-prod` | `needs: deploy-qa`; corre en el GitHub Environment `production`, que tiene un **reviewer obligatorio** configurado — el job queda **pausado** hasta que alguien lo aprueba a mano, recién ahí dispara los hooks de prod y corre su propio smoke test |
| Imagen única, config por entorno | el mismo Dockerfile de frontend sirve QA y prod: `default.conf.template` usa `${BACKEND_URL}` y `${DNS_RESOLVER}`, que la imagen oficial de `nginx` sustituye con `envsubst` al arrancar (`/etc/nginx/templates/*.template`); los valores por defecto del `ENV` del Dockerfile (`http://backend:3000`, `127.0.0.11`, el DNS embebido de Docker) son los del `docker-compose` local, y cada servicio de Render los pisa con sus propias variables |
| Bases de datos | una base **Neon** (Postgres gestionado, con SSL obligatorio) por entorno — `panaderias-qa` y `panaderias-prod` — nunca QA contra la base de prod |

### 1. Por qué ese orden y por qué prod no es automático

- **`deploy-qa` antes que `deploy-prod`**, nunca en paralelo: si prod desplegara al mismo
  tiempo que QA, el gate de aprobación manual estaría aprobando un commit que **todavía no se
  probó vivo en ningún lado** — solo pasaron tests unitarios contra mocks (TP5). QA es la
  última verificación barata antes de arriesgar producción.
- **Prod pide una persona, QA no.** El `environment: production` del job tiene un *required
  reviewer*; QA no. La razón es de costo del error: si el deploy a QA sale mal, no lo nota
  nadie más que el pipeline; si sale mal en prod, lo nota quien esté usando la app. El gate
  está en el lugar donde el error es caro, no en todos lados.
- El smoke test de cada etapa no es un detalle cosmético: es la condición real de que
  `deploy-prod` empiece. Pega contra `/api/health` (que hace `SELECT 1` contra la base, no
  solo "el proceso está vivo") y contra una ruta de negocio (`/api/sucursales`) antes de dar
  por buena la etapa.

### 2. Los tres problemas reales que aparecieron al verificar en vivo (no en el enunciado)

Tener el pipeline en verde en GitHub Actions **no alcanzaba**: tres cosas distintas estaban
rotas del lado de la infraestructura real y solo se vieron probando la app desplegada, no
leyendo el workflow.

| # | Qué pasaba | Causa | Cómo se encontró | Cómo se resolvió |
|---|---|---|---|---|
| 1 | `panaderias-api-prod` nunca había servido una sola request | Su *único* deploy (el de creación del servicio) había fallado por `connection is insecure (try using sslmode=require)` — la variable `POSTGRES_SSL` no estaba en `true` en ese momento. Se corrigió la variable después, pero **nadie volvió a desplegar** sobre el servicio ya roto | Logs del deploy en el dashboard de Render | Deploy manual sobre la config ya corregida — levantó en 22s |
| 2 | `panaderias-api-qa` "no existía" | El servicio sí existía, pero Render lo había agrupado dentro de un *Project* (llamado, confusamente, con un entorno interno "Production" — nada que ver con nuestro QA/prod) y no aparecía en el listado principal de servicios | Búsqueda manual dentro de los *Projects* del dashboard | — |
| 3 | El deploy de #2 disparado por el hook del pipeline se colgó 18 minutos y terminó en *timeout* | El contenedor **sí** bindeó el puerto (`[server] API escuchando en :3000`) pero Render le mandó `SIGTERM` 3 segundos después y quedó escaneando puertos sin encontrar ninguno — un comportamiento de la plataforma, no de la app ni de la config (que ya estaba bien) | Logs del deploy: `Señal SIGTERM recibida` seguido de `Port scan timeout reached` | Deploy manual — esta vez levantó limpio en 24s |

Los tres se diagnosticaron y resolvieron navegando el dashboard de Render y Neon con Claude en
Chrome (detalle en **Uso de IA** más abajo), no adivinando — cada uno tiene su log citado
arriba como evidencia.

### 3. El bug real: `$host` vs `$proxy_host` (508 Loop Detected)

Con los tres servicios ya arriba, la app seguía rota: cualquier pantalla que llamara a
`/api/*` mostraba *"Error 508 al consultar /sucursales"*. `508` no es un error de la app — es
un código HTTP real, **Loop Detected**, que devuelve el *edge* de Render cuando detecta que una
conexión está dando vueltas en círculo.

La causa estaba en `default.conf.template`:

```nginx
proxy_set_header Host $host;
```

`$host` es el header `Host` del pedido **original** — el del navegador al frontend
(`panaderias-front-qa.onrender.com`). Render enruta internamente por ese header: todos sus
servicios conviven detrás del mismo *edge*, y decide a qué contenedor mandar una conexión
mirando a qué dominio dice ir. Al reenviar el `Host` del frontend hacia el backend, la
conexión **volvía al propio frontend** (que volvía a proxyear, que volvía a mandarla al
frontend...) hasta que el edge cortaba el loop con un 508.

El fix es una sola variable: `proxy_set_header Host $proxy_host;` — `$proxy_host` es el host
que nginx ya resolvió de `$backend_api` (la variable con `${BACKEND_URL}`), es decir el del
**backend real**, no el del pedido entrante. Con Docker Compose nunca se nota este bug porque
ahí no hay un edge compartido enrutando por `Host`; aparece recién contra la infraestructura
real de Render — es un ejemplo concreto de por qué el TP exige probar contra el deploy
desplegado y no alcanza con que el `docker compose up` local funcione.

### 4. Demostración del gate de aprobación a producción

- Se abrió [PR #40](https://github.com/JoaquinLista/insgsoft3-tp01/pull/40) con el fix del
  punto anterior. `build-backend` y `build-frontend` en verde, se mergeó (squash, commit
  `31f639a`).
- El push a `main` disparó la corrida completa
  ([run 39334355252](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/39334355252)):
  `build-backend` ✓ → `build-frontend` ✓ → `deploy-qa` ✓ (6s, smoke test en verde) → y ahí
  **`deploy-prod` quedó pausado** esperando aprobación — confirmado con
  `gh api .../actions/runs/.../pending_deployments`, que lo lista como *pending* con
  `current_user_can_approve: true`.
  - El revisor humano lo aprobó explícitamente (vía API, revisando primero que QA ya estaba
    verde). Recién ahí `deploy-prod` arrancó y terminó en 34s con su smoke test en verde.
- Verificación final **en el navegador**, no solo en el log del pipeline: tanto
  `panaderias-front-qa.onrender.com` como `panaderias-front-prod.onrender.com` cargan el
  tablero de pedidos con datos reales de sus respectivas bases (`Depósito Central`,
  `Panadería Viedma`, …) y sin el 508 — la prueba de que el fix resolvió el problema no es que
  el pipeline diera verde, es que la app sirve datos de punta a punta.

### 5. Problemas encontrados y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| `panaderias-api-prod` con 0 deploys exitosos desde su creación | Primer deploy falló por SSL faltante contra Neon; se corrigió la variable pero no se volvió a desplegar | Deploy manual sobre la config ya corregida |
| `panaderias-api-qa` parecía no existir | Render lo agrupó dentro de un *Project* al crearlo; el listado principal de "Ungrouped Services" no lo mostraba | Buscarlo dentro de *Projects* → `My project` en el dashboard |
| El deploy de `panaderias-api-qa` vía hook tardó 18 min y falló | La app bindeó el puerto pero Render la mató con `SIGTERM` y después no detectó ningún puerto abierto — un hiccup de la plataforma (free tier) | Deploy manual: la segunda vez levantó limpio en segundos |
| `/api/*` devolvía 508 en todos los entornos desplegados | `proxy_set_header Host $host` reenviaba el host del frontend; el edge de Render enruta por ese header y la conexión volvía en loop al propio frontend | `proxy_set_header Host $proxy_host` — el host del backend real, no el del pedido entrante |

### 6. Uso de IA

- **Qué se hizo con IA:** con **Claude Code** (incluida navegación real del dashboard de
  Render y de Neon con la extensión de Chrome) se diagnosticaron los tres problemas de
  infraestructura del punto 2 leyendo logs de deploy en vivo, se encontró y explicó el bug del
  punto 3 confirmándolo primero con una request real (`GET /api/pedidos` → `508`) antes de
  tocar el código, se armó el PR #40, y se operó el gate de aprobación de prod por API
  (`gh api .../pending_deployments`) después de confirmar que QA ya estaba verde.
- **Qué autorizó el alumno a mano:** cada acción con costo o alcance real se confirmó antes de
  ejecutarse — crear el servicio nuevo en Render (explícitamente en el plan **Free**, no el
  plan pago que el formulario preselecciona), mergear el PR #40 a `main`, y aprobar el deploy a
  producción.
- **Qué decidió el alumno (y tiene que poder defender):** la separación de bases por entorno
  (Neon `panaderias-qa` / `panaderias-prod`), que `deploy-prod` dependa de `deploy-qa` en vez
  de disparar en paralelo, y por qué el gate de aprobación va en prod y no en QA.
- **Cómo se verificó:** cada uno de los tres problemas de infraestructura tiene su log citado
  como evidencia (no se infirió nada); el bug del 508 se confirmó con una request real antes y
  después del fix (`read_network_requests` mostrando `statusCode: 508` primero, y la UI
  cargando datos reales después); el gate se comprobó pidiendo el estado de
  `pending_deployments` por API, no solo mirando el color en la web; y la verificación final
  fue cargar ambas apps desplegadas en el navegador y ver datos reales, no solo "pipeline en
  verde".

> **Pendiente del alumno antes de la defensa:** poder explicar, sin leer, la cadena completa
> `needs: build → deploy-qa → deploy-prod` y por qué ese orden; qué es un *deploy hook* de
> Render y por qué el workflow le pasa `&ref=$GITHUB_SHA` en vez de dejarlo desplegar la punta
> de la rama; qué es un *GitHub Environment* y cómo el reviewer obligatorio lo convierte en un
> gate; cómo una sola imagen Docker sirve distintos entornos (`envsubst` + variables de Render
> vs. los defaults del `ENV` del Dockerfile); y, el más importante, poder explicar el bug del
> 508 en una pizarra — qué hace `$host` vs `$proxy_host`, por qué Render enruta por `Host`, y
> por qué ese bug nunca aparece en `docker compose up` local.

---

## TP7 — Contenedores + e2e: build-once-deploy-many, gate real y el bug del deploy

**Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml), jobs `integracion` y `e2e` ·
**Tests:** [`frontend/e2e/api.spec.js`](frontend/e2e/api.spec.js) (integración) ·
[`frontend/e2e/pedidos.spec.js`](frontend/e2e/pedidos.spec.js) (e2e, Playwright) ·
**Enlaces del TP7** más abajo.

### 0. Qué se agregó sobre el TP6

El TP6 ya desplegaba a QA y prod, pero con dos huecos que este TP cierra: nadie probaba la app
desplegada de verdad (solo el smoke test), y los 4 servicios de Render resultaron estar
reconstruyendo el Dockerfile en cada deploy en vez de correr la imagen publicada.

- **`integracion`** (`needs: deploy-qa`): 3 tests de Playwright que hablan directo con la API de
  QA (alta + cancelación con verificación en la base, alta inválida rechazada, transición de
  estado inválida rechazada por la máquina de estados del TP5). Sin browser, sin mocks.
- **`e2e`** (`needs: integracion`): 3 flujos de Playwright con browser real contra el front de
  QA — crear un pedido y verlo en la lista, el error de validación cuando origen = destino, y
  cargar un insumo nuevo. Si `integracion` ya mostró que la API está rota, ni se gasta un
  browser en confirmarlo (por eso `e2e` depende de `integracion`, no de `deploy-qa`
  directamente).
- **`deploy-prod`** pasó a depender de `e2e`, no de `deploy-qa`: la aprobación manual ahora
  pide algo más fuerte que "la API respondió al smoke test" — pide que un browser real haya
  completado los flujos de negocio.

### 1. El bug de deploy que encontramos haciendo esto en serio (no estaba en el enunciado, lo encontramos verificando)

Los 4 servicios de Render (`panaderias-{api,front}-{qa,prod}`) estaban dados de alta como
**Web Service de Git**: Render clonaba `JoaquinLista/insgsoft3-tp01` y buildeaba el Dockerfile
él mismo en cada deploy. El hook de CI le mandaba `&ref=$GITHUB_SHA`, que es justo el
parámetro que usa ese tipo de servicio para decirle qué commit clonar — nunca tocaba la imagen
que `build-backend`/`build-frontend` ya habían publicado en `ghcr.io`. El pipeline daba verde,
las imágenes estaban públicas, pero **lo que corría en QA/prod era otra cosa**: una
reconstrucción propia de Render, no el artefacto verificado.

Se corrigió en dos partes (PR #45):

1. Los 4 servicios se pasaron de "Git repository" a **"Existing image"** desde Settings → Build
   → Source → Edit (Render permite este cambio sin recrear el servicio, conserva URL y env
   vars). Imagen configurada: `ghcr.io/joaquinlista/insgsoft3-tp01-{backend,frontend}` sin tag
   fijo en el servicio — el tag lo decide el hook en cada deploy.
2. El hook pasó de `&ref=$GITHUB_SHA` a `&imgURL=ghcr.io%2Fjoaquinlista%2Finsgsoft3-tp01-{backend,frontend}%3Asha-$GITHUB_SHA`.
   Render exige que todo en `imgURL` excepto el tag coincida con la imagen configurada en el
   servicio, o rechaza el deploy — así que no es un parámetro cosmético, obliga a que el hook
   despliegue exactamente el commit que el pipeline acaba de construir y verificar, nunca otro.

### 2. Build-once-deploy-many y por qué nunca se publica `latest`

`build-backend`/`build-frontend` publican la imagen **una sola vez por commit**, con el tag
`sha-<commit>`, nunca `latest`. De ahí en más nadie vuelve a buildear: QA corre esa imagen,
y si pasa `integracion` + `e2e`, prod corre la **misma** imagen — nunca una reconstruida contra
el mismo código. Es justamente lo que se rompió en el punto 1 (Render buildeaba su propia
copia) y lo que el fix restaura.

No publicar `latest` es a propósito: un tag mutable rompe la trazabilidad commit → imagen (dos
deploys de "latest" en momentos distintos pueden ser dos imágenes distintas sin que se note) y
además, sin ese tag, cualquier intento de desplegar sin especificar `sha-<commit>` falla con
"no public image found" en vez de desplegar silenciosamente algo viejo — lo confirmamos en la
práctica: al configurar el campo de imagen en Render sin el tag, tiró exactamente ese error.

**Cómo se verifica que corre la imagen y no una reconstrucción:** en cada servicio, Settings
muestra "Image URL" con la ruta de `ghcr.io` (no un repo de GitHub + Dockerfile), y la pestaña
Events del último deploy dice *"Deploy triggered via deploy hook"* apuntando a esa imagen —
no hay paso de build en el log del deploy.

### 3. Integración vs e2e, y por qué esos flujos

`api.spec.js` prueba el **contrato de la API contra su base real**: que el estado persiste,
que se rechaza lo inválido, que la máquina de estados del TP5 (`PENDIENTE → ENTREGADO` sin
pasar por `DESPACHADO`) frena en la base y no en una validación de capa superior que un mock
dejaría pasar. `pedidos.spec.js` prueba **lo que ve una persona**: un formulario real, un click
real, una tabla real — cosas que la API nunca expone por sí sola, como el orden en que se
muestran los pedidos o si el mensaje de error tiene el rol de accesibilidad correcto. Las dos
suites pueden estar en desacuerdo: la API puede estar perfecta y la pantalla mostrar cualquier
cosa (es justo lo que pasó en la demo del punto 4).

Tercera prueba de cada suite "a elección": en integración, la transición de estado inválida
(porque vive en la base, un doble nunca la detectaría rota). En e2e, cargar un insumo — el
flujo diario del otro costado de la app, y el que más escribe sobre la base real (upsert, no
un alta descartable).

### 4. Demostración del gate: un bug real en producción de datos, no en el test

Para demostrar que el gate frena de verdad, se rompió la **aplicación**, no el test: en
[`pedidosService.js`](backend/src/services/pedidosService.js), `listarPedidos` pasó de
`ORDER BY fecha_creacion DESC` a `ASC` (rama `demo/tp7-orden-pedidos-roto`, PR #43, commit
`134215f`).

- Corrida roja:
  [run 40378170755](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/40378170755) —
  `deploy-qa` ✅, `integracion` ✅ (3/3, el orden no le importa a la API), `e2e` ❌,
  `deploy-prod` saltado. Reportes: `playwright-report-integracion` y `playwright-report-e2e`
  (adjuntos a esa corrida).
- El fallo **no** fue donde se esperaba. Como `sucursales[0]`/`productos[0]` son siempre los
  mismos, cualquier corrida de este test crea un pedido con el mismo origen/destino/producto
  que todas las anteriores — así que el `toContainText` de la primera fila pasó igual, de
  casualidad: con `ASC` la "primera fila" pasó a ser el pedido más viejo de la tabla (ya
  `CANCELADO` de una corrida pasada), que por esa coincidencia de datos fijos se veía igual al
  que el test acababa de crear. Donde explotó de verdad fue en la limpieza: el test intenta
  cancelar ese pedido viejo otra vez, y la máquina de estados del TP5 lo rechaza con `409`
  (cancelar algo ya `CANCELADO` no es una transición válida) en vez del `200` esperado. El bug
  es peor de lo que parece a primera vista: no solo desordena la vista, hace que la limpieza
  (y cualquier acción siguiente) le pegue al pedido equivocado sin que nada en pantalla lo
  delate. Dejó 2 pedidos (`#6`, `#7`) en `PENDIENTE` en la base de QA — los que el test creó de
  verdad y nunca llegó a cancelar — limpiados a mano por API después.
- Fix: revertir la línea (PR #44, commit `747b37c`) + el fix del punto 1 (PR #45, commit
  `d1aa49f`).
- Corrida completa en verde, con las 4 imágenes ya corriendo desde el registry:
  [run 40400731443](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/40400731443) —
  `build-backend` → `build-frontend` → `deploy-qa` → `integracion` → `e2e` → `deploy-prod`,
  los 6 en verde.

### 5. Cold starts y flakiness contra QA real

Render (plan free) duerme los servicios sin tráfico — la primera request después de un rato
tarda varios segundos más que las siguientes. El smoke test de `deploy-qa`/`deploy-prod` ya
reintentaba hasta 30 veces cada 20s por esto (TP6); se confirmó en vivo durante este TP: un
`curl` suelto a `/api/health` con 10s de timeout dio timeout, el mismo `curl` con 30s respondió
bien. Los tests de Playwright usan su propio timeout por acción (no uno global corto), así que
un cold start durante la corrida demora el test, no lo rompe — ninguna de las corridas de este
TP necesitó reintento por flakiness real, solo el primer `curl` manual fuera del pipeline.

### 6. Problemas encontrados

| Problema | Causa | Solución |
|---|---|---|
| Los 4 servicios de Render reconstruían el Dockerfile en cada deploy en vez de correr la imagen publicada | Estaban dados de alta como "Git repository", no "Existing image"; el hook mandaba `ref` (para git) en vez de `imgURL` (para imagen) | Settings → Build → Source → Edit en los 4 servicios, + el hook del workflow pasa a `imgURL` (PR #45) |
| Al configurar la imagen en Render sin tag, "No public image found" | Sin tag, Render busca `latest` — y nunca se publica ese tag a propósito | Poner la imagen con el tag incluido: `ghcr.io/.../insgsoft3-tp01-backend:sha-<commit>` |
| El bug de orden de la demo no rompió donde se esperaba (línea de contenido), rompió en la limpieza | Los fixtures de sucursales/productos son siempre los mismos: el pedido viejo que quedó "arriba" por el `ASC` coincide en origen/destino/producto con el que el test acababa de crear | Ninguna — es el comportamiento real del bug, quedó documentado así; se limpiaron a mano los 2 pedidos que quedaron `PENDIENTE` en QA |

### 7. Uso de IA

- **Qué se hizo con IA:** con Claude Code se armó la suite de integración/e2e y el
  encadenamiento de jobs del PR #42; se diagnosticó por qué el bug de la demo (PR #43) fallaba
  en un lugar distinto al esperado leyendo el reporte de Playwright; y se encontró el problema
  del punto 1 (servicios de Render en modo git, no imagen) revisando la configuración real de
  cada servicio, no asumiendo que el TP6 ya lo dejaba bien.
- **Qué autorizó/ejecutó el alumno a mano:** los 4 cambios de Settings en Render (son de su
  cuenta), mergear los PRs #43/#44/#45, y aprobar el deploy a producción en cada corrida.
- **Qué tiene que poder defender:** por qué `e2e` depende de `integracion` y no de `deploy-qa`
  directamente; la diferencia entre `ref` e `imgURL` en un deploy hook de Render y por qué una
  no sirve para lo que sirve la otra; por qué nunca se publica `latest`; y, el más importante,
  poder explicar en una pizarra por qué el bug de la demo no falló en la aserción de contenido
  sino en la limpieza (la coincidencia de fixtures fijos).
- **Cómo se verificó:** cada corrida citada arriba tiene su link; el bug de Render se confirmó
  mirando Settings de cada servicio (decía "Git repository", no una imagen) antes de tocar
  nada, y después del fix mirando que Events dijera "Deploy triggered via deploy hook" sobre
  una imagen y no sobre un build.

### Enlaces del TP7

- Paquetes públicos: [`insgsoft3-tp01-backend`](https://github.com/JoaquinLista/insgsoft3-tp01/pkgs/container/insgsoft3-tp01-backend) ·
  [`insgsoft3-tp01-frontend`](https://github.com/JoaquinLista/insgsoft3-tp01/pkgs/container/insgsoft3-tp01-frontend) —
  tag en producción: `sha-d1aa49f06d5ff97522a78ac853677cb0b26f8b7b`.
- Corrida con integración verde / e2e roja:
  [run 40378170755](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/40378170755)
  (commit `134215f`, PR #43) — artefactos `playwright-report-integracion` y
  `playwright-report-e2e` adjuntos a esa corrida.
- Corrida completa en verde hasta prod, ya con las 4 imágenes corriendo desde el registry:
  [run 40400731443](https://github.com/JoaquinLista/insgsoft3-tp01/actions/runs/40400731443)
  (commit `d1aa49f`, PR #45).
- URLs vivas: QA [front](https://panaderias-front-qa.onrender.com) /
  [api](https://panaderias-api-qa.onrender.com/api/health) · PROD
  [front](https://panaderias-front-prod.onrender.com) /
  [api](https://panaderias-api-prod.onrender.com/api/health).

> **Pendiente del alumno antes de la defensa:** poder explicar sin leer la diferencia entre
> `ref` e `imgURL` en un deploy hook de Render y por qué una sirve para git y la otra para
> imagen; por qué `e2e` depende de `integracion` y no de `deploy-qa`; la distinción
> integración/e2e con ejemplos propios de este TP (no genéricos); y sobre todo el bug de la
> demo — por qué falló en la limpieza y no en la aserción de contenido, y qué dice eso sobre
> qué tan fácil es que un bug de UI pase desapercibido si solo se mira la API.

---

## TP8 — IaC: `preprod` con Terraform

**Código:** [`infra/`](infra/) — `main.tf` (providers), `neon.tf`, `render.tf`, `variables.tf`,
`outputs.tf`, `scripts/apply-schema.js` · **No corre en CI**: es a mano, en la terminal, a
propósito — la defensa de este TP es en vivo (`apply` y `destroy` delante del profesor), así
que automatizarlo en un pipeline le saca el sentido al ejercicio.

### 0. Herramienta y providers

Terraform 1.16.6 (`winget install Hashicorp.Terraform`). Dos providers, porque el stack ya
usa dos nubes distintas desde el TP6:

- [`render-oss/render` v1.9.1](https://registry.terraform.io/providers/render-oss/render/latest) — el provider oficial de Render, publicado por ellos mismos (hay otro de la comunidad, `jackall3n/terraform-provider-render`, más viejo).
- [`kislerdm/neon` v0.18.0](https://registry.terraform.io/providers/kislerdm/neon/latest) — no es de Neon, es comunitario, pero es el único con soporte real para `neon_project`.

Las credenciales (`RENDER_API_KEY`, `RENDER_OWNER_ID`, `NEON_API_KEY`) **nunca entran al
código**: los dos `provider { }` quedan vacíos a propósito, los providers las leen solas de
variables de entorno. No hay `terraform.tfvars` con secretos — ni siquiera existe el archivo,
no hace falta. `.gitignore` cubre `infra/.terraform/`, `*.tfstate*` y `*.tfvars` igual, para
el día que alguien los use.

### 1. Qué crea `preprod` y por qué no toca QA/prod

- **`neon_project.preprod`**: un proyecto de Neon **nuevo y separado** de los de QA/prod — no
  un branch del mismo proyecto. Es la forma más simple de garantizar aislamiento total sin
  depender de conocer o referenciar IDs de recursos que Terraform no gestiona.
- **`render_web_service.api_preprod` / `front_preprod`**: corren la **misma imagen del TP7**
  (`ghcr.io/.../insgsoft3-tp01-{backend,frontend}:sha-<commit>`, el tag es una variable con
  default). `BACKEND_URL` del front sale de `render_web_service.api_preprod.url` — el atributo
  que Render devuelve después de crear el servicio, no una URL tipeada a mano.
- El proyecto nace con la base vacía: un `null_resource` con `local-exec` corre
  `scripts/apply-schema.js` (usa el driver `pg` que ya está instalado en `backend/node_modules`,
  no Docker) para cargar `database/init.sql` (schema + seed del TP2) una sola vez por `apply`.

### 2. El ciclo destroy → apply, probado en vivo

```
terraform apply    # crea los 4 recursos — preprod responde con el seed
terraform destroy  # Destroy complete! Resources: 4 destroyed.
terraform apply    # Apply complete! Resources: 4 added. Mismas URLs, ids nuevos.
terraform destroy  # se dejó todo abajo — se recrea en la defensa, no hace falta tenerlo arriba
```

Las URLs quedan idénticas entre la primera y la segunda vuelta
(`panaderias-api-preprod.onrender.com`, `panaderias-front-preprod.onrender.com`) porque
dependen del `name` del servicio, no de su id — lo único que cambia entre recreaciones son los
ids internos (`srv-...`, el id del proyecto Neon) y la contraseña del rol de base, que Neon
regenera cada vez.

### 3. Problemas encontrados (todos reales, ninguno estaba en el enunciado)

| # | Problema | Causa | Solución |
|---|---|---|---|
| 1 | Neon rechazaba crear el proyecto: `org_id is required` | La API de Neon ya exige `org_id`, pero el schema del provider todavía lo marca `optional` — desactualizado respecto a la API real | Agregar `org_id` como variable, sacado de Organization settings en el dashboard de Neon |
| 2 | `requested history retention seconds exceeds allowed maximum` | El default del provider para `history_retention_seconds` es 24h (86400s); el plan free de Neon tope en 6h (21600s) | Fijarlo a mano en `neon_project.preprod` |
| 3 | El bootstrap del schema fallaba con Docker: `failed to connect to the docker API` | Docker Desktop no estaba corriendo en la máquina, y además ni hacía falta — es una dependencia de más para algo que Node ya puede hacer | Reemplazar el `docker run` por `scripts/apply-schema.js`, reusando el `pg` que ya está en `backend/node_modules` |
| 4 | La contraseña de la base nueva quedó en texto plano en el error de la terminal, cuando el paso de Docker falló | La connection string iba interpolada directo en el `command` del `local-exec`; si el comando falla, Terraform reimprime el comando completo pese a que el valor esté marcado `sensitive` en el plan | Pasarla por `environment` del provisioner en vez de por el `command` — no vuelve a aparecer en un error. De hecho quedó sin importancia: el `destroy` posterior invalidó esa contraseña junto con todo el proyecto |
| 5 | `invalid ownerID` al crear los servicios de Render | El valor que se probó primero para `RENDER_OWNER_ID` era el id de un servicio existente (`srv-...`/`db7...`), no el de la cuenta | `curl -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/owners` devuelve el id correcto (`usr-...`) |
| 6 | `Cannot find module "C:\...\infra\"C:\...\apply-schema.js""` | El `command` del `local-exec` tenía la ruta entre comillas (`\"...\"`) aunque no tenía espacios — en Windows esas comillas de más quedaron pegadas al argumento en vez de delimitarlo | Sacar las comillas: la ruta no las necesita |

### 4. Uso de IA

- **Qué se hizo con IA:** con Claude Code se armó todo `infra/` (providers, recursos,
  variables) consultando el schema real de los dos providers (`terraform providers schema
  -json`, corrido localmente sin ninguna credencial) en vez de adivinar nombres de atributos; y
  se diagnosticó cada uno de los 6 problemas de la tabla de arriba leyendo el error real de
  Terraform, no probando a ciegas.
- **Qué ejecutó el alumno a mano:** las credenciales (Render API key + owner ID, Neon API key
  + org ID) nunca las vio ni las usó la IA — se consiguieron y exportaron en la propia terminal
  del alumno, y los 4 `apply`/`destroy` del punto 2 los corrió él mismo. Es a propósito: este
  TP se defiende corriendo los comandos en vivo.
- **Qué tiene que poder defender:** por qué `preprod` es un proyecto Neon nuevo y no un branch
  del existente; qué hace cada uno de los 6 problemas de la tabla (sobre todo el de `org_id` y
  el de `history_retention_seconds`, porque son límites reales de la cuenta, no errores de
  sintaxis); y por qué las credenciales nunca tocan el código ni el repo.
- **Cómo se verificó:** cada problema de la tabla tiene su mensaje de error real citado; el
  ciclo completo se corrió dos veces seguidas (apply → destroy → apply) y se comprobó con
  `curl` que `preprod` respondía con el seed cargado (`/api/sucursales` devolviendo las 5
  sucursales) antes del segundo `destroy`.

> **Pendiente del alumno antes de la defensa:** tener las 4 credenciales (o saber conseguirlas
> de nuevo en 2 minutos) y poder correr `terraform apply`/`destroy` en vivo sin este documento
> al lado; explicar de memoria por qué `preprod` no es un branch del proyecto de QA/prod; y
> poder señalar en el código exactamente de dónde sale cada variable de entorno que reciben los
> dos `render_web_service` (ninguna está escrita a mano).

---

## TP9 — DevSecOps: Dependabot, Sentry, y el bug real que encontró

### 0. Qué se montó

- **Dependabot** ([`.github/dependabot.yml`](.github/dependabot.yml)): un bloque por ecosistema
  — `npm` en `backend/` y `frontend/`, `docker` en `backend/`, `frontend/` y `database/`,
  `github-actions` en la raíz — chequeo semanal.
- **Sentry** en los dos lados: `@sentry/node` en el backend (PR #50, #66, #67, #68 — la saga
  completa está en el punto 2), `@sentry/react` en el frontend. `SENTRY_DSN` del backend es
  variable de entorno de Render (runtime); `VITE_SENTRY_DSN` del frontend se hornea en el
  bundle en build-time, por eso es secret de GitHub Actions + build-arg del Dockerfile, no
  variable de Render — son mecanismos distintos a propósito, no un descuido.
- **Push protection**: ya estaba activa (viene gratis en repos públicos desde antes de este
  TP, confirmado por API: `secret_scanning_push_protection: enabled`).
- **CodeQL**: activado por API (`code-scanning/default-setup`, `state: configured`) —
  detectó solo `javascript-typescript` y `actions` como lenguajes del repo. Primera corrida en
  verde.

### 1. El PR de Dependabot que se mergeó

[PR #55](https://github.com/JoaquinLista/insgsoft3-tp01/pull/55) — `pg` 8.23.0 → 8.23.1 (patch).
De los ~15 PRs que Dependabot abrió solo en los primeros minutos (configurarlo dispara un
chequeo inmediato, no hace falta esperar a la próxima semana), la mayoría eran saltos de
versión mayor a propósito rotos para la demo del gate (React 18→19, Express 4→5, Vite 5→8,
`actions/checkout` 6→7) — varios de esos quedaron en rojo en su propio check de PR, el gate
haciendo exactamente lo que tiene que hacer. Se mergeó el de `pg` porque es un patch sin
cambios de API, con el pipeline completo en verde, y porque tocar el driver de Postgres sin
romper nada es la clase de cambio que Dependabot está pensado para automatizar sin supervisión.
Los demás quedaron abiertos, sin mergear, a propósito.

### 2. La saga de por qué Sentry no mandaba nada desde Render (la parte larga)

Esto fue lo que más tiempo consumió del TP9, y vale la pena documentarlo entero porque cada
paso descartó una hipótesis distinta:

1. **Primer intento**: DSN pegado en Render, sin reiniciar el servicio. Nada llegaba a Sentry.
   Causa: igual que en el TP6, cambiar una env var en un servicio de Render **no reinicia el
   proceso solo** — Node solo lee `process.env` una vez, al arrancar. Se confirmó mirando los
   logs: el proceso llevaba corriendo desde antes del cambio.
2. Después de un **"Restart service"** manual, seguía sin llegar nada — y encima el proyecto de
   Sentry que se había armado al principio ni siquiera aparecía en el dashboard (quedó a medio
   crear en el asistente). Se creó de nuevo, con un DSN nuevo.
3. Con el DSN correcto y el servicio reiniciado, **seguía sin aparecer el evento**. Una prueba
   aislada local (mismo DSN, un `Sentry.captureException` suelto desde una terminal) **sí**
   llegó — eso acotó el problema a algo específico de correr dentro de Express en Render, no al
   DSN ni al SDK en sí.
4. Se agregó `Sentry.captureException(err)` a mano en el error handler final (por las dudas de
   que `setupExpressErrorHandler` no alcanzara sin el flag `--import` que pide Sentry para ESM).
   Tampoco apareció nada — pero con `debug: true` los logs de Render mostraron la causa real:
   **`Sentry Logger [error]: Transport disabled`**, precedido de **`Invalid Sentry Dsn`**. El
   SDK generaba un `eventId` válido pero nunca llegaba a mandarlo, porque consideraba el DSN
   inválido — pese a que el mismo string, probado suelto en local, era válido.
5. Retipear el DSN a mano en el campo de Render (por si había quedado un carácter invisible de
   un copy-paste) **tampoco alcanzó** con un simple "Restart service" — recién funcionó cuando
   el valor nuevo pasó por un **deploy completo** disparado por el pipeline (no un restart
   manual). La hipótesis más probable: el "Restart" reutiliza algún env cacheado del lado de
   Render que un deploy nuevo no.
6. Con eso, `Sentry Logger` dejó de quejarse del DSN y empezó a loguear spans de tracing reales
   — ahí sí, el próximo error disparado llegó a Sentry como [`PANADERIAS-BACKEND-2`](https://joaquins.sentry.io/issues/?project=4512325600673792),
   con endpoint y método marcados (gracias a la instrumentación automática, que al final sí
   funcionaba).

**Nota para la defensa**: quedó logging de diagnóstico (`debug: true`, un `console.log` del DSN
crudo) en `instrument.js` que en un mundo con más tiempo se saca — se documenta acá en vez de
sacarlo a las apuradas sin volver a probar todo el camino.

### 3. El error real y la tarjeta del tablero

El error que terminó llegando no fue fabricado: es un bug real. `PATCH /api/pedidos/:id` hace
`Number(req.params.id)` sin validar — con un id no numérico da `NaN`, que Postgres rechaza con
`invalid input syntax for type integer`, y el usuario ve un 500 en vez de un 400 claro.
Encontrado en Sentry, se cargó como [issue #69](https://github.com/JoaquinLista/insgsoft3-tp01/issues/69)
y se agregó al tablero del TP3 ([proyecto](https://github.com/users/JoaquinLista/projects/1)) —
nace de un dato real de observabilidad, no de una idea a priori.

### 4. Monitor externo (DOWN/UP)

**Pendiente** — no se llegó a configurar un monitor externo (UptimeRobot u otro) ni a forzar una
caída real cronometrada por el tiempo que consumió la saga de Sentry del punto 2. Queda
documentado como lo que falta, no como algo que se ocultó.

### 5. Problemas encontrados

| Problema | Causa | Solución |
|---|---|---|
| Cambiar `SENTRY_DSN` en Render no mandaba nada a Sentry | Env var nueva sin reiniciar el proceso — mismo problema que ya se había visto en el TP6 | `Manual Deploy` → `Restart service` (o, como se vio después, un deploy completo) |
| El proyecto de Sentry del backend no aparecía en el dashboard | Quedó a medio crear en el asistente de onboarding | Crearlo de nuevo, completo |
| `Invalid Sentry Dsn` / `Transport disabled` con un DSN que local funcionaba bien | No determinado con certeza — un simple "Restart" con el valor corregido no alcanzó, hizo falta un deploy completo del pipeline | Pasar el fix por un push a `main` en vez de solo reiniciar |
| Dependabot abrió ~15 PRs, varios rotos | Esperado: abre un PR por cada versión disponible, no filtra por si rompe algo | Mergear solo el patch seguro (`pg`), dejar el resto sin mergear |

### 6. Uso de IA

- **Qué se hizo con IA**: con Claude Code se armó `dependabot.yml`, la integración de Sentry en
  los dos lados, y se diagnosticó la saga completa del punto 2 leyendo logs reales de Render en
  cada paso (nunca asumiendo que un fix funcionaba sin confirmarlo en el log) — incluyendo correr
  una prueba aislada local para descartar el DSN/SDK antes de sospechar de Render.
- **Qué ejecutó el alumno a mano**: las cuentas de Sentry (creación de los 2 proyectos, los
  DSNs), cargar las variables en Render, cada merge de PR y cada aprobación de deploy a
  producción.
- **Qué tiene que poder defender**: la diferencia entre `SENTRY_DSN` (runtime, Render) y
  `VITE_SENTRY_DSN` (build-time, GitHub Actions) y por qué no es la misma variable ni el mismo
  mecanismo; por qué cambiar una env var en Render no alcanza sin reiniciar; y el bug real de
  `cambiarEstado` sin validar el id — por qué un 500 ahí es peor que un 400, y cómo se vería el
  fix.
- **Cómo se verificó**: cada paso de la saga del punto 2 se verificó mirando el log de Render
  en vivo, no asumiendo que un cambio había funcionado; el error final se confirmó viéndolo
  aparecer en el dashboard de Sentry con su propio ID (`PANADERIAS-BACKEND-2`), no solo
  infiriendo que "debería" haber llegado.

> **Pendiente del alumno antes de la defensa:** armar el monitor externo y la demo de
> DOWN/UP que quedó pendiente (punto 4); poder explicar la saga del DSN sin leerla — en
> particular por qué un "Restart" no alcanzó y un deploy sí; y la diferencia entre las dos
> variables de Sentry (runtime vs. build-time).
