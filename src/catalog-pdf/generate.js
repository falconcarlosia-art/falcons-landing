// Catálogo PDF generado en el navegador a partir de Supabase, en el momento
// de la descarga: cada producto nuevo sale en el siguiente PDF sin hacer
// nada. Todo se carga bajo demanda para no pesar en la tienda.
import { supabase } from "../lib/supabaseClient";
import { CATEGORIES, PRODUCT_SELECT, normalizeProduct, productUrl, sortProducts } from "../lib/catalog";
import { isCutout } from "../lib/images";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { paginate } from "./layout";

const SITE_URL = "https://falcem.com";
const WA_ADVICE_URL = buildWhatsAppLink("Hola Falcons, vi su catálogo y quiero asesoría para elegir productos.");

// Portada: un producto protagonista (destacado y recortado si hay) y dos
// de apoyo, de categorías distintas para mostrar variedad.
function pickCover(products) {
  const withImg = products.filter((p) => p.image);
  const hero =
    withImg.find((p) => p.featured && p.cutout) ?? withImg.find((p) => p.cutout) ?? withImg.find((p) => p.featured) ?? withImg[0];
  const rest = withImg.filter((p) => p !== hero);
  const side = [];
  const seen = new Set([hero?.category]);
  for (const p of [...rest].sort((a, b) => Number(b.cutout) - Number(a.cutout) || Number(b.featured) - Number(a.featured))) {
    if (side.length < 2 && !seen.has(p.category)) {
      side.push(p);
      seen.add(p.category);
    }
  }
  for (const p of rest) if (side.length < 2 && !side.includes(p)) side.push(p);
  return { hero, side };
}

// react-pdf solo acepta JPG/PNG: cada imagen pasa por un canvas, que además
// la reduce para que el PDF no pese decenas de MB.
function loadImage(src, maxSide = 560) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        const transparent = isCutout(src) || src.startsWith("/");
        if (!transparent) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(transparent ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

export async function fetchCatalogProducts() {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("id");
  if (error) throw new Error(error.message);
  return data.map(normalizeProduct).filter((p) => p.active !== false);
}

/**
 * options: { clientName?, categories?: string[], showPrices = true, onStatus? }
 * Devuelve el Blob del PDF.
 */
export async function buildCatalogPdf({ clientName = "", categories, showPrices = true, onStatus } = {}) {
  onStatus?.("Leyendo productos…");
  const [{ pdf, Font }, QRCode, { default: CatalogDocument, registerFonts }, all] = await Promise.all([
    import("@react-pdf/renderer"),
    import("qrcode"),
    import("./CatalogDocument.jsx"),
    fetchCatalogProducts(),
  ]);
  registerFonts(Font);

  const wanted = categories?.length ? new Set(categories) : null;
  const products = sortProducts(all.filter((p) => !wanted || wanted.has(p.category)));
  if (products.length === 0) throw new Error("No hay productos en las categorías elegidas.");

  onStatus?.("Preparando fotos…");
  const prepared = await mapLimit(products, 6, async (p) => {
    const url = `${SITE_URL}${productUrl(p)}`;
    const [image, qr] = await Promise.all([
      loadImage(p.images[0]),
      QRCode.toDataURL(url, { margin: 0, width: 180, color: { dark: "#141821", light: "#ffffff" } }),
    ]);
    return { ...p, image, cutout: isCutout(p.images[0]), qr, url };
  });

  // Agrupa por categoría en el orden de la tienda; la paginación sigue.
  const order = [...CATEGORIES, ...new Set(prepared.map((p) => p.category))];
  const { pages, groups } = paginate(
    [...new Set(order)]
      .map((name) => ({ name, items: prepared.filter((p) => p.category === name) }))
      .filter((g) => g.items.length)
  );

  const cover = pickCover(prepared);
  const prices = prepared.map((p) => Number(p.price)).filter((n) => n > 0);
  const [logo, siteQr, waQr] = await Promise.all([
    loadImage("/logo-falcons.png", 200),
    QRCode.toDataURL(`${SITE_URL}/productos`, { margin: 0, width: 240, color: { dark: "#1A1204", light: "#F59E0B" } }),
    QRCode.toDataURL(WA_ADVICE_URL, { margin: 0, width: 200, color: { dark: "#F1F5F9", light: "#131A26" } }),
  ]);

  onStatus?.("Armando el PDF…");
  const doc = CatalogDocument({
    groups,
    pages,
    total: prepared.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    cover,
    logo,
    siteQr,
    waQr,
    waUrl: WA_ADVICE_URL,
    clientName: clientName.trim(),
    showPrices,
    date: new Date(),
  });
  return pdf(doc).toBlob();
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function catalogFilename(clientName) {
  const d = new Date().toISOString().slice(0, 10);
  const slug = clientName
    ? "-" + clientName.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : "";
  return `catalogo-falcons${slug}-${d}.pdf`;
}
