import { Package } from "lucide-react";

// Marco de foto estándar del catálogo: fondo gris claro uniforme, producto
// centrado y contenido (nunca recortado). `mix-blend-multiply` funde los
// fondos blancos de fotos de proveedores con el gris, así las imágenes
// que aún no están estandarizadas se ven consistentes con las que sí.
export default function ProductImage({ src, alt, className = "", imgClassName = "", padding = "p-[10%]", eager = false }) {
  return (
    <div className={`relative overflow-hidden bg-photo ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchpriority={eager ? "high" : undefined}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ${padding} ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Package size={40} strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
