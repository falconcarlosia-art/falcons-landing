# Implementation Plan: Información Adicional del Producto (texto enriquecido)

**Feature Branch**: `003-info-adicional-producto`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-03

## Summary

Se agrega una columna `extra_info` (HTML) a la tabla `products`, editable
desde el panel de administración con un editor visual (Tiptap) que expone
una barra de herramientas simple (negrita, cursiva, títulos, listas) sin que
el administrador escriba código. La página individual del producto
(`002-pagina-producto`) renderiza ese HTML con estilos de
`@tailwindcss/typography` (`prose prose-invert`) para que se vea prolijo en
el tema oscuro del sitio sin CSS a mano.

## Technical Context

**Por qué Tiptap**: es la librería de edición de texto enriquecido para
React más activamente mantenida hoy, con integración limpia vía el hook
`useEditor` (React 18 compatible) y control total sobre qué botones de
formato se exponen — se configura para ofrecer solo negrita, cursiva,
títulos y listas, sin ningún botón de "código fuente" que permita insertar
HTML arbitrario. Versión verificada disponible: `@tiptap/react@3.29.2`,
`@tiptap/starter-kit@3.29.2`.

**Por qué HTML sin sanitizar (por ahora)**: el editor visual ya restringe lo
que se puede insertar — no hay forma de pegar `<script>` a través de su UI
estándar — y el panel tiene un único administrador de confianza
(`001-admin-productos`). Esto es una decisión documentada en
`spec.md → Assumptions`, no un descuido: si el modelo de acceso cambia
(más de un editor), se debe agregar sanitización (ej. `DOMPurify`) antes de
guardar o renderizar.

**Por qué `@tailwindcss/typography`**: da estilos por defecto y consistentes
para todo el HTML que Tiptap puede generar (`h1`-`h3`, `ul`, `ol`, `strong`,
`em`, `p`) mediante clases utilitarias (`prose prose-invert`), sin escribir
CSS caso por caso para cada etiqueta posible. Versión verificada:
`@tailwindcss/typography@0.5.20`.

## Project Structure

### Documentation (this feature)

```
specs/003-info-adicional-producto/
├── spec.md
└── plan.md
```

### Source Code (a crear/modificar)

```
src/admin/
└── RichTextEditor.jsx     # wrapper de Tiptap: toolbar + useEditor, expone value/onChange
src/admin/ProductForm.jsx   # agrega el campo "Información adicional" usando RichTextEditor
src/pages/ProductPage.jsx   # renderiza product.extra_info (si existe) con `prose prose-invert`
tailwind.config.js          # agrega el plugin @tailwindcss/typography
```

### Base de datos

```sql
alter table public.products add column extra_info text;
```

No se requieren cambios de RLS — las políticas existentes sobre la fila
completa (`public_read_active_products`, `admin_update_products`, etc.)
cubren automáticamente la columna nueva.

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Tiptap sobre otros editores WYSIWYG (Quill, Editor.js) | Mantenimiento activo, integración nativa con React 18, control fino sobre qué botones exponer | React Quill — histórico soporte incierto para React 18; Editor.js — formato por bloques en JSON, requeriría un renderer adicional |
| Sin sanitización explícita del HTML (por ahora) | Editor visual sin vía de inserción de HTML crudo + un solo admin de confianza | DOMPurify en guardado/renderizado — más robusto pero innecesario para el modelo de acceso actual; documentado como mejora futura |
| `@tailwindcss/typography` para el renderizado | Estilos consistentes sin CSS manual por etiqueta | Clases Tailwind escritas a mano para cada `h1`-`h3`/`ul`/`ol`/`strong` — más control, mucho más mantenimiento |

## Fase 1: Implementation

### Phase 1 — Migración de base de datos
Agregar la columna `extra_info text` (nullable) a `products` vía
`apply_migration`. **Bloquea todo lo demás.**

### Phase 2 — Editor visual reutilizable
Instalar `@tiptap/react`, `@tiptap/starter-kit`. Crear
`src/admin/RichTextEditor.jsx`: envuelve `useEditor` de Tiptap, expone una
barra de herramientas con negrita/cursiva/H2/H3/lista con viñetas/lista
numerada, y una API simple `{ value, onChange }` para integrarse como
cualquier otro campo controlado del formulario.

### Phase 3 — Integración en el formulario de producto (US1)
En `ProductForm.jsx`, agregar el campo "Información adicional" usando
`RichTextEditor`, incluido en el `select`/`payload` de lectura y guardado
(`desc:description` ya usa alias — aquí simplemente se agrega `extra_info`
tal cual, sin alias, ya que no colisiona con ninguna palabra reservada de
JS).

### Phase 4 — Renderizado en la página del producto (US1, US2)
Instalar `@tailwindcss/typography`, agregarlo a `tailwind.config.js`
(`plugins: [require('@tailwindcss/typography')]`). En `ProductPage.jsx`,
si `product.extra_info` no está vacío, renderizar una sección adicional
con `dangerouslySetInnerHTML` envuelta en `className="prose prose-invert
prose-headings:text-white prose-p:text-slate-400 max-w-none"` (o similar,
ajustado a la paleta ámbar/slate ya en uso). Si está vacío, no se renderiza
nada (US2).

### Phase 5 — Verificación de regresión
Confirmar que productos existentes (sin `extra_info` todavía) siguen
mostrando su página exactamente igual que hoy, y que el formulario de
alta/edición sigue guardando correctamente el resto de los campos.

## Dependencias entre fases

```
Phase 1 (migración)
  └─→ Phase 2 (editor reutilizable)
        └─→ Phase 3 (formulario admin)
        └─→ Phase 4 (render en página de producto)
              └─→ Phase 5 (verificación)
```

## Pre-condiciones bloqueantes

Ninguna — reutiliza la infraestructura ya existente de `001-admin-productos`
y `002-pagina-producto`.
