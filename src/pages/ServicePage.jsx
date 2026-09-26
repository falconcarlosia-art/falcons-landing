import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ChevronRight, Wrench } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import { buildWhatsAppLink } from "../lib/whatsapp";
import SiteShell from "../components/SiteShell";
import { AREA_SERVED, ORGANIZATION_ID } from "../lib/seo";
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
      <SiteShell>
        <div className="min-h-screen flex items-center justify-center text-muted">Cargando…</div>
      </SiteShell>
    );
  }

  if (service === null) {
    return (
      <SiteShell>
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-ink mb-3">Servicio no disponible</h1>
          <p className="text-muted mb-8">
            Este servicio ya no está disponible o el enlace es incorrecto.
          </p>
          <Link
            to="/#servicios"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink font-semibold text-sm transition-colors"
          >
            Ver todos los servicios
            <ChevronRight size={16} />
          </Link>
        </div>
      </SiteShell>
    );
  }

  const pageTitle = /lima/i.test(service.title)
    ? `${service.title} | Falcons Domótica`
    : `${service.title} en Lima | Falcons Domótica`;
  const pageDescription = service.description;
  const slug = slugify(service.title);
  const canonicalUrl = `https://falcem.com/servicios/${service.id}/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.category,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: AREA_SERVED,
  };

  return (
    <SiteShell>
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

      <div className="pt-24 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/#servicios"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-8"
        >
          <ChevronRight size={14} className="rotate-180" />
          Volver a servicios
        </Link>

        <div className="w-14 h-14 rounded-xl border flex items-center justify-center mb-6 bg-brand/10 border-brand/20 text-brand">
          <Wrench size={26} />
        </div>

        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border text-brand bg-brand/10 border-brand/20 mb-4">
          {service.category}
        </span>

        <h1 className="text-3xl font-semibold text-ink tracking-tight mb-6">{service.title}</h1>

        <p className="text-muted leading-relaxed mb-10">{service.description}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={buildWhatsAppLink(`Hola, quiero cotizar el servicio: ${service.title}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle size={16} />
            Cotizar por WhatsApp
          </a>
          <a
            href="/#contacto"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-line hover:border-subtle hover:bg-surface text-ink text-sm font-semibold transition-colors"
          >
            Agenda una visita técnica gratuita
          </a>
        </div>
      </div>
    </SiteShell>
  );
}
