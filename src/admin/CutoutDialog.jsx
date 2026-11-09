import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CUTOUT_FOLDER } from "../lib/images";
import { removeBackground } from "./cutout";

// Recorta el fondo de `src`, muestra el resultado sobre el mismo fondo
// "vitrina" de la tienda y, si se acepta, lo sube a Storage y devuelve la URL.
export default function CutoutDialog({ src, onAccept, onClose }) {
  const [stage, setStage] = useState("modelo");
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null); // { blob, url }
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [bg, setBg] = useState("vitrina");
  const resultUrl = useRef(null);

  useEffect(() => {
    let cancelled = false;
    removeBackground(src, (s, p) => {
      if (cancelled) return;
      setStage(s);
      setProgress(p);
    })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        resultUrl.current = url;
        setResult({ blob, url });
        setStage("listo");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || String(err));
      });
    return () => {
      cancelled = true;
      if (resultUrl.current) URL.revokeObjectURL(resultUrl.current);
    };
  }, [src]);

  const accept = async () => {
    setSaving(true);
    setError(null);
    const ext = result.blob.type === "image/webp" ? "webp" : "png";
    const path = `${CUTOUT_FOLDER}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, result.blob, { contentType: result.blob.type, cacheControl: "31536000" });
    if (uploadError) {
      setError(uploadError.message);
      setSaving(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    onAccept(data.publicUrl);
  };

  const stageText =
    stage === "modelo"
      ? progress === null
        ? "Preparando el recortador…"
        : `Descargando el modelo de recorte (solo la primera vez): ${Math.round(progress * 100)}%`
      : stage === "procesando"
        ? "Quitando el fondo…"
        : null;

  const previewBg =
    bg === "vitrina"
      ? "vitrina"
      : "bg-[length:20px_20px] bg-[conic-gradient(#334155_0_25%,#1e293b_0_50%,#334155_0_75%,#1e293b_0)]";

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cutout-title"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 id="cutout-title" className="text-white font-semibold">Recortar portada</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            Cerrar
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <figure className="space-y-2">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img src={src} alt="Original" crossOrigin="anonymous" className="max-w-full max-h-full object-contain" />
            </div>
            <figcaption className="text-xs text-slate-500">Original</figcaption>
          </figure>

          <figure className="space-y-2">
            <div className={`relative aspect-square rounded-xl overflow-hidden flex items-center justify-center ${previewBg}`}>
              {result ? (
                <img src={result.url} alt="Recortada" className="relative z-[1] max-w-full max-h-full object-contain p-[10%]" />
              ) : (
                <div className="px-6 text-center space-y-3">
                  {!error && <div className="mx-auto h-8 w-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />}
                  <p className="text-sm text-slate-300">{error ? "No se pudo recortar." : stageText}</p>
                  {stage === "modelo" && progress !== null && (
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 transition-[width]" style={{ width: `${progress * 100}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <figcaption className="flex items-center justify-between text-xs text-slate-500">
              <span>Así se verá en la tienda</span>
              {result && (
                <button
                  type="button"
                  onClick={() => setBg(bg === "vitrina" ? "cuadros" : "vitrina")}
                  className="text-amber-400 hover:text-amber-300"
                >
                  {bg === "vitrina" ? "Ver transparencia" : "Ver en la tienda"}
                </button>
              )}
            </figcaption>
          </figure>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <p className="text-xs text-slate-500">
          La recortada queda como primera imagen (portada) y la original se mantiene en la galería; luego presiona
          Guardar. Revisa bordes finos
          como cables o antenas; si el recorte falla, usa otra foto con el producto más visible.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={accept}
            disabled={!result || saving}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm"
          >
            {saving ? "Subiendo…" : "Usar como portada"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
