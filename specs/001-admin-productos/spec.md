# Feature Specification: Panel de Administración de Productos

**Feature Branch**: `001-admin-productos`

**Created**: 2026-07-24

**Status**: Draft

**Input**: Actualmente el catálogo de productos vive en `products.json`, un
archivo estático que se empaqueta con el sitio en cada build — para agregar,
editar o quitar un producto (título, descripción, precio, categoría, app,
ícono, fotos) hay que editar ese archivo a mano y volver a desplegar el
código. El dueño del negocio (sin conocimientos de programación) quiere un
portal de administración dentro de la propia web, protegido con acceso de
administrador, donde pueda: cargar imágenes de producto directamente (sin
depender de subirlas a un servicio externo y pegar la URL), crear productos
nuevos, editar cualquier campo de un producto existente, y ocultar o eliminar
productos — todo sin tocar código ni hacer un nuevo despliegue. El sitio
público (landing, carrusel, filtros por categoría, botón de WhatsApp) debe
seguir viéndose y comportándose exactamente igual que hoy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Acceso protegido de administrador (Priority: P1)

El dueño del negocio entra a una URL de administración (ej. `/admin`) e
inicia sesión con su correo y contraseña. Nadie más puede entrar a esa
sección ni modificar el catálogo.

**Why this priority**: Es la puerta de entrada de todo el panel — sin acceso
protegido no existe ningún otro flujo posible, y sin protección cualquier
visitante podría alterar el catálogo público.

**Independent Test**: Visitar `/admin` sin sesión iniciada → se muestra un
formulario de acceso y no el catálogo; iniciar sesión con credenciales
válidas → se ve el panel de administración; con credenciales inválidas, se
ve un mensaje de error y no se entra.

**Acceptance Scenarios**:

1. **Given** un visitante sin sesión iniciada, **When** visita la URL de
   administración, **Then** ve un formulario de acceso y ninguna opción de
   editar productos.
2. **Given** el administrador ingresa correo y contraseña correctos,
   **When** envía el formulario, **Then** entra al panel y ve el listado de
   productos.
3. **Given** el administrador ingresa una contraseña incorrecta, **When**
   envía el formulario, **Then** ve un mensaje de error claro y permanece
   fuera del panel.
4. **Given** el administrador tiene una sesión activa, **When** cierra
   sesión, **Then** vuelve a requerírsele el acceso para volver a entrar.

---

### User Story 2 — Ver y editar el catálogo existente (Priority: P1)

El administrador ve la lista completa de productos (con foto, título,
categoría y precio de un vistazo) y puede editar cualquier campo de un
producto — título, modelo, categoría, app, ícono, precio, descripción — y
los cambios se reflejan en el sitio público sin tocar código ni redeployar.

**Why this priority**: Es el valor central del feature — la razón por la que
existe el panel es dejar de depender del código para mantener el catálogo al
día.

**Independent Test**: Editar el precio de un producto existente desde el
panel → al recargar la página pública, el nuevo precio se ve en la tarjeta
de ese producto, sin haber tocado ningún archivo ni hecho un deploy.

**Acceptance Scenarios**:

1. **Given** el administrador está en el panel, **When** abre la lista de
   productos, **Then** ve todos los productos existentes con su foto
   principal, título, categoría y precio.
2. **Given** el administrador edita la descripción o el precio de un
   producto y guarda, **When** un visitante entra al sitio público, **Then**
   ve la descripción y el precio actualizados.
3. **Given** el administrador intenta guardar un producto sin título o sin
   precio, **When** envía el formulario, **Then** ve un mensaje de error y el
   cambio no se guarda.

---

### User Story 3 — Cargar imágenes de producto (Priority: P1)

El administrador sube fotos directamente desde su computadora o celular al
crear o editar un producto, en vez de tener que subirlas primero a un
servicio externo (como hace hoy) y pegar la URL.

**Why this priority**: Es la fricción más grande del proceso actual — sin
esto, el panel solo ahorraría editar texto pero seguiría dependiendo de un
paso manual fuera de la web para las fotos, que es precisamente lo que el
dueño quiere evitar.

**Independent Test**: En el formulario de un producto, seleccionar un
archivo de imagen desde el dispositivo y guardar → la imagen aparece en el
carrusel de ese producto en el sitio público.

**Acceptance Scenarios**:

1. **Given** el administrador está editando un producto, **When** selecciona
   uno o más archivos de imagen desde su dispositivo, **Then** las imágenes
   se suben y aparecen en la vista previa del formulario.
2. **Given** un producto con varias imágenes cargadas, **When** el
   administrador elimina una, **Then** esa imagen deja de mostrarse en el
   carrusel del sitio público, sin afectar las demás.
3. **Given** un producto con varias imágenes, **When** el administrador
   cambia el orden (cuál va primero), **Then** el sitio público usa esa
   primera imagen como la principal de la tarjeta.
