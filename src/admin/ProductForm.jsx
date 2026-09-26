import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import RichTextEditor from "./RichTextEditor";
import SpecsEditor from "./SpecsEditor";
import VariantsEditor from "./VariantsEditor";
import { APPS, CATEGORIES, ECOSYSTEMS, PRODUCT_SELECT, PROTOCOLS, ROOMS, normalizeProduct } from "../lib/catalog";
import { KNOWN_BRANDS, productBrand, productSku } from "../lib/seo";
const ICONS = [
  "ToggleLeft",
  "LayoutGrid",
  "ScanFace",
  "DoorOpen",
  "Plug",
  "Thermometer",
  "Zap",
  "Shield",
  "Wifi",
  "Globe",
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const emptyProduct = {
  title: "",
  model: "",
  brand: "",
  sku: "",
  category: CATEGORIES[0],
  app: APPS[0],
  icon: ICONS[0],
  price: "",
  desc: "",
  images: [],
  extra_info: "",
  specs: [],
  protocol: "wifi",
  ecosystems: ["alexa", "google"],
  rooms: [],
  needs_neutral: null,
  needs_hub: false,
  in_stock: true,
  featured: false,
  variants: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const isNew = id === undefined;
  const navigate = useNavigate();

  const [product, setProduct] = useState(emptyProduct);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          const p = normalizeProduct(data);
          setProduct({ ...p, brand: data.brand || "", sku: data.sku || "", images: data.images || [], extra_info: data.extra_info || "", specs: data.specs || [] });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleChange = (field) => (e) => {
    setProduct((p) => ({ ...p, [field]: e.target.value }));
  };

  const toggleIn = (field, value) => {
    setProduct((p) => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter((v) => v !== value) : [...p[field], value],
    }));
  };

  const setBool = (field) => (e) => setProduct((p) => ({ ...p, [field]: e.target.checked }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" no es una imagen válida.`);
        }
        if (file.size > MAX_IMAGE_BYTES) {
          throw new Error(`"${file.name}" supera el tamaño máximo de 5MB.`);
        }
        const path = `${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      setProduct((p) => ({ ...p, images: [...p.images, ...uploadedUrls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async (index) => {
    const url = product.images[index];
    setProduct((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
    const path = url?.split("/product-images/")[1];
    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }
  };

  const moveImage = (index, direction) => {
    setProduct((p) => {
      const images = [...p.images];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= images.length) return p;
      [images[index], images[newIndex]] = [images[newIndex], images[index]];
      return { ...p, images };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isNew && product.images.length === 0) {
      setError("Agrega al menos una imagen antes de guardar.");
      return;
    }

    setSaving(true);
    const payload = {
      title: product.title,
      model: product.model,
      brand: product.brand.trim() || null,
      sku: product.sku.trim() || null,
      category: product.category,
      app: product.app,
      icon: product.icon,
      price: Number(product.price),
      description: product.desc,
      images: product.images,
      extra_info: product.extra_info || null,
      specs: product.specs.filter((row) => row.label.trim() || row.value.trim()),
      protocol: product.protocol,
      ecosystems: product.ecosystems,
      rooms: product.rooms,
      needs_neutral: product.needs_neutral,
      needs_hub: product.needs_hub,
      in_stock: product.in_stock,
      featured: product.featured,
      variants: product.variants
        .map((v) => ({ label: v.label.trim(), options: v.options.map((o) => o.trim()).filter(Boolean) }))
        .filter((v) => v.label && v.options.length > 0),
    };

    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/admin");
    }
  };

  if (loading) return <p className="text-slate-400">Cargando...</p>;

  const inputCls =
    "w-full bg-slate-800/60 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 rounded-xl px-4 py-3 text-white text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <h2 className="text-lg font-semibold text-white">
        {isNew ? "Nuevo producto" : `Editando: ${product.title}`}
      </h2>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Título</label>
        <input required value={product.title} onChange={handleChange("title")} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Modelo</label>
        <input value={product.model} onChange={handleChange("model")} className={inputCls} />
      </div>

      {/* Marca y SKU alimentan el schema Product (Google). Vacíos = se
          detectan del título/modelo; el placeholder muestra qué se usaría. */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Marca</label>
          <input
            list="brand-options"
            value={product.brand}
            onChange={handleChange("brand")}
            placeholder={`Automático: ${productBrand({ ...product, brand: "" }) ?? "sin marca"}`}
            className={inputCls}
          />
          <datalist id="brand-options">
            {[...KNOWN_BRANDS, "Falcons"].map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">SKU / código</label>
          <input
            value={product.sku}
            onChange={handleChange("sku")}
            placeholder={`Automático: ${productSku({ ...product, sku: "" }) ?? "sin SKU"}`}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Categoría</label>
          <select value={product.category} onChange={handleChange("category")} className={`${inputCls} cursor-pointer`}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">App</label>
          <select value={product.app} onChange={handleChange("app")} className={`${inputCls} cursor-pointer`}>
            {APPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Ícono</label>
          <select value={product.icon} onChange={handleChange("icon")} className={`${inputCls} cursor-pointer`}>
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Precio (S/.)</label>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={product.price}
          onChange={handleChange("price")}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Descripción</label>
        <textarea
          required
          rows={4}
          value={product.desc}
          onChange={handleChange("desc")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <fieldset className="rounded-xl border border-slate-800 p-4 space-y-4">
        <legend className="px-2 text-xs font-semibold text-slate-300">Compatibilidad y filtros de la tienda</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Conexión</label>
            <select value={product.protocol} onChange={handleChange("protocol")} className={`${inputCls} cursor-pointer`}>
              {PROTOCOLS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">¿Necesita cable neutro?</label>
            <select
              value={product.needs_neutral === null ? "" : String(product.needs_neutral)}
              onChange={(e) =>
                setProduct((p) => ({ ...p, needs_neutral: e.target.value === "" ? null : e.target.value === "true" }))
              }
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">No aplica</option>
              <option value="true">Sí, necesita neutro</option>
              <option value="false">No, funciona sin neutro</option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Funciona con</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {ECOSYSTEMS.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={product.ecosystems.includes(o.value)} onChange={() => toggleIn("ecosystems", o.value)} className="accent-amber-500" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Ambientes donde se usa</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {ROOMS.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input type="checkbox" checked={product.rooms.includes(o.value)} onChange={() => toggleIn("rooms", o.value)} className="accent-amber-500" />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={product.needs_hub} onChange={setBool("needs_hub")} className="accent-amber-500" />
            Necesita hub
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={product.in_stock} onChange={setBool("in_stock")} className="accent-amber-500" />
            Disponible (en stock)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={product.featured} onChange={setBool("featured")} className="accent-amber-500" />
            Destacado en la home
          </label>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">
            Variantes <span className="text-slate-600">(opcional — ej. Canales: 1, 2, 3)</span>
          </p>
          <VariantsEditor value={product.variants} onChange={(variants) => setProduct((p) => ({ ...p, variants }))} />
        </div>
      </fieldset>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Ficha técnica <span className="text-slate-600">(opcional)</span>
        </label>
        <SpecsEditor
          value={product.specs}
          onChange={(specs) => setProduct((p) => ({ ...p, specs }))}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Información adicional <span className="text-slate-600">(opcional)</span>
        </label>
        <RichTextEditor
          value={product.extra_info}
          onChange={(html) => setProduct((p) => ({ ...p, extra_info: html }))}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Imágenes</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {product.images.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 group">
              <img src={url} alt={`imagen ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button type="button" onClick={() => moveImage(i, -1)} className="text-white text-xs px-1">
                  ◀
                </button>
                <button type="button" onClick={() => removeImage(i)} className="text-red-400 text-xs px-1">
                  ✕
                </button>
                <button type="button" onClick={() => moveImage(i, 1)} className="text-white text-xs px-1">
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="text-sm text-slate-400"
        />
        {uploading && <p className="text-xs text-amber-400 mt-2">Subiendo imágenes...</p>}
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
          onClick={() => navigate("/admin")}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
