import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Soluciones", href: "/#soluciones" },
    { label: "Productos", href: "/#productos" },
    { label: "Cotizar", href: "/#contacto" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-slate-950/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-1">
            <img src="/logo-falcons.png" alt="Falcons" className="h-11 w-auto logo-animated" />
            <span className="text-white text-lg font-semibold tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              ALCONS
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40">
              Cotizar Proyecto
              <ChevronRight size={14} />
            </button>
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-md border-t border-slate-800 px-4 pb-4 pt-2">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-slate-300 hover:text-white border-b border-slate-800/60 last:border-0 transition-colors"
            >
              {label}
            </a>
          ))}
          <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all duration-200">
            Cotizar Proyecto
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </nav>
  );
}
