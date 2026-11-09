import { useEffect, useState } from "react";
import { buildNav } from "../lib/catalog";
import { buildCatalogPdf, catalogFilename, fetchCatalogProducts, saveBlob } from "../catalog-pdf/generate";

// Catálogo personalizado para un cliente: nombre en la portada, categorías
// elegidas y con o sin precios. Siempre usa los datos actuales.
export default function CatalogExport() {
  const [categories, setCategories] = useState(null); // [{ name, count }]
  const [selected, setSelected] = useState(new Set());
  const [clientName, setClientName] = useState("");
  const [showPrices, setShowPrices] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCatalogProducts()
      .then((products) => {
        const cats = buildNav(products).categories;
        setCategories(cats);
        setSelected(new Set(cats.map((c) => c.name)));
      })
      .catch((err) => setError(err.message));
  }, []);

  const toggle = (name) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const generate = async () => {
    setError(null);
    setStatus("Preparando…");
    try {
      const blob = await buildCatalogPdf({ clientName, categories: [...selected], showPrices, onStatus: setStatus });
      saveBlob(blob, catalogFilename(clientName.trim()));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setStatus(null);
    }
  };

  const count = categories?.filter((c) => selected.has(c.name)).reduce((n, c) => n + c.count, 0) ?? 0;
  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-3 text-white text-sm";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Catálogo PDF</h2>
        <p className="text-sm text-slate-400 mt-1">
          Se arma con los productos activos de este momento. El botón público de /productos descarga el catálogo completo
          con precios; aquí puedes prepararlo para un cliente.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label htmlFor="client" className="block text-xs font-medium text-slate-400 mb-2">
          Preparado para <span className="text-slate-600">(opcional, sale en la portada)</span>
        </label>
        <input
          id="client"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ej. Constructora Andina"
          className={inputCls}
        />
      </div>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-2 text-xs font-semibold text-slate-300">Categorías</legend>
        {!categories ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {categories.map((c) => (
              <label key={c.name} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={selected.has(c.name)} onChange={() => toggle(c.name)} className="accent-amber-500" />
                {c.name} <span className="text-slate-500">{c.count}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input type="checkbox" checked={showPrices} onChange={(e) => setShowPrices(e.target.checked)} className="accent-amber-500" />
        Mostrar precios <span className="text-slate-500">(sin precios dice "Cotiza por WhatsApp")</span>
      </label>

      <button
        type="button"
        onClick={generate}
        disabled={Boolean(status) || count === 0}
        className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
      >
        {status ?? `Descargar PDF (${count} productos)`}
      </button>
    </div>
  );
}
