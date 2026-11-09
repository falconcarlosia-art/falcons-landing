import { Package } from "lucide-react";
import { isCutout } from "../lib/images";

// Marco de foto estándar del catálogo.
// - Portada recortada (fondo transparente, ver specs/010): fondo "vitrina"
//   oscuro con foco de luz, igual que el resto del sitio.
// - Foto sin recortar: fondo gris claro uniforme; `mix-blend-multiply` funde
//   los fondos blancos de proveedores con el gris. Es el modo de transición
//   hasta que cada producto tenga su portada recortada.
export default function ProductImage({ src, alt, className = "", imgClassName = "", padding = "p-[10%]", eager = false }) {
  const cutout = isCutout(src);
  const frame = cutout ? "vitrina" : "relative bg-photo";
  const blend = cutout ? "drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]" : "mix-blend-multiply";

  return (
    <div className={`overflow-hidden ${frame} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchpriority={eager ? "high" : undefined}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-contain ${blend} transition-transform duration-500 ${padding} ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Package size={40} strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
