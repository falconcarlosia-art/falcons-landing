import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import SiteShell from "../components/SiteShell";
import { pageTitle } from "../lib/seo";

export default function NotFound() {
  return (
    <SiteShell>
      <Helmet>
        <title>{pageTitle("Página no encontrada")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-semibold text-ink mb-3">Página no encontrada</h1>
        <p className="text-muted mb-8">
          La página que buscas no existe o fue movida. Revisa nuestro catálogo
          de productos o vuelve al inicio.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink font-semibold text-sm transition-colors"
        >
          Ver catálogo
          <ChevronRight size={16} />
        </Link>
      </div>
    </SiteShell>
  );
}
