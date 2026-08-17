import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("category").order("id");
    if (!error) setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (service) => {
    await supabase.from("services").update({ active: !service.active }).eq("id", service.id);
    load();
  };

  const handleDelete = async (service) => {
    if (!confirm(`¿Eliminar "${service.title}" permanentemente? Esta acción no se puede deshacer.`)) return;
    await supabase.from("services").delete().eq("id", service.id);
    load();
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Servicios ({services.length})</h2>
        <Link
          to="/admin/servicios/nuevo"
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
        >
          + Nuevo servicio
        </Link>
      </div>

      {services.length === 0 && (
        <p className="text-slate-500 text-sm">Todavía no hay servicios cargados.</p>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              s.active ? "bg-slate-900 border-slate-800" : "bg-slate-900/40 border-slate-800/50 opacity-60"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{s.title}</p>
              <p className="text-slate-500 text-xs truncate">
                {s.category}
                {!s.active && " · Oculto"}
              </p>
            </div>
            <Link to={`/admin/servicios/${s.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
              Editar
            </Link>
            <button onClick={() => toggleActive(s)} className="text-xs text-slate-400 hover:text-white font-medium">
              {s.active ? "Ocultar" : "Reactivar"}
            </button>
            <button onClick={() => handleDelete(s)} className="text-xs text-red-400 hover:text-red-300 font-medium">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
