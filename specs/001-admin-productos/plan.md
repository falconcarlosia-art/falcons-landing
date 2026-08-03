# Implementation Plan: Panel de Administración de Productos

**Feature Branch**: `001-admin-productos`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-07-24

## Summary

Hoy `0WebFalcons` es un sitio 100% estático (Vite + React, sin backend):
el catálogo vive en `products.json` y se empaqueta en el build. Para que el
dueño del negocio pueda administrar el catálogo (crear, editar, ocultar,
eliminar productos y subir imágenes) sin tocar código ni redeployar, el sitio
necesita dejar de ser puramente estático en la parte de datos: se incorpora
**Supabase** (Postgres + Storage + Auth) como backend ligero, se agrega una
ruta `/admin` protegida, y `ProductShowroom` pasa de importar el JSON estático
a leer los productos desde Supabase en tiempo de ejecución. El diseño visual
del sitio público no cambia.

## Technical Context

**Por qué Supabase y no otra opción**: ya lo usas en `financeapp`
(`specs/003-supabase-auth`), así que no hay curva de aprendizaje nueva ni una
herramienta más que mantener. Su plan gratuito (500MB de base de datos, 1GB
de almacenamiento de archivos) sobra ampliamente para un catálogo de
electrodomésticos inteligentes de una PYME. Al ser un backend-as-a-service
con SDK de cliente, un sitio Vite/React puede hablarle directamente sin
necesitar un servidor Node propio — encaja con el hosting estático actual
(Vercel/Netlify).

**Stack actual (sin cambios)**:
- Vite 6 + React 18, Tailwind, `lucide-react`.
- Sin React Router hoy — todo el sitio es una sola vista con anclas (`#productos`, `#contacto`).
- Deploy estático a Vercel/Netlify vía push a `main` en GitHub.

**Piezas nuevas**:
- **Supabase Postgres** — tabla `products` (reemplaza `products.json` como fuente de verdad).
- **Supabase Storage** — bucket `product-images` para los archivos subidos desde el panel.
- **Supabase Auth** — email/password, una sola cuenta (la del dueño), creada manualmente desde el dashboard de Supabase (sin registro público).
- **Row Level Security (RLS)**:
  - Lectura pública (`anon`): solo productos con `active = true`.
  - Escritura (`insert`/`update`/`delete`): solo el usuario autenticado (el admin).
- **Routing**: se agrega `react-router-dom` (dependencia nueva, liviana) para separar `/` (sitio público, sin cambios de diseño) de `/admin` (login + dashboard). Alternativa sin dependencia nueva (leer `window.location.pathname` a mano) queda descartada por legibilidad — el proyecto ya es lo bastante simple para que el costo de una librería estándar de routing sea menor que mantener esa lógica a mano.
- **Variables de entorno**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — se configuran en `.env.local` (no versionado) y en las variables de entorno del hosting (Vercel/Netlify).

## Project Structure

### Documentation (this feature)

```
specs/001-admin-productos/
├── spec.md      # qué y por qué (ya creado)
└── plan.md      # este documento — cómo
```

### Source Code (a crear/modificar)

```
src/
├── lib/
│   └── supabaseClient.js        # cliente Supabase inicializado con env vars
├── admin/
│   ├── AdminLogin.jsx           # formulario de acceso
│   ├── AdminLayout.jsx          # guarda de sesión + logout + navegación interna
│   ├── ProductList.jsx          # listado de productos (activos + ocultos)
│   └── ProductForm.jsx          # alta/edición: campos + carga/orden de imágenes
├── main.jsx                     # agrega react-router-dom, separa rutas "/" y "/admin"
FalconsLanding.jsx                # ProductShowroom pasa de `import productsData from "./products.json"`
                                  # a un fetch a Supabase (useEffect + estado loading/error)
products.json                    # se conserva solo como respaldo/semilla de la migración inicial
```

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Introducir un backend (Supabase) en un sitio antes 100% estático | Persistencia real, carga de archivos y acceso protegido no son posibles solo con archivos estáticos | Mantener `products.json` y editarlo a mano — es exactamente lo que el usuario pidió dejar de hacer |
| Agregar `react-router-dom` | Separar `/admin` del sitio público de forma estándar y legible | Enrutamiento manual por `pathname` — funciona, pero menos mantenible a futuro |
| Supabase sobre Firebase | El usuario ya lo conoce de `financeapp`, cero curva de aprendizaje nueva | Firebase — viable también, pero introduce una herramienta más a mantener sin necesidad |

