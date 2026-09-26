// Zonas de servicio para JSON-LD (Organization y Service). Mantener en
// línea con el copy visible del hero y la FAQ.
export const ORGANIZATION_ID = "https://falcem.com/#organization";

export const AREA_SERVED = [
  "Santiago de Surco",
  "Miraflores",
  "San Isidro",
  "La Molina",
  "Lima Metropolitana",
].map((name) => ({ "@type": "Place", name }));

// ─── Producto ────────────────────────────────────────────────────────────────
// La tabla no tiene columna de marca: se infiere del título/modelo. Declarar
// "Falcons" en un Sonoff sería un dato estructurado falso (Google puede
// ignorar o penalizar el rich result), así que sin coincidencia se omite.
const KNOWN_BRANDS = ["Sonoff", "Girier", "Tuya", "Moes", "Aqara", "Xiaomi", "Shelly", "Broadlink"];

export function productBrand(product) {
  const text = `${product.title ?? ""} ${product.model ?? ""}`;
  const known = KNOWN_BRANDS.find((b) => new RegExp(`\\b${b}\\b`, "i").test(text));
  if (known) return known;
  if (/^FLC-|falcons/i.test(product.model ?? "")) return "Falcons";
  return undefined;
}

// Algunos productos usan "modelo" como texto libre; solo se expone como SKU
// si parece un código de modelo: corto y con algún dígito ("Mini R4")
// o código propio en mayúsculas con guiones ("FLC-MOT-PER-BLA-WF"), no una
// marca/app suelta ("Tuya Smart") ni una oración.
export function productSku(product) {
  const model = (product.model ?? "").trim();
  const looksLikeCode = /\d/.test(model) || /^[A-Z0-9]+(-[A-Z0-9]+)+$/.test(model);
  if (!model || model.length > 30 || model.split(/\s+/).length > 4 || !looksLikeCode) return undefined;
  return model;
}
