import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { Search, SlidersHorizontal, X, ChevronRight, MessageCircle } from "lucide-react";
import SiteShell from "../components/SiteShell";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import { useProducts } from "../lib/useProducts";
import {
  APPS,
  ECOSYSTEMS,
  PRICE_RANGES,
  PROTOCOLS,
  ROOMS,
  SORTS,
  categoryFromSlug,
  categoryUrl,
  filterProducts,
  labelOf,
  matchesSearch,
} from "../lib/catalog";
import { buildWhatsAppLink } from "../lib/whatsapp";

const PAGE_SIZE = 24;
const SITE_URL = "https://falcem.com";

// Filtros ↔ URL: así un filtro se puede compartir o volver con "atrás".
const MULTI = {
  protocolo: { key: "protocols", options: PROTOCOLS, title: "Conexión" },
  ecosistema: { key: "ecosystems", options: ECOSYSTEMS, title: "Funciona con" },
  app: { key: "apps", options: APPS.map((a) => ({ value: a, label: a })), title: "App" },
  ambiente: { key: "rooms", options: ROOMS, title: "Ambiente" },
};

const FIELD_VALUES = {
  protocols: (p) => [p.protocol],
  ecosystems: (p) => p.ecosystems,
  apps: (p) => [p.app],
  rooms: (p) => p.rooms,
};

function readFilters(params) {
  const list = (k) => params.get(k)?.split(",").filter(Boolean) ?? [];
  return {
    q: params.get("q") ?? "",
    protocols: list("protocolo"),
    ecosystems: list("ecosistema"),
    apps: list("app"),
    rooms: list("ambiente"),
    noNeutral: params.get("neutro") === "sin",
    noHub: params.get("hub") === "sin",
    price: params.get("precio") ?? "",
    sort: params.get("orden") ?? "relevancia",
  };
}

