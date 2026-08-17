# Feature Specification: Sección de Servicios

**Feature Branch**: `005-servicios`

**Created**: 2026-08-17

**Status**: Draft

**Input**: Falcons no solo vende dispositivos (`products`) — también ofrece
servicios de instalación, paquetes por ambiente, paquetes de "casa
inteligente completa" y configuración/automatización, descritos en el
documento interno "Falcons — Alcance de Servicios de Domótica e
Instalación Inteligente" (v1, 17 ago 2026). El dueño del negocio quiere una
nueva sección/pestaña "Servicios" en el sitio público, con el mismo nivel
de cuidado visual que "Productos", pero **sin mostrar precios** (los
precios del documento son referenciales/internos, no listos para publicar).
De las 7 categorías del documento, solo 4 van al sitio público en esta
versión: Instalación a la carta, Paquetes por ambiente, Casa Inteligente
completa, y Configuración y automatización. Quedan fuera (por ahora):
servicios recurrentes/suscripción, segmentos B2B/nicho, y garantías —
contenido más estratégico/interno que no está listo para mostrarse tal
cual. Los servicios se administran igual que los productos: desde el panel
`/admin`, sin tocar código.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ver el catálogo de servicios (Priority: P1)

Un visitante entra a la sección "Servicios" del sitio y ve los servicios
organizados por categoría (Instalación a la carta, Paquetes por ambiente,
Casa Inteligente completa, Configuración y automatización), cada uno con su
nombre y una descripción de qué incluye — sin precio visible.

**Why this priority**: Es el valor central del feature — mostrar que
Falcons no solo vende hardware, sino que instala y configura, abriendo una
vía de contacto distinta a "comprar un producto".

**Independent Test**: Visitar la sección de servicios → se ven tarjetas
agrupadas por categoría, cada una con nombre y descripción, sin ningún
precio visible en ninguna tarjeta.

**Acceptance Scenarios**:

1. **Given** un visitante en la home, **When** navega a la sección de
   servicios, **Then** ve los servicios agrupados por categoría, cada uno
   con nombre y descripción de lo que incluye.
2. **Given** cualquier tarjeta de servicio, **When** el visitante la
   revisa, **Then** no encuentra ningún precio ni rango de precio.
3. **Given** la sección de servicios, **When** el visitante filtra por una
   categoría (ej. "Paquetes por ambiente"), **Then** solo ve los servicios
   de esa categoría.

---

### User Story 2 — Consultar un servicio por WhatsApp (Priority: P1)

El visitante interesado en un servicio hace clic en un botón de la tarjeta
y se abre WhatsApp con un mensaje pre-escrito mencionando ese servicio
específico, para pedir una cotización.

**Why this priority**: Sin precio visible, el botón de WhatsApp es el
único camino de conversión de la sección — es indispensable, no opcional.

**Independent Test**: Hacer clic en "Cotizar por WhatsApp" en una tarjeta
de servicio → se abre WhatsApp con el número de Falcons y un mensaje que
menciona el nombre de ese servicio.

**Acceptance Scenarios**:

1. **Given** una tarjeta de servicio, **When** el visitante hace clic en
   su botón de contacto, **Then** se abre WhatsApp con un mensaje
   pre-escrito que incluye el nombre del servicio.

---

### User Story 3 — Administrar servicios sin tocar código (Priority: P1)

El administrador crea, edita, oculta y elimina servicios desde el panel
`/admin`, con los mismos controles de acceso y flujo que ya existen para
productos.

**Why this priority**: Es la razón por la que se pidió administrar
servicios "igual que productos" — sin esto, cualquier cambio de catálogo
de servicios requeriría tocar código, exactamente lo que el panel de
productos ya resolvió y este feature debe replicar.

**Independent Test**: Crear un servicio nuevo desde `/admin` → aparece de
inmediato en la sección pública de servicios, dentro de su categoría.

**Acceptance Scenarios**:

1. **Given** el administrador con sesión iniciada, **When** entra a la
   sección de servicios del panel, **Then** ve la lista completa de
   servicios (incluidos los ocultos), agrupados o filtrables por
   categoría.
2. **Given** el administrador, **When** crea un servicio nuevo con
   categoría, título y descripción, **Then** el servicio aparece en el
   sitio público dentro de su categoría.
