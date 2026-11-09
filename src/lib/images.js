// Portadas recortadas (fondo transparente) generadas desde el panel. Se
// guardan en `product-images/cutouts/`, así el sitio las reconoce por la URL
// sin necesitar otra columna en la base.
export const CUTOUT_FOLDER = "cutouts";

export const isCutout = (url) => typeof url === "string" && url.includes(`/product-images/${CUTOUT_FOLDER}/`);
