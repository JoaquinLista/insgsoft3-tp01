# HU-XX — Título corto en infinitivo

- **Épica:** EX — Nombre
- **Persona:** Quién (de `personas.md`)
- **Prioridad:** Must / Should / Could / Won't (MoSCoW)
- **Estimación:** XS / S / M / L (o puntos, si se usan)
- **Estado:** Propuesta / Lista / En curso / Hecha
- **Depende de:** HU-YY (o —)

## Historia

> Como **\<persona\>**
> quiero **\<acción / capacidad\>**
> para **\<beneficio / por qué\>**.

## Contexto y notas

Aclaraciones de dominio, decisiones tomadas, links a `decisiones.md`, qué queda afuera
de esta historia.

## Criterios de aceptación

Cada escenario debe poder convertirse en un caso de prueba. Formato Gherkin
(Dado / Cuando / Entonces).

```gherkin
Escenario: <nombre del caso feliz>
  Dado <estado inicial>
  Cuando <acción>
  Entonces <resultado observable>

Escenario: <nombre de un caso de error>
  Dado <estado inicial>
  Cuando <acción inválida>
  Entonces <el sistema rechaza y explica>
    Y <nada cambió>
```

## Fuera de alcance de esta historia

- ...

## Trazabilidad

- Endpoints / archivos afectados: ...
- Commits: ...
- Tests (TP5): ...
