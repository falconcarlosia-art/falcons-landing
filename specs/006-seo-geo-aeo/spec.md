# Feature Specification: SEO/GEO/AEO — Contenido indexable y prerender estático

**Feature Branch**: `006-seo-geo-aeo`

**Created**: 2026-08-20

**Status**: Draft

**Input**: Una auditoría externa de SEO/GEO/AEO sobre falcem.com detectó que
el sitio, al ser una SPA 100% client-rendered (Vite + React + React Router,
sin SSR), no expone contenido real en el HTML que reciben los crawlers que
no ejecutan JavaScript (buscadores como Bing/DuckDuckGo y la mayoría de
bots de IA — GPTBot, ClaudeBot, PerplexityBot). Además: el `<title>`,
`<meta description>` y `<link rel="canonical">` son idénticos en cualquier
ruta (incluidas rutas de producto y rutas inexistentes), no existe un 404
real (todo devuelve HTTP 200), el sitemap solo lista la home y dos anclas
`#`, no hay sección de preguntas frecuentes ni schema `FAQPage`, el schema
`Product` tiene un bug de canonical (falta el slug), y no hay una sección
"Nosotros" que refuerce E-E-A-T. El dueño del negocio quiere estos 9
problemas corregidos, priorizando que el contenido esté disponible sin
ejecutar JavaScript, sin migrar de stack (sigue en Vite + React + Supabase +
Firebase Hosting) ni asumir costos de infraestructura nuevos (sin Cloud
Functions, sin pasar a plan de pago de Firebase).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Un crawler sin JS ve contenido real (Priority: P1)

Un bot que solo descarga HTML (sin ejecutar JavaScript) visita la home o
una página de producto/servicio y recibe el contenido real: título, texto
principal, y enlaces internos reales hacia otros productos/servicios.

**Why this priority**: Es el hallazgo crítico de la auditoría — sin esto,
ningún otro punto (títulos únicos, FAQ, schema) es visible para la mayoría
de los crawlers que importan hoy.

**Independent Test**: `curl -A "Mozilla/5.0" https://falcem.com/` (sin
ejecutar JS) devuelve el `<h1>`, el texto del hero, el catálogo de
productos y servicios, y enlaces `<a href>` reales hacia sus páginas
individuales.

**Acceptance Scenarios**:

1. **Given** la home, **When** se pide con `curl -A "Mozilla/5.0"`,
   **Then** el `<div id="root">` contiene el HTML ya renderizado (hero,
   catálogo, servicios, FAQ, Nosotros), no un `<div>` vacío.
2. **Given** una página de producto o servicio activo, **When** se pide
   igual sin ejecutar JS, **Then** se ve su título, descripción y datos
   reales, no el shell vacío.
3. **Given** el sitio ya construido, **When** un usuario real lo visita en
   un navegador normal, **Then** la interactividad (filtros, formulario,
   lightbox) sigue funcionando exactamente igual que hoy tras la hidratación,
   sin parpadeos de contenido ni errores de hidratación en consola.

---

### User Story 2 — Metadata única por ruta (Priority: P1)

Cada ruta pública (home, cada producto, cada servicio) expone su propio
`<title>`, `<meta description>` y `<link rel="canonical">`, en vez de
heredar los de la home.

**Why this priority**: Segundo hallazgo crítico — sin metadata distinta por
ruta, buscadores no pueden diferenciar ni indexar páginas individuales.

**Independent Test**: Comparar el `<head>` crudo (sin JS) de `/`,
`/producto/{id}/{slug}` y `/servicios/{id}/{slug}` de tres productos/
servicios distintos → título, descripción y canonical distintos en cada
uno, y el canonical de cada uno apunta a su propia URL completa (con
`id` y `slug`).

**Acceptance Scenarios**:

1. **Given** dos productos distintos, **When** se inspecciona su `<head>`
   crudo, **Then** el `<title>` y `<meta description>` son distintos entre
   sí y distintos de los de la home.
2. **Given** la página de un producto, **When** se lee su
   `<link rel="canonical">`, **Then** la URL incluye tanto el `id` como el
   `slug` del producto (bug conocido hoy: falta el slug).
3. **Given** cualquier ruta, **When** se cuentan las etiquetas
   `<meta name="description">` en el HTML crudo, **Then** hay exactamente
   una (no hay duplicado entre el shell estático y la inyectada por ruta).

---

### User Story 3 — 404 real para rutas inexistentes (Priority: P1)

Alguien visita una URL que no corresponde a ninguna ruta real del sitio y
recibe un HTTP 404 verdadero, con una página que indica claramente que no
existe y no debe indexarse.

**Why this priority**: Hoy cualquier ruta devuelve HTTP 200 con el mismo
contenido que la home — esto diluye la autoridad de indexación y puede
generar contenido duplicado a ojos de los buscadores.

**Independent Test**: `curl -o /dev/null -sw "%{http_code}"
https://falcem.com/esta-pagina-no-existe-xyz123` → `404`.

**Acceptance Scenarios**:

