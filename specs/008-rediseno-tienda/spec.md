# Feature Specification: Rediseño de la tienda (catálogo, pedido por WhatsApp)

**Feature Branch**: `008-rediseno-tienda`

**Created**: 2026-09-26

**Status**: Implementado — requiere aplicar la migración de `plan.md`

**Input**: Guía de rediseño UX/UI (secciones 1–5: sistema de diseño, home,
página de producto, navegación/catálogo y móvil). Contexto del negocio: el
cierre de venta sigue siendo por WhatsApp (sin checkout), el cliente es
particular (B2C) y el catálogo crecerá a 100–200+ productos.

## User Scenarios

### US1 — Encontrar un producto en un catálogo grande (P1)

El visitante entra a `/productos` (o `/productos/<categoria>`), busca por
texto y filtra por conexión, ecosistema, app, ambiente, precio e
instalación (sin neutro / sin hub). Los filtros viven en la URL, así que se
pueden compartir y sobreviven al botón "atrás". En móvil, los filtros se
abren en un panel inferior con el botón "Ver N productos".

### US2 — Armar un pedido con varios productos (P1)

Desde cualquier tarjeta ("+") o ficha ("Agregar a mi pedido") el visitante
suma productos a una lista con cantidades y variantes. Un botón flotante
con contador abre el panel del pedido, que envía **un solo mensaje de
WhatsApp** con todos los ítems, el total referencial y (opcional) nombre y
distrito. La lista se guarda en el navegador solo como comodidad.

### US3 — Saber si un producto sirve para su casa (P1)

La ficha muestra "¿Es para mi casa?": Wi-Fi 2.4 GHz, si necesita hub y, si
el producto necesita cable neutro, una pregunta Sí / No / No sé que
sugiere alternativas sin neutro o abre WhatsApp para revisar una foto.

### US4 — Navegar por tipo, ambiente o ecosistema (P2)

Mega menú en desktop (por tipo, por ambiente, funciona con), acordeón en
móvil y home con "Compra por ambiente" (o por categoría mientras los
productos no tengan ambientes cargados), destacados, kits y "Funciona con".

## Assumptions

- Se mantiene la identidad oscura + ámbar del logo; el verde queda
  reservado al cierre por WhatsApp.
- Solo se publican afirmaciones que el sitio ya respaldaba (garantía de 2
  años, asesoría, instalación). **Pendiente del negocio**: envíos a
  provincias y medios de pago para la barra de confianza, y reseñas reales.
- Los kits son productos con categoría "Kits" (sin tabla nueva).
- Fuera de alcance: productos complementarios curados a mano (hoy se
  muestran hubs si el producto los necesita + "Más en la categoría"),
  estandarización de fotos (requiere procesar las imágenes: ver plan.md).
