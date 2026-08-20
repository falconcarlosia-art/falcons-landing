import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ChevronRight, Wrench } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import { buildWhatsAppLink } from "../lib/whatsapp";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePrerenderData } from "../lib/PrerenderContext";

export default function ServicePage() {
  const { id } = useParams();
  const seed = usePrerenderData();
  const [service, setService] = useState(seed?.service !== undefined ? seed.service : undefined);

  useEffect(() => {
    let cancelled = false;
    setService(undefined);

    supabase
      .from("services")
      .select("id, category, title, description")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setService(data ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (service === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Servicio no disponible</h1>
          <p className="text-slate-400 mb-8">
            Este servicio ya no está disponible o el enlace es incorrecto.
          </p>
          <Link
            to="/#servicios"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
          >
            Ver todos los servicios
            <ChevronRight size={16} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${service.title} — Falcons Domótica`;
  const pageDescription = service.description;
  const slug = slugify(service.title);
  const canonicalUrl = `https://falcem.com/servicios/${service.id}/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.category,
    provider: { "@type": "Organization", name: "Falcons", url: "https://falcem.com/" },
    areaServed: "PE",
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <div className="pt-24 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/#servicios"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ChevronRight size={14} className="rotate-180" />
          Volver a servicios
        </Link>

        <div className="w-14 h-14 rounded-xl border flex items-center justify-center mb-6 bg-amber-600/10 border-amber-500/20 text-amber-400">
          <Wrench size={26} />
        </div>

        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20 mb-4">
          {service.category}
        </span>

        <h1 className="text-3xl font-bold text-white mb-6">{service.title}</h1>

        <p className="text-slate-400 leading-relaxed mb-10">{service.description}</p>

        <a
          href={buildWhatsAppLink(`Hola, quiero cotizar el servicio: ${service.title}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
        >
          <MessageCircle size={14} />
          Cotizar por WhatsApp
        </a>
      </div>

      <Footer />
    </div>
  );
}
