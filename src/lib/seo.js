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
