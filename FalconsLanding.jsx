import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { supabase } from "./src/lib/supabaseClient";
import { slugify } from "./src/lib/slugify";
import { buildWhatsAppLink } from "./src/lib/whatsapp";
import { AREA_SERVED } from "./src/lib/seo";
import { usePrerenderData } from "./src/lib/PrerenderContext";
import { trackEvent } from "./src/lib/analytics";
import { useProducts } from "./src/lib/useProducts";
import { buildNav, categoryUrl, formatPrice, productUrl, sortProducts } from "./src/lib/catalog";
import SiteShell from "./src/components/SiteShell";
import ProductCard, { ProductCardSkeleton } from "./src/components/ProductCard";
import ProductImage from "./src/components/ProductImage";
import AboutUs from "./src/components/AboutUs";
import Faq from "./src/components/Faq";
import { iconForCategory, ROOM_ICONS } from "./src/components/catalogIcons";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Wrench,
  MapPin,
  Mic,
  CheckCircle,
} from "lucide-react";

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wider uppercase text-brand mb-2">{eyebrow}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function SeeAll({ to, children }) {
  return (
    <Link
      to={to}
      className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover"
    >
      {children} <ArrowRight size={15} />
    </Link>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
// En 3 segundos: qué vendemos, desde cuánto y cómo se compra. Los productos
// de la derecha son reales (destacados del catálogo), no una ilustración.

function Hero({ products, nav }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const showcase = sortProducts(products.filter((p) => p.images.length > 0)).slice(0, 4);
  const minPrice = products.length ? Math.min(...products.map((p) => Number(p.price))) : null;

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-14 lg:pt-32 lg:pb-20">
      <div
        aria-hidden="true"
        className="absolute -top-40 right-0 w-[640px] h-[640px] rounded-full bg-brand/[0.06] blur-3xl pointer-events-none"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium text-muted">
            <MapPin size={14} className="text-brand" />
            Surco · Miraflores · San Isidro · La Molina
          </p>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-tight text-ink">
            Domótica en Lima para <span className="text-brand">casas y departamentos</span>
          </h1>

          <p className="mt-5 text-lg text-muted leading-relaxed max-w-xl">
            Interruptores, sensores y accesorios inteligentes que controlas desde el celular o con tu voz,
            compatibles con Alexa y Google Home. Sin obras
            {minPrice !== null && (
              <>
                {" "}y desde <span className="text-ink font-semibold tabular">{formatPrice(minPrice)}</span>
              </>
            )}
            .
          </p>

          <form onSubmit={submit} role="search" className="mt-8 max-w-xl">
            <label className="relative block">
              <span className="sr-only">Buscar productos</span>
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué quieres automatizar? Ej: interruptor, sensor…"
                className="w-full h-14 pl-12 pr-32 rounded-2xl bg-surface border border-line focus:border-brand focus:outline-none text-base text-ink placeholder:text-subtle"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink text-sm font-semibold"
              >
                Buscar
              </button>
            </label>
          </form>

          {nav?.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {nav.categories.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  to={categoryUrl(c.name)}
                  className="h-9 px-3.5 inline-flex items-center rounded-full border border-line text-sm text-muted hover:text-ink hover:border-subtle"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/productos"
              className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink font-semibold transition-colors"
            >
              Ver catálogo{nav ? ` (${nav.total})` : ""}
              <ChevronRight size={17} />
            </Link>
            <a
              href="#contacto"
              className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-line hover:border-subtle hover:bg-surface text-ink font-semibold transition-colors"
            >
              Agenda una visita técnica gratuita
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {showcase.length > 0
            ? showcase.map((p, i) => (
                <Link
                  key={p.id}
                  to={productUrl(p)}
                  className={`group relative rounded-card overflow-hidden ${i % 2 === 1 ? "translate-y-6 sm:translate-y-10" : ""}`}
                >
                  <ProductImage
                    src={p.images[0]}
                    alt={p.title}
                    className="aspect-square"
                    imgClassName="group-hover:scale-105"
                    eager={i < 2}
                  />
                  <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 flex items-center justify-between gap-2 rounded-xl bg-white/90 backdrop-blur px-3 py-2">
                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">{p.title}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 tabular shrink-0">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </Link>
              ))
            : Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-card bg-surface animate-pulse ${i % 2 === 1 ? "translate-y-6 sm:translate-y-10" : ""}`}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

// ─── Barra de confianza ─────────────────────────────────────────────────────
// Solo afirmaciones que el sitio ya respalda. Pendiente de confirmar con el
// negocio antes de agregar: envíos a provincias y medios de pago.

function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: "Garantía de 2 años", text: "En productos e instalación" },
    { icon: MessageCircle, title: "Asesoría gratis", text: "Te ayudamos a elegir por WhatsApp" },
    { icon: Wrench, title: "Instalación profesional", text: "Técnicos propios en Lima" },
    { icon: Mic, title: "Control por voz", text: "Alexa y Google Home" },
  ];
  return (
    <section className="border-y border-line bg-surface/50">
      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-muted mt-0.5">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Comprar por ambiente (o por categoría mientras no haya ambientes) ─────

function ShopBy({ nav }) {
  if (!nav) return null;
  const byRoom = nav.rooms.length > 0;
  const tiles = byRoom
    ? nav.rooms.map((r) => ({ key: r.value, label: r.label, count: r.count, to: `/productos?ambiente=${r.value}`, Icon: ROOM_ICONS[r.value] }))
    : nav.categories.map((c) => ({ key: c.slug, label: c.name, count: c.count, to: categoryUrl(c.name), Icon: iconForCategory(c.name) }));
  if (tiles.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={byRoom ? "Compra por ambiente" : "Compra por categoría"}
          title={byRoom ? "¿Qué parte de tu casa quieres automatizar?" : "Encuentra lo que necesitas"}
        />
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map(({ key, label, count, to, Icon }) => (
            <li key={key}>
              <Link
                to={to}
                className="group flex flex-col justify-between h-32 sm:h-36 p-4 sm:p-5 rounded-card bg-surface border border-line hover:border-brand/50 transition-colors"
              >
                <span className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-brand-ink transition-colors">
                  {Icon && <Icon size={21} />}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink">{label}</span>
                  <span className="text-xs text-subtle tabular">
                    {count} {count === 1 ? "producto" : "productos"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Productos destacados ───────────────────────────────────────────────────

function Featured({ products, loading, error, total }) {
  const featured = sortProducts(products.filter((p) => p.category !== "Kits")).slice(0, 8);

  return (
    <section id="productos" className="py-16 lg:py-20 bg-surface/40 border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Catálogo"
          title="Productos destacados"
          action={<SeeAll to="/productos">Ver los {total || ""} productos</SeeAll>}
        />
        {error && products.length === 0 ? (
          <p className="text-center text-red-400 py-10">No se pudo cargar el catálogo. Intenta recargar la página.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {loading && products.length === 0
              ? Array.from({ length: 8 }, (_, i) => (
                  <li key={i}>
                    <ProductCardSkeleton />
                  </li>
                ))
              : featured.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ─── Kits (productos de la categoría "Kits") ────────────────────────────────

function Kits({ products }) {
  const kits = products.filter((p) => p.category === "Kits");
  if (kits.length === 0) return null;
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Listos para instalar"
          title="Kits con precio cerrado"
          action={<SeeAll to={categoryUrl("Kits")}>Ver kits</SeeAll>}
        />
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {kits.slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Funciona con ───────────────────────────────────────────────────────────

function WorksWith({ nav }) {
  if (!nav) return null;
  const items = [
    ...nav.ecosystems.map((e) => ({ key: e.value, label: e.label, to: `/productos?ecosistema=${e.value}` })),
    ...nav.apps.map((a) => ({ key: a.value, label: `App ${a.label}`, to: `/productos?app=${encodeURIComponent(a.value)}` })),
  ];
  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10">
        <p className="text-sm font-semibold text-ink shrink-0">Funciona con</p>
        <ul className="flex flex-wrap gap-2 sm:gap-3">
          {items.map((i) => (
            <li key={i.key}>
              <Link
                to={i.to}
                className="h-11 px-5 inline-flex items-center rounded-xl bg-surface border border-line text-sm font-medium text-muted hover:text-ink hover:border-subtle transition-colors"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Servicios ──────────────────────────────────────────────────────────────

function ServicesShowroom() {
  const seed = usePrerenderData();
  const [active, setActive] = useState("Todos");
  const [servicesData, setServicesData] = useState(seed?.services ?? []);
  const [loading, setLoading] = useState(!seed?.services);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("services")
      .select("id, category, title, description")
      .order("category")
      .order("id")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setServicesData(data);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ["Todos", ...new Set(servicesData.map((s) => s.category))];
  const filtered = active === "Todos" ? servicesData : servicesData.filter((s) => s.category === active);

  return (
    <section id="servicios" className="py-16 lg:py-20 bg-surface/40 border-y border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Más que productos" title="Instalación y servicios" />
        <p className="text-muted max-w-2xl -mt-4 mb-8">
          Instalación, configuración y automatización a medida — desde un solo dispositivo hasta tu casa completa.
        </p>

        {loading ? (
          <p className="text-muted">Cargando servicios…</p>
        ) : error ? (
          <p className="text-red-400">No se pudieron cargar los servicios. Intenta recargar la página.</p>
        ) : (
          <>
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={active === cat}
                  className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                    active === cat
                      ? "bg-brand/15 border-brand text-brand"
                      : "bg-surface border-line text-muted hover:text-ink hover:border-subtle"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((service) => (
                <li
                  key={service.id}
                  className="group relative flex flex-col rounded-card bg-surface border border-line hover:border-subtle/60 p-5 sm:p-6 transition-colors"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{service.category}</span>
                  <h3 className="text-base font-semibold text-ink leading-snug mt-2 mb-2">
                    <Link
                      to={`/servicios/${service.id}/${slugify(service.title)}`}
                      className="hover:text-brand transition-colors"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-5 flex-1 line-clamp-4">{service.description}</p>
                  <a
                    href={buildWhatsAppLink(`Hola, quiero cotizar el servicio: ${service.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-wa-hover hover:text-green-300"
                  >
                    <MessageCircle size={16} />
                    Cotizar por WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Contacto / visita técnica ──────────────────────────────────────────────

const DISTRICTS = ["Santiago de Surco", "Miraflores", "San Isidro", "La Molina", "Otro distrito de Lima"];

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    projectType: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // La solicitud se entrega por WhatsApp (el canal que ya atiende el
  // negocio) con los datos prellenados — así no depende de un servicio de
  // formularios externo y el lead llega calificado (distrito + inmueble).
  const handleSubmit = (e) => {
    e.preventDefault();
    const lines = [
      "Hola, quiero agendar una visita técnica gratuita.",
      `Nombre: ${form.name}`,
      `Teléfono: ${form.phone}`,
      `Distrito: ${form.district}`,
      `Tipo de inmueble: ${form.projectType}`,
      form.message && `Detalle: ${form.message}`,
    ].filter(Boolean);
    trackEvent("submit_visita", { district: form.district, project_type: form.projectType });
    window.open(buildWhatsAppLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  const labelCls = "block text-xs font-medium text-muted mb-2";
  const inputCls =
    "w-full h-12 bg-bg border border-line hover:border-subtle focus:border-brand focus:outline-none rounded-xl px-4 text-ink placeholder:text-subtle text-base sm:text-sm transition-colors";

  return (
    <section id="contacto" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand">Visita técnica gratuita</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight leading-tight">
            ¿Quieres automatizar tu casa completa?
          </h2>
          <p className="text-muted leading-relaxed">
            Cuéntanos sobre tu espacio y te enviamos una propuesta a medida. Te respondemos por WhatsApp en menos de 24
            horas.
          </p>
          <ul className="space-y-3 pt-2">
            {["Diagnóstico técnico gratuito", "Propuesta en 24h", "Sin compromiso de contratación"].map((text) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink">
                <CheckCircle size={17} className="text-wa-hover shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card bg-surface border border-line p-5 sm:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="c-name" className={labelCls}>Nombre</label>
              <input id="c-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" className={inputCls} required />
            </div>
            <div>
              <label htmlFor="c-phone" className={labelCls}>Teléfono / WhatsApp</label>
              <input id="c-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="999 999 999" autoComplete="tel" inputMode="tel" className={inputCls} required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="c-district" className={labelCls}>Distrito</label>
              <select id="c-district" name="district" value={form.district} onChange={handleChange} className={`${inputCls} cursor-pointer`} required>
                <option value="" disabled>Selecciona tu distrito…</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="c-type" className={labelCls}>Tipo de inmueble</label>
              <select id="c-type" name="projectType" value={form.projectType} onChange={handleChange} className={`${inputCls} cursor-pointer`} required>
                <option value="" disabled>Selecciona…</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Oficina / Comercio">Oficina / Comercio</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="c-msg" className={labelCls}>¿Qué quieres automatizar? (opcional)</label>
            <textarea
              id="c-msg"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: departamento de 3 dormitorios, quiero automatizar luces y cortinas…"
              className={`${inputCls} h-auto py-3 resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-wa hover:bg-wa-hover text-white font-semibold transition-colors"
          >
            <Send size={17} />
            Agendar visita técnica por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://falcem.com/#organization",
  name: "Falcons",
  url: "https://falcem.com/",
  logo: "https://falcem.com/logo-falcons.png",
  image: "https://falcem.com/logo-falcons.png",
  telephone: "+51926644490",
  priceRange: "S/. 27 - S/. 80",
  areaServed: AREA_SERVED,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jr. Artemisa Mz S Lote 28F",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
    addressCountry: "PE",
  },
  geo: { "@type": "GeoCoordinates", latitude: -12.169189, longitude: -76.995436 },
  description:
    "Automatización y domótica: interruptores WiFi, paneles táctiles, sensores y accesorios inteligentes compatibles con Alexa y Google Home.",
};

export default function FalconsLanding() {
  const title = "Domótica en Lima | Instalación de Casas Inteligentes – Falcons";
  const description =
    "Instalamos domótica en casas y departamentos de Surco, Miraflores, San Isidro y La Molina: iluminación, cortinas, seguridad y control por voz. Visita técnica gratuita.";

  const { products, loading, error } = useProducts();
  const seed = usePrerenderData();
  const nav = seed?.nav ?? (products.length ? buildNav(products) : null);

  return (
    <SiteShell>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://falcem.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://falcem.com/" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://falcem.com/logo-falcons.png" />
        <meta property="og:locale" content="es_PE" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://falcem.com/logo-falcons.png" />
        <script type="application/ld+json">{JSON.stringify(ORGANIZATION_JSON_LD)}</script>
      </Helmet>

      <Hero products={products} nav={nav} />
      <TrustBar />
      <ShopBy nav={nav} />
      <Featured products={products} loading={loading} error={error} total={nav?.total} />
      <Kits products={products} />
      <WorksWith nav={nav} />
      <ServicesShowroom />
      <AboutUs />
      <Faq />
      <ContactForm />
    </SiteShell>
  );
}