3. **Given** un servicio existente, **When** el administrador lo oculta,
   **Then** deja de verse en el sitio público pero sigue en el panel,
   marcado como oculto, y puede reactivarse.
4. **Given** un servicio existente, **When** el administrador lo elimina
   con confirmación, **Then** desaparece de ambos lados.

---

### Edge Cases

- ¿Qué pasa si una categoría no tiene ningún servicio activo? → Esa
  categoría no aparece como filtro en el sitio público (mismo
  comportamiento dinámico que ya existe en el filtro de categorías de
  productos).
- ¿Qué pasa con las 3 categorías del documento que no se publican en esta
  versión (recurrentes, B2B/nicho, garantías)? → No se cargan como datos
  en absoluto en esta versión; si más adelante se decide publicarlas,
  es una decisión de contenido nueva, no un cambio de código (las
  categorías administrables ya son de texto libre, ver Assumptions).
- ¿Qué pasa si el administrador intenta poner un precio o número en el
  campo de descripción? → No hay validación que lo impida (el campo es
  texto libre); es responsabilidad editorial del administrador mantener
  la política de "sin precios visibles", igual que hoy es su
  responsabilidad no subir contenido inapropiado en productos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sitio público DEBE tener una sección de "Servicios"
  visualmente consistente con la sección de "Productos", enlazada desde
  la navegación principal.
- **FR-002**: Cada servicio DEBE mostrarse con nombre, categoría y
  descripción de lo que incluye — sin ningún precio ni rango de precio
  visible en ningún lugar de la tarjeta.
- **FR-003**: El sitio público DEBE permitir filtrar los servicios por
  categoría, igual que el catálogo de productos.
- **FR-004**: Cada tarjeta de servicio DEBE tener un botón que abra
  WhatsApp con un mensaje pre-escrito mencionando el nombre de ese
  servicio.
- **FR-005**: El administrador DEBE poder crear, editar, ocultar,
  reactivar y eliminar servicios desde `/admin`, con el mismo patrón de
  acceso protegido ya usado para productos.
- **FR-006**: Todo cambio de servicios hecho en el panel DEBE reflejarse
  en el sitio público sin necesidad de un nuevo despliegue de código.
- **FR-007**: Solo los servicios activos DEBEN ser visibles públicamente;
  los ocultos solo deben verse dentro del panel de administración.

### Key Entities

- **Servicio**: categoría (texto), título, descripción de lo que incluye,
  estado (activo/oculto). No incluye precio, duración, ni imágenes en esta
  versión — a diferencia de `Producto`, que sí las tiene.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las tarjetas de servicio publicadas no muestran
  ningún precio ni rango de precio.
- **SC-002**: El administrador puede publicar un servicio nuevo desde
  `/admin` en menos de 2 minutos, sin escribir código.
- **SC-003**: El 100% de los servicios ocultados o eliminados desde el
  panel dejan de verse en el sitio público de inmediato.
- **SC-004**: Las 19 fichas de servicio de las 4 categorías elegidas
  (Instalación a la carta, Paquetes por ambiente, Casa Inteligente
  completa, Configuración y automatización) están cargadas y visibles al
  cierre de esta primera versión.

## Assumptions

- **Categoría como texto libre, no un enum fijo**: a diferencia de
  `category` en productos (limitado a 4 valores fijos con su propio color
  en el diseño), la categoría de servicio se guarda como texto libre desde
  el panel, para no requerir un cambio de código si más adelante se agrega
  o renombra una categoría de servicio.
- **Sin precios ni duración en esta versión**: el documento fuente incluye
  precios referenciales y duración estimada por servicio; ninguno de los
  dos se publica en esta versión (decisión explícita del dueño del
  negocio). Podría reconsiderarse como mejora futura si se decide mostrar
  duración sin precio.
- **Sin imágenes por servicio**: el documento fuente no trae fotos por
  servicio; se usa un ícono por categoría (mismo set de íconos ya usado en
  productos) en vez de fotografías.
- **3 categorías fuera de alcance**: servicios recurrentes/suscripción,
  segmentos B2B/nicho, y garantías/valor agregado no se cargan como datos
  en esta versión — son contenido más estratégico que requiere una
  decisión de negocio propia antes de publicarse.
