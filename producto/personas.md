# Personas

Roles que usan el sistema. No hay login todavía: los roles describen *quién hace qué*,
no un control de acceso implementado.

---

## Lucía — Encargada de punto de venta

**Sucursal:** Panadería Estrada (tipo `VENTA`).

Abre el local, ve qué falta en el mostrador y pide reposición al depósito o a la
fábrica. Está siempre apurada y con las manos ocupadas.

- **Quiere:** cargar un pedido en menos de un minuto y después ver si ya se lo despacharon.
- **Le molesta:** tener que llamar por teléfono para saber en qué anda su pedido.
- **Historias típicas:** crear pedido, ver estado de sus pedidos.

---

## Rodrigo — Encargado de depósito / fábrica

**Sucursal:** Depósito Central (`DEPOSITO`) y Panadería Viedma (`FABRICA`).

Recibe los pedidos de los locales, los prepara, los carga en la camioneta y los marca
como despachados. Trabaja contra una lista de pendientes.

- **Quiere:** ver todos los pedidos `PENDIENTE` ordenados, ir marcándolos como
  `EN PREPARACIÓN` y `DESPACHADO`, y que el sistema no lo deje saltear pasos.
- **Le molesta:** preparar un pedido y darse cuenta tarde de que no había insumo.
- **Historias típicas:** listar pedidos por estado, avanzar el estado de un pedido,
  ver el impacto en stock al despachar.

---

## Sofía — Responsable de producción y compras

**Sucursal:** Panadería Viedma (`FABRICA`).

Controla que nunca falte harina, levadura ni manteca. Define el stock mínimo de cada
insumo y repone cuando hace falta.

- **Quiere:** una pantalla que le diga de un vistazo qué insumo está por debajo del
  mínimo, y poder actualizar el stock cuando llega un proveedor.
- **Le molesta:** enterarse de un faltante por un pedido que no se pudo despachar.
- **Historias típicas:** alta/edición de insumo, alerta de bajo stock, revisar consumo
  de insumos por despachos.

---

## Martín — Administrador del sistema

**Rol transversal** (es el mismo Joaquín, o quien mantenga la app).

Da de alta sucursales y productos, y define la receta de cada producto (qué insumos y
en qué cantidad consume). Entra poco pero cuando entra es para configurar.

- **Quiere:** cargar el catálogo una vez y olvidarse.
- **Historias típicas:** ABM de sucursales, ABM de productos, definición de recetas.

---

## Resumen

| Persona | Rol | Épicas donde aparece |
|---|---|---|
| Lucía | Encargada de venta | E1 Pedidos, E2 Ciclo de vida |
| Rodrigo | Encargado de depósito | E1 Pedidos, E2 Ciclo de vida, E4 Consumo de insumos |
| Sofía | Producción / compras | E3 Stock, E4 Consumo de insumos |
| Martín | Admin | E5 Catálogo, E4 (recetas) |
