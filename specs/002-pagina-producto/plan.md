# Implementation Plan: Página Individual de Producto

**Feature Branch**: `002-pagina-producto`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-03

## Summary

Se agrega una ruta pública `/producto/:id/:slug` (usando React Router, ya
instalado para `/admin`) que renderiza una página dedicada a un solo
producto, con su propio `<title>`, meta description y JSON-LD `Product`,
inyectados en tiempo de ejecución con `react-helmet-async`. El catálogo de
la home enlaza el título de cada tarjeta a su página individual, sin alterar
el comportamiento actual del lightbox al hacer clic en la foto.

## Technical Context

**Por qué `react-helmet-async` y no SSR**: el sitio es 100% estático
(Firebase Hosting, sin servidor propio) — introducir SSR real sería un
cambio de arquitectura mucho mayor (requeriría un runtime de servidor o
funciones serverless) para un catálogo pequeño de una PYME. `react-helmet-
async` permite establecer `<title>`, meta tags y JSON-LD por ruta desde el
cliente, lo cual **sí mejora la indexación en Google** (que ejecuta
JavaScript al rastrear), aunque **no mejora la vista previa al compartir el
link** en apps como WhatsApp/Facebook (esos bots no ejecutan JavaScript) —
limitación ya documentada en `spec.md`.

**URL del producto**: `/producto/:id/:slug`, donde `id` es el identificador
real (`bigint` de la tabla `products`) y `slug` es una versión legible del
título generada con una función `slugify` simple (sin tildes, minúsculas,
guiones). El `slug` es cosmético — la búsqueda del producto siempre ocurre
por `id`; si el título cambia, un link viejo con el slug desactualizado
sigue funcionando porque solo se lee el `id` de la URL.

**Refactor necesario**: `Navbar`, `Footer`, `ProductCarousel` y `Lightbox`
hoy son funciones internas no exportadas de `FalconsLanding.jsx`. Para que
la nueva página de producto los reutilice sin duplicar código, se extraen a
archivos propios en `src/components/`. Es una extracción mecánica (mover
código, no reescribirlo) para permitir reuso — no un rediseño.

## Project Structure

### Documentation (this feature)

```
specs/002-pagina-producto/
├── spec.md
└── plan.md
```

### Source Code (a crear/modificar)

```
src/
├── components/
│   ├── Navbar.jsx            # extraído de FalconsLanding.jsx (sin cambios de lógica)
│   ├── Footer.jsx             # extraído de FalconsLanding.jsx (sin cambios de lógica)
│   ├── ProductCarousel.jsx    # extraído de FalconsLanding.jsx (sin cambios de lógica)
│   └── Lightbox.jsx           # extraído de FalconsLanding.jsx (sin cambios de lógica)
├── lib/
│   └── slugify.js             # función pura: título → slug legible
├── pages/
│   └── ProductPage.jsx        # nueva página individual de producto
FalconsLanding.jsx              # importa los componentes extraídos en vez de definirlos;
                                 # las tarjetas del catálogo enlazan el título a /producto/:id/:slug
main.jsx                        # agrega <HelmetProvider> y la ruta "/producto/:id/:slug"
```

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| `react-helmet-async` en vez de SSR | Mejora SEO real (Google ejecuta JS) sin cambiar la arquitectura estática del sitio | SSR/Next.js — reescritura completa del proyecto, desproporcionado para el tamaño del catálogo |
| URL con `id` + slug cosmético | SEO y legibilidad sin necesitar un sistema de slugs únicos ni migraciones de esquema | Slug como clave única en la base de datos — más robusto pero innecesario para un catálogo de este tamaño |
| Extraer componentes a `src/components/` | Evita duplicar `Navbar`/`Footer`/`ProductCarousel`/`Lightbox` entre la home y la página de producto | Duplicar el código en `ProductPage.jsx` — más rápido de escribir pero genera dos fuentes de verdad que divergen con el tiempo |
| Sin sitemap dinámico por producto | Evita introducir una función serverless solo para regenerar el sitemap | Cloud Function que lea Supabase y genere `sitemap.xml` — viable a futuro, no esencial ahora |

## Fase 1: Implementation

### Phase 1 — Extracción de componentes compartidos
Mover `Navbar`, `Footer`, `ProductCarousel`, `Lightbox` desde
`FalconsLanding.jsx` a `src/components/`, actualizando los imports. Sin
cambio de comportamiento visible — es la base para reutilizarlos en la
página de producto. **Bloquea todo lo demás.**

### Phase 2 — Ruta y página de producto (US1, US3)
- `src/lib/slugify.js`.
- `src/pages/ProductPage.jsx`: fetch por `id` a Supabase, estados de carga
  y "no disponible", diseño con `Navbar`/`Footer`/`ProductCarousel`
  reutilizados, botón de WhatsApp con el mismo patrón ya usado en el
  catálogo.
- Nueva ruta en `main.jsx`: `/producto/:id/:slug`.

### Phase 3 — Enlace desde el catálogo (US2)
En `ProductShowroom` (dentro de `FalconsLanding.jsx`), el título de cada
tarjeta pasa a ser un `<Link>` hacia `/producto/${id}/${slugify(title)}`,
sin modificar el `onClick` de la imagen (que sigue abriendo el lightbox).

### Phase 4 — SEO por producto (US4)
Instalar `react-helmet-async`, envolver la app en `<HelmetProvider>` en
`main.jsx`, y en `ProductPage.jsx` declarar `<Helmet>` con título, meta
description, Open Graph y JSON-LD `Product` específicos del producto
cargado.

### Phase 5 — Verificación de regresión
Confirmar que la home (`/`), el catálogo, el lightbox y `/admin` siguen
funcionando exactamente igual que antes del refactor de componentes.

## Dependencias entre fases

```
Phase 1 (extracción)
  └─→ Phase 2 (página + ruta)
        └─→ Phase 3 (enlace desde catálogo)
        └─→ Phase 4 (SEO)
              └─→ Phase 5 (verificación de regresión)
```

## Pre-condiciones bloqueantes

Ninguna — toda la infraestructura necesaria (Supabase, React Router) ya
existe del feature `001-admin-productos`.
