import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const emptyService = {
  category: "",
  title: "",
  description: "",
};

export default function ServiceForm() {
  const { id } = useParams();
  const isNew = id === undefined;
  const navigate = useNavigate();

  const [service, setService] = useState(emptyService);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from("services")
      .select("category")
      .then(({ data }) => {
        if (data) setCategories([...new Set(data.map((r) => r.category))]);
      });
  }, []);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("services")
      .select("id, category, title, description")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setService(data);
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleChange = (field) => (e) => {
    setService((s) => ({ ...s, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      category: service.category,
      title: service.title,
      description: service.description,
    };

    const { error } = isNew
      ? await supabase.from("services").insert(payload)
      : await supabase.from("services").update(payload).eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/admin/servicios");
    }
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-3 text-white text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold text-white">
        {isNew ? "Nuevo servicio" : `Editando: ${service.title}`}
      </h2>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Categoría</label>
        <input
          required
          list="service-categories"
          value={service.category}
          onChange={handleChange("category")}
          placeholder="Ej: Instalación a la carta"
          className={inputCls}
        />
        <datalist id="service-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-slate-600 mt-1">
          Escribe una categoría existente o una nueva — no hay una lista fija.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Título</label>
        <input required value={service.title} onChange={handleChange("title")} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Descripción (qué incluye)</label>
        <textarea
          required
          rows={4}
          value={service.description}
          onChange={handleChange("description")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/servicios")}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
