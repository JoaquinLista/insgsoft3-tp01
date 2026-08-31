# Guía de defensa — TP2 (Contenedores)

Preguntas de defensa con una respuesta corta y defendible, y dónde está en el repo.
La regla de la materia: *"si no lo podés explicar, no lo aprobás — aunque funcione"*.
Estudiar de acá, no leerlo el día de la defensa.

---

## Conceptos base

**¿Imagen vs. contenedor?**
La **imagen** es la plantilla inmutable (sistema de archivos + metadatos, en capas). El
**contenedor** es una instancia en ejecución de una imagen, con una capa de escritura
propia y efímera. Analogía: clase / objeto.

**¿`CMD` vs. `ENTRYPOINT`? ¿Cuál usamos y por qué?**
`ENTRYPOINT` fija el ejecutable; `CMD` da argumentos por defecto que se pueden
sobreescribir desde la línea de comandos. Nosotros usamos **`CMD`** (`["node","src/index.js"]`
y `["nginx","-g","daemon off;"]`) porque queremos poder correr `docker run ... sh` para
depurar sin pelear con el entrypoint. Forma *exec* (JSON), no *shell*, para que la señal
de `docker stop` llegue directo al proceso (PID 1).
→ `backend/Dockerfile:28`, `frontend/Dockerfile:21`

**¿`docker compose down` vs. `down -v`?**
`down` para y borra contenedores y red, **conserva los volúmenes** → los datos de Postgres
sobreviven. `down -v` además **borra los volúmenes** → la base vuelve a cero y se
re-ejecuta el seed. Probado en `evidencias.md` §3.

**¿`restart: unless-stopped`?**
Si el contenedor se cae (o reinicia el host / Docker), Docker lo vuelve a levantar, salvo
que vos lo hayas parado a mano. Fiabilidad básica sin orquestador.

---

## Dockerfiles

**¿Por qué multi-stage?**
Separa lo que se necesita para **construir** de lo que se necesita para **ejecutar**.
- *Frontend:* la etapa `build` (Node + `node_modules` + fuente) pesa **314 MB**; la imagen
  final es **nginx:alpine + `dist/` = 73.9 MB** (−76%). **Node no llega a producción.**
- *Backend:* el runtime necesita Node igual, así que no achica tanto, pero la etapa `deps`
  usa `npm ci --omit=dev` → no viajan devDependencies, ni el cache de npm, ni herramientas
  de build.
→ `frontend/Dockerfile`, `backend/Dockerfile`, `evidencias.md` §4

**¿Por qué el orden `COPY package*.json` → `npm ci` → `COPY` del código?**
**Cache de capas.** Docker cachea cada instrucción; una capa se rehace solo si cambió su
entrada. Si copiás el código antes de instalar, cualquier cambio de una línea invalida el
`npm ci` y reinstala todo. Con este orden, cambiar código no reinstala dependencias.
→ `backend/Dockerfile:8-11`

**¿Por qué `npm ci` y no `npm install`?**
`npm ci` instala **exactamente** lo que dice `package-lock.json` (y falla si el lock no
coincide con `package.json`). `npm install` puede resolver versiones nuevas → builds no
reproducibles. Por eso el `package-lock.json` se commitea.
→ `backend/Dockerfile:10`, `frontend/Dockerfile:9`

**¿Por qué el frontend final es nginx y no Node?**
La SPA compilada son archivos estáticos (`dist/`). Servirlos no necesita Node; nginx lo
hace mejor y con muchísima menos superficie de ataque. Además nginx hace el `proxy_pass`
de `/api`.
→ `frontend/Dockerfile:13-18`

**¿Por qué `USER app` en el backend?**
El contenedor corre como usuario **sin privilegios**, no root. Si alguien escapa del
proceso, no tiene root dentro del contenedor. Defensa en profundidad.
→ `backend/Dockerfile:19,25`

