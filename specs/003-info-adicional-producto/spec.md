# Feature Specification: Información Adicional del Producto (texto enriquecido)

**Feature Branch**: `003-info-adicional-producto`

**Created**: 2026-08-03

**Status**: Draft

**Input**: En la página individual de cada producto (feature
`002-pagina-producto`), el dueño del negocio quiere poder agregar información
adicional más allá de los campos actuales (título, precio, descripción
corta) — por ejemplo instrucciones de instalación, garantía extendida,
preguntas frecuentes del producto. Este contenido debe poder llevar formato
(títulos, listas, negritas), y debe editarse desde el panel de
administración con un editor visual tipo Word — sin que el administrador
necesite escribir ni ver código HTML directamente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redactar información adicional con formato (Priority: P1)

El administrador, al editar un producto, escribe un texto con títulos,
listas y negritas usando botones de formato (como en un editor de texto
común), sin escribir código.

**Why this priority**: Es la totalidad del valor del feature — sin esto no
hay nada nuevo que mostrar en la página del producto.

**Independent Test**: Editar un producto, escribir un párrafo con un título,
una lista y una palabra en negrita usando la barra de herramientas del
editor, guardar → al ver la página pública del producto, el texto se ve con
ese mismo formato (título, lista, negrita reales, no como texto plano).

**Acceptance Scenarios**:

1. **Given** el administrador está editando un producto, **When** usa los
   botones de negrita, título y lista del editor, **Then** el texto
   resultante se ve formateado dentro del propio editor, sin necesidad de
   escribir etiquetas HTML.
2. **Given** el administrador guarda un producto con información adicional
   formateada, **When** un visitante abre la página de ese producto,
   **Then** ve el mismo formato (títulos, listas, negritas) aplicado
   correctamente.

---

### User Story 2 — Producto sin información adicional (Priority: P2)

Un producto que nunca tuvo información adicional cargada no muestra ninguna
sección vacía o rota en su página.

**Why this priority**: La mayoría de los productos ya existentes no tendrán
este campo cargado de inmediato — el feature no debe degradar su
apariencia actual.

**Independent Test**: Ver la página de un producto sin información
adicional → no aparece ningún título de sección vacío ni espacio en blanco
extraño.

**Acceptance Scenarios**:

1. **Given** un producto sin información adicional cargada, **When** se
   visita su página, **Then** no se muestra ninguna sección relacionada,
   vacía o con encabezado sin contenido.

---

### Edge Cases

- ¿Qué pasa si el administrador pega texto copiado desde Word o Google
  Docs directamente en el editor? → El editor visual normaliza el
  contenido a su propio formato soportado (títulos, listas, negrita,
  cursiva); estilos no soportados se descartan sin romper el editor.
- ¿Qué pasa si el administrador dejó la información adicional a medias (ej.
  un título sin texto debajo)? → Se guarda tal cual — no hay validación de
  contenido mínimo, es un campo opcional de forma completa.
- ¿Qué pasa con la seguridad del HTML generado, dado que se guarda y se
  muestra directamente en la página pública? → El editor visual no ofrece
  ninguna forma de insertar HTML o scripts arbitrarios a través de su
  interfaz (no hay botón de "código fuente"), y solo el administrador de
  confianza tiene acceso al panel — ver Assumptions para el límite de este
  supuesto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel de administración DEBE ofrecer un editor de texto
  con barra de herramientas visual (al menos: negrita, cursiva, títulos,
  lista con viñetas, lista numerada) para un nuevo campo de "Información
  adicional" por producto.
- **FR-002**: El administrador NUNCA DEBE necesitar escribir ni ver código
  HTML para dar formato al contenido — toda la edición ocurre mediante la
  barra de herramientas o atajos de teclado estándar de un editor de texto.
- **FR-003**: El contenido de "Información adicional" DEBE guardarse junto
  con el resto de los datos del producto y persistir igual que los demás
  campos.
- **FR-004**: La página individual del producto DEBE mostrar este
  contenido respetando su formato (títulos, listas, negritas), en una
  sección visualmente diferenciada de la descripción principal.
- **FR-005**: Si un producto no tiene información adicional cargada, su
  página NUNCA DEBE mostrar una sección vacía, título huérfano, o espacio
  en blanco relacionado a este campo.
- **FR-006**: El contenido renderizado DEBE mantener consistencia visual
  con el tema oscuro del resto del sitio (texto legible, espaciado
  coherente) sin que el administrador necesite escribir CSS.

### Key Entities

- **Información adicional (producto)**: nuevo atributo opcional del
  producto ya existente — contenido con formato (títulos, listas,
  negritas) editado visualmente, mostrado únicamente en la página
  individual del producto (no en las tarjetas del catálogo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede aplicar formato básico (negrita,
  título, lista) a un texto usando solo la barra de herramientas, sin
  consultar ninguna documentación de HTML.
- **SC-002**: El 100% de los productos sin información adicional cargada no
  muestran ninguna sección vacía en su página pública.
- **SC-003**: El 100% de los productos con información adicional cargada la
  muestran con su formato (títulos, listas, negritas) visualmente correcto
  en su página individual.

## Assumptions

- **Sin sanitización adicional del HTML resultante**: dado que solo existe
  un administrador de confianza (ver `001-admin-productos`) y el editor
  visual no permite insertar HTML o scripts arbitrarios a través de su
  interfaz estándar, no se agrega una capa de sanitización (ej. DOMPurify)
  en esta primera versión. Si en el futuro más de una persona editara el
  catálogo, esto debería revisarse.
- **Solo en la página individual**: este contenido no se muestra en las
  tarjetas del catálogo de la home, solo en la página dedicada de cada
  producto (`002-pagina-producto`).
