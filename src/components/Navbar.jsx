import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, ChevronDown, Search, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useOrder } from "../lib/order";
import { useCatalogNav } from "../lib/useProducts";
import { categoryUrl } from "../lib/catalog";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { iconForCategory, ROOM_ICONS } from "./catalogIcons";

const LINKS = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Preguntas", href: "/#faq" },
  { label: "Contacto", href: "/#contacto" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1 shrink-0" aria-label="Falcons — inicio">
      <img src="/logo-falcons.png" alt="" className="h-10 w-auto" width="40" height="40" />
      <span className="text-ink text-base font-semibold tracking-widest uppercase font-logo">ALCONS</span>
    </Link>
  );
}

function MegaMenu({ nav, onNavigate }) {
  const colTitle = "text-[11px] font-semibold uppercase tracking-wider text-subtle mb-3";
  const item =
    "flex items-center gap-2.5 py-1.5 text-sm text-muted hover:text-ink transition-colors";

  return (
    <div className="absolute inset-x-0 top-full bg-surface border-b border-line shadow-2xl shadow-black/40 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <p className={colTitle}>Por tipo</p>
          <ul className="grid grid-cols-2 gap-x-6">
            {nav?.categories.map((c) => {
              const Icon = iconForCategory(c.name);
              return (
                <li key={c.slug}>
                  <Link to={categoryUrl(c.name)} onClick={onNavigate} className={item}>
                    <Icon size={16} className="text-brand/80" />
                    {c.name}
                    <span className="text-xs text-subtle tabular">{c.count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/productos"
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand hover:text-brand-hover"
          >
            Ver todo el catálogo{nav ? ` (${nav.total})` : ""} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="col-span-2">
          {nav?.rooms.length > 0 && (
            <>
              <p className={colTitle}>Por ambiente</p>
              <ul>
                {nav.rooms.map((r) => {
                  const Icon = ROOM_ICONS[r.value];
                  return (
                    <li key={r.value}>
                      <Link to={`/productos?ambiente=${r.value}`} onClick={onNavigate} className={item}>
                        {Icon && <Icon size={16} className="text-brand/80" />}
                        {r.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="col-span-2">
          <p className={colTitle}>Funciona con</p>
          <ul>
            {nav?.ecosystems.map((e) => (
              <li key={e.value}>
                <Link to={`/productos?ecosistema=${e.value}`} onClick={onNavigate} className={item}>
                  {e.label}
                </Link>
              </li>
            ))}
            {nav?.apps.map((a) => (
              <li key={a.value}>
                <Link to={`/productos?app=${encodeURIComponent(a.value)}`} onClick={onNavigate} className={item}>
                  App {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3">
          <div className="h-full rounded-card bg-surface-2 border border-line p-5 flex flex-col">
            <p className="text-sm font-semibold text-ink">¿No sabes por dónde empezar?</p>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              Cuéntanos qué quieres automatizar y te recomendamos los equipos exactos.
            </p>
            <a
              href={buildWhatsAppLink("Hola, quiero asesoría para elegir productos de domótica")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-wa-hover hover:text-green-300"
            >
              <MessageCircle size={16} /> Asesoría por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false); // acordeón móvil
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hoverTimer = useRef();
  const { count, setOpen: openOrder } = useOrder();
  const nav = useCatalogNav();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e) => e.key === "Escape" && setMegaOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  const hoverOpen = (value) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMegaOpen(value), value ? 120 : 200);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
    setQuery("");
  };

  const close = () => setMegaOpen(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/85 backdrop-blur-lg border-b border-line/70">
      <div
        className="relative"
        onMouseLeave={() => hoverOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 lg:gap-8">
          <Logo />

          <nav className="hidden lg:flex items-center gap-7" aria-label="Principal">
            <button
              type="button"
              onClick={() => setMegaOpen((v) => !v)}
              onMouseEnter={() => hoverOpen(true)}
              aria-expanded={megaOpen}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                megaOpen ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              Productos
              <ChevronDown size={15} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onMouseEnter={() => hoverOpen(false)}
                className="text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
            <form onSubmit={submitSearch} className="hidden md:block w-full max-w-xs" role="search">
              <label className="relative block">
                <span className="sr-only">Buscar productos</span>
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar interruptores, sensores…"
                  className="w-full h-10 pl-9 pr-3 rounded-full bg-surface border border-line focus:border-brand focus:outline-none text-sm text-ink placeholder:text-subtle"
                />
              </label>
            </form>

            <Link
              to="/productos"
              state={{ focusSearch: true }}
              className="md:hidden w-11 h-11 rounded-full flex items-center justify-center text-muted hover:text-ink"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </Link>

            <button
              type="button"
              onClick={() => openOrder(true)}
              className="relative w-11 h-11 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface"
              aria-label={`Mi pedido (${count})`}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-brand-ink text-[10px] font-bold flex items-center justify-center animate-pop tabular"
                >
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center text-muted hover:text-ink"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {megaOpen && (
          <div className="hidden lg:block" onMouseEnter={() => hoverOpen(true)}>
            <MegaMenu nav={nav} onNavigate={close} />
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-bg overflow-y-auto animate-fade-in">
          <nav className="px-4 py-3" aria-label="Menú móvil">
            <button
              type="button"
              onClick={() => setProductsOpen((v) => !v)}
              aria-expanded={productsOpen}
              className="w-full flex items-center justify-between h-14 text-base font-medium text-ink border-b border-line"
            >
              Productos
              <ChevronDown size={18} className={`text-muted transition-transform ${productsOpen ? "rotate-180" : ""}`} />
            </button>
            {productsOpen && (
              <ul className="py-2 border-b border-line">
                <li>
                  <Link to="/productos" className="flex items-center h-12 pl-3 text-sm font-semibold text-brand">
                    Ver todo el catálogo{nav ? ` (${nav.total})` : ""}
                  </Link>
                </li>
                {nav?.categories.map((c) => {
                  const Icon = iconForCategory(c.name);
                  return (
                    <li key={c.slug}>
                      <Link to={categoryUrl(c.name)} className="flex items-center gap-3 h-12 pl-3 text-sm text-muted">
                        <Icon size={17} className="text-brand/80" />
                        {c.name}
                        <span className="ml-auto pr-2 text-xs text-subtle tabular">{c.count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center h-14 text-base font-medium text-ink border-b border-line"
              >
                {label}
              </a>
            ))}
            <a
              href={buildWhatsAppLink("Hola, quiero asesoría sobre domótica")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-wa hover:bg-wa-hover text-white font-semibold"
            >
              <MessageCircle size={18} />
              Escríbenos por WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
