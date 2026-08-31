# HU-08 — Avanzar el estado de un pedido

- **Épica:** E2 — Ciclo de vida del pedido
- **Persona:** Rodrigo (encargado de depósito / fábrica)
- **Prioridad:** Must
- **Estimación:** M
- **Estado:** Lista
- **Depende de:** HU-01

## Historia

> Como **encargado de depósito**
> quiero **mover un pedido al siguiente estado de su ciclo de vida**
> para **que el local que lo pidió vea en qué anda sin preguntarme**.

## Contexto y notas

- Hoy el schema tiene `pedidos.estado` con un `CHECK` sobre la lista de valores, pero
  **cualquier transición es aceptada** (se puede pasar de `PENDIENTE` a `ENTREGADO`
  directo, o volver de `DESPACHADO` a `PENDIENTE`). Esta historia introduce la máquina
  de estados.
- Transiciones válidas (ver `epicas.md` E2):

  | Desde | Hacia permitido |
  |---|---|
  | `PENDIENTE` | `EN_PREPARACION`, `CANCELADO` |
  | `EN_PREPARACION` | `DESPACHADO`, `CANCELADO` |
  | `DESPACHADO` | `ENTREGADO` |
  | `ENTREGADO` | — (final) |
  | `CANCELADO` | — (final) |

  ```mermaid
  stateDiagram-v2
      [*] --> PENDIENTE
      PENDIENTE --> EN_PREPARACION
      PENDIENTE --> CANCELADO
      EN_PREPARACION --> DESPACHADO: descuenta insumos (HU-11)
      EN_PREPARACION --> CANCELADO
      DESPACHADO --> ENTREGADO
      ENTREGADO --> [*]
      CANCELADO --> [*]
  ```

  Cualquier transición que no sea una flecha de este diagrama se rechaza (HU-10): saltos
  (`PENDIENTE → DESPACHADO`), retrocesos (`DESPACHADO → EN_PREPARACION`), salir de un
  estado final (`ENTREGADO`, `CANCELADO`) y estados inexistentes. Cada flecha es un caso
  de test que pasa; cada no-flecha, un caso de test que rechaza.

- La cancelación se trata en **HU-09**; el rechazo de transiciones inválidas, en **HU-10**.
- El **descuento de stock** al entrar en `DESPACHADO` lo agrega **HU-11**; esta historia
  asume que hay stock y solo cambia el estado.
- Decisión pendiente para `decisiones.md`: ¿la transición va como `PATCH /api/pedidos/:id`
  con el nuevo estado, o como endpoints por acción (`POST /api/pedidos/:id/despachar`)?
  Propuesta: `PATCH` con `{ "estado": "DESPACHADO" }`, más simple y REST-ish.

## Criterios de aceptación

```gherkin
Escenario: Avanzar un pedido pendiente a en preparación
  Dado un pedido en estado "PENDIENTE"
  Cuando lo muevo a "EN_PREPARACION"
  Entonces el pedido queda en estado "EN_PREPARACION"
    Y el cambio se refleja en el listado de pedidos

Escenario: Recorrido completo del ciclo de vida
  Dado un pedido en estado "PENDIENTE"
  Cuando lo muevo a "EN_PREPARACION", luego a "DESPACHADO", luego a "ENTREGADO"
  Entonces cada transición es aceptada
    Y el pedido termina en estado "ENTREGADO"

Escenario: Rechazo de un salto de estado
  Dado un pedido en estado "PENDIENTE"
  Cuando intento moverlo directo a "DESPACHADO"
  Entonces el sistema rechaza la transición con un error 409
    Y el pedido sigue en estado "PENDIENTE"

Escenario: Rechazo de un retroceso de estado
  Dado un pedido en estado "DESPACHADO"
  Cuando intento moverlo a "EN_PREPARACION"
  Entonces el sistema rechaza la transición
    Y el pedido sigue en estado "DESPACHADO"

Escenario: Rechazo de transición desde un estado final
  Dado un pedido en estado "ENTREGADO"
  Cuando intento moverlo a cualquier otro estado
  Entonces el sistema rechaza la transición
    Y el pedido sigue en estado "ENTREGADO"

Escenario: Rechazo de un estado inexistente
  Dado un pedido en estado "PENDIENTE"
  Cuando intento moverlo a "EN_CAMINO"
  Entonces el sistema responde 400 por estado inválido
```

## Fuera de alcance de esta historia

- Cancelar un pedido (HU-09).
- El texto y la UX exacta del mensaje de rechazo (HU-10).
- Descuento de insumos (HU-11).
- Registrar quién hizo la transición y cuándo (no hay usuarios todavía).

## Trazabilidad

- Endpoint nuevo: `PATCH /api/pedidos/:id` (a confirmar)
- Archivos: `backend/src/services/pedidosService.js` (función `cambiarEstado` + tabla de
  transiciones), `database/init.sql` (agregar `CANCELADO` al `CHECK`), `frontend/src/App.jsx`
- Tests (TP5): la tabla de transiciones es una fuente natural de casos parametrizados
