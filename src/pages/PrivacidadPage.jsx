import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ChevronRight, MessageCircle } from "lucide-react";
import SiteShell from "../components/SiteShell";
import { BUSINESS } from "../lib/business";
import { ORGANIZATION_ID, pageTitle } from "../lib/seo";
import { buildWhatsAppLink } from "../lib/whatsapp";

// Política conforme a la Ley N.° 29733 y su Reglamento. Al cambiar cómo el
// sitio trata datos (p. ej. activar el Pixel de Meta, guardar formularios en
// Supabase), actualizar el texto y LAST_UPDATED.
const SITE_URL = BUSINESS.siteUrl;
const PATH = "/politica-de-privacidad";
const CANONICAL = `${SITE_URL}${PATH}`;
const NAME = "Política de privacidad";
const LAST_UPDATED = "2026-11-12";
const LAST_UPDATED_TEXT = "12 de noviembre de 2026";
const WA_MESSAGE = "Hola Falcons, quiero ejercer mis derechos sobre mis datos personales.";

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-semibold text-ink tracking-tight mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-muted leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  const { street, district, city, country } = BUSINESS.address;
  const fullAddress = `${street}, ${district}, ${city}, ${country}`;
  const title = pageTitle(NAME);
  const description = `Cómo ${BUSINESS.name} trata tus datos personales según la Ley N.° 29733: qué datos recibimos, para qué, con quién se comparten y cómo ejercer tus derechos ARCO.`;
  const ul = "list-disc pl-5 space-y-2";
  const strong = "text-ink font-medium";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: CANONICAL,
      description,
      inLanguage: "es-PE",
      dateModified: LAST_UPDATED,
      publisher: { "@id": ORGANIZATION_ID },
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

      <article className="pt-20 lg:pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-subtle mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-muted">{NAME}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-semibold text-ink tracking-tight mb-3">{NAME}</h1>
        <p className="text-sm text-subtle mb-6">
          Última actualización: <time dateTime={LAST_UPDATED}>{LAST_UPDATED_TEXT}</time>
        </p>
        <p className="text-muted leading-relaxed">
          En {BUSINESS.name} cuidamos tus datos personales. Esta política explica, sin letra pequeña, qué datos
          recibimos cuando usas {SITE_URL.replace("https://", "")}, para qué los usamos y cómo puedes ejercer tus
          derechos, de acuerdo con la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento
          (Decreto Supremo N.° 016-2024-JUS, que reemplazó al D.S. N.° 003-2013-JUS).
        </p>

        <Section id="responsable" title="1. Quién es responsable de tus datos">
          <ul className={ul}>
            <li>
              <span className={strong}>Responsable:</span> {BUSINESS.name}
              {BUSINESS.legalName && ` (${BUSINESS.legalName})`}
            </li>
            {BUSINESS.ruc && (
              <li>
                <span className={strong}>RUC:</span> {BUSINESS.ruc}
              </li>
            )}
            <li>
              <span className={strong}>Dirección:</span> {fullAddress}
            </li>
            <li>
              <span className={strong}>WhatsApp:</span> <span className="tabular">{BUSINESS.whatsappDisplay}</span>
            </li>
            {BUSINESS.email && (
              <li>
                <span className={strong}>Correo:</span>{" "}
                <a href={`mailto:${BUSINESS.email}`} className="text-brand hover:text-brand-hover">
                  {BUSINESS.email}
                </a>
              </li>
            )}
          </ul>
        </Section>

        <Section id="datos" title="2. Qué datos recibimos y cómo">
          <p>
            <span className={strong}>Formularios del sitio.</span> El formulario para agendar una visita técnica y la
            lista de pedido te piden datos como tu nombre, teléfono, distrito, tipo de inmueble, lo que quieres
            automatizar y los productos que eliges. Estos formularios <span className={strong}>no guardan nada en
            nuestros servidores</span>: solo arman un mensaje que se abre en WhatsApp para que tú lo revises y decidas
            enviarlo. Recibimos tus datos únicamente si envías ese mensaje, junto con tu número y tu nombre de perfil
            de WhatsApp.
          </p>
          <p>
            <span className={strong}>Lista de pedido.</span> Los productos que agregas a tu lista se guardan solo en el
            almacenamiento local de tu navegador, en tu propio dispositivo. Nosotros no tenemos acceso a esa
            información. Se borra si vacías la lista o eliminas los datos del sitio en tu navegador.
          </p>
          <p>
            <span className={strong}>Analítica.</span> Cuando Google Analytics está activo, usa cookies para medir de
            forma estadística cómo se usa el sitio: páginas visitadas, tipo de dispositivo y navegador, ubicación
            aproximada, clics en los botones de WhatsApp y el distrito y tipo de inmueble elegidos en el formulario
            de visita (nunca tu nombre ni tu teléfono).
          </p>
          <p>
            <span className={strong}>Mapa.</span> La página de contacto muestra un mapa de Google Maps. Al cargarlo,
            Google puede recibir tu dirección IP y usar sus propias cookies.
          </p>
          <p>
            <span className={strong}>Datos técnicos.</span> Como cualquier sitio web, el servicio de alojamiento
            (Firebase Hosting, de Google) procesa datos técnicos como tu dirección IP para entregarte las páginas y
            proteger el sitio.
          </p>
          <p>
            El panel de administración del sitio lo usa solo nuestro equipo para actualizar el catálogo y no recoge
            datos de los visitantes.
          </p>
        </Section>

        <Section id="finalidad" title="3. Para qué usamos tus datos">
          <ul className={ul}>
            <li>Responder tus consultas y enviarte cotizaciones.</li>
            <li>Coordinar la visita técnica, la venta, la entrega y la instalación.</li>
            <li>Atender la garantía y darte soporte después de la compra.</li>
            <li>Entender de forma estadística cómo se usa el sitio para mejorarlo.</li>
          </ul>
          <p>
            No vendemos ni alquilamos tus datos, y no los usamos para fines distintos a los indicados sin pedirte
            antes tu consentimiento.
          </p>
        </Section>

        <Section id="consentimiento" title="4. Tu consentimiento">
          <p>
            Al enviarnos un mensaje por WhatsApp desde el sitio aceptas que tratemos los datos que incluyes para las
            finalidades de esta política. Darlos es voluntario, pero sin ellos no podemos atender tu solicitud.
            Puedes retirar tu consentimiento cuando quieras, escribiéndonos por los canales del punto 7.
          </p>
        </Section>

        <Section id="destinatarios" title="5. Con quién se comparten">
          <p>Para funcionar, el sitio y nuestra atención usan estos servicios de terceros:</p>
          <ul className={ul}>
            <li>
              <span className={strong}>WhatsApp (Meta Platforms):</span> el canal por el que nos escribes y te
              respondemos.
            </li>
            <li>
              <span className={strong}>Google:</span> Google Analytics (estadísticas), Google Maps (mapa de la
              página de contacto) y Firebase Hosting (alojamiento del sitio).
            </li>
          </ul>
          <p>
            Estos proveedores pueden almacenar datos en servidores fuera del Perú, por ejemplo en los Estados Unidos.
            Esto es un flujo transfronterizo de datos personales, que se realiza con proveedores que aplican medidas
            de seguridad y protección de datos. Fuera de estos casos, solo entregaríamos tus datos a una autoridad
            cuando la ley lo exija.
          </p>
        </Section>

        <Section id="conservacion" title="6. Cuánto tiempo los conservamos">
          <p>
            Conservamos las conversaciones y los datos de tu pedido mientras sean necesarios para atenderte, durante
            el plazo de garantía de {BUSINESS.warranty.years} años y el tiempo que exijan las normas tributarias y
            contables. Luego los eliminamos. La lista de pedido de tu navegador queda en tu dispositivo hasta que tú
            la borres.
          </p>
        </Section>

        <Section id="derechos" title="7. Tus derechos y cómo ejercerlos">
          <p>
            Puedes pedirnos en cualquier momento <span className={strong}>información</span> sobre cómo tratamos tus
            datos, <span className={strong}>acceder</span> a ellos, <span className={strong}>rectificarlos</span> si
            son inexactos, <span className={strong}>cancelarlos</span> (eliminarlos) u{" "}
            <span className={strong}>oponerte</span> a que los usemos (derechos ARCO), y retirar tu consentimiento.
          </p>
          <p>
            Escríbenos por WhatsApp al <span className="tabular">{BUSINESS.whatsappDisplay}</span>
            {BUSINESS.email && (
              <>
                {" "}o al correo{" "}
                <a href={`mailto:${BUSINESS.email}`} className="text-brand hover:text-brand-hover">
                  {BUSINESS.email}
                </a>
              </>
            )}{" "}
            indicando tu nombre, qué derecho quieres ejercer y un dato que nos permita ubicar tu consulta o pedido.
            Te responderemos dentro de los plazos que establece el Reglamento. Ejercer estos derechos es gratuito.
          </p>
          <p>
            Si consideras que no atendimos tu solicitud, puedes presentar un reclamo ante la Autoridad Nacional de
            Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
          </p>
          <a
            href={buildWhatsAppLink(WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-wa hover:bg-wa-hover text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle size={16} />
            Ejercer mis derechos por WhatsApp
          </a>
        </Section>

        <Section id="cookies" title="8. Cookies">
          <p>
            Las cookies son pequeños archivos que el navegador guarda al visitar un sitio. Nosotros no usamos cookies
            propias. Cuando Google Analytics está activo, usa cookies de analítica (por ejemplo, “_ga”), y el mapa de
            Google Maps puede usar cookies de Google.
          </p>
          <p>
            Puedes bloquear o borrar las cookies desde la configuración de tu navegador, o instalar el complemento
            oficial de inhabilitación de Google Analytics. El sitio seguirá funcionando con normalidad.
          </p>
        </Section>

        <Section id="seguridad" title="9. Seguridad">
          <p>
            Aplicamos medidas razonables para proteger tus datos: el sitio funciona solo con conexión cifrada (HTTPS)
            y únicamente nuestro equipo accede a las conversaciones con clientes.
          </p>
        </Section>

        <Section id="menores" title="10. Menores de edad">
          <p>
            El sitio está dirigido a personas adultas. No buscamos recibir datos de menores de edad; si eres menor,
            pide a tu madre, padre o tutor que se comunique con nosotros. Si detectamos datos de un menor de 14 años
            enviados sin autorización de sus padres o tutores, los eliminaremos.
          </p>
        </Section>

        <Section id="cambios" title="11. Cambios a esta política">
          <p>
            Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página y la fecha de última
            actualización. Te recomendamos revisarla de vez en cuando.
          </p>
        </Section>

        <p className="mt-12 pt-6 border-t border-line text-sm text-muted">
          Consulta también nuestra{" "}
          <Link to="/garantia" className="text-brand hover:text-brand-hover underline underline-offset-2">
            garantía
          </Link>{" "}
          y nuestros{" "}
          <Link to="/contacto" className="text-brand hover:text-brand-hover underline underline-offset-2">
            datos de contacto
          </Link>
          .
        </p>
      </article>
    </SiteShell>
  );
}