function Chip({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm transition-colors ${
        active
          ? "bg-brand/15 border-brand text-brand"
          : "bg-surface border-line text-muted hover:text-ink hover:border-subtle"
      }`}
    >
      {children}
      {count !== undefined && <span className="text-xs opacity-70 tabular">{count}</span>}
    </button>
  );
}

function FilterGroup({ title, children }) {
  return (
    <fieldset className="py-5 border-b border-line last:border-0">
      <legend className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FiltersPanel({ base, filters, toggleMulti, setParam, category, categories }) {
  const facet = (key, value) => base.filter((p) => FIELD_VALUES[key](p).includes(value)).length;

  return (
    <div>
      <FilterGroup title="Categoría">
        <Link
          to="/productos"
          className={`inline-flex items-center h-9 px-3 rounded-full border text-sm ${
            !category ? "bg-brand/15 border-brand text-brand" : "bg-surface border-line text-muted hover:text-ink"
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.name}
            to={categoryUrl(c.name)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-sm ${
              category === c.name
                ? "bg-brand/15 border-brand text-brand"
                : "bg-surface border-line text-muted hover:text-ink hover:border-subtle"
            }`}
          >
            {c.name}
            <span className="text-xs opacity-70 tabular">{c.count}</span>
          </Link>
        ))}
      </FilterGroup>

      <FilterGroup title="Precio">
        {PRICE_RANGES.map((r) => (
          <Chip
            key={r.value}
            active={filters.price === r.value}
            onClick={() => setParam("precio", filters.price === r.value ? null : r.value)}
          >
            {r.label}
          </Chip>
        ))}
      </FilterGroup>

      {Object.entries(MULTI).map(([param, { key, options, title }]) => {
        const visible = options
          .map((o) => ({ ...o, count: facet(key, o.value) }))
          .filter((o) => o.count > 0 || filters[key].includes(o.value));
        if (visible.length === 0) return null;
        return (
          <FilterGroup key={param} title={title}>
            {visible.map((o) => (
              <Chip
                key={o.value}
                active={filters[key].includes(o.value)}
                onClick={() => toggleMulti(param, o.value)}
                count={o.count}
              >
                {o.label}
              </Chip>
            ))}
          </FilterGroup>
        );
      })}

      {(base.some((p) => p.needs_neutral === false) || base.some((p) => p.needs_hub) || filters.noNeutral || filters.noHub) && (
        <FilterGroup title="Instalación">
          <Chip active={filters.noNeutral} onClick={() => setParam("neutro", filters.noNeutral ? null : "sin")}>
            Funciona sin neutro
          </Chip>
          <Chip active={filters.noHub} onClick={() => setParam("hub", filters.noHub ? null : "sin")}>
            No necesita hub
          </Chip>
        </FilterGroup>
      )}
    </div>
  );
}

export default function CatalogPage() {
  const { categorySlug } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { products, loading, error } = useProducts();

  // En el primer render se ignoran los query params para que coincida con
  // el HTML prerenderizado (que no los conoce); se aplican tras hidratar.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const filters = useMemo(
    () => readFilters(hydrated ? params : new URLSearchParams()),
    [params, hydrated]
  );

  const [search, setSearch] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const searchRef = useRef();

  const category = categorySlug ? categoryFromSlug(categorySlug, products) : null;
  const unknownCategory = categorySlug && !category && !loading;

  const setParam = (key, value) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === "" || value === undefined) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  const toggleMulti = (param, value) => {
    const current = params.get(param)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(param, next.join(","));
  };

  // Sincroniza el input con la URL (p. ej. búsqueda desde el navbar)
  useEffect(() => setSearch(filters.q), [filters.q]);

  // Debounce: escribir no crea una entrada de historial por tecla
  useEffect(() => {
    if (search === filters.q) return;
    const t = setTimeout(() => setParam("q", search.trim()), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (location.state?.focusSearch) searchRef.current?.focus();
  }, [location.state]);

  useEffect(() => setVisible(PAGE_SIZE), [params, categorySlug]);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  // Base de facetas: categoría + búsqueda (los conteos no se anulan entre sí)
  const inCategory = category ? products.filter((p) => p.category === category) : products;
  const base = inCategory.filter((p) => matchesSearch(p, filters.q));
  const results = filterProducts(inCategory, filters);
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return [...map].map(([name, count]) => ({ name, count }));
  }, [products]);

  const activeChips = [
    ...Object.entries(MULTI).flatMap(([param, { key, options }]) =>
      filters[key].map((v) => ({ label: labelOf(options, v), onRemove: () => toggleMulti(param, v) }))
    ),
    filters.price && { label: labelOf(PRICE_RANGES, filters.price), onRemove: () => setParam("precio", null) },
    filters.noNeutral && { label: "Sin neutro", onRemove: () => setParam("neutro", null) },
    filters.noHub && { label: "Sin hub", onRemove: () => setParam("hub", null) },
  ].filter(Boolean);

  const clearAll = () => {
    setSearch("");
    setParams({}, { replace: true, preventScrollReset: true });
  };

  const heading = category ?? "Catálogo de domótica";
  const pageTitle = category
    ? `${category} inteligentes — Domótica Falcons Perú`
    : "Catálogo de productos de domótica — Falcons Perú";
  const pageDescription = category
    ? `${category} inteligentes compatibles con Alexa y Google Home. Precios en soles, asesoría por WhatsApp e instalación en Lima.`
    : "Interruptores, sensores, paneles táctiles y accesorios inteligentes compatibles con Alexa y Google Home. Precios en soles y asesoría por WhatsApp.";
  const canonical = `${SITE_URL}${category ? categoryUrl(category) : "/productos"}`;

  const panelProps = { base, filters, toggleMulti, setParam, category, categories };

  return (
    <SiteShell>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonical} />
        {unknownCategory && <meta name="robots" content="noindex" />}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonical} />
      </Helmet>

      <div className="pt-20 lg:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-3">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          {category ? (
            <>
              <Link to="/productos" className="hover:text-ink">Productos</Link>
              <ChevronRight size={12} />
              <span className="text-muted">{category}</span>
            </>
          ) : (
            <span className="text-muted">Productos</span>
          )}
        </nav>

        <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">{heading}</h1>

        {/* Toolbar — fija bajo el navbar en móvil */}
        <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-bg/95 backdrop-blur-lg lg:static lg:bg-transparent lg:backdrop-blur-0 mt-3 lg:mt-5">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar en el catálogo</span>
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={category ? `Buscar en ${category.toLowerCase()}…` : "Buscar por nombre, modelo o app…"}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-line focus:border-brand focus:outline-none text-sm text-ink placeholder:text-subtle"
              />
            </label>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="lg:hidden shrink-0 h-11 px-4 rounded-xl bg-surface border border-line text-sm font-medium text-ink flex items-center gap-2"
            >
              <SlidersHorizontal size={16} />
              Filtrar
              {activeChips.length > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-brand text-brand-ink text-[11px] font-bold flex items-center justify-center tabular">
                  {activeChips.length}
                </span>
              )}
            </button>
            <label className="hidden sm:block shrink-0">
              <span className="sr-only">Ordenar</span>
              <select
                value={filters.sort}
                onChange={(e) => setParam("orden", e.target.value === "relevancia" ? null : e.target.value)}
                className="h-11 pl-3 pr-8 rounded-xl bg-surface border border-line text-sm text-ink focus:border-brand focus:outline-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 mt-2">
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 -mt-5">
              <FiltersPanel {...panelProps} />
            </div>
          </aside>

          <section aria-live="polite">
            <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[2.25rem]">
              <p className="text-sm text-muted mr-2">
                {loading ? "Cargando…" : (
                  <>
                    <span className="text-ink font-semibold tabular">{results.length}</span>{" "}
                    {results.length === 1 ? "producto" : "productos"}
                  </>
                )}
              </p>
              {activeChips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.onRemove}
                  className="inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-surface-2 text-xs text-ink hover:bg-line"
                >
                  {c.label} <X size={13} />
                </button>
              ))}
              {(activeChips.length > 0 || filters.q) && (
                <button type="button" onClick={clearAll} className="text-xs text-brand hover:text-brand-hover ml-1">
                  Limpiar filtros
                </button>
              )}
            </div>

            {error && products.length === 0 ? (
              <p className="text-red-400 text-sm py-16 text-center">
                No se pudo cargar el catálogo. Intenta recargar la página.
              </p>
            ) : unknownCategory ? (
              <div className="py-16 text-center">
                <p className="text-ink font-medium">Esta categoría no existe.</p>
                <Link to="/productos" className="inline-block mt-3 text-sm text-brand hover:text-brand-hover">
                  Ver todo el catálogo
                </Link>
              </div>
            ) : loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <p className="text-ink font-medium">No encontramos productos con esos filtros.</p>
                <p className="text-sm text-muted mt-2">
                  Prueba quitando algún filtro o cuéntanos qué necesitas y te lo conseguimos.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-11 px-5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-surface"
                  >
                    Limpiar filtros
                  </button>
                  <a
                    href={buildWhatsAppLink(`Hola, busco: ${filters.q || heading}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-5 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Preguntar por WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {results.slice(0, visible).map((p) => (
                    <li key={p.id} className="flex">
                      <div className="w-full">
                        <ProductCard product={p} />
                      </div>
                    </li>
                  ))}
                </ul>
                {results.length > visible && (
                  <div className="text-center mt-10">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="h-12 px-8 rounded-xl border border-line text-sm font-semibold text-ink hover:bg-surface"
                    >
                      Ver más productos ({results.length - visible} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Filtros en móvil: panel inferior */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] flex flex-col rounded-t-2xl bg-surface border-t border-line animate-sheet-up">
            <div className="flex items-center justify-between px-5 h-14 border-b border-line shrink-0">
              <p className="font-semibold text-ink">Filtrar</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-11 h-11 -mr-2 flex items-center justify-center text-muted"
                aria-label="Cerrar filtros"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-5">
              <FilterGroup title="Ordenar por">
                {SORTS.map((s) => (
                  <Chip
                    key={s.value}
                    active={filters.sort === s.value}
                    onClick={() => setParam("orden", s.value === "relevancia" ? null : s.value)}
                  >
                    {s.label}
                  </Chip>
                ))}
              </FilterGroup>
              <FiltersPanel {...panelProps} />
            </div>
            <div className="flex gap-2 p-4 border-t border-line shrink-0 pb-safe">
              <button
                type="button"
                onClick={clearAll}
                className="h-12 px-5 rounded-xl border border-line text-sm font-medium text-ink"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="flex-1 h-12 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink text-sm font-semibold tabular"
              >
                Ver {results.length} {results.length === 1 ? "producto" : "productos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}

