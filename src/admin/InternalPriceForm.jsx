import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const emptyPrice = {
  category: "",
  item: "",
  detail: "",
  unit: "",
  price: "",
  note: "",
};

export default function InternalPriceForm() {
  const { id } = useParams();
  const isNew = id === undefined;
  const navigate = useNavigate();

  const [price, setPrice] = useState(emptyPrice);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from("internal_prices")
      .select("category, unit")
      .then(({ data }) => {
        if (data) {
          setCategories([...new Set(data.map((r) => r.category))]);
          setUnits([...new Set(data.map((r) => r.unit))]);
        }
      });
  }, []);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("internal_prices")
      .select("id, category, item, detail, unit, price, note")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setPrice({ ...data, detail: data.detail ?? "", note: data.note ?? "" });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleChange = (field) => (e) => {
    setPrice((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      category: price.category,
      item: price.item,
      detail: price.detail || null,
      unit: price.unit,
      price: Number(price.price),
      note: price.note || null,
    };

    const { error } = isNew
      ? await supabase.from("internal_prices").insert(payload)
      : await supabase.from("internal_prices").update(payload).eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/admin/precios");
    }
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-3 text-white text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold text-white">
        {isNew ? "Nuevo ítem de tarifario" : `Editando: ${price.item}`}
      </h2>

      <p className="text-xs text-slate-500">
        Estos precios nunca se muestran en el sitio público — solo viven en
        la base de datos para que otra aplicación los consuma.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Categoría</label>
        <input
          required
          list="price-categories"
          value={price.category}
          onChange={handleChange("category")}
          placeholder="Ej: Puntos eléctricos básicos"
          className={inputCls}
        />
        <datalist id="price-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-slate-600 mt-1">
          Escribe una categoría existente o una nueva — no hay una lista fija.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Ítem</label>
        <input required value={price.item} onChange={handleChange("item")} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Detalle (opcional)</label>
        <textarea
          rows={3}
          value={price.detail}
          onChange={handleChange("detail")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Unidad</label>
          <input
            required
            list="price-units"
            value={price.unit}
            onChange={handleChange("unit")}
            placeholder="Ej: por punto, por metro, hora, fijo"
            className={inputCls}
          />
          <datalist id="price-units">
            {units.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Precio (S/)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={price.price}
            onChange={handleChange("price")}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Nota (opcional)</label>
        <textarea
          rows={2}
          value={price.note}
          onChange={handleChange("note")}
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
          onClick={() => navigate("/admin/precios")}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
