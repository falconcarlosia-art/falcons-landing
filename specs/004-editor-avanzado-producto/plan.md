# Implementation Plan: Editor Avanzado de Contenido de Producto

**Feature Branch**: `004-editor-avanzado-producto`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-03

**Última actualización**: 2026-08-03 (Phase 4 rehecha con tablas oficiales
de Tiptap en vez del Node custom originalmente planeado — ver Technical
Context y Complexity Tracking).

## Summary

Se agrega una columna `specs` (JSONB) a `products` para la ficha técnica
estructurada, con su propio editor de filas label/valor en el panel
(sin usar Tiptap, es un formulario simple). El editor de texto enriquecido
(`003-info-adicional-producto`) se extiende con `tiptap-extension-resize-
image` (reemplaza la extensión `Image` básica) y con la extensión oficial
de tablas de Tiptap (`@tiptap/extension-table`, vía `TableKit`), cuyas
celdas ya aceptan texto e imágenes de forma nativa. La página del producto
renderiza la ficha técnica como tabla propia y sigue renderizando
`extra_info` como HTML, ahora con soporte para imágenes redimensionadas y
tablas con contenido mixto.

## Technical Context

**`tiptap-extension-resize-image`**: paquete verificado (`v1.4.5`, sin
dependencias, publicado hace 2 días al momento de este plan, 32 versiones
publicadas) — reemplaza directamente la extensión oficial `Image` usada en
`003`. Expone controles de redimensionado por arrastre ya resueltos, sin
necesidad de construirlos a mano. El límite de ancho (FR-005) lo resuelve
Tailwind Preflight (`img { max-width: 100% }`), ya activo en todo el
proyecto — no requiere configuración adicional, solo se verificó que el
`.prose` contenedor donde vive el contenido no anule esa regla.

**Combinar imagen + texto — decisión revisada durante la implementación**:
el plan original proponía un Node custom de Tiptap ("bloque imagen + texto
lado a lado", ver historial de este documento). Al implementarlo surgieron
dos bugs reales:
1. El esquema permitía anidar un bloque dentro de otro (el editor no lo
   impedía), generando contenido guardado inválido/roto.
2. Las columnas flex no se encogían por debajo del tamaño natural de la
   imagen (`min-width: auto` es el comportamiento por defecto de flexbox),
   causando que imágenes grandes desbordaran la página.

Al investigar una solución más robusta, se confirmó que la extensión
**oficial** `@tiptap/extension-table` (mantenida por el equipo de Tiptap,
`v3.29.2`, misma versión que el resto de extensiones ya instaladas) permite
por defecto cualquier contenido en bloque dentro de cada celda —incluidas
imágenes— sin ninguna configuración extra (`content: "block+"` ya es el
valor por defecto de `TableCell`/`TableHeader`). Esto cubre el mismo
requerimiento (imagen + texto combinados) de forma más general (cualquier
cantidad de filas/columnas, no solo dos), con menos código propio que
mantener y con el respaldo de una extensión oficial en vez de un Node
custom recién construido. Se descartó el Node custom por completo.

**Especificaciones técnicas**: columna `products.specs jsonb not null
default '[]'`, forma `[{ "label": "Voltaje", "value": "100-240V" }, ...]`.
Editor propio en el panel (lista de filas con inputs label/valor, botones
agregar/quitar/reordenar) — no requiere Tiptap, es un formulario controlado
normal, igual de simple que el editor de imágenes ya existente en
`ProductForm.jsx`.

## Project Structure

### Documentation (this feature)

```
specs/004-editor-avanzado-producto/
├── spec.md
└── plan.md
```

### Source Code (creado/modificado)

```
src/admin/
├── SpecsEditor.jsx                    # filas label/valor: agregar, editar, quitar, reordenar
└── RichTextEditor.jsx                  # Image → ResizableImage; agrega TableKit + botones de tabla
src/admin/ProductForm.jsx               # incluye <SpecsEditor /> además de <RichTextEditor />
src/pages/ProductPage.jsx               # renderiza la tabla de specs (si existen) antes de extra_info
src/index.css                           # CSS de edición de tablas (bordes, celda seleccionada, resize handle)
```

`src/admin/extensions/imageTextBlock.jsx` se creó y luego se eliminó por
completo durante esta misma fase, al reemplazarse por la tabla oficial.

### Base de datos

```sql
alter table public.products
  add column specs jsonb not null default '[]'::jsonb;
```

Sin cambios de RLS — las políticas existentes sobre la fila completa ya
cubren la columna nueva.

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| `specs` como JSONB en la misma fila | Catálogo pequeño, un solo admin — evita una tabla relacional y sus RLS adicionales | Tabla `product_specs` separada — más "correcta" pero innecesaria a esta escala |
| `tiptap-extension-resize-image` sobre construir el resize a mano | Paquete activo y sin dependencias, ya resuelve los controles de arrastre | Extensión de resize propia — reinventa algo ya resuelto y mantenido |
| Tabla oficial (`@tiptap/extension-table`) para imagen+texto | Extensión oficial y mejor mantenida; las celdas ya soportan imágenes sin configuración extra; más general que un bloque fijo de dos columnas | Node custom propio — se implementó primero, tuvo dos bugs reales (anidación, desborde por flexbox) y se descartó; librerías de columnas de la comunidad (`@tiptap-extend/columns`, `@gocapsule/column-extension`) — también descartadas por mantenimiento incierto |
| Reseñas fuera de alcance | Escritura pública requiere un modelo de seguridad y moderación distinto — merece su propio spec | Incluirlas aquí — mezclaría dos modelos de confianza muy distintos en un mismo ciclo |

## Fase 1: Implementation

### Phase 1 — Migración de base de datos
Agregar columna `specs jsonb not null default '[]'` a `products`.
**Bloquea Phase 2.**

### Phase 2 — Ficha técnica (US1)
`SpecsEditor.jsx` (filas label/valor, agregar/quitar/reordenar) integrado
en `ProductForm.jsx`; render de la tabla en `ProductPage.jsx` (solo si
`specs.length > 0`).

### Phase 3 — Imágenes redimensionables (US2)
Reemplazar `@tiptap/extension-image` por `tiptap-extension-resize-image`
en `RichTextEditor.jsx`.

### Phase 4 — Tabla con texto e imágenes por celda (US3)
*(Rehecha durante la implementación — ver Technical Context)*. Se agregó
`TableKit` (de `@tiptap/extension-table`) a `RichTextEditor.jsx`, con
botones de toolbar para insertar tabla y, cuando el cursor está dentro de
una, agregar/quitar fila o columna y eliminar la tabla. Se agregó CSS en
`index.css` (`.ProseMirror table/td/th/.tableWrapper/.selectedCell/.column-
resize-handle`) para que la edición se vea clara. Se eliminó el Node custom
`imageTextBlock` y sus dos bugs junto con él.

### Phase 5 — Verificación de regresión
Confirmar que el contenido creado con `003-info-adicional-producto` (texto
e imágenes simples, sin redimensionar) se sigue viendo exactamente igual;
confirmar que productos sin specs no muestran tabla vacía.

## Dependencias entre fases

```
Phase 1 (migración)
  └─→ Phase 2 (ficha técnica)

Phase 3 (imágenes redimensionables)
  └─→ Phase 4 (tabla con texto e imágenes)
        └─→ Phase 5 (verificación, junto con Phase 2)
```

Phase 2 y Phase 3 son independientes entre sí y pueden hacerse en cualquier
orden.

## Pre-condiciones bloqueantes

Ninguna — reutiliza toda la infraestructura de `001`, `002` y `003`.
