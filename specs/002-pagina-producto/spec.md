# Feature Specification: Página Individual de Producto

**Feature Branch**: `002-pagina-producto`

**Created**: 2026-08-03

**Status**: Draft

**Input**: Hoy todos los productos viven dentro de una sola sección
(`#productos`) de la página principal — no existe una URL propia por
producto. El dueño del negocio quiere que cada producto tenga su propia
página, para poder compartir el link de un producto específico (por
WhatsApp, redes sociales, etc.) y para que cada producto sea indexable de
forma individual en Google (mejor SEO que solo tener la página principal).
La página de cada producto debe verse igual de cuidada que el resto del
sitio, mostrar toda su información y fotos, y permitir volver fácilmente al
catálogo completo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ver la página de un producto específico (Priority: P1)

Un visitante hace clic en un producto desde el catálogo (o entra directo por
un link compartido) y ve una página dedicada a ese producto: todas sus
fotos, título, precio, descripción, categoría/app, y el botón de WhatsApp.

**Why this priority**: Es la razón de ser de todo el feature — sin la
página en sí, no hay nada que compartir ni que indexar.

**Independent Test**: Visitar la URL de un producto activo directamente (sin
pasar por la home) → se ve la página completa del producto, con sus datos
reales tomados de Supabase.

**Acceptance Scenarios**:

1. **Given** un producto activo en el catálogo, **When** un visitante entra
   a su URL individual, **Then** ve su título, precio, descripción,
   categoría, app y todas sus fotos.
2. **Given** la página de un producto, **When** el visitante hace clic en
   "Consultar por WhatsApp", **Then** se abre WhatsApp con el mismo mensaje
   pre-escrito que ya usa el catálogo, mencionando ese producto.
3. **Given** la página de un producto, **When** el visitante quiere volver
   al catálogo completo, **Then** encuentra un enlace claro de regreso.

---

### User Story 2 — Navegar desde el catálogo a la página del producto (Priority: P1)

Un visitante que está viendo el catálogo en la home hace clic en un producto
y llega a su página individual, sin perder la posibilidad de seguir viendo
el carrusel de fotos rápido (lightbox) directamente desde la tarjeta si solo
quiere ver las fotos sin salir del catálogo.

**Why this priority**: Sin este enlace, la página individual solo sería
alcanzable escribiendo la URL a mano — el catálogo es la puerta de entrada
natural.

**Independent Test**: Desde la home, hacer clic en el título de un producto
→ navega a su página individual; hacer clic en la foto (no el título) →
sigue abriendo el lightbox rápido como hoy, sin navegar.

**Acceptance Scenarios**:

1. **Given** el catálogo en la home, **When** el visitante hace clic en el
   título de un producto, **Then** navega a la página individual de ese
   producto.
2. **Given** el catálogo en la home, **When** el visitante hace clic en la
   foto de un producto (no en el título), **Then** se abre el lightbox de
   fotos igual que hoy, sin cambiar de página.

---

### User Story 3 — Manejar productos que ya no existen o están ocultos (Priority: P2)

Alguien entra a un link de producto viejo (compartido hace tiempo) que el
administrador ya ocultó o eliminó del catálogo.

**Why this priority**: Los links se comparten y quedan guardados
indefinidamente (WhatsApp, favoritos) — sin este manejo, esos visitantes
verían una pantalla rota.

**Independent Test**: Visitar la URL de un producto oculto o inexistente →
se ve un mensaje claro de "producto no disponible" con un enlace de vuelta
al catálogo, no un error técnico ni una pantalla en blanco.

**Acceptance Scenarios**:

1. **Given** un producto que fue ocultado por el administrador, **When**
   alguien visita su URL directa, **Then** ve un mensaje de "producto no
   disponible" con enlace al catálogo completo.
2. **Given** una URL de producto con un identificador que nunca existió,
   **When** alguien la visita, **Then** ve el mismo mensaje de "producto no
   disponible", sin errores técnicos visibles.

---

### User Story 4 — SEO individual por producto (Priority: P2)

Cada página de producto tiene su propio título, descripción y datos
estructurados, para que Google pueda indexar y mostrar cada producto por
separado en resultados de búsqueda.

**Why this priority**: Es el segundo objetivo declarado del feature (junto
con compartir el link) — sin esto, el feature solo resuelve la navegación
pero no aporta el beneficio de SEO que se pidió.

**Independent Test**: Inspeccionar el `<head>` de una página de producto ya
renderizada → el título y la descripción son específicos de ese producto
(no genéricos del sitio), y existe un bloque de datos estructurados
`Product` con nombre, precio e imagen.

**Acceptance Scenarios**:

