# Matriz de trazabilidad

La trazabilidad conecta cada necesidad desde que se releva hasta que se prueba, para poder
**evaluar el impacto de un cambio** antes de hacerlo y para demostrar que nada quedó sin
implementar ni sin testear.

Se mantienen tres vínculos (Sommerville, *información de rastreo*):

1. **De la fuente** — quién pidió la historia (persona de `personas.md`).
2. **De requerimientos** — qué historias dependen de qué otras.
3. **De diseño** — qué endpoint / archivo / test implementa cada historia.

---

## 1. Épica → Historia → Diseño → Prueba

| Épica | Historia | Persona | Endpoint / superficie | Archivos | Test TP5 | Estado |
|-------|----------|---------|-----------------------|----------|----------|--------|
| E1 | HU-01 Crear pedido | Lucía | `POST /api/pedidos` | `pedidosService.js`, `pedidosController.js`, `App.jsx` (`TableroPedidos`) | back ×3 (alta OK, origen=destino, cantidad ≤ 0) | Hecha |
| E1 | HU-02 Listar pedidos | Lucía | `GET /api/pedidos` | `pedidosService.js` (`listarPedidos`) | back ×1 (sin N+1, detalle agrupado) | Hecha |
| E1 | HU-03 Ver detalle de un pedido | Lucía | `GET /api/pedidos` (detalle embebido) | `App.jsx` | — | Propuesta |
| E2 | HU-08 Avanzar estado | Rodrigo | `PATCH /api/pedidos/:id` *(nuevo)* | `pedidosService.js` (`cambiarEstado` + tabla de transiciones), `init.sql` | back ×2 (transición válida, salto rechazado) | Lista |
| E2 | HU-09 Cancelar pedido | Rodrigo | `PATCH /api/pedidos/:id` (`CANCELADO`) | ídem HU-08 | back ×1 | Propuesta |
| E2 | HU-10 Rechazar transición inválida | Rodrigo | `PATCH /api/pedidos/:id` | ídem HU-08 | back ×1 (409 + estado sin cambios) | Propuesta |
| E3 | HU-04 Alta / edición de insumo | Sofía | `POST /api/insumos` | `insumosService.js` (`guardarInsumo`), `App.jsx` (`GestionInsumos`) | back ×1 (upsert por nombre) | Hecha |
| E3 | HU-05 Alerta de bajo stock | Sofía | `GET /api/insumos` | `insumosService.js` (flag `bajo_stock`), `App.jsx` | front ×1 (badge visible) | Hecha |
| E3 | HU-06 Validar stock no negativo | Sofía | `POST /api/insumos` | `App.jsx` + validación backend | back ×1 / front ×1 | Hecha |
| E4 | HU-07 Definir receta de un producto | Martín | `POST /api/recetas` *(nuevo)* | `init.sql` (tabla `recetas`), servicio nuevo | back ×1 | Propuesta |
| E4 | HU-11 Descontar insumos al despachar | Rodrigo / Sofía | `PATCH /api/pedidos/:id` (`DESPACHADO`) | `pedidosService.js`, `insumosService.js`, `init.sql` | back ×3 (descuento, suma multi-ítem, rollback) | Propuesta |
| E4 | HU-12 Rechazar despacho por stock insuficiente | Rodrigo | `PATCH /api/pedidos/:id` | ídem HU-11 | back ×1 (rechazo, stock sin tocar) | Propuesta |
| E5 | HU-13 ABM de sucursales | Martín | `/api/sucursales` (POST/PUT/DELETE) *(nuevo)* | `sucursalesService.js`, `init.sql` | back ×1 | Propuesta |
| E5 | HU-14 ABM de productos | Martín | `/api/productos` (POST/PUT/DELETE) *(nuevo)* | `productosService.js` | back ×1 | Propuesta |
| E6 | HU-15 Filtrar pedidos por estado | Rodrigo | `GET /api/pedidos?estado=` *(nuevo)* | `pedidosService.js`, `App.jsx` | front ×1 | Propuesta |
| E6 | HU-16 Tablero de pendientes del depósito | Rodrigo | vista de solo lectura | `App.jsx` | — | Propuesta |

**Cobertura de test del TP5:** las historias marcadas suman **~19 tests de backend** y
**~4 de frontend** posibles; el TP5 pide 8 + 4. HU-01, HU-08 y HU-11 solas ya cubren el
mínimo de backend.

---

## 2. Dependencias entre historias

Una `D` = la historia de la fila **no se puede implementar** sin la de la columna.
Una `R` = relación más débil (conviene revisarlas juntas).

| ↓ depende de → | HU-01 | HU-07 | HU-08 |
|----------------|-------|-------|-------|
| HU-02          | R     |       |       |
| HU-08          | D     |       |       |
| HU-09          | D     |       | R     |
| HU-10          |       |       | D     |
| HU-11          | D     | D     | D     |
| HU-12          | D     | D     | D     |
| HU-15          | R     |       | R     |

Lectura: tocar **HU-08** (la máquina de estados) impacta HU-09, HU-10, HU-11 y HU-12 — es
el nodo más sensible del backlog y conviene cerrarlo con cuidado antes del TP5.

---

## 3. Historia → RNF asociados

| Historia | RNF que la condicionan |
|----------|------------------------|
| HU-01 | RNF-01 (alta < 1 s), RNF-06 (atomicidad), RNF-07 (validación en front y back) |
| HU-05 | RNF-08 (bajo stock destacado) |
| HU-08 | RNF-06 (cambio de estado transaccional) |
| HU-11 | RNF-06 (descuento + estado en una transacción), RNF-01 |
| todas | RNF-13 (PR a `main`), RNF-14 (build reproducible), RNF-17 (cobertura TP5) |

---

## 4. Requerimientos → etapas del proceso

Según el modelo en cascada de la cátedra, los requerimientos alimentan diseño,
implementación y **testing de aceptación**:

```
producto/ (visión, épicas, historias, RNF)
        │
        ├─▶ diseño ......... decisiones.md (arquitectura, contenedores)
        ├─▶ implementación .. backend/ frontend/ database/
        └─▶ verificación .... tests del TP5  ◀── criterios de aceptación (Gherkin) de historias/
```

---

## Mantenimiento

- Cada vez que una historia se implementa, se completa su fila (archivos reales, nº de
  commit, tests) y se pasa su estado a `Hecha`.
- Los commits referencian la historia: `implementa HU-08` / `refs HU-11`.
- Si un cambio propuesto toca una historia con dependencias `D`, se revisa el impacto
  en las historias dependientes **antes** de estimarlo.
