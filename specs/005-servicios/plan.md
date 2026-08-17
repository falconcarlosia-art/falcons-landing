# Implementation Plan: Sección de Servicios

**Feature Branch**: `005-servicios`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-17

## Summary

Se replica la arquitectura ya construida para productos (`001-admin-
productos`), adaptada a un modelo de datos más simple: tabla `services`
(categoría de texto libre, título, descripción, estado activo/oculto — sin
precio, sin imágenes), con las mismas políticas RLS (lectura pública solo
activos, escritura solo admin autenticado). El panel `/admin` gana una
sección de Servicios paralela a Productos; el sitio público gana una
sección "Servicios" con filtro por categoría y botón de WhatsApp por
tarjeta, sin precios.

## Technical Context

**Por qué replicar la arquitectura de productos**: es exactamente el mismo
problema (catálogo administrable sin tocar código) con un modelo de datos
más chico — reutilizar el patrón evita decisiones nuevas de arquitectura y
mantiene el panel consistente para el administrador (misma lógica de
sesión, mismas convenciones de UI).

**Diferencias deliberadas frente a `products`**:
- `category` es texto libre (no un `enum` con color fijo por categoría
  como en productos) — evita tocar código si se agrega una categoría de
  servicio nueva.
- Sin `price`, sin `images` — el documento fuente no los necesita para
  esta versión (ver spec.md → Assumptions).
- Sin página individual por servicio (a diferencia de
  `002-pagina-producto`) — no fue solicitada; los servicios viven solo en
  la sección de la home.

## Project Structure

### Documentation (this feature)

```
specs/005-servicios/
├── spec.md
└── plan.md
```

### Source Code (a crear/modificar)

```
src/admin/
├── ServiceList.jsx        # análogo a ProductList.jsx, sin columna de precio/imagen
└── ServiceForm.jsx        # análogo a ProductForm.jsx: categoría (texto libre), título, descripción
src/admin/AdminApp.jsx      # rutas nuevas: /admin/servicios, /admin/servicios/nuevo, /admin/servicios/:id
src/admin/AdminLayout.jsx   # navegación simple entre "Productos" y "Servicios"
FalconsLanding.jsx           # nueva sección ServicesShowroom (misma ubicación que ProductShowroom hoy:
                              # definida in-line, sin extraer a src/components, porque no hay página
                              # individual de servicio que la reutilice — mismo criterio ya aplicado a
                              # ProductShowroom)
src/components/Navbar.jsx    # agrega el enlace "Servicios" a la navegación
```

### Base de datos

```sql
create table public.services (
  id bigint generated always as identity primary key,
  category text not null,
  title text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "public_read_active_services"
  on public.services for select to anon, authenticated
  using (active = true);

create policy "admin_read_all_services"
  on public.services for select to authenticated
  using (true);

create policy "admin_insert_services"
  on public.services for insert to authenticated
  with check (true);

create policy "admin_update_services"
  on public.services for update to authenticated
  using (true) with check (true);

create policy "admin_delete_services"
  on public.services for delete to authenticated
  using (true);

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at(); -- función ya creada en 001-admin-productos
```

Mismo patrón de seguridad exacto que `products` (ver `001-admin-
productos/plan.md`), incluida la corrección de `search_path` ya aplicada
a `set_updated_at()` — se reutiliza la misma función, no se duplica.

**Precondición**: requiere el MCP de Supabase reconectado (se desconectó
en esta sesión) antes de poder aplicar esta migración.

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| `category` como texto libre en vez de enum con color fijo | Evita tocar código para agregar/renombrar categorías de servicio | Replicar el patrón `CATEGORY_STYLES` de productos — más vistoso pero requiere código para cada categoría nueva |
| Sin página individual de servicio | No fue solicitada; los servicios no necesitan SEO individual como sí lo necesitaban los productos (motivo original de `002-pagina-producto`) | Replicar `/servicio/:id/:slug` — trabajo no solicitado, se agrega si se pide más adelante |
| Reutilizar `set_updated_at()` existente | Ya existe y está corregida (search_path fijo) desde `001-admin-productos` | Crear una función duplicada para `services` — innecesario |

## Fase 1: Implementation

### Phase 1 — Base de datos (bloqueante)
Crear tabla `services`, políticas RLS, trigger de `updated_at`. Requiere
Supabase reconectado. Seed de los 19 servicios de las 4 categorías
elegidas (spec.md → SC-004), extraídos del documento fuente.

### Phase 2 — Panel de administración (US3)
`ServiceList.jsx`, `ServiceForm.jsx`, rutas en `AdminApp.jsx`, navegación
"Productos / Servicios" en `AdminLayout.jsx`.

### Phase 3 — Sitio público (US1, US2)
`ServicesShowroom` en `FalconsLanding.jsx`: fetch a `services`, filtro por
categoría (dinámico, igual que productos), tarjetas sin precio con botón
de WhatsApp. Enlace "Servicios" agregado a `Navbar.jsx`.

### Phase 4 — Verificación de regresión
Confirmar que la sección de Productos, el panel de admin de productos, y
el resto del sitio no sufren ningún cambio de comportamiento.

## Dependencias entre fases

```
Phase 1 (base de datos, bloqueante)
  └─→ Phase 2 (panel admin)
  └─→ Phase 3 (sitio público)
        └─→ Phase 4 (verificación)
```

Phase 2 y Phase 3 son independientes entre sí una vez completada Phase 1.

## Pre-condiciones bloqueantes

**Reconectar el MCP de Supabase** (se desconectó en esta sesión) antes de
poder ejecutar la Fase 1.
