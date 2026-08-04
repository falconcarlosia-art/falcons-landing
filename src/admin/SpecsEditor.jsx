export default function SpecsEditor({ value, onChange }) {
  const specs = value || [];

  const updateRow = (index, field, newValue) => {
    const next = specs.map((row, i) => (i === index ? { ...row, [field]: newValue } : row));
    onChange(next);
  };

  const addRow = () => {
    onChange([...specs, { label: "", value: "" }]);
  };

  const removeRow = (index) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const moveRow = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= specs.length) return;
    const next = [...specs];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-lg px-3 py-2 text-white text-sm";

  return (
    <div className="space-y-2">
      {specs.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            placeholder="Ej: Voltaje"
            value={row.label}
            onChange={(e) => updateRow(i, "label", e.target.value)}
            className={`${inputCls} w-1/3`}
          />
          <input
            placeholder="Ej: 100-240V"
            value={row.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            className={`${inputCls} flex-1`}
          />
          <button type="button" onClick={() => moveRow(i, -1)} className="text-slate-400 hover:text-white text-xs px-1">
            ▲
          </button>
          <button type="button" onClick={() => moveRow(i, 1)} className="text-slate-400 hover:text-white text-xs px-1">
            ▼
          </button>
          <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-300 text-xs px-1">
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
      >
        + Agregar especificación
      </button>
    </div>
  );
}
