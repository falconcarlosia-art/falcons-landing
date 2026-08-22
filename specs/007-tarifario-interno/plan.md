# Implementation Plan: Tarifario interno de precios (oculto)

**Feature Branch**: `007-tarifario-interno`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-08-21

## Summary

Se crea una tabla nueva, `internal_prices`, separada de `services`
(005-servicios) porque el modelo de datos no calza: el tarifario es
granular (unidad de cobro + precio por ítem) mientras que `services` es
deliberadamente plano y sin precio. RLS habilitado sin ninguna política de
lectura pública — solo el admin autenticado del panel puede leer/escribir;
la app externa la consume con la `service_role key` de Supabase, que
ignora RLS por diseño. El panel `/admin` gana una sección "Precios
internos" paralela a Productos y Servicios, con el mismo patrón de
lista/formulario.

## Technical Context

**Por qué tabla nueva y no una columna en `services`**: `services` tiene
19 tarjetas amplias (categoría/título/descripción) sin precio ni unidad —
decisión ya documentada (`specs/005-servicios/spec.md` → Assumptions). El
tarifario tiene ~30 ítems mucho más granulares, cada uno con una unidad de
cobro distinta (por punto, por metro, por hora, fijo). Forzarlo en
`services` requeriría o bien precios nulos en la mayoría de servicios, o
bien romper la tarjeta de servicio existente — más simple y más seguro
mantenerlos separados.

**Por qué sin política RLS pública en vez de ocultar una sola columna**:
RLS en Postgres es por fila, no por columna — no se puede exponer
`services` completo a `anon` y esconder una sola columna con RLS. Como el
tarifario es una tabla aparte que el sitio público nunca necesita tocar,
la solución más simple y más segura es no darle ninguna política de
lectura a `anon`/`authenticated` de la web: con RLS habilitado y sin
política que aplique, Postgres deniega por defecto. El único camino de
lectura completo es `service_role`, que dicho diseño de Supabase ignora
RLS — exactamente lo que necesita la app externa.

**Diferencias deliberadas frente a `services`**:
- Sin política `public_read_active_*` — a propósito, ver arriba.
- Columnas nuevas que `services` no tiene: `item` (en vez de `title`,
  para no confundir con "servicio"), `detail`, `unit`, `price`, `note`.

## Project Structure

### Documentation (this feature)

```
specs/007-tarifario-interno/
├── spec.md
└── plan.md
```

### Source Code (a crear/modificar)

```
src/admin/
├── InternalPriceList.jsx   # análogo a ServiceList.jsx, agrupado/filtrable por categoría
└── InternalPriceForm.jsx   # análogo a ServiceForm.jsx: categoría, ítem, detalle, unidad, precio, nota
src/admin/AdminApp.jsx      # rutas nuevas: /admin/precios, /admin/precios/nuevo, /admin/precios/:id
src/admin/AdminLayout.jsx   # agrega tab "Precios internos" junto a Productos/Servicios
```

Nada fuera de `src/admin/` cambia — el sitio público (`FalconsLanding.jsx`,
`src/pages/ServicePage.jsx`, `scripts/prerender.mjs`) no debe llegar a
consultar `internal_prices` nunca (spec.md → FR-003).

### Base de datos

```sql
create table public.internal_prices (
  id bigint generated always as identity primary key,
  category text not null,
  item text not null,
  detail text,
  unit text not null,
  price numeric(10,2) not null,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.internal_prices enable row level security;

-- Sin política de lectura pública a propósito (ver Technical Context):
-- anon/authenticated de la web pública no tienen ningún SELECT.

create policy "admin_read_all_internal_prices"
  on public.internal_prices for select to authenticated
  using (true);

create policy "admin_insert_internal_prices"
  on public.internal_prices for insert to authenticated
  with check (true);

create policy "admin_update_internal_prices"
  on public.internal_prices for update to authenticated
  using (true) with check (true);

create policy "admin_delete_internal_prices"
  on public.internal_prices for delete to authenticated
  using (true);

create trigger internal_prices_set_updated_at
before update on public.internal_prices
for each row
execute function public.set_updated_at(); -- función ya creada en 001-admin-productos
```

