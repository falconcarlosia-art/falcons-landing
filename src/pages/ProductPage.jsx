import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import {
  MessageCircle,
  ChevronRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Wrench,
  Wifi,
  Router,
  Cable,
  CircleHelp,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import { buildProductMessage, buildWhatsAppLink } from "../lib/whatsapp";
import { usePrerenderData } from "../lib/PrerenderContext";
import { useOrder } from "../lib/order";
import {
  ECOSYSTEMS,
  PRODUCT_SELECT,
  PROTOCOLS,
  categoryUrl,
  formatPrice,
  labelOf,
  normalizeProduct,
  toListItem,
} from "../lib/catalog";
import { productBrand, productSku } from "../lib/seo";
import { useCanonicalSlug } from "../lib/useCanonicalSlug";
import SiteShell from "../components/SiteShell";
import ProductGallery from "../components/ProductGallery";
import ProductCard from "../components/ProductCard";

const SITE_URL = "https://falcem.com";

// ─── "¿Es para mi casa?" ─────────────────────────────────────────────────────
// Resuelve antes de comprar las dudas que más devoluciones generan: cable
// neutro, hub y red Wi-Fi.
function CompatibilityCheck({ product }) {
  const [neutral, setNeutral] = useState(null); // "si" | "no" | "nose"
  const rows = [];

  if (product.protocol === "wifi") {
    rows.push({ icon: Wifi, ok: true, text: "Se conecta a tu Wi-Fi de 2.4 GHz" });
  }
  rows.push(
    product.needs_hub
      ? { icon: Router, ok: false, text: "Necesita un hub (puente) para funcionar", link: categoryUrl("Hubs"), linkText: "Ver hubs" }
      : { icon: Router, ok: true, text: "No necesita hub" }
  );
  if (product.needs_neutral === false) {
    rows.push({ icon: Cable, ok: true, text: "Funciona sin cable neutro" });
  }

  const btn = (value, label) => (
    <button
      type="button"
      onClick={() => setNeutral(value)}
      aria-pressed={neutral === value}
      className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
        neutral === value ? "bg-brand/15 border-brand text-brand" : "border-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink mb-3">¿Es para mi casa?</h2>
      <ul className="space-y-2.5">
        {rows.map(({ icon: Icon, ok, text, link, linkText }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                ok ? "bg-wa/15 text-wa-hover" : "bg-brand/15 text-brand"
              }`}
            >
              <Icon size={14} />
            </span>
            <span className="text-muted">{text}</span>
            {link && (
              <Link to={link} className="ml-auto text-xs font-semibold text-brand hover:text-brand-hover whitespace-nowrap">
                {linkText}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {product.needs_neutral === true && (
        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-sm text-ink mb-2.5">Este modelo necesita cable neutro. ¿Tu caja de interruptor lo tiene?</p>
          <div className="flex gap-2">
            {btn("si", "Sí")}
            {btn("no", "No")}
            {btn("nose", "No sé")}
          </div>
          {neutral === "si" && (
            <p className="mt-3 flex items-center gap-2 text-sm text-wa-hover">
              <Check size={16} /> Es compatible con tu instalación.
            </p>
          )}
          {neutral === "no" && (
            <div className="mt-3 text-sm text-muted flex gap-2">
              <AlertTriangle size={16} className="text-brand shrink-0 mt-0.5" />
              <p>
                Sin neutro este modelo no funcionará.{" "}
                <Link
                  to={`${categoryUrl(product.category)}?neutro=sin`}
                  className="font-semibold text-brand hover:text-brand-hover"
                >
                  Ver opciones sin neutro
                </Link>
              </p>
            </div>
          )}
          {neutral === "nose" && (
            <div className="mt-3 text-sm text-muted flex gap-2">
              <CircleHelp size={16} className="text-brand shrink-0 mt-0.5" />
              <p>
                Envíanos una foto de tu caja abierta y te decimos en minutos.{" "}
                <a
                  href={buildWhatsAppLink(`Hola, quiero saber si mi caja tiene neutro para el producto: ${product.title}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-wa-hover hover:text-green-300"
                >
                  Consultar por WhatsApp
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center h-12 rounded-xl border border-line shrink-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-11 h-full flex items-center justify-center text-muted hover:text-ink"
        aria-label="Menos"
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center font-medium tabular" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-11 h-full flex items-center justify-center text-muted hover:text-ink"
        aria-label="Más"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function RelatedRow({ title, products }) {
  if (!products?.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-lg font-semibold text-ink mb-5">{title}</h2>
      <ul className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
        {products.slice(0, 4).map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProductPage() {
  const { id, slug: urlSlug } = useParams();
  const seed = usePrerenderData();
  const seedMatches = seed?.product && String(seed.product.id) === id;

  const [product, setProduct] = useState(seedMatches ? normalizeProduct(seed.product) : undefined);
  const [related, setRelated] = useState(seedMatches ? seed.related ?? [] : []);
  const [hubs, setHubs] = useState(seedMatches ? seed.hubs ?? [] : []);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState({});
  const [added, setAdded] = useState(false);
  const addedTimer = useRef();
  const { add } = useOrder();

  useEffect(() => {
    let cancelled = false;
    if (!seedMatches) setProduct(undefined);
    setQty(1);

    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .single()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        // Solo "no existe" (PGRST116: 0 filas) muestra "no disponible"; un
        // fallo de red conserva el producto que ya vino en el HTML.
        if (error && error.code !== "PGRST116") {
          if (!seedMatches) setProduct(null);
          return;
        }
        const p = data ? normalizeProduct(data) : null;
        setProduct(p);
        if (!p) return;

        const [{ data: sameCategory }, { data: hubRows }] = await Promise.all([
          supabase.from("products").select(PRODUCT_SELECT).eq("category", p.category).neq("id", p.id).order("id").limit(8),
          p.needs_hub
            ? supabase.from("products").select(PRODUCT_SELECT).eq("category", "Hubs").limit(4)
            : Promise.resolve({ data: [] }),
        ]);
        if (cancelled) return;
        setRelated((sameCategory ?? []).map((r) => normalizeProduct(toListItem(r))));
        setHubs((hubRows ?? []).map((r) => normalizeProduct(toListItem(r))));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Variantes: la primera opción de cada grupo queda preseleccionada
  useEffect(() => {
    if (!product) return;
    setVariant(Object.fromEntries(product.variants.map((v) => [v.label, v.options[0]])));
  }, [product]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);
  useCanonicalSlug(product, "/producto", urlSlug);

  if (product === undefined) {
    return (
      <SiteShell>
        <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 animate-pulse">
          <div className="lg:col-span-7 aspect-square rounded-card bg-surface" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-4 w-24 bg-surface rounded" />
            <div className="h-8 w-3/4 bg-surface rounded" />
            <div className="h-10 w-32 bg-surface rounded" />
          </div>
        </div>
      </SiteShell>
    );
  }

  if (product === null) {
    return (
      <SiteShell>
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-ink mb-3">Producto no disponible</h1>
          <p className="text-muted mb-8">Este producto ya no está disponible o el enlace es incorrecto.</p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink font-semibold text-sm"
          >
            Ver catálogo completo
            <ChevronRight size={16} />
          </Link>
        </div>
      </SiteShell>
    );
  }

  const pageTitle = `${product.title} — Falcons Domótica`;
  const pageDescription = product.desc;
  const slug = slugify(product.title);
  const canonicalUrl = `${SITE_URL}/producto/${product.id}/${slug}`;
  const image = product.images[0];
  const ecosystems = product.ecosystems.map((e) => labelOf(ECOSYSTEMS, e));
  const brand = productBrand(product);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.desc,
      image: product.images,
      sku: productSku(product),
      category: product.category,
      brand: brand ? { "@type": "Brand", name: brand } : undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "PEN",
        price: product.price,
        availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: canonicalUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: product.category, item: `${SITE_URL}${categoryUrl(product.category)}` },
        { "@type": "ListItem", position: 3, name: product.title, item: canonicalUrl },
      ],
    },
  ];

  const handleAdd = () => {
    add(product, qty, variant);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  };

  const waHref = buildWhatsAppLink(buildProductMessage(product, qty, variant));

  // Función (no componente) para no remontar el botón en cada render
  const addButton = (className = "") => (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.in_stock}
      className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        added ? "bg-wa text-white" : "bg-brand hover:bg-brand-hover text-brand-ink"
      } ${className}`}
    >
      {added ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
      {!product.in_stock ? "Agotado" : added ? "Agregado" : "Agregar a mi pedido"}
    </button>
  );

  return (
    <SiteShell hasBottomBar>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {image && <meta property="og:image" content={image} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="pt-20 lg:pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-5 min-w-0">
          <Link to="/" className="hover:text-ink shrink-0">Inicio</Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link to={categoryUrl(product.category)} className="hover:text-ink shrink-0">{product.category}</Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="text-muted truncate">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <Link
                  to={categoryUrl(product.category)}
                  className="text-xs font-semibold uppercase tracking-wider text-brand hover:text-brand-hover"
                >
                  {product.category}
                </Link>
                <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight mt-2">{product.title}</h1>
                {product.model && <p className="text-sm font-mono text-subtle mt-1.5">Modelo {product.model}</p>}

                <div className="flex items-center gap-3 mt-4">
                  <p className="text-3xl font-semibold text-ink tabular">{formatPrice(product.price)}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${product.in_stock ? "text-wa-hover" : "text-muted"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock ? "bg-wa-hover" : "bg-subtle"}`} />
                    {product.in_stock ? "Disponible" : "Agotado"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="px-2 py-1 rounded-md text-xs font-mono text-ink bg-surface-2">
                    {labelOf(PROTOCOLS, product.protocol)}
                  </span>
                  {ecosystems.map((e) => (
                    <span key={e} className="px-2 py-1 rounded-md text-xs font-mono text-ink bg-surface-2">{e}</span>
                  ))}
                  {product.app && (
                    <span className="px-2 py-1 rounded-md text-xs font-mono text-ink bg-surface-2">App {product.app}</span>
                  )}
                </div>
              </div>

              <p className="text-muted leading-relaxed">{product.desc}</p>

              <CompatibilityCheck product={product} />

              {product.variants.map((v) => (
                <div key={v.label}>
                  <p className="text-sm text-ink mb-2">
                    {v.label}: <span className="text-muted">{variant[v.label]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setVariant((s) => ({ ...s, [v.label]: o }))}
                        aria-pressed={variant[v.label] === o}
                        className={`min-w-[3rem] h-11 px-4 rounded-xl border text-sm font-medium transition-colors ${
                          variant[v.label] === o
                            ? "border-brand bg-brand/15 text-brand"
                            : "border-line text-muted hover:text-ink hover:border-subtle"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="hidden lg:block space-y-3">
                <div className="flex gap-3">
                  <Stepper value={qty} onChange={setQty} />
                  {addButton("flex-1")}
                </div>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 rounded-xl border border-wa/60 text-wa-hover hover:bg-wa/10 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={18} />
                  Pedir solo este por WhatsApp
                </a>
              </div>

              {/* Controles en móvil (la barra fija inferior repite la acción principal) */}
              <div className="lg:hidden flex gap-3">
                <Stepper value={qty} onChange={setQty} />
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 rounded-xl border border-wa/60 text-wa-hover font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle size={17} />
                  Pedir por WhatsApp
                </a>
              </div>

              <ul className="grid grid-cols-2 gap-3 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-brand/80 shrink-0" /> Garantía de 2 años
                </li>
                <li className="flex items-center gap-2">
                  <Wrench size={16} className="text-brand/80 shrink-0" />
                  <a href="/#servicios" className="hover:text-ink underline-offset-2 hover:underline">Instalación disponible</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {product.needs_hub && <RelatedRow title="Necesitarás también" products={hubs} />}

        {(product.specs?.length > 0 || product.extra_info) && (
          <div className="mt-16 grid lg:grid-cols-12 gap-10">
            {product.specs?.length > 0 && (
              <section className="lg:col-span-5">
                <h2 className="text-lg font-semibold text-ink mb-4">Especificaciones</h2>
                <dl className="rounded-card border border-line overflow-hidden text-sm">
                  {product.specs.map((row, i) => (
                    <div key={i} className={`grid grid-cols-[40%_1fr] ${i % 2 === 0 ? "bg-surface" : "bg-bg"}`}>
                      <dt className="px-4 py-3 text-subtle">{row.label}</dt>
                      <dd className="px-4 py-3 text-ink font-mono text-[13px]">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {product.extra_info && (
              <section className={product.specs?.length > 0 ? "lg:col-span-7" : "lg:col-span-12"}>
                <h2 className="text-lg font-semibold text-ink mb-4">Detalles</h2>
                <div
                  className="prose prose-invert prose-headings:text-ink prose-p:text-muted prose-li:text-muted prose-strong:text-ink prose-img:rounded-card max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.extra_info }}
                />
              </section>
            )}
          </div>
        )}

        <RelatedRow title={`Más en ${product.category}`} products={related} />
      </div>

      {/* Barra inferior fija en móvil: precio + acción principal al alcance del pulgar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-line px-4 pt-3 pb-safe">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-subtle truncate">{product.title}</p>
            <p className="text-lg font-semibold text-ink tabular leading-tight">{formatPrice(product.price * qty)}</p>
          </div>
          {addButton("flex-1 ml-auto max-w-[60%]")}
        </div>
      </div>
    </SiteShell>
  );
}
