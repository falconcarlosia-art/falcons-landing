import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight, MessageCircle, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import SiteShell from "../components/SiteShell";
import { BUSINESS } from "../lib/business";
import { pageTitle } from "../lib/seo";
import { buildWhatsAppLink } from "../lib/whatsapp";

const SITE_URL = BUSINESS.siteUrl;
const PATH = "/garantia";
const CANONICAL = `${SITE_URL}${PATH}`;
const NAME = "Garantía";
const WA_MESSAGE = "Hola Falcons, quiero hacer un reclamo de garantía.";

export default function GarantiaPage() {
  const { years, covers, excludes, howToClaim } = BUSINESS.warranty;
  const yearsText = `${years} ${years === 1 ? "año" : "años"}`;
  const title = pageTitle(NAME);
  const description = `Garantía de ${yearsText} en productos e instalaciones de ${BUSINESS.name}: qué cubre y cómo hacer un reclamo por WhatsApp.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: CANONICAL,
      description,
      inLanguage: "es-PE",
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

      <div className="pt-20 lg:pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-muted">{NAME}</span>
        </nav>

        <div className="w-14 h-14 rounded-xl border flex items-center justify-center mb-6 bg-brand/10 border-brand/20 text-brand">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-4">
          Garantía de {yearsText}
        </h1>
        <p className="text-muted leading-relaxed mb-10">
          Los productos que vendemos y las instalaciones que hace nuestro equipo tienen {yearsText} de garantía.
        </p>

        <section aria-labelledby="cubre" className="mb-10">
          <h2 id="cubre" className="text-xl font-semibold text-ink mb-4">Qué cubre</h2>
          <ul className="space-y-3">
            {covers.map((text) => (
              <li key={text} className="flex items-start gap-3 text-muted">
                <CheckCircle size={18} className="text-wa-hover mt-0.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        {excludes?.length > 0 && (
          <section aria-labelledby="no-cubre" className="mb-10">
            <h2 id="no-cubre" className="text-xl font-semibold text-ink mb-4">Qué no cubre</h2>
            <ul className="space-y-3">
              {excludes.map((text) => (
                <li key={text} className="flex items-start gap-3 text-muted">
                  <XCircle size={18} className="text-subtle mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="reclamar" className="rounded-card bg-surface border border-line p-6 sm:p-8 mb-10">
          <h2 id="reclamar" className="text-xl font-semibold text-ink mb-3">Cómo hacer un reclamo</h2>
          <p className="text-muted leading-relaxed mb-6">{howToClaim}</p>
          <a
            href={buildWhatsAppLink(WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle size={16} />
            Reclamar garantía por WhatsApp
          </a>
        </section>

        <p className="text-sm text-muted leading-relaxed">
          ¿Tienes otra duda? Revisa las{" "}
          <a href="/#faq" className="text-brand hover:text-brand-hover underline underline-offset-2">
            preguntas frecuentes
          </a>{" "}
          o lee cómo tratamos tus datos en nuestra{" "}
          <Link to="/politica-de-privacidad" className="text-brand hover:text-brand-hover underline underline-offset-2">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}
