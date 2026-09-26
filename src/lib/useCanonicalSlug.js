import { useEffect } from "react";
import { slugify } from "./slugify";

// Si se renombra un producto/servicio, su slug cambia y la URL vieja (ya
// indexada o compartida) no tiene HTML prerenderizado: Firebase la sirve con
// el shell neutro (dist/detalle.html). Al cargar, se redirige a la URL
// vigente con location.replace — Google trata esa redirección JS como una
// redirección y consolida la señal en la URL nueva.
export function useCanonicalSlug(entity, basePath, currentSlug) {
  useEffect(() => {
    if (!entity) return;
    const slug = slugify(entity.title);
    if (slug && currentSlug !== slug) {
      window.location.replace(`${basePath}/${entity.id}/${slug}`);
    }
  }, [entity, basePath, currentSlug]);
}
