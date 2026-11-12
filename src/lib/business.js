// Datos del negocio: ÚNICA fuente para páginas institucionales, footer y
// JSON-LD (specs/011-auditoria-seo). Solo datos confirmados. Un valor `null`
// significa "pendiente de confirmar con el dueño": las páginas deben omitirlo
// (nunca mostrar un placeholder ni inventar un valor).
export const BUSINESS = {
  name: "Falcons Domótica",
  shortName: "Falcons",
  siteUrl: "https://falcem.com",
  whatsapp: "51926644490",
  whatsappDisplay: "+51 926 644 490",
  address: {
    street: "Jr. Artemisa Mz S Lote 28F",
    district: "Santiago de Surco",
    city: "Lima",
    country: "Perú",
  },
  // Distritos destacados (hero, FAQ, JSON-LD). Se atiende toda Lima Metropolitana.
  featuredDistricts: ["Santiago de Surco", "Miraflores", "San Isidro", "La Molina"],
  serviceArea: "Lima Metropolitana",
  warranty: {
    years: 2,
    // Texto ya publicado en la FAQ del sitio.
    covers: [
      "Defectos de fabricación de los productos",
      "Fallas en la configuración realizada por nuestro equipo",
    ],
    excludes: null, // PENDIENTE: qué no cubre
    howToClaim: "Escríbenos por WhatsApp con tu número de pedido o fecha de instalación y una foto o video de la falla.",
  },
  // PENDIENTES (null = no mostrar):
  legalName: null, // razón social
  ruc: null,
  email: null,
  hours: null, // horario de atención
  foundedYear: null,
};
