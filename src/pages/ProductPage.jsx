import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { MessageCircle, ChevronRight, Wifi } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { slugify } from "../lib/slugify";
import { buildWhatsAppLink } from "../lib/whatsapp";
import { usePrerenderData } from "../lib/PrerenderContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCarousel from "../components/ProductCarousel";

const APP_STYLES = {
  "Tuya Smart": "bg-orange-500/10 border-orange-500/20 text-orange-400",
  eWeLink: "bg-sky-500/10 border-sky-500/20 text-sky-400",
};

export default function ProductPage() {
  const { id } = useParams();
  const seed = usePrerenderData();
  const [product, setProduct] = useState(seed?.product !== undefined ? seed.product : undefined);

  useEffect(() => {
    let cancelled = false;
    setProduct(undefined);

    supabase
      .from("products")
      .select("id, title, model, category, app, icon, price, images, extra_info, specs, desc:description")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProduct(data ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Cargando...
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <div className="pt-32 pb-24 max-w-xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Producto no disponible</h1>
          <p className="text-slate-400 mb-8">
            Este producto ya no está disponible o el enlace es incorrecto.
          </p>
          <Link
            to="/#productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
          >
            Ver catálogo completo
            <ChevronRight size={16} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const pageTitle = `${product.title} — Falcons Domótica`;
  const pageDescription = product.desc;
  const slug = slugify(product.title);
  const canonicalUrl = `https://falcem.com/producto/${product.id}/${slug}`;
  const image = product.images?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.desc,
    image: product.images,
    brand: { "@type": "Brand", name: "Falcons" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {image && <meta property="og:image" content={image} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <div className="pt-24 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/#productos"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ChevronRight size={14} className="rotate-180" />
          Volver al catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden border border-slate-800">
            <ProductCarousel images={product.images} title={product.title} />
          </div>

          <div>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20 mb-4">
              {product.category}
            </span>

            <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
            <p className="text-sm text-slate-500 mb-4">Modelo: {product.model}</p>

            <p className="text-3xl font-bold text-white mb-6">S/. {product.price}</p>

            <p className="text-slate-400 leading-relaxed mb-6">{product.desc}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-600/10 border border-amber-500/20 text-amber-400">
                <Wifi size={10} />
                Wi-Fi
              </span>
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${APP_STYLES[product.app] ?? "bg-slate-700/10 border-slate-700/20 text-slate-400"}`}
              >
                {product.app}
              </span>
            </div>

            <a
              href={buildWhatsAppLink(`Hola, me interesa el producto: ${product.title}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
            >
              <MessageCircle size={14} />
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        {product.specs?.length > 0 && (
          <div className="mt-12 pt-10 border-t border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4">Ficha técnica</h2>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              {product.specs.map((row, i) => (
                <div
                  key={i}
                  className={`flex text-sm ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-950"}`}
                >
                  <div className="w-1/3 px-4 py-2.5 text-slate-500 border-r border-slate-800">{row.label}</div>
                  <div className="flex-1 px-4 py-2.5 text-slate-300">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.extra_info && (
          <div
            className="prose prose-invert prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-white max-w-none mt-12 pt-10 border-t border-slate-800"
            dangerouslySetInnerHTML={{ __html: product.extra_info }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