1. **Given** una ruta que no corresponde a home/producto/servicio/admin,
   **When** se visita, **Then** el servidor responde HTTP 404 real (no 200).
2. **Given** esa misma página de error, **When** se inspecciona su
   `<head>`, **Then** incluye `<meta name="robots" content="noindex">`.
3. **Given** un `id` de producto o servicio inválido/borrado, **When** se
   visita su URL, **Then** se ve un mensaje de "no disponible" con
   `noindex` (aceptado como excepción documentada — ver Assumptions, no es
   HTTP 404 duro por diseño).

---

### User Story 4 — Productos y servicios descubribles (Priority: P2)

Cada producto y servicio activo aparece en `sitemap.xml` con su URL real, y
existe al menos un enlace `<a href>` real hacia cada uno desde el HTML
servido de la home.

**Why this priority**: Sin esto, el catálogo completo depende de que un
crawler ejecute JS para descubrir productos — exactamente el problema que
motiva toda esta feature.

**Independent Test**: `curl https://falcem.com/sitemap.xml` → contiene una
entrada por cada producto y servicio activo (`/producto/{id}/{slug}`,
`/servicios/{id}/{slug}`), sin entradas `#ancla`.

**Acceptance Scenarios**:

1. **Given** el catálogo de productos y servicios activos en Supabase,
   **When** se genera el sitio, **Then** `sitemap.xml` lista exactamente
   esas URLs (más la home), sin fragmentos `#`.
2. **Given** el HTML crudo de la home, **When** se buscan enlaces
   `<a href="/producto/...">` y `<a href="/servicios/...">`, **Then**
   existen para cada producto/servicio activo mostrado.

---

### User Story 5 — FAQ visible y con schema (Priority: P2)

Un visitante (o un motor de IA que responde preguntas) encuentra en la home
una sección de 6-8 preguntas frecuentes reales, y ese mismo contenido está
disponible como datos estructurados `FAQPage`.

**Why this priority**: Da contenido citable adicional para motores de
respuesta (AEO) y cubre dudas de conversión (garantía, compatibilidad,
cobertura) directamente en la página.

**Independent Test**: En el HTML crudo de la home, extraer el texto visible
de las preguntas/respuestas y el `mainEntity` del JSON-LD `FAQPage` →
coinciden exactamente.

**Acceptance Scenarios**:

1. **Given** la home, **When** se inspecciona sin JS, **Then** hay una
   sección con 6-8 preguntas y respuestas reales en texto plano.
2. **Given** esa misma sección, **When** se compara con el JSON-LD
   `FAQPage`, **Then** cada pregunta/respuesta visible tiene su
   contraparte exacta en `mainEntity`.

---

### User Story 6 — Sección "Nosotros" (Priority: P3)

Un visitante encuentra una sección que explica quién es Falcons, reforzando
confianza y dando contexto citable a motores de IA.

**Why this priority**: Quick win de menor impacto que los anteriores, pero
barato de agregar una vez que la home ya es prerenderizada.

**Independent Test**: El HTML crudo de la home incluye una sección con
`id="nosotros"` y texto real (no genérico de "Cargando...").

**Acceptance Scenarios**:

1. **Given** la home, **When** se inspecciona sin JS, **Then** existe una
   sección "Nosotros" con copy real, construida solo a partir de datos ya
   publicados en el sitio (proyectos, satisfacción, garantía, ubicación).

---

### User Story 7 — Sin regresión en `/admin` (Priority: P1)

El administrador sigue entrando a `/admin` y usando el panel exactamente
igual que hoy, sin parpadeos de contenido de la landing comercial ni
cambios de comportamiento.

**Why this priority**: El prerender reescribe el `index.html` que hoy sirve
de fallback también para `/admin`; sin una página propia para admin, cada
carga del panel mostraría brevemente el HTML completo de la home antes de
montar `AdminApp` — una regresión real de UX introducida por este mismo
cambio.

**Independent Test**: Cargar `/admin` con DevTools abierto → no aparece en
ningún momento contenido de la landing (hero, catálogo) antes de la
pantalla de login/panel.

**Acceptance Scenarios**:

1. **Given** `/admin`, **When** se pide su HTML crudo, **Then** no
   contiene el catálogo de productos/servicios de la home.
2. **Given** `/admin`, **When** se visita en navegador, **Then** el flujo
   de login y CRUD de productos/servicios funciona exactamente igual que
   antes de este cambio.

---

### Edge Cases

- ¿Qué pasa si se crea un producto/servicio nuevo desde `/admin` después
  del último deploy? → No tiene página prerenderizada propia todavía (sin
  su `<title>`/canonical específico), pero sigue siendo visible y
  funcional vía el fallback SPA existente (fetch por `id` en el cliente).
  Se resuelve solo en el siguiente deploy — trade-off aceptado
  explícitamente por el dueño del negocio a cambio de no requerir Cloud
  Functions ni cambiar de plan de Firebase.
- ¿Qué pasa con un `id` de producto/servicio borrado o que nunca existió?
  → Cae al mismo fallback SPA (HTTP 200, no 404 duro), mostrando "no
  disponible" + `noindex`. Ver Assumptions.
