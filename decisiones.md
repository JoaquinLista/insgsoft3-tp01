# Decisiones

Documento acumulativo de la práctica de ISW3. Cada TP agrega su sección.

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
| PR de revert (#2) abierto por error / prueba | Se estaba practicando el mecanismo de revert. | Se cerró sin mergear; la sección de instalación se rehízo limpia en el PR #3. |

### 7. Uso de IA

- **Qué se hizo con IA:** la redacción de esta sección de `decisiones.md` y de la sección
  TP1 de `evidencias.md` se reconstruyó con **Claude (Claude Code)** a partir del historial
  del repositorio (commits, PRs, configuración de protección de rama vía API de GitHub),
  porque el TP1 no se documentó en el momento.
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

> **Pendiente del alumno:** confirmar el relato del PR #2 (revert) — se describió como
> "prueba del mecanismo de revert de GitHub, después descartada"; ajustar si fue otra cosa.

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
  redactada por el alumno.
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
  `.github/workflows/ci.yml` y su PR (#20, `Closes #17`), y la redacción de esta sección.
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
  (capturas en [`evidencias.md`](evidencias.md) §TP4).

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
  corridas y el `CACHED` en los logs vía `gh run view --log`, y se redactó esta sección.
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
