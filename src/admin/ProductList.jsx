import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (!error) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (product) => {
    await supabase.from("products").update({ active: !product.active }).eq("id", product.id);
    load();
  };

  const handleDelete = async (product) => {
    if (!confirm(`¿Eliminar "${product.title}" permanentemente? Esta acción no se puede deshacer.`)) return;
    await supabase.from("products").delete().eq("id", product.id);
    load();
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Catálogo ({products.length})</h2>
        <Link
          to="/admin/productos/nuevo"
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 && (
        <p className="text-slate-500 text-sm">Todavía no hay productos en el catálogo.</p>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              p.active ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-800/50 opacity-60"
            }`}
          >
            <img
              src={p.images?.[0]}
              alt={p.title}
              className="w-16 h-16 rounded-lg object-cover bg-slate-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{p.title}</p>
              <p className="text-slate-500 text-xs">
                {p.category} · S/. {p.price}
                {!p.active && " · Oculto"}
              </p>
            </div>
            <Link to={`/admin/productos/${p.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
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
