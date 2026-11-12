// Contenido SEO por categoría del catálogo (specs/011-auditoria-seo).
// - intro: frase bajo el H1 (≤ 35 palabras), antes del listado.
// - metaDescription: ≤ 155 caracteres.
// - guide: párrafos que se muestran DEBAJO de la grilla ("Guía: …"),
//   150–300 palabras en total. Solo categorías con productos.
// - services: 1–3 servicios de instalación relacionados (ids/slugs reales de
//   la tabla `services`; se enlazan con serviceUrl de serviceLinks.js).
// Regla: nada de cifras, certificaciones, garantías ni precios inventados.
import { BUSINESS } from "./business.js";

const S = {
  interruptor: { id: 1, slug: "interruptor-de-pared-wifi-1-canal", label: "Instalación de interruptor de pared Wi-Fi" },
  multiBoton: { id: 2, slug: "interruptor-multi-boton-2-3-canales", label: "Instalación de interruptor de 2 o 3 botones" },
  enchufe: { id: 3, slug: "enchufe-inteligente-wifi-zigbee", label: "Instalación de enchufe inteligente" },
  sensor: { id: 4, slug: "sensor-movimiento-puerta-ventana-fuga-de-agua", label: "Instalación de sensores" },
  camara: { id: 5, slug: "camara-de-seguridad-wifi", label: "Instalación de cámara de seguridad Wi-Fi" },
  cerradura: { id: 6, slug: "cerradura-inteligente", label: "Instalación de cerradura inteligente" },
  cortina: { id: 7, slug: "cortina-persiana-motorizada", label: "Instalación de cortina o persiana motorizada" },
  hub: { id: 8, slug: "hub-zigbee-matter-bridge", label: "Instalación de hub Zigbee / Matter" },
  app: { id: 17, slug: "configuracion-de-app-integracion-alexa-google-home", label: "Configuración de app e integración con Alexa y Google Home" },
  escenas: { id: 18, slug: "programacion-de-escenas-y-automatizaciones-personalizadas", label: "Programación de escenas y automatizaciones" },
};

const warranty = `${BUSINESS.warranty.years} años de garantía`;

