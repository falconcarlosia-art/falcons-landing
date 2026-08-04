import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Lightbox from "./Lightbox";

export default function ProductCarousel({ images, icon: IconComponent, iconBg, title }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const hasImages = images && images.length > 0;

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  if (!hasImages) {
    return (
      <div className="relative w-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
          <IconComponent size={28} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative aspect-square overflow-hidden bg-slate-800 select-none">
        {/* Todas las imágenes apiladas — solo cambia opacidad, sin flash */}
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${title} — foto ${i + 1} de ${images.length}`}
            onClick={() => i === idx && setLightbox(true)}
            style={{ willChange: "opacity", backfaceVisibility: "hidden" }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              i === idx ? "opacity-100 cursor-zoom-in" : "opacity-0 pointer-events-none"
            }`}
          />
        ))}

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950/90 flex items-center justify-center text-white transition-all">
              <ChevronRight size={14} className="rotate-180" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950/90 flex items-center justify-center text-white transition-all">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-3" : "bg-white/40 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && <Lightbox images={images} startIdx={idx} onClose={() => setLightbox(false)} title={title} />}
    </>
  );
}
