# Implementation Plan: Rediseño de la tienda

**Feature Branch**: `008-rediseno-tienda`

**Spec**: [spec.md](./spec.md)

**Created**: 2026-09-26

## Summary

Tokens de diseño en `tailwind.config.js` (bg/surface/line/ink/muted/brand/
wa/photo) con Geist + Geist Mono autoalojadas; taxonomía única en
`src/lib/catalog.js` compartida por sitio, admin y prerender; catálogo
`/productos` y `/productos/:categoria` prerenderizados; lista de pedido
(`src/lib/order.jsx`) con cierre por WhatsApp; ficha de producto nueva con
galería, compatibilidad, variantes y barra fija en móvil.

## Migración (Supabase → SQL Editor)

**Bloquea los filtros nuevos.** El sitio funciona sin ella (todo se trata
como Wi-Fi, sin ambientes ni ecosistemas), pero el panel admin no podrá
guardar productos hasta aplicarla.

```sql
alter table public.products
  add column protocol text not null default 'wifi',
  add column ecosystems text[] not null default '{}',
  add column rooms text[] not null default '{}',
  add column needs_neutral boolean,            -- null = no aplica
  add column needs_hub boolean not null default false,
  add column in_stock boolean not null default true,
  add column featured boolean not null default false,
  add column variants jsonb not null default '[]'::jsonb;

-- Todo el catálogo actual declara compatibilidad con Alexa y Google Home
-- en su descripción. Revisar antes de ejecutar.
update public.products set ecosystems = '{alexa,google}';
```

Las políticas RLS existentes (por fila) cubren las columnas nuevas.

Valores válidos (deben coincidir con `src/lib/catalog.js`):
- `protocol`: wifi, zigbee, matter, bluetooth, rf
- `ecosystems`: alexa, google, homekit, smartthings
- `rooms`: sala, dormitorio, cocina, bano, entrada, exterior, oficina
- `variants`: `[{ "label": "Canales", "options": ["1", "2", "3"] }]`

## Fotos con fondo uniforme

Estándar: 1200×1200, fondo `#F3F4F6`, producto centrado al ~80 %, WebP. Las
tarjetas ya usan ese fondo y `mix-blend-multiply`, así que las fotos con
fondo blanco se integran mientras se reemplazan. Para reemplazarlas: quitar
el fondo en lote (Photoroom / remove.bg) y subir desde el panel.
