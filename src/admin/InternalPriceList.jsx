import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function InternalPriceList() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internal_prices")
      .select("*")
      .order("category")
      .order("id");
    if (!error) setPrices(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (price) => {
    await supabase.from("internal_prices").update({ active: !price.active }).eq("id", price.id);
    load();
  };

  const handleDelete = async (price) => {
    if (!confirm(`¿Eliminar "${price.item}" permanentemente? Esta acción no se puede deshacer.`)) return;
    await supabase.from("internal_prices").delete().eq("id", price.id);
    load();
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Precios internos ({prices.length})</h2>
        <Link
          to="/admin/precios/nuevo"
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
        >
          + Nuevo ítem
        </Link>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        Estos precios nunca se muestran en el sitio público — solo viven en
        la base de datos para que otra aplicación los consuma.
      </p>

      {prices.length === 0 && (
        <p className="text-slate-500 text-sm">Todavía no hay ítems de tarifario cargados.</p>
      )}

      <div className="space-y-3">
        {prices.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              p.active ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-800/50 opacity-60"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{p.item}</p>
              <p className="text-slate-500 text-xs truncate">
                {p.category} · {p.unit}
                {!p.active && " · Oculto"}
              </p>
            </div>
            <p className="text-amber-400 text-sm font-semibold whitespace-nowrap">
              S/ {Number(p.price).toFixed(2)}
            </p>
            <Link to={`/admin/precios/${p.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
              Editar
            </Link>
            <button onClick={() => toggleActive(p)} className="text-xs text-slate-400 hover:text-white font-medium">
              {p.active ? "Ocultar" : "Reactivar"}
            </button>
            <button onClick={() => handleDelete(p)} className="text-xs text-red-400 hover:text-red-300 font-medium">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
