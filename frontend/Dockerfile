# =============================================================
#  Frontend - build multi-stage (Node 22 -> Nginx alpine)
# =============================================================

# ---- Etapa 1: build de la SPA ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite reemplaza import.meta.env.VITE_* en el bundle en tiempo de BUILD, no de
# arranque (a diferencia de BACKEND_URL/DNS_RESOLVER, que son runtime via
# envsubst) — por eso el DSN de Sentry entra como build-arg, no como ENV de
# la imagen final. No es un secreto real: Sentry publica el DSN a propósito
# en el bundle del cliente para que pueda mandar sus propios eventos.
ARG VITE_SENTRY_DSN
RUN npm run build

# ---- Etapa 2: tests (parte del build: ya tiene Node y las dependencias) ----
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# ---- Etapa 3: servidor de producción ----
FROM nginx:1.27-alpine AS runtime
LABEL org.opencontainers.image.source="https://github.com/JoaquinLista/insgsoft3-tp01"
RUN rm /etc/nginx/conf.d/default.conf
# La imagen oficial de nginx procesa /etc/nginx/templates/*.template con envsubst
# al arrancar y reemplaza las variables ${...} por su valor del entorno.
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Valores por defecto = los de docker-compose (red interna de Docker).
# Render los pisa con las variables que configura cada servicio.
ENV BACKEND_URL=http://backend:3000 \
    DNS_RESOLVER=127.0.0.11

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