- ¿Qué pasa si el script de generación (prerender/sitemap) falla en CI? →
  El build completo debe fallar (exit code ≠ 0), para que el deploy no
  publique un sitio a medio generar ni un sitemap desactualizado
  silenciosamente.
- ¿Qué pasa con `/admin` durante el prerender? → Nunca se prerenderiza ni
  se indexa (`robots.txt` lo excluye); recibe su propio shell HTML vacío,
  no el de la home.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El servidor DEBE devolver, sin ejecutar JavaScript, el
  contenido real de la home (hero, catálogo de productos, catálogo de
  servicios, FAQ, Nosotros) y de cada página de producto/servicio activo.
- **FR-002**: Cada ruta pública DEBE tener su propio `<title>`,
  `<meta name="description">` y `<link rel="canonical">`, sin duplicados ni
  herencia de los de la home.
- **FR-003**: El canonical de cada producto DEBE incluir tanto su `id`
  como su `slug` (corrige el bug actual, que omite el slug).
- **FR-004**: Toda ruta que no corresponda a home, producto, servicio o
  admin DEBE responder HTTP 404 real, con `<meta name="robots"
  content="noindex">` en el HTML de esa página.
- **FR-005**: `sitemap.xml` DEBE generarse a partir de los productos y
  servicios activos reales (misma fuente que alimenta el catálogo), sin
  URLs con fragmento `#`.
- **FR-006**: La home DEBE incluir enlaces `<a href>` reales hacia cada
  producto y servicio activo mostrado.
- **FR-007**: La home DEBE incluir una sección de 6-8 preguntas frecuentes
  con su JSON-LD `FAQPage` sincronizado 1:1 con el texto visible.
- **FR-008**: Cada página de producto y de servicio DEBE tener su propio
  JSON-LD (`Product` y `Service` respectivamente), generado desde los
  mismos datos que alimentan la UI.
- **FR-009**: La home DEBE incluir una sección "Nosotros" con contenido
  real (no placeholder de carga).
- **FR-010**: `/admin/**` NO DEBE prerenderizarse, DEBE excluirse vía
  `robots.txt`, y DEBE seguir funcionando sin regresión de UX ni heredar
  el HTML de la home.
- **FR-011**: El proceso de build DEBE fallar (no publicar) si la
  generación de páginas o del sitemap falla por cualquier motivo.

### Key Entities

- **Página prerenderizada**: HTML estático generado en build time para
  una URL pública conocida (home, un producto activo, un servicio activo,
  o la página 404), con su propio `<head>` y contenido ya resuelto — no
  introduce entidades de datos nuevas, reutiliza `products`/`services` ya
  existentes en Supabase.
- **Entrada de sitemap**: `{ loc, changefreq, priority }` derivada 1:1 de
  un producto o servicio activo.
- **Pregunta frecuente**: `{ pregunta, respuesta }`, fuente única para el
  texto visible y el JSON-LD `FAQPage`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `curl -A "Mozilla/5.0"` sobre la home y sobre 3 páginas de
  producto/servicio distintas muestra contenido real (H1, texto, enlaces)
  en el 100% de los casos, sin ejecutar JS.
- **SC-002**: El 100% de las rutas de producto/servicio prerenderizadas
  tienen `<title>`/`<meta description>`/canonical distintos entre sí y de
  la home.
- **SC-003**: Una ruta inventada devuelve HTTP 404 real en el 100% de los
  casos probados.
- **SC-004**: `sitemap.xml` contiene el 100% de los productos y servicios
  activos, cero entradas `#`.
- **SC-005**: El texto visible de la FAQ coincide 1:1 con el `mainEntity`
  del JSON-LD en el 100% de las preguntas.
- **SC-006**: `/admin` no muestra contenido de la home en ningún momento
  de su carga, verificado visualmente tras el cambio.

## Assumptions

- **Prerender estático (SSG), no SSR por request**: decisión explícita del
  dueño del negocio para evitar Cloud Functions y el plan de pago de
  Firebase. Implica el trade-off documentado en Edge Cases (freshness de
  productos nuevos hasta el siguiente deploy).
- **IDs inválidos no generan 404 HTTP duro**: se mantienen como fallback
  SPA con `noindex`, para no romper el mecanismo que permite que productos
  recién creados sigan siendo accesibles antes del próximo deploy.
- **Sin `sameAs` en el schema de Organization**: no hay perfiles sociales
  activos de Falcons — se omite el campo por completo en vez de dejarlo
  vacío o inventado.
- **Copy de "Nosotros" es genérico**: construido solo con hechos ya
  publicados en el sitio (proyectos, satisfacción, garantía, ubicación),
  sin nombres de fundadores, año de fundación ni certificaciones
  inventadas — queda marcado para que el dueño del negocio lo revise y
  personalice.
- **Servicios ganan URL individual** (`/servicios/:id/:slug`), replicando
  exactamente el patrón cosmético de slug ya usado en productos (búsqueda
  siempre por `id`, slug no se valida ni se guarda en la base de datos).
