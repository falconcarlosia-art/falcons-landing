# Feature Specification: Editor Avanzado de Contenido de Producto

**Feature Branch**: `004-editor-avanzado-producto`

**Created**: 2026-08-03

**Status**: Draft

**Input**: La página individual de producto (`002-pagina-producto`) ya tiene
un campo de texto enriquecido opcional (`003-info-adicional-producto`). El
dueño del negocio quiere acercarse más a lo que ofrecen páginas de producto
de e-commerce como AliExpress/Amazon: (1) una ficha técnica estructurada
(especificaciones tipo atributo/valor, no texto libre), (2) poder
redimensionar las imágenes insertadas en el texto enriquecido, y (3) poder
combinar imagen y texto en un layout más libre que una sola columna —
resuelto con una **tabla insertable** donde cada celda acepta texto y/o
imágenes, en vez de un bloque fijo de "imagen a la izquierda, texto a la
derecha" (ver decisión en `plan.md → Technical Context`, tomada durante la
implementación al descubrirse que la extensión oficial de tablas de Tiptap
ya soporta esto de forma nativa, más flexible y con menos código propio que
mantener). Las reseñas/calificaciones de clientes, evaluadas también como
posible mejora, quedan explícitamente fuera de esta primera versión por
implicar un cambio de modelo de seguridad (escritura pública) — ver
Assumptions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ficha técnica estructurada (Priority: P1)

