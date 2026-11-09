// Paginación del catálogo, calculada antes de renderizar para conocer el
// número de página de cada categoría (react-pdf no lo da por adelantado).
// Las categorías van seguidas: una categoría corta no ocupa una hoja sola,
// y el hueco que sobra al final de una hoja se llena con un aviso comercial.

export const PAGE = { width: 595.28, height: 841.89, padTop: 36, padX: 36, padBottom: 48 };
export const CONTENT_H = PAGE.height - PAGE.padTop - PAGE.padBottom;
export const HEADER_H = 38;
export const ROW_H = 206;
export const GAP = 12;
export const PROMO_MIN_H = 150;
export const FIRST_CONTENT_PAGE = 3; // 1 portada, 2 bienvenida

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/**
 * groups: [{ name, items }] → { pages: [{ blocks }], groups (con startPage) }
 * block: { type: "header", group, cont } | { type: "row", items } | { type: "promo", variant }
 */
export function paginate(groups) {
  const pages = [];
  let cur = null;
  let used = 0;

  const newPage = () => {
    cur = { blocks: [] };
    pages.push(cur);
    used = 0;
  };
  const cost = (h) => (cur.blocks.length ? GAP : 0) + h;
  const fits = (h) => cur && used + cost(h) <= CONTENT_H;
  const add = (block, h) => {
    used += cost(h);
    cur.blocks.push(block);
    cur.used = used;
  };

  for (const g of groups) {
    const rows = chunk(g.items, 2);
    const whole = HEADER_H + rows.length * (ROW_H + GAP);
    // El encabezado nunca queda solo al pie, y una categoría que entra entera
    // en una hoja nueva no se parte entre dos.
    if (!fits(HEADER_H + GAP + ROW_H) || (whole <= CONTENT_H && !fits(whole))) newPage();
    add({ type: "header", group: g, cont: false }, HEADER_H);
    g.startPage = FIRST_CONTENT_PAGE + pages.length - 1;
    for (const items of rows) {
      if (!fits(ROW_H)) {
        newPage();
        add({ type: "header", group: g, cont: true }, HEADER_H);
      }
      add({ type: "row", items }, ROW_H);
    }
  }

  let variant = 0;
  for (const p of pages) {
    if (CONTENT_H - p.used - GAP >= PROMO_MIN_H) p.blocks.push({ type: "promo", variant: variant++ });
  }
  return { pages, groups };
}
