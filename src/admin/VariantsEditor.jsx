// Grupos de variantes: [{ label: "Canales", options: ["1", "2", "3"] }].
// Las opciones se escriben separadas por coma; el precio es el mismo para
// todas (la variante elegida viaja en el mensaje de WhatsApp).
export default function VariantsEditor({ value, onChange }) {
  const variants = value || [];

  const update = (index, patch) => onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  const remove = (index) => onChange(variants.filter((_, i) => i !== index));
  const add = () => onChange([...variants, { label: "", options: [] }]);

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-lg px-3 py-2 text-white text-sm";

  return (
    <div className="space-y-2">
      {variants.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            placeholder="Ej: Canales"
            value={v.label}
            onChange={(e) => update(i, { label: e.target.value })}
            className={`${inputCls} w-1/3`}
          />
          <input
            placeholder="Ej: 1, 2, 3"
            value={v.options.join(", ")}
            onChange={(e) => update(i, { options: e.target.value.split(",").map((o) => o.trimStart()) })}
            className={`${inputCls} flex-1`}
          />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-300 text-xs px-1">
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
      >
        + Agregar variante
      </button>
    </div>
  );
}