**¿Para qué el `LABEL org.opencontainers.image.source`?**
Vincula la imagen publicada con el repo de GitHub: en la página de Packages aparece el
link al código. Lo usa ghcr para asociar la imagen al repositorio.
→ los 3 Dockerfiles

---

## Compose — orden y disponibilidad

**¿`depends_on` garantiza que la base esté lista?**
**No.** `depends_on` a secas solo garantiza el **orden de arranque** (db se inicia antes que
backend). No espera a que Postgres acepte conexiones.

**¿Cómo se resuelve entonces?**
1. `db` tiene un **healthcheck** (`pg_isready`).
2. `backend` depende de `db` con `condition: service_healthy` → espera a que el healthcheck
   pase (Postgres aceptando conexiones y scripts de init terminados).
3. `frontend` depende de `backend` igual, con su propio healthcheck (`fetch` a `/api/health`).
4. **Defensa en profundidad:** además `backend/src/index.js` reintenta la conexión
   (15 intentos × 2 s) antes de escuchar, por si el healthcheck no alcanza.
→ `docker-compose.yml:17-22, 43-55, 68-70`

**¿Por qué el puerto 3000 y no 8080?**
Es el puerto que escucha Express (`PORT: 3000`). No es 8080 porque no seguimos el sample
.NET de la cátedra. El frontend **nunca** conoce este puerto: llama a rutas relativas y
nginx traduce.
→ `docker-compose.yml:35,41-42`

---

## Red y nginx

**¿Por qué la SPA no puede llamar a `http://backend:3000`?**
El JavaScript de la SPA corre en el **navegador del usuario**, que está fuera de la red de
compose. El nombre `backend` solo lo resuelve el DNS interno de Docker.

**¿Cómo llega entonces la SPA al backend?**
La SPA llama a rutas **relativas** (`/api/...`). Esas llegan a nginx (puerto 80), y nginx
hace `proxy_pass` a `http://backend:3000` por la red interna. Para el navegador todo es el
mismo origen → **no hay CORS que configurar**.
→ `frontend/nginx.conf:19-30`, `frontend/src/App.jsx` (`const API = '/api'`)

**¿Por qué `resolver 127.0.0.11` y `set $backend_api` en nginx?**
`127.0.0.11` es el DNS interno de Docker. Poniendo el upstream en una **variable**, nginx
resuelve el nombre `backend` **en cada request**, no al arrancar. Con el nombre escrito
directo en `proxy_pass`, nginx se niega a levantar si el backend todavía no existe
(`host not found in upstream`).
→ `frontend/nginx.conf:16-17`

**¿Por qué `proxy_pass` sin barra final?**
Sin la barra, nginx **preserva la URI completa**: `/api/pedidos` → `http://backend:3000/api/pedidos`.
Con barra final, la recortaría.
→ `frontend/nginx.conf:23`

**¿Red bridge propia?**
`panaderias_net` (driver bridge). Los servicios se resuelven por nombre vía el DNS de
compose (`POSTGRES_HOST=db`). Red propia = aislamiento de otros proyectos en la misma
máquina.
→ `docker-compose.yml:78-80`

---

## Base de datos

**¿Por qué una imagen propia de la base y no un bind mount del `init.sql`?**
`docker-compose.registry.yml` tiene que levantar el sistema **sin el código del repo**. Si
`init.sql` fuera un bind mount, el repo seguiría siendo necesario. Empaquetándolo en la
imagen (`FROM postgres:15-alpine` + `COPY init.sql`), la imagen es autosuficiente.
→ `database/Dockerfile`

**¿Cuándo corre `init.sql`?**
Solo la **primera vez** que se inicializa el volumen (mecanismo
`/docker-entrypoint-initdb.d` de la imagen oficial de Postgres). Si el volumen ya tiene
datos, no corre. Por eso el script es **idempotente igual** (`CREATE TABLE IF NOT EXISTS`,
`INSERT ... ON CONFLICT DO NOTHING`): para re-aplicarlo hay que hacer `down -v`.
→ `database/init.sql`

