# Feature Specification: Tarifario interno de precios (oculto)

**Feature Branch**: `007-tarifario-interno`

**Created**: 2026-08-21

**Status**: Draft

**Input**: Falcons armó un tarifario granular (~30 ítems: puntos
eléctricos básicos, interruptores/domótica, cableado, tablero y
protecciones, pozo a tierra, instalaciones especiales, visita técnica y
mano de obra) con precio por unidad (por punto, por metro, por hora, fijo,
etc.). A diferencia de `services` (005-servicios), que deliberadamente no
muestra precio en el sitio público, este tarifario **nunca debe
publicarse en la web** — es para consumo exclusivo de otra aplicación
(con su propio backend) que lo lee directo de la base de datos. El dueño
del negocio sí quiere poder mantenerlo desde `/admin`, igual que productos
y servicios.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Mantener el tarifario sin tocar código (Priority: P1)

El administrador crea, edita, oculta y elimina ítems del tarifario desde
`/admin`, con los mismos controles de acceso ya usados para productos y
servicios.

**Why this priority**: Es la única forma de mantener el tarifario
actualizado sin depender de ejecutar SQL a mano cada vez que cambia un
precio.

**Independent Test**: Crear un ítem nuevo desde `/admin` → queda
guardado en la base de datos con categoría, ítem, unidad y precio.

**Acceptance Scenarios**:

1. **Given** el administrador con sesión iniciada, **When** entra a la
   sección "Precios internos" del panel, **Then** ve la lista completa de
   ítems del tarifario, agrupados o filtrables por categoría.
2. **Given** el administrador, **When** crea un ítem nuevo con categoría,
   nombre, unidad y precio, **Then** el ítem queda guardado en la base de
   datos.
3. **Given** un ítem existente, **When** el administrador lo oculta,
   **Then** queda marcado como oculto pero sigue en la base de datos.
4. **Given** un ítem existente, **When** el administrador lo elimina con
   confirmación, **Then** desaparece de la base de datos.

---

### User Story 2 — Ningún precio se filtra al sitio público (Priority: P1)

Nada de lo que el administrador cargue en el tarifario aparece en ninguna
página pública de `falcem.com`, sin importar si el ítem está activo u
oculto.

**Why this priority**: Es la razón de ser del feature — estos precios son
información interna/operativa, no de cara al cliente. Si se filtrara al
sitio público, invalidaría el propósito del tarifario.

**Independent Test**: Con el tarifario cargado, revisar cada página
pública del sitio (home, sección de servicios, páginas de producto) → en
ninguna aparece ningún dato del tarifario.

**Acceptance Scenarios**:

1. **Given** el tarifario con ítems activos, **When** un visitante navega
   el sitio público, **Then** no encuentra ningún precio ni referencia al
   tarifario en ninguna página.
2. **Given** una consulta anónima (sin sesión) a la base de datos con la
   clave pública (`anon`), **When** se intenta leer la tabla del
   tarifario, **Then** la lectura no devuelve ninguna fila (bloqueada por
   RLS).

---

### User Story 3 — Otra aplicación consume el tarifario (Priority: P2)

Una aplicación externa, con su propio backend, lee el tarifario completo
directo de la base de datos usando su propia credencial de servicio.

**Why this priority**: Es el destino final de estos datos, pero es
responsabilidad de esa otra aplicación (fuera de este repo) — aquí solo
se garantiza que los datos existan y sean accesibles vía una credencial de
servicio.

**Independent Test**: Con una credencial `service_role` de Supabase (no
la `anon` pública), leer la tabla del tarifario → devuelve todos los
ítems, activos y ocultos.

**Acceptance Scenarios**:

1. **Given** una credencial `service_role` de Supabase, **When** se
   consulta la tabla del tarifario, **Then** se obtienen todos los ítems
   sin restricción, sin importar su estado activo/oculto.

---

### Edge Cases

- ¿Qué pasa si el administrador oculta un ítem? → Sigue existiendo en la
  base de datos (visible para `service_role` y para el admin logueado),
  solo cambia su columna `active` — igual semántica que en `services`.
- ¿Qué pasa si alguien intenta leer la tabla con la clave `anon` (la que
  usa el sitio público)? → No hay ninguna política RLS que se lo permita;
  la consulta no devuelve filas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE almacenar cada ítem del tarifario con
  categoría, nombre del ítem, detalle opcional, unidad de cobro, precio y
  nota opcional.
- **FR-002**: El administrador DEBE poder crear, editar, ocultar,
  reactivar y eliminar ítems del tarifario desde `/admin`, con el mismo
  patrón de acceso protegido ya usado para productos y servicios.
- **FR-003**: Ninguna página pública del sitio DEBE consultar ni mostrar
  ningún dato del tarifario.
- **FR-004**: La tabla del tarifario DEBE tener RLS habilitado sin
  ninguna política de lectura para los roles `anon`/`authenticated` de la
  web pública — solo el rol admin autenticado del panel puede leer/
  escribir, y `service_role` (usado por la app externa) puede leer sin
  restricción por diseño de Supabase.

### Key Entities

- **Ítem de tarifario**: categoría (texto libre), nombre del ítem, detalle
  (texto opcional), unidad de cobro (texto libre: "por punto", "por
  metro", "hora", "fijo", "servicio", "visita"...), precio (numérico),
  nota (texto opcional), estado (activo/oculto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las páginas públicas del sitio siguen sin mostrar
  ningún dato del tarifario, verificado tras el despliegue.
- **SC-002**: Una consulta con la clave `anon` a la tabla del tarifario
  devuelve 0 filas.
- **SC-003**: El administrador puede publicar un ítem nuevo del tarifario
  desde `/admin` en menos de 2 minutos, sin escribir código.
- **SC-004**: Los ~30 ítems iniciales del tarifario (7 categorías) quedan
  cargados en la base de datos al cierre de esta primera versión.

## Assumptions

- **Tabla separada de `services`**: la granularidad por unidad (por
  punto/metro/hora/fijo) y el precio no calzan con el modelo de
  `services` (categoría/título/descripción, sin precio ni unidad) — ver
  `specs/005-servicios/spec.md` → Assumptions. Se modela como una entidad
  nueva en vez de extender `services`.
- **Sin cotizador público en esta versión**: no existe hoy ningún
  "cotizador" (calculadora de precios) en el sitio público — este feature
  solo cubre almacenamiento y administración del tarifario, no una
  interfaz de cotización de cara al cliente.
- **`service_role` vive fuera de este repo**: la credencial que usará la
  aplicación externa para leer el tarifario se gestiona en el backend de
  esa aplicación, nunca en este repo ni en el bundle del navegador.