**Seed inicial** (30 ítems, 7 categorías — precios de conmutado y táctil 3
canales ajustados frente a la propuesta original, ver nota al final):

```sql
insert into public.internal_prices (category, item, detail, unit, price, note) values
-- 1. Puntos eléctricos básicos (obra nueva o remodelación)
('Puntos eléctricos básicos', 'Punto de luz (centro de techo)', null, 'por punto', 35.00, null),
('Puntos eléctricos básicos', 'Interruptor simple (mecánico)', null, 'por punto', 25.00, null),
('Puntos eléctricos básicos', 'Interruptor doble (mecánico)', null, 'por punto', 50.00, null),
('Puntos eléctricos básicos', 'Interruptor triple (mecánico)', null, 'por punto', 75.00, null),
('Puntos eléctricos básicos', 'Interruptor conmutado (de escalera, 2 puntos de control)', null, 'por punto', 55.00, 'Ajustado de S/35 a S/55: requiere dos puntos de control cableados entre sí, más cable y mano de obra que un simple.'),
('Puntos eléctricos básicos', 'Tomacorriente simple', null, 'por punto', 30.00, null),
('Puntos eléctricos básicos', 'Punto mixto (interruptor + tomacorriente en la misma caja)', null, 'por punto', 50.00, null),

-- 2. Interruptores y enchufes inteligentes (domótica)
('Interruptores y enchufes inteligentes (domótica)', 'Mini interruptor WiFi (empotrado)', 'Instalación del módulo detrás del interruptor existente, sin cambiar la placa visible. No incluye el dispositivo.', 'por punto', 40.00, null),
('Interruptores y enchufes inteligentes (domótica)', 'Interruptor táctil 1 canal', 'Instalación reemplazando la placa/interruptor visible, 1 botón. No incluye el dispositivo.', 'por punto', 45.00, null),
('Interruptores y enchufes inteligentes (domótica)', 'Interruptor táctil 2 canales', 'Igual al anterior, 2 botones.', 'por punto', 60.00, null),
('Interruptores y enchufes inteligentes (domótica)', 'Interruptor táctil 3 canales', 'Igual al anterior, 3 botones.', 'por punto', 68.00, 'Ajustado de S/75 a S/68: el salto frente al de 2 canales (+S/15) era desproporcionado para un canal más en la misma placa.'),

-- 3. Cableado y obra eléctrica menor
('Cableado y obra eléctrica menor', 'Cableado — servicio (canaleta + mano de obra)', 'Tendido de un tramo por la superficie de la pared. No incluye el cable en sí.', 'por metro', 6.00, null),
('Cableado y obra eléctrica menor', 'Cable eléctrico — insumo (14 AWG, por conductor)', 'Solo el material. La mayoría de tramos necesita 2 conductores — multiplica x2.', 'por metro (por conductor)', 2.00, null),
('Cableado y obra eléctrica menor', 'Cableado embutido (empotrado, con resane)', 'Ranurado de pared, tubería empotrada, cable y acabado.', 'por metro', 25.00, null),
('Cableado y obra eléctrica menor', 'Cargo mínimo por cableado', 'Aplica si el tramo total es menor a ~3 metros.', 'fijo', 40.00, null),

-- 4. Tablero y protecciones
('Tablero y protecciones', 'Tablero eléctrico básico (8 polos), instalación', null, 'unidad', 200.00, null),
('Tablero y protecciones', 'Llave térmica / breaker (cambio o instalación en tablero existente)', null, 'unidad', 20.00, null),
('Tablero y protecciones', 'Cable tendido de medidor/acometida a tablero', null, 'tramo típico', 80.00, null),

-- 5. Pozo a tierra (puesta a tierra)
('Pozo a tierra', 'Pozo a tierra básico (residencial, sin certificación formal)', null, 'servicio', 900.00, 'Solo instalación física.'),
('Pozo a tierra', 'Pozo a tierra con certificación completa', null, 'servicio', 1600.00, 'Protocolo CIP, medición, diagrama unifilar, acta de conformidad y garantía de 1 año — para negocios/oficinas. Plantas industriales/clínicas pueden subir a S/4,000-5,000, fuera del alcance residencial típico.'),
('Pozo a tierra', 'Mantenimiento / recertificación de pozo a tierra existente', null, 'servicio', 300.00, null),

-- 6. Instalaciones especiales
('Instalaciones especiales', 'Ventilador de techo (instalación, altura 2.5-4m)', null, 'unidad', 50.00, null),
('Instalaciones especiales', 'Luminaria especial / empotrada (spot, panel LED)', null, 'unidad', 50.00, null),
('Instalaciones especiales', 'Preparación de punto para aire acondicionado (línea dedicada 220V + breaker)', null, 'unidad', 230.00, null),
('Instalaciones especiales', 'Ducha eléctrica (conexión)', null, 'unidad', 50.00, null),
('Instalaciones especiales', 'Portero eléctrico / timbre con video (instalación)', null, 'unidad', 250.00, null),
('Instalaciones especiales', 'Luz de emergencia (instalación)', null, 'unidad', 20.00, null),

-- 7. Visita técnica y mano de obra general
('Visita técnica y mano de obra general', 'Visita técnica / diagnóstico', null, 'visita', 50.00, 'Se descuenta si contratan el servicio.'),
('Visita técnica y mano de obra general', 'Mano de obra por hora — trabajo básico', null, 'hora', 40.00, null),
('Visita técnica y mano de obra general', 'Mano de obra por hora — trabajo especializado / urgencia', null, 'hora', 80.00, null);
```