4. **Given** el administrador intenta subir un archivo que no es una imagen
   válida (ej. un PDF) o que excede el tamaño máximo permitido, **Then** el
   sistema rechaza el archivo y muestra un mensaje claro.

---

### User Story 4 — Crear un producto nuevo (Priority: P2)

El administrador agrega un producto que no existía: completa título,
modelo, categoría, app, ícono, precio y descripción, sube al menos una foto,
y el producto aparece de inmediato en el catálogo público.

**Why this priority**: Depende de que ya existan la edición (US2) y la carga
de imágenes (US3) — crear es, en esencia, editar un producto vacío más
elegir categoría/app/ícono.

**Independent Test**: Crear un producto nuevo con todos los campos
obligatorios y una foto → aparece en la sección "Productos" del sitio
público, dentro del filtro de su categoría.

**Acceptance Scenarios**:

1. **Given** el administrador completa el formulario de producto nuevo con
   todos los campos obligatorios y al menos una imagen, **When** guarda,
   **Then** el producto aparece en el catálogo público y en el filtro de su
   categoría.
2. **Given** el administrador intenta guardar un producto nuevo sin ninguna
   imagen, **When** envía el formulario, **Then** el sistema le pide al
   menos una foto antes de guardar (el sitio público ya tiene un estado de
   "sin fotos" con ícono, pero para productos nuevos se exige al menos una
   imagen real).
3. **Given** el administrador elige una categoría, app o ícono, **When**
   abre los selectores correspondientes, **Then** solo puede elegir entre
   las opciones ya definidas en el diseño del sitio (ver Edge Cases).

---

### User Story 5 — Ocultar o eliminar un producto (Priority: P2)

El administrador retira temporalmente un producto agotado (sin perder su
información) o lo elimina permanentemente si ya no se vende más.

**Why this priority**: Es tan importante como crear/editar para mantener el
catálogo real, pero depende de que existan productos que gestionar (US2-US4)
antes de tener sentido.

**Independent Test**: Ocultar un producto → desaparece del sitio público pero
sigue visible en el panel marcado como "oculto", y puede reactivarse;
eliminarlo → desaparece de ambos lados tras confirmar la acción.

**Acceptance Scenarios**:

1. **Given** un producto activo, **When** el administrador lo marca como
   oculto, **Then** deja de aparecer en el sitio público pero sigue en la
   lista del panel, marcado como oculto, y puede reactivarse.
2. **Given** un producto oculto, **When** el administrador lo reactiva,
   **Then** vuelve a aparecer en el sitio público.
3. **Given** el administrador elige eliminar un producto, **When**
   confirma la acción en el diálogo de confirmación, **Then** el producto
   deja de existir en el panel y en el sitio público.
4. **Given** el administrador abre el diálogo de eliminar, **When** lo
   cancela, **Then** el producto no se modifica.

---

### Edge Cases

- ¿Qué pasa si el administrador oculta o elimina el único producto de una
  categoría? → Esa categoría deja de aparecer como filtro en el sitio
  público (mismo comportamiento dinámico que ya existe hoy, basado en los
  productos realmente disponibles).
- ¿Qué pasa si el administrador quiere una categoría, app o ícono que no
  existe todavía (ej. una categoría nueva con su propio color)? → Fuera de
  alcance del panel: agregar una categoría/app/ícono nuevo requiere un
  cambio de código (porque cada una tiene su propio esquema de color en el
  diseño) y lo hace el desarrollador; el panel solo permite asignar las
  opciones ya definidas.
- ¿Qué pasa si dos personas (ej. el dueño desde el celular y desde la PC)
  editan el mismo producto casi al mismo tiempo? → Gana el último guardado
  (last-write-wins); no se contempla resolución de conflictos ni bloqueo de
  edición en esta primera versión (ver Assumptions).
- ¿Qué pasa si se pierde la conexión a internet mientras se sube una
  imagen o se guarda un cambio? → El sistema debe mostrar un error claro y
  permitir reintentar, sin dejar el producto en un estado a medio guardar
  (ej. con imagen subida pero sin asociar).
- ¿Qué pasa con el rango de precios que ya se declaró manualmente en el SEO
  (JSON-LD `priceRange` en `index.html`)? → Ese valor es estático hoy y no
  se recalcula automáticamente al cambiar precios desde el panel; queda
  fuera de alcance de esta primera versión (ver Assumptions).
- ¿Qué pasa si el administrador sube una imagen muy pesada (varios MB)? →
  El sistema debe optimizarla/comprimirla o rechazarla si excede el límite,
  para no degradar la velocidad de carga del carrusel público.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer una pantalla de acceso de
  administrador (correo/contraseña) en una ruta separada del sitio público
  (ej. `/admin`), sin ningún enlace visible hacia ella desde la navegación
  pública.
- **FR-002**: Ningún visitante sin sesión de administrador válida DEBE poder
  ver el panel ni modificar ningún dato del catálogo, incluso conociendo la
  URL directa.
