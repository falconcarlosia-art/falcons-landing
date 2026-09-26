// Única fuente de verdad para la taxonomía del catálogo: la usan el sitio
// público (filtros, mega menú, chips), el panel admin (selects/checkboxes)
// y el prerender (páginas por categoría, sitemap). Los `value` se guardan
// tal cual en Supabase — no renombrarlos sin migrar los datos.
import { slugify } from "./slugify.js";

// Se incluye `*` (y no una lista explícita) para que el sitio siga
// funcionando aunque la migración de specs/008 aún no se haya aplicado.
export const PRODUCT_SELECT = "*, desc:description";

// Los 4 primeros son los que ya existen en la base; el resto queda listo
// para crecer el catálogo. Las categorías sin productos no se muestran.
export const CATEGORIES = [
  "Interruptores",
  "Pared Táctil",
  "Sensores",
  "Accesorios",
  "Enchufes",
  "Iluminación",
  "Cerraduras",
  "Cámaras",
  "Cortinas",
  "Control IR",
  "Hubs",
  "Kits",
];

export const APPS = ["Tuya Smart", "eWeLink", "Smart Life"];

export const PROTOCOLS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "zigbee", label: "Zigbee" },
  { value: "matter", label: "Matter" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "rf", label: "RF 433 MHz" },
];

export const ECOSYSTEMS = [
  { value: "alexa", label: "Amazon Alexa" },
  { value: "google", label: "Google Home" },
  { value: "homekit", label: "Apple HomeKit" },
  { value: "smartthings", label: "SmartThings" },
];

export const ROOMS = [
  { value: "sala", label: "Sala" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "cocina", label: "Cocina" },
  { value: "bano", label: "Baño" },
  { value: "entrada", label: "Entrada y seguridad" },
  { value: "exterior", label: "Exterior y jardín" },
  { value: "oficina", label: "Oficina" },
];

export const PRICE_RANGES = [
  { value: "0-30", label: "Hasta S/ 30", min: 0, max: 30 },
  { value: "30-60", label: "S/ 30 – 60", min: 30, max: 60 },
  { value: "60-100", label: "S/ 60 – 100", min: 60, max: 100 },
  { value: "100-", label: "Más de S/ 100", min: 100, max: Infinity },
];

export const SORTS = [
  { value: "relevancia", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre A–Z" },
];

export const labelOf = (list, value) => list.find((o) => o.value === value)?.label ?? value;

// ─── Normalización ───────────────────────────────────────────────────────────
// Valores por defecto para filas anteriores a la migración de specs/008:
// todo el catálogo existente es Wi-Fi (lo que antes era un badge fijo).
export function normalizeProduct(p) {
  return {
    ...p,
    images: (p.images ?? []).filter(Boolean),
    protocol: p.protocol ?? "wifi",
    ecosystems: p.ecosystems ?? [],
    rooms: p.rooms ?? [],
    needs_neutral: p.needs_neutral ?? null,
    needs_hub: p.needs_hub ?? false,
    in_stock: p.in_stock ?? true,
    featured: p.featured ?? false,
    variants: p.variants ?? [],
  };
}

// ─── URLs ────────────────────────────────────────────────────────────────────
export const productUrl = (p) => `/producto/${p.id}/${slugify(p.title)}`;
export const categoryUrl = (category) => `/productos/${slugify(category)}`;
export const categoryFromSlug = (slug, products) =>
  [...CATEGORIES, ...products.map((p) => p.category)].find((c) => slugify(c) === slug) ?? null;

// ─── Formato ─────────────────────────────────────────────────────────────────
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? `S/ ${n}` : `S/ ${n.toFixed(2)}`;
}

// ─── Búsqueda y filtros ──────────────────────────────────────────────────────
const fold = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function matchesSearch(p, q) {
  if (!q) return true;
  const haystack = fold([p.title, p.model, p.category, p.app, p.desc].join(" "));
  return fold(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

// filters: { q, category, protocols[], ecosystems[], apps[], rooms[],
//            noNeutral, noHub, price, sort }
export function filterProducts(products, f) {
  const range = PRICE_RANGES.find((r) => r.value === f.price);
  const result = products.filter(
    (p) =>
      matchesSearch(p, f.q) &&
      (!f.category || p.category === f.category) &&
      (!f.protocols?.length || f.protocols.includes(p.protocol)) &&
      (!f.ecosystems?.length || f.ecosystems.some((e) => p.ecosystems.includes(e))) &&
      (!f.apps?.length || f.apps.includes(p.app)) &&
      (!f.rooms?.length || f.rooms.some((r) => p.rooms.includes(r))) &&
      (!f.noNeutral || p.needs_neutral === false) &&
      (!f.noHub || !p.needs_hub) &&
      (!range || (p.price >= range.min && p.price < range.max))
  );
  return sortProducts(result, f.sort);
}

export function sortProducts(products, sort = "relevancia") {
  const list = [...products];
  if (sort === "precio-asc") return list.sort((a, b) => a.price - b.price);
  if (sort === "precio-desc") return list.sort((a, b) => b.price - a.price);
  if (sort === "nombre") return list.sort((a, b) => a.title.localeCompare(b.title, "es"));
  // Destacados primero, luego disponibles, luego por antigüedad (id)
  return list.sort(
    (a, b) => b.featured - a.featured || b.in_stock - a.in_stock || a.id - b.id
  );
}

// ─── Índice para navegación (mega menú, footer) ─────────────────────────────
// Se calcula en el prerender y viaja en el JSON de cada página, para que el
// menú solo muestre categorías/ambientes con productos sin otra consulta.
export function buildNav(products) {
  const count = (fn) => {
    const map = new Map();
    for (const p of products) for (const v of fn(p)) map.set(v, (map.get(v) ?? 0) + 1);
    return map;
  };
  const byCategory = count((p) => [p.category]);
  const byRoom = count((p) => p.rooms ?? []);
  const byEco = count((p) => p.ecosystems ?? []);
  const byApp = count((p) => [p.app].filter(Boolean));

  const known = new Set(CATEGORIES);
  const categoryOrder = [...CATEGORIES, ...[...byCategory.keys()].filter((c) => !known.has(c))];

  return {
    total: products.length,
    categories: categoryOrder
      .filter((c) => byCategory.has(c))
      .map((c) => ({ name: c, slug: slugify(c), count: byCategory.get(c) })),
    rooms: ROOMS.filter((r) => byRoom.has(r.value)).map((r) => ({ ...r, count: byRoom.get(r.value) })),
    ecosystems: ECOSYSTEMS.filter((e) => byEco.has(e.value)).map((e) => ({ ...e, count: byEco.get(e.value) })),
    apps: [...byApp.keys()].map((a) => ({ value: a, label: a, count: byApp.get(a) })),
  };
}

// Versión liviana para listados: sin HTML largo ni ficha técnica.
export function toListItem({ extra_info, specs, description, created_at, updated_at, ...rest }) {
  return rest;
}
