import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { trackEvent } from "../lib/analytics";

// Genera el catálogo PDF al vuelo con los productos actuales de Supabase.
export default function DownloadCatalogButton({ className = "" }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const download = async () => {
    if (status) return;
    setError(null);
    setStatus("Preparando…");
    try {
      const { buildCatalogPdf, saveBlob, catalogFilename } = await import("../catalog-pdf/generate.js");
      const blob = await buildCatalogPdf({ onStatus: setStatus });
      saveBlob(blob, catalogFilename());
      trackEvent("catalog_download");
    } catch (err) {
      console.error(err);
      setError("No se pudo generar el catálogo. Inténtalo de nuevo.");
    } finally {
      setStatus(null);
    }
  };

  return (
    <div className={`flex flex-col items-start sm:items-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={download}
        disabled={Boolean(status)}
        className="h-10 px-4 inline-flex items-center gap-2 rounded-xl border border-line hover:border-brand/60 hover:bg-surface text-sm font-medium text-ink disabled:opacity-70 transition-colors"
      >
        {status ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} className="text-brand" />}
        {status ?? "Descargar catálogo PDF"}
      </button>
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