**¿Qué persiste y qué no?**
Persiste solo lo que está en el volumen nombrado `postgres_data`
(`/var/lib/postgresql/data`). Todo lo demás es efímero: los contenedores se recrean sin
pérdida.
→ `docker-compose.yml:15-16, 74-76`

---

## Secretos

**¿Por qué `${POSTGRES_PASSWORD:?...}` y no un valor por defecto?**
La sintaxis `:?mensaje` hace que **compose falle con un mensaje claro** si `.env` no
define la variable, en vez de arrancar con la contraseña vacía o con un default metido en
el YAML.
→ `docker-compose.yml:14,40`

**¿Por qué `POSTGRES_DB` y `POSTGRES_USER` van literales y la contraseña no?**
El nombre de la base y el usuario **no son secretos**. La contraseña sí: entra por `.env`,
que está en `.gitignore`. Se commitea `.env.example` con un placeholder.
→ `docker-compose.yml:10-14`, `.gitignore`

**¿Y en el TP4?**
Estos secretos migran a la plataforma de CI (secrets del pipeline).

---

## Registry

**¿Por qué GitHub Container Registry y no Docker Hub?**
La cuenta ya existe (la de GitHub del TP1), las imágenes quedan junto al código, y en el
TP7 Actions se autentica contra ghcr **sin secretos** (con el `GITHUB_TOKEN` del workflow).

**¿Qué hizo falta para publicar?**
Un **PAT classic** con scope `write:packages` (los fine-grained no funcionan con ghcr) y
hacer **públicas** las tres imágenes a mano (nacen privadas).

**¿Qué demuestra `docker-compose.registry.yml`?**
Que el sistema levanta **sin el código y sin credenciales**: `docker logout ghcr.io`,
borrar las imágenes locales, `docker compose -f docker-compose.registry.yml up -d`, y
`curl /api/health` responde `ok`. Probado en `evidencias.md` §5.

**¿Limitación conocida?**
Las imágenes se construyeron en una PC Intel/AMD → sirven para `linux/amd64`. Una máquina
ARM recibe `no matching manifest`. Se resuelve en el **TP7** con `docker buildx` (build
multi-arch).

---

## Checklist de `elegir-app.md` (a rehacer a mano, ~20 min)

1. **Corre localmente hoy** — `docker compose up -d --build` end-to-end.
2. **Comandos de build/arranque conocidos** — backend `npm ci` / `node src/index.js`;
   frontend `npm ci` / `npm run build` (lo sirve nginx).
3. **Config de la base por variable de entorno** — `backend/src/config/db.js` lee
   `POSTGRES_HOST/PORT/DB/USER/PASSWORD`; nada hardcodeado.
4. **Lógica para testear (TP5)** — origen ≠ destino, cantidad > 0, upsert de insumo,
   cálculo de `bajo_stock`, validación de estado. **Pendiente de reforzar:** máquina de
   estados del pedido y descuento de stock al despachar (ver `producto/epicas.md` E2 y E4).
5. **Se entiende para modificarla** — a cargo del alumno (ver "Uso de IA").

---

## Uso de IA (exigido por el reglamento §6)

- **Qué se hizo con IA:** generación inicial completa del código (backend 3 capas,
  frontend React, `init.sql`), de los Dockerfiles, del compose, del `nginx.conf` y de la
  primera versión de `decisiones.md`, con Claude Code, a partir de una spec del alumno.
- **Cómo se verificó:** build y arranque reales (3 servicios `healthy`/`running`), prueba
  funcional de cada endpoint y de los casos de error, prueba de persistencia, revisión
  línea por línea de Dockerfiles y compose contra la guía del TP2.
- **Lo que tiene que poder el alumno:** explicar cada línea (esta guía), rehacer el
  checklist a mano, y responder las preguntas de arriba sin leerlas.
