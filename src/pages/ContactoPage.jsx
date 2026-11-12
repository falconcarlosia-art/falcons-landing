import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import SiteShell from "../components/SiteShell";
import ContactForm from "../components/ContactForm";
import { BUSINESS } from "../lib/business";
import { ORGANIZATION_ID, pageTitle } from "../lib/seo";
import { buildWhatsAppLink } from "../lib/whatsapp";

const SITE_URL = BUSINESS.siteUrl;
const PATH = "/contacto";
const CANONICAL = `${SITE_URL}${PATH}`;
const NAME = "Contacto";
const WA_MESSAGE = "Hola Falcons, quiero agendar una visita técnica.";

export default function ContactoPage() {
  const { street, district, city, country } = BUSINESS.address;
  const fullAddress = `${street}, ${district}, ${city}, ${country}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;
  const title = pageTitle(NAME);
  const description = `Escríbenos por WhatsApp al ${BUSINESS.whatsappDisplay} o agenda una visita técnica gratuita. Atendemos en ${BUSINESS.featuredDistricts.join(", ")} y todo ${BUSINESS.serviceArea}.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: title,
      url: CANONICAL,
      description,
      inLanguage: "es-PE",
      about: { "@id": ORGANIZATION_ID },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: NAME, item: CANONICAL },
      ],
    },
  ];

  const itemCls = "flex items-start gap-3 text-sm text-muted";
  const iconCls = "text-brand/80 mt-0.5 shrink-0";

  return (
    <SiteShell whatsappMessage={WA_MESSAGE}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${SITE_URL}/logo-falcons.png`} />
        <meta property="og:locale" content="es_PE" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="pt-20 lg:pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-muted">{NAME}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-4">Contacto</h1>
        <p className="text-muted leading-relaxed max-w-2xl mb-10">
          La forma más rápida de hablar con nosotros es WhatsApp. También puedes llenar el formulario para agendar
          una visita técnica gratuita: te respondemos en menos de 24 horas.
        </p>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="space-y-8">
            <section aria-labelledby="canales">
              <h2 id="canales" className="text-lg font-semibold text-ink mb-4">Escríbenos</h2>
              <a
                href={buildWhatsAppLink(WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
              >
                <MessageCircle size={16} />
                WhatsApp <span className="tabular">{BUSINESS.whatsappDisplay}</span>
              </a>
              <ul className="mt-6 space-y-3">
                <li className={itemCls}>
                  <MapPin size={16} className={iconCls} />
                  <span>{fullAddress}</span>
                </li>
                {BUSINESS.email && (
                  <li className={itemCls}>
                    <Mail size={16} className={iconCls} />
                    <a href={`mailto:${BUSINESS.email}`} className="hover:text-ink">{BUSINESS.email}</a>
                  </li>
                )}
                {BUSINESS.hours && (
                  <li className={itemCls}>
                    <Clock size={16} className={iconCls} />
                    <span>{BUSINESS.hours}</span>
                  </li>
                )}
              </ul>
            </section>

            <section aria-labelledby="zonas">
              <h2 id="zonas" className="text-lg font-semibold text-ink mb-3">Zonas de atención</h2>
              <ul className="flex flex-wrap gap-2">
                {BUSINESS.featuredDistricts.map((d) => (
                  <li key={d} className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface border border-line text-ink">
                    {d}
                  </li>
                ))}
                <li className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface border border-line text-muted">
                  Resto de {BUSINESS.serviceArea}
                </li>
              </ul>
            </section>

            <section aria-labelledby="mapa">
              <h2 id="mapa" className="text-lg font-semibold text-ink mb-3">Cómo llegar</h2>
              <div className="rounded-card overflow-hidden border border-line bg-surface aspect-[4/3]">
                <iframe
                  src={mapSrc}
                  title={`Mapa de ubicación de ${BUSINESS.name} en ${district}, ${city}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>
            </section>
          </div>

          <section aria-labelledby="visita">
            <h2 id="visita" className="text-lg font-semibold text-ink mb-4">Agenda una visita técnica gratuita</h2>
            <ContactForm id="formulario" withIntro={false} />
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
