import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight, MessageCircle, Search, FileText, Wrench, Settings, LifeBuoy, MapPin } from "lucide-react";
import SiteShell from "../components/SiteShell";
import { BUSINESS } from "../lib/business";
import { ORGANIZATION_ID, pageTitle } from "../lib/seo";
import { buildWhatsAppLink } from "../lib/whatsapp";

const SITE_URL = BUSINESS.siteUrl;
const PATH = "/nosotros";
const CANONICAL = `${SITE_URL}${PATH}`;
const NAME = "Nosotros";
const WA_MESSAGE = "Hola Falcons, quiero saber más sobre su trabajo en domótica.";

const STEPS = [
  {
    icon: Search,
    title: "Diagnóstico gratuito",
    text: "Visitamos tu casa, departamento u oficina, revisamos la instalación eléctrica y escuchamos qué quieres automatizar.",
  },
  {
    icon: FileText,
    title: "Propuesta en menos de 24 h",
    text: "Te enviamos por WhatsApp una propuesta con los equipos exactos y el trabajo de instalación.",
  },
  {
    icon: Wrench,
    title: "Instalación",
    text: "Nuestros técnicos instalan interruptores, sensores, cortinas y demás equipos que elegiste.",
  },
  {
    icon: Settings,
    title: "Configuración",
    text: "Dejamos todo funcionando en la app y con Alexa o Google Home, y te enseñamos a usarlo.",
  },
  {
    icon: LifeBuoy,
    title: "Soporte",
    text: "Después de la instalación seguimos disponibles por WhatsApp para ajustes, dudas y garantía.",
  },
];

export default function NosotrosPage() {
  const years = BUSINESS.foundedYear ? new Date().getFullYear() - BUSINESS.foundedYear : null;
  const { street, district, city } = BUSINESS.address;
  const description = `Conoce a ${BUSINESS.name}: técnicos propios en Lima que diseñan, instalan y configuran domótica para casas, departamentos y oficinas. Diagnóstico gratuito y soporte por WhatsApp.`;
  const title = pageTitle(NAME);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
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

      <div className="pt-20 lg:pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-muted">{NAME}</span>
        </nav>

        <p className="text-xs font-semibold tracking-wider uppercase text-brand mb-2">Quiénes somos</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-6">
          Sobre {BUSINESS.name}
        </h1>

        <div className="space-y-5 text-muted leading-relaxed">
          <p>
            Somos {BUSINESS.name}, una empresa peruana especializada en domótica y automatización de casas,
            departamentos, oficinas y comercios. Diseñamos e instalamos soluciones de iluminación, cortinas, seguridad
            y climatización inteligente con dispositivos WiFi compatibles con Alexa y Google Home.
            {years > 0 && ` Llevamos ${years} ${years === 1 ? "año" : "años"} haciendo este trabajo.`}
          </p>
          <p>
            Trabajamos con técnicos propios en Lima, que acompañan cada proyecto de principio a fin: desde el
            diagnóstico gratuito hasta la instalación, la configuración y el soporte posterior. Operamos desde{" "}
            {district}, {city}, y en nuestra tienda encuentras los mismos equipos que instalamos.
          </p>
        </div>

        <section className="mt-14" aria-labelledby="como-trabajamos">
          <h2 id="como-trabajamos" className="text-2xl font-semibold text-ink tracking-tight mb-6">
            Cómo trabajamos
          </h2>
          <ol className="grid sm:grid-cols-2 gap-4">
            {STEPS.map(({ icon: Icon, title: stepTitle, text }, i) => (
              <li key={stepTitle} className="rounded-card bg-surface border border-line p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-sm font-semibold text-ink">
                    {i + 1}. {stepTitle}
                  </h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14" aria-labelledby="zonas">
          <h2 id="zonas" className="text-2xl font-semibold text-ink tracking-tight mb-4">
            Zonas donde trabajamos
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Atendemos con frecuencia en {BUSINESS.featuredDistricts.join(", ")} y en el resto de{" "}
            {BUSINESS.serviceArea}.
          </p>
          <p className="flex items-start gap-2 text-sm text-muted">
            <MapPin size={16} className="text-brand/80 mt-0.5 shrink-0" />
            {street}, {district}, {city}
          </p>
        </section>

        <section className="mt-14 rounded-card bg-surface border border-line p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink tracking-tight mb-2">¿Hablamos de tu proyecto?</h2>
          <p className="text-muted leading-relaxed mb-6">
            Cuéntanos qué quieres automatizar y agenda tu diagnóstico gratuito.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={buildWhatsAppLink(WA_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle size={16} />
              Escríbenos por WhatsApp
            </a>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-line hover:border-subtle hover:bg-surface-2 text-ink text-sm font-semibold transition-colors"
            >
              Ver datos de contacto
            </Link>
            <Link
              to="/garantia"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-line hover:border-subtle hover:bg-surface-2 text-ink text-sm font-semibold transition-colors"
            >
              Nuestra garantía
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
