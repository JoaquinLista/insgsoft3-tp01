# Producto

Definición funcional de la aplicación del semestre (**Red de Panaderías · Gestión Interna**).
Esta carpeta describe *qué* hace el sistema y *para quién*; el *cómo* técnico vive en
[`../decisiones.md`](../decisiones.md).

## Contenido

| Archivo | Para qué sirve |
|---|---|
| [`vision.md`](vision.md) | Problema, propuesta de valor, objetivos medibles y alcance. Lo que se defiende primero. |
| [`personas.md`](personas.md) | Los roles que usan el sistema y qué necesita cada uno. |
| [`glosario.md`](glosario.md) | Lenguaje ubicuo: un término, una definición. Evita ambigüedades en la defensa y en el código. |
| [`epicas.md`](epicas.md) | Las grandes líneas de trabajo, cada una cruzada con el TP donde aterriza. |
| [`historias/`](historias/) | Una historia de usuario por archivo, con criterios de aceptación en formato Gherkin. |
| [`requerimientos-no-funcionales.md`](requerimientos-no-funcionales.md) | Los RNF (rendimiento, fiabilidad, portabilidad, seguridad…), cuantificados y cruzados con `decisiones.md`. |
| [`trazabilidad.md`](trazabilidad.md) | Matriz que conecta épica → historia → endpoint/archivo → test del TP5, y las dependencias entre historias. |

## Diagramas

Están embebidos (Mermaid) en el documento al que pertenecen, se renderizan solos en GitHub:

| Diagrama | Dónde |
|---|---|
| Casos de uso (4 actores × funcionalidades) | [`epicas.md`](epicas.md) |
| Modelo de dominio (clases conceptual) | [`glosario.md`](glosario.md) |
| Máquina de estados del pedido | [`historias/HU-08-avanzar-estado-pedido.md`](historias/HU-08-avanzar-estado-pedido.md) |
| Flujo de "despachar un pedido" | [`historias/HU-11-descuento-insumos-al-despachar.md`](historias/HU-11-descuento-insumos-al-despachar.md) |

## Cómo se usa

1. Cada historia nace en `historias/` a partir de [`historias/_plantilla.md`](historias/_plantilla.md).
2. Los **criterios de aceptación** (bloques `Escenario:`) son la fuente de los casos de
   prueba del TP5. Si un criterio no se puede escribir como test, está mal redactado.
3. Los commits que implementan una historia la referencian en el mensaje
   (`refs HU-08` / `implementa HU-11`).
4. El estado de cada historia (`Propuesta` → `Lista` → `En curso` → `Hecha`) se
   actualiza en su propio archivo.

## Estado

Primera pasada (clase ~4, P1). Están la visión, las personas, el glosario, las 6 épicas,
3 historias completas de referencia (una por cada épica funcional que todavía no está
resuelta en el código), los requerimientos no funcionales, la matriz de trazabilidad y
cuatro diagramas. El resto del backlog se completa historia por historia.
