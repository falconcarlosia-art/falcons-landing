# Implementation Plan: SEO/GEO/AEO — Contenido indexable y prerender estático

**Feature Branch**: `006-seo-geo-aeo`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-20

## Summary

Se agrega un paso de prerender estático (SSG) al build existente
(`vite build && node scripts/prerender.mjs`), que genera HTML real por
ruta (home, cada producto/servicio activo, 404, shell de admin) usando el
mismo árbol de componentes que ya existe, sin migrar de stack ni requerir
servidor en producción. Se corrige el bug de canonical en `ProductPage`,
se agrega `ServicePage` (nueva página individual de servicio, replicando
`002-pagina-producto`), un `sitemap.xml` dinámico, una página 404 real,
una sección FAQ con `FAQPage` JSON-LD, y una sección "Nosotros".

## Technical Context

**Por qué prerender estático y no SSR por request**: decisión explícita
del dueño del negocio — evita depender de Cloud Functions y del plan de
pago (Blaze) de Firebase, manteniendo el despliegue 100% estático vía el
pipeline de GitHub Actions ya existente. Contraparte aceptada: un
producto/servicio creado en `/admin` después del último deploy no tiene
metadata SEO propia hasta el siguiente deploy (sigue siendo visible vía el
fallback SPA que ya existe hoy).

**Mecanismo elegido — patrón oficial de Vite SSG** (`vite.ssrLoadModule`
en un dev server modo *middleware*, sin build SSR separado, evitando
mantener un segundo `dist-ssr/`). Reutiliza el 100% de los componentes
existentes.

**Dos hallazgos de diseño que este plan corrige explícitamente** (no
estaban en el primer borrador de arquitectura):

1. **Hydration mismatch en Home.** Si el HTML servido trae el catálogo
   completo (renderizado en el servidor) pero el primer render del
   cliente arranca sin esos datos (`usePrerenderData()` devolviendo `null`
   en el navegador), React descarta el DOM ya pintado y repinta desde
   cero — parpadeo de "Cargando productos..." sobre contenido que ya
   estaba ahí. Se corrige serializando los mismos datos usados en el
   servidor dentro de un `<script type="application/json">` embebido, que
   `entry-client.jsx` lee y usa para sembrar el mismo `PrerenderContext`
   en el cliente antes del primer render.
2. **`/admin` heredando el HTML de Home.** El prerender sobrescribe
   `dist/index.html` con el HTML completo de Home; si `/admin/**` sigue
   redirigiendo ahí (como en el diseño ingenuo), cada carga del panel
   mostraría brevemente la landing comercial completa antes de montar
   `AdminApp`. Se corrige generando un `dist/admin.html` propio (shell
   vacío + `noindex`, tomado del template pristino de `index.html` antes
   de inyectar el contenido de Home) y apuntando `/admin/**` ahí en vez
   de a `/index.html`.

**Por qué imports estáticos (no `lazy()`) para `ProductPage`/`ServicePage`
en el árbol de rutas compartido**: `ReactDOMServer.renderToString` no
puede esperar la promesa de un `React.lazy()` — si se dejaran lazy, cada
página prerenderizada de producto/servicio horneraría el fallback
"Cargando..." en vez del contenido real. `AdminApp` sí sigue `lazy()`
porque nunca es la ruta que se prerenderiza.

**`StaticRouter` sin dependencias nuevas**: `react-router-dom@7.18.2`
re-exporta `StaticRouter` desde `react-router` (confirmado en
`node_modules`), así que no hace falta instalar nada adicional para el
render en servidor.

## Project Structure

### Documentation (this feature)

```
specs/006-seo-geo-aeo/
├── spec.md
└── plan.md
```

### Source Code (a crear/modificar)

