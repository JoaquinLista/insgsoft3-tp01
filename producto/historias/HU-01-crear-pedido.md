# HU-01 — Crear un pedido entre sucursales

- **Épica:** E1 — Gestión de pedidos entre sucursales
- **Persona:** Lucía (encargada de punto de venta)
- **Prioridad:** Must
- **Estimación:** M
- **Estado:** Hecha
- **Depende de:** —

## Historia

> Como **encargada de un punto de venta**
> quiero **registrar un pedido de productos a otra sucursal, con varios ítems**
> para **pedir reposición sin llamar por teléfono y dejar constancia de qué pedí**.

## Contexto y notas

- Ya implementado en `backend/src/services/pedidosService.js` (`crearPedido`) y en el
  formulario "Nuevo pedido" de `frontend/src/App.jsx`.
- El alta es **transaccional**: el pedido y todos sus detalles se insertan juntos o no
  se inserta nada (`BEGIN` / `COMMIT` / `ROLLBACK`).
- El estado inicial por defecto es `PENDIENTE`. El formulario permite elegir otro estado
  inicial; a partir de la épica E2 esto se restringirá a `PENDIENTE` únicamente.
- Esta historia documenta el comportamiento actual para poder testearlo en el TP5.

## Criterios de aceptación

```gherkin
Escenario: Alta de un pedido válido con dos ítems
  Dado que existen las sucursales "Panadería Estrada" (origen) y "Depósito Central" (destino)
    Y que existen los productos "Medialunas" y "Pan Baguette"
  Cuando registro un pedido de "Panadería Estrada" a "Depósito Central"
    con 2 docenas de "Medialunas" y 10 unidades de "Pan Baguette"
  Entonces el pedido queda guardado con estado "PENDIENTE"
    Y tiene una fecha de creación
    Y su detalle tiene exactamente 2 líneas
    Y aparece primero en el listado de pedidos

Escenario: Rechazo cuando origen y destino son la misma sucursal
  Dado la sucursal "Panadería Estrada"
  Cuando intento registrar un pedido de "Panadería Estrada" a "Panadería Estrada"
  Entonces el sistema rechaza el alta con el mensaje
    "La sucursal de origen y destino no pueden ser la misma"
    Y no se crea ningún pedido

Escenario: Rechazo cuando un ítem tiene cantidad cero o negativa
  Dado un pedido de "Panadería Estrada" a "Depósito Central"
  Cuando agrego un ítem de "Medialunas" con cantidad 0
  Entonces el sistema rechaza el alta
    Y no se crea ningún pedido ni ningún detalle

Escenario: Rechazo cuando el pedido no tiene ítems
  Cuando intento registrar un pedido sin ningún ítem
  Entonces el sistema rechaza el alta con el mensaje
    "El pedido debe incluir al menos un detalle"

Escenario: Rechazo cuando una sucursal no existe
  Cuando intento registrar un pedido con una sucursal de destino con id 9999
  Entonces el sistema rechaza el alta con el mensaje
    "Alguna de las sucursales indicadas no existe"
    Y no se crea ningún pedido
```

## Fuera de alcance de esta historia

- Validar que el origen sea depósito/fábrica y el destino un punto de venta (regla de
  negocio no acordada todavía).
- Restringir el estado inicial a `PENDIENTE` (lo hace E2).
- Descontar stock de insumos (lo hace E4).

## Trazabilidad

- Endpoints: `POST /api/pedidos`, `GET /api/pedidos`
- Archivos: `backend/src/services/pedidosService.js`, `backend/src/controllers/pedidosController.js`, `frontend/src/App.jsx` (`TableroPedidos`)
- Tests (TP5): candidatos a 3 de los 8 tests de backend