- **FR-003**: El administrador DEBE poder ver el catálogo completo (incluidos
  los productos ocultos) en una lista con foto principal, título, categoría
  y precio.
- **FR-004**: El administrador DEBE poder editar cualquier campo de un
  producto existente (título, modelo, categoría, app, ícono, precio,
  descripción), y el cambio DEBE reflejarse en el sitio público sin requerir
  un nuevo despliegue de código.
- **FR-005**: El administrador DEBE poder subir una o más imágenes por
  producto directamente como archivos desde su dispositivo; el sistema DEBE
  almacenarlas y generar automáticamente la URL pública usada por el
  carrusel.
- **FR-006**: El administrador DEBE poder eliminar una imagen individual de
  un producto y reordenar las restantes; la primera imagen del orden DEBE
  ser la que se use como portada/principal.
- **FR-007**: El sistema DEBE rechazar archivos que no sean imágenes válidas
  o que excedan el tamaño máximo permitido, mostrando un mensaje de error
  claro.
- **FR-008**: El administrador DEBE poder crear un producto nuevo
  especificando título, modelo, precio y descripción, eligiendo categoría,
  app e ícono entre las opciones ya definidas en el diseño del sitio, y
  cargando al menos una imagen antes de poder guardarlo.
- **FR-009**: El administrador DEBE poder ocultar un producto del sitio
  público sin eliminarlo, y reactivarlo más adelante; el producto oculto
  DEBE seguir visible (marcado como oculto) dentro del panel.
- **FR-010**: El administrador DEBE poder eliminar un producto de forma
  permanente, con un paso de confirmación explícito antes de ejecutar la
  eliminación.
- **FR-011**: El sitio público DEBE seguir mostrando el mismo diseño,
  carrusel, filtros por categoría, badges y botón de WhatsApp que hoy,
  cambiando únicamente el origen de los datos (del archivo estático al
  origen administrado por el panel).
- **FR-012**: Todo cambio guardado en el panel DEBE persistir de forma
  duradera — visible tras recargar la página, desde cualquier dispositivo, y
  sin depender de que el navegador del administrador conserve datos
  localmente.
- **FR-013**: Las categorías, apps e íconos ofrecidos al administrador
  DEBEN limitarse a los ya definidos en el sistema de diseño del sitio;
  agregar una opción nueva de cualquiera de estos tres campos queda fuera
  del panel y requiere un cambio de código.

### Key Entities

- **Producto**: título, modelo, categoría, app, ícono, precio, descripción,
  lista ordenada de imágenes, estado (activo/oculto), fechas de creación y
  última edición. Es la misma información que hoy vive en `products.json`,
  más el estado activo/oculto que no existe todavía.
- **Imagen de producto**: archivo almacenado con su URL pública y su
  posición dentro del producto (la posición 1 es la portada).
- **Cuenta de administrador**: credencial (correo/contraseña) que controla
  el acceso al panel; en esta primera versión existe una sola cuenta,
  la del dueño del negocio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El dueño del negocio puede agregar un producto nuevo completo
  (con al menos una foto) desde el panel en menos de 3 minutos, sin escribir
  código ni pedir ayuda a un desarrollador.
- **SC-002**: El 100% de los cambios guardados en el panel (edición, alta,
  ocultar, eliminar) se reflejan en el sitio público sin ningún nuevo
  despliegue de código.
- **SC-003**: El 100% de los intentos de acceso al panel sin sesión válida
  son bloqueados — ningún visitante no autenticado logra ver ni modificar el
  catálogo.
- **SC-004**: El sitio público, tras el cambio de origen de datos, se ve y
  se comporta exactamente igual que antes (mismo diseño, carrusel, filtros y
  flujo de WhatsApp) para el 100% de los productos existentes al momento de
  la migración.

## Assumptions

- **Un solo administrador**: esta primera versión asume un único usuario
  administrador (el dueño del negocio) — no se contemplan roles, permisos
  distintos ni múltiples cuentas.
- **Categorías/apps/íconos fijos**: el conjunto de categorías, apps e
  íconos disponibles es el mismo que ya existe hoy en el código; agregar uno
  nuevo (con su propio color) es una tarea de desarrollo, no del panel.
- **Sin resolución de conflictos de edición**: no se implementa bloqueo de
  edición simultánea ni control de versiones — se asume un solo
  administrador operando a la vez en la práctica, con "gana el último
  guardado" como comportamiento aceptable si llegara a ocurrir.
- **`priceRange` del SEO queda estático**: el valor de rango de precios en
  el JSON-LD de `index.html` no se recalcula automáticamente al cambiar
  precios desde el panel en esta primera versión; es una mejora futura
  fuera de alcance.
- **Introducir un backend**: cumplir estos requisitos (persistencia real,
  carga de imágenes, acceso protegido) no es posible manteniendo el sitio
  100% estático como hoy — se asume la incorporación de un servicio de
  backend/base de datos (detallado en `plan.md`) como parte necesaria de
  esta feature.
