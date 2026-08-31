# Visión del producto

## El problema

Una red de panaderías con **una fábrica, un depósito central y tres puntos de venta**
mueve productos entre sucursales todos los días (la fábrica produce, el depósito
almacena, los locales venden y piden reposición). Hoy esos pedidos se coordinan por
teléfono y grupos de WhatsApp:

- No hay un registro único de qué pidió cada local, cuándo y en qué estado está.
- El depósito no sabe qué pedidos tiene que preparar ni en qué orden.
- El área de producción se entera de que falta un insumo (harina, levadura) cuando ya
  no queda, no antes.

## La propuesta de valor

Una aplicación web interna, chica y sin login por ahora, que sea **la única fuente de
verdad** de dos procesos:

1. **Pedidos entre sucursales** — se cargan, se listan y avanzan por un ciclo de vida
   explícito (`PENDIENTE → EN PREPARACIÓN → DESPACHADO → ENTREGADO`).
2. **Stock de insumos** — se registra el stock actual y el mínimo de cada insumo, y el
   sistema avisa cuándo alguno cae por debajo del mínimo.

El sistema **no** reemplaza la facturación, la contabilidad ni el punto de venta al
público. Es coordinación operativa interna.

## Objetivos y métricas de éxito

| Objetivo | Cómo se mide |
|---|---|
| Todo pedido tiene un estado consultable en cualquier momento | 100% de los pedidos con estado válido; ninguno "perdido" |
| El depósito trabaja desde una lista, no desde WhatsApp | Un pedido pasa de `PENDIENTE` a `ENTREGADO` sin salir del sistema |
| Los quiebres de stock se anticipan | El insumo aparece marcado como *bajo stock* **antes** de llegar a cero |
| La carga de un pedido es rápida | Menos de 1 minuto para un pedido de 3 ítems |

## Alcance de la P1 (TPs 1–4)

Dentro:

- Alta y listado de pedidos con su detalle de productos.
- Ciclo de vida del pedido como **máquina de estados** con transiciones válidas.
- Alta y edición de insumos; alerta de bajo stock.
- Descuento de insumos cuando un pedido se despacha (requiere modelar la receta de cada producto).
- Vistas de solo lectura: pedidos registrados, insumos en stock, mapa de la red.

## Fuera de alcance (por ahora)

- Autenticación, usuarios y permisos. Se asume una intranet de confianza.
- Múltiples depósitos o empresas.
- Precios, costos, facturación, remitos legales.
- Notificaciones por mail o push.
- App móvil nativa (la web es responsive y alcanza).
- Reportes históricos y analítica más allá de los contadores de las vistas.

Estos temas pueden entrar como épicas nuevas en la P2 si el enunciado de un TP lo pide.

## Supuestos

- La red es fija: 1 fábrica, 1 depósito, 3 locales. Si cambia, lo carga un admin a mano.
- Un pedido siempre tiene origen y destino distintos.
- Las unidades de medida se cargan como texto libre (`kg`, `docena`, `unidad`); no hay
  conversión entre unidades.