## Fase 0: Research (pendiente)

- Confirmar límites reales del plan gratuito de Supabase Storage para el volumen de fotos esperado (catálogo pequeño, pocas decenas de productos con ~3-8 fotos cada uno).
- Definir tamaño máximo de imagen aceptado y si se optimiza en el cliente (ej. `browser-image-compression`) antes de subir, o se deja la optimización para una iteración posterior.

## Fase 1: Design (pendiente)

- Esquema de la tabla `products` (columnas = mismos campos que `products.json` hoy, más `active boolean default true`, `created_at`, `updated_at`).
- Esquema de imágenes: columna `images text[]` (array de URLs, igual forma que hoy) vs. tabla separada `product_images`. Recomendado: mantener `images text[]` por simplicidad — no hay necesidad de metadatos por imagen más allá del orden (que es el orden del array).
- Políticas RLS exactas (lectura pública solo `active = true`; escritura solo `auth.uid()` del admin).
- Wireframe simple del panel: login → lista → formulario (no requiere diseño visual elaborado, puede reusar Tailwind del sitio).

## Fase 2: Implementation (orden sugerido)

### Phase 1 — Setup: Supabase + entorno
Crear proyecto Supabase, tabla `products`, bucket `product-images`, políticas
RLS, usuario admin único, variables de entorno locales y en el hosting.
**Bloquea todo lo demás.**

### Phase 2 — Migración de datos
Script puntual (una sola vez) que lee `products.json` y crea las filas
correspondientes en `products` con `active = true`. Las imágenes externas
existentes (Amazon, AliExpress, ibb.co) se conservan como URLs válidas —
no es necesario volver a subirlas a Supabase Storage para que seguir
funcionando; solo las fotos nuevas que cargue el admin irán a Storage.

### Phase 3 — US2: Sitio público lee de Supabase (sin UI de admin todavía)
`ProductShowroom` cambia su fuente de datos a un fetch a Supabase filtrando
`active = true`. **Criterio de éxito**: el sitio público se ve idéntico a
hoy, ahora leyendo desde la base de datos en vez del JSON.

### Phase 4 — US1: Acceso de administrador
Ruta `/admin`, login con Supabase Auth, guarda de sesión, logout.

### Phase 5 — US2 (parte admin): listado y edición
Lista de productos (incluidos ocultos) + formulario de edición de campos de
texto/precio/categoría/app/ícono.

### Phase 6 — US3 + US4: carga de imágenes y alta de producto nuevo
Subida de archivos a Storage, reordenar/eliminar imágenes, formulario de
producto nuevo con validación de al menos una imagen.

### Phase 7 — US5: ocultar/eliminar
Toggle activo/oculto + eliminación permanente con confirmación.

### Phase 8 — Polish
Estados de carga/error/vacío en el panel, verificar que el SEO (JSON-LD,
`alt` de imágenes) siga funcionando igual con datos dinámicos, probar el
flujo completo en mobile y desktop.

## Dependencias entre fases

```
Phase 1 (Setup)
  └─→ Phase 2 (Migración)
        └─→ Phase 3 (Público lee Supabase) ──┐
        └─→ Phase 4 (Login admin)             ├─→ Phase 5 → Phase 6 → Phase 7 → Phase 8
```

Fase 3 y Fase 4 pueden hacerse en paralelo una vez completada la Fase 2 — no
dependen entre sí.

## Pre-condiciones bloqueantes

- El usuario debe crear la cuenta/proyecto de Supabase (paso manual, igual
  que ya hizo para `financeapp`) antes de que arranque la Fase 1.
- Acceso para configurar variables de entorno en el proveedor de hosting
  actual (Vercel/Netlify) donde vive `falcem.com`.
