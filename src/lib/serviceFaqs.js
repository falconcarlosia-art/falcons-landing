// Nombre descriptivo y preguntas frecuentes de las páginas de servicio
// (specs/011-auditoria-seo). Solo hechos ya publicados en el sitio o en
// src/lib/business.js: nada de precios, duraciones, marcas ni cifras nuevas.
// Las preguntas son la ÚNICA fuente del texto visible y del JSON-LD FAQPage
// (paridad 1:1).
import { BUSINESS } from "./business.js";
import { slugify } from "./slugify.js";

// ─── Categoría ───────────────────────────────────────────────────────────────
// La categoría es texto libre en la tabla `services`; se compara por slug
// para tolerar mayúsculas, tildes o un sufijo distinto.
export function serviceKind(service) {
  const c = slugify(service?.category ?? "");
  if (c.startsWith("instalacion-a-la-carta")) return "carta";
  if (c.startsWith("paquetes")) return "ambiente";
  if (c.startsWith("casa-inteligente")) return "casa";
  if (c.startsWith("configuracion")) return "configuracion";
  return null;
}

// Inicial en minúscula salvo siglas o marcas ("WiFi", "TV").
const lowerFirst = (s) => (/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ]/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

// Nombre que dice qué es el servicio ("Básico" → "Casa inteligente completa:
// plan Básico"). Se usa en H1, <title>, og:title y JSON-LD; el título de la
// base (y por lo tanto el slug) no cambia.
export function serviceDisplayName(service) {
  const title = (service?.title ?? "").trim();
  switch (serviceKind(service)) {
    case "carta":
      return /^instalaci[oó]n\b/i.test(title) ? title : `Instalación de ${lowerFirst(title)}`;
    case "ambiente":
      return `${title}: domótica por ambiente`;
    case "casa":
      return `Casa inteligente completa: plan ${title}`;
    default:
      return title;
  }
}

// ─── Hechos del negocio ──────────────────────────────────────────────────────
const joinEs = (items) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}` : items.join("");

const DISTRICTS = joinEs(BUSINESS.featuredDistricts);
const WARRANTY_COVERS = joinEs(BUSINESS.warranty.covers.map((c) => c.charAt(0).toLowerCase() + c.slice(1)));
const YEARS = BUSINESS.warranty.years;

const FAQ_WARRANTY = {
  q: "¿Qué garantía tiene el servicio?",
  a: `La instalación tiene ${YEARS} años de garantía, que cubre ${WARRANTY_COVERS}. ${BUSINESS.warranty.howToClaim}`,
};

const FAQ_COVERAGE = {
  q: "¿En qué distritos de Lima hacen la instalación?",
  a: `Atendemos en ${DISTRICTS} y en el resto de ${BUSINESS.serviceArea}. Escríbenos por WhatsApp para confirmar la cobertura en tu distrito.`,
};

const FAQ_PROCESS = {
  q: "¿Cómo es el proceso para contratar el servicio?",
  a: "Empezamos con un diagnóstico técnico gratuito de tu espacio. En menos de 24 horas te enviamos una propuesta a medida, sin compromiso, y una vez aprobada nuestro equipo realiza la instalación y la configuración.",
};

const FAQ_VOICE = {
  q: "¿Funciona con Alexa y Google Home?",
  a: "Sí. Los dispositivos que instalamos son compatibles con Alexa y Google Home, y se controlan desde las apps Tuya Smart o eWeLink según el equipo.",
};

const FAQ_NETWORK = {
  q: "¿Qué necesito en casa para la instalación?",
  a: "Una red Wi-Fi de 2.4 GHz estable, que es la banda que usan los dispositivos Wi-Fi. Los equipos Zigbee necesitan además un hub que los conecte a tu red; en el diagnóstico técnico gratuito te decimos si tu proyecto lo requiere.",
};

const FAQ_NEUTRAL = {
  q: "¿Necesito cable neutro para un interruptor inteligente?",
  a: "Depende del modelo: algunos interruptores inteligentes necesitan cable neutro en la caja de pared y otros no. En el diagnóstico técnico gratuito revisamos tu instalación eléctrica y te recomendamos el equipo adecuado.",
};

// ─── Preguntas por tipo de servicio ──────────────────────────────────────────
const FAQS_BY_KIND = {
  carta: [FAQ_PROCESS, FAQ_NEUTRAL, FAQ_NETWORK, FAQ_WARRANTY, FAQ_COVERAGE],
  ambiente: [
    {
      q: "¿Qué dispositivos incluye el kit?",
      a: "Los equipos se definen según tu ambiente. Hacemos un diagnóstico técnico gratuito del espacio y en menos de 24 horas te enviamos una propuesta con los dispositivos y la instalación, sin compromiso.",
    },
    {
      q: "¿Puedo automatizar solo un ambiente y ampliar después?",
      a: "Sí. Puedes empezar por un ambiente e ir sumando dispositivos poco a poco: las soluciones son modulares y se adaptan a tu presupuesto y necesidades.",
    },
    FAQ_VOICE,
    FAQ_WARRANTY,
    FAQ_COVERAGE,
  ],
  casa: [
    {
      q: "¿Cómo elijo el plan adecuado para mi casa?",
      a: "Con un diagnóstico técnico gratuito: revisamos tu casa y tu instalación eléctrica, y en menos de 24 horas te enviamos una propuesta a medida, sin compromiso.",
    },
    FAQ_NETWORK,
    FAQ_VOICE,
    FAQ_WARRANTY,
    FAQ_COVERAGE,
  ],
  configuracion: [
    FAQ_VOICE,
    {
      q: "¿Qué necesito para la configuración?",
      a: "Una red Wi-Fi de 2.4 GHz estable, que es la banda que usan los dispositivos Wi-Fi. Si tienes equipos Zigbee, necesitan además un hub que los conecte a tu red.",
    },
    {
      q: "¿Cómo cotizo el servicio?",
      a: "Escríbenos por WhatsApp o agenda una visita técnica gratuita. En menos de 24 horas te enviamos una propuesta a medida, sin compromiso.",
    },
    {
      q: "¿Qué garantía tiene la configuración?",
      a: `Tiene ${YEARS} años de garantía, que cubre ${WARRANTY_COVERS}. ${BUSINESS.warranty.howToClaim}`,
    },
    FAQ_COVERAGE,
  ],
};

const FAQS_DEFAULT = [FAQ_PROCESS, FAQ_VOICE, FAQ_WARRANTY, FAQ_COVERAGE];

export function faqsForService(service) {
  return FAQS_BY_KIND[serviceKind(service)] ?? FAQS_DEFAULT;
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
