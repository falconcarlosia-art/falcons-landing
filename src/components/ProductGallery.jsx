import { useRef, useState } from "react";
import { ChevronRight, Expand } from "lucide-react";
import ProductImage from "./ProductImage";
import Lightbox from "./Lightbox";

// Galería de la ficha: foto principal con fondo uniforme, miniaturas debajo,
// deslizar con el dedo en móvil y zoom a pantalla completa.
export default function ProductGallery({ images, title }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef(null);
  const n = images.length;
  const go = (d) => setIdx((i) => (i + d + n) % n);

  if (n === 0) {
    return <ProductImage src={null} alt={title} className="aspect-square rounded-card border border-line" />;
  }

  return (
    <div>
      <div
        className="group relative rounded-card overflow-hidden border border-line"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <button type="button" onClick={() => setZoom(true)} className="block w-full cursor-zoom-in" aria-label="Ampliar foto">
          <ProductImage
            src={images[idx]}
            alt={`${title} — foto ${idx + 1} de ${n}`}
            className="aspect-square"
            padding="p-[8%]"
            eager
          />
        </button>
        <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Expand size={16} />
        </span>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow hidden sm:flex items-center justify-center"
              aria-label="Foto anterior"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow hidden sm:flex items-center justify-center"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {images.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-slate-800" : "w-1.5 bg-slate-800/30"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="hidden sm:flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === idx}
              className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === idx ? "border-brand" : "border-transparent hover:border-line"
              }`}
            >
              <ProductImage src={src} alt="" className="w-[72px] h-[72px]" padding="p-1.5" />
            </button>
          ))}
        </div>
      )}

      {zoom && <Lightbox images={images} startIdx={idx} onClose={() => setZoom(false)} title={title} />}
    </div>
  );
}
