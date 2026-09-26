import { Link } from "react-router";
import { MessageCircle, MapPin } from "lucide-react";
import { useCatalogNav } from "../lib/useProducts";
import { categoryUrl } from "../lib/catalog";
import { buildWhatsAppLink, WHATSAPP_DISPLAY } from "../lib/whatsapp";

export default function Footer({ className = "" }) {
  const nav = useCatalogNav();
  const colTitle = "text-xs font-semibold uppercase tracking-wider text-subtle mb-4";
  const link = "text-sm text-muted hover:text-ink transition-colors";

  return (
    <footer className={`bg-bg border-t border-line pt-14 pb-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-1">
              <img src="/logo-falcons.png" alt="Falcons" className="h-8 w-auto" />
              <span className="text-ink text-sm font-semibold tracking-widest uppercase font-logo">ALCONS</span>
            </Link>
            <p className="text-sm text-muted mt-4 leading-relaxed max-w-xs">
              Domótica para tu hogar: dispositivos inteligentes compatibles con Alexa y Google Home, con
              asesoría e instalación en Lima.
            </p>
          </div>

          <div>
            <p className={colTitle}>Productos</p>
            <ul className="space-y-2.5">
              {nav?.categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={categoryUrl(c.name)} className={link}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/productos" className={link}>
                  Todo el catálogo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={colTitle}>Falcons</p>
            <ul className="space-y-2.5">
              <li><a href="/#servicios" className={link}>Servicios</a></li>
              <li><a href="/#nosotros" className={link}>Nosotros</a></li>
              <li><a href="/#faq" className={link}>Preguntas frecuentes</a></li>
              <li><a href="/#contacto" className={link}>Contacto</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className={colTitle}>Contacto</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={buildWhatsAppLink("Hola Falcons, tengo una consulta")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted hover:text-ink"
                >
                  <MessageCircle size={16} className="text-wa-hover" />
                  <span className="tabular">{WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted">
                <MapPin size={16} className="text-brand/80 mt-0.5 shrink-0" />
                Santiago de Surco, Lima — Perú
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 pt-6 border-t border-line text-xs text-subtle">
          © {new Date().getFullYear()} Falcons Domótica. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