1. **Given** la página de un producto, **When** se inspecciona el título de
   la pestaña del navegador, **Then** incluye el nombre del producto (no
   solo "Falcons — Domótica...").
2. **Given** la página de un producto, **When** se revisan los datos
   estructurados de la página, **Then** existe un schema `Product` con
   nombre, imagen, descripción y precio coincidentes con los datos reales.

---

### Edge Cases

- ¿Qué pasa si el título de un producto cambia después de haberse
  compartido su link? → La URL incluye el `id` (estable) más una versión
  legible del título al momento de la visita; el `id` es lo único que
  determina qué producto se muestra, así que el link sigue funcionando
  aunque el texto de la URL ya no coincida exactamente con el título
  actual.
- ¿Qué pasa con la vista previa al compartir el link en WhatsApp/Facebook
  (Open Graph)? → Como el sitio no tiene servidor propio (es estático), la
  vista previa que muestran esas apps seguirá siendo la genérica del sitio
  (el logo de Falcons), no la foto específica del producto — los bots de
  esas apps no ejecutan JavaScript, que es donde se arma el SEO específico
  de cada producto. Queda documentado como limitación conocida (ver
  Assumptions), no como bug.
- ¿Qué pasa si alguien visita la página de un producto que pertenece a una
  categoría que ya no existe (todos los demás productos de esa categoría
  fueron eliminados)? → La página del producto se muestra igual con
  normalidad; solo afecta al filtro de categorías del catálogo general, no
  a la página individual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE asignar una URL propia y estable a cada
  producto activo, basada en su identificador único.
- **FR-002**: La página individual de un producto DEBE mostrar su título,
  precio, descripción, categoría, app, y todas sus imágenes.
- **FR-003**: La página individual DEBE incluir un botón para consultar por
  WhatsApp con un mensaje pre-escrito que mencione el producto, igual que ya
  existe en las tarjetas del catálogo.
- **FR-004**: La página individual DEBE ofrecer un enlace claro para volver
  al catálogo completo.
- **FR-005**: Desde el catálogo de la home, el título de cada producto DEBE
  ser un enlace hacia su página individual, sin afectar el comportamiento
  actual de abrir el lightbox al hacer clic en la foto.
- **FR-006**: Si la URL corresponde a un producto oculto, eliminado, o a un
  identificador que nunca existió, el sistema DEBE mostrar un estado de
  "producto no disponible" con enlace al catálogo, en vez de un error
  técnico o una pantalla en blanco.
- **FR-007**: Cada página de producto DEBE establecer un título de pestaña
  y una meta descripción específicos de ese producto (no los genéricos del
  sitio).
- **FR-008**: Cada página de producto DEBE incluir datos estructurados
  (`schema.org/Product`) con nombre, imagen, descripción y precio
  coincidentes con los datos reales del producto.
- **FR-009**: La página individual DEBE reutilizar el mismo header,
  footer y estilo visual que el resto del sitio, para mantener consistencia
  de marca.

### Key Entities

- **Página de producto**: vista dedicada a un único registro de la tabla
  `products` ya existente — no introduce ninguna entidad de datos nueva,
  solo una nueva forma de acceder y presentar los datos que ya existen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los productos activos son accesibles mediante una
  URL individual estable, sin pasar por la home.
- **SC-002**: El 100% de las páginas de producto muestran un título de
  pestaña y datos estructurados específicos de ese producto al momento de
  cargar.
- **SC-003**: El 100% de las URLs de productos ocultos, eliminados o
  inexistentes muestran el estado de "no disponible" en vez de un error
  técnico.
- **SC-004**: El comportamiento actual del catálogo (filtro por categoría,
  lightbox de fotos, botón de WhatsApp en las tarjetas) no sufre ninguna
  regresión tras agregar este feature.

## Assumptions

- **Sin vista previa social específica por producto**: dado que el sitio es
  estático (sin servidor propio) y el SEO de cada página se arma con
  JavaScript en el cliente, compartir un link de producto en WhatsApp,
  Facebook u otras apps seguirá mostrando la vista previa genérica del
  sitio, no la foto específica del producto. Resolver esto requeriría
  renderizado del lado del servidor o una función serverless dedicada —
  fuera de alcance de esta primera versión.
- **Sitemap no incluye productos individualmente**: el `sitemap.xml` sigue
  siendo un archivo estático con las secciones principales del sitio; no se
  genera dinámicamente una entrada por producto. Los productos igual pueden
  ser descubiertos por Google siguiendo los enlaces internos desde el
  catálogo. Generar un sitemap dinámico queda como mejora futura.
- **El `id` numérico es la clave real de la URL**: la parte legible de la
  URL (derivada del título) es solo cosmética/SEO — el sistema siempre
  resuelve el producto por su `id`, nunca por el texto de la URL.
