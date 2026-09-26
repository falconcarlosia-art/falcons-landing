import { formatPrice } from "./catalog.js";

const WHATSAPP_NUMBER = "51926644490";
export const WHATSAPP_DISPLAY = "+51 926 644 490";

export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function variantText(variant) {
  const entries = Object.entries(variant ?? {});
  return entries.length ? entries.map(([k, v]) => `${k}: ${v}`).join(", ") : "";
}

// Un solo mensaje ordenado con todo el pedido — más fácil de responder que
// una consulta por producto.
export function buildOrderMessage(items, { name, district } = {}) {
  const lines = items.map((i) => {
    const variant = variantText(i.variant);
    return `• ${i.qty} × ${i.title}${i.model ? ` (${i.model})` : ""}${variant ? ` [${variant}]` : ""} — ${formatPrice(i.price * i.qty)}`;
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const extra = [name && `Nombre: ${name}`, district && `Distrito: ${district}`].filter(Boolean);
  return [
    "Hola Falcons, quiero hacer este pedido:",
    ...lines,
    "",
    `Total referencial: ${formatPrice(total)}`,
    ...(extra.length ? ["", ...extra] : []),
  ].join("\n");
}

export function buildProductMessage(product, qty = 1, variant) {
  const v = variantText(variant);
  return `Hola, me interesa: ${qty > 1 ? `${qty} × ` : ""}${product.title}${product.model ? ` (${product.model})` : ""}${v ? ` [${v}]` : ""} — ${formatPrice(product.price)}`;
}