Mismo patrón de seguridad base que `products`/`services` (ver
`001-admin-productos/plan.md` y `005-servicios/plan.md`), salvo la
política pública, omitida a propósito.

**Precondición**: requiere el MCP de Supabase autorizado, o aplicar este
bloque manualmente desde el SQL Editor de Supabase Studio si el MCP no
está disponible en la sesión.

## Complexity Tracking

| Decisión | Justificación | Alternativa descartada |
|---|---|---|
| Tabla `internal_prices` separada de `services` | Modelo de datos distinto (unidad + precio por ítem vs. tarjeta plana sin precio) | Agregar columna `price` a `services` — no representa la granularidad por unidad, y mezclaría datos internos con la tabla que sí se lee públicamente |
| Sin política RLS pública (en vez de ocultar una columna) | RLS es por fila, no por columna — no se puede esconder una sola columna de una tabla que también expone otras a `anon` | Vista de Postgres que excluya `price` — innecesario porque ninguna columna de esta tabla debe ser pública, no solo el precio |
| Reutilizar `set_updated_at()` existente | Ya existe, creada en `001-admin-productos` | Duplicar la función para esta tabla |

## Fase 1: Implementation

### Phase 1 — Base de datos (bloqueante)
Crear tabla `internal_prices`, políticas RLS (sin lectura pública),
trigger de `updated_at`, seed de los 30 ítems iniciales.

### Phase 2 — Panel de administración (US1)
`InternalPriceList.jsx`, `InternalPriceForm.jsx`, rutas en `AdminApp.jsx`,
tab "Precios internos" en `AdminLayout.jsx`.

### Phase 3 — Verificación (US2, US3)
Confirmar que ninguna página pública consulta la tabla, que una lectura
anónima (`anon`) no devuelve filas, y que el resto del sitio (Productos,
Servicios) no sufre ningún cambio de comportamiento.

## Dependencias entre fases

```
Phase 1 (base de datos, bloqueante)
  └─→ Phase 2 (panel admin)
        └─→ Phase 3 (verificación)
```

## Pre-condiciones bloqueantes

**Autorizar/reconectar el MCP de Supabase** antes de poder ejecutar la
Fase 1, o aplicar el SQL manualmente desde Supabase Studio.