export const CATEGORY_CONTENT = {
  Interruptores: {
    intro:
      "Mini interruptores Wi-Fi y Zigbee que se instalan detrás de tu interruptor de siempre para controlar las luces desde el celular o con la voz.",
    metaDescription:
      "Interruptores inteligentes Wi-Fi y Zigbee, con y sin neutro, compatibles con Alexa y Google Home. Instalación en Lima y asesoría por WhatsApp.",
    guide: [
      "Un mini interruptor inteligente es un módulo pequeño que va dentro de la caja de pared, detrás del interruptor que ya tienes. No cambias la estética de tu casa: sigues prendiendo la luz con el mismo botón y, además, la controlas desde la app, con horarios o con la voz.",
      "Los modelos Wi-Fi se conectan directo a tu router en la banda de 2.4 GHz y se manejan con apps como Tuya Smart, Smart Life o eWeLink, según el producto. Los modelos Zigbee consumen menos red y responden más rápido cuando tienes muchos equipos, pero necesitan un hub Zigbee, que también encuentras en esta categoría. Ambos funcionan con Alexa y Google Home.",
      "Antes de elegir, revisa si en la caja de tu interruptor llega cable neutro. Muchas casas en Lima solo tienen fase y retorno; para esos casos hay versiones sin neutro. Usa el filtro \"Funciona sin neutro\" o pregúntanos por WhatsApp con una foto de tu caja.",
      "También hay interruptores para escaleras y pasillos con dos puntos de encendido, un disyuntor inteligente para cortar un circuito completo y un control remoto IR/RF para manejar equipos con mando, como el aire acondicionado o la TV.",
      `Se usan en sala, dormitorios, cocina, pasillos y exteriores. Si prefieres no tocar cables, el equipo de Falcons hace la instalación en Lima y deja todo configurado en tu app. Los productos tienen ${warranty}.`,
    ],
    services: [S.interruptor, S.hub, S.app],
  },
  "Pared Táctil": {
    intro:
      "Interruptores táctiles de vidrio de 1 a 3 botones y paneles de escenas que reemplazan tus interruptores de pared con un acabado moderno.",
    metaDescription:
      "Interruptores táctiles de vidrio de 1 a 3 botones y control de escenas, compatibles con Alexa y Google Home. Instalación en Lima por Falcons.",
    guide: [
      "Los interruptores de pared táctiles reemplazan por completo a tu interruptor tradicional. Tienen frente de vidrio y se activan con un toque, así que además de modernizar la pared, convierten cada punto de luz en un dispositivo inteligente.",
      "Elige el número de botones según los circuitos que controla hoy ese punto: uno, dos o tres. Cada botón maneja una luz por separado desde la pared, desde la app o con la voz. El control de escenas de 6 botones no enciende una luz en particular: ejecuta escenas, como \"Llegué a casa\", \"Película\" o \"Apagar todo\", que activan varios equipos a la vez.",
      "Se configuran con apps como Tuya Smart o Smart Life y funcionan con Alexa y Google Home. Los modelos Wi-Fi requieren señal de 2.4 GHz en el lugar de instalación; si son Zigbee, necesitas un hub. Revisa en la ficha de cada producto si necesita cable neutro en la caja de pared.",
      "Son ideales en la entrada, la sala, el dormitorio principal y la cocina, donde se usan varias luces a diario. Como se cambia la pieza completa, conviene que la instalación la haga un técnico: en Falcons instalamos en Lima, ordenamos los circuitos y programamos tus escenas para que funcionen desde el primer día.",
    ],
    services: [S.multiBoton, S.interruptor, S.escenas],
  },
  Sensores: {
    intro:
      "Sensores de presencia y de puerta que detectan lo que pasa en tu casa, te envían avisos al celular y activan automatizaciones.",
    metaDescription:
      "Sensores inteligentes de presencia y de puerta compatibles con Alexa y Google Home. Avisos al celular y automatizaciones. Instalación en Lima.",
    guide: [
      "Los sensores son los ojos de una casa inteligente. Detectan un cambio, como alguien que entra a un ambiente o una puerta que se abre, y lo convierten en una acción: una notificación en tu celular, una luz que se prende o una alarma que suena.",
      "El sensor de radar de presencia detecta a las personas aunque estén quietas, algo que un sensor de movimiento común no logra. Por eso sirve para encender y mantener la luz en baños, oficinas, pasillos o el walk-in mientras haya alguien, y apagarla cuando el ambiente queda vacío.",
      "El sensor de puerta se pega en el marco y la hoja de una puerta o ventana. Te avisa cuando se abre y te permite crear reglas como \"si se abre la puerta principal de noche, prende la luz de la entrada\". No necesita cables y se instala en minutos.",
      "Se configuran con apps como Tuya Smart o Smart Life y se integran con Alexa y Google Home para crear rutinas. Los modelos Wi-Fi necesitan red de 2.4 GHz; los Zigbee, un hub. La ficha de cada producto indica su conexión.",
      "Si quieres sacarles el máximo provecho, en Falcons los instalamos en Lima y programamos las automatizaciones que necesitas, para que los sensores trabajen junto con tus interruptores y luces.",
    ],
    services: [S.sensor, S.escenas, S.hub],
  },
  Accesorios: {
    intro:
      "Enchufes inteligentes, motores de cortina y componentes para completar tu instalación de domótica y automatizar más equipos de tu casa.",
    metaDescription:
      "Enchufes inteligentes, motores de cortina y accesorios de domótica compatibles con Alexa y Google Home. Asesoría e instalación en Lima.",
    guide: [
      "En accesorios encuentras piezas que amplían lo que puedes automatizar en casa sin cambiar tus instalaciones principales.",
      "El enchufe inteligente de 10A se conecta a un tomacorriente común y convierte en inteligente lo que enchufes en él: una lámpara de pie, un ventilador o la cafetera. Lo prendes y apagas desde la app o con la voz, y puedes programar horarios para que se apague solo. Antes de usarlo, revisa que la potencia de tu equipo esté dentro de lo que soporta el enchufe.",
      "El motor de cortinas automatiza cortinas y persianas para abrirlas o cerrarlas desde el celular, con un horario o con Alexa y Google Home. Es útil en dormitorios, salas con ventanales y oficinas. Su instalación requiere ajustar el riel y el recorrido, por eso conviene que lo instale un técnico.",
      "El condensador es un componente de instalación: algunos interruptores inteligentes lo necesitan cuando controlan focos LED de baja potencia, para evitar parpadeos o que la luz quede encendida tenue. Si tu interruptor sin neutro presenta ese problema, probablemente lo necesites.",
      "Estos accesorios se manejan con apps como Tuya Smart, Smart Life o eWeLink, según el modelo, y requieren Wi-Fi de 2.4 GHz. Si tienes dudas sobre cuál te conviene, escríbenos por WhatsApp. En Falcons hacemos la instalación en Lima y la configuración en tu app.",
    ],
    services: [S.enchufe, S.cortina, S.app],
  },

  // Categorías aún sin productos: solo entrada breve y servicio relacionado.
  Enchufes: {
    intro: "Enchufes inteligentes para controlar tus equipos desde el celular o con la voz. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.enchufe],
  },
  Iluminación: {
    intro: "Iluminación inteligente para controlar tus luces desde el celular o con la voz. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.interruptor, S.escenas],
  },
  Cerraduras: {
    intro: "Cerraduras inteligentes para abrir tu puerta sin llaves. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.cerradura],
  },
  Cámaras: {
    intro: "Cámaras de seguridad Wi-Fi para ver tu casa desde el celular. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.camara],
  },
  Cortinas: {
    intro: "Cortinas y persianas motorizadas que abres y cierras desde el celular o con la voz. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.cortina],
  },
  "Control IR": {
    intro: "Controles infrarrojos para manejar tu TV y aire acondicionado desde el celular. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.app],
  },
  Hubs: {
    intro: "Hubs Zigbee y Matter para conectar y centralizar tus dispositivos inteligentes. Escríbenos por WhatsApp si buscas un modelo en particular.",
    services: [S.hub],
  },
  Kits: {
    intro: "Kits de domótica para empezar a automatizar tu casa. Escríbenos por WhatsApp si buscas un kit en particular.",
    services: [S.escenas],
  },
};

// Texto general de /productos (sin categoría).
export const CATALOG_CONTENT = {
  intro:
    "Interruptores, paneles táctiles, sensores y accesorios inteligentes compatibles con Alexa y Google Home, con precios en soles e instalación en Lima.",
  metaDescription:
    "Catálogo de domótica en Lima: interruptores, paneles táctiles, sensores y accesorios compatibles con Alexa y Google Home. Instalación por Falcons.",
  guide:
    "Todos los productos funcionan con apps como Tuya Smart, Smart Life o eWeLink y se integran con Alexa y Google Home. Si no sabes por dónde empezar, revisa cada categoría o escríbenos por WhatsApp: te ayudamos a elegir y hacemos la instalación en Lima.",
  services: [S.app, S.escenas],
};

export const categoryContent = (category) => (category ? CATEGORY_CONTENT[category] ?? null : CATALOG_CONTENT);