```
src/
├── entry-client.jsx          # nuevo — reemplaza main.jsx; hydrateRoot vs createRoot
│                               según rootEl.children.length; lee el JSON embebido
│                               por el prerender y siembra PrerenderContext en el cliente
├── entry-server.jsx           # nuevo — render(url, data) usado por scripts/prerender.mjs
├── routes.jsx                 # nuevo — árbol <Routes> único, compartido cliente/servidor;
│                               ProductPage/ServicePage como import estático (ver arriba)
├── lib/
│   ├── PrerenderContext.js    # nuevo — createContext/usePrerenderData()
│   ├── whatsapp.js            # nuevo — buildWhatsAppLink(message), extrae la lógica
│   │                            duplicada 3x hoy (FalconsLanding x2, ProductPage x1)
│   └── slugify.js              # ya existe, se reutiliza tal cual para el slug de servicios
├── pages/
│   ├── ProductPage.jsx        # modificado — fix de canonical (falta el slug), seeding
│   │                            de datos vía PrerenderContext, noindex en "no disponible"
│   ├── ServicePage.jsx        # nuevo — mismo patrón que ProductPage, adaptado al
│   │                            esquema de `services` (sin precio/imágenes/specs)
│   └── NotFound.jsx           # nuevo — página 404 real, noindex
├── components/
│   ├── AboutUs.jsx             # nuevo — sección "Nosotros", id="nosotros"
│   ├── Faq.jsx                 # nuevo — 7 preguntas + FAQPage JSON-LD desde el mismo array
│   └── Navbar.jsx              # modificado — link "Nosotros" agregado
main.jsx                        # eliminado (reemplazado por src/entry-client.jsx)
FalconsLanding.jsx               # modificado — <Helmet> propio (hoy no tiene ninguno),
                                  # seeding de ProductShowroom/ServicesShowroom, nuevo
                                  # <Link> en el título de cada card de servicio, inserta
                                  # <AboutUs/> y <Faq/>, usa buildWhatsAppLink()
index.html                       # modificado — quita el bloque estático de title/meta/
                                  # canonical/OG/JSON-LD (pasa a Helmet por ruta), agrega
                                  # placeholders <!--app-head--> <!--app-html--> <!--app-data-->
scripts/
└── prerender.mjs                # nuevo — corre tras `vite build`; genera dist/index.html
                                  # (home), dist/producto/{id}/{slug}/index.html,
                                  # dist/servicios/{id}/{slug}/index.html, dist/404.html,
                                  # dist/admin.html, dist/sitemap.xml; process.exit(1) en
                                  # cualquier error (Supabase o render)
package.json                     # modificado — "build": "vite build && node scripts/prerender.mjs"
firebase.json                    # modificado — rewrites específicos en vez del catch-all "**"
public/robots.txt                # modificado — agrega "Disallow: /admin/"
public/sitemap.xml               # eliminado — se genera en build, uno estático desactualizado
                                  # sería un riesgo de fallo silencioso
```

### Base de datos

Sin cambios de esquema. Se reutilizan `products` y `services` tal como
existen hoy (ver `specs/001-admin-productos/plan.md` y
`specs/005-servicios/plan.md`); `ServicePage` usa la misma política RLS
de lectura pública (`active = true`) ya vigente sobre `services`.

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Prerender estático (SSG) vía `vite.ssrLoadModule`, no build SSR separado | Reutiliza el pipeline de GitHub Actions existente, sin servidor en producción ni segundo `dist-ssr/` que mantener | SSR por request con Firebase Cloud Functions — requiere plan Blaze y una función Node viva; descartado explícitamente por el dueño del negocio |
| `ProductPage`/`ServicePage` como import estático en `routes.jsx` (no `lazy()`) | `renderToString` no espera promesas de `React.lazy()` — con lazy, el prerender hornearía el fallback "Cargando..." en cada página de producto/servicio | Mantener `lazy()` en todo el árbol — más simple, pero rompe el objetivo central de esta feature |
| Serializar los datos precargados en un `<script type="application/json">` para hidratar sin parpadeo | Evita un *hydration mismatch* real (React descartando y repintando el DOM ya servido) — hallazgo propio durante el diseño, no estaba en el primer borrador | Dejar `PrerenderContext` en `null` en el cliente y confiar solo en el `useEffect` existente — más simple, pero causa parpadeo visible y warnings de hidratación |
| `dist/admin.html` propio, no reusar `dist/index.html` como fallback de `/admin/**` | Sin esto, cada carga de `/admin` heredaría por error el HTML completo de la landing comercial (regresión de UX) — segundo hallazgo propio del diseño | Apuntar `/admin/**` a `/index.html` como todo lo demás — más simple, pero rompe el panel visualmente |
| IDs de producto/servicio inválidos siguen cayendo al fallback SPA (200 + noindex), no 404 duro | Necesario para que un producto recién creado en `/admin` (aún no prerenderizado) siga funcionando sin esperar al próximo deploy — trade-off ya aceptado en la decisión de usar SSG | Excluir también `/producto/**`/`/servicios/**` del rewrite de fallback — daría 404 duro real en todos los casos, pero rompería la frescura de productos nuevos |
| `sameAs` omitido del todo | No hay perfiles sociales activos — confirmado con el dueño del negocio | Dejar un array vacío o con URLs inventadas — sería peor que no tenerlo |
| Extraer `buildWhatsAppLink()` a `src/lib/whatsapp.js` | La lógica ya estaba duplicada 3 veces; `ServicePage` sería una 4ª copia — momento natural para extraerla | Copiar el patrón una vez más en `ServicePage.jsx` — mantiene la duplicación sin necesidad |

