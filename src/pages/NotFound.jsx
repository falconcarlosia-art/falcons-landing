import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">
      <Helmet>
        <title>Página no encontrada — Falcons</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-slate-400 mb-8">
          La página que buscas no existe o fue movida. Volvé al inicio para ver
          nuestro catálogo de productos y servicios.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
        >
          Volver al inicio
          <ChevronRight size={16} />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
