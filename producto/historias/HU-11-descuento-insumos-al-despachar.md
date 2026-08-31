# HU-11 — Descontar insumos al despachar un pedido

- **Épica:** E4 — Consumo de insumos al despachar
- **Persona:** Rodrigo (encargado de depósito) / Sofía (producción)
- **Prioridad:** Must
- **Estimación:** L
- **Estado:** Propuesta
- **Depende de:** HU-07 (definir receta de un producto), HU-08 (avanzar estado)

## Historia

> Como **responsable de producción**
> quiero **que al despachar un pedido el sistema descuente los insumos que ese pedido consume**
> para **que el stock refleje la realidad sin que nadie tenga que ajustarlo a mano**.

## Contexto y notas

- Necesita el modelo de **receta** (HU-07): una tabla `recetas (producto_id, insumo_id,
  cantidad_por_unidad)`. Sin receta cargada, un producto consume 0 insumos y el despacho
  no descuenta nada (no falla).
- El descuento ocurre **solo** en la transición `EN_PREPARACION → DESPACHADO`. Ninguna
  otra transición toca el stock.
- Cálculo: para cada ítem del pedido,
  `consumo(insumo) += cantidad_del_item × cantidad_por_unidad_de_la_receta`.
  Se suman los consumos de todos los ítems antes de tocar la base.
- **Atomicidad:** el chequeo de stock, el descuento y el cambio de estado van en una
  sola transacción. Si algo falla, no cambia ni el stock ni el estado.
- El caso "no alcanza el stock" se especifica en **HU-12**; acá se cubre el camino feliz
  y se referencia el rechazo.
- El descuento **puede dejar un insumo por debajo del mínimo** (eso es válido y dispara
  la alerta de bajo stock de HU-05); lo que no puede es dejarlo **negativo**.

## Criterios de aceptación

```gherkin
Escenario: Despacho descuenta los insumos según la receta
  Dado que la receta de "Medialunas" es 1 kg de "Harina 000" y 0,2 kg de "Manteca" por docena
    Y que hay 150 kg de "Harina 000" y 80 kg de "Manteca" en stock
    Y un pedido en "EN_PREPARACION" con 10 docenas de "Medialunas"
  Cuando despacho el pedido
  Entonces el pedido queda en estado "DESPACHADO"
    Y el stock de "Harina 000" pasa a 140 kg
    Y el stock de "Manteca" pasa a 78 kg

Escenario: Despacho de un pedido con varios productos suma el consumo por insumo
  Dado que "Medialunas" consume 1 kg de "Harina 000" por docena
    Y que "Pan Baguette" consume 0,15 kg de "Harina 000" por unidad
    Y que hay 150 kg de "Harina 000"
    Y un pedido en "EN_PREPARACION" con 10 docenas de "Medialunas" y 20 de "Pan Baguette"
  Cuando despacho el pedido
  Entonces el stock de "Harina 000" pasa a 137 kg
    Y el descuento total (13 kg) se aplicó en una sola operación

Escenario: Despacho de un producto sin receta no descuenta nada
  Dado un producto "Factura de grasa" sin receta cargada
    Y un pedido en "EN_PREPARACION" con 5 docenas de "Factura de grasa"
  Cuando despacho el pedido
  Entonces el pedido queda en "DESPACHADO"
    Y ningún insumo cambia su stock

Escenario: El descuento puede dejar un insumo bajo el mínimo pero nunca negativo
  Dado 12 kg de "Levadura" con mínimo 15 kg
    Y un pedido cuya receta consume 4 kg de "Levadura"
  Cuando despacho el pedido
  Entonces el stock de "Levadura" pasa a 8 kg
    Y "Levadura" aparece marcada como bajo stock

Escenario: Si el despacho falla, no cambia ni el stock ni el estado
  Dado un pedido en "EN_PREPARACION"
  Cuando el descuento de stock falla a mitad de camino (error de base)
  Entonces el pedido sigue en "EN_PREPARACION"
    Y ningún insumo cambió su stock
```

## Fuera de alcance de esta historia

- Definir/editar la receta de un producto (HU-07).
- El rechazo por stock insuficiente y su mensaje (HU-12).
- Reponer stock al cancelar un pedido ya despachado (no se permite esa transición).
- Historial de movimientos de stock (posible historia futura de E3/E6).

## Trazabilidad

- Endpoint: la transición de HU-08 (`PATCH /api/pedidos/:id` con `estado: "DESPACHADO"`)
- Tablas nuevas: `recetas`
- Archivos: `backend/src/services/pedidosService.js`, `backend/src/services/insumosService.js`, `database/init.sql`
- Tests (TP5): camino feliz + suma multi-ítem + rollback = 3 tests fuertes de backend