## Fase 1: Implementation

### Phase 0 — Documentación (esta feature)
Crear `specs/006-seo-geo-aeo/spec.md` y `plan.md` con el contenido de este
documento.

### Phase 1 — Base sin dependencias
`src/lib/whatsapp.js`. Lo usan todas las fases siguientes que tocan botones
de WhatsApp.

### Phase 2 — Páginas nuevas y fix de bug
`src/pages/ServicePage.jsx`, `src/pages/NotFound.jsx`, fix de canonical +
`noindex` en `src/pages/ProductPage.jsx`. Independientes entre sí.

### Phase 3 — Backbone de prerender
`src/lib/PrerenderContext.js`, `src/routes.jsx`, `src/entry-client.jsx`,
`src/entry-server.jsx`, placeholders en `index.html`, eliminar `main.jsx`.
Depende de que Phase 2 ya exista (routes.jsx importa esas páginas).

### Phase 4 — Seeding de datos + metadata de Home
Seeding vía `PrerenderContext` en `ProductShowroom`/`ServicesShowroom`
(`FalconsLanding.jsx`) y en `ProductPage`/`ServicePage`; `<Helmet>` propio
de Home (título, description nueva de ≤160 caracteres, canonical, OG,
JSON-LD `HomeAndConstructionBusiness` movido desde `index.html`); nuevo
`<Link>` en el título de cada card de servicio.

### Phase 5 — Contenido nuevo
`src/components/AboutUs.jsx`, `src/components/Faq.jsx` (7 preguntas +
`FAQPage` JSON-LD desde el mismo array), inserción en `FalconsLanding.jsx`,
link "Nosotros" en `Navbar.jsx`.

### Phase 6 — Generación en build
`scripts/prerender.mjs` (páginas + `dist/admin.html` + `dist/404.html` +
`dist/sitemap.xml`, `process.exit(1)` en error), `package.json` → script
`build`.

### Phase 7 — Hosting
`firebase.json` (rewrites específicos, sin catch-all `**`), `public/
robots.txt` (`Disallow: /admin/`), eliminar `public/sitemap.xml` estático.

### Phase 8 — Verificación de regresión
`npm run build` + `firebase emulators:start --only hosting`; recorrer las
7 user stories de `spec.md` con `curl -A "Mozilla/5.0"` y en navegador
(incluida la verificación visual de que `/admin` no parpadea con contenido
de Home).

## Dependencias entre fases

```
Phase 0 (docs)
Phase 1 (whatsapp.js)
  └─→ Phase 2 (ServicePage, NotFound, fix canonical)
        └─→ Phase 3 (backbone SSG)
              └─→ Phase 4 (seeding + Helmet de Home)
                    └─→ Phase 5 (AboutUs, Faq)
                          └─→ Phase 6 (prerender.mjs, sitemap)
                                └─→ Phase 7 (firebase.json, robots.txt)
                                      └─→ Phase 8 (verificación)
```

## Pre-condiciones bloqueantes

Ninguna — toda la infraestructura necesaria (Supabase, React Router,
`react-helmet-async`) ya existe de features previas (`001-admin-productos`,
`002-pagina-producto`, `005-servicios`).
