# Plan: Auditoría SEO y conversión (falcem.com)

**Branch**: `011-auditoria-seo` · **Created**: 2026-11-12

Origen: brief externo de auditoría, verificado punto por punto contra el
sitio en vivo. Este plan ejecuta lo que NO depende de datos del dueño.

## Prompt maestro (aplicado a 4 agentes en paralelo)

> Eres un especialista senior en SEO técnico, SEO local y CRO para
> e-commerce de domótica en Lima, Perú. Trabajas sobre un sitio React +
> Vite + Tailwind prerenderizado (scripts/prerender.mjs) con datos en
> Supabase. Tu objetivo es resolver UNA parte de la auditoría, con calidad
> de producción, sin tocar archivos de otros agentes.
>
> Reglas comunes:
> 1. Datos del negocio SOLO desde `src/lib/business.js`. Un `null` es un
>    dato pendiente: se omite en la UI. Nunca inventar correo, horario,
>    RUC, años, cifras de proyectos, calificaciones ni precios de servicios.
> 2. Títulos: `pageTitle(nombre)` de `src/lib/seo.js` → "<Página> | Falcons
>    Domótica". La home no se toca.
> 3. Español de Perú, tuteo ("Escríbenos", "Agenda"). Tono directo.
> 4. Diseño: tokens de Tailwind (bg, surface, surface-2, line, ink, muted,
>    subtle, brand, wa, photo, rounded-card); páginas dentro de `<SiteShell>`;
>    metadata con react-helmet-async; datos iniciales vía usePrerenderData.
>    URLs absolutas con https://falcem.com y SIN barra final.
> 5. JSON-LD válido y con paridad 1:1 con el contenido visible.
> 6. Verificar: `npx vite build` con VITE_SUPABASE_URL=https://example.supabase.co
>    y VITE_SUPABASE_ANON_KEY=x, y render SSR sin errores de tus rutas.
> 7. Commit en tu rama, mensaje en español, sin push.
> 8. Informe final: archivos, decisiones, y datos PENDIENTES del dueño.

## Reparto (propiedad exclusiva de archivos)

| Agente | Alcance | Archivos |
|---|---|---|
| A · Conversión | Botón flotante de WhatsApp con mensaje según la página; convivencia con el botón de pedido; títulos de producto y 404; "Instalación disponible" → servicio específico | `WhatsAppFab.jsx` (nuevo), `SiteShell.jsx`, `OrderDrawer.jsx`, `ProductPage.jsx`, `NotFound.jsx` |
| B · Categorías | Intro 150–300 palabras por categoría, og:image, CollectionPage + ItemList + BreadcrumbList, enlaces a servicios | `CatalogPage.jsx`, `src/lib/categoryContent.js` (nuevo) |
| C · Servicios | Títulos descriptivos, FAQ por tipo de servicio (FAQPage), productos que usa, CTA | `ServicePage.jsx`, `src/lib/serviceFaqs.js` (nuevo) |
| D · Institucional y técnico | /nosotros, /contacto, /garantia, /politica-de-privacidad; rutas; prerender + sitemap con lastmod; footer y navbar | `src/pages/*` nuevos, `routes.jsx`, `scripts/prerender.mjs`, `Footer.jsx`, `Navbar.jsx`, `FalconsLanding.jsx` (solo extraer ContactForm), `src/components/ContactForm.jsx` (nuevo) |

Compartidos (ya en main, solo lectura): `src/lib/business.js`,
`src/lib/serviceLinks.js`, `pageTitle` en `src/lib/seo.js`.

Contrato entre agentes: `<SiteShell whatsappMessage="...">` (lo implementa
A; B, C y D lo usan). El prerender (D) pasa `products` a las páginas de
servicio; C los lee con `useProducts()`.

## Fuera de alcance (requiere datos o acción del dueño)

- GA4 y Pixel de Meta: cargar `VITE_GA_ID` (y luego el Pixel) como secretos en GitHub.
- Precios "desde" en servicios, horario, correo, RUC/razón social, exclusiones de garantía, años de experiencia.
- Migrar imágenes a almacenamiento propio (en curso en el flujo de recorte de fotos).
- Blog: requiere contenido revisado por el negocio.
