import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ChevronRight, ChevronDown, Wrench } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import { buildWhatsAppLink } from "../lib/whatsapp";
import SiteShell from "../components/SiteShell";
import ProductCard from "../components/ProductCard";
import { AREA_SERVED, ORGANIZATION_ID, pageTitle } from "../lib/seo";
import { usePrerenderData } from "../lib/PrerenderContext";
import { useCanonicalSlug } from "../lib/useCanonicalSlug";
import { useProducts } from "../lib/useProducts";
import { productsForService } from "../lib/serviceLinks";
import { faqJsonLd, faqsForService, serviceDisplayName } from "../lib/serviceFaqs";

const SITE_URL = "https://falcem.com";
const MAX_PRODUCTS = 8;

const serviceUrl = (s) => `/servicios/${s.id}/${slugify(s.title)}`;

// Lista de servicios para "Otros servicios". Arranca con seed.services (si el
// prerender la trae) o null: así el HTML del servidor y el primer render del
// cliente coinciden, y la sección aparece recién cuando llegan los datos.
function useAllServices() {
  const seed = usePrerenderData();
  const [services, setServices] = useState(seed?.services ?? null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("services")
      .select("id, category, title")
      .order("id")
      .then(({ data }) => {
        if (!cancelled && data) setServices(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return services;
}

export default function ServicePage() {
  const { id, slug: urlSlug } = useParams();
  const seed = usePrerenderData();
  const [service, setService] = useState(seed?.service !== undefined ? seed.service : undefined);
  const { products } = useProducts();
  const allServices = useAllServices();

  useEffect(() => {
    let cancelled = false;
    // Conserva el servicio prerenderizado mientras se refresca (evita que el
    // HTML del prerender parpadee a "Cargando…"); al cambiar de id, se limpia.
    setService((s) => (s && String(s.id) === String(id) ? s : undefined));

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

  useCanonicalSlug(service, "/servicios", urlSlug);

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

  const name = serviceDisplayName(service);
  const title = pageTitle(/\blima\b/i.test(name) ? name : `${name} en Lima`);
  const pageDescription = service.description;
  const canonicalUrl = `${SITE_URL}${serviceUrl(service)}`;
  const faqs = faqsForService(service);
  const relatedProducts = productsForService(service, products).slice(0, MAX_PRODUCTS);
  const siblings = (allServices ?? []).filter(
    (s) => s.category === service.category && String(s.id) !== String(service.id)
  );

  // Migas: visibles y en JSON-LD con los mismos ítems. Los servicios no tienen
  // página de categoría, así que la categoría apunta a la sección de la home.
  const crumbs = [
    { name: "Inicio", to: "/", url: SITE_URL },
    { name: "Servicios", to: "/#servicios", url: `${SITE_URL}/#servicios` },
    { name: service.category, to: "/#servicios", url: `${SITE_URL}/#servicios` },
    { name, url: canonicalUrl },
  ];

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description: service.description,
    serviceType: service.category,
    url: canonicalUrl,
    provider: { "@id": ORGANIZATION_ID },
    areaServed: AREA_SERVED,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };

  const whatsappMessage = `Hola, quiero cotizar el servicio: ${service.title}`;

  return (
    <SiteShell whatsappMessage={whatsappMessage}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd(faqs))}</script>
      </Helmet>

      <div className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Migas de pan" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={i} className="inline-flex items-center gap-1.5 min-w-0">
                    {last ? (
                      <span aria-current="page" className="text-ink truncate">
                        {c.name}
                      </span>
                    ) : (
                      <>
                        <Link to={c.to} className="hover:text-ink transition-colors">
                          {c.name}
                        </Link>
                        <ChevronRight size={14} className="text-subtle flex-shrink-0" aria-hidden="true" />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="w-14 h-14 rounded-xl border flex items-center justify-center mb-6 bg-brand/10 border-brand/20 text-brand">
            <Wrench size={26} />
          </div>

          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border text-brand bg-brand/10 border-brand/20 mb-4">
            {service.category}
          </span>

          <h1 className="text-3xl font-semibold text-ink tracking-tight mb-6">{name}</h1>

          <p className="text-muted leading-relaxed mb-10">{service.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={buildWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle size={16} />
              Cotizar por WhatsApp
            </a>
            <Link
              to="/contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-line hover:border-subtle hover:bg-surface text-ink text-sm font-semibold transition-colors"
            >
              Agenda una visita técnica gratuita
            </Link>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="productos-servicio" className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="productos-servicio" className="text-xl sm:text-2xl font-semibold text-ink tracking-tight mb-6">
              Productos para este servicio
            </h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="faq-servicio" className="mt-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-servicio" className="text-xl sm:text-2xl font-semibold text-ink tracking-tight mb-6">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-surface border border-line rounded-card px-5 py-4 open:border-subtle/60"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-ink font-medium min-h-[28px] text-sm sm:text-base">
                  {q}
                  <ChevronDown
                    size={18}
                    className="flex-shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="text-muted text-sm leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {siblings.length > 0 && (
          <section aria-labelledby="otros-servicios" className="mt-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="otros-servicios" className="text-xl sm:text-2xl font-semibold text-ink tracking-tight mb-6">
              Otros servicios de {service.category}
            </h2>
            <ul className="divide-y divide-line border border-line rounded-card bg-surface">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link
                    to={serviceUrl(s)}
                    className="flex items-center justify-between gap-4 px-5 py-4 text-sm sm:text-base text-ink hover:text-brand transition-colors"
                  >
                    {serviceDisplayName(s)}
                    <ChevronRight size={16} className="flex-shrink-0 text-subtle" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
