// Relación productos ↔ servicios de instalación (specs/011-auditoria-seo).
// Los ids/slugs son los de la tabla `services`; si un servicio se renombra,
// el slug viejo redirige (ver ServicePage), así que el link sigue funcionando.

const SERVICES = {
  interruptor: { id: 1, slug: "interruptor-de-pared-wifi-1-canal", title: "Instalación de interruptor de pared WiFi" },
  multiBoton: { id: 2, slug: "interruptor-multi-boton-2-3-canales", title: "Instalación de interruptor multi-botón" },
  enchufe: { id: 3, slug: "enchufe-inteligente-wifi-zigbee", title: "Instalación de enchufe inteligente" },
  sensor: { id: 4, slug: "sensor-movimiento-puerta-ventana-fuga-de-agua", title: "Instalación de sensores" },
  camara: { id: 5, slug: "camara-de-seguridad-wifi", title: "Instalación de cámara de seguridad" },
  cerradura: { id: 6, slug: "cerradura-inteligente", title: "Instalación de cerradura inteligente" },
  cortina: { id: 7, slug: "cortina-persiana-motorizada", title: "Instalación de cortina o persiana motorizada" },
  hub: { id: 8, slug: "hub-zigbee-matter-bridge", title: "Instalación de hub Zigbee / Matter" },
};

export const serviceUrl = (s) => `/servicios/${s.id}/${s.slug}`;

// Primero por palabras clave del producto (las categorías mezclan tipos:
// "Accesorios" tiene enchufes, motores y condensadores), luego por categoría.
const KEYWORD_RULES = [
  // Sin instalación propia: controles inalámbricos y equipos de tablero
  [/control remoto|infrarrojo|\bIR\b|mando/i, null],
  [/circuito|disyuntor|breaker|termomagn/i, null],
  [/cortina|persiana/i, SERVICES.cortina],
  [/cerradura/i, SERVICES.cerradura],
  [/c[aá]mara/i, SERVICES.camara],
  [/\bhub\b|bridge|puente|gateway/i, SERVICES.hub],
  [/enchufe|toma/i, SERVICES.enchufe],
  [/sensor|radar/i, SERVICES.sensor],
  [/\b(2|3|4|dos|tres|cuatro) ?(botones|canales|gang)|multi/i, SERVICES.multiBoton],
  [/interruptor|switch|m[oó]dulo/i, SERVICES.interruptor],
];

const CATEGORY_RULES = {
  Interruptores: SERVICES.interruptor,
  "Pared Táctil": SERVICES.multiBoton,
  Enchufes: SERVICES.enchufe,
  Sensores: SERVICES.sensor,
  Cámaras: SERVICES.camara,
  Cerraduras: SERVICES.cerradura,
  Cortinas: SERVICES.cortina,
  Hubs: SERVICES.hub,
};

// Servicio de instalación que corresponde a un producto, o null (p. ej. un
// condensador o un control remoto no tienen instalación propia).
export function installServiceFor(product) {
  if (product.protocol === "none") return null;
  const text = `${product.title ?? ""} ${product.category ?? ""}`;
  const byKeyword = KEYWORD_RULES.find(([re]) => re.test(text));
  if (byKeyword) return byKeyword[1];
  return CATEGORY_RULES[product.category] ?? null;
}

// Paquetes por ambiente → ambiente (columna `rooms` de products).
const ROOM_BY_SERVICE_ID = { 9: "dormitorio", 10: "sala", 11: "cocina", 12: "entrada" };

// Productos relacionados con un servicio (para su página). Instalación a la
// carta: los productos que se instalan con él. Paquetes por ambiente: los del
// ambiente. Casa completa: destacados. Configuración: lista vacía.
export function productsForService(service, products) {
  const available = products.filter((p) => p.in_stock !== false);
  const own = available.filter((p) => installServiceFor(p)?.id === service.id);
  if (own.length) return own;
  const room = ROOM_BY_SERVICE_ID[service.id];
  if (room) return available.filter((p) => (p.rooms ?? []).includes(room));
  if (service.category === "Casa Inteligente completa") {
    const featured = available.filter((p) => p.featured);
    return featured.length ? featured : available.slice(0, 8);
  }
  return [];
}