El administrador agrega filas de especificación técnica (ej. "Voltaje:
100-240V", "Alcance: 6m", "Garantía: 12 meses") a un producto, y estas se
muestran como una tabla prolija en la página del producto — no como texto
libre dentro del párrafo de descripción.

**Why this priority**: Es la mejora más solicitada y la más parecida a
cualquier ficha técnica de e-commerce real — sin esto, cualquier dato
técnico queda mezclado dentro del texto libre, menos escaneable para el
comprador.

**Independent Test**: Agregar 3 filas de especificación a un producto,
guardar → la página del producto muestra una tabla con esas 3 filas,
label a la izquierda y valor a la derecha.

**Acceptance Scenarios**:

1. **Given** el administrador está editando un producto, **When** agrega
   una fila con label "Voltaje" y valor "100-240V", **Then** esa fila queda
   guardada asociada al producto.
2. **Given** un producto con especificaciones cargadas, **When** un
   visitante ve su página, **Then** ve una tabla clara de especificaciones,
   separada del texto de "Información adicional".
3. **Given** el administrador quiere reordenar o eliminar una fila,
   **When** usa los controles del editor de especificaciones, **Then** el
   cambio se refleja en el orden final mostrado en la página pública.
4. **Given** un producto sin ninguna especificación cargada, **When** se
   visita su página, **Then** no se muestra ninguna tabla ni sección vacía.

---

### User Story 2 — Redimensionar imágenes dentro del texto (Priority: P2)

El administrador, tras insertar una imagen en "Información adicional",
puede arrastrar sus bordes para agrandarla o achicarla, y ese tamaño se
respeta en la página pública.

**Why this priority**: Mejora la presentación visual del contenido ya
existente (feature `003`), pero no es indispensable para que el contenido
sea útil — por eso es P2, no P1.

**Independent Test**: Insertar una imagen, redimensionarla arrastrando una
esquina dentro del editor, guardar → en la página pública esa imagen se ve
al tamaño elegido, no a su tamaño original completo.

**Acceptance Scenarios**:

1. **Given** una imagen insertada en el editor, **When** el administrador
   arrastra sus controles de tamaño, **Then** la imagen cambia de tamaño en
   tiempo real dentro del editor.
2. **Given** una imagen redimensionada y guardada, **When** un visitante ve
   la página del producto, **Then** la imagen se muestra exactamente al
   tamaño elegido, sin desbordar el ancho de su contenedor en ningún
   dispositivo.

---

### User Story 3 — Tabla con texto e imágenes por celda (Priority: P2)

El administrador inserta una tabla y, en cualquiera de sus celdas, escribe
texto y/o inserta una imagen — permitiendo, por ejemplo, una fila con una
imagen en una columna y su descripción en la otra, o cualquier combinación
de filas/columnas que necesite.

**Why this priority**: Es una mejora de presentación visual, no de
contenido — el mismo texto e imagen ya se pueden mostrar hoy, solo que en
una sola columna continua. Por eso es P2.

**Independent Test**: Insertar una tabla de 2×2, escribir texto en una
celda y cargar una imagen en otra, guardar → en la página pública se ve la
misma tabla con su contenido, y en pantallas angostas se puede desplazar
horizontalmente sin romper el diseño de la página.

**Acceptance Scenarios**:

1. **Given** el administrador inserta una tabla, **When** agrega texto e
   imágenes en distintas celdas, **Then** todo queda guardado como parte
   del contenido del producto, con la estructura de filas/columnas
   intacta.
2. **Given** un producto con una tabla en su contenido, **When** se visita
   su página, **Then** la tabla se ve con bordes claros y su contenido
   (texto e imágenes) tal como se guardó.
3. **Given** el mismo producto, **When** se visita desde un celular
   (viewport angosto) y la tabla es más ancha que la pantalla, **Then** la
   tabla se puede desplazar horizontalmente dentro de su propio contenedor,
   sin desbordar ni romper el resto de la página.

---

### Edge Cases

- ¿Qué pasa si el administrador deja una fila de especificación con label
  pero sin valor (o viceversa)? → Se guarda igual; no hay validación de
  campos obligatorios en las filas, es contenido opcional y de bajo riesgo.
- ¿Qué pasa si se redimensiona una imagen a un tamaño mayor al ancho
  disponible de la página? → La imagen nunca debe superar el ancho de su
  contenedor, sin importar el tamaño elegido en el editor.
- ¿Qué pasa con contenido ya guardado antes de este feature (imágenes
  simples de `003-info-adicional-producto`, sin redimensionar)? → Debe
  seguir viéndose igual que antes; este feature solo agrega capacidades
  nuevas, no modifica el contenido ya existente.
- ¿Qué pasa si el administrador quiere un layout más complejo que una
  tabla (ej. video embebido)? → Fuera de alcance de esta versión; la tabla
  cubre el caso de uso real solicitado (imagen + texto combinados) de forma
  general, sin necesidad de un bloque especial adicional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El panel de administración DEBE permitir agregar, editar,
  reordenar y eliminar filas de especificación técnica (label + valor) por
  producto.
- **FR-002**: La página individual del producto DEBE mostrar las
  especificaciones técnicas como una tabla clara y separada del texto de
  "Información adicional", únicamente cuando exista al menos una fila
  cargada.
- **FR-003**: El editor de "Información adicional" DEBE permitir
  redimensionar cualquier imagen insertada arrastrando sus controles,
  dentro del propio editor.
- **FR-004**: El tamaño elegido para una imagen DEBE conservarse al
  mostrarse en la página pública del producto.
- **FR-005**: Ninguna imagen, sin importar el tamaño elegido en el editor,
  DEBE superar el ancho disponible de su contenedor en la página pública.
- **FR-006**: El editor DEBE permitir insertar una tabla, y cada celda DEBE
  aceptar tanto texto con formato como imágenes, en cualquier combinación.
- **FR-007**: Una tabla más ancha que la pantalla DEBE poder desplazarse
  horizontalmente dentro de su propio contenedor en pantallas angostas
  (móvil), sin desbordar ni romper el resto de la página.
- **FR-008**: El contenido ya guardado antes de este feature (texto e
  imágenes simples de `003-info-adicional-producto`) DEBE seguir
  mostrándose sin cambios visuales.

### Key Entities

- **Especificación técnica (fila)**: par label/valor asociado a un
  producto, con un orden definido — ej. "Voltaje" → "100-240V". Conjunto
  ordenado de filas por producto, independiente del texto de "Información
  adicional".
- **Tabla de contenido**: estructura de filas y columnas dentro de
  "Información adicional" donde cada celda acepta texto con formato y/o
  imágenes de forma independiente — reemplaza la idea original de un
  "bloque imagen + texto" fijo por algo más general y flexible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede cargar una ficha técnica de al menos 3
  filas en menos de 2 minutos, sin escribir código.
- **SC-002**: El 100% de los productos sin especificaciones cargadas no
  muestran ninguna tabla ni sección vacía relacionada.
- **SC-003**: El 100% de las imágenes redimensionadas en el editor
  conservan su tamaño elegido en la página pública, sin desbordar su
  contenedor en ningún dispositivo.
- **SC-004**: El 100% de las tablas insertadas conservan su estructura de
  filas/columnas y el contenido (texto e imágenes) de cada celda en la
  página pública, con desplazamiento horizontal en pantallas angostas si
  la tabla no entra en el ancho disponible.
- **SC-005**: El 100% del contenido creado antes de este feature (texto e
  imágenes simples) sigue viéndose sin cambios tras la actualización.

## Assumptions

- **Reseñas y calificaciones quedan fuera de alcance**: implican que
  visitantes públicos escriban directamente en la base de datos — un
  cambio de modelo de seguridad distinto a todo lo construido hasta ahora
  (donde solo el administrador autenticado escribe). Requiere su propio
  spec con decisiones de moderación, prevención de spam, y si se exige
  algún dato de contacto al reseñador. Se evaluará como feature separado
  más adelante.
- **Tabla oficial de Tiptap en vez de un bloque a medida**: la decisión
  original (plan.md) era construir un Node custom "imagen + texto lado a
  lado". Durante la implementación se detectó que la extensión oficial de
  tablas de Tiptap (`@tiptap/extension-table`, mantenida por el mismo
  equipo, no por la comunidad) ya permite cualquier contenido en bloque
  dentro de cada celda —incluidas imágenes— sin configuración adicional.
  Se descartó el Node custom (que además tuvo dos bugs reales durante las
  pruebas: anidación indebida y desborde por `min-width` de flexbox) en
  favor de la tabla oficial, más general, mejor mantenida, y con menos
  código propio que sostener.
- **Especificaciones sin tabla relacional propia**: dado el tamaño del
  catálogo y que hay un solo administrador, las filas de especificación se
  guardan como una lista ordenada dentro del mismo registro del producto,
  no en una tabla separada.
